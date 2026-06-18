import React, { useState, useEffect } from "react";
import {
  FileCode,
  Globe,
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  Play,
  Terminal,
  ShieldAlert,
  HelpCircle,
  Clock,
  Code,
  Settings,
  Flame,
  Plus
} from "lucide-react";
import { AuditLog, WebhookLog, Agency } from "../../types/admin";

interface AdminLogsProps {
  auditLogs: AuditLog[];
  webhookLogs: WebhookLog[];
  agencies: Agency[];
  onRefresh: () => void;
  onShowNotification: (msg: string) => void;
}

export default function AdminLogs({
  auditLogs,
  webhookLogs,
  agencies,
  onRefresh,
  onShowNotification,
}: AdminLogsProps) {
  const [activeTab, setActiveTab] = useState<"audit" | "webhooks">("audit");
  const [searchQuery, setSearchQuery] = useState("");

  // Simulation Form states
  const [simWebhookType, setSimWebhookType] = useState<"incoming" | "dbs_callback">("incoming");
  
  // Incoming CMS simulation attributes
  const [simAgencyId, setSimAgencyId] = useState("");
  const [simNotes, setSimNotes] = useState("Daughter reported high risk slip hazard: moss on main pathway.");
  const [simCategory, setSimCategory] = useState("Path clearing");
  const [simUrgency, setSimUrgency] = useState("Urgent");
  const [simCarerPresent, setSimCarerPresent] = useState(true);

  // DBS callback simulation attributes
  const [simSessionId, setSimSessionId] = useState("DBS-SESS-7731E");
  const [simDbsOutcome, setSimDbsOutcome] = useState("approved");
  const [simDbsExpiry, setSimDbsExpiry] = useState("2028-09-30");

  const [simulating, setSimulating] = useState(false);
  const [lastSimResponse, setLastSimResponse] = useState<any>(null);

  useEffect(() => {
    if (agencies.length > 0 && !simAgencyId) {
      setSimAgencyId(agencies[0].agencyId);
    }
  }, [agencies]);

  const handleSimulateWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    setSimulating(true);
    setLastSimResponse(null);

    try {
      if (simWebhookType === "incoming") {
        const agency = agencies.find((a) => a.agencyId === simAgencyId) || agencies[0];
        const token = agency ? agency.apiKey : "invalid_token";

        const res = await fetch("/api/webhooks/incoming-care-task", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-agency-token": token,
          },
          body: JSON.stringify({
            agencyId: simAgencyId,
            notes: simNotes,
            category: simCategory,
            urgency: simUrgency,
            preferredWindow: "Morning (09:00 - 12:00)",
            carerOnSite: simCarerPresent,
          }),
        });

        const data = await res.json();
        setLastSimResponse({ status: res.status, body: data });
        onRefresh();
        onShowNotification("Simulated Care CMS REST task ingested successfully.");
      } else {
        // DBS Provider webhook callback simulation
        const res = await fetch("/api/webhooks/dbs-callback", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-taskbridge-witness-hash": "sha256_government_client_ssl_handshake_approved",
          },
          body: JSON.stringify({
            sessionId: simSessionId,
            outcome: simDbsOutcome,
            expiryDate: simDbsExpiry,
            evidenceReference: `GOV-DBS-${Math.floor(1000 + Math.random() * 90000)}`,
          }),
        });

        const data = await res.json();
        setLastSimResponse({ status: res.status, body: data });
        onRefresh();
        onShowNotification("DBS verification webhook callback simulated.");
      }
    } catch (err: any) {
      setLastSimResponse({ error: err.message });
    } finally {
      setSimulating(false);
    }
  };

  // Filter lists based on search
  const filteredAudits = auditLogs.filter((log) => {
    return (
      log.actorRole.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.entityId.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const filteredWebhooks = webhookLogs.filter((log) => {
    return (
      log.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.endpoint.toLowerCase().includes(searchQuery.toLowerCase()) ||
      JSON.stringify(log.payload).toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="space-y-6 text-left font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display font-extrabold text-2xl text-slate-950 tracking-tight">
            Compliance Audit & API Tunnel Center
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Conduct immutable audits, verify REST webhooks logging, and debug integrations using our simulation runners.
          </p>
        </div>

        <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
          <button
            onClick={() => setActiveTab("audit")}
            className={`px-3 py-1.5 font-semibold text-xs rounded-lg transition-all cursor-pointer ${
              activeTab === "audit" ? "bg-white text-slate-900 shadow-sm" : "text-slate-550 hover:text-slate-800"
            }`}
          >
            Security audit ledger
          </button>
          <button
            onClick={() => setActiveTab("webhooks")}
            className={`px-3 py-1.5 font-semibold text-xs rounded-lg transition-all cursor-pointer ${
              activeTab === "webhooks" ? "bg-white text-slate-900 shadow-sm" : "text-slate-550 hover:text-slate-800"
            }`}
          >
            REST API & Webhook Logs
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Simulation Board Panel */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <span className="p-1 text-rose-500 bg-rose-50 rounded-lg">
              <Terminal className="h-4 w-4" />
            </span>
            <h3 className="font-display font-bold text-sm text-slate-900">REST Payload simulator</h3>
          </div>

          <form onSubmit={handleSimulateWebhook} className="space-y-4 text-xs font-sans">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 block uppercase font-mono">Select Integration Tunnel</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSimWebhookType("incoming")}
                  className={`flex-1 font-bold py-1.5 px-2 rounded-lg text-[10px] border transition-all cursor-pointer ${
                    simWebhookType === "incoming"
                      ? "bg-slate-900 text-white border-slate-800"
                      : "bg-slate-50 hover:bg-slate-100 text-slate-650 border-slate-200"
                  }`}
                >
                  CMS Inbound Task
                </button>
                <button
                  type="button"
                  onClick={() => setSimWebhookType("dbs_callback")}
                  className={`flex-1 font-bold py-1.5 px-2 rounded-lg text-[10px] border transition-all cursor-pointer ${
                    simWebhookType === "dbs_callback"
                      ? "bg-slate-900 text-white border-slate-800"
                      : "bg-slate-50 hover:bg-slate-100 text-slate-650 border-slate-200"
                  }`}
                >
                  DBS Partner Callback
                </button>
              </div>
            </div>

            {simWebhookType === "incoming" ? (
              /* CMS incoming simulated fields */
              <div className="space-y-3">
                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-bold text-slate-500 block uppercase">Simulated Client Agency</label>
                  <select
                    value={simAgencyId}
                    onChange={(e) => setSimAgencyId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-2 text-slate-800"
                  >
                    {agencies.map((a) => (
                      <option key={a.agencyId} value={a.agencyId}>
                        {a.name} ({a.status})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-bold text-slate-500 block uppercase">Frontline notes text</label>
                  <input
                    type="text"
                    required
                    value={simNotes}
                    onChange={(e) => setSimNotes(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-2 text-slate-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 text-left">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 block uppercase">Category</label>
                    <select
                      value={simCategory}
                      onChange={(e) => setSimCategory(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1 px-1.5 text-slate-800"
                    >
                      <option value="Path clearing">Path clearing</option>
                      <option value="Loose rail repair">Loose rail repair</option>
                      <option value="Lock repairs">Lock repairs</option>
                      <option value="Trip hazard removal">Trip hazard removal</option>
                      <option value="Appliance safety checks">Appliance safety checks</option>
                    </select>
                  </div>
                  <div className="space-y-1 col-span-1">
                    <label className="text-[10px] font-bold text-slate-500 block uppercase">Urgency</label>
                    <select
                      value={simUrgency}
                      onChange={(e) => setSimUrgency(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1 px-1.5 text-slate-800"
                    >
                      <option value="Urgent">Urgent Priority</option>
                      <option value="Medium">Medium SLA</option>
                      <option value="Routine">Routine standard</option>
                    </select>
                  </div>
                </div>
              </div>
            ) : (
              /* DBS callback fields */
              <div className="space-y-3">
                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-bold text-slate-500 block uppercase">Verification Session Token</label>
                  <input
                    type="text"
                    required
                    value={simSessionId}
                    onChange={(e) => setSimSessionId(e.target.value)}
                    placeholder="Check trader's provider ID"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-2 text-xs font-mono text-slate-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 text-left">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 block uppercase">DBS Outcome</label>
                    <select
                      value={simDbsOutcome}
                      onChange={(e) => setSimDbsOutcome(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-2 text-slate-800"
                    >
                      <option value="approved">Approved & Passed</option>
                      <option value="rejected">Vulnerability Flagged (Fail)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 block uppercase">Expiry Date</label>
                    <input
                      type="date"
                      value={simDbsExpiry}
                      onChange={(e) => setSimDbsExpiry(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1 px-1.5 text-[11px] text-slate-800"
                    />
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={simulating}
              className="w-full bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white font-bold py-2 px-3 rounded-xl transition-all shadow cursor-pointer inline-flex items-center justify-center gap-1"
            >
              <Play className="h-3 w-3 fill-white" />
              <span>{simulating ? "Transmitting package..." : "Broadast Simulated callback"}</span>
            </button>

            {lastSimResponse && (
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <span className="text-[10px] font-bold font-mono text-slate-400 block">CORE SYSTEM RESPONSE ({lastSimResponse.status || "ERR"})</span>
                <pre className="bg-slate-950 text-emerald-400 font-mono text-[9px] p-2.5 rounded-lg border border-slate-850 overflow-x-auto max-h-36">
                  {JSON.stringify(lastSimResponse.body || lastSimResponse, null, 2)}
                </pre>
              </div>
            )}
          </form>
        </div>

        {/* Right Column: Ledger Logs Table */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex gap-2 items-center">
            <Search className="h-4 w-4 text-slate-450 mt-1 shrink-0" />
            <input
              type="text"
              placeholder="Filter logs by keyword, metadata identifiers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl py-2 px-3.5 text-xs text-slate-850 w-full focus:outline-none shadow-sm"
            />
          </div>

          {activeTab === "audit" ? (
            /* Audit ledger logs list */
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden overflow-x-auto">
              <table className="w-full text-left font-sans border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[10px] text-slate-500 font-mono uppercase font-bold py-3.5 px-4 tracking-wider">
                    <th className="py-2.5 px-4">Timestamp</th>
                    <th className="py-2.5 px-4">Actor ID / Role</th>
                    <th className="py-2.5 px-4">Security Action</th>
                    <th className="py-2.5 px-4">Target Model</th>
                    <th className="py-2.5 px-4 text-right">Payload Meta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[11px]">
                  {filteredAudits.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-mono text-slate-400">
                        {log.timestamp.replace("T", " ").substring(0, 19)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 block">{log.actorId}</span>
                        <span className="text-[9px] text-slate-500 font-mono block">{log.actorRole}</span>
                      </td>
                      <td className="py-3 px-4 font-mono text-indigo-700 font-bold tracking-tight">
                        {log.action}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-500">
                        {log.entityType} ({log.entityId})
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-[9px] text-slate-550 max-w-[200px] truncate">
                        {JSON.stringify(log.metadata)}
                      </td>
                    </tr>
                  ))}
                  {filteredAudits.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400">
                        No auditable events logged.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            /* Webhooks logs list */
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden overflow-x-auto">
              <table className="w-full text-left font-sans border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[10px] text-slate-500 font-mono uppercase font-bold py-3 px-4">
                    <th className="py-2.5 px-4">Date Time</th>
                    <th className="py-2.5 px-4">Flow Dir</th>
                    <th className="py-2.5 px-4">Channel Service</th>
                    <th className="py-2.5 px-4">Target Endpoints</th>
                    <th className="py-2.5 px-4 text-center">Outcome Code</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans text-xs">
                  {filteredWebhooks.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-mono text-slate-400">
                        {log.timestamp.replace("T", " ").substring(0, 19)}
                      </td>
                      <td className="py-3 px-4 font-mono uppercase font-bold text-[9px]">
                        {log.direction === "inbound" ? (
                          <span className="text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-105">
                            INBOUND
                          </span>
                        ) : (
                          <span className="text-purple-705 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-150">
                            OUTBOUND
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">{log.service}</td>
                      <td className="py-3 px-4 font-mono text-[10px] text-slate-600 truncate max-w-[180px]" title={log.endpoint}>
                        {log.endpoint}
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold">
                        <span
                          className={`px-1.5 py-0.5 rounded ${
                            log.status >= 200 && log.status < 300
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-rose-50 text-rose-700 font-extrabold"
                          }`}
                        >
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filteredWebhooks.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400">
                        No webhooks communication logged.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
