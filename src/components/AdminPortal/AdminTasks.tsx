import React, { useState, useEffect } from "react";
import {
  Filter,
  Search,
  CheckCircle2,
  AlertTriangle,
  X,
  UserCheck,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  PhoneCall,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  Loader2,
  FileText,
  Bookmark,
  Send,
  Plus
} from "lucide-react";
import { ServiceTask, HandymanTrader, Agency } from "../../types/admin";

interface AdminTasksProps {
  tasks: ServiceTask[];
  traders: HandymanTrader[];
  agencies: Agency[];
  onRefresh: () => void;
  currentUser: { id: string; role: string; fullName: string };
  onShowNotification: (msg: string) => void;
}

export default function AdminTasks({
  tasks,
  traders,
  agencies,
  onRefresh,
  currentUser,
  onShowNotification,
}: AdminTasksProps) {
  // Views: "table" | "kanban"
  const [viewMode, setViewMode] = useState<"table" | "kanban">("table");

  // Filters
  const [agencyFilter, setAgencyFilter] = useState("All");
  const [urgencyFilter, setUrgencyFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [safeguardFilter, setSafeguardFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Create Manual Task Modal
  const [createOpen, setCreateOpen] = useState(false);
  const [newResidentName, setNewResidentName] = useState("");
  const [newCareNote, setNewCareNote] = useState("");
  const [newCategory, setNewCategory] = useState("Path Clearing");
  const [newUrgency, setNewUrgency] = useState<"Routine" | "Medium" | "Urgent">("Medium");
  const [newPreferredWindow, setNewPreferredWindow] = useState("Morning (09:00 - 12:00)");
  const [newCarerPresent, setNewCarerPresent] = useState(false);
  const [newAgencyId, setNewAgencyId] = useState("");
  const [creating, setCreating] = useState(false);

  // Detail Drawer Task States
  const [selectedTask, setSelectedTask] = useState<ServiceTask | null>(null);
  const [evaluationCandidates, setEvaluationCandidates] = useState<any[]>([]);
  const [evalLoading, setEvalLoading] = useState(false);
  const [escalateReason, setEscalateReason] = useState("");

  // SMS Twilio simulation states
  const [smsSending, setSmsSending] = useState(false);
  const [simulatedSmsResult, setSimulatedSmsResult] = useState<any>(null);

  // Status List definitions
  const STATUS_LIST: ServiceTask["status"][] = [
    "Triaged",
    "Pending Assignment",
    "Assignment Review",
    "Dispatched",
    "Visit Scheduled",
    "Checked In",
    "Awaiting Evidence Review",
    "Awaiting Care Confirmation",
    "Completed",
    "Blocked",
    "Failed Dispatch"
  ];

  // Fetch handyman candidate evaluation scoring whenever drawer brings up a task
  useEffect(() => {
    if (selectedTask) {
      evaluateCandidatesForTask(selectedTask.id);
    } else {
      setEvaluationCandidates([]);
    }
    // Clean twilio details
    setSimulatedSmsResult(null);
  }, [selectedTask]);

  const evaluateCandidatesForTask = async (taskId: string) => {
    setEvalLoading(true);
    try {
      const res = await fetch("/api/admin/assignment/evaluate-eligibility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId }),
      });
      const data = await res.json();
      setEvaluationCandidates(data);
    } catch (e) {
      console.error(e);
    } finally {
      setEvalLoading(false);
    }
  };

  const handleAssignTrader = async (trader: HandymanTrader) => {
    if (!selectedTask) return;
    try {
      const res = await fetch("/api/admin/tasks/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: selectedTask.id,
          traderId: trader.id,
          actorId: currentUser.id,
          actorRole: currentUser.role,
        }),
      });

      const updated = await res.json();
      if (!res.ok) {
        throw new Error(updated.error || "Trader Match Veto active.");
      }

      setSelectedTask(updated);
      onRefresh();
      onShowNotification(`Trader ${trader.name} scheduled for ${selectedTask.id} securely.`);
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleCreateManualTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const res = await fetch("/api/admin/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          residentFullName: newResidentName,
          originalCareNote: newCareNote,
          category: newCategory,
          urgency: newUrgency,
          preferredWindow: newPreferredWindow,
          carerPresent: newCarerPresent,
          agencyId: newAgencyId || agencies[0]?.agencyId,
        }),
      });

      if (!res.ok) throw new Error("Manual creation failed");

      setCreateOpen(false);
      setNewResidentName("");
      setNewCareNote("");
      onRefresh();
      onShowNotification("Manual Backoffice Task registered safely.");
    } catch (e) {
      console.error(e);
    } finally {
      setCreating(false);
    }
  };

  const handleSendVisitSmsSim = async () => {
    if (!selectedTask) return;
    setSmsSending(true);
    setSimulatedSmsResult(null);

    try {
      const res = await fetch("/api/admin/tasks/send-visit-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: selectedTask.id,
          actorId: currentUser.id,
          actorRole: currentUser.role,
        }),
      });
      const data = await res.json();
      setSimulatedSmsResult(data);
      onShowNotification("Simulated Twilio SMS visit link generated.");
    } catch (e) {
      console.error(e);
    } finally {
      setSmsSending(false);
    }
  };

  const handleApproveEvidenceComplete = async (taskId: string, approval: "APPROVE" | "REJECT") => {
    try {
      const res = await fetch("/api/admin/tasks/verify-evidence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId,
          action: approval,
          remarks: escalateReason,
          actorId: currentUser.id,
          actorRole: currentUser.role,
        }),
      });

      const updated = await res.json();
      setSelectedTask(updated);
      onRefresh();
      onShowNotification(
        approval === "APPROVE"
          ? "Completion audit authorized and reported dynamically for Care CMS."
          : "Work evidence rejected. Dispatch ticket blocked."
      );
      setEscalateReason("");
    } catch (e) {
      console.error(e);
    }
  };

  // Filter Tasks Client side for instant B2B SaaS layout handling
  const filteredTasks = tasks.filter((t) => {
    const matchesAgency = agencyFilter === "All" || t.agencyId === agencyFilter;
    const matchesUrgency = urgencyFilter === "All" || t.urgency === urgencyFilter;
    const matchesStatus = statusFilter === "All" || t.status === statusFilter;
    const matchesSafeguard =
      safeguardFilter === "All" ||
      (safeguardFilter === "vulnerable" ? t.safeguardingApplies : !t.safeguardingApplies);

    const matchesSearch =
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.summary.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesAgency && matchesUrgency && matchesStatus && matchesSafeguard && matchesSearch;
  });

  // Helper for status styling badges
  const getStatusBadge = (status: ServiceTask["status"]) => {
    switch (status) {
      case "Triaged":
        return <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full border border-slate-200">Triaged</span>;
      case "Pending Assignment":
        return <span className="text-[10px] font-bold bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded-full border border-yellow-200 uppercase tracking-wider">Pending Assignment</span>;
      case "Assignment Review":
        return <span className="text-[10px] font-bold bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full border border-purple-200">Matching Audit</span>;
      case "Checked In":
        return <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200 animate-pulse">● Operative On-Site</span>;
      case "Awaiting Evidence Review":
        return <span className="text-[10px] font-bold bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full border border-rose-200 animate-pulse">Evidence Validation</span>;
      case "Awaiting Care Confirmation":
        return <span className="text-[10px] font-bold bg-sky-50 text-sky-700 px-2 py-0.5 rounded-full border border-sky-200">Awaiting Care Office Approve</span>;
      case "Completed":
        return <span className="text-[10px] font-bold bg-green-50 text-green-700 px-2 py-0.5 rounded-full border border-green-200 inline-flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Resolved</span>;
      default:
        return <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 text-left font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display font-extrabold text-2xl text-slate-950 tracking-tight">
            Compliance Dispatch operations Queue
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Real-time management of inbound care files, matching validations, and field proof review.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setCreateOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 text-white font-bold text-xs py-2.5 px-3.5 hover:bg-slate-800 transition-all cursor-pointer shadow-sm hover:shadow"
          >
            <Plus className="h-4 w-4" />
            <span>Create Out of Protocol Task</span>
          </button>
        </div>
      </div>

      {/* Operations Filters Row Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex flex-wrap gap-2.5 items-center">
          {/* Agency Filter */}
          <div className="space-y-0.5 text-left flex-1 min-w-[140px]">
            <label className="text-[9px] font-bold font-mono text-slate-400 uppercase tracking-wider block">CMS Agency Source</label>
            <select
              value={agencyFilter}
              onChange={(e) => setAgencyFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg text-xs py-1.5 px-2 text-slate-800"
            >
              <option value="All">All Vetted Agencies</option>
              {agencies.map((agc) => (
                <option key={agc.agencyId} value={agc.agencyId}>
                  {agc.name}
                </option>
              ))}
            </select>
          </div>

          {/* Urgency Filter */}
          <div className="space-y-0.5 text-left flex-1 min-w-[140px]">
            <label className="text-[9px] font-bold font-mono text-slate-400 uppercase tracking-wider block">Urgency Level</label>
            <select
              value={urgencyFilter}
              onChange={(e) => setUrgencyFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg text-xs py-1.5 px-2 text-slate-800"
            >
              <option value="All">All Priority Ranges</option>
              <option value="Urgent">Urgent priority</option>
              <option value="Medium">Medium priority</option>
              <option value="Routine">Routine standard</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="space-y-0.5 text-left flex-1 min-w-[140px]">
            <label className="text-[9px] font-bold font-mono text-slate-400 uppercase tracking-wider block">Operational Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg text-xs py-1.5 px-2 text-slate-800"
            >
              <option value="All">All Status Steps</option>
              {STATUS_LIST.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Safeguard Applies Toggle */}
          <div className="space-y-0.5 text-left flex-1 min-w-[140px]">
            <label className="text-[9px] font-bold font-mono text-slate-400 uppercase tracking-wider block">Safeguarding Class</label>
            <select
              value={safeguardFilter}
              onChange={(e) => setSafeguardFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg text-xs py-1.5 px-2 text-slate-800"
            >
              <option value="All">All Classifications</option>
              <option value="vulnerable">Enhanced DBS Standard Mandated</option>
              <option value="regular">Standard routing task</option>
            </select>
          </div>

          {/* Search bar */}
          <div className="space-y-0.5 text-left flex-1 min-w-[200px]">
            <label className="text-[9px] font-bold font-mono text-slate-400 uppercase tracking-wider block">Search task content</label>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Find ID, category keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg text-xs py-1.5 pl-8 pr-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400"
              />
            </div>
          </div>
        </div>

        {/* Layout Mode Swapper buttons */}
        <div className="flex justify-between items-center pt-2.5 border-t border-slate-100 text-[11px] text-slate-500">
          <span>
            Matched <strong>{filteredTasks.length}</strong> service files in DB.
          </span>
          <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              onClick={() => setViewMode("table")}
              className={`px-3 py-1 font-semibold rounded text-[10px] ${
                viewMode === "table" ? "bg-white text-slate-900 shadow-sm" : "hover:text-slate-800"
              }`}
            >
              Table View Ledger
            </button>
            <button
              onClick={() => setViewMode("kanban")}
              className={`px-3 py-1 font-semibold rounded text-[10px] ${
                viewMode === "kanban" ? "bg-white text-slate-900 shadow-sm" : "hover:text-slate-800"
              }`}
            >
              Kanban Boards
            </button>
          </div>
        </div>
      </div>

      {/* Main Container Workspace */}
      {viewMode === "table" ? (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-500 font-mono text-[9px] uppercase font-bold tracking-wider">
                <th className="py-3 px-4">Task ID</th>
                <th className="py-3 px-4">CMS Agency Source</th>
                <th className="py-3 px-4">Sanitized Resident</th>
                <th className="py-3 px-4">Category / Purpose</th>
                <th className="py-3 px-4 text-center">Safeguard Class</th>
                <th className="py-3 px-4">SLA Urgency</th>
                <th className="py-3 px-4">Dispatch Status</th>
                <th className="py-3 px-4 text-right">Backoffice Ops</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredTasks.map((task) => (
                <tr key={task.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-400">{task.id}</td>
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-slate-900">{task.agencyName}</span>
                    <span className="text-[10px] text-slate-400 block font-mono">{task.agencyId}</span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-650">
                    <span className="bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded text-[10px] text-slate-700">
                      {task.residentFullNameSafe}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-800">{task.category}</div>
                    <div className="text-[10px] font-sans italic text-slate-450 line-clamp-1">
                      "{task.summary}"
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {task.safeguardingApplies ? (
                      <span className="text-[9px] bg-amber-50 text-amber-700 border border-amber-200 font-mono font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                        🔒 ENHANCED DBS
                      </span>
                    ) : (
                      <span className="text-[9px] bg-slate-50 text-slate-500 font-mono px-2 py-0.5 rounded-full text-center">
                        Standard
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`font-semibold tracking-wide text-[9px] px-2 py-0.5 rounded font-mono ${
                        task.urgency === "Urgent"
                          ? "bg-rose-50 text-rose-700 font-bold border border-rose-100"
                          : task.urgency === "Medium"
                          ? "bg-amber-50 text-amber-700 border border-amber-100"
                          : "bg-slate-50 text-slate-600"
                      }`}
                    >
                      {task.urgency}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">{getStatusBadge(task.status)}</td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setSelectedTask(task)}
                      className="bg-slate-900 hover:bg-slate-800 font-bold font-sans text-[10px] text-white py-1 px-3 rounded-lg transition-all cursor-pointer"
                    >
                      Audit Dispatch
                    </button>
                  </td>
                </tr>
              ))}
              {filteredTasks.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 bg-slate-50/50 text-center font-sans text-slate-400">
                    <AlertTriangle className="h-8 w-8 text-slate-200 mx-auto mb-2" />
                    <p>No task entries match selected filters.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* Kanban Layout Mode */
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 overflow-x-auto pb-4">
          {[
            { title: "Incoming Triage", list: ["Triaged"] },
            { title: "Matching & Vetting Queue", list: ["Pending Assignment", "Assignment Review"] },
            { title: "Active Visits today", list: ["Dispatched", "Visit Scheduled", "Checked In"] },
            { title: "Evidence Verification", list: ["Awaiting Evidence Review", "Awaiting Care Confirmation", "Completed"] },
          ].map((col) => {
            const bucketTasks = filteredTasks.filter((t) => col.list.includes(t.status));

            return (
              <div
                key={col.title}
                className="bg-slate-150/40 border border-slate-250 rounded-2xl p-4.5 min-w-[270px] space-y-3 flex flex-col justify-start"
              >
                <div className="flex justify-between items-center border-b border-slate-200/50 pb-2">
                  <h3 className="font-display font-black text-xs text-slate-900 leading-tight uppercase tracking-wider">
                    {col.title}
                  </h3>
                  <span className="bg-slate-200 text-slate-700 font-mono font-bold text-[10px] px-2 py-0.5 rounded-full">
                    {bucketTasks.length}
                  </span>
                </div>

                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                  {bucketTasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => setSelectedTask(task)}
                      className="bg-white border border-slate-200 rounded-xl p-3.5 hover:shadow transition-all space-y-3 text-left cursor-pointer hover:border-rose-400 group relative"
                    >
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="font-mono text-[9px] font-bold text-slate-400">{task.id}</span>
                          <span
                            className={`font-mono text-[8px] px-1.5 py-0.5 rounded font-extrabold ${
                              task.urgency === "Urgent"
                                  ? "bg-rose-50 text-rose-700"
                                  : task.urgency === "Medium"
                                  ? "bg-amber-50 text-amber-700"
                                  : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {task.urgency}
                          </span>
                        </div>
                        <h4 className="font-semibold text-slate-900 text-xs leading-snug group-hover:text-rose-600">
                          {task.category}
                        </h4>
                        <p className="text-[10px] text-slate-500 font-sans italic line-clamp-1">
                          "{task.summary}"
                        </p>
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-[10px] text-slate-400 font-mono">
                        <span className="font-bold text-slate-500">{task.agencyName}</span>
                        {getStatusBadge(task.status)}
                      </div>
                    </div>
                  ))}

                  {bucketTasks.length === 0 && (
                    <div className="py-12 border-2 border-dashed border-slate-200 rounded-xl text-center text-slate-400 text-[10px] font-sans">
                      Empty Segment
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ================= COMPLEMENTARY MODAL: MANUALLY REGISTRE OUT-OF-PROTOCOL CLIENT TICKET ================= */}
      {createOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden p-6 relative animation-fade-in text-left">
            <button
              onClick={() => setCreateOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="font-display font-extrabold text-lg text-slate-950">
              Create Manual Care Inbound Task
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">
              Add out-of-protocol tasks manually bypassing Care CMS secure webhook tunnels.
            </p>

            <form onSubmit={handleCreateManualTask} className="space-y-4 pt-4 text-xs font-sans">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block tracking-wider">Resident Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g. Jonathan Wild"
                    value={newResidentName}
                    onChange={(e) => setNewResidentName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:ring-1 focus:ring-slate-400 text-slate-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block tracking-wider">CMS Partner Agency</label>
                  <select
                    value={newAgencyId}
                    onChange={(e) => setNewAgencyId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:outline-none text-slate-850"
                  >
                    {agencies.map((a) => (
                      <option key={a.agencyId} value={a.agencyId}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase block tracking-wider">Core Care Note Detail Text</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Paste direct transcripts from frontline staff report..."
                  value={newCareNote}
                  onChange={(e) => setNewCareNote(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:ring-1 focus:ring-slate-400 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block tracking-wider">Vetting Service Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:outline-none text-slate-800"
                  >
                    <option value="Path clearing">Path clearing</option>
                    <option value="Loose rail repair">Loose rail repair</option>
                    <option value="Lock repairs">Lock repairs</option>
                    <option value="Trip hazard removal">Trip hazard removal</option>
                    <option value="Appliance safety checks">Appliance safety checks</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block tracking-wider">SLA Urgency Level</label>
                  <select
                    value={newUrgency}
                    onChange={(e) => setNewUrgency(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:outline-none text-slate-800"
                  >
                    <option value="Urgent">Urgent Priority</option>
                    <option value="Medium">Medium standard</option>
                    <option value="Routine">Routine maintenance</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="font-mono text-[9px] text-rose-500 font-bold bg-rose-50 px-2 py-1 rounded">
                  🛡️ SAFEGUARDING PROTOCOLS WILL AUTO APPLY
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setCreateOpen(false)}
                    className="bg-slate-100 hover:bg-slate-200 font-bold px-4 py-2 rounded-xl text-slate-600 transition-colors"
                  >
                    Dismiss
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="bg-slate-900 hover:bg-slate-800 font-bold px-4 py-2 text-white rounded-xl transition-all shadow cursor-pointer font-sans"
                  >
                    {creating ? "Saving..." : "Save Manual Registry"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= CENTRAL OFFICE OPERATIONS DETAIL DRAWER (SLIDEOVER) ================= */}
      {selectedTask && (
        <div className="fixed inset-y-0 right-0 w-full sm:max-w-xl bg-white border-l border-slate-200 shadow-2xl z-55 flex flex-col justify-between overflow-y-auto animate-slide-in text-left">
          {/* Header */}
          <div className="p-6 bg-slate-900 text-white flex justify-between items-center relative select-none">
            <div className="space-y-1">
              <span className="font-mono text-[9px] text-rose-400 font-bold uppercase tracking-widest bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded-full">
                TaskBridge Dispatch Verification Gateway
              </span>
              <div className="flex items-center gap-2 mt-2">
                <h3 className="font-display font-black text-lg tracking-tight">{selectedTask.id}</h3>
                <span className="text-slate-400 text-xs font-mono">[{selectedTask.agencyName}]</span>
              </div>
            </div>
            <button
              onClick={() => setSelectedTask(null)}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Core Body content */}
          <div className="flex-1 p-6 space-y-6 overflow-y-auto">
            {/* Vetting Warning if safeguarding applies */}
            {selectedTask.safeguardingApplies && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
                <ShieldCheck className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
                <div className="space-y-1 font-sans text-[11px] text-slate-700 leading-normal">
                  <span className="font-black text-slate-900 block">Strict Vetting Hold enabled</span>
                  <p>
                    Vulnerable Adult criteria holds this assignment until matched with an operative with verified <strong className="text-slate-900">Enhanced DBS disclosure</strong> which matches service schedules.
                  </p>
                </div>
              </div>
            )}

            {/* Task Details Info box */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3 font-sans text-xs">
              <div className="flex justify-between items-center pb-2.5 border-b border-slate-150">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Resident safe Profile</span>
                <span className="bg-rose-50 text-rose-700 border border-rose-100 font-mono text-[9px] font-bold px-1.5 py-0.5 rounded">
                  GDPR Isolations Active
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-400 text-[9px] uppercase font-mono block">Sync Initials</span>
                  <p className="font-bold text-slate-800 text-xs mt-0.5">{selectedTask.residentInitials}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[9px] uppercase font-mono block">Encrypted ID Display</span>
                  <p className="font-bold text-slate-800 text-xs mt-0.5">{selectedTask.residentFullNameSafe}</p>
                </div>
              </div>

              <div>
                <span className="text-slate-400 text-[9px] uppercase font-mono block">Original Raw Care Note transcript</span>
                <p className="font-sans text-xs text-slate-700 mt-1 italic font-medium leading-relaxed bg-white border border-slate-200 p-3 rounded-lg">
                  "{selectedTask.originalCareNote}"
                </p>
              </div>

              <div>
                <span className="text-slate-400 text-[9px] uppercase font-mono block">TaskBridge AI Sanitized Summary</span>
                <p className="font-bold text-xs text-slate-900 mt-1 flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5 text-rose-500" />
                  {selectedTask.summary}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <span className="text-slate-400 text-[9px] uppercase font-mono block">Service category</span>
                  <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 rounded text-[10px] uppercase font-mono px-2 py-0.5 font-bold mt-1 inline-block">
                    {selectedTask.category}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[9px] uppercase font-mono block">Time window Preference</span>
                  <p className="font-bold text-slate-800 text-xs mt-1 flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    {selectedTask.preferredWindow}
                  </p>
                </div>
              </div>
            </div>

            {/* ASSIGNMENT ENGINE MATCHES */}
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-slate-150">
                <div>
                  <h4 className="font-display font-bold text-sm text-slate-900">Assignment Vetting Engine</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Scored matching candidates dynamically processed.</p>
                </div>
                {evalLoading && <Loader2 className="h-4 w-4 animate-spin text-rose-500" />}
              </div>

              <div className="space-y-3">
                {evaluationCandidates.map((cand) => {
                  const tr = cand.trader as HandymanTrader;
                  return (
                    <div
                      key={tr.id}
                      className={`p-3.5 rounded-xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all ${
                        cand.eligible
                          ? "bg-white border-slate-200 hover:border-slate-350"
                          : "bg-rose-50/10 border-rose-100/50 opacity-75"
                      }`}
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-xs">{tr.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">[{tr.networkSource}]</span>
                          {cand.eligible ? (
                            <span className="bg-green-105 bg-green-50 text-green-700 font-mono text-[8px] font-bold px-1.5 py-0.5 rounded border border-green-100">
                              ELIGIBLE
                            </span>
                          ) : (
                            <span className="bg-rose-50 text-rose-700 font-mono text-[8px] font-bold px-1.5 py-0.5 rounded border border-rose-100">
                              VETO BLOCKED
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px] text-slate-500 font-sans pt-1">
                          <p>
                            Enhanced DBS:{" "}
                            <strong
                              className={
                                tr.dbsStatus === "completed" ? "text-slate-800" : "text-rose-650"
                              }
                            >
                              {tr.dbsStatus.toUpperCase()} (exp: {tr.dbsExpiryDate || "N/A"})
                            </strong>
                          </p>
                          <p>
                            Liability Insurance:{" "}
                            <strong
                              className={
                                tr.insuranceStatus === "verified" ? "text-slate-850" : "text-rose-650"
                              }
                            >
                              {tr.insuranceStatus.toUpperCase()}
                            </strong>
                          </p>
                          <p>
                            Qualifications:{" "}
                            <strong className="text-slate-805">
                              {tr.qualifications.length > 0 ? "Verified" : "None Registered"}
                            </strong>
                          </p>
                          <p>
                            Hour Rate: <strong className="text-slate-805">£{tr.hourlyRate}/h</strong>
                          </p>
                        </div>

                        {!cand.eligible && (
                          <div className="mt-2 text-[10px] bg-rose-50 text-rose-700 font-semibold p-2 border border-rose-100 rounded-lg flex gap-1.5">
                            <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5 text-rose-500" />
                            <div>
                              <span>Compliance Fail Reasons:</span>
                              <p className="font-normal text-rose-600 mt-0.5">
                                {cand.reasonsBlocked.join(" | ")}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="shrink-0 w-full sm:w-auto text-right">
                        <button
                          disabled={!cand.eligible || selectedTask.status !== "Pending Assignment"}
                          onClick={() => handleAssignTrader(tr)}
                          className={`w-full sm:w-auto font-sans text-[10px] font-bold py-1.5 px-3 rounded-lg transition-all ${
                            cand.eligible && selectedTask.status === "Pending Assignment"
                              ? "bg-slate-900 hover:bg-slate-800 active:scale-95 text-white cursor-pointer shadow-sm"
                              : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                          }`}
                        >
                          Approve and Dispatch
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* TWILIO VISITING SMS ACTIONS */}
            {selectedTask.status === "Visit Scheduled" && (
              <div className="border-t border-slate-100 pt-5 space-y-3 font-sans">
                <div>
                  <h4 className="font-display font-bold text-sm text-slate-900">Twilio SMS Dispatch Centre</h4>
                  <p className="text-[10px] text-slate-500">Send tokenized secured visit link to assigned trader's handset.</p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-0.5 text-xs text-slate-600">
                    <p>
                      Simulating SMS relay to:{" "}
                      <strong className="text-slate-800">{selectedTask.assignedHandymanName}</strong>
                    </p>
                    <span className="text-[10px] font-mono text-slate-400">Tokenized: {selectedTask.token}</span>
                  </div>

                  <button
                    onClick={handleSendVisitSmsSim}
                    disabled={smsSending}
                    className="bg-rose-500 hover:bg-rose-600 font-bold text-white text-[10px] py-2 px-3.5 rounded-lg inline-flex items-center gap-1 transition-all shadow-sm cursor-pointer"
                  >
                    <Send className="h-3.5 w-3.5" />
                    {smsSending ? "Broadcasting..." : "Dispatch Secure Visit SMS"}
                  </button>
                </div>

                {simulatedSmsResult && (
                  <div className="bg-slate-900 text-emerald-400 font-mono text-[10px] p-4 border border-slate-800 rounded-xl space-y-1.5 leading-relaxed relative">
                    <div className="flex justify-between items-center text-slate-450 border-b border-slate-800 pb-1.5 mb-2.5">
                      <span>TWILIO DISPATCH LOG</span>
                      <span className="text-green-400">STATUS: DELIVERED</span>
                    </div>
                    <p>
                      <strong>To:</strong> {simulatedSmsResult.recipientPhone}
                    </p>
                    <p className="text-slate-200">
                      <strong>Text Body:</strong> {simulatedSmsResult.smsText}
                    </p>
                    <div className="pt-2 border-t border-slate-800 flex justify-between tracking-wider text-[8px] text-slate-500 font-bold">
                      <span>SID: {simulatedSmsResult.providerSid}</span>
                      <span>TWILIO NETWORK #55</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* EVIDENCE PHOTOS AND ON-SITE GEOLOCATION AUDITING */}
            {selectedTask.status === "Awaiting Evidence Review" && (
              <div className="border-t border-slate-100 pt-5 space-y-4 font-sans text-xs">
                <div>
                  <h4 className="font-display font-bold text-sm text-slate-950">
                    Operative Field Evidence audit
                  </h4>
                  <p className="text-[10px] text-slate-500">
                    Review and cross check check-in geolocations, before metrics and after photo clearance before releasing.
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3.5">
                  <div className="grid grid-cols-2 gap-3 font-mono text-[10px] text-slate-550">
                    <div>
                      <span>GPS Check-In Location:</span>
                      <p className="font-bold text-slate-800 mt-0.5">51.5014° N, 0.1419° W</p>
                      <span className="text-emerald-600">✓ Matches Residence SW1A</span>
                    </div>
                    <div>
                      <span>Duration on site:</span>
                      <p className="font-bold text-slate-850 mt-0.5">70 minutes verified</p>
                    </div>
                  </div>

                  {/* Photo Previews */}
                  <div className="grid grid-cols-2 gap-3.5">
                    <div>
                      <span className="text-[10px] text-slate-450 block font-mono mb-1">BEFORE CAPTURED EVIDENCE</span>
                      <div className="border border-slate-200 rounded-lg overflow-hidden h-32 w-full bg-slate-100">
                        {selectedTask.beforePhotoUrl ? (
                          <img
                            src={selectedTask.beforePhotoUrl}
                            alt="Before mitigation"
                            referrerPolicy="no-referrer"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex select-none h-full w-full items-center justify-center text-slate-400">
                            No photo
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-450 block font-mono mb-1">AFTER COMPLETION PROOF</span>
                      <div className="border border-slate-200 rounded-lg overflow-hidden h-32 w-full bg-slate-100">
                        {selectedTask.afterPhotoUrl ? (
                          <img
                            src={selectedTask.afterPhotoUrl}
                            alt="After Mitigation"
                            referrerPolicy="no-referrer"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex select-none h-full w-full items-center justify-center text-slate-400">
                            No photo
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-450 block font-mono">Completion Notes:</span>
                    <p className="font-medium text-slate-705 italic bg-white p-3.5 border border-slate-250 rounded-lg mt-1">
                      "{selectedTask.completionNotes}"
                    </p>
                  </div>
                </div>

                {/* Evidence review action queue */}
                <div className="space-y-3 pt-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">
                      Escalation / Back-routing Audit Remarks
                    </label>
                    <input
                      type="text"
                      placeholder="Input feedback reason before flagging issues..."
                      value={escalateReason}
                      onChange={(e) => setEscalateReason(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-3 text-xs"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApproveEvidenceComplete(selectedTask.id, "REJECT")}
                      className="flex-1 bg-rose-50 hover:bg-rose-100 border border-rose-200 font-bold text-rose-700 py-2 rounded-xl transition-all cursor-pointer text-center"
                    >
                      Flag Issues & Back-route
                    </button>
                    <button
                      onClick={() => handleApproveEvidenceComplete(selectedTask.id, "APPROVE")}
                      className="flex-1 bg-slate-900 hover:bg-slate-800 font-bold text-white py-2 rounded-xl transition-all cursor-pointer text-center"
                    >
                      Verify and Complete
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Timeline audit trail logs */}
            <div className="space-y-2 pt-4 border-t border-slate-100 font-sans text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">Audit Timeline Ledger</span>
              <div className="border border-slate-100 rounded-xl divide-y divide-slate-100 bg-slate-50/50">
                {selectedTask.timeline.map((evt, idx) => (
                  <div key={idx} className="p-3 font-sans text-xs flex justify-between gap-3 text-left">
                    <div className="space-y-0.5">
                      <p className="font-bold text-slate-800 text-[11px]">{evt.status}</p>
                      <p className="text-slate-600 text-[11px] font-medium italic">"{evt.note}"</p>
                      {evt.actor && (
                        <span className="text-[10px] text-slate-400 font-mono block">Actor: {evt.actor}</span>
                      )}
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 shrink-0">{evt.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
