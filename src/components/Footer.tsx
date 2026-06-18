import React from "react";
import { ShieldCheck, Mail, MapPin, Phone, HelpCircle } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-16 font-sans border-t border-slate-800">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        
        {/* Core content grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 border-b border-slate-800 pb-12 mb-12">
          
          {/* Brand Col */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-amber-500 text-white shadow-md shadow-rose-500/15">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <span className="font-display text-xl font-bold tracking-tight text-white">
                  Task<span className="text-rose-400">Bridge</span>
                </span>
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">
                  safeguarded care middleware
                </p>
              </div>
            </div>

            <p className="mt-4 text-xs leading-relaxed max-w-sm text-balance">
              Connecting home care managers and safeguarding coordinators with verified, Enhanced DBS checked safety operatives.
            </p>

            {/* Motto */}
            <div className="border-l-2 border-rose-500 pl-3 py-1">
              <p className="text-xs italic text-rose-300 font-medium font-display">
                “Making home safer for our vulnerable”
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="font-display font-bold text-xs uppercase tracking-widest text-slate-200">
              System Guidelines
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#how-it-works" className="hover:text-white transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-white transition-colors">
                  Our Services
                </a>
              </li>
              <li>
                <a href="#safeguarding" className="hover:text-white transition-colors">
                  Safeguarding Protocol
                </a>
              </li>
              <li>
                <a href="#integrations" className="hover:text-white transition-colors">
                  System Integrations
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="md:col-span-4 space-y-4">
            <h4 className="font-display font-bold text-xs uppercase tracking-widest text-slate-200">
              Inquiries &amp; Support
            </h4>
            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2">
                <Phone className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <a href="tel:+442080501234" className="text-slate-300 hover:text-white font-mono transition-colors">
                    +44 (0) 20 8050 1234
                  </a>
                  <p className="text-[10px] text-slate-500 mt-0.5">Mon - Fri: 8:00 AM - 6:00 PM GMT</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-indigo-400 shrink-0" />
                <a href="mailto:integrations@taskbridge.tech" className="text-slate-300 hover:text-white transition-colors">
                  integrations@taskbridge.tech
                </a>
              </div>

              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  TaskBridge Systems Ltd, <br />
                  85 Great Portland Street, First Floor, <br />
                  London, W1W 7LT
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Corporate Trust Statements (Non-vendor DBS specific) */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 text-[11px] text-slate-500">
          <div className="space-y-1 text-center sm:text-left">
            <p>&copy; {new Date().getFullYear()} TaskBridge Systems Ltd. All rights reserved.</p>
            <p className="text-[10px]">
              TaskBridge is a registered HealthTech and Care Operations Middleware software. 
              Enhanced DBS check validations comply strictly with local vulnerable-adult safeguarding guidelines.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-4 justify-center">
            <span className="hover:text-slate-300 cursor-pointer">Security Standards</span>
            <span className="h-3.5 w-px bg-slate-800" />
            <span className="hover:text-slate-300 cursor-pointer">GDPR Shield Policy</span>
            <span className="h-3.5 w-px bg-slate-800" />
            <span className="hover:text-slate-300 cursor-pointer">Safeguarding SLA</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
