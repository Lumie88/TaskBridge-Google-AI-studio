import React, { useState } from "react";
import { 
  ShieldCheck, 
  EyeOff, 
  Camera, 
  RefreshCw, 
  Lock, 
  ShieldAlert, 
  Clock, 
  Database, 
  UserX, 
  Zap, 
  CheckCircle2, 
  FileText, 
  TrendingUp, 
  Sparkles,
  ArrowRight,
  Eye,
  Key
} from "lucide-react";

interface Scenario {
  id: string;
  residentName: string;
  careNeed: string;
  careNeedCode: string;
  hazardType: string;
  rawAddress: string;
  rawKeySafe: string;
  rawPhone: string;
  vulnerabilityBrief: string;
  suggestedSlaPriority: "P1" | "P2" | "P3";
}

const SCENARIOS: Scenario[] = [
  {
    id: "scen-1",
    residentName: "Margaret Higgins",
    careNeed: "Cognitive Care / Level 3 Dementia Support",
    careNeedCode: "Vp - Advanced Cognitive",
    hazardType: "Rotting stairs step & loose side banister",
    rawAddress: "Flat 4B Primrose Court, High Road, BH21 1AF",
    rawKeySafe: "C-2094x (Key inside wooden flowerpot)",
    rawPhone: "07700 900543",
    vulnerabilityBrief: "Resident suffers from severe memory loss and may open the door without authorization or experience wandering confusion.",
    suggestedSlaPriority: "P1"
  },
  {
    id: "scen-2",
    residentName: "Robert 'Bob' Vance",
    careNeed: "High Falls Risk / Double Hip Arthroplasty Support",
    careNeedCode: "Vf - High Fall Vulnerability",
    hazardType: "Slippery green moss pooling on main entrance ramp",
    rawAddress: "12 Meadow Lane, Wimborne, BH21 3QD",
    rawKeySafe: "Box code 8530 on side radiator pipe",
    rawPhone: "01202 884711",
    vulnerabilityBrief: "Using high-stature walker. Unstable gait results in extreme risk of slip or traumatic fractures under wet pooling environment.",
    suggestedSlaPriority: "P2"
  },
  {
    id: "scen-3",
    residentName: "Arthur Pendelton",
    careNeed: "Bariatric Transfer assistance / Independent Care Plan",
    careNeedCode: "Vn - Standard Domestic Risk",
    hazardType: "Loose wall grab-rail in primary wetroom restroom",
    rawAddress: "Beechwood House, Room 12, Wimborne, BH21 4HH",
    rawKeySafe: "Staff only swipe gate (Dial coordinator)",
    rawPhone: "07700 900115",
    vulnerabilityBrief: "Requires auxiliary wall grab rails for transfers. Sudden structural detachment has potential to trigger physical injury.",
    suggestedSlaPriority: "P3"
  }
];

