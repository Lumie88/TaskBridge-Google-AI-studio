import React, { useState } from "react";
import { X, CheckCircle, Send, Users, ShieldAlert, Calendar, Mail } from "lucide-react";

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DemoModal({ isOpen, onClose }: DemoModalProps) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    orgName: "",
    role: "Care Coordinator",
    referral: "Search Engine",
    notes: "",
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-fade-in font-sans">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100/80 overflow-hidden flex flex-col md:flex-row">
        
        {/* Decorative background accents */}
        <div className="absolute top-0 right-0 h-24 w-24 bg-gradient-to-bl from-rose-500/5 to-transparent blur" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 border border-slate-100 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors z-20"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        {/* LEFT COLUMN: BRAND INSIGHT */}
        <div className="hidden md:flex md:w-5/12 bg-slate-900 p-8 text-white flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-rose-600/10 via-transparent to-slate-950/20" />
          
          <div>
            <span className="font-mono text-[9px] font-bold text-rose-400 uppercase tracking-widest block">SECURE MIDDlEWARE</span>
            <h3 className="font-display font-bold text-lg mt-2 text-white">TaskBridge</h3>
            <p className="font-sans text-[11px] text-slate-400 mt-2 leading-relaxed">
              Experience the power of secure, synchronized help dispatching made completely GDPR-proof.
            </p>
          </div>

          <div className="space-y-4 pt-6 mt-6 border-t border-slate-800 z-10">
            <div className="flex items-start gap-2.5">
              <Users className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
              <p className="text-[10px] text-slate-300 leading-snug">Designed for Home Care managers and operations coordinators.</p>
            </div>
            <div className="flex items-start gap-2.5">
              <ShieldAlert className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-[10px] text-slate-300 leading-snug">Enhanced DBS verification guarantees complete trust.</p>
            </div>
          </div>

          <p className="font-display text-[10px] italic text-rose-300 mt-8">
            “Making home safer for our vulnerable”
          </p>
        </div>

        {/* RIGHT COLUMN: THE INTERACTIVE FORM */}
        <div className="w-full md:w-7/12 p-6 sm:p-8">
          
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <div>
                <h3 className="font-display font-extrabold text-lg text-slate-900">Schedule Your Demo</h3>
                <p className="font-sans text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                  Join our secure middleware pilot program in under 2 minutes.
                </p>
              </div>

              {/* Full Name */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider">Your Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="E.g., Sarah Jenkins"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-rose-500 focus:border-rose-500"
                />
              </div>

              {/* Email Address */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider">Work Email</label>
                <input
                  type="email"
                  required
                  placeholder="E.g., manager@homecare.co.uk"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-rose-500 focus:border-rose-500"
                />
              </div>

              {/* Company / Organization */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider">Organization Name</label>
                <input
                  type="text"
                  required
                  placeholder="E.g., Primrose Care Services"
                  value={formData.orgName}
                  onChange={(e) => setFormData({ ...formData, orgName: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-rose-500 focus:border-rose-500"
                />
              </div>

              {/* Role Dropdown */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider">Your Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-rose-500 focus:border-rose-500"
                >
                  <option>Care Coordinator</option>
                  <option>Care Manager</option>
                  <option>Safeguarding Lead</option>
                  <option>Operations Director</option>
                  <option>Local Government Commissioner</option>
                </select>
              </div>

              {/* Brief Safety Notes */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider">Specific Safety / Integration Needs</label>
                <textarea
                  placeholder="E.g., Fall risk prevention, garden accessibility"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-rose-500 focus:border-rose-500 resize-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-sans text-xs font-bold py-3.5 px-4 shadow transition-all focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                <span>Request Demo Allocation</span>
                <Send className="h-3.5 w-3.5 text-white" />
              </button>
            </form>
          ) : (
            /* SUCCESS STATE */
            <div className="py-8 text-center flex flex-col items-center justify-center space-y-4 animate-fade-in">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 shadow-sm animate-bounce">
                <CheckCircle className="h-8 w-8" />
              </div>
              
              <div>
                <h3 className="font-display font-extrabold text-xl text-slate-900">Sandbox Code Provisioned!</h3>
                <p className="font-sans text-xs text-slate-500 mt-2 leading-relaxed px-2">
                  Excellent, <strong className="text-slate-850">{formData.fullName}</strong>. We have registered <strong className="text-slate-850">{formData.orgName}</strong> for our secure HealthTech pilot. 
                </p>
              </div>

              {/* Receipt Visual info block */}
              <div className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-left space-y-3 font-sans text-[11px] text-slate-600">
                <div className="flex items-center gap-2 text-slate-900 font-bold border-b border-slate-200/60 pb-1.5">
                  <Calendar className="h-4 w-4 text-rose-500" />
                  <span>Onboarding Credentials Summary</span>
                </div>
                <div className="flex justify-between">
                  <span>Authorized Role:</span>
                  <span className="font-bold text-slate-800">{formData.role}</span>
                </div>
                <div className="flex justify-between flex-wrap gap-2">
                  <span>Routing Endpoint Assigned:</span>
                  <span className="font-mono text-[10px] text-rose-600 bg-rose-50 px-1 border border-rose-100 rounded">api.taskbridge.tech/v1/sandbox</span>
                </div>
                <div className="flex items-start gap-2 text-slate-500 mt-1 border-t border-slate-200/60 pt-2 bg-slate-50">
                  <Mail className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                  <p className="text-[10px] leading-relaxed">
                    Check your inbox at <strong>{formData.email}</strong> right away. One of our Clinical Integration Leads will guide you through the secure webhook ingestion sandbox.
                  </p>
                </div>
              </div>

              <div className="w-full">
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    onClose();
                  }}
                  className="w-full rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-sans text-xs font-bold py-3 text-center transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
