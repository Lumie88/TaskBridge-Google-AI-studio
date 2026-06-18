import React, { useState } from "react";
import { X, CheckCircle2, Send, Calendar, ShieldCheck, Mail, Key } from "lucide-react";

interface SandboxModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SandboxModal({ isOpen, onClose }: SandboxModalProps) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    orgName: "",
    role: "Care Manager",
  });

  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.fullName && formData.email && formData.orgName) {
      setSubmitted(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-fade-in font-sans">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col md:flex-row max-h-[90vh] md:max-h-none overflow-y-auto md:overflow-visible">
        
        {/* Dynamic decorative backdrop circles */}
        <div className="absolute top-0 right-0 h-24 w-24 bg-gradient-to-bl from-rose-500/10 to-transparent blur-xl pointer-events-none" />
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 border border-slate-100 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors z-20"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Left Side: Dynamic Side Header */}
        <div className="md:w-5/12 bg-slate-900 p-8 text-white flex flex-col justify-between relative overflow-hidden shrink-0">
          <div className="absolute inset-0 bg-gradient-to-br from-rose-500/20 via-transparent to-slate-950/40" />
          
          <div className="relative z-10 space-y-4">
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/20 text-rose-400">
              <Key className="h-5 w-5" />
            </div>
            <div>
              <span className="font-mono text-[9px] font-bold text-rose-400 uppercase tracking-widest block">TaskBridge Middleware</span>
              <h3 className="font-display font-extrabold text-lg mt-1 text-white">Integration Sandbox</h3>
              <p className="font-sans text-[11px] text-slate-300 mt-2 leading-relaxed">
                Unlock instant developer credentials to integrate care logs, safeguarding protocols, and automated dispatches.
              </p>
            </div>
          </div>

          <div className="relative z-10 pt-6 mt-6 border-t border-slate-800 space-y-3 font-sans text-[10px] text-slate-400 text-left">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-rose-400" />
              <span>Full compliance logging</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              <span>Automated mock webhook routing</span>
            </div>
          </div>
        </div>

        {/* Right Side: Form / Success view */}
        <div className="w-full md:w-7/12 p-6 sm:p-8 text-left relative flex flex-col justify-center">
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <h4 className="font-display font-extrabold text-lg text-slate-950">Request Sandbox Access</h4>
                <p className="font-sans text-[11px] text-slate-500 mt-1 leading-relaxed">
                  Join our pilot phase. Get personal API sandbox keys to test our live care integration pathways.
                </p>
              </div>

              {/* Full Name */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-550 uppercase tracking-wider">Your Name</label>
                <input
                  type="text"
                  required
                  placeholder="Sarah Jenkins"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-rose-500 focus:border-rose-500 transition-shadow"
                />
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-550 uppercase tracking-wider font-sans">Work Email</label>
                <input
                  type="email"
                  required
                  placeholder="sarah@agency.co.uk"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-rose-500 focus:border-rose-500 transition-shadow"
                />
              </div>

              {/* Organization Name */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-550 uppercase tracking-wider">Organization Name</label>
                <input
                  type="text"
                  required
                  placeholder="E.g., Primrose Care Services"
                  value={formData.orgName}
                  onChange={(e) => setFormData({ ...formData, orgName: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-rose-500 focus:border-rose-500 transition-shadow"
                />
              </div>

              {/* Role */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-550 uppercase tracking-wider">Your Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-rose-500 focus:border-rose-500"
                >
                  <option>Care Manager</option>
                  <option>Care Coordinator</option>
                  <option>Safeguarding Lead</option>
                  <option>Executive / Director</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-sans text-xs font-bold py-3.5 px-4 shadow transition-all focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-1"
              >
                <span>Generate Sandbox Credentials</span>
                <Send className="h-3.5 w-3.5 text-white" />
              </button>
            </form>
          ) : (
            /* Success State */
            <div className="py-6 text-center space-y-4 animate-fade-in flex flex-col justify-center items-center font-sans">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 shadow-sm animate-bounce">
                <CheckCircle2 className="h-6 w-6" />
              </div>

              <div>
                <h4 className="font-display font-extrabold text-base text-slate-900">Sandbox Code Ready!</h4>
                <p className="font-sans text-xs text-slate-500 mt-1 leading-relaxed">
                  Fantastic, <strong>{formData.fullName}</strong>. We've provisioned access tokens for <strong>{formData.orgName}</strong>.
                </p>
              </div>

              <div className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3.5 text-[11px] text-slate-600 text-left space-y-2">
                <div className="flex justify-between items-center pb-1 border-b border-slate-200/60 font-bold text-slate-800">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-rose-500" />
                    <span>Onboarding Status</span>
                  </div>
                  <span className="text-[9px] bg-rose-50 text-rose-600 px-1 rounded border border-rose-100">Live Pilot</span>
                </div>
                <div className="flex justify-between">
                  <span>Routing Endpoint:</span>
                  <span className="font-mono text-[9px] text-rose-600 bg-rose-50 px-1 border border-rose-100 rounded">api.taskbridge.co/v1/sandbox</span>
                </div>
                <div className="rounded-lg bg-indigo-50 border border-indigo-100 p-2.5 text-[10px] text-indigo-800 font-sans leading-normal">
                  <span className="font-extrabold block text-[9px] uppercase text-indigo-900 tracking-wider">Super Admin Testing Area:</span>
                  <p className="mt-0.5">
                    Jump to the <a href="#admin" onClick={onClose} className="font-black underline hover:text-rose-600">TaskBridge Admin Portal (#admin)</a> to rotate API keys, trigger gov DBS webhooks, audit GDPR cloaked databases, or dispatch on-site mechanics!
                  </p>
                </div>
                <div className="flex gap-1.5 text-slate-500 pt-1 border-t border-slate-200/60">
                  <Mail className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                  <p className="text-[10px]">
                    We sent webhook setup credentials to <strong>{formData.email}</strong>. Our clinical integration team will follow up shortly to help you coordinate a screen-share.
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setSubmitted(false);
                  onClose();
                }}
                className="w-full rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-sans text-xs font-bold py-3 text-center transition-colors shadow-sm"
              >
                Launch Console Done
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
