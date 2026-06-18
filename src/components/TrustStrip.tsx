import React from "react";
import { Link2, ShieldCheck, Store, LockKeyhole } from "lucide-react";

export default function TrustStrip() {
  const credentials = [
    {
      icon: <Link2 className="h-6 w-6 text-rose-600" />,
      title: "Extremely Compatible",
      description: "Compatible with most leading care management applications to sync notes smoothly.",
      badge: "integration ready"
    },
    {
      icon: <ShieldCheck className="h-6 w-6 text-amber-600" />,
      title: "Enhanced DBS Vetted",
      description: "Every surveyor and tradesperson undergoes strict, recurring Enhanced criminal checks.",
      badge: "safeguarding compliant"
    },
    {
      icon: <Store className="h-6 w-6 text-indigo-600" />,
      title: "Private Vetted Networks",
      description: "Strictly invitation-only trader panel certified specifically under vulnerable resident care codes.",
      badge: "trusted trade panel"
    },
    {
      icon: <LockKeyhole className="h-6 w-6 text-emerald-600" />,
      title: "Resident Details Protected",
      description: "Strictly shields home access codes and direct resident phone numbers from active operatives.",
      badge: "gdpr & cyber secure"
    }
  ];

  return (
    <section className="bg-white py-12 border-y border-slate-100">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        
        {/* Short Descriptive Section */}
        <div className="text-center mb-8">
          <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Engineered for complete peace of mind
          </p>
          <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-slate-900">
            Four pillars of safe, trusted care support
          </h2>
        </div>

        {/* 4-Column Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {credentials.map((cred, idx) => (
            <div
              key={idx}
              className="group relative flex flex-col justify-between rounded-2xl border border-slate-100 bg-slate-50 p-6 transition-all duration-300 hover:border-rose-100 hover:bg-white hover:shadow-xl hover:shadow-rose-500/5 hover:-translate-y-0.5"
            >
              {/* Card top */}
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white border border-slate-100 text-slate-800 shadow-sm transition-all group-hover:scale-105 group-hover:shadow-md group-hover:border-rose-50/50">
                  {cred.icon}
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <h3 className="font-display font-bold text-sm text-slate-900 group-hover:text-rose-600 transition-colors">
                    {cred.title}
                  </h3>
                </div>
                <p className="mt-2 font-sans text-xs leading-relaxed text-slate-600">
                  {cred.description}
                </p>
              </div>

              {/* Card Badge bottom */}
              <div className="mt-4 pt-4 border-t border-slate-200/40 flex justify-between items-center">
                <span className="font-mono text-[9px] font-bold text-slate-400 uppercase tracking-wider group-hover:text-rose-400 transition-colors">
                  {cred.badge}
                </span>
                <span className="h-1.5 w-1.5 rounded-full bg-slate-300 group-hover:bg-rose-400 transition-colors" />
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
