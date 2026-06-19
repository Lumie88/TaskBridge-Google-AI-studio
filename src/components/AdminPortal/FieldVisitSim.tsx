import React, { useState, useEffect } from "react";
import {
  MapPin,
  Camera,
  CheckCircle2,
  Clock,
  Send,
  Loader2,
  Unlock,
  AlertCircle,
  Smartphone,
  CheckSquare
} from "lucide-react";
import { ServiceTask } from "../../types/admin";

interface FieldVisitSimProps {
  onShowNotification: (msg: string) => void;
  onRefresh: () => void;
  tasks: ServiceTask[];
}

export default function FieldVisitSim({ onShowNotification, onRefresh, tasks }: FieldVisitSimProps) {
  const [tokenInput, setTokenInput] = useState("");
  const [activeTask, setActiveTask] = useState<ServiceTask | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // CheckIn coordinate coordinates simulation
  const [lat, setLat] = useState(51.5014);
  const [lng, setLng] = useState(-0.1419);

  // Completion attributes
  const [beforeUrl, setBeforeUrl] = useState("https://images.unsplash.com/photo-1558904541-efa8c1a6b40a?q=80&w=600&auto=format&fit=crop");
  const [afterUrl, setAfterUrl] = useState("https://images.unsplash.com/photo-1592150621744-aca64f48394a?q=80&w=600&auto=format&fit=crop");
  const [notes, setNotes] = useState("Reinforced concrete paths, swept algae clean, checked lock latch works perfect. Zero slipping dangers left.");
  
  // Tasks list with active tokens
  const activeTokenTasks = tasks.filter((t) => t.token);

  const fetchTaskDetailsByToken = async (tok: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/visit/details/${tok}`);
      if (!res.ok) {
        throw new Error("Activation Code Invalid. Access Expired or Blocked.");
      }
      const data = await res.json();
      setActiveTask(data);
    } catch (err: any) {
      setError(err.message);
      setActiveTask(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!activeTask || !activeTask.token) return;
    setLoading(true);

    try {
      const res = await fetch("/api/visit/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: activeTask.token,
          lat,
          lng,
        }),
      });

      const updated = await res.json();
      setActiveTask(updated);
      onRefresh();
      onShowNotification("Checked In securely. Geofence matching OK.");
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOutSubmit = async () => {
    if (!activeTask || !activeTask.token) return;
    setLoading(true);

    try {
      const res = await fetch("/api/visit/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: activeTask.token,
          completionNotes: notes,
          beforePhotoUrl: beforeUrl,
          afterPhotoUrl: afterUrl,
        }),
      });

      const updated = await res.json();
      setActiveTask(updated);
      onRefresh();
      onShowNotification("Verification evidence dispatched. Dispatch ticket locked.");
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Pre-load hash token if window address contains it
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.startsWith("#visit-token-")) {
      const tok = hash.replace("#visit-token-", "");
      setTokenInput(tok);
      fetchTaskDetailsByToken(tok);
    }
  }, []);

  return (
    <div className="max-w-md mx-auto my-6 px-4 font-sans text-left">
      <div className="bg-slate-900 text-white rounded-3xl p-5 border border-slate-800 shadow-xl overflow-hidden relative space-y-4">
        <div className="flex items-center gap-2 mb-2 select-none">
          <Smartphone className="h-5 w-5 text-rose-500" />
          <span className="font-mono text-[9px] font-bold text-rose-400 uppercase tracking-wider block">
            TaskBridge Mobile Field-Client Simulator
          </span>
        </div>

        {/* Token Inbound Link validation */}
        {!activeTask && (
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 block uppercase font-mono">
                Select Active Scheduled Visit Token
              </label>

              {activeTokenTasks.length > 0 ? (
                <div className="space-y-2">
                  <select
                    value={tokenInput}
                    onChange={(e) => {
                      setTokenInput(e.target.value);
                      if (e.target.value) fetchTaskDetailsByToken(e.target.value);
                    }}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl text-xs py-2.5 px-3 text-slate-300 focus:outline-none"
                  >
                    <option value="">-- Choose scheduled dispatch SMS link --</option>
                    {activeTokenTasks.map((t) => (
                      <option key={t.id} value={t.token}>
                        Visit {t.id} (Tr: {t.assignedHandymanName})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="text-xs text-slate-400 bg-slate-950 p-4 rounded-xl border border-slate-850">
                  ⚠️ No active task scheduling logs checked yet. Go to <strong className="text-white">Compliance Dispatch operations Queue</strong>, assign a handyman, and click "Dispatch Secure Visit SMS".
                </div>
              )}
            </div>

            <div className="relative flex items-center justify-center my-1 select-none">
              <span className="border-t border-slate-800 w-full" />
              <span className="absolute bg-slate-900 px-3 text-[10px] font-bold font-mono text-slate-500 text-center">OR MANUALLY KEY</span>
            </div>

            <div className="space-y-2">
              <input
                type="text"
                placeholder="Paste vst_xxxxx_TB-xxx Token code"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none"
              />
              <button
                disabled={loading}
                onClick={() => fetchTaskDetailsByToken(tokenInput)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-950 font-bold text-xs py-2.5 px-3 rounded-xl inline-flex items-center justify-center gap-1 cursor-pointer transition-all shadow"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin text-slate-500" /> : <Unlock className="h-4 w-4" />}
                <span>Locate Vetted Security Portal</span>
              </button>
            </div>

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-xl text-xs flex gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
          </div>
        )}

        {/* Active Vetted Visit panel */}
        {activeTask && (
          <div className="space-y-4">
            <div className="border-b border-slate-800 pb-3 font-sans text-xs">
              <span className="text-[10px] text-emerald-400 font-bold block bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full w-max">
                🔒 VERIFIED HANDYMAN TUNNEL ACTIVE
              </span>
              <div className="flex justify-between items-start mt-3">
                <h4 className="font-display font-black text-white text-base leading-tight">Task ID: {activeTask.id}</h4>
                <p className="font-mono text-slate-400 text-[10px]">Recipient initials: {activeTask.residentInitials}</p>
              </div>
              <p className="text-slate-400 mt-1">Provider company: {activeTask.agencyName}</p>
            </div>

            {/* Step 1: Clock In */}
            {activeTask.status === "Visit Scheduled" && (
              <div className="space-y-3 font-sans">
                <div className="bg-indigo-505 bg-indigo-500/5 border border-indigo-500/10 p-3.5 rounded-xl text-xs space-y-2 leading-relaxed text-slate-350">
                  <p className="font-bold text-slate-200">Mandatory GPS Clock-In Protocol</p>
                  <p className="text-[11px] text-slate-400">
                    To satisfy Safeguarding protocols, georeferenced coordinates are validated within 100 meters of clinical site address before opening task descriptions.
                  </p>
                </div>

                {/* Site Target Address preview */}
                <div className="bg-slate-950 p-3.5 border border-slate-850 rounded-xl leading-relaxed text-xs text-slate-300">
                  <span className="text-slate-500 text-[9px] uppercase font-mono block">Target Service Address</span>
                  <p className="font-bold text-white">{activeTask.fullAddress || "Address details stored in ledger."}</p>
                  <p className="text-slate-400 font-semibold">{activeTask.postcode || "M14 5TQ"}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono select-none">
                  <div>
                    <span className="text-slate-500 text-[9px] uppercase">Latitude Offset</span>
                    <input
                      type="number"
                      step="0.0001"
                      value={lat}
                      onChange={(e) => setLat(parseFloat(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-850 p-2 text-slate-350 rounded-lg text-[11px]"
                    />
                  </div>
                  <div>
                    <span className="text-slate-500 text-[9px] uppercase">Longitude Offset</span>
                    <input
                      type="number"
                      step="0.0001"
                      value={lng}
                      onChange={(e) => setLng(parseFloat(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-850 p-2 text-slate-350 rounded-lg text-[11px]"
                    />
                  </div>
                </div>

                <button
                  disabled={loading}
                  onClick={handleCheckIn}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs py-2.5 rounded-xl inline-flex justify-center items-center gap-1 shadow-sm font-sans"
                >
                  <MapPin className="h-4 w-4 text-rose-500" />
                  <span>Clock in and unlock checklist details</span>
                </button>
              </div>
            )}

            {/* Step 2: Checked In, Perform work checklist & Upload Evidence */}
            {activeTask.status === "Checked In" && (
              <div className="space-y-4 font-sans text-xs">
                {/* Geofence confirmed display */}
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-xl flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <div>
                    <span className="font-bold">Check-In Geolocation Checked</span>
                    <p className="text-[10px] text-emerald-500">{activeTask.checkInTime ? `Clocked: ${activeTask.checkInTime.replace("T", " ").substring(0, 16)}` : ""}</p>
                  </div>
                </div>

                {/* Target Address details */}
                <div className="bg-slate-950 p-3.5 border border-slate-850 rounded-xl leading-relaxed text-xs text-slate-300">
                  <span className="text-slate-500 text-[9px] uppercase font-mono block">Target Service Address</span>
                  <p className="font-bold text-white">{activeTask.fullAddress || "Manchester Address Block"}</p>
                  <p className="text-slate-400 font-semibold">{activeTask.postcode || "M14 5TQ"}</p>
                </div>

                {/* Secure Handover of Keysafe Code for Enhanced DBS Checked handymen */}
                {activeTask.keysafeCode && (
                  <div className="bg-indigo-950/80 border border-indigo-900/60 p-3.5 rounded-xl flex items-center justify-between text-xs space-y-0.5">
                    <div>
                      <span className="text-indigo-400 block text-[9px] uppercase font-mono font-bold">Secure Released Keysafe</span>
                      <strong className="text-white text-sm font-mono tracking-wider">{activeTask.keysafeCode}</strong>
                    </div>
                    <span className="text-[8px] bg-indigo-650 text-indigo-100 font-extrabold px-1.5 py-0.5 rounded uppercase font-mono tracking-wide shrink-0">
                      Vetted Release
                    </span>
                  </div>
                )}

                <div className="space-y-1 bg-slate-950 p-3 border border-slate-850 rounded-xl leading-relaxed">
                  <span className="text-slate-500 text-[9px] uppercase font-mono block">Work directive spec</span>
                  <p className="text-slate-200 font-bold">{activeTask.category}</p>
                  <p className="text-slate-400 text-xs italic">"{activeTask.summary}"</p>
                </div>

                {/* Vetting Checklist */}
                <div className="space-y-2">
                  <span className="text-slate-400 text-[9px] uppercase font-mono block">Safety Checklist Verification</span>
                  {[
                    "Assessed site for vulnerable resident context",
                    "Communicated with carer/coordinator on site if listed",
                    "Conducted repairs utilizing certified safety materials only",
                    "Cleared all splinters, debris and waste trip hazards"
                  ].map((chk, index) => (
                    <div key={index} className="flex gap-2.5 items-start font-sans text-[11px] text-slate-300 bg-slate-950/45 border border-slate-850 p-2 rounded-lg">
                      <CheckSquare className="h-4 w-4 mt-0.5 text-rose-500" />
                      <span>{chk}</span>
                    </div>
                  ))}
                </div>

                {/* Evidence inputs simulation */}
                <div className="space-y-2.5">
                  <span className="text-slate-400 text-[9px] uppercase font-mono block">Simulated Evidence Photo Files</span>
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-mono select-none">
                    <div className="space-y-1">
                      <span>Before Work Photo URL</span>
                      <input
                        type="text"
                        value={beforeUrl}
                        onChange={(e) => setBeforeUrl(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 text-[10px] p-2 rounded text-slate-350"
                      />
                    </div>
                    <div className="space-y-1">
                      <span>After Work Photo URL</span>
                      <input
                        type="text"
                        value={afterUrl}
                        onChange={(e) => setAfterUrl(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 text-[10px] p-2 rounded text-slate-350"
                      />
                    </div>
                  </div>

                  <div className="space-y-1 text-left">
                    <span className="text-slate-400 text-[9px] uppercase font-mono block">Completion Notes Transcripts</span>
                    <textarea
                      rows={2.5}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 p-2 rounded text-xs text-slate-205 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  disabled={loading}
                  onClick={handleCheckOutSubmit}
                  className="w-full bg-slate-105 bg-slate-100 hover:bg-slate-200 text-slate-950 font-bold py-2.5 rounded-xl transition-all shadow-sm"
                >
                  Confirm checklist & checkout
                </button>
              </div>
            )}

            {/* Step 3: Completed evidence awaiting central audit */}
            {activeTask.status === "Awaiting Evidence Review" && (
              <div className="bg-slate-950/50 text-center p-6 border border-slate-850 rounded-xl space-y-3 font-sans text-xs">
                <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto animate-bounce" />
                <div className="space-y-1">
                  <h4 className="font-bold text-white text-sm">Evidence Dispatched successfully</h4>
                  <p className="text-slate-400">
                    Your GPS coordinates, checklist statements, and completed photos are uploaded within TaskBridge database vault.
                  </p>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-lg text-left font-mono text-[10px] text-slate-500">
                  <p>Check out registered.</p>
                  <p className="mt-1 text-slate-400 italic">"CMS API callback webhook dispatched to {activeTask.agencyName} servers."</p>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setActiveTask(null)}
                    className="text-slate-450 hover:text-white text-[10px] uppercase font-mono font-bold tracking-wider"
                  >
                    Reset & Simulate another Token
                  </button>
                </div>
              </div>
            )}

            {/* Completely resolved */}
            {activeTask.status === "Completed" && (
              <div className="bg-slate-950 text-center p-6 border border-slate-850 rounded-all space-y-3 font-sans text-xs rounded-2xl">
                <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto" />
                <div className="space-y-1">
                  <h4 className="font-bold text-white text-sm">Central Audit Approved</h4>
                  <p className="text-slate-400">
                    The Care supervisors checked evidence, issued compensation logs, and marked this ticket as fully Resolved.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTask(null)}
                  className="text-indigo-400 hover:text-indigo-500 text-[10px] uppercase font-mono tracking-wider font-bold"
                >
                  Back to token selection
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
