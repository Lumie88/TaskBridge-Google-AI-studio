import React, { useState } from "react";
import {
  Link,
  ShieldCheck,
  RotateCw,
  UserCheck,
  Plus,
  ArrowRight,
  ShieldAlert,
  Edit,
  Clipboard,
  X,
  Lock,
  Loader2,
  Globe,
  Settings,
  Mail
} from "lucide-react";
import { Agency } from "../../types/admin";

interface AdminAgenciesProps {
  agencies: Agency[];
  onRefresh: () => void;
  currentUser: { id: string; role: string; fullName: string };
  onShowNotification: (msg: string) => void;
}

export default function AdminAgencies({
  agencies,
  onRefresh,
  currentUser,
  onShowNotification,
}: AdminAgenciesProps) {
  const [onboardOpen, setOnboardOpen] = useState(false);
  const [newAgencyName, setNewAgencyName] = useState("");
  const [newContact, setNewContact] = useState("");
  const [newDomain, setNewDomain] = useState("");
  const [newCoordinatorEmail, setNewCoordinatorEmail] = useState("");
  const [newWebhook, setNewWebhook] = useState("");
  const [isManualOnly, setIsManualOnly] = useState(false);
  const [saving, setSaving] = useState(false);
  const [onboardSuccessData, setOnboardSuccessData] = useState<Agency | null>(null);

  // Rotate client key state
  const [rotatingId, setRotatingId] = useState<string | null>(null);
  const [newSecretDisplay, setNewSecretDisplay] = useState<{ id: string; key: string } | null>(null);

  const handleOnboardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/admin/agencies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newAgencyName,
          primaryContact: newContact,
          workEmailDomain: newDomain,
          webhookUrl: isManualOnly ? "None (Manual Assignment Only)" : newWebhook,
          status: "Active",
          coordinatorEmail: newCoordinatorEmail || `coordinator@${newDomain}`
        }),
      });

      if (!res.ok) throw new Error("Onboarding post failed");

      const createdAgency = await res.json();
      setOnboardSuccessData(createdAgency);

      setOnboardOpen(false);
      setNewAgencyName("");
      setNewContact("");
      setNewDomain("");
      setNewCoordinatorEmail("");
      setNewWebhook("");
      setIsManualOnly(false);
      onRefresh();
      onShowNotification("Standard Care agency workspace registered. Welcome email dispatched.");
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleRotateKey = async (agencyId: string) => {
    if (currentUser.role !== "Super Admin") {
      alert("Unauthorized command. Only Super Admin operators can rotate API Secrets.");
      return;
    }

    setRotatingId(agencyId);
    try {
      const res = await fetch(`/api/admin/agencies/${agencyId}/rotate-key`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      onRefresh();
      setNewSecretDisplay({ id: agencyId, key: data.newKey });
      onShowNotification("API Access Token rotated and registered safely.");
    } catch (e) {
      console.error(e);
    } finally {
      setRotatingId(null);
    }
  };

  const handleToggleAgencyStatus = async (agencyId: string, currentStatus: "Active" | "Suspended") => {
    if (currentUser.role !== "Super Admin") {
      alert("Command restricted to Super Admin.");
      return;
    }

    const nextStatus = currentStatus === "Active" ? "Suspended" : "Active";
    try {
      const res = await fetch(`/api/admin/agencies/${agencyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      onRefresh();
      onShowNotification(`Workspace state updated successfully: ${nextStatus}`);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    onShowNotification("Token copied to dashboard buffer.");
  };

  return (
    <div className="space-y-6 text-left font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display font-extrabold text-2xl text-slate-950 tracking-tight">
            Integrated Care Agencies Console
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Supervise external care providers, define webhook subscription links, and administer API Access Tokens.
          </p>
        </div>

        {currentUser.role === "Super Admin" && (
          <button
            onClick={() => setOnboardOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 text-white font-bold text-xs py-2.5 px-3.5 hover:bg-slate-800 transition-all cursor-pointer shadow-sm hover:shadow"
          >
            <Plus className="h-4 w-4" />
            <span>Onboard Care Client</span>
          </button>
        )}
      </div>

      {/* Grid of registered workspaces */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {agencies.map((agency) => {
          const isSuspended = agency.status === "Suspended";

          return (
            <div
              key={agency.agencyId}
              className={`bg-white border rounded-2xl p-5 shadow-sm flex flex-col justify-between transition-all ${
                isSuspended ? "border-slate-250 bg-slate-50/50 opacity-65" : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="space-y-3">
                {/* Header info */}
                <div className="flex justify-between items-start gap-4 pb-2 border-b border-slate-100">
                  <div className="space-y-0.5">
                    <span className="font-mono text-[9px] font-bold text-slate-400 block">{agency.agencyId}</span>
                    <h3 className="font-bold text-slate-900 text-sm leading-tight">{agency.name}</h3>
                    <p className="text-[10px] text-slate-500 font-medium font-mono">{agency.workEmailDomain}</p>
                  </div>

                  <span
                    className={`font-sans text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      isSuspended
                        ? "bg-rose-50 text-rose-700 border border-rose-100"
                        : "bg-green-50 text-green-700 border border-green-100"
                    }`}
                  >
                    {agency.status}
                  </span>
                </div>

                {/* Webhook and Domain details */}
                <div className="space-y-2 text-xs">
                  <div className="space-y-0.5">
                    <span className="text-slate-400 text-[9px] font-mono uppercase block">Primary Clinical Coordinator</span>
                    <p className="font-bold text-slate-800 text-xs">{agency.primaryContact}</p>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-slate-400 text-[9px] font-mono uppercase block">CARE CMS WEBHOOK CALLBACK ADDRESS</span>
                    {agency.webhookUrl && agency.webhookUrl.startsWith("http") ? (
                      <p className="font-mono text-[10px] text-emerald-600 bg-emerald-50/40 p-2 border border-emerald-150 rounded-lg select-all truncate flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span>{agency.webhookUrl}</span>
                      </p>
                    ) : (
                      <p className="font-sans text-[10px] text-amber-700 bg-amber-50/50 p-2 border border-amber-100 rounded-lg select-none truncate flex items-center gap-1.5 font-bold">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                        <span>Manual Assignment Mode (No Webhook / API Integration)</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* API Key management segment */}
                <div className="bg-slate-50 border border-slate-150 rounded-xl p-3.5 space-y-2 font-mono text-[10px]">
                  <div className="flex justify-between items-center text-slate-500 pb-1 border-b border-slate-200">
                    <span className="font-bold text-[9px] uppercase tracking-wider">WORKSPACE INTEGRATION SECRET</span>
                    <span className="text-slate-400 font-bold">SHA-256</span>
                  </div>

                  <div className="flex justify-between items-center gap-2">
                    <span className="text-slate-700 select-all truncate font-mono">
                      {agency.apiKey ? `${agency.apiKey.substring(0, 15)}...•••••••` : "Unassigned Token"}
                    </span>

                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={() => handleCopy(agency.apiKey)}
                        className="bg-white hover:bg-slate-100 p-1 border border-slate-200 rounded text-slate-600 cursor-pointer"
                        title="Copy Key text"
                      >
                        <Clipboard className="h-3.5 w-3.5" />
                      </button>

                      {currentUser.role === "Super Admin" && (
                        <button
                          disabled={rotatingId === agency.agencyId}
                          onClick={() => handleRotateKey(agency.agencyId)}
                          className="bg-white hover:bg-slate-100 px-1.5 py-1 border border-slate-200 rounded text-rose-600 flex items-center gap-1 cursor-pointer"
                          title="Rotate Secret key"
                        >
                          <RotateCw
                            className={`h-3.5 w-3.5 ${rotatingId === agency.agencyId ? "animate-spin" : ""}`}
                          />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Suspension Actions row */}
              {currentUser.role === "Super Admin" && (
                <div className="pt-3 border-t border-slate-100 flex gap-2">
                  <button
                    onClick={() => handleToggleAgencyStatus(agency.agencyId, agency.status)}
                    className={`w-full font-bold text-[10px] py-1.5 rounded-lg border text-center transition-all cursor-pointer ${
                      isSuspended
                        ? "bg-slate-900 border-slate-800 text-white"
                        : "bg-rose-50 border-rose-150 hover:bg-rose-100 text-rose-700"
                    }`}
                  >
                    {isSuspended ? "Activate Agency Integration" : "Suspend API credentials Workspace"}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Rotate Key display modal popup */}
      {newSecretDisplay && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 text-white border border-slate-800 rounded-3xl shadow-2xl max-w-md w-full p-6 text-left relative overflow-hidden space-y-4 font-mono text-xs">
            <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-gradient-to-l from-emerald-500/5 to-transparent pointer-events-none" />

            <div className="flex justify-between items-center text-slate-400 pb-2 border-b border-slate-800">
              <span className="font-bold text-[9px] uppercase tracking-wider text-emerald-400 font-mono">
                CRITICAL SECRET REVEALED
              </span>
              <button onClick={() => setNewSecretDisplay(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-1.5">
              <p className="text-xs text-slate-300">
                A new API Token key has been generated in core vault. Write this secret down now:
              </p>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 flex justify-between items-center gap-2">
                <span className="text-emerald-400 font-bold select-all break-all">{newSecretDisplay.key}</span>
                <button
                  onClick={() => handleCopy(newSecretDisplay.key)}
                  className="bg-slate-900 hover:bg-slate-850 p-1.5 border border-slate-800 rounded text-slate-300"
                >
                  <Clipboard className="h-3.5 w-3.5" />
                </button>
              </div>
              <p className="text-[10px] text-red-400">
                ⚠️ Security directive: You will not be able to retrieval this raw text value again.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-800 text-right">
              <button
                onClick={() => setNewSecretDisplay(null)}
                className="bg-white hover:bg-slate-100 text-slate-900 font-bold font-sans text-[11px] px-3.5 py-1.5 rounded-lg"
              >
                Acknowledged
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Onboarding Credentials & Dispatched Email Success Modal */}
      {onboardSuccessData && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-xl w-full text-left overflow-hidden font-sans flex flex-col my-8">
            {/* Header */}
            <div className="p-6 bg-slate-900 text-white flex justify-between items-center relative overflow-hidden">
              <div className="absolute top-0 right-0 h-32 w-32 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="space-y-1 relative z-10">
                <span className="font-mono text-[9px] font-bold text-amber-400 tracking-wider bg-amber-400/10 border border-amber-400/20 px-2.5 py-0.5 rounded-full uppercase">
                  Onboarding Complete ⚡
                </span>
                <h3 className="font-display font-black text-lg text-white">Care Client Workspace Initialized</h3>
              </div>
              <button 
                onClick={() => setOnboardSuccessData(null)} 
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
              {/* Generated Workspace Credentials Grid */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Generated Workspace Credentials</h4>
                
                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 border border-slate-200/60 rounded-2xl">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-400">Care Agency ID</span>
                    <p className="font-bold font-mono text-xs text-slate-800">{onboardSuccessData.agencyId}</p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-400">Workspace Domain</span>
                    <p className="font-bold text-xs text-slate-700">{onboardSuccessData.workEmailDomain}</p>
                  </div>
                  <div className="col-span-2 border-t border-slate-150 pt-2 space-y-0.5">
                    <span className="text-[10px] text-slate-400">Lead Coordinator Email</span>
                    <p className="font-bold text-xs text-slate-800 font-mono select-all">
                      {onboardSuccessData.coordinatorEmail || `coordinator@${onboardSuccessData.workEmailDomain}`}
                    </p>
                  </div>
                  <div className="col-span-2 border-t border-slate-150 pt-2 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-amber-700 font-bold">Autogenerated Temp Password</span>
                      <span className="text-[9px] bg-amber-500/10 text-amber-700 border border-amber-500/20 px-1.5 py-0.5 rounded font-bold">Change Req at 1st Login</span>
                    </div>
                    <div className="bg-amber-50 border border-amber-100 p-2.5 rounded-xl flex items-center justify-between mt-1">
                      <code className="text-xs font-bold text-amber-900 select-all font-mono">
                        {onboardSuccessData.tempPassword}
                      </code>
                      <button
                        onClick={() => handleCopy(onboardSuccessData.tempPassword || "")}
                        className="p-1 rounded bg-amber-100 hover:bg-amber-200 text-amber-800 transition-colors"
                        title="Copy password"
                      >
                        <Clipboard className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="col-span-2 border-t border-slate-150 pt-2 space-y-0.5">
                    <span className="text-[10px] text-slate-400">API Access Token Key</span>
                    <p className="font-mono text-[10px] bg-slate-950 text-emerald-400 p-2 border border-slate-800 rounded-xl select-all break-all leading-normal mt-1 flex justify-between items-center gap-2">
                      <span>{onboardSuccessData.apiKey}</span>
                      <button
                        onClick={() => handleCopy(onboardSuccessData.apiKey)}
                        className="shrink-0 p-1 rounded bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-white"
                      >
                        <Clipboard className="h-3.5 w-3.5" />
                      </button>
                    </p>
                  </div>
                </div>
              </div>

              {/* Simulated Dispatched Welcomer Email Panel */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">✉️ TaskBridge Dispatched Email Notification</h4>
                  <span className="text-[9px] bg-green-50 text-green-700 border border-green-200/60 font-bold px-2 py-0.5 rounded-full flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span>
                    <span>Delivered Outbox</span>
                  </span>
                </div>

                <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col font-sans">
                  {/* Mail metadata header */}
                  <div className="bg-slate-50 p-3.5 border-b border-slate-200 text-xs font-sans space-y-1.5 text-slate-600">
                    <div className="flex gap-2">
                      <span className="font-bold text-slate-400 w-12 text-right">From:</span>
                      <span className="font-bold text-slate-850">system-portal@taskbridge.org</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="font-bold text-slate-400 w-12 text-right">To:</span>
                      <span className="font-bold font-mono text-indigo-700">
                        {onboardSuccessData.coordinatorEmail || `coordinator@${onboardSuccessData.workEmailDomain}`}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <span className="font-bold text-slate-400 w-12 text-right">Subject:</span>
                      <span className="font-bold text-slate-900">TaskBridge B2B Coordinator Middleware: Security Credentials & Onboarding Welcome</span>
                    </div>
                  </div>

                  {/* Mail content body */}
                  <div className="p-5 font-sans text-[11px] text-slate-700 leading-relaxed space-y-3 bg-white">
                    <p className="font-bold text-slate-900 text-xs">Dear {onboardSuccessData.primaryContact},</p>
                    <p>
                      Your domiciliary care agency workspace <strong>"{onboardSuccessData.name}"</strong> has been successfully authorized and integrated into the TaskBridge Domestic Safety operational Gateway node.
                    </p>
                    <p>
                      We have generated your secure, direct administrator access profile to the online Care Coordinator Portal. You can use these credentials to log in, review automated resident care log summaries, and dispatch on-site handyman contractors instantly.
                    </p>
                    <div className="bg-indigo-50/50 border border-indigo-100 p-3.5 rounded-xl space-y-1">
                      <p className="font-bold text-indigo-950 font-sans text-xs">🔑 COORDINATOR LOGIN PROTOCOLS:</p>
                      <ul className="list-disc pl-4 space-y-1 text-[11px] text-indigo-900">
                        <li><strong>Portal URL Link:</strong> <code className="font-bold bg-indigo-100/50 p-0.5 rounded text-indigo-950">http://taskbridge.org/#portal</code></li>
                        <li><strong>Authorized Email ID:</strong> <code className="font-bold bg-indigo-100/50 p-0.5 rounded text-indigo-950">{onboardSuccessData.coordinatorEmail || `coordinator@${onboardSuccessData.workEmailDomain}`}</code></li>
                        <li>
                          <strong>Temporary Security Password:</strong> <code className="font-bold bg-amber-100 text-amber-900 px-1 py-0.5 rounded font-mono border border-amber-200">{onboardSuccessData.tempPassword}</code>
                        </li>
                      </ul>
                    </div>
                    <p className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-[10.5px] text-amber-900 font-medium leading-normal flex items-start gap-2">
                      <Lock className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                      <span>
                        <strong>CRITICAL DPA SAFETY PROTOCOL REQUIREMENT:</strong> This temporary security password must be changed immediately upon your very first login. You will be automatically redirected to a custom security password update panel on first portal submission to verify and establish your own private credentials.
                      </span>
                    </p>
                    <div className="border-t border-slate-150 pt-3 text-[10px] text-slate-400 font-mono">
                      <p>Sincerely,</p>
                      <p className="font-bold text-slate-500">Security & Provisioning Operations | TaskBridge B2B Gateway Node</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 bg-slate-50 border-t border-slate-150 flex justify-end">
              <button
                onClick={() => setOnboardSuccessData(null)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2.5 px-5 rounded-xl shadow cursor-pointer font-sans"
              >
                Acknowledged & Saved
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= COMPLEMENTARY MODAL: MANUALLY ONBOARD NEW CARE CLIENT/AGENCY ================= */}
      {onboardOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleOnboardSubmit}
            className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden p-6 relative animation-fade-in text-left space-y-4"
          >
            <button
              type="button"
              onClick={() => setOnboardOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="font-display font-black text-slate-950 text-base">Onboard New Care Partner Company</h3>
            <p className="text-[11px] text-slate-500 font-sans">
              Enter Clinical/Provider attributes. TaskBridge will generate a secure API Key token immediately upon saving.
            </p>

            <div className="space-y-3 font-sans text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 block uppercase">Agency Title name</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g. Primrose Regional North"
                    value={newAgencyName}
                    onChange={(e) => setNewAgencyName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 focus:outline-none focus:ring-1 focus:ring-slate-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 block uppercase">Work Domain (.com / .uk)</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g. primrose.uk"
                    value={newDomain}
                    onChange={(e) => setNewDomain(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 block uppercase">Lead Primary Contact (Cordinators)</label>
                <input
                  type="text"
                  required
                  placeholder="E.g. Sarah Jenkins & Regional leads"
                  value={newContact}
                  onChange={(e) => setNewContact(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-slate-500 block uppercase">Lead Coordinator Email</label>
                  {newDomain && (
                    <button 
                      type="button"
                      onClick={() => {
                        const namePart = newContact.split(" ")[0].toLowerCase() || "coordinator";
                        setNewCoordinatorEmail(`${namePart}@${newDomain.trim()}`);
                      }}
                      className="text-[9px] text-indigo-600 hover:underline font-mono"
                    >
                      Prefill format
                    </button>
                  )}
                </div>
                <input
                  type="email"
                  required
                  placeholder="E.g. sarah.jenkins@primrose.org"
                  value={newCoordinatorEmail}
                  onChange={(e) => setNewCoordinatorEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 focus:outline-none"
                />
              </div>

              <div className="bg-slate-50 border border-slate-200/60 p-3 rounded-xl space-y-2">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isManualOnly}
                    onChange={(e) => {
                      setIsManualOnly(e.target.checked);
                      if (e.target.checked) {
                        setNewWebhook("");
                      }
                    }}
                    className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">No API Webhook Integration</span>
                    <span className="text-[10px] text-slate-500">Enable offline / manual task allocation only</span>
                  </div>
                </label>
              </div>

              {!isManualOnly ? (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 block uppercase">Incoming completion webhook endpoint</label>
                  <input
                    type="url"
                    required
                    placeholder="E.g. https://domain.org/webhooks/reception"
                    value={newWebhook}
                    onChange={(e) => setNewWebhook(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 focus:outline-none"
                  />
                </div>
              ) : (
                <div className="p-3 bg-amber-50/70 border border-amber-100 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold text-amber-800 uppercase block">Manual Assignment Activated</span>
                  <p className="text-[10px] text-amber-700 leading-normal">
                    This agency won't receive automatic JSON status webhooks. TaskBridge admin and care coordinators will supervise, match, and resolve safety tasks fully inside the internal dashboards.
                  </p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2 text-xs font-sans">
              <button
                type="button"
                onClick={() => setOnboardOpen(false)}
                className="bg-slate-100 hover:bg-slate-200 font-bold px-4 py-2 rounded-xl text-slate-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="bg-slate-900 hover:bg-slate-800 font-bold px-4 py-2 rounded-xl text-white shadow"
              >
                {saving ? "Registering..." : "Provision Agency API access"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
