import { useState } from "react";
import { Link, useNavigate, useLocation, Navigate } from "react-router-dom";
import { loginUser } from "../services/api";
import { setSession, getUserId } from "../utils/user";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname || "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (getUserId()) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const result = await loginUser(email, password);
      if (!result.success) {
        setError(result.message || "Invalid email or password.");
        setSubmitting(false);
        return;
      }
      setSession(result.user_id, result.name);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex bg-bg-950 text-slate-100">
      {/* Left hero section */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-gradient-to-br from-[#0a0e2a] via-[#1a1240] to-[#2a0e4a]">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_20%_20%,#3b82f6,transparent_40%),radial-gradient(circle_at_80%_70%,#8b5cf6,transparent_45%)]" />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-accent-400 to-purple-500 flex items-center justify-center font-bold text-bg-950">
              M
            </div>
            <span className="text-lg font-semibold tracking-tight">MarketLens AI</span>
          </div>

          <div>
            <h1 className="text-4xl font-extrabold leading-tight mb-4">
              See the market
              <br />
              through an{" "}
              <span className="bg-gradient-to-r from-accent-400 to-purple-400 bg-clip-text text-transparent">
                AI lens.
              </span>
            </h1>
            <p className="text-slate-400 text-base max-w-md">
              Real-time stock insights, AI-driven sentiment analysis, and research
              summaries — all in one workspace built for serious investors.
            </p>

            <div className="mt-10 grid grid-cols-3 gap-4 max-w-md">
              {[
                { label: "Tickers tracked", value: "10K+" },
                { label: "AI summaries / day", value: "2.4K" },
                { label: "Avg. latency", value: "180ms" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-border-800 bg-panel-900/60 p-3 backdrop-blur-sm"
                >
                  <p className="stat-mono text-lg font-bold text-accent-400">
                    {stat.value}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} MarketLens AI. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right login form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center px-6 py-12 bg-bg-950">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 justify-center mb-8">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-accent-400 to-purple-500 flex items-center justify-center font-bold text-bg-950">
              M
            </div>
            <span className="text-lg font-semibold tracking-tight">MarketLens AI</span>
          </div>

          <div className="rounded-2xl border border-border-800 bg-panel-900 shadow-2xl shadow-black/40 p-8">
            <h2 className="text-2xl font-bold text-slate-100">Welcome back</h2>
            <p className="text-sm text-slate-500 mt-1.5 mb-8">
              AI-Powered Stock Research Assistant
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-medium text-slate-400 mb-1.5"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-lg border border-border-700 bg-panel-800 px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/30 transition"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="password"
                    className="block text-xs font-medium text-slate-400"
                  >
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-medium text-accent-400 hover:text-accent-300 transition"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-border-700 bg-panel-800 px-3.5 py-2.5 pr-11 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/30 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute inset-y-0 right-0 px-3 text-xs text-slate-500 hover:text-slate-300 transition"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {error && <p className="text-sm text-bear-400">{error}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-lg bg-gradient-to-r from-accent-500 to-purple-500 py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent-500/20 hover:opacity-90 active:opacity-80 transition disabled:opacity-60"
              >
                {submitting ? "Logging in..." : "Log in"}
              </button>
            </form>

            <p className="text-center text-sm text-slate-500 mt-6">
              Don&apos;t have an account?{" "}
              <Link
                to="/signup"
                className="font-medium text-accent-400 hover:text-accent-300 transition"
              >
                Create account
              </Link>
            </p>
          </div>

          <p className="text-center text-xs text-slate-600 mt-6">
            By continuing, you agree to MarketLens AI&apos;s Terms & Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
