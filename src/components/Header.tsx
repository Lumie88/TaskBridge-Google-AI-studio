import React, { useState } from "react";
import { ShieldCheck, Menu, X, ArrowRight } from "lucide-react";

interface HeaderProps {
  onOpenDemo: () => void;
  currentPath: string;
  hideNavigation?: boolean;
}

export default function Header({ onOpenDemo, currentPath, hideNavigation }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: "How It Works", href: "#how-it-works", path: "how-it-works" },
    { name: "Sign In", href: "#portal", path: "portal" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-rose-100 bg-white/90 backdrop-blur-md transition-colors duration-300">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Brand Logo - Returns to Marketing Landing */}
        <a href="#" className="group flex items-center gap-2.5 transition-opacity hover:opacity-90">
          <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-amber-500 text-white shadow-md shadow-rose-500/10 transition-transform group-hover:scale-105">
            <ShieldCheck className="h-6 w-6" />
            <div className="absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display text-2xl font-bold tracking-tight text-slate-900">
                Task<span className="bg-gradient-to-r from-rose-500 to-amber-600 bg-clip-text text-transparent">Bridge</span>
              </span>
            </div>
            <p className="font-sans text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
              safeguarded care middleware
            </p>
          </div>
        </a>

        {/* Desktop CTA and Navigation links right next to it */}
        {!hideNavigation && (
          <div className="hidden md:flex items-center gap-6">
            <nav className="flex items-center gap-6 border-r border-slate-150 pr-6">
              {navLinks.map((link) => {
                const isActive = currentPath === link.path;
                const isPortal = link.path === "portal";
                return (
                  <a
                    key={link.name}
                    href={link.href}
                    className={`font-sans text-sm font-medium transition-all relative py-1.5 ${
                      isActive 
                        ? "text-rose-600 font-bold" 
                        : isPortal
                          ? "text-indigo-600 font-bold hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100/60 px-3.5 py-2 rounded-xl border border-indigo-100 shadow-sm active:scale-95 transition-all"
                          : "text-slate-600 hover:text-rose-500 hover:scale-[1.02] transition-transform"
                    }`}
                  >
                    <span>{link.name}</span>
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-rose-500 to-amber-500 rounded-full" />
                    )}
                  </a>
                );
              })}
            </nav>
            <button
              onClick={onOpenDemo}
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-slate-900 px-5 py-2.5 text-center font-sans text-sm font-semibold text-white transition-all shadow-sm hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 hover:scale-[1.02]"
            >
              <span>Book a Demo</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        )}

        {/* Mobile Toggle */}
        {!hideNavigation && (
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 md:hidden transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        )}
      </div>

      {/* Mobile Menu Dropdown */}
      {!hideNavigation && mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-6 py-6 shadow-lg transition-all">
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => {
              const isActive = currentPath === link.path;
              const isPortal = link.path === "portal";
              return (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`font-sans text-base font-semibold transition-colors border-b border-slate-50 pb-2 flex items-center justify-between ${
                    isActive 
                      ? "text-rose-600 font-bold" 
                      : isPortal
                        ? "text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-120"
                        : "text-slate-800 hover:text-rose-500"
                  }`}
                >
                  <span>{link.name}</span>
                  {isPortal && <span className="text-[10px] bg-indigo-200 text-indigo-850 font-mono font-bold px-1.5 py-0.5 rounded">SECURE</span>}
                </a>
              );
            })}
            <div className="mt-4 flex flex-col gap-4">
              <a
                href="tel:+442080501234"
                className="font-mono text-sm font-medium text-slate-500 text-center py-2"
              >
                Inquiries: +44 (0) 20 8050 1234
              </a>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenDemo();
                }}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-amber-600 py-3 text-center font-sans text-base font-semibold text-white shadow-md shadow-rose-500/10 hover:shadow-lg transition-all"
              >
                <span>Request Demo Call</span>
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
