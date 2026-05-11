import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../providers/auth-provider";
import { LoadingSpinner } from "../components/shared/loading-spinner";

export default function CallbackPage() {
  const [searchParams] = useSearchParams();
  const { handleCallback, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const code = searchParams.get("code");

  useEffect(() => {
    if (isAuthenticated) { navigate("/", { replace: true }); return; }
    if (code) {
      handleCallback(code).then(() => navigate("/", { replace: true })).catch(() => navigate("/login", { replace: true }));
    } else {
      navigate("/login", { replace: true });
    }
  }, [code, handleCallback, isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-sm text-slate-600">Completing authentication...</p>
      </div>
    </div>
  );
}
