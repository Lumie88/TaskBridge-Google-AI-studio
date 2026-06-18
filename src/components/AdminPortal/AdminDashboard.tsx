import React from "react";
import {
  ShieldAlert,
  Clock,
  Activity,
  CheckCircle2,
  AlertTriangle,
  XOctagon,
  TrendingUp,
  Award,
  ArrowUpRight,
} from "lucide-react";
import { ServiceTask, HandymanTrader } from "../../types/admin";

interface AdminDashboardProps {
  tasks: ServiceTask[];
  traders: HandymanTrader[];
  onNavigate: (tab: string) => void;
}

export default function AdminDashboard({ tasks, traders, onNavigate }: AdminDashboardProps) {
  // KPI Metrics calculations
  const totalTasksCount = tasks.length;
  const pendingAssignment = tasks.filter((t) => t.status === "Pending Assignment" || t.status === "Triaged").length;
  
  // Vulnerable-adult tasks check awaiting active dbs handyman
  const vulnAdultPendingDBS = tasks.filter(
    (t) => t.safeguardingApplies && t.status === "Pending Assignment"
  ).length;

  const activeVisitsToday = tasks.filter(
    (t) => t.status === "Checked In" || t.status === "Visit Scheduled" || t.status === "Dispatched"
  ).length;

  const awaitingEvidence = tasks.filter((t) => t.status === "Awaiting Evidence Review").length;
  const awaitingCareApproval = tasks.filter((t) => t.status === "Awaiting Care Confirmation").length;
  const failedDispatch = tasks.filter((t) => t.status === "Failed Dispatch" || t.status === "Blocked").length;

  // Find recent hot tasks
  const recentTasks = tasks.slice(0, 4);

  // Status breakdown tallies for simple visualizations
  const statusCounts = tasks.reduce((acc, t) => {
    acc[t.status] = (acc[t.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6 font-sans text-left">
      {/* Welcome & Platform Overview */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden border border-slate-800 shadow-xl">
        <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-gradient-to-l from-rose-500/10 to-transparent pointer-events-none" />
        <div className="max-w-xl space-y-2 relative z-10">
          <span className="font-mono text-[9px] font-bold text-rose-400 uppercase tracking-widest bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded-full">
            TaskBridge Core Console
          </span>
          <h1 className="font-display font-extrabold text-2.5xl sm:text-3xl tracking-tight leading-tight text-white">
            Operational Backoffice Dashboard
          </h1>
          <p className="text-xs text-slate-300 leading-relaxed">
            Monitor and audit security callbacks, evaluate handyman matching parameters, and manage strict Enhanced DBS onboarding workflows inside our sandboxed middleware environment.
          </p>
        </div>
      </div>

      {/* KPI Tally Widgets Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3.5">
        {/* Metric 1 */}
        <div
          onClick={() => onNavigate("tasks")}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:border-rose-400 transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-start">
            <span className="text-slate-400 font-mono text-[9px] uppercase font-bold tracking-wider">
              Pending Matches
            </span>
            <span className="text-rose-500 bg-rose-50 p-1 rounded-lg">
              <Clock className="h-3.5 w-3.5" />
            </span>
          </div>
          <div className="font-display font-extrabold text-2xl text-slate-900 mt-2">
            {pendingAssignment}
          </div>
          <div className="text-slate-500 text-[9px] mt-1 flex items-center gap-1">
            <TrendingUp className="h-3 w-3 text-rose-500" />
            <span>Unassigned queues</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div
          onClick={() => onNavigate("tasks")}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:border-orange-400 transition-all cursor-pointer"
        >
          <div className="flex justify-between items-start">
            <span className="text-slate-400 font-mono text-[9px] uppercase font-bold tracking-wider">
              Safeguard Hold
            </span>
            <span className="text-orange-500 bg-orange-50 p-1 rounded-lg relative">
              <ShieldAlert className="h-3.5 w-3.5" />
              {vulnAdultPendingDBS > 0 && (
                <span className="absolute -top-1 -right-1 h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
              )}
            </span>
          </div>
          <div className="font-display font-extrabold text-2xl text-orange-600 mt-2">
            {vulnAdultPendingDBS}
          </div>
          <div className="text-slate-500 text-[9px] mt-1">Requires Enhanced DBS</div>
        </div>

        {/* Metric 3 */}
        <div
          onClick={() => onNavigate("tasks")}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-400 transition-all cursor-pointer"
        >
          <div className="flex justify-between items-start">
            <span className="text-slate-400 font-mono text-[9px] uppercase font-bold tracking-wider">
              Active Visits
            </span>
            <span className="text-indigo-505 bg-indigo-50 p-1 rounded-lg">
              <Activity className="h-3.5 w-3.5 text-indigo-500" />
            </span>
          </div>
          <div className="font-display font-extrabold text-2xl text-indigo-600 mt-2">
            {activeVisitsToday}
          </div>
          <div className="text-slate-500 text-[9px] mt-1">Active on-site/slas</div>
        </div>

        {/* Metric 4 */}
        <div
          onClick={() => onNavigate("tasks")}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:border-rose-450 transition-all cursor-pointer"
        >
          <div className="flex justify-between items-start">
            <span className="text-slate-400 font-mono text-[9px] uppercase font-bold tracking-wider">
              Audit Review
            </span>
            <span className="text-rose-500 bg-rose-50 p-1 rounded-lg">
              <CheckCircle2 className="h-3.5 w-3.5" />
            </span>
          </div>
          <div className="font-display font-extrabold text-2xl text-rose-550 mt-2">
            {awaitingEvidence}
          </div>
          <div className="text-slate-500 text-[9px] mt-1">Visit photos upload</div>
        </div>

        {/* Metric 5 */}
        <div
          onClick={() => onNavigate("tasks")}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:border-sky-400 transition-all cursor-pointer"
        >
          <div className="flex justify-between items-start">
            <span className="text-slate-400 font-mono text-[9px] uppercase font-bold tracking-wider">
              Care Approvals
            </span>
            <span className="text-sky-557 bg-sky-50 p-1 rounded-lg">
              <Award className="h-3.5 w-3.5 text-sky-600" />
            </span>
          </div>
          <div className="font-display font-extrabold text-2xl text-sky-600 mt-2">
            {awaitingCareApproval}
          </div>
          <div className="text-slate-500 text-[9px] mt-1">Care office ledger link</div>
        </div>

        {/* Metric 6 */}
        <div
          onClick={() => onNavigate("tasks")}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:border-rose-600 transition-all cursor-pointer"
        >
          <div className="flex justify-between items-start">
            <span className="text-slate-400 font-mono text-[9px] uppercase font-bold tracking-wider">
              Dispatch Error
            </span>
            <span className="text-rose-600 bg-rose-100/50 p-1 rounded-lg">
              <XOctagon className="h-3.5 w-3.5" />
            </span>
          </div>
          <div className="font-display font-extrabold text-2xl text-rose-650 mt-2 flex items-center gap-1.5">
            {failedDispatch}
            {failedDispatch > 0 && <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />}
          </div>
          <div className="text-slate-500 text-[9px] mt-1 text-red-600 font-semibold">Integrations block</div>
        </div>
      </div>

      {/* Stats Breakdown and Recent Alert Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Flow Statistics Graphic */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <div>
            <h3 className="font-display font-bold text-sm text-slate-900">Task Flow Throughput Ledger</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Visually tracking live task distributions from care apps into TaskBridge.</p>
          </div>

          <div className="h-44 flex items-end gap-3.5 pt-4 px-2">
            {["Triaged", "Pending", "Review", "Dispatched", "Checked In", "Awaiting Review", "Completed", "Blocked"].map((status, index) => {
              const matchedStatus = tasks.filter((t) => {
                if (status === "Pending") return t.status === "Pending Assignment";
                if (status === "Review") return t.status === "Assignment Review";
                if (status === "Awaiting Review") return t.status === "Awaiting Evidence Review" || t.status === "Awaiting Care Confirmation";
                return t.status.toLowerCase().includes(status.toLowerCase());
              });
              const count = matchedStatus.length;
              const maxCount = Math.max(...[1, 2, 4, 3, 5, 2]);
              const heightPct = count > 0 ? `${Math.min(100, (count / maxCount) * 100)}%` : "6%";

              return (
                <div key={status} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <div className="relative w-full text-center">
                    <span className="text-[10px] font-bold text-slate-700 block">{count}</span>
                  </div>
                  <div
                    style={{ height: heightPct }}
                    className={`w-full rounded-t-lg transition-all duration-500 relative cursor-pointer group ${
                      status === "Completed"
                        ? "bg-emerald-500 hover:bg-emerald-600 shadow-sm shadow-emerald-500/20"
                        : status === "Blocked"
                        ? "bg-rose-500 hover:bg-rose-600 shadow-sm shadow-rose-500/10"
                        : "bg-indigo-500 hover:bg-indigo-600 shadow-sm shadow-indigo-500/10"
                    }`}
                  >
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 bg-slate-900 text-white font-mono text-[9px] px-1.5 py-0.5 rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap mb-1">
                      {status}: {count}
                    </div>
                  </div>
                  <span className="text-[8px] font-mono text-slate-400 font-bold uppercase truncate max-w-full block">
                    {status}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-500 font-sans">
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded bg-indigo-500 inline-block" /> Active Tickets
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded bg-emerald-500 inline-block" /> Completed Records
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded bg-rose-500 inline-block" /> Veto Restrictions
            </span>
          </div>
        </div>

        {/* Right Column: High Risk Alarm Panel */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-display font-bold text-sm text-slate-900">Urgent Backoffice Action Log</h3>
              <p className="text-[10px] text-slate-500 mt-0.5">Tasks requiring manual vetting verification or bypass decisions.</p>
            </div>
          </div>

          <div className="space-y-3">
            {recentTasks.map((task) => (
              <div
                key={task.id}
                className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 flex justify-between items-center gap-3 hover:bg-slate-50/80 transition-colors"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[9px] font-bold text-slate-400">{task.id}</span>
                    <span className="font-bold text-slate-900 text-xs">{task.agencyName}</span>
                  </div>
                  <p className="text-[11px] font-medium text-slate-705 italic line-clamp-1">"{task.summary}"</p>
                  <p className="font-mono text-[8px] text-slate-450 uppercase tracking-wide">
                    Category: {task.category}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <button
                    onClick={() => onNavigate("tasks")}
                    className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-500 hover:text-rose-600 bg-rose-50 px-2 py-1 rounded transition-all"
                  >
                    <span>Inspect</span>
                    <ArrowUpRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}

            {tasks.length === 0 && (
              <div className="py-8 text-center text-slate-400 font-sans text-xs">
                <CheckCircle2 className="h-8 w-8 text-slate-200 mx-auto mb-2" />
                <p>All clean. No high-vulnerability alerts reported.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
