// apps/web/src/auth-provider.tsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { CurrentUser } from "../types";
import {
  directLogin,
  exchangeCodeForTokens,
  getCurrentUser,
  logout as authLogout,
  buildSSOLoginUrl,
  refreshAccessToken,       // ✅ added for auto-refresh on mount
} from "../lib/api/auth";
import { isDemoMode } from "../lib/utils";
import { MOCK_CURRENT_USER } from "../lib/mock-data";

// ─── Context shape ────────────────────────────────────────────────────────
interface AuthState {
  user: CurrentUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithSSO: () => void;
  loginDemo: () => void;
  logout: () => Promise<void>;
  handleCallback: (code: string) => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

// ─── Token helpers ────────────────────────────────────────────────────────
function saveTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem("access_token", accessToken);
  localStorage.setItem("refresh_token", refreshToken);
}

function clearTokens() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("demo_mode");
}

// ─── Provider ─────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ── Fetch user from GET /auth/me ────────────────────────────────────────
  const fetchUser = useCallback(async () => {
    try {
      const accessToken = localStorage.getItem("access_token");
      if (!accessToken) throw new Error("No token");

      const userData = await getCurrentUser(accessToken);
      setUser({
        id:             userData.id,
        keycloakId:     userData.keycloakId,
        email:          userData.email,
        firstName:      userData.firstName,
        lastName:       userData.lastName,
        role:           userData.role as CurrentUser["role"],
        organizationId: userData.organizationId,
      });
    } catch {
      clearTokens();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Restore session on mount ────────────────────────────────────────────
  useEffect(() => {
    // Demo mode — skip all API calls
    if (isDemoMode()) {
      setUser(MOCK_CURRENT_USER);
      setIsLoading(false);
      return;
    }

    async function restoreSession() {
      const accessToken  = localStorage.getItem("access_token");
      const refreshToken = localStorage.getItem("refresh_token");

      if (!accessToken && !refreshToken) {
        setIsLoading(false);
        return;
      }

      // ✅ Try refresh first — access token may be expired
      if (refreshToken) {
        try {
          const fresh = await refreshAccessToken(refreshToken);
          saveTokens(fresh.access_token, fresh.refresh_token);
          await fetchUser();
          return;
        } catch {
          // Refresh failed — clear and show login
          clearTokens();
          setIsLoading(false);
          return;
        }
      }

      // Access token exists, no refresh token
      await fetchUser();
    }

    restoreSession();
  }, [fetchUser]);

  // ── Email + password login → via NestJS backend ─────────────────────────
  const login = async (email: string, password: string) => {
    const tokens = await directLogin(email, password);
    saveTokens(tokens.access_token, tokens.refresh_token);
    await fetchUser();
  };

  // ── SSO → redirect to Keycloak ──────────────────────────────────────────
  const loginWithSSO = () => {
    const redirectUri = `${window.location.origin}/callback`;
    window.location.href = buildSSOLoginUrl(redirectUri);
  };

  // ── Demo mode ───────────────────────────────────────────────────────────
  const loginDemo = () => {
    localStorage.setItem("demo_mode", "true");
    localStorage.setItem("access_token", "demo-token");
    setUser(MOCK_CURRENT_USER);
  };

  // ── OAuth2 callback → exchange code for tokens ──────────────────────────
  const handleCallback = async (code: string) => {
    const redirectUri = `${window.location.origin}/callback`;
    const tokens = await exchangeCodeForTokens(code, redirectUri);
    saveTokens(tokens.access_token, tokens.refresh_token);
    await fetchUser();
  };

  // ── Logout ──────────────────────────────────────────────────────────────
  const doLogout = async () => {
    const refreshToken = localStorage.getItem("refresh_token");
    try {
      if (refreshToken && !isDemoMode()) {
        await authLogout(refreshToken);
      }
    } catch {
      // Clear local state even if API call fails
    } finally {
      clearTokens();
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        loginWithSSO,
        loginDemo,
        logout:         doLogout,
        handleCallback,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}