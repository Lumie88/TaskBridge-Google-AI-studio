import React, { useState } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  UserPlus,
  ArrowRight,
  Sparkles,
  Search,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  RefreshCw,
  Clock,
  Loader2,
  Lock,
  Edit2,
  X
} from "lucide-react";
import { HandymanTrader } from "../../types/admin";

interface AdminTradersProps {
  traders: HandymanTrader[];
  onRefresh: () => void;
  currentUser: { id: string; role: string; fullName: string };
  onShowNotification: (msg: string) => void;
}

export default function AdminTraders({
  traders,
  onRefresh,
  currentUser,
  onShowNotification,
}: AdminTradersProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Manual DBS Override modal states
  const [overrideTrader, setOverrideTrader] = useState<HandymanTrader | null>(null);
  const [overrideStatus, setOverrideStatus] = useState<"completed" | "failed" | "expired">("completed");
  const [overrideExpiry, setOverrideExpiry] = useState("2028-06-17");

  const handleTriggerDbsCheck = async (traderId: string) => {
    setActionLoadingId(traderId);
    try {
      const res = await fetch("/api/admin/traders/trigger-dbs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          traderId,
          actorId: currentUser.id,
          actorRole: currentUser.role,
        }),
      });

      if (!res.ok) throw new Error("Could not propagate inquiry");

      onRefresh();
      onShowNotification("Verification broadcast processed successfully.");
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleSaveManualOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideTrader) return;

    try {
      const res = await fetch("/api/admin/traders/manual-dbs-override", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          traderId: overrideTrader.id,
          status: overrideStatus,
          expiryDate: overrideExpiry,
          actorId: currentUser.id,
          actorRole: currentUser.role,
        }),
      });

      if (!res.ok) throw new Error("Override failed");

      setOverrideTrader(null);
      onRefresh();
      onShowNotification(`Enhanced DBS overridden manually for ${overrideTrader.name}.`);
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleSuspension = async (traderId: string, currentStatus: "Active" | "Suspended") => {
    const nextStatus = currentStatus === "Active" ? "Suspended" : "Active";
    try {
      const res = await fetch("/api/admin/traders/suspend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          traderId,
          status: nextStatus,
          actorId: currentUser.id,
          actorRole: currentUser.role,
        }),
      });

      onRefresh();
      onShowNotification(`Trader registration altered status: ${nextStatus}`);
    } catch (e) {
      console.error(e);
    }
  };

  // Filter list
  const filteredTraders = traders.filter((t) => {
    const mathQuery =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.networkSource.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.serviceCategories.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()));
    return mathQuery;
  });

  return (
    <div className="space-y-6 text-left font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display font-extrabold text-2xl text-slate-950 tracking-tight">
            Private Trade-network Register
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Conduct vetting operations on our integrated home safety operative databases. Verify Enhanced DBS, insurance, and compliance status.
          </p>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search name, network source, skillsets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl py-2 px-3.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400 w-full sm:w-64 shadow-sm"
          />
        </div>
      </div>

      {/* Trader Directory Cards list */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredTraders.map((trader) => {
          const isDbsActive = trader.dbsStatus === "completed";
          const isInsured = trader.insuranceStatus === "verified";
          const isSuspended = trader.status === "Suspended";

          return (
            <div
              key={trader.id}
              className={`bg-white border rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between transition-all ${
                isSuspended
                  ? "border-slate-250 bg-slate-50/50 opacity-65"
                  : isDbsActive && isInsured
                  ? "border-slate-200 hover:border-slate-300"
                  : "border-orange-200 hover:border-orange-350 bg-orange-50/10"
              }`}
            >
              <div className="space-y-2.5">
                {/* Header Row */}
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-0.5">
                    <span className="font-mono text-[9px] font-bold text-slate-400 block">{trader.id}</span>
                    <h3 className="font-bold text-slate-900 text-sm leading-tight">{trader.name}</h3>
                    <p className="text-[10px] text-slate-500 font-medium">Network: {trader.networkSource}</p>
                  </div>

                  <span
                    className={`font-mono text-[9px] font-bold px-2 py-0.5 rounded ${
                      isSuspended
                        ? "bg-slate-250 text-slate-600"
                        : "bg-indigo-50 text-indigo-750"
                    }`}
                  >
                    {trader.status}
                  </span>
                </div>

                {/* Rating & Capabilities */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <div className="flex justify-between text-[11px] text-slate-600">
                    <span>Performance Rating:</span>
                    <strong className="text-slate-900">★ {trader.qualityScore} / 5.0</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-mono">Approved Service Classes:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {trader.serviceCategories.map((c) => (
                        <span key={c} className="bg-slate-100 text-slate-700 text-[10px] px-1.5 py-0.5 rounded">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* DBS & Insurance Checklist badges */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2 text-[11px] leading-relaxed">
                  {/* DBS check */}
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Enhanced DBS Check:</span>
                    {trader.dbsStatus === "completed" ? (
                      <span className="text-[10px] text-green-700 border border-green-100 bg-green-50 font-bold px-1.5 py-0.5 rounded inline-flex items-center gap-1">
                        <ShieldCheck className="h-3.5 w-3.5" /> Checked (exp: {trader.dbsExpiryDate})
                      </span>
                    ) : trader.dbsStatus === "pending" ? (
                      <span className="text-[10px] text-yellow-650 font-bold px-1.5 py-0.5 rounded inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 animate-spin" /> Pending Hook
                      </span>
                    ) : (
                      <span className="text-[10px] text-rose-700 border border-rose-100 bg-rose-50 font-bold px-1.5 py-0.5 rounded inline-flex items-center gap-1">
                        <ShieldAlert className="h-3.5 w-3.5" /> {trader.dbsStatus.toUpperCase()}
                      </span>
                    )}
                  </div>

                  {/* Public Liability insurance check */}
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Liability Insurance:</span>
                    {trader.insuranceStatus === "verified" ? (
                      <span className="text-[10px] text-slate-800 font-bold font-mono">
                        Valid (exp: {trader.insuranceExpiryDate})
                      </span>
                    ) : (
                      <span className="text-[10px] text-rose-700 border border-rose-150 bg-rose-50 font-bold px-1.5 py-0.5 rounded">
                        Expired / Blocked
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action row buttons */}
              <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                <div className="flex gap-2">
                  <button
                    disabled={actionLoadingId === trader.id}
                    onClick={() => handleTriggerDbsCheck(trader.id)}
                    className="flex-1 bg-slate-900 border border-slate-800 text-white font-bold text-[10px] py-1.5 rounded-lg text-center transition-all cursor-pointer hover:bg-slate-800 disabled:bg-slate-300"
                  >
                    {actionLoadingId === trader.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin mx-auto text-slate-500" />
                    ) : trader.dbsStatus === "completed" ? (
                      "Rotate check"
                    ) : (
                      "Start Enhanced DBS check"
                    )}
                  </button>

                  <button
                    onClick={() => handleToggleSuspension(trader.id, trader.status)}
                    className="border border-slate-200 text-slate-700 font-bold text-[10px] px-3.5 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    {isSuspended ? "Activate" : "Suspend"}
                  </button>
                </div>

                {/* Super admin override capability */}
                {currentUser.role === "Super Admin" && (
                  <button
                    onClick={() => setOverrideTrader(trader)}
                    className="w-full bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-150 font-bold text-[10px] py-1 rounded-lg inline-flex items-center justify-center gap-1 transition-all"
                  >
                    <Lock className="h-3 w-3" />
                    <span>Super Admin DBS Bypass</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ================= COMPLEMENTARY MODAL: SUPER ADMIN DBS OVERRIDE GAUGE ================= */}
      {overrideTrader && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveManualOverride}
            className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden p-6 relative animation-fade-in text-left space-y-4"
          >
            <button
              type="button"
              onClick={() => setOverrideTrader(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="font-display font-black text-slate-900 text-base inline-flex items-center gap-2">
              <Lock className="h-4 w-4 text-rose-500" />
              <span>Super Admin DBS Override Manual</span>
            </h3>
            <p className="text-[11px] text-slate-500 font-sans">
              Alter verification outcome records in TaskBridge database for handyman operative{" "}
              <strong>{overrideTrader.name}</strong>. This record bypasses government API handshakes.
            </p>

            <div className="space-y-3 font-sans text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Enhanced DBS State</label>
                <select
                  value={overrideStatus}
                  onChange={(e: any) => setOverrideStatus(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 focus:outline-none"
                >
                  <option value="completed">Completed / Approved disclosure</option>
                  <option value="failed">Failed check / High danger flag</option>
                  <option value="expired">Expired registration</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Set Expiration Limit Date</label>
                <input
                  type="date"
                  value={overrideExpiry}
                  onChange={(e) => setOverrideExpiry(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2 text-xs font-sans">
              <button
                type="button"
                onClick={() => setOverrideTrader(null)}
                className="bg-slate-105 bg-slate-100 hover:bg-slate-200 font-bold px-4 py-2 rounded-xl text-slate-650"
              >
                Dismiss
              </button>
              <button
                type="submit"
                className="bg-slate-900 hover:bg-slate-800 font-bold px-4 py-2 rounded-xl text-white shadow"
              >
                Save Protocol Override
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
