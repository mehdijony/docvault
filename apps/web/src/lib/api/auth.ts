// apps/web/src/lib/api/auth.ts
import axios from "axios";

// ─── Constants ────────────────────────────────────────────────────────────
// ✅ Vite uses import.meta.env, NOT process.env
export const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? "http://localhost:4000/api/v1";

export const KEYCLOAK_URL =
  import.meta.env.VITE_KEYCLOAK_URL ?? "http://localhost:8080";

export const KEYCLOAK_REALM = import.meta.env.VITE_KEYCLOAK_REALM ?? "docvault";

export const KEYCLOAK_CLIENT_ID =
  import.meta.env.VITE_KEYCLOAK_CLIENT_ID ?? "docvault-web";

// ─── Types ────────────────────────────────────────────────────────────────
export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  refresh_expires_in: number;
  token_type: string;
  scope: string;
}

export interface CurrentUserData {
  id: string;
  keycloakId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  organizationId: string;
}

interface LoginUrlData {
  url: string;
}

interface LogoutData {
  message: string;
}

interface ApiWrapped<T> {
  success: boolean;
  data: T;
  timestamp: string;
  path: string;
}

// ─── Build SSO URL client-side ────────────────────────────────────────────
export function buildSSOLoginUrl(redirectUri: string): string {
  const params = new URLSearchParams({
    client_id: KEYCLOAK_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
  });

  return (
    `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}` +
    `/protocol/openid-connect/auth?${params.toString()}`
  );
}

// ─── Direct login via NestJS backend ─────────────────────────────────────
export async function directLogin(
  email: string,
  password: string,
): Promise<AuthTokens> {
  const { data } = await axios.post<ApiWrapped<AuthTokens>>(
    `${API_BASE_URL}/auth/direct-login`,
    { email, password },
  );
  return data.data;
}

// ─── Get login URL from backend ───────────────────────────────────────────
export async function getLoginUrl(redirectUri: string): Promise<string> {
  const { data } = await axios.get<ApiWrapped<LoginUrlData>>(
    `${API_BASE_URL}/auth/login`,
    { params: { redirectUri } },
  );
  return data.data.url;
}

// ─── Exchange code for tokens ─────────────────────────────────────────────
export async function exchangeCodeForTokens(
  code: string,
  redirectUri: string,
): Promise<AuthTokens> {
  const { data } = await axios.post<ApiWrapped<AuthTokens>>(
    `${API_BASE_URL}/auth/callback`,
    { code, redirectUri },
  );
  return data.data;
}

// ─── Refresh access token ─────────────────────────────────────────────────
export async function refreshAccessToken(
  refreshToken: string,
): Promise<AuthTokens> {
  const { data } = await axios.post<ApiWrapped<AuthTokens>>(
    `${API_BASE_URL}/auth/refresh`,
    { refreshToken },
  );
  return data.data;
}

// ─── Get current user ─────────────────────────────────────────────────────
export async function getCurrentUser(
  accessToken: string,
): Promise<CurrentUserData> {
  const { data } = await axios.get<ApiWrapped<CurrentUserData>>(
    `${API_BASE_URL}/auth/me`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
  return data.data;
}

// ─── Logout ───────────────────────────────────────────────────────────────
export async function logout(refreshToken: string): Promise<string> {
  const { data } = await axios.post<ApiWrapped<LogoutData>>(
    `${API_BASE_URL}/auth/logout`,
    { refreshToken },
  );
  return data.data.message;
}
