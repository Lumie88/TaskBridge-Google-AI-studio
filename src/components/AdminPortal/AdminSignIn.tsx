import React, { useState } from "react";
import { Lock, AlertCircle, Sparkles, Loader2, ArrowRight } from "lucide-react";

interface AdminSignInProps {
  onSignInSuccess: (user: any, token: string) => void;
}

export default function AdminSignIn({ onSignInSuccess }: AdminSignInProps) {
  const [email, setEmail] = useState("sarah.super@taskbridge.com");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mfaStep, setMfaStep] = useState(false);
  const [mfaCode, setMfaCode] = useState("");
  const [validatedUser, setValidatedUser] = useState<any>(null);
  const [validatedToken, setValidatedToken] = useState("");

  const handleInitialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/admin/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      setValidatedUser(data.user);
      setValidatedToken(data.token);
      setLoading(false);
      
      // Advance to MFA verification simulation step
      if (data.user.mfaEnabled) {
        setMfaStep(true);
      } else {
        onSignInSuccess(data.user, data.token);
      }
    } catch (e: any) {
      setError(e.message);
      setLoading(false);
    }
  };

  const handleMfaVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      if (mfaCode === "5542" || mfaCode === "12345" || mfaCode.length === 5) {
        onSignInSuccess(validatedUser, validatedToken);
      } else {
        setError("Invalid security authentication pin. Please try again.");
        setLoading(false);
      }
    }, 600);
  };

  return (
    <div className="max-w-md mx-auto my-16 px-4 font-sans text-left">
      <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 h-32 w-32 bg-rose-500/5 blur-3xl pointer-events-none" />

        <div className="flex justify-center mb-6">
          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-rose-500 border border-slate-800 shadow-sm">
            <Lock className="h-6 w-6" />
            <div className="absolute right-0.5 bottom-0.5 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
          </div>
        </div>

        <div className="text-center space-y-2 mb-6">
          <span className="font-mono text-[9px] font-bold text-rose-500 uppercase tracking-widest bg-rose-50 border border-rose-100 px-3 py-1 rounded-full">
            INTEGRATED SSO OPEREATIONS LOCK
          </span>
          <h2 className="font-display text-2xl font-extrabold text-slate-900 tracking-tight">
            TaskBridge Backoffice
          </h2>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Authorized admin and super admin routing gate. Registered coordinators must use their respective partner endpoint.
          </p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-150 text-rose-700 p-3.5 rounded-xl text-xs flex gap-2 mb-4">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-500 mt-0.5" />
            <div>
              <strong>Sign In Failed:</strong>
              <p className="mt-0.5 text-rose-600">{error}</p>
            </div>
          </div>
        )}

        {!mfaStep ? (
          <form onSubmit={handleInitialSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                TaskBridge Workspace Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sarah.super@taskbridge.com"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-rose-500 focus:border-rose-500 transition-shadow"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Security Passkey / Password
                </label>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-rose-500 focus:border-rose-500 transition-shadow"
              />
            </div>

            {/* Fast login helpers */}
            <div className="bg-slate-50 border border-slate-150 rounded-xl p-3 text-[11px] text-slate-600 space-y-1.5">
              <span className="font-bold text-slate-800 text-[10px] uppercase block tracking-wider">Demo Credentials Available:</span>
              <div className="space-y-1 text-slate-500">
                <p>
                  • Super Admin Access: <strong className="text-slate-700">sarah.super@taskbridge.com</strong> (pass: <strong className="text-slate-700">password123</strong>)
                </p>
                <p>
                  • TaskBridge Admin: <strong className="text-slate-700">james.carter@taskbridge.com</strong> (pass: <strong className="text-slate-700">password123</strong>)
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:bg-slate-500 text-white font-sans text-xs font-bold py-3 px-4 shadow transition-all cursor-pointer hover:shadow-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                  <span>Checking Core Ledger...</span>
                </>
              ) : (
                <>
                  <span>Sign in securely</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleMfaVerify} className="space-y-4">
            <div className="bg-indigo-50 border border-indigo-100 text-indigo-800 p-3.5 rounded-xl text-[11px] leading-relaxed">
              <p className="font-bold">MFA Required (Multi-Factor Authentication)</p>
              <p className="mt-0.5 text-indigo-700">
                Authorized identity matching triggered. An OTP security code has been sent to your registered authenticator App.
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Enter 5-digit MFA Code
                </label>
                <span className="font-mono text-[9px] text-rose-500 font-bold bg-rose-50 px-1.5 py-0.5 rounded">
                  Demo Key: 5542
                </span>
              </div>
              <input
                type="text"
                maxLength={5}
                required
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value)}
                placeholder="5542"
                className="w-full text-center tracking-[0.4em] rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-base font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-rose-500 focus:border-rose-500 transition-shadow"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:bg-slate-500 text-white font-sans text-xs font-bold py-3 px-4 shadow transition-all cursor-pointer hover:shadow-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                  <span>Verifying Token...</span>
                </>
              ) : (
                <>
                  <span>Verify Secuirty OTP</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
            
            <button
              type="button"
              onClick={() => setMfaStep(false)}
              className="w-full text-center text-slate-400 text-[10px] hover:text-slate-600 transition-colors uppercase font-bold tracking-wider"
            >
              Back to Login
            </button>
          </form>
        )}

        <div className="pt-4 border-t border-slate-100 mt-6 flex justify-between items-center text-[9px] text-slate-400 font-mono">
          <span>HSM JWT Vetted</span>
          <span>AES-GCM-256</span>
        </div>
      </div>
    </div>
  );
}
