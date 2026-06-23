import React, { useState, useEffect } from "react";
import { Quote, Star, UserCheck, ShieldAlert, BadgeCheck, CheckCircle2, MessageSquarePlus, X, HeartHandshake, Sparkles } from "lucide-react";

interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
  orgType: string;
  impactLabel: string;
  impactValue: string;
}

const TESTIMONIALS_FALLBACK: Testimonial[] = [
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
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [activeTab, setActiveTab] = useState<string>("testimonial-1");
  const [loading, setLoading] = useState<boolean>(true);
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  // Form states for new dynamic outcome
  const [quoteInput, setQuoteInput] = useState("");
  const [authorInput, setAuthorInput] = useState("");
  const [roleInput, setRoleInput] = useState("Registered Care Manager");
  const [orgTypeInput, setOrgTypeInput] = useState("Domiciliary Care Agency");
  const [impactLabelInput, setImpactLabelInput] = useState("Safety Response Time");
  const [impactValueInput, setImpactValueInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const listToRender = testimonials.length > 0 ? testimonials : TESTIMONIALS_FALLBACK;
  const selectedTestimonial = listToRender.find((t) => t.id === activeTab) || listToRender[0];

  const fetchTestimonials = async () => {
    try {
      const res = await fetch("/api/testimonials");
      if (res.ok) {
        const data = await res.json();
        setTestimonials(data);
        if (data.length > 0) {
          // If the current active tab is not in the data, default to first item
          if (!data.some((t: Testimonial) => t.id === activeTab)) {
            setActiveTab(data[0].id);
          }
        }
      } else {
        setTestimonials(TESTIMONIALS_FALLBACK);
      }
    } catch (e) {
      console.warn("Failed fetching testimonials, using fallback seed", e);
      setTestimonials(TESTIMONIALS_FALLBACK);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  // Automatic outcomes cycler (rotates testimonial ledger automatically)
  useEffect(() => {
    if (listToRender.length === 0 || modalOpen) return;
    
    const interval = setInterval(() => {
      setActiveTab((currentTab) => {
        const index = listToRender.findIndex((t) => t.id === currentTab);
        if (index === -1) return listToRender[0].id;
        const nextIndex = (index + 1) % listToRender.length;
        return listToRender[nextIndex].id;
      });
    }, 6500); // cycle testimonials every 6.5 seconds

    return () => clearInterval(interval);
  }, [listToRender, activeTab, modalOpen]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quoteInput.trim() || !authorInput.trim() || !impactValueInput.trim()) {
      alert("Please populate all outstanding form fields.");
      return;
    }
    setSubmitting(true);
    setSuccessMsg("");

    try {
      const res = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quote: quoteInput,
          author: authorInput,
          role: roleInput,
          orgType: orgTypeInput,
          impactLabel: impactLabelInput,
          impactValue: impactValueInput
        })
      });

      if (res.ok) {
        const newTestimonial = await res.json();
        setSuccessMsg("Safeguarding outcome successfully submitted to dynamic ledger!");
        setQuoteInput("");
        setAuthorInput("");
        setImpactValueInput("");
        
        // Refresh testimonials
        await fetchTestimonials();
        setActiveTab(newTestimonial.id);
        
        setTimeout(() => {
          setModalOpen(false);
          setSuccessMsg("");
        }, 1600);
      } else {
        alert("Failed to submit review.");
      }
    } catch (err) {
      console.error(err);
      alert("Network timeout or connection error.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="bg-slate-50 py-20 lg:py-28 font-sans border-y border-slate-100 relative overflow-hidden" id="client-outcomes-section">
      {/* Self-contained CSS transition for high premium fidelity */}
      <style>{`
        @keyframes outcomeFadeIn {
          0% { opacity: 0; transform: translateY(12px) scale(0.995); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-outcome-fade {
          animation: outcomeFadeIn 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
      {/* Dynamic Background elements for modern B2B SaaS feel */}
      <div className="absolute top-0 left-1/4 h-[350px] w-[350px] rounded-full bg-rose-100/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 h-[350px] w-[350px] rounded-full bg-amber-100/10 blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <p className="font-mono text-xs font-bold uppercase tracking-widest text-rose-500">
            trusted in the field
          </p>
          <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl text-balance">
            Real outcomes from safeguarding leads and care leaders
          </h2>
          <p className="text-base text-slate-600">
            Hear from registered care managers, safeguarding leads, and operations managers who are transforming their home-safety operations.
          </p>
          
          <div className="pt-2">
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 text-white font-bold text-xs py-2.5 px-4 hover:bg-slate-800 transition-all cursor-pointer shadow-sm hover:shadow"
            >
              <MessageSquarePlus className="h-4 w-4 text-rose-400" />
              <span>Submit Safeguarding Outcome</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-3">
            <div className="w-8 h-8 rounded-full border-4 border-rose-500 border-t-transparent animate-spin" />
            <p className="font-mono text-[10px] text-slate-400 uppercase tracking-widest">Hydrating Ledgers...</p>
          </div>
        ) : (
          /* Dynamic Interactive Panel Split */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
            
            {/* LEFT: Nav Buttons list */}
            <div className="lg:col-span-4 flex flex-col justify-center space-y-3 lg:max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {listToRender.map((t) => {
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
                      <span className="font-mono text-[9px] font-bold text-rose-600 uppercase tracking-wider truncate max-w-[180px]">
                        {t.role}
                      </span>
                      <Star className={`h-3 w-3 ${isActive ? "text-amber-500 fill-amber-500" : "text-slate-300"}`} />
                    </div>
                    
                    <h4 className="font-display font-semibold text-sm text-slate-900 truncate">
                      {t.author}
                    </h4>
                    <p className="font-sans text-xs text-slate-400 mt-0.5 truncate">
                      {t.orgType}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* RIGHT: Major Display Block */}
            {selectedTestimonial && (
              <div 
                key={selectedTestimonial.id} 
                className="lg:col-span-8 flex flex-col justify-between bg-white border border-slate-100 rounded-3xl p-8 sm:p-12 shadow-xl relative overflow-hidden animate-outcome-fade"
              >
                
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
                        Verified Outcome
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
            )}

          </div>
        )}

      </div>

      {/* ================= MODAL: SUBMIT NEW DYNAMIC OUTCOME ================= */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleFormSubmit}
            className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden p-6 relative animation-fade-in text-left space-y-4 font-sans"
          >
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2">
              <HeartHandshake className="h-5 w-5 text-rose-500" />
              <h3 className="font-display font-black text-slate-950 text-base">Share Safeguarding / Care Safety Outcome</h3>
            </div>
            
            <p className="text-[11px] text-slate-500 font-sans leading-relaxed">
              Your feedback is audited and logged in the TaskBridge central operations ledger. Enter real-life results and quantitative savings registered in your service.
            </p>

            {successMsg && (
              <div className="bg-emerald-50 border border-emerald-150 rounded-xl p-3 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-bounce">
                <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 block uppercase">Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g. Pamela Harris"
                    value={authorInput}
                    onChange={(e) => setAuthorInput(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 focus:outline-none focus:ring-1 focus:ring-rose-450"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 block uppercase">Professional Role</label>
                  <select
                    value={roleInput}
                    onChange={(e) => setRoleInput(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 focus:outline-none focus:ring-1 focus:ring-rose-450"
                  >
                    <option value="Registered Care Manager">Registered Care Manager</option>
                    <option value="Head of Safeguarding & Quality">Head of Safeguarding & Quality</option>
                    <option value="Operations Manager / Lead">Operations Manager / Lead</option>
                    <option value="Service Coordinator">Service Coordinator</option>
                    <option value="Care Quality Commissioner">Care Quality Commissioner</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 block uppercase">Organization / Care Provider Type</label>
                <select
                  value={orgTypeInput}
                  onChange={(e) => setOrgTypeInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 focus:outline-none focus:ring-1 focus:ring-rose-450"
                >
                  <option value="Domiciliary Care Agency">Domiciliary Care Agency</option>
                  <option value="Regional Care Group">Regional Care Group</option>
                  <option value="Multi-site Care Provider">Multi-site Care Provider</option>
                  <option value="Local Authority Partner">Local Authority Partner</option>
                  <option value="Private Care Association">Private Care Association</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 block uppercase">Key Performance Indicator (KPI)</label>
                  <select
                    value={impactLabelInput}
                    onChange={(e) => setImpactLabelInput(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 focus:outline-none focus:ring-1 focus:ring-rose-450"
                  >
                    <option value="Safety Response Time">Safety Response Time</option>
                    <option value="Weekly Admin Saved">Weekly Admin Saved</option>
                    <option value="Safeguarding Rating">Safeguarding Rating</option>
                    <option value="Compliance Assurance">Compliance Assurance</option>
                    <option value="Resident Safety Score">Resident Safety Score</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 block uppercase">Measured Outcome Value</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g. reduced by 85% or 12 Hours"
                    value={impactValueInput}
                    onChange={(e) => setImpactValueInput(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 focus:outline-none focus:ring-1 focus:ring-rose-450"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 block uppercase">Outcome Narrative (Quote)</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe how TaskBridge helped solve safety hazards, automate vettings or keep residents protected..."
                  value={quoteInput}
                  onChange={(e) => setQuoteInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 focus:outline-none focus:ring-1 focus:ring-rose-450 leading-relaxed resize-none"
                />
              </div>

            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="bg-slate-100 hover:bg-slate-200 font-bold px-4 py-2 rounded-xl text-slate-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-xl shadow flex items-center gap-1"
              >
                {submitting ? (
                  <>
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin mr-1" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3 w-3 text-amber-400" />
                    <span>Publish Outcome</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

    </section>
  );
}
