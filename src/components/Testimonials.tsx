import React, { useState } from "react";
import { Quote, Star, UserCheck, ShieldAlert, BadgeCheck, CheckCircle2 } from "lucide-react";

interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
  orgType: string;
  impactLabel: string;
  impactValue: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: "testimonial-1",
    quote: "Our frontline carers regularly noted safety hazards like rotting backyard steps or mossy ramps, but we had no safe process to act on them. With TaskBridge, the observation becomes an approved task in seconds, and an Enhanced DBS vetted handyman resolves it within 24 hours.",
    author: "Eleanor Vance",
    role: "Registered Care Manager",
    orgType: "Domiciliary Care Agency",
    impactLabel: "Safety Response Time",
    impactValue: "Reduced by 80%"
  },
  {
    id: "testimonial-2",
    quote: "Protecting vulnerable adults is our ultimate duty. Before TaskBridge, giving domestic access details to independent tradespeople was a critical GDPR and safeguarding concern. The secure firewall shields the resident's phone number and home entry codes flawlessly.",
    author: "Marcus Thorne",
    role: "Head of Safeguarding & Quality",
    orgType: "Regional Care Group",
    impactLabel: "Safeguarding Rating",
    impactValue: "100% Compliant Audits"
  },
  {
    id: "testimonial-3",
    quote: "The administrative efficiency gains are incredible. We used to waste hours calling local handyman lists, trying to check insurance and DBS records manually. TaskBridge has fully automated this dispatch workflow. It saves our coordinators 12 to 15 hours of phone-work every week.",
    author: "Sian Davies",
    role: "Operations Director",
    orgType: "Multi-site Care Provider",
    impactLabel: "Weekly Admin Saved",
    impactValue: "15 Hours / Coordinator"
  },
  {
    id: "testimonial-4",
    quote: "When auditing our fall-prevention services, care commissioners need structured time-logged evidence. TaskBridge serves as our dynamic operations ledger, returning clear before-and-after photograph verification to our central office instantly.",
    author: "Dr. Alistair Reed",
    role: "Direct Access Commissioner",
    orgType: "Local Authority Partner",
    impactLabel: "Compliance Assurance",
    impactValue: "Instant Exportable Logs"
  }
];

export default function Testimonials() {
  const [activeTab, setActiveTab] = useState<string>("testimonial-1");

  const selectedTestimonial = TESTIMONIALS.find((t) => t.id === activeTab) || TESTIMONIALS[0];

  return (
    <section className="bg-slate-50 py-20 lg:py-28 font-sans border-y border-slate-100 relative overflow-hidden">
      {/* Dynamic Background elements for modern B2B SaaS feel */}
      <div className="absolute top-0 left-1/4 h-[350px] w-[350px] rounded-full bg-rose-100/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 h-[350px] w-[350px] rounded-full bg-amber-100/10 blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="font-mono text-xs font-bold uppercase tracking-widest text-rose-500">
            trusted in the field
          </p>
          <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl text-balance">
            Real outcomes from safeguarding leads and care leaders
          </h2>
          <p className="mt-4 text-base text-slate-600">
            Hear from registered care managers, safeguarding leads, and operations managers who are transforming their home-safety operations.
          </p>
        </div>

        {/* Dynamic Interactive Panel Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          
          {/* LEFT: Nav Buttons list */}
          <div className="lg:col-span-4 flex flex-col justify-center space-y-3">
            {TESTIMONIALS.map((t) => {
              const isActive = t.id === activeTab;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`text-left p-5 rounded-2xl border transition-all duration-300 relative ${
                    isActive
                      ? "bg-white border-rose-250 shadow-md ring-1 ring-rose-500/10"
                      : "bg-slate-50 border-slate-200/60 hover:bg-white hover:border-slate-300 hover:shadow-sm"
                  }`}
                >
                  {/* Decorative Left color border line of the selected card */}
                  {isActive && (
                    <div className="absolute left-0 top-4 bottom-4 w-1 bg-gradient-to-b from-rose-500 to-amber-500 rounded-r" />
                  )}

                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[9px] font-bold text-rose-600 uppercase tracking-wider">
                      {t.role}
                    </span>
                    <Star className={`h-3 w-3 ${isActive ? "text-amber-500 fill-amber-500" : "text-slate-300"}`} />
                  </div>
                  
                  <h4 className="font-display font-semibold text-sm text-slate-900">
                    {t.author}
                  </h4>
                  <p className="font-sans text-xs text-slate-400 mt-0.5">
                    {t.orgType}
                  </p>
                </button>
              );
            })}
          </div>

          {/* RIGHT: Major Display Block */}
          <div className="lg:col-span-8 flex flex-col justify-between bg-white border border-slate-100 rounded-3xl p-8 sm:p-12 shadow-xl relative overflow-hidden">
            
            {/* Visual Quotes Icon absolute marker */}
            <div className="absolute top-8 right-10 text-slate-100 pointer-events-none">
              <Quote className="h-24 w-24 transform rotate-180" />
            </div>

            {/* Testimonial Quote */}
            <div className="relative z-10">
              <div className="flex gap-1 mb-6">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="h-4.5 w-4.5 text-amber-500 fill-amber-500" />
                ))}
              </div>

              <blockquote className="font-sans text-lg sm:text-xl font-medium leading-relaxed text-slate-800 text-balance italic">
                “{selectedTestimonial.quote}”
              </blockquote>
            </div>

            {/* Author Profile + Micro Impact badge widget */}
            <div className="mt-8 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-6 relative z-10">
              
              {/* Author description block */}
              <div>
                <h4 className="font-display font-bold text-base text-slate-900">
                  {selectedTestimonial.author}
                </h4>
                <p className="font-sans text-xs font-semibold text-rose-500">
                  {selectedTestimonial.role} &mdash; <span className="text-slate-500">{selectedTestimonial.orgType}</span>
                </p>
                <div className="flex items-center gap-1.5 mt-2">
                  <BadgeCheck className="h-4 w-4 text-emerald-500" />
                  <span className="font-mono text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                    Verified User
                  </span>
                </div>
              </div>

              {/* Dynamic Measured Outcome Block */}
              <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4 sm:px-6 flex items-center gap-4 shrink-0 shadow-sm">
                <div className="h-9 w-9 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-mono text-[9px] font-bold uppercase tracking-wider text-slate-400">
                    {selectedTestimonial.impactLabel}
                  </p>
                  <p className="font-display text-base font-extrabold text-slate-800 mt-0.5">
                    {selectedTestimonial.impactValue}
                  </p>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
