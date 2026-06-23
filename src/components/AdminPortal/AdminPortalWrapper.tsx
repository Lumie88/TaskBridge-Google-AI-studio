import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  Building2,
  FileCode,
  Smartphone,
  LogOut,
  User,
  ShieldCheck,
  Bell,
  CheckCircle,
  X,
  AlertCircle,
  Menu,
  Command,
  Keyboard,
  Search
} from "lucide-react";
import {
  AdminUser,
  Agency,
  ServiceTask,
  HandymanTrader,
  AuditLog,
  WebhookLog
} from "../../types/admin";

import AdminSignIn from "./AdminSignIn";
import AdminDashboard from "./AdminDashboard";
import AdminTasks from "./AdminTasks";
import AdminTraders from "./AdminTraders";
import AdminAgencies from "./AdminAgencies";
import AdminLogs from "./AdminLogs";
import FieldVisitSim from "./FieldVisitSim";
import Header from "../Header";

interface AdminPortalWrapperProps {
  onSignOutGlobal?: () => void;
  isFullWidth?: boolean;
  setIsFullWidth?: (val: boolean) => void;
  hideTopHeaders?: boolean;
  setHideTopHeaders?: (val: boolean) => void;
}

export default function AdminPortalWrapper({
  isFullWidth = true,
  setIsFullWidth = () => {},
  hideTopHeaders = true,
  setHideTopHeaders = () => {},
}: AdminPortalWrapperProps) {
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string>("");

  // Core state from state-authoritative endpoints
  const [tasks, setTasks] = useState<ServiceTask[]>([]);
  const [traders, setTraders] = useState<HandymanTrader[]>([]);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [webhookLogs, setWebhookLogs] = useState<WebhookLog[]>([]);

  // Navigation: "dashboard" | "tasks" | "traders" | "agencies" | "logs" | "field-sim"
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  // Notifications popup states
  const [notifText, setNotifText] = useState("");
  const [notifOpen, setNotifOpen] = useState(false);

  const fetchCoreData = async () => {
    try {
      const [tRes, trRes, agRes, auRes, wRes] = await Promise.all([
        fetch("/api/admin/tasks"),
        fetch("/api/admin/traders"),
        fetch("/api/admin/agencies"),
        fetch("/api/admin/audit-logs"),
        fetch("/api/admin/webhook-logs"),
      ]);

      const [tData, trData, agData, auData, wData] = await Promise.all([
        tRes.json(),
        trRes.json(),
        agRes.json(),
        auRes.json(),
        wRes.json(),
      ]);

      setTasks(tData || []);
      setTraders(trData || []);
      setAgencies(agData || []);
      setAuditLogs(auData || []);
      setWebhookLogs(wData || []);
    } catch (e) {
      console.error("Critical fetching error", e);
    }
  };

  useEffect(() => {
    fetchCoreData();
    // Auto polling intervals to keep dashboard sync'd matching active webhooks
    const timer = setInterval(fetchCoreData, 6000);
    return () => clearInterval(timer);
  }, []);

  // Responsive mobile menu and universal quick-action command palette states
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [commandSearch, setCommandSearch] = useState("");

  // Global hotkeys listener to switch administrative sections instantly
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === "INPUT" ||
          activeEl.tagName === "TEXTAREA" ||
          activeEl.getAttribute("contenteditable") === "true")
      ) {
        // user is currently typing, ignore shortcuts
        return;
      }

      const key = e.key.toLowerCase();
      if (key === "d") {
        setActiveTab("dashboard");
        setMobileMenuOpen(false);
      } else if (key === "q") {
        setActiveTab("tasks");
        setMobileMenuOpen(false);
      } else if (key === "h") {
        setActiveTab("traders");
        setMobileMenuOpen(false);
      } else if (key === "a") {
        setActiveTab("agencies");
        setMobileMenuOpen(false);
      } else if (key === "l") {
        setActiveTab("logs");
        setMobileMenuOpen(false);
      } else if (key === "s") {
        setActiveTab("field-sim");
        setMobileMenuOpen(false);
      } else if (key === "/" || (e.ctrlKey && key === "k") || (e.metaKey && key === "k")) {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSignInSuccess = (user: AdminUser, assignedToken: string) => {
    setCurrentUser(user);
    setToken(assignedToken);
    setActiveTab("dashboard");
    showSystemNotification(`Welcome to TaskBridge Backoffice, ${user.fullName}`);
  };

  const handleSignOut = () => {
    setCurrentUser(null);
    setToken("");
    setActiveTab("dashboard");
    showSystemNotification("Secure administrative session terminated.");
  };

  const showSystemNotification = (txt: string) => {
    setNotifText(txt);
    setNotifOpen(true);
    setTimeout(() => {
      setNotifOpen(false);
    }, 4000);
  };

  // Safe tab loading dispatcher
  const renderTabContent = () => {
    if (!currentUser) return null;

    switch (activeTab) {
      case "dashboard":
        return (
          <AdminDashboard
            tasks={tasks}
            traders={traders}
            onNavigate={(tab) => setActiveTab(tab)}
          />
        );
      case "tasks":
        return (
          <AdminTasks
            tasks={tasks}
            traders={traders}
            agencies={agencies}
            onRefresh={fetchCoreData}
            currentUser={currentUser}
            onShowNotification={showSystemNotification}
          />
        );
      case "traders":
        return (
          <AdminTraders
            traders={traders}
            onRefresh={fetchCoreData}
            currentUser={currentUser}
            onShowNotification={showSystemNotification}
          />
        );
      case "agencies":
        return (
          <AdminAgencies
            agencies={agencies}
            onRefresh={fetchCoreData}
            currentUser={currentUser}
            onShowNotification={showSystemNotification}
          />
        );
      case "logs":
        return (
          <AdminLogs
            auditLogs={auditLogs}
            webhookLogs={webhookLogs}
            agencies={agencies}
            onRefresh={fetchCoreData}
            onShowNotification={showSystemNotification}
          />
        );
      case "field-sim":
        return (
          <FieldVisitSim
            tasks={tasks}
            onRefresh={fetchCoreData}
            onShowNotification={showSystemNotification}
          />
        );
      default:
        return <div className="p-12 text-center text-slate-400">Section not initialized.</div>;
    }
  };

  if (!currentUser) {
    return (
      <div className="bg-slate-50 min-h-screen">
        <Header onOpenDemo={() => {}} currentPath="admin" hideNavigation={true} />
        <div className="pt-12 pb-24">
          <AdminSignIn onSignInSuccess={handleSignInSuccess} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-50 text-slate-800 font-sans">
      
      {/* Mobile Top Header Bar for Super Admin */}
      <div className="lg:hidden bg-slate-900 border-b border-slate-800 text-white px-5 py-4 flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-rose-500 rounded-lg flex items-center justify-center text-white">
            <ShieldCheck className="h-4.5 w-4.5" />
          </div>
          <span className="font-display font-black text-sm text-white">TaskBridge Admin</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition-colors"
            title="Search & shortcuts"
          >
            <Search className="h-4 w-4" />
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg bg-slate-850 text-slate-300 hover:text-white transition-colors border border-slate-705/50"
          >
            {mobileMenuOpen ? <X className="h-4 w-4 text-rose-400" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Dynamic persistent sidebar */}
      <aside className={`w-full lg:w-64 bg-slate-900 text-white shrink-0 border-r border-slate-800 flex flex-col justify-between transition-all duration-300 ${mobileMenuOpen ? "block" : "hidden lg:flex"}`}>
        <div className="p-5 space-y-6">
          {/* Logo Brand banner */}
          <a href="#" className="flex items-center gap-3 select-none pb-4 border-b border-slate-800 hover:opacity-90 transition-opacity">
            <div className="h-9 w-9 bg-rose-500 rounded-xl flex items-center justify-center text-white border border-rose-450 shadow-sm relative shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="text-left leading-normal">
              <span className="font-display font-black tracking-tight text-white block text-sm">
                TaskBridge Workspace
              </span>
              <span className="text-[9px] font-mono font-bold uppercase text-slate-400 block tracking-wide">
                OPERATIONS CONSOLE
              </span>
            </div>
          </a>

          {/* User profile identifier block */}
          <div className="bg-slate-950/60 p-3.5 border border-slate-850 rounded-xl text-left flex items-center gap-3 select-none">
            <div className="h-8 w-8 bg-slate-800 rounded-full flex items-center justify-center text-white shrink-0 border border-slate-700">
              <User className="h-4.5 w-4.5 text-rose-500" />
            </div>
            <div className="text-left font-sans text-xs">
              <p className="font-bold text-slate-200">{currentUser.fullName}</p>
              <span className="text-[10px] text-rose-400 font-mono font-bold tracking-tight">
                {currentUser.role}
              </span>
            </div>
          </div>

          {/* Sidebar Nav anchors */}
          <nav className="space-y-1.5 pt-2">
            {[
              { id: "dashboard", icon: <LayoutDashboard className="h-4 w-4" />, label: "Console Dashboard" },
              { id: "tasks", icon: <ClipboardList className="h-4 w-4" />, label: "Dispatch queue" },
              { id: "traders", icon: <Users className="h-4 w-4" />, label: "Handyman Register" },
              { id: "agencies", icon: <Building2 className="h-4 w-4" />, label: "Care Agencies Console" },
              { id: "logs", icon: <FileCode className="h-4 w-4" />, label: "Audit & API Tunnels" },
              { id: "field-sim", icon: <Smartphone className="h-4 w-4 text-emerald-400" />, label: "SMS Visit Link Simulator" },
            ].map((item) => {
              const isSelected = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full text-left inline-flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-xs font-bold font-sans transition-all cursor-pointer ${
                    isSelected
                      ? "bg-rose-500 text-white shadow-md shadow-rose-500/10"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Workspace View Options (Automatic Header & Width Control Script) */}
        <div className="p-5 border-t border-slate-800 text-left space-y-2 select-none">
          <span className="font-mono text-[8.5px] font-bold text-slate-500 uppercase tracking-widest block font-sans">Console Display Settings</span>
          
          <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/60 text-xs text-slate-300 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-sans font-medium text-[11px] text-slate-300">Fluid Full-Width</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={isFullWidth}
                  onChange={() => setIsFullWidth(!isFullWidth)} 
                />
                <div className="w-8 h-4.5 bg-slate-800 border border-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 peer-checked:after:bg-rose-500 after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-rose-950/40 peer-checked:border-rose-800" />
              </label>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-sans font-medium text-[11px] text-slate-300 font-sans">Collapse Ext Headers</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={hideTopHeaders}
                  onChange={() => setHideTopHeaders(!hideTopHeaders)}
                />
                <div className="w-8 h-4.5 bg-slate-800 border border-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 peer-checked:after:bg-rose-500 after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-rose-950/40 peer-checked:border-rose-800" />
              </label>
            </div>
          </div>
        </div>

        {/* Bottom actions list */}
        <div className="p-5 border-t border-slate-800 select-none font-sans text-xs">
          <button
            onClick={handleSignOut}
            className="w-full text-left inline-flex items-center gap-2.5 text-slate-450 hover:text-rose-400 font-bold tracking-tight py-2 transition-colors cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>Terminate session</span>
          </button>
 
          <div className="pt-4 border-t border-slate-800/50 mt-4 flex justify-between items-center text-[9px] text-slate-500 font-mono">
            <span>VERSION 2.4</span>
            <span>AES-CBC ACTIVE</span>
          </div>
        </div>
      </aside>
 
      {/* Main body content section wrapper */}
      <main className={`flex-1 p-6 sm:p-8 lg:p-10 ${isFullWidth ? "max-w-none w-full" : "max-w-7xl mx-auto w-full"} transition-all duration-300`}>
        {renderTabContent()}
      </main>

      {/* Unified overlay system notifications slide-over banner */}
      {notifOpen && (
        <div className="fixed bottom-5 right-5 z-[100] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 flex gap-3 text-left animate-slide-in font-sans text-xs max-w-sm text-white">
          <span className="p-1 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0 h-max mt-0.5">
            <CheckCircle className="h-4 w-4" />
          </span>
          <div className="space-y-0.5 flex-1 pr-4">
            <strong className="text-slate-100 font-black tracking-tight block">Console Alert Dispatcher</strong>
            <p className="text-slate-350">{notifText}</p>
          </div>
          <button onClick={() => setNotifOpen(false)} className="text-slate-500 hover:text-white shrink-0">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ================= ADMIN COMMAND PALETTE OVERLAY ================= */}
      {commandPaletteOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden">
            {/* Search Input */}
            <div className="p-4 border-b border-slate-800 flex items-center gap-3 bg-slate-950/40">
              <Command className="h-5 w-5 text-rose-500 animate-pulse" />
              <input
                type="text"
                autoFocus
                placeholder="Type admin command, handyman name, or agency details..."
                value={commandSearch}
                onChange={(e) => setCommandSearch(e.target.value)}
                className="bg-transparent text-white placeholder-slate-500 text-sm focus:outline-none w-full"
              />
              <button 
                onClick={() => { setCommandPaletteOpen(false); setCommandSearch(""); }}
                className="p-1 px-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-[10px] font-mono"
              >
                ESC
              </button>
            </div>

            {/* Suggestions / Results */}
            <div className="p-2 max-h-[350px] overflow-y-auto space-y-1 text-left">
              <div className="px-3 py-1 text-[10px] font-mono uppercase text-slate-500 tracking-wider">Console Shortcuts</div>
              
              {/* Commands list */}
              {[
                { label: "Go to Console Dashboard", tab: "dashboard", desc: "View operations overview & security metrics", shortcut: "D" },
                { label: "Open Dispatch Queue", tab: "tasks", desc: "Evaluate matched handymen & verify details", shortcut: "Q" },
                { label: "Manage Handymen Registry", tab: "traders", desc: "Onboard providers & DBS compliance files", shortcut: "H" },
                { label: "Care Agencies Console", tab: "agencies", desc: "Link remote regional coordination trusts", shortcut: "A" },
                { label: "Audit & API Tunnels", tab: "logs", desc: "View event ledgers & callback webhook packets", shortcut: "L" },
                { label: "SMS Visit Link Simulator", tab: "field-sim", desc: "Simulate mobile visits & check-in events", shortcut: "S" },
              ].filter(cmd => cmd.label.toLowerCase().includes(commandSearch.toLowerCase()) || cmd.desc.toLowerCase().includes(commandSearch.toLowerCase())).map((cmd, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setActiveTab(cmd.tab);
                    setCommandPaletteOpen(false);
                    setCommandSearch("");
                  }}
                  className="w-full text-left p-3 rounded-xl hover:bg-slate-805 flex justify-between items-center group transition-all"
                >
                  <div className="text-xs">
                    <p className="font-bold text-slate-205 group-hover:text-white">{cmd.label}</p>
                    <p className="text-[10px] text-slate-550">{cmd.desc}</p>
                  </div>
                  <span className="bg-slate-850 text-slate-400 group-hover:text-rose-400 border border-slate-700 text-[10px] px-2 py-0.5 rounded font-mono">
                    {cmd.shortcut}
                  </span>
                </button>
              ))}

              {/* Handyman search list */}
              {traders.length > 0 && (
                <>
                  <div className="px-3 py-1 text-[10px] font-mono uppercase text-slate-500 tracking-wider mt-3">Matching Handymen</div>
                  {traders.filter(t => 
                    t.firstName.toLowerCase().includes(commandSearch.toLowerCase()) ||
                    t.company.toLowerCase().includes(commandSearch.toLowerCase())
                  ).map((t, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setActiveTab("traders");
                        setCommandPaletteOpen(false);
                        setCommandSearch("");
                      }}
                      className="w-full text-left p-3 rounded-xl hover:bg-slate-805 flex justify-between items-center group transition-all border border-transparent hover:border-slate-805"
                    >
                      <div className="text-xs">
                        <span className="font-bold text-slate-200 group-hover:text-white">{t.firstName}</span>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">{t.company}</p>
                      </div>
                      <span className="text-[9px] font-mono bg-slate-950/60 text-slate-400 border border-slate-800 px-1.5 py-0.5 rounded">
                        {t.dbsVerifiedStatus}
                      </span>
                    </button>
                  ))}
                </>
              )}
            </div>

            {/* Footer tips */}
            <div className="p-3 bg-slate-950/60 border-t border-slate-800 flex justify-between items-center text-[10px] text-slate-500 font-mono">
              <span>Shortcuts: Press D, Q, H, A, L, S to switch pages instantly</span>
              <span>Press ESC to dismiss</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