export default function SafeguardingShield() {
  const [activeTab, setActiveTab] = useState<"security" | "gdpr" | "sla">("security");
  
  // Simulator states
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>("scen-1");
  const [simulatePulse, setSimulatePulse] = useState<boolean>(false);

  const selectedScenario = SCENARIOS.find(s => s.id === selectedScenarioId) || SCENARIOS[0];

  const handleScenarioChange = (id: string) => {
    setSimulatePulse(true);
    setSelectedScenarioId(id);
    setTimeout(() => setSimulatePulse(false), 600);
  };

  // Static key features
  const corePoints = [
    {
      icon: <ShieldCheck className="h-6 w-6 text-rose-500" />,
      title: "Enhanced DBS Checked Handymen Only",
      description: "Any operative attending a home visit holds active, validated Enhanced Disclosure and Barring Service clearance, ensuring peace of mind around vulnerable residents."
    },
    {
      icon: <EyeOff className="h-6 w-6 text-amber-500" />,
      title: "Resident Details Safely Escrowed",
      description: "Direct mobile numbers and specific key safe access credentials are held in secure middleware storage. Operatives communicate with care coordinators rather than requesting phone callbacks from residents."
    },
    {
      icon: <Camera className="h-6 w-6 text-indigo-500" />,
      title: "Secure Web-Links & Arrival Verification",
      description: "Visiting traders use single-use, timed secure web pages to coordinate progress and capture job evidence—no local data is ever saved on personal trader laptops or devices."
    },
    {
      icon: <RefreshCw className="h-6 w-6 text-purple-500" />,
      title: "Real-Time Care Team Feedback Loops",
      description: "As soon as a hazard is marked safe and clear, the care office receives time-logged evidence. Your native clinical systems can instantly log and verify completion times."
    }
  ];

  return (
    <section id="safeguarding" className="bg-slate-900 text-white py-20 lg:py-28 relative overflow-hidden font-sans border-t border-slate-950">
      {/* Visual Ambient Globs */}
      <div className="absolute top-[20%] right-0 h-[500px] w-[500px] rounded-full bg-rose-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[10%] left-0 h-[500px] w-[500px] rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
        
        {/* Layout Split: Upper segment */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16">
          
          {/* LEFT COLUMN: INTRO */}
          <div className="lg:col-span-5 text-left flex flex-col justify-center">
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-rose-400">
              SAFEGUARDING & DATA INTEGRITY
            </span>
            <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl leading-[1.15]">
              Military-Grade Security. Bulletproof Privacy.
            </h2>
            <p className="mt-4 text-sm text-slate-300 leading-relaxed">
              At TaskBridge, home safety is not just about tightening a banister—it is about safeguarding the psychological, physical, and personal data environment of everyone we serve. 
            </p>

            <div className="mt-6 rounded-xl bg-slate-950 border border-slate-800 p-4 shrink-0 flex gap-3 text-xs leading-relaxed text-slate-400">
              <ShieldAlert className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-200">100% CQC and GDPR Compliant</strong>: Our system acts as an escrow protection layer, keeping clinical care notes and home security identifiers out of unsecured contractor databases.
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: CORE SUMMARY PILLARS */}
          <div className="lg:col-span-7">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {corePoints.map((pt, idx) => (
                <div 
                  key={idx}
                  className="rounded-2xl border border-slate-800/80 bg-slate-950/70 p-5 hover:border-slate-700 transition-all flex flex-col justify-between"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 border border-slate-800 mb-3">
                    {pt.icon}
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-xs text-slate-100 mb-1 leading-snug">
                      {pt.title}
                    </h3>
                    <p className="font-sans text-[11px] leading-relaxed text-slate-400">
                      {pt.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* ================= COMPLIANCE & SAFETY POLICIES CENTER ================= */}
        <div className="border border-slate-800 bg-slate-950/40 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-sm mb-16 text-left">
          
          {/* Header & Tabs bar */}
          <div className="p-6 sm:p-8 border-b border-slate-800 bg-slate-950/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="font-mono text-[9px] font-bold text-amber-400 uppercase tracking-widest bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded">
                Operational Ledger Protocol
              </span>
              <h3 className="font-display font-black text-xl text-slate-100 mt-2">
                TaskBridge Compliance & SLA Directory
              </h3>
              <p className="font-sans text-xs text-slate-400 mt-0.5">
                Review strict protocols enforced across all contracted care organizations and vetted handymen networks.
              </p>
            </div>

            {/* Interactive Tab switchers */}
            <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 max-w-fit">
              <button
                onClick={() => setActiveTab("security")}
                className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                  activeTab === "security" 
                    ? "bg-slate-800 text-white shadow-sm" 
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Security Standards
              </button>
              <button
                onClick={() => setActiveTab("gdpr")}
                className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                  activeTab === "gdpr" 
                    ? "bg-slate-800 text-white shadow-sm" 
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                GDPR Shield Policies
              </button>
              <button
                onClick={() => setActiveTab("sla")}
                className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                  activeTab === "sla" 
                    ? "bg-slate-800 text-white shadow-sm" 
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Safeguarding SLA Matrix
              </button>
            </div>
          </div>

          {/* Dynamic Content Panels based on tab state */}
          <div className="p-6 sm:p-8">
            {activeTab === "security" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in text-xs leading-relaxed text-slate-300">
                
                <div className="space-y-3 bg-slate-950/60 p-5 rounded-2xl border border-slate-800">
                  <div className="h-8 w-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
                    <Database className="h-4.5 w-4.5" />
                  </div>
                  <h4 className="font-display font-bold text-slate-100 text-sm">Enhanced Vetting Standards</h4>
                  <p className="text-slate-400 text-[11px]">
                    All tradespeople undergoes continuous DBS checking integrated straight to our systems. Every contractor registry is monitored in near-real-time for insurance, licensure, and CQC safeguarding clearance updates.
                  </p>
                  <ul className="space-y-1 text-[11px] text-slate-300 border-t border-slate-800 pt-2 font-mono">
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                      <span>Direct-lookup DBS Status Sync</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                      <span>£5M Public Liability Minimum</span>
                    </li>
                  </ul>
                </div>

                <div className="space-y-3 bg-slate-950/60 p-5 rounded-2xl border border-slate-800">
                  <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                    <Lock className="h-4.5 w-4.5" />
                  </div>
                  <h4 className="font-display font-bold text-slate-100 text-sm">Cryptographic Safeguards</h4>
                  <p className="text-slate-400 text-[11px]">
                    Our infrastructure relies on HIPAA-grade and CQC-compliant servers. Databases are encrypted end-to-end utilizing symmetric AES-256 protocols. Communication operates strictly through TLS 1.3 secured gateway sockets.
                  </p>
                  <ul className="space-y-1 text-[11px] text-slate-300 border-t border-slate-800 pt-2 font-mono">
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                      <span>TLS 1.3 Restructured API Sockets</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                      <span>AES-256 Symmetric Field Encrypts</span>
                    </li>
                  </ul>
                </div>

                <div className="space-y-3 bg-slate-950/60 p-5 rounded-2xl border border-slate-800">
                  <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                    <Database className="h-4.5 w-4.5" />
                  </div>
                  <h4 className="font-display font-bold text-slate-100 text-sm">Automated Audit Ledgers</h4>
                  <p className="text-slate-400 text-[11px]">
                    Every document pull, task approval, and coordination inquiry is committed into an immutable audit trail. Registered auditors can generate standard reports instantly to present to regulatory compliance officers.
                  </p>
                  <ul className="space-y-1 text-[11px] text-slate-300 border-t border-slate-800 pt-2 font-mono">
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                      <span>Tamper-evident crypt hash logs</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                      <span>CQC Inspection CSV Export Ready</span>
                    </li>
                  </ul>
                </div>

              </div>
            )}

            {activeTab === "gdpr" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in text-xs leading-relaxed text-slate-300">
                
                <div className="space-y-3 bg-slate-950/60 p-5 rounded-2xl border border-slate-800">
                  <div className="h-8 w-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                    <UserX className="h-4.5 w-4.5" />
                  </div>
                  <h4 className="font-display font-bold text-slate-100 text-sm">PII Guard & Data Cloaking</h4>
                  <p className="text-slate-400 text-[11px]">
                    TaskBridge replaces the resident's home layout and real catalog name with a single-use routing ticket reference. Operatives only see basic safety instructions—never vulnerable medical files.
                  </p>
                  <ul className="space-y-1 text-[11px] text-slate-300 border-t border-slate-800 pt-2 font-mono">
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                      <span>Vulnerability details masked</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                      <span>Auto-redact real resident names</span>
                    </li>
                  </ul>
                </div>

                <div className="space-y-3 bg-slate-950/60 p-5 rounded-2xl border border-slate-800">
                  <div className="h-8 w-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
                    <ShieldCheck className="h-4.5 w-4.5" />
                  </div>
                  <h4 className="font-display font-bold text-slate-100 text-sm">Transit Communication Proxy</h4>
                  <p className="text-slate-400 text-[11px]">
                    To ensure GDPR safety, handymen communicate to coordinators using anonymized phone masks. Handymen cannot reach vulnerable residents direct or record real phone numbers on personal contacts.
                  </p>
                  <ul className="space-y-1 text-[11px] text-slate-300 border-t border-slate-800 pt-2 font-mono">
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                      <span>Simulated call route escrow</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                      <span>Zero personal data residues</span>
                    </li>
                  </ul>
                </div>

                <div className="space-y-3 bg-slate-950/60 p-5 rounded-2xl border border-slate-800">
                  <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <EyeOff className="h-4.5 w-4.5" />
                  </div>
                  <h4 className="font-display font-bold text-slate-100 text-sm">Ephemeral Key-Safe Vault</h4>
                  <p className="text-slate-400 text-[11px]">
                    Physical security key safe credentials are decryptable only when the handyman check-in is verified at the home coordinate. Access values purge entirely 30 minutes following scheduled finish logs.
                  </p>
                  <ul className="space-y-1 text-[11px] text-slate-300 border-t border-slate-800 pt-2 font-mono">
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                      <span>One-Time dynamic decay URL</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                      <span>GPS-verified unlock sequence</span>
                    </li>
                  </ul>
                </div>

              </div>
            )}

            {activeTab === "sla" && (
              <div className="space-y-6 animate-fade-in font-sans">
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* P1 Section */}
                  <div className="bg-rose-950/20 border border-rose-900/40 p-5 rounded-2xl space-y-2 text-left">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/30 px-2 py-0.5 rounded">
                        SLA P1 (Emergency)
                      </span>
                      <span className="font-display font-extrabold text-sm text-rose-400">2 Hours</span>
                    </div>
                    <h4 className="font-display font-bold text-slate-100 text-sm">Critical Immobility / Slip Hazard</h4>
                    <p className="text-slate-400 text-[11px]">
                      Triggered by immediate dangers to life, collapsed structural access stairs, heavy floor liquid pooling, or critical exit door lockouts.
                    </p>
                    <p className="font-mono text-[9px] text-rose-300/80 pt-1 leading-relaxed">
                      &mdash; Actions: Immediate care office alert, GPS dispatch lock, 15-min callout trigger.
                    </p>
                  </div>

                  {/* P2 Section */}
                  <div className="bg-amber-950/20 border border-amber-900/40 p-5 rounded-2xl space-y-2 text-left">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded">
                        SLA P2 (Urgent)
                      </span>
                      <span className="font-display font-extrabold text-sm text-amber-400">12 Hours</span>
                    </div>
                    <h4 className="font-display font-bold text-slate-100 text-sm">Severe Slippage / Falls Risk</h4>
                    <p className="text-slate-400 text-[11px]">
                      Triggered by unstable main entry handrails, wet moss pooling on outdoor access ramps, or light electrical kitchen socket defaults.
                    </p>
                    <p className="font-mono text-[9px] text-amber-300/80 pt-1 leading-relaxed">
                      &mdash; Actions: Priority technician booking, end-of-shift verify notification.
                    </p>
                  </div>

                  {/* P3 Section */}
                  <div className="bg-blue-950/20 border border-blue-900/40 p-5 rounded-2xl space-y-2 text-left">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold text-blue-400 bg-blue-500/10 border border-blue-500/30 px-2 py-0.5 rounded">
                        SLA P3 (Preventive)
                      </span>
                      <span className="font-display font-extrabold text-sm text-blue-400">24 Hours</span>
                    </div>
                    <h4 className="font-display font-bold text-slate-100 text-sm">Light Maintenance Interventions</h4>
                    <p className="text-slate-400 text-[11px]">
                      Loose auxiliary bath rails, minor door draft adjustments, or standard preventative non-slip safety tape application in dry bathrooms.
                    </p>
                    <p className="font-mono text-[9px] text-blue-300/80 pt-1 leading-relaxed">
                      &mdash; Actions: Standard dispatch sequence, weekly supervisor outcome logs.
                    </p>
                  </div>

                </div>

                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between gap-4 font-mono">
                  <span>Standard compliance rating across active TaskBridge networks:</span>
                  <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">99.4% SLA Target Compliance Met</span>
                </div>

              </div>
            )}

          </div>

        </div>


        {/* ================= INTERACTIVE DYNAMIC SIMULATOR: THE DATA CLOAKING ENGINE ================= */}
        <div className="border border-indigo-900/40 bg-gradient-to-b from-slate-950 to-slate-900/90 rounded-3xl p-6 sm:p-10 shadow-2xl text-left relative overflow-hidden">
          
          <div className="absolute top-0 right-0 h-40 w-40 bg-indigo-500/5 blur-3xl pointer-events-none" />
          
          <div className="max-w-2xl space-y-2 mb-8">
            <span className="inline-flex items-center gap-1.5 font-mono text-[9px] font-bold text-indigo-400 uppercase tracking-widest bg-indigo-500/15 border border-indigo-500/25 px-2.5 py-1 rounded-full">
              <Sparkles className="h-3 w-3" />
              <span>DBS, GDPR & SLA Simulator Sandbox</span>
            </span>
            <h3 className="font-display font-extrabold text-2xl text-white tracking-tight">
              Interactive Compliance & GDPR Shield Simulator
            </h3>
            <p className="font-sans text-xs text-slate-400 leading-relaxed">
              Care leaders can test how the TaskBridge Gateway intercepts data. Select a vulnerable resident scenario to see the raw clinical profile converted to a shredded, safe dispatch docket.
            </p>
          </div>

          {/* Interactive selectors */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
            {SCENARIOS.map((s) => {
              const isSelected = s.id === selectedScenarioId;
              return (
                <button
                  key={s.id}
                  onClick={() => handleScenarioChange(s.id)}
                  className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-slate-900 border-indigo-500/60 shadow-lg ring-1 ring-indigo-500/20"
                      : "bg-slate-950/60 border-slate-800 hover:bg-slate-900 hover:border-slate-700"
                  }`}
                >
                  <p className="font-mono text-[9px] text-indigo-400 uppercase tracking-wider mb-1 font-bold">
                    {s.careNeedCode}
                  </p>
                  <h4 className="font-display font-semibold text-xs text-slate-200 truncate">
                    {s.residentName}
                  </h4>
                  <p className="font-sans text-[10px] text-slate-500 truncate mt-0.5">
                    {s.hazardType}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Data Side-by-Side block */}
          <div className={`grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch transition-opacity duration-300 ${simulatePulse ? "opacity-40" : "opacity-100"}`}>
            
            {/* RAW DATA LEFT */}
            <div className="lg:col-span-5 bg-slate-950 rounded-2xl border border-slate-850 p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 border-b border-slate-900 pb-3 mb-3">
                  <div className="h-2 w-2 rounded-full bg-red-500" />
                  <span className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Vulnerable Case Record (Clinical Data)
                  </span>
                </div>

                <div className="space-y-3.5 text-xs font-sans">
                  <div>
                    <label className="text-[9px] font-mono font-bold text-slate-500 block uppercase">Resident Name</label>
                    <p className="font-bold text-slate-200 mt-0.5">{selectedScenario.residentName}</p>
                  </div>

                  <div>
                    <label className="text-[9px] font-mono font-bold text-slate-500 block uppercase">Support Program & Care Plan</label>
                    <p className="font-medium text-slate-300 mt-0.5">{selectedScenario.careNeed}</p>
                  </div>

                  <div>
                    <label className="text-[9px] font-mono font-bold text-slate-500 block uppercase">Observed Domestic Hazard</label>
                    <p className="text-rose-400 mt-0.5 font-medium">{selectedScenario.hazardType}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[9px] font-mono font-bold text-slate-500 block uppercase">Exact Door Address</label>
                      <p className="text-slate-400 text-[11px] mt-0.5 truncate">{selectedScenario.rawAddress}</p>
                    </div>
                    <div>
                      <label className="text-[9px] font-mono font-bold text-slate-500 block uppercase">Key Safe Code</label>
                      <p className="text-amber-400 font-mono text-[11px] mt-0.5">{selectedScenario.rawKeySafe}</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-[9px] font-mono font-bold text-slate-500 block uppercase">Vulnerability Impact Warning</label>
                    <p className="text-slate-400 text-[11px] mt-0.5 leading-normal">{selectedScenario.vulnerabilityBrief}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-900 flex justify-between text-[10px] text-rose-500/80 font-mono">
                <span>⚠️ Exposed PII Markers Found</span>
                <span>GDPR Violation Risk</span>
              </div>
            </div>

            {/* FLOW INDICATOR / SHIELD BAR */}
            <div className="lg:col-span-2 flex flex-row lg:flex-col items-center justify-center gap-2">
              <div className="h-px w-full bg-gradient-to-r from-red-500/40 to-emerald-500/40 lg:w-px lg:h-16" />
              <div className="h-9 w-9 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0 shadow-lg">
                <Lock className="h-4 w-4" />
              </div>
              <p className="font-mono text-[9px] text-slate-500 uppercase tracking-widest text-center mt-1">Data Escrow</p>
              <div className="h-px w-full bg-gradient-to-r from-red-500/40 to-emerald-500/40 lg:w-px lg:h-16" />
            </div>

            {/* SHIELDED DISPATCH RIGHT */}
            <div className="lg:col-span-5 bg-slate-950/80 rounded-2xl border border-emerald-950/40 p-5 flex flex-col justify-between shadow-2xl relative">
              <div className="absolute inset-0 bg-emerald-500/[0.01] pointer-events-none rounded-2xl" />
              
              <div>
                <div className="flex items-center gap-1.5 border-b border-slate-900 pb-3 mb-3 justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="font-mono text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                      TaskBridge Vetted Escrow Docket
                    </span>
                  </div>
                  <span className="font-mono text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 rounded">
                    Shield Active
                  </span>
                </div>

                <div className="space-y-3.5 text-xs font-sans">
                  <div>
                    <label className="text-[9px] font-mono font-bold text-slate-500 block uppercase">Operative-Facing Resident Identity</label>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <UserX className="h-3.5 w-3.5 text-slate-400" />
                      <p className="font-mono text-emerald-400 font-bold">TB-REF-{(selectedScenario.residentName.charCodeAt(0) * 821).toString()}</p>
                      <span className="text-[9px] font-mono text-slate-500 bg-slate-900 px-1 border border-slate-800 rounded">Fully Redacted</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-[9px] font-mono font-bold text-slate-500 block uppercase">Assigned Safety Intervention</label>
                    <p className="font-semibold text-slate-100 mt-0.5">{selectedScenario.hazardType}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[9px] font-mono font-bold text-slate-500 block uppercase">Secure Location Gateway</label>
                      <div className="flex items-center gap-1 mt-0.5 text-slate-300">
                        <Eye className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        <span className="text-slate-300 truncate">Unlock link locked to GPS</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-[9px] font-mono font-bold text-slate-500 block uppercase">Temporary Key Access</label>
                      <div className="flex items-center gap-1 mt-0.5 text-emerald-400 font-mono font-bold">
                        <Key className="h-3.5 w-3.5" />
                        <span>🔒 Escrow Vault Encrypted</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 border-t border-slate-900 pt-3">
                    <div>
                      <label className="text-[9px] font-mono font-bold text-slate-500 block uppercase">Voice & Communication</label>
                      <p className="text-slate-400 font-mono text-[10px] mt-0.5">Proxy mask: +44 20 8110 3922</p>
                    </div>
                    <div>
                      <label className="text-[9px] font-mono font-bold text-slate-500 block uppercase">Regulatory Dispatch Priority</label>
                      <span className={`inline-flex items-center gap-1 font-mono text-[10px] font-bold mt-1 px-2 py-0.5 rounded leading-none ${
                        selectedScenario.suggestedSlaPriority === "P1" 
                          ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" 
                          : selectedScenario.suggestedSlaPriority === "P2"
                          ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                          : "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                      }`}>
                        <Clock className="h-3 w-3" />
                        <span>
                          {selectedScenario.suggestedSlaPriority} SLA Target: {
                            selectedScenario.suggestedSlaPriority === "P1" ? "2 Hours" : selectedScenario.suggestedSlaPriority === "P2" ? "12 Hours" : "24 Hours"
                          }
                        </span>
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-[9px] font-mono font-bold text-slate-500 block">DOWNTIME THREAD INSTRUCTION FOR OPERATIVE</label>
                    <p className="text-emerald-400/90 text-[10px] italic leading-normal mt-0.5 pr-2">
                       "Do not request callbacks or wait lists. Complete active safety check off, upload before-and-after photograph records, then exit immediate coordinate. Inquire dispatch lead in case of cognitive distress."
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-900 flex justify-between text-[10px] text-emerald-400 font-mono">
                <span>✓ Shield Active & Encoded</span>
                <span>100% GDPR Compliant</span>
              </div>
            </div>

          </div>

          {/* User notice on interactive outputs */}
          <div className="mt-6 pt-6 border-t border-slate-800 text-slate-400 text-xs font-sans flex items-center justify-between gap-4">
            <p>
              TaskBridge utilizes secure web-links automatically generated for handymen. This hides resident phone numbers, key safes, and vulnerability statuses at every step of the repair.
            </p>
            <div className="flex gap-2">
              <a 
                href="#services"
                className="inline-flex items-center gap-1 font-bold text-slate-200 hover:text-white"
              >
                <span>View catalog list</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}

