import React from "react";
import { ArrowRight, Play, ShieldAlert, BadgeCheck, ShieldCheck } from "lucide-react";

interface HeroProps {
  onOpenDemo: () => void;
  heroImageUrl: string;
}

export default function Hero({ onOpenDemo, heroImageUrl }: HeroProps) {
  return (
    <section className="relative overflow-hidden bg-slate-50 pt-8 pb-16 lg:pt-16 lg:pb-24">
      {/* Decorative Warm Ambient Beams */}
      <div className="absolute top-0 right-0 -z-10 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-amber-100/40 via-rose-100/30 to-transparent blur-3xl" />
      <div className="absolute bottom-0 left-0 -z-10 h-[600px] w-[600px] rounded-full bg-gradient-to-tr from-rose-50/20 via-sky-50/40 to-transparent blur-3xl" />

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-8">
          
          {/* Left Column: Branding, Headings, and CTAs */}
          <div className="text-left lg:col-span-7 flex flex-col justify-center">
            {/* Trust Pill */}
            <div className="inline-flex max-w-fit items-center gap-2 rounded-full bg-rose-50 border border-rose-100/80 px-4 py-1.5 text-xs text-rose-700 font-semibold mb-6">
              <ShieldCheck className="h-4 w-4 text-rose-600 animate-pulse" />
              <span>Compliant Care Operations Middleware</span>
            </div>

            {/* Headline */}
            <h1 className="font-display text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl text-balance leading-[1.1]">
              Connecting care teams with trusted,{" "}
              <span className="relative inline-block">
                <span className="relative z-10 bg-gradient-to-r from-rose-600 to-amber-600 bg-clip-text text-transparent">vetted home safety</span>
                <span className="absolute bottom-1.5 left-0 -z-10 h-3 w-full bg-rose-100/60 rounded-full" />
              </span>{" "}
              support.
            </h1>

            {/* Company Motto Highlight */}
            <div className="mt-6 border-l-4 border-rose-500 bg-rose-50/50 py-3 pl-4 pr-6 rounded-r-xl">
              <p className="font-display text-base font-semibold italic text-rose-900 tracking-wide">
                “Making home safer for our vulnerable”
              </p>
            </div>

            {/* Platform Description */}
            <p className="mt-6 font-sans text-base leading-relaxed text-slate-600 max-w-2xl text-balance">
              TaskBridge bridges the gap between care management and home safety. 
              We empower care managers, safeguarding leads, and operations teams to seamlessly convert carer observations into vetted, trackable home inspections, garden safety, and repairs—keeping resident identity and contact details meticulously secure.
            </p>

            {/* Support Metrics Strip */}
            <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3 border-t border-slate-200/60 pt-6">
              <div className="flex items-center gap-2">
                <BadgeCheck className="h-5 w-5 text-emerald-500" />
                <span className="font-sans text-sm font-semibold text-slate-700">Enhanced DBS Checked Operatives</span>
              </div>
              <div className="flex items-center gap-2">
                <BadgeCheck className="h-5 w-5 text-emerald-500" />
                <span className="font-sans text-sm font-semibold text-slate-700">GDPR Compliant</span>
              </div>
            </div>

            {/* Interactive CTAs */}
            <div className="mt-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <button
                onClick={onOpenDemo}
                className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-slate-900 px-7 py-4 font-sans text-base font-semibold text-white transition-all shadow-md hover:bg-slate-800 shadow-slate-900/10 hover:shadow-xl hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
              >
                <span>Book a Demo</span>
                <ArrowRight className="h-5 w-5" />
              </button>

              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white border border-slate-200 px-7 py-4 font-sans text-base font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
              >
                <Play className="h-4 w-4 fill-slate-500 text-slate-500 mr-1" />
                <span>See How It Works</span>
              </a>
            </div>
          </div>

          {/* Right Column: Premium Image Frame & Floating Badges */}
          <div className="relative mt-8 lg:mt-0 lg:col-span-5 flex justify-center items-center">
            
            {/* Visual Frame */}
            <div className="relative z-10 w-full max-w-sm sm:max-w-md lg:max-w-full overflow-hidden rounded-3xl border-8 border-white bg-slate-100 shadow-2xl transition-all hover:scale-[1.01] duration-500">
              <div className="aspect-[3/4] w-full sm:aspect-[4/5] lg:aspect-square relative">
                <img
                  src={heroImageUrl}
                  alt="A friendly, verified handyman securely completing a home safety bar assessment and fitting for an elderly resident."
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover"
                  loading="eager"
                  onError={(e) => {
                    // Fallback visual in case of image load delay or error
                    e.currentTarget.style.display = "none";
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                      parent.className = "h-full w-full bg-gradient-to-tr from-rose-500/10 via-amber-500/10 to-transparent flex items-center justify-center p-8 text-center";
                      const div = document.createElement("div");
                      div.className = "max-w-xs text-slate-700";
                      div.innerHTML = `<h3 className="font-display font-bold text-lg mb-2 text-rose-900">TaskBridge</h3><p className="text-sm">Assuring secure home safety visits with verified, high-quality, Enhanced DBS checked professionals.</p>`;
                      parent.appendChild(div);
                    }
                  }}
                />
                
                {/* Image Scrim Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 via-transparent to-transparent pointer-events-none" />
              </div>
            </div>

            {/* Trust Pill Overlay 1 - Top Left */}
            <div className="absolute -top-4 -left-2 sm:-left-6 z-25 max-w-xs rounded-2xl bg-white p-4 shadow-xl border border-slate-100/80 flex items-start gap-3 animate-fade-in duration-700">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                <BadgeCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="font-sans text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Verification Match</p>
                <h4 className="font-display font-bold text-sm text-slate-800">Enhanced DBS Verified</h4>
                <p className="font-sans text-xs text-slate-500 mt-0.5">Operative status active & validated</p>
              </div>
            </div>

            {/* Trust Pill Overlay 2 - Bottom Right */}
            <div className="absolute -bottom-6 -right-2 sm:-right-6 z-25 max-w-xs rounded-2xl bg-slate-900 p-4 shadow-2xl flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <div>
                <p className="font-mono text-[9px] font-bold text-orange-400 uppercase tracking-wider">Encrypted Privacy</p>
                <h4 className="font-display font-semibold text-sm text-white">Contact details secured</h4>
                <p className="font-sans text-xs text-slate-300 mt-0.5">Resident contact numbers fully shielded</p>
              </div>
            </div>

            {/* Architectural Border Accents */}
            <div className="absolute -right-12 -top-12 -z-10 h-72 w-72 rounded-full border border-slate-200/80 pointer-events-none hidden sm:block" />
            <div className="absolute -left-12 -bottom-12 -z-10 h-72 w-72 rounded-full border border-slate-200/80 pointer-events-none hidden sm:block" />
          </div>

        </div>
      </div>
    </section>
  );
}
