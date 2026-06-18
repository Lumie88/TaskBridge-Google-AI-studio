/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import TrustStrip from "./components/TrustStrip";
import ProblemSolution from "./components/ProblemSolution";
import ServicesPanel from "./components/ServicesPanel";
import SafeguardingShield from "./components/SafeguardingShield";
import Testimonials from "./components/Testimonials";
import IntegrationHub from "./components/IntegrationHub";
import DemoModal from "./components/DemoModal";
import SandboxModal from "./components/SandboxModal";
import Footer from "./components/Footer";
import CoordinatorPortal from "./components/CoordinatorPortal";
import AdminPortalWrapper from "./components/AdminPortal/AdminPortalWrapper";
import { 
  ShieldCheck, 
  HelpCircle, 
  Heart, 
  Star, 
  Calendar, 
  Send, 
  CheckCircle2, 
  ChevronRight, 
  ArrowLeft, 
  Lock,
  ArrowRight,
  Loader2,
  AlertCircle
} from "lucide-react";

// Safe routing hash-to-path parser
const getPathFromHash = () => {
  const hash = window.location.hash;
  if (!hash || hash === "#" || hash === "#/") return "marketing";
  if (hash === "#how-it-works") return "how-it-works";
  if (hash === "#services") return "services";
  if (hash === "#safeguarding") return "safeguarding";
  if (hash === "#integrations") return "integrations";
  if (hash === "#portal") return "portal";
  if (hash === "#admin" || hash.startsWith("#visit-token-")) return "admin";
  return "marketing";
};

