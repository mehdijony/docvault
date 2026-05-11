import { useState, type FormEvent, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Loader2 } from "lucide-react";
import { useAuth } from "../providers/auth-provider";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login, loginWithSSO, loginDemo, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate("/", { replace: true });
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      await login(email, password);
      navigate("/");
    } catch {
      setError("Invalid email or password. Make sure Keycloak is running.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 px-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-600/25">
            <Shield className="h-7 w-7 text-white" />
          </div>
          <span className="ml-3 text-3xl font-bold text-slate-900 tracking-tight">DocVault</span>
        </div>
        <div className="rounded-2xl bg-white p-8 shadow-xl shadow-slate-200/50 border border-slate-200">
          <h1 className="text-xl font-semibold text-center text-slate-900 mb-1">Welcome back</h1>
          <p className="text-sm text-center text-slate-500 mb-6">Sign in to your organization's document vault</p>
          <button onClick={loginWithSSO} className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors shadow-sm">
            <Shield className="h-4 w-4" /> Sign in with SSO
          </button>
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
            <div className="relative flex justify-center text-xs"><span className="bg-white px-3 text-slate-400 uppercase tracking-wider">or continue with email</span></div>
          </div>
          {error && <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@docvault.dev" required className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
            </div>
            <button type="submit" disabled={isLoading} className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50">
              {isLoading ? <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Signing in...</span> : "Sign in"}
            </button>
          </form>
          <div className="mt-6 pt-6 border-t border-slate-200">
            <button onClick={() => { loginDemo(); navigate("/"); }} className="w-full rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:border-slate-400 transition-colors">
              🚀 Enter Demo Mode
            </button>
            <p className="text-xs text-center text-slate-400 mt-2">Browse with mock data — no backend required</p>
          </div>
        </div>
        <p className="text-xs text-center text-slate-400 mt-6">DocVault v1.0.0 · Secure Document Management</p>
      </div>
    </div>
  );
}