export default function App() {
  const [currentPath, setCurrentPath] = useState(getPathFromHash());
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [isSandboxModalOpen, setIsSandboxModalOpen] = useState(false);

  // Authentication states for Secure B2B Coordinator Portal
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginEmail, setLoginEmail] = useState("sarah.jenkins@primrose.org");
  const [loginPassword, setLoginPassword] = useState("password123");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const heroImageUrl = "/src/assets/images/home_safety_hero_1781696221818.jpg";

  // Automated workspace display optimization states - Default to true to automatically maximize body width & collapse top headers
  const [isFullWidth, setIsFullWidth] = useState(true);
  const [hideTopHeaders, setHideTopHeaders] = useState(true);

  // Watch hash changes for page state
  useEffect(() => {
    const handleHashChange = () => {
      const path = getPathFromHash();
      setCurrentPath(path);
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // Initial load check
    handleHashChange();

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Sandbox request can be opened manually via buttons, no automatic timer on load

  const handlePortalLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);

    setTimeout(() => {
      // Validate credentials check
      if (!loginEmail.endsWith(".org") && !loginEmail.endsWith(".uk") && !loginEmail.endsWith(".com")) {
        setLoginError("Please enter a valid care organization workspace email.");
        setLoginLoading(false);
        return;
      }

      if (loginPassword.length < 5) {
        setLoginError("Security password/token must be at least 5 characters long.");
        setLoginLoading(false);
        return;
      }

      setIsAuthenticated(true);
      setLoginLoading(false);
    }, 800);
  };

  // Render Page Indicator / Breadcrumb Header for dedicated pages
  const renderBreadcrumbHeader = (title: string, subtitle: string, category: string) => {
    return (
      <div className="relative overflow-hidden bg-slate-900 text-white py-12 border-b border-slate-800">
        {/* Dynamic decorative backdrop circles */}
        <div className="absolute top-0 right-0 h-40 w-40 bg-gradient-to-bl from-rose-500/10 to-transparent blur" />
        <div className="absolute bottom-0 left-10 h-32 w-32 bg-gradient-to-tr from-indigo-500/5 to-transparent blur" />

        <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-4 bg-slate-950/30 max-w-fit px-3 py-1.5 rounded-full border border-slate-800/60">
            <a href="#" className="hover:text-rose-400 transition-colors">Home</a>
            <ChevronRight className="h-3 w-3 text-slate-600" />
            <span className="text-slate-300 font-bold">{category}</span>
          </div>

          <div className="max-w-3xl">
            <span className="font-mono text-[9px] font-bold text-rose-400 uppercase tracking-widest bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded">
              TaskBridge Protocol Page
            </span>
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight mt-2 text-slate-100">
              {title}
            </h1>
            <p className="font-sans text-sm text-slate-300 mt-2 max-w-2xl text-balance">
              {subtitle}
            </p>
          </div>
        </div>
      </div>
    );
  };

  if (currentPath === "admin") {
    return (
      <AdminPortalWrapper 
        isFullWidth={isFullWidth}
        setIsFullWidth={setIsFullWidth}
        hideTopHeaders={hideTopHeaders}
        setHideTopHeaders={setHideTopHeaders}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 antialiased selection:bg-rose-500 selection:text-white">
      {/* Universal Sticky Header (auto-hidden/reduced for workspace portals to maximize space) */}
      {!(hideTopHeaders && ((currentPath === "portal" && isAuthenticated) || currentPath === "admin")) && (
        <Header 
          onOpenDemo={() => setIsDemoModalOpen(true)} 
          currentPath={currentPath} 
          hideNavigation={currentPath === "portal" || currentPath === "admin"}
        />
      )}

      <main>
        {/* ================= MARKETING HOMEPAGE ================= */}
        {currentPath === "marketing" && (
          <div>
            {/* Dynamic Split Hero */}
            <Hero onOpenDemo={() => setIsDemoModalOpen(true)} heroImageUrl={heroImageUrl} />

            {/* 4-Pillar Trust Strip */}
            <TrustStrip />

            {/* Teaser section calling attention to pages */}
            <section className="bg-white py-16 border-b border-slate-100">
              <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                  <div className="text-left space-y-4">
                    <span className="font-mono text-[10px] font-bold text-rose-500 uppercase tracking-widest">operational excellence</span>
                    <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 leading-tight">
                      Why care providers trust the TaskBridge secure gateway
                    </h2>
                    <p className="font-sans text-sm text-slate-600 leading-relaxed">
                      Instead of relying on unverified contractors or burdening coordinators with offline GDPR audits, our middleware automatically intercepts observations and dispatches safety engineers.
                    </p>
                    <div className="pt-2">
                      <a 
                        href="#how-it-works" 
                        className="inline-flex items-center gap-2 font-sans text-sm font-semibold text-rose-600 hover:text-rose-700 transition-colors group"
                      >
                        <span>Explore our 4-step dispatch workflow</span>
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      </a>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 sm:p-8 space-y-4 text-left">
                    <h3 className="font-display font-bold text-slate-800 text-sm uppercase tracking-wider border-b border-slate-200 pb-2">Safety Features At A Glance</h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-2 text-xs">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                        <p className="font-sans text-slate-600"><strong>Falls Mitigation:</strong> Quick-fixed handrails, non-slip coatings, and weed clearing.</p>
                      </div>
                      <div className="flex items-start gap-2 text-xs">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                        <p className="font-sans text-slate-600"><strong>Data Cloaking:</strong> Handyman never sees key safe codes or phone numbers.</p>
                      </div>
                      <div className="flex items-start gap-2 text-xs">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                        <p className="font-sans text-slate-600"><strong>Regulatory Peace of Mind:</strong> Live digital audit logs ready for care inspectors.</p>
                      </div>
                    </div>
                    <div className="pt-2">
                      <a 
                        href="#services" 
                        className="inline-flex items-center gap-2 font-mono text-xs font-bold text-slate-800 hover:text-rose-600 transition-colors"
                      >
                        <span>View complete service list →</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Testimonials */}
            <Testimonials />
          </div>
        )}

        {/* ================= DEDICATED HOW IT WORKS PAGE ================= */}
        {currentPath === "how-it-works" && (
          <div>
            {renderBreadcrumbHeader(
              "How the TaskBridge System Works",
              "From an on-duty carer observation to an approved safety dispatch and verified before-and-after checkoff—100% compliant data pipelines.",
              "How It Works"
            )}
            <ProblemSolution />
          </div>
        )}

        {/* ================= DEDICATED SERVICES PAGE ================= */}
        {currentPath === "services" && (
          <div>
            {renderBreadcrumbHeader(
              "Vetted Safety & Repair Catalog",
              "Review the full list of home-safety, fall-risk prevention, and light technical interventions supported through TaskBridge middleware.",
              "Our Services"
            )}
            <ServicesPanel />
          </div>
        )}

        {/* ================= DEDICATED SAFEGUARDING PAGE ================= */}
        {currentPath === "safeguarding" && (
          <div>
            {renderBreadcrumbHeader(
              "Safeguarding Protocol Standards",
              "At TaskBridge, home safety begins with bulletproof resident trust. Direct safeguarding rules shield phone numbers, logs, and home accessibility.",
              "Safeguarding Protocol"
            )}
            <SafeguardingShield />
          </div>
        )}

        {/* ================= DEDICATED SYSTEM INTEGRATIONS PAGE ================= */}
        {currentPath === "integrations" && (
          <div>
            {renderBreadcrumbHeader(
              "Compatible Care System Integrations",
              "TaskBridge connects securely with your active care management platforms, extracting safety notes with zero administrative disruption.",
              "System Integrations"
            )}
            <IntegrationHub />
          </div>
        )}

        {/* ================= SECURE CARE COORDINATOR PORTAL ================= */}
        {currentPath === "portal" && (
          <div className="animate-fade-in">
            {isAuthenticated && !hideTopHeaders && renderBreadcrumbHeader(
              "Care Coordinator Workspace Portal",
              "Access and manage approved domestic hazards, safety tasks, and checkoff evidence. Restricted to registered agency leads.",
              "Coordinator Workspace"
            )}
            
            {isAuthenticated ? (
              <CoordinatorPortal 
                onSignOut={() => setIsAuthenticated(false)} 
                isFullWidth={isFullWidth}
                setIsFullWidth={setIsFullWidth}
                hideTopHeaders={hideTopHeaders}
                setHideTopHeaders={setHideTopHeaders}
              />
            ) : (
              <div className="max-w-md mx-auto my-12 px-4">
                <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 sm:p-8 relative overflow-hidden text-left">
                  <div className="absolute top-0 right-0 h-32 w-32 bg-indigo-500/5 blur-3xl pointer-events-none" />
                  
                  {/* Lock Indicator */}
                  <div className="flex justify-center mb-6">
                    <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-sm">
                      <Lock className="h-6 w-6" />
                      <div className="absolute right-0.5 bottom-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-green-500 animate-pulse" />
                    </div>
                  </div>

                  <div className="text-center space-y-2 mb-6">
                    <span className="font-mono text-[9px] font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full">
                      Authorized JWT Portal Login
                    </span>
                    <h2 className="font-display text-2xl font-extrabold text-slate-900 tracking-tight leading-tight">
                      Coordinator Sign-In
                    </h2>
                    <p className="font-sans text-xs text-slate-500 max-w-xs mx-auto">
                      Access TaskBridge compliance dashboards. Input your clinical credentials to retrieve secure session routing.
                    </p>
                  </div>

                  {loginError && (
                    <div className="bg-rose-50 border border-rose-150 text-rose-700 p-3.5 rounded-xl text-xs flex gap-2 mb-4">
                      <AlertCircle className="h-4 w-4 shrink-0 text-rose-500 mt-0.5" />
                      <div>
                        <strong>Authentication Rejected:</strong>
                        <p className="mt-0.5 text-rose-600">{loginError}</p>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handlePortalLogin} className="space-y-4 font-sans">
                    {/* Username / Email */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Workspace Work Email</label>
                      <input
                        type="email"
                        required
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="sarah.jenkins@primrose.org"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
                      />
                    </div>

                    {/* Password */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Security Credentials Password</label>
                        <span className="text-[9px] text-slate-400">Min 5 chars</span>
                      </div>
                      <input
                        type="password"
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
                      />
                    </div>

                    {/* Simulation Onboarding helper */}
                    <div className="bg-slate-50 border border-slate-150 rounded-xl p-3 text-[11px] text-slate-600 space-y-1 text-left leading-normal">
                      <span className="font-bold text-slate-800 text-[10px] uppercase block tracking-wider">Fast Simulation Login:</span>
                      <p>
                        We have prefilled registered coordinator <strong className="text-slate-800">Sarah Jenkins</strong>' active credentials. Click sign-in below to test.
                      </p>
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={loginLoading}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:bg-slate-500 text-white font-sans text-xs font-bold py-3.5 px-4 shadow transition-all cursor-pointer hover:shadow-lg"
                    >
                      {loginLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin text-white" />
                          <span>Generating Secure JWT Token...</span>
                        </>
                      ) : (
                        <>
                          <span>Establish secure session link</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </>
                      )}
                    </button>
                  </form>

                  <div className="pt-4 border-t border-slate-100 mt-6 flex justify-between items-center text-[10px] text-slate-400 font-mono">
                    <span>SSL Gateway Secured</span>
                    <span>Primrose Node #3</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= SIMPLIFIED CALL-TO-ACTION ZONE INSTEAD OF DUPLICATE FORM ================= */}
        {currentPath !== "portal" && (
          <section id="demo-section" className="bg-slate-50 py-16 lg:py-20 border-t border-slate-100 relative text-left">
          <div className="absolute top-0 right-[25%] h-[200px] w-[200px] rounded-full bg-rose-100/10 blur-3xl pointer-events-none" />
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-4xl text-center space-y-8 bg-gradient-to-b from-slate-900 to-slate-950 text-white rounded-3xl p-10 sm:p-14 shadow-2xl relative overflow-hidden border border-slate-800">
              <div className="absolute inset-0 bg-gradient-to-tr from-rose-500/10 via-transparent to-indigo-500/10 blur pointer-events-none" />
              
              <div className="relative z-10 max-w-2xl mx-auto space-y-4">
                <div className="inline-flex items-center gap-1.5 font-mono text-[9px] font-bold text-rose-400 uppercase tracking-widest bg-rose-500/10 border border-rose-500/20 px-3 py-1 rounded-full mx-auto justify-center">
                  <ShieldCheck className="h-3 w-3" />
                  <span>Secure Operational Care Middleware</span>
                </div>
                
                <h2 className="font-display text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                  Ready to transform safe resident care?
                </h2>
                
                <p className="font-sans text-sm sm:text-base text-slate-300 leading-relaxed text-balance">
                  Get in touch to see how the TaskBridge secure gateway connects with your existing care management databases to dispatch instant, vetted safeguarding engineers.
                </p>
              </div>

              {/* Direct Actions */}
              <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDemoModalOpen(true)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-sans text-sm font-bold py-3.5 px-6 shadow-lg shadow-rose-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  <span>Book Personal Demonstration</span>
                  <ArrowRight className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setIsSandboxModalOpen(true)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-100 border border-slate-700 font-sans text-sm font-bold py-3.5 px-6 shadow transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  <span>Request Sandbox Credentials</span>
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="relative z-10 pt-8 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left sm:text-center text-xs text-slate-400 font-sans">
                <div className="flex items-center sm:justify-center gap-2">
                  <Star className="h-4 w-4 text-amber-400 shrink-0" />
                  <span>Tested with CQC guidelines</span>
                </div>
                <div className="flex items-center sm:justify-center gap-2">
                  <Heart className="h-4 w-4 text-rose-500 shrink-0" />
                  <span>100% DBS-vetted contractors</span>
                </div>
                <div className="flex items-center sm:justify-center gap-2">
                  <Lock className="h-4 w-4 text-indigo-400 shrink-0" />
                  <span>Resident identity data shielded</span>
                </div>
              </div>

            </div>
          </div>
        </section>
        )}
      </main>

      {/* Brand Footer links back or switches hashpages instantly */}
      <Footer />

      {/* Slide / Popup Interactive Demo Modal widget */}
      <DemoModal isOpen={isDemoModalOpen} onClose={() => setIsDemoModalOpen(false)} />

      {/* Auto-load Sandbox Request Popup */}
      <SandboxModal isOpen={isSandboxModalOpen} onClose={() => setIsSandboxModalOpen(false)} />
    </div>
  );
}
