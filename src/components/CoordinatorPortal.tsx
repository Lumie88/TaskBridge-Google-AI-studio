import React, { useState, useEffect } from "react";
import { 
  Shield, 
  UserCheck, 
  Activity, 
  CheckCircle2, 
  MapPin, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  Heart, 
  Sparkles, 
  Plus, 
  Edit3, 
  ClipboardCheck, 
  Users, 
  LogOut, 
  Filter, 
  ArrowRight, 
  ChevronRight, 
  Search, 
  Building, 
  UploadCloud, 
  Check, 
  Eye, 
  AlertCircle, 
  Bell, 
  User,
  X,
  FileText,
  Lock,
  Loader2,
  Trash2,
  Key,
  Menu,
  Command,
  Keyboard
} from "lucide-react";

// Types
export interface Task {
  id: string;
  residentInitials: string;
  residentFullName: string;
  originalCareNote: string;
  category: string;
  summary: string;
  urgency: "Routine" | "Medium" | "Urgent";
  safeguardingApplies: boolean;
  preferredWindow: string;
  carerPresent: boolean;
  photoUrl?: string;
  beforePhotoUrl?: string;
  afterPhotoUrl?: string;
  status: "Draft" | "Awaiting Care Approval" | "Pending TaskBridge Assignment" | "Assigned" | "Visit Scheduled" | "Checked In" | "Awaiting Care Confirmation" | "Completed";
  assignedHandyman?: {
    firstName: string;
    company: string;
    scheduledWindow: string;
    dbsVerifiedStatus: string;
  };
  completionNotes?: string;
  fullAddress?: string;
  postcode?: string;
  keysafeCode?: string;
  timeline: { status: string; timestamp: string; note: string }[];
}

interface CoordinatorPortalProps {
  onSignOut: () => void;
  isFullWidth?: boolean;
  setIsFullWidth?: (val: boolean) => void;
  hideTopHeaders?: boolean;
  setHideTopHeaders?: (val: boolean) => void;
}

// Default initial tasks to build a robust, live-feeling dashboard immediately
const INITIAL_TASKS: Task[] = [
  {
    id: "TB-104",
    residentInitials: "M.K.",
    residentFullName: "Margaret Knowles",
    originalCareNote: "Margaret's front pathway is completely overgrown with thorns and slippery weed growth. Carer had to support her heavily today to prevent a slip or fall when visiting the GP.",
    category: "Path clearing",
    summary: "Clear overgrown thorny brambles and slippery weeds along front main entry path.",
    urgency: "Urgent",
    safeguardingApplies: true,
    preferredWindow: "Morning (09:00 - 12:00)",
    carerPresent: true,
    status: "Awaiting Care Confirmation",
    beforePhotoUrl: "https://images.unsplash.com/photo-1558904541-efa8c1a6b40a?q=80&w=600&auto=format&fit=crop", // overgrown path
    afterPhotoUrl: "https://images.unsplash.com/photo-1592150621744-aca64f48394a?q=80&w=600&auto=format&fit=crop", // clean path
    assignedHandyman: {
      firstName: "David",
      company: "Home Shield Services Network",
      scheduledWindow: "Today at 10:30 AM",
      dbsVerifiedStatus: "Enhanced DBS Checked & Active"
    },
    completionNotes: "All brambles cut back, high-pressure washed the concrete tiles to clear green algae, leaving a completely slip-free entry pathway.",
    fullAddress: "104 Orchard Lane, Manchester",
    postcode: "M14 5TQ",
    keysafeCode: "K8955",
    timeline: [
      { status: "Awaiting Care Approval", timestamp: "2026-06-16 09:12", note: "Care note translated by AI summary engine." },
      { status: "Pending TaskBridge Assignment", timestamp: "2026-06-16 10:00", note: "Approved by Care Coordinator Sarah Jenkins." },
      { status: "Assigned", timestamp: "2026-06-16 11:30", note: "Automated routing matched with nearest Enhanced DBS vetted provider." },
      { status: "Checked In", timestamp: "2026-06-17 09:05", note: "Operative arrived on site. Geolocation matches resident address." },
      { status: "Awaiting Care Confirmation", timestamp: "2026-06-17 10:15", note: "Task completed. Evidence uploaded to secure cloud." },
    ]
  },
  {
    id: "TB-103",
    residentInitials: "R.S.",
    residentFullName: "Ronald Sutherland",
    originalCareNote: "The wooden grab rail beside Ronald's front door is splitting and feels loose when pulled. Handrail requires securing down safely before he attempts to lock up tonight.",
    category: "Loose rail repair",
    summary: "Reinforce and secure loose hand grab rail at main external entry point.",
    urgency: "Urgent",
    safeguardingApplies: true,
    preferredWindow: "Afternoon (12:00 - 16:00)",
    carerPresent: false,
    status: "Assigned",
    assignedHandyman: {
      firstName: "George",
      company: "CareFix Pro Handymen",
      scheduledWindow: "Today at 1:30 PM",
      dbsVerifiedStatus: "Enhanced DBS Checked & Active"
    },
    fullAddress: "44 Beechwood Drive, Leeds",
    postcode: "LS2 8PJ",
    keysafeCode: "C4412",
    timeline: [
      { status: "Awaiting Care Approval", timestamp: "2026-06-16 14:00", note: "AI extraction completed." },
      { status: "Pending TaskBridge Assignment", timestamp: "2026-06-16 14:30", note: "Approved for dispatcher matching queue." },
      { status: "Assigned", timestamp: "2026-06-17 08:30", note: "George assigned. Automated DBS validation checks out." }
    ]
  },
  {
    id: "TB-102",
    residentInitials: "E.P.",
    residentFullName: "Eileen Patterson",
    originalCareNote: "Back door lock is sticking. Eileen is struggling to lock her patio doors at night due to arthritis stiffness, which leaves her feeling very scared and secure.",
    category: "Lock repairs",
    summary: "De-carbonate, lubricate or replace sticking rear security barrel lock.",
    urgency: "Medium",
    safeguardingApplies: true,
    preferredWindow: "Flexible Day",
    carerPresent: false,
    status: "Pending TaskBridge Assignment",
    fullAddress: "12 Primrose Close, Birmingham",
    postcode: "B15 2QX",
    keysafeCode: "A7789",
    timeline: [
      { status: "Awaiting Care Approval", timestamp: "2020-06-15 11:00", note: "AI audit completed." },
      { status: "Pending TaskBridge Assignment", timestamp: "2026-06-15 14:00", note: "Manual request raised by regional coordinator." }
    ]
  },
  {
    id: "TB-101",
    residentInitials: "H.G.",
    residentFullName: "Henry Grealish",
    originalCareNote: "Henry has a pile of wet cardboard boxes rotting behind his hedge, blocking the wheelchair ramp exit. Crucial fire risk hazard warning.",
    category: "Trip hazard removal",
    summary: "Clear decaying cardboard boxes from rear wheelchair emergency ramp.",
    urgency: "Medium",
    safeguardingApplies: false,
    preferredWindow: "Morning (09:00 - 12:00)",
    carerPresent: true,
    status: "Completed",
    beforePhotoUrl: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?q=80&w=600&auto=format&fit=crop",
    afterPhotoUrl: "https://images.unsplash.com/photo-1616886220360-49685371bec6?q=80&w=600&auto=format&fit=crop",
    assignedHandyman: {
      firstName: "Michael",
      company: "Swift Response Logistics",
      scheduledWindow: "2026-06-15 10:00",
      dbsVerifiedStatus: "Enhanced DBS Checked & Active"
    },
    completionNotes: "All sodden fire hazards completely cleared from wheelchair egress points. Tested ramp with empty wheelchair to verify zero obstructions occur.",
    fullAddress: "89 High Street, London",
    postcode: "EC1A 1BB",
    keysafeCode: "X1034",
    timeline: [
      { status: "Pending TaskBridge Assignment", timestamp: "2026-06-15 08:00", note: "Approved" },
      { status: "Assigned", timestamp: "2026-06-15 08:30", note: "Matched and assigned in background." },
      { status: "Visit Scheduled", timestamp: "2026-06-15 09:12", note: "Scheduled for immediate dispatch." },
      { status: "Checked In", timestamp: "2026-06-15 09:45", note: "Arrived at location." },
      { status: "Awaiting Care Confirmation", timestamp: "2026-06-15 10:30", note: "Photos logged. Clear evidence verified." },
      { status: "Completed", timestamp: "2026-06-15 11:00", note: "Completed by sarah.jenkins@primrose.org" }
    ]
  }
];

// Care note triggers list for easy demo entry
const SUGGESTIONS_NOTE_TEMPLATES = [
  {
    title: "Double Hazard template (Overgrown path & Lock issues)",
    text: "The garden lawn mowing is long overdue and has overgrown the main path which Margaret slips on. Also, the back kitchen window won't stay shut when we unlock it, meaning she gets cold and feels unsafe."
  },
  {
    title: "Vulnerable Adult (Broken rail & Trip risk)",
    text: "Front door rail is loose and wiggles severely when resident grabs it. Additionally, there are loose extension wires lying across the living room carpet representing high fall-risks."
  }
];

export default function CoordinatorPortal({ 
  onSignOut,
  isFullWidth = true,
  setIsFullWidth = () => {},
  hideTopHeaders = true,
  setHideTopHeaders = () => {},
}: CoordinatorPortalProps) {
  // Navigation: "dashboard" | "create" | "status" | "notifications"
  const [activeTab, setActiveTab] = useState<"dashboard" | "create" | "status" | "notifications">("dashboard");
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  
  // Custom Filters for Status Board
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [urgencyFilter, setUrgencyFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Create Task form state
  const [formState, setFormState] = useState({
    residentName: "",
    careNote: "",
    urgency: "Medium" as "Routine" | "Medium" | "Urgent",
    visitWindow: "Morning (09:00 - 12:00)",
    carerPresent: false,
    mockPhotoUrl: "",
    fullAddress: "",
    postcode: "",
    keysafeCode: ""
  });

  // AI Review Suggestions States
  const [aiSuggestions, setAiSuggestions] = useState<any[] | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Selected Task Detail State for Drawer / Modal
  const [selectedDetailedTask, setSelectedDetailedTask] = useState<Task | null>(null);

  // JWT and API Simulation logs for visual operational trust (non-telemetry)
  const [jwtToken, setJwtToken] = useState<string>("");
  const [apiLogs, setApiLogs] = useState<{method: string; url: string; status: number; time: string}[]>([]);

  // Simple Notification Alerts state
  const [notifications, setNotifications] = useState<any[]>([
    { id: "n-1", type: "success", text: "Task approved: Bramble clearance for Margaret Knowles matched safely with local handyman network.", time: "10 mins ago", read: false },
    { id: "n-2", type: "info", text: "Handyman David checked in at 104 Orchard Lane for Margaret Knowles' garden path.", time: "1 hour ago", read: false },
    { id: "n-3", type: "warning", text: "Confirmation action pending: Backdoor kitchen lock repairs for Eileen Patterson is awaiting your approval.", time: "2 hours ago", read: false },
    { id: "n-4", type: "info", text: "Vetted handrail repair completed successfully for Ronald Sutherland last night.", time: "Yesterday", read: true }
  ]);

  // Generate a mock JWT on load to visually demonstrate role-based secure token routing
  useEffect(() => {
    const randomHex = () => Math.random().toString(16).substring(2, 10).toUpperCase();
    const mockJwt = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiU2FyYWggSmVua2lucyIsInJvbGUiOiJDYXJlIENvb3JkaW5hdG9yIiwiY29tcGFueSI6IlByaW1yb3NlIENhcmUgU2VydmljZXMiLCJhdXRoX3Njb3BlcyI6WyJjcmVhdGU6dGFza3MiLCJyZWFkOnRhc2tzIiwiYXBwcm92ZTp0YXNrcyJdfQ.${randomHex()}.${randomHex()}`;
    setJwtToken(mockJwt);
    
    // Log initial Auth API Call
    addApiLog("POST", "/auth/login", 200);
    addApiLog("GET", "/tasks", 200);
  }, []);

  // Responsive mobile menu and universal quick-action command palette states
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [commandSearch, setCommandSearch] = useState("");

  // Global hotkeys listener to switch views instantly
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
        setSelectedDetailedTask(null);
        setMobileMenuOpen(false);
      } else if (key === "c") {
        setActiveTab("create");
        setSelectedDetailedTask(null);
        setMobileMenuOpen(false);
      } else if (key === "s") {
        setActiveTab("status");
        setSelectedDetailedTask(null);
        setMobileMenuOpen(false);
      } else if (key === "n") {
        setActiveTab("notifications");
        setSelectedDetailedTask(null);
        setMobileMenuOpen(false);
      } else if (key === "/" || (e.ctrlKey && key === "k") || (e.metaKey && key === "k")) {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const addApiLog = (method: string, url: string, status: number) => {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    setApiLogs(prev => [{ method, url, status, time: timeStr }, ...prev.slice(0, 4)]);
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Run AI Mock Parser
  const handleAnalyzeNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.residentName || !formState.careNote) {
      showToast("Please enter resident name and care note details.");
      return;
    }

    setAnalyzing(true);
    addApiLog("POST", "/ai/analyze-safety-notes", 200);

    setTimeout(() => {
      // Intelligently parse the note content into multiple issues if we find keywords
      const noteLower = formState.careNote.toLowerCase();
      const suggestionsList: any[] = [];
      const initials = formState.residentName.split(" ").map(w => w[0]).join(".") || "R.U.";

      // Categories to scan for
      const matchedCategories: string[] = [];
      if (noteLower.includes("lawn") || noteLower.includes("mow") || noteLower.includes("grass")) {
        matchedCategories.push("Lawn mowing");
      }
      if (noteLower.includes("garden") || noteLower.includes("clearance") || noteLower.includes("bramble") || noteLower.includes("weed") || noteLower.includes("overgrowth")) {
        matchedCategories.push("Garden clearance");
      }
      if (noteLower.includes("window")) matchedCategories.push("Window cleaning");
      if (noteLower.includes("path") || noteLower.includes("pavement") || noteLower.includes("slippery") || noteLower.includes("gravel")) {
        matchedCategories.push("Path clearing");
      }
      if (noteLower.includes("rail") || noteLower.includes("handrail") || noteLower.includes("grab") || noteLower.includes("loose")) {
        matchedCategories.push("Loose rail repair");
      }
      if (noteLower.includes("lock") || noteLower.includes("door lock") || noteLower.includes("sticking")) {
        matchedCategories.push("Lock repairs");
      }
      if (noteLower.includes("cleaning") || noteLower.includes("wash") || noteLower.includes("deep clean")) {
        matchedCategories.push("Deep cleaning");
      }
      if (noteLower.includes("boilers") || noteLower.includes("boiler") || noteLower.includes("appliance") || noteLower.includes("electrical") || noteLower.includes("fire check")) {
        matchedCategories.push("Appliance safety checks");
      }
      if (noteLower.includes("hazard") || noteLower.includes("wire") || noteLower.includes("extension") || noteLower.includes("slip") || noteLower.includes("fall")) {
        matchedCategories.push("Trip hazard removal");
      }

      // If no categories were parsed, default to "Trip hazard removal"
      if (matchedCategories.length === 0) {
        matchedCategories.push("Trip hazard removal");
      }

      // Populate AI-extracted suggested subtasks
      matchedCategories.forEach((cat, index) => {
        let textSummary = `Resolve safety feedback: ${cat.toLowerCase()} to restore resident mobility and peace of mind.`;
        let safeguardingRating = true; // default safeguarding true for vulnerable elderly adults

        if (cat === "Lawn mowing") {
          textSummary = `Mow overgrown grass in front/rear yard to clear clear pathway visibility.`;
          safeguardingRating = false; // outdoor garden doesn't always need face-to-face inside
        } else if (cat === "Lock repairs") {
          textSummary = `Examine and remediate sticky or loose security barrel lock assembly.`;
        } else if (cat === "Loose rail repair") {
          textSummary = `Securely tighten and reinforce wall mounts for entrance safety hand rail.`;
        } else if (cat === "Path clearing") {
          textSummary = `Scrape, pressure clean, or cut back overgrown thorns to secure main walkway.`;
        } else if (cat === "Trip hazard removal") {
          textSummary = `Clear loose tripping blockages, debris or loose wires off living room carpet.`;
        }

        suggestionsList.push({
          id: `SUG-${index + 101}`,
          category: cat,
          summary: textSummary,
          urgency: formState.urgency,
          safeguardingApplies: safeguardingRating,
          preferredWindow: formState.visitWindow,
          carerPresent: formState.carerPresent,
          photoUrl: formState.mockPhotoUrl || undefined,
          fullAddress: formState.fullAddress || "",
          postcode: formState.postcode || "",
          keysafeCode: formState.keysafeCode || ""
        });
      });

      setAiSuggestions(suggestionsList);
      setAnalyzing(false);
      showToast("AI safety summary analyzed successfully!");
    }, 1200);
  };

  // Approve AI suggested tasks into Assignment Board
  const handleApproveSuggestions = () => {
    if (!aiSuggestions || aiSuggestions.length === 0) return;

    addApiLog("POST", "/tasks/batch-save", 201);
    
    const initials = formState.residentName.split(" ").map(w => w[0]).join(".") || "R.U.";
    
    // Convert suggestions to real tasks
    const newTasks: Task[] = aiSuggestions.map((sug, index) => {
      const now = new Date();
      const dateString = now.toISOString().split('T')[0] + " " + now.toTimeString().split(' ')[0].substring(0, 5);
      return {
        id: `TB-${Math.floor(105 + Math.random() * 800)}`,
        residentInitials: initials,
        residentFullName: formState.residentName,
        originalCareNote: formState.careNote,
        category: sug.category,
        summary: sug.summary,
        urgency: sug.urgency,
        safeguardingApplies: sug.safeguardingApplies,
        preferredWindow: sug.preferredWindow,
        carerPresent: sug.carerPresent,
        fullAddress: sug.fullAddress || formState.fullAddress,
        postcode: sug.postcode || formState.postcode,
        keysafeCode: sug.keysafeCode || formState.keysafeCode,
        status: "Pending TaskBridge Assignment",
        timeline: [
          { status: "Awaiting Care Approval", timestamp: dateString, note: "Original Care report submitted." },
          { status: "Pending TaskBridge Assignment", timestamp: dateString, note: "Approved for deployment queue." }
        ]
      };
    });

    setTasks(prev => [...newTasks, ...prev]);
    
    // Add simple notification to Alert log
    setNotifications(prev => [
      {
        id: `n-${Date.now()}`,
        type: "success",
        text: `Approved task for assignment: ${newTasks[0].category} is now waiting for active handyman matching.`,
        time: "Just now",
        read: false
      },
      ...prev
    ]);

    // reset forms
    setFormState({
      residentName: "",
      careNote: "",
      urgency: "Medium",
      visitWindow: "Morning (09:00 - 12:00)",
      carerPresent: false,
      mockPhotoUrl: "",
      fullAddress: "",
      postcode: "",
      keysafeCode: ""
    });
    setAiSuggestions(null);
    setActiveTab("status");
    showToast(`Successfully queued ${newTasks.length} task(s) for TaskBridge routing.`);
  };

  // Simulate handyman status transitions so developers/managers can review live portal behaviors
  const handleSimulateStatusAdvance = (taskId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        addApiLog("PATCH", `/tasks/${taskId}/transition`, 200);
        let nextStatus = t.status;
        let details = { ...t };
        let note = "";

        if (t.status === "Pending TaskBridge Assignment") {
          nextStatus = "Assigned";
          details.assignedHandyman = {
            firstName: "Richard",
            company: "Silverline Domestic Responders",
            scheduledWindow: "Tomorrow at 9:00 AM",
            dbsVerifiedStatus: "Enhanced DBS Checked & Active"
          };
          note = "DBS validation matched. Handyman assigned dynamically.";
        } else if (t.status === "Assigned") {
          nextStatus = "Checked In";
          note = "Operator checked in on site via mobile secure geofence.";
        } else if (t.status === "Checked In") {
          nextStatus = "Awaiting Care Confirmation";
          details.beforePhotoUrl = "https://images.unsplash.com/photo-1518331647614-7a1f04db3437?q=80&w=600&auto=format&fit=crop"; // before
          details.afterPhotoUrl = "https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=600&auto=format&fit=crop"; // after
          details.completionNotes = "Loose screw refastened, tested support weight capacity successfully.";
          note = "Work fully executed. Evidence log ready for coordinator validation.";
        } else if (t.status === "Awaiting Care Confirmation") {
          nextStatus = "Completed";
          note = "Coordinator verified completion of work.";
        }

        const now = new Date();
        const dateString = now.toISOString().split('T')[0] + " " + now.toTimeString().split(' ')[0].substring(0, 5);

        return {
          ...details,
          status: nextStatus,
          timeline: [...t.timeline, { status: nextStatus, timestamp: dateString, note }]
        };
      }
      return t;
    }));

    showToast("Status simulation step successfully advanced.");
  };

  // Confirm / complete workflow action
  const handleConfirmCompletion = (taskId: string, action: "APPROVE" | "ISSUE", remarks?: string) => {
    addApiLog("POST", `/tasks/${taskId}/verify`, 200);
    
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const now = new Date();
        const dateString = now.toISOString().split('T')[0] + " " + now.toTimeString().split(' ')[0].substring(0, 5);
        
        if (action === "APPROVE") {
          return {
            ...t,
            status: "Completed",
            timeline: [...t.timeline, { status: "Completed", timestamp: dateString, note: `Completion verified by Care Coordinator Sarah Jenkins.` }]
          };
        } else {
          return {
            ...t,
            status: "Awaiting Care Approval", // Send back to draft/approval review
            timeline: [...t.timeline, { status: "Awaiting Care Approval", timestamp: dateString, note: `Issues flagged during assessment: ${remarks}` }]
          };
        }
      }
      return t;
    }));

    if (activeTab === "status" && selectedDetailedTask?.id === taskId) {
      setSelectedDetailedTask(null);
    }

    setNotifications(prev => [
      {
        id: `n-${Date.now()}`,
        type: action === "APPROVE" ? "success" : "warning",
        text: action === "APPROVE" 
          ? `Work confirmed: Resident task ${taskId} completed and archived safely.` 
          : `Feedback dispatch flagged: ${taskId} reported for follow-up review.`,
        time: "Just now",
        read: false
      },
      ...prev
    ]);

    showToast(action === "APPROVE" ? "Care completed confirmed successfully." : "Issue successfully flagged for handyman network.");
  };

  // Filter tasks based on settings
  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.residentFullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All" || t.status === statusFilter;
    const matchesUrgency = urgencyFilter === "All" || t.urgency === urgencyFilter;
    return matchesSearch && matchesStatus && matchesUrgency;
  });

  // Count helper functions for Dashboard Widgets
  const counts = {
    openTasks: tasks.filter(t => t.status !== "Completed").length,
    awaitingAssignment: tasks.filter(t => t.status === "Pending TaskBridge Assignment").length,
    assigned: tasks.filter(t => t.status === "Assigned" || t.status === "Visit Scheduled" || t.status === "Checked In").length,
    awaitingConfirmation: tasks.filter(t => t.status === "Awaiting Care Confirmation").length,
    completedMonth: tasks.filter(t => t.status === "Completed").length
  };

  // Helper for status badge color matching
  const getStatusBadge = (status: string) => {
    switch(status) {
      case "Draft":
        return <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-200">Draft</span>;
      case "Awaiting Care Approval":
        return <span className="bg-orange-50 text-orange-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-orange-100">Awaiting Care Approval</span>;
      case "Pending TaskBridge Assignment":
        return <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-100 uppercase tracking-wide">Awaiting Assignment</span>;
      case "Assigned":
        return <span className="bg-sky-50 text-sky-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-sky-100">Handyman Assigned</span>;
      case "Visit Scheduled":
        return <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-100">Visit Scheduled</span>;
      case "Checked In":
        return <span className="bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-100 animate-pulse">● On Site checking</span>;
      case "Awaiting Care Confirmation":
        return <span className="bg-rose-100 text-rose-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-rose-200 animate-pulse">Pending Review</span>;
      case "Completed":
        return <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-100 flex items-center gap-1 max-w-fit"><Check className="h-3 w-3" /> Completed</span>;
      default:
        return <span className="bg-slate-50 text-slate-600 text-xs px-2 py-0.5 rounded">{status}</span>;
    }
  };

  return (
    <div className={`min-h-[85vh] bg-slate-50 text-slate-800 relative z-10 ${isFullWidth ? "p-0 md:p-3" : "p-0 md:p-6"} text-left transition-all duration-300`}>
      {/* Toast Notification popup */}
      {toastMessage && (
        <div className="fixed top-16 right-4 sm:right-6 bg-slate-900 border border-slate-800 text-white rounded-xl shadow-xl px-4 py-3 text-xs flex items-center gap-2.5 z-50 animate-bounce">
          <Sparkles className="h-4 w-4 text-rose-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className={`mx-auto ${isFullWidth ? "max-w-none w-full rounded-none" : "max-w-7xl rounded-none md:rounded-3xl"} bg-white border border-slate-200 shadow-xl overflow-hidden min-h-[750px] flex flex-col lg:flex-row transition-all duration-300`}>
        
        {/* Mobile Navbar Header */}
        <div className="lg:hidden bg-slate-900 border-b border-slate-800 text-white px-5 py-4 flex items-center justify-between z-30 shrink-0">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-rose-500 to-amber-500 flex items-center justify-center text-white">
              <Shield className="h-4 w-4" />
            </div>
            <span className="font-display font-bold text-sm text-white">TaskBridge Portal</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition-colors"
              title="Search and shortcuts"
            >
              <Search className="h-4 w-4" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-lg bg-slate-850 text-slate-300 hover:text-white transition-colors border border-slate-700/50"
            >
              {mobileMenuOpen ? <X className="h-4 w-4 text-rose-450" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* ================= PORTAL LEFT COLUMN SIDEBAR ================= */}
        <aside className={`lg:w-72 bg-slate-900 text-slate-300 p-6 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800 shrink-0 transition-all duration-305 ${mobileMenuOpen ? "block" : "hidden lg:flex"}`}>
          <div className="space-y-6">
            
            {/* Logo/Identity Section */}
            <a href="#" className="block space-y-2 pb-4 border-b border-slate-800 text-left hover:opacity-90 transition-opacity">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-rose-500 to-amber-500 flex items-center justify-center text-white">
                  <Shield className="h-4 w-4" />
                </div>
                <h2 className="font-display font-extrabold text-base tracking-tight text-white">TaskBridge</h2>
              </div>
              <p className="font-mono text-[9px] text-slate-400 tracking-wider">SECURE MIDDLEWARE WORKSPACE</p>
            </a>

            {/* Coordinator Identity Badge */}
            <div className="bg-slate-950/50 rounded-2xl p-4 border border-slate-800/80 space-y-1">
              <div className="flex items-center gap-2.5 text-left">
                <div className="h-7 w-7 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center text-[10px] font-bold font-mono">
                  SJ
                </div>
                <div>
                  <h3 className="font-sans font-bold text-xs text-white">Sarah Jenkins</h3>
                  <p className="font-mono text-[9px] text-rose-400 font-bold uppercase tracking-wide">Care Coordinator</p>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-800 flex items-center gap-1.5 text-xs text-slate-400">
                <Building className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                <span className="truncate font-sans text-[10px]">Primrose Care Services</span>
              </div>
            </div>

            {/* Portal Action Navigation */}
            <nav className="space-y-1 text-left select-none">
              <button
                onClick={() => { setActiveTab("dashboard"); setSelectedDetailedTask(null); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-sans text-xs font-semibold transition-all ${
                  activeTab === "dashboard"
                    ? "bg-slate-800 text-white shadow-inner font-bold"
                    : "hover:bg-slate-800/40 text-slate-400 hover:text-slate-200"
                }`}
              >
                <Activity className={`h-4 w-4 ${activeTab === "dashboard" ? "text-rose-400" : "text-slate-500"}`} />
                <span>Executive Dashboard</span>
              </button>

              <button
                onClick={() => { setActiveTab("create"); setSelectedDetailedTask(null); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-sans text-xs font-semibold transition-all ${
                  activeTab === "create"
                    ? "bg-slate-800 text-white shadow-inner font-bold"
                    : "hover:bg-slate-800/40 text-slate-400 hover:text-slate-200"
                }`}
              >
                <Plus className={`h-4 w-4 ${activeTab === "create" ? "text-rose-400" : "text-slate-500"}`} />
                <span>Create Safety Task</span>
              </button>

              <button
                onClick={() => { setActiveTab("status"); setSelectedDetailedTask(null); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-sans text-xs font-semibold transition-all ${
                  activeTab === "status"
                    ? "bg-slate-800 text-white shadow-inner font-bold"
                    : "hover:bg-slate-800/40 text-slate-400 hover:text-slate-200"
                }`}
              >
                <ClipboardCheck className={`h-4 w-4 ${activeTab === "status" ? "text-rose-400" : "text-slate-500"}`} />
                <span>Task Status Board</span>
                <span className="ml-auto bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full">
                  {counts.openTasks}
                </span>
              </button>

              <button
                onClick={() => { setActiveTab("notifications"); setSelectedDetailedTask(null); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-sans text-xs font-semibold transition-all ${
                  activeTab === "notifications"
                    ? "bg-slate-800 text-white shadow-inner font-bold"
                    : "hover:bg-slate-800/40 text-slate-400 hover:text-slate-200"
                }`}
              >
                <Bell className={`h-4 w-4 ${activeTab === "notifications" ? "text-rose-400" : "text-slate-500"}`} />
                <span>Operational Alerts</span>
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="ml-auto bg-amber-500 text-slate-950 text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                    {notifications.filter(n => !n.read).length}
                  </span>
                )}
              </button>
            </nav>

            {/* Workspace View Options (Automatic Header & Width Control Script) */}
            <div className="pt-4 border-t border-slate-800 space-y-2 text-left">
              <span className="font-mono text-[8px] font-bold text-slate-500 uppercase tracking-widest block">Dashboard Display Settings</span>
              
              <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/60 text-xs text-slate-300 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-sans font-medium text-[11px]">Fluid Full-Width</span>
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
                  <span className="font-sans font-medium text-[11px]">Collapse Top Headers</span>
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



          </div>

          {/* Secure Sign-out footer */}
          <div className="pt-6 mt-6 border-t border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-slate-500 text-[10px] font-mono leading-none bg-slate-950/30 p-2 border border-slate-800 rounded-xl">
              <Lock className="h-3 w-3 text-rose-500 shrink-0" />
              <span className="truncate">Active SSL Session V26</span>
            </div>
            <button
              onClick={onSignOut}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-800/60 hover:bg-rose-500/10 hover:text-rose-400 text-slate-400 font-sans text-xs font-semibold py-2.5 px-4 border border-transparent hover:border-rose-500/20 transition-all cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Secure Sign-Out</span>
            </button>
          </div>
        </aside>

        {/* ================= PORTAL MAIN CONTENT CANVAS ================= */}
        <main className="flex-1 bg-slate-50/50 p-4 sm:p-8 overflow-y-auto max-h-[85vh] text-left">
          
          {/* ================= SEGMENT 1: EXECUTIVE DASHBOARD ================= */}
          {activeTab === "dashboard" && (
            <div className="space-y-8 animate-fade-in text-left">
              <div>
                <span className="font-mono text-[9px] font-bold text-rose-500 uppercase tracking-widest bg-rose-500/5 border border-rose-500/15 px-2.5 py-1 rounded-full">
                  Primary Coordination Console
                </span>
                <h1 className="font-display font-extrabold text-2xl sm:text-3xl tracking-tight text-slate-900 mt-2">
                  Welcome back, Sarah
                </h1>
                <p className="font-sans text-xs text-slate-500 mt-1 max-w-xl">
                  Here is the status of active safeguarding dispatches, hazardous audits, and handyman checks for <strong className="text-slate-800">Primrose Care Services</strong>.
                </p>
              </div>

              {/* Status KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
                {/* KPI 1 */}
                <div onClick={() => { setActiveTab("status"); setStatusFilter("All"); }} className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-sm cursor-pointer hover:border-rose-300 transition-all text-left">
                  <div className="text-slate-400 font-mono text-[10px] uppercase font-bold tracking-wider">Active Tasks</div>
                  <div className="font-display font-extrabold text-2xl text-slate-900 mt-2">{counts.openTasks}</div>
                  <div className="text-slate-500 text-[10px] mt-1 font-sans">Required attention</div>
                </div>

                {/* KPI 2 */}
                <div onClick={() => { setActiveTab("status"); setStatusFilter("Pending TaskBridge Assignment"); }} className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-sm cursor-pointer hover:border-rose-300 transition-all text-left">
                  <div className="text-slate-400 font-mono text-[10px] uppercase font-bold tracking-wider">Awaiting Match</div>
                  <div className="font-display font-extrabold text-2xl text-rose-600 mt-2">{counts.awaitingAssignment}</div>
                  <div className="text-slate-500 text-[10px] mt-1 font-sans">TaskBridge dispatch queue</div>
                </div>

                {/* KPI 3 */}
                <div onClick={() => { setActiveTab("status"); setStatusFilter("Assigned"); }} className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-sm cursor-pointer hover:border-rose-300 transition-all text-left">
                  <div className="text-slate-400 font-mono text-[10px] uppercase font-bold tracking-wider">Assigned Jobs</div>
                  <div className="font-display font-extrabold text-2xl text-indigo-600 mt-2">{counts.assigned}</div>
                  <div className="text-slate-500 text-[10px] mt-1 font-sans">Operatives matched</div>
                </div>

                {/* KPI 4 */}
                <div onClick={() => { setActiveTab("status"); setStatusFilter("Awaiting Care Confirmation"); }} className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-sm cursor-pointer hover:border-rose-300 transition-all relative text-left">
                  <div className="text-rose-600 font-mono text-[10px] uppercase font-bold tracking-wider">Pending Review</div>
                  <div className="font-display font-extrabold text-2xl text-rose-500 mt-2 flex items-center gap-1.5">
                    {counts.awaitingConfirmation}
                    {counts.awaitingConfirmation > 0 && <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />}
                  </div>
                  <div className="text-slate-500 text-[10px] mt-1 font-sans">Upload evidence ready</div>
                </div>

                {/* KPI 5 */}
                <div onClick={() => { setActiveTab("status"); setStatusFilter("Completed"); }} className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-sm cursor-pointer hover:border-rose-300 transition-all text-left">
                  <div className="text-emerald-600 font-mono text-[10px] uppercase font-bold tracking-wider">Resolved</div>
                  <div className="font-display font-extrabold text-2xl text-emerald-600 mt-2">{counts.completedMonth}</div>
                  <div className="text-slate-500 text-[10px] mt-1 font-sans">Completed this month</div>
                </div>
              </div>

              {/* Grid: TaskBridge Safety Hub & Notifications preview */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
                {/* Recent Activities and Quick Creation Entry */}
                <div className="lg:col-span-8 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h2 className="font-display font-bold text-base text-slate-900">Urgent Protection Watch</h2>
                      <p className="text-[11px] text-slate-500 mt-0.5">High-priority safety tickets requiring active safeguarding reviews.</p>
                    </div>
                    <button
                      onClick={() => setActiveTab("status")}
                      className="text-xs font-semibold text-rose-600 hover:text-rose-700 underline transition-colors"
                    >
                      View all status board
                    </button>
                  </div>

                  {/* Task Mini-List */}
                  <div className="space-y-3.5">
                    {tasks.filter(t => t.status !== "Completed").slice(0, 3).map(task => (
                      <div 
                        key={task.id} 
                        className="p-4 rounded-xl border border-slate-150 bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-left"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] font-bold text-slate-400">{task.id}</span>
                            <span className="font-semibold text-slate-900 text-xs">{task.residentFullName} ({task.residentInitials})</span>
                            {task.urgency === "Urgent" && (
                              <span className="font-sans text-[8px] bg-rose-50 text-rose-600 border border-rose-100 font-bold px-1.5 py-0.5 rounded">URGENT</span>
                            )}
                          </div>
                          <p className="text-xs font-semibold text-slate-700 font-sans italic">"{task.summary}"</p>
                          <div className="flex items-center gap-3 text-[10px] text-slate-500 font-sans pt-1">
                            <span className="bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-mono text-[9px] uppercase font-bold">{task.category}</span>
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3 text-slate-400" /> {task.preferredWindow}</span>
                          </div>
                        </div>

                        <div className="flex flex-row sm:flex-col items-end gap-2 shrink-0">
                          {getStatusBadge(task.status)}
                          <div className="flex items-center gap-1.5">
                            {task.status === "Awaiting Care Confirmation" ? (
                              <button
                                onClick={() => { setSelectedDetailedTask(task); setActiveTab("status"); }}
                                className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] px-2.5 py-1 rounded transition-all shadow-sm shadow-rose-500/10"
                              >
                                Review Evidence
                              </button>
                            ) : (
                              <button
                                onClick={() => { setSelectedDetailedTask(task); setActiveTab("status"); }}
                                className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-[10px] px-2.5 py-1 rounded transition-all"
                              >
                                View Details
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    {tasks.filter(t => t.status !== "Completed").length === 0 && (
                      <div className="py-12 text-center text-slate-400 font-sans text-xs">
                        <CheckCircle2 className="h-8 w-8 text-slate-200 mx-auto mb-2" />
                        <p>No active care-dispatches currently pending. Great job!</p>
                      </div>
                    )}
                  </div>

                  {/* Middleware disclaimer banner */}
                  <div className="bg-rose-50/40 border border-rose-100 rounded-xl p-4 flex gap-3 text-left">
                    <Shield className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                    <div className="space-y-1 font-sans text-[11px] text-slate-600 leading-relaxed">
                      <p className="font-bold text-slate-800">TaskBridge Safeguarding Isolation active</p>
                      <p>
                        As a Care Coordinator, your workspace hides background matching algorithms, payment authorizations, and vetting databases. This ensures the total containment of vulnerable-adult records. Handyman credentials and Enhanced DBS validations are checked automatically before on-site matching.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Notifications Panel Right */}
                <div className="lg:col-span-4 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <h2 className="font-display font-bold text-base text-slate-900">Coordination Alerts</h2>
                        <p className="text-[11px] text-slate-500 mt-0.5">Real-time status changes from clean providers.</p>
                      </div>
                      <button 
                        onClick={() => setActiveTab("notifications")} 
                        className="text-xs text-rose-600 hover:text-rose-700 underline font-semibold"
                      >
                        View all
                      </button>
                    </div>

                    <div className="space-y-3">
                      {notifications.slice(0, 4).map(notif => (
                        <div 
                          key={notif.id} 
                          className={`p-3 rounded-xl border flex gap-2.5 text-left text-[11px] font-sans ${
                            notif.read ? "bg-slate-50 text-slate-500 border-slate-100" : "bg-rose-50/30 text-slate-700 border-rose-100/60 font-semibold"
                          }`}
                        >
                          <div className="mt-0.5 shrink-0">
                            {notif.type === "success" && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                            {notif.type === "warning" && <AlertTriangle className="h-4 w-4 text-rose-500" />}
                            {notif.type === "info" && <CheckCircle2 className="h-4 w-4 text-indigo-500" />}
                          </div>
                          <div>
                            <p>{notif.text}</p>
                            <span className="text-[9px] font-mono text-slate-400 block mt-1">{notif.time}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-150">
                    <button
                      onClick={() => setActiveTab("create")}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-sans text-xs font-bold py-3 shadow transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Log New Safety Note</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= SEGMENT 2: CREATE SAFETY TASK ================= */}
          {activeTab === "create" && (
            <div className="space-y-8 animate-fade-in text-left">
              <div>
                <span className="font-mono text-[9px] font-bold text-rose-500 uppercase tracking-widest bg-rose-50/5 border border-rose-500/15 px-2.5 py-1 rounded-full">
                  Step-by-Step Dispatch Setup
                </span>
                <h1 className="font-display font-extrabold text-2xl sm:text-3xl tracking-tight text-slate-900 mt-2">
                  Create Safety Task
                </h1>
                <p className="font-sans text-xs text-slate-500 mt-1 max-w-xl">
                  Log raw note comments directly from carer logs. Our AI assistant will automatically parse and modularize the note into separate safety actions in the next step.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
                {/* Creation Form Column */}
                <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
                  
                  {/* Quick-select template suggestions */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">Template Note Examples (Test Multiple Issues)</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {SUGGESTIONS_NOTE_TEMPLATES.map((tmpl, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setFormState({
                            ...formState,
                            residentName: idx === 0 ? "Margaret Knowles" : "Ronald Sutherland",
                            careNote: tmpl.text,
                            urgency: idx === 0 ? "Medium" : "Urgent",
                            carerPresent: true,
                            fullAddress: idx === 0 ? "104 Orchard Lane, Manchester" : "44 Beechwood Drive, Leeds",
                            postcode: idx === 0 ? "M14 5TQ" : "LS2 8PJ",
                            keysafeCode: idx === 0 ? "K8955" : "C4412"
                          })}
                          className="p-3 rounded-xl border border-slate-200 hover:border-rose-400 bg-slate-50/50 hover:bg-rose-50/10 text-left transition-all text-[11px] font-sans space-y-1 block cursor-pointer group"
                        >
                          <p className="font-bold text-slate-800 group-hover:text-rose-700">{tmpl.title}</p>
                          <p className="text-slate-500 line-clamp-2 italic">"{tmpl.text}"</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <form onSubmit={handleAnalyzeNote} className="space-y-5">
                    {/* Resident Name */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Resident Full Name</label>
                      <input
                        type="text"
                        required
                        placeholder="E.g., Margaret Knowles"
                        value={formState.residentName}
                        onChange={(e) => setFormState({ ...formState, residentName: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-rose-500 focus:border-rose-500 transition-shadow font-sans"
                      />
                    </div>

                    {/* Care Note text area */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Raw Carer Note (Allows Multiple Issues)</label>
                        <span className="text-[9px] text-rose-500 bg-rose-50/60 border border-rose-100 font-bold px-1.5 py-0.5 rounded">AI Extraction Active</span>
                      </div>
                      <textarea
                        required
                        rows={5}
                        placeholder="E.g. Margaret has overgrown weeds across her driveway path, making it extremely slippery when wet. Also, we noticed her backyard patio light is completely smashed, so she cannot navigate the recycling bins safely at night."
                        value={formState.careNote}
                        onChange={(e) => setFormState({ ...formState, careNote: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-rose-500 focus:border-rose-500 transition-shadow font-sans italic"
                      />
                      <span className="text-[10px] text-slate-400 block mt-1 leading-normal font-sans">
                        Tip: You can submit continuous text reflecting multiple issues (e.g. locks, lawns, rails). The TaskBridge AI middleware will decompose these into individual, trackable dispatch orders.
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Urgency */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Urgency Rating</label>
                        <select
                          value={formState.urgency}
                          onChange={(e: any) => setFormState({ ...formState, urgency: e.target.value })}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-rose-500 focus:border-rose-500"
                        >
                          <option value="Routine">Routine (Non-urgent fix)</option>
                          <option value="Medium">Medium (Preventative risk)</option>
                          <option value="Urgent">Urgent (Immediate fall/safety hazard)</option>
                        </select>
                      </div>

                      {/* Time visit window */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Preferred Visit Window</label>
                        <select
                          value={formState.visitWindow}
                          onChange={(e) => setFormState({ ...formState, visitWindow: e.target.value })}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-rose-500 focus:border-rose-500"
                        >
                          <option>Morning (09:00 - 12:00)</option>
                          <option>Afternoon (12:00 - 16:00)</option>
                          <option>Flexible Day</option>
                        </select>
                      </div>
                    </div>

                    {/* Access & Location Details */}
                    <div className="bg-slate-100/50 border border-slate-200 rounded-2xl p-4.5 space-y-4 text-xs font-sans text-left">
                      <h4 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                        <MapPin className="h-4 w-4 text-rose-500" />
                        <span>Resident Address & Easy Accessibility</span>
                      </h4>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2 space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Full Address</label>
                          <input
                            type="text"
                            required
                            placeholder="E.g. 104 Orchard Lane, Manchester"
                            value={formState.fullAddress}
                            onChange={(e) => setFormState({ ...formState, fullAddress: e.target.value })}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-rose-500"
                          />
                        </div>
                        
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Postcode</label>
                          <input
                            type="text"
                            required
                            placeholder="E.g. M14 5TQ"
                            value={formState.postcode}
                            onChange={(e) => setFormState({ ...formState, postcode: e.target.value })}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-rose-500 uppercase font-semibold"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                            <span>Secure Keysafe Code</span>
                            <span className="text-[8px] bg-indigo-650 text-white px-1.5 py-0.5 rounded font-mono font-extrabold uppercase shrink-0">DBS Encrypted Gate</span>
                          </label>
                          <span className="text-[9px] text-slate-400">Optional</span>
                        </div>
                        <input
                          type="text"
                          placeholder="E.g. C1234X"
                          value={formState.keysafeCode}
                          onChange={(e) => setFormState({ ...formState, keysafeCode: e.target.value })}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-rose-500 font-mono text-sm tracking-wide font-bold"
                        />
                        <p className="text-[9px] text-slate-500 leading-normal">
                          *Keysafe Safety Protocols: The resident's keysafe code is held within a **tamper-proof operational ledger** and is **ONLY released** onto the handyman's screen if they hold certified **Enhanced DBS clearance** and have completed active GPS-verification at the door.
                        </p>
                      </div>
                    </div>

                    {/* Carer Present and Photo mockup */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                      <label className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-slate-150 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={formState.carerPresent}
                          onChange={(e) => setFormState({ ...formState, carerPresent: e.target.checked })}
                          className="rounded text-rose-500 focus:ring-rose-500 h-4 w-4"
                        />
                        <div className="text-left font-sans text-xs">
                          <p className="font-semibold text-slate-800">Carer on site</p>
                          <p className="text-[10px] text-slate-500">A security carer will assist the handyman check-in</p>
                        </div>
                      </label>

                      {/* Photo upload mock */}
                      <button
                        type="button"
                        onClick={() => {
                          setFormState({
                            ...formState,
                            mockPhotoUrl: "https://images.unsplash.com/photo-1558904541-efa8c1a6b40a?q=80&w=600&auto=format&fit=crop"
                          });
                          showToast("Mock safety photo attached successfully!");
                        }}
                        className={`inline-flex items-center justify-center gap-2 rounded-xl border font-sans text-xs font-semibold py-3.5 px-4 transition-all border-dashed ${
                          formState.mockPhotoUrl 
                            ? "bg-rose-50 text-rose-600 border-rose-300"
                            : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        <UploadCloud className="h-4 w-4" />
                        <span>{formState.mockPhotoUrl ? "Photo Attached (1)" : "Simulate Note Photo Upload"}</span>
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={analyzing}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:bg-slate-500 text-white font-sans text-sm font-bold py-3.5 shadow-md transition-colors"
                    >
                      {analyzing ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin text-white" />
                          <span>AI Extracting Safety Actions...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 text-amber-300 fill-amber-300" />
                          <span>Process with TaskBridge AI Summary Generator</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {/* Right Side Info: Service Category Catalog & System Integrations */}
                <div className="lg:col-span-5 space-y-6">
                  {/* Active service category verification widget */}
                  <div className="bg-gradient-to-b from-slate-900 to-slate-950 text-slate-200 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-4">
                    <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
                      <Shield className="h-5 w-5 text-rose-400" />
                      <div>
                        <h3 className="font-display font-bold text-sm text-white">Vetted Domestic Repair catalog</h3>
                        <p className="text-[10px] text-slate-400 font-sans">9 Standard safe areas compatible with most leading care platforms</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-sans text-left">
                      {[
                        "Lawn mowing", "Garden clearance", "Window cleaning",
                        "Path clearing", "Loose rail repair", "Lock repairs",
                        "Deep cleaning", "Appliance safety checks", "Trip hazard removal"
                      ].map((item, id) => (
                        <div key={id} className="flex items-center gap-1.5 p-1.5 rounded bg-slate-950/40 border border-slate-800/50">
                          <Check className="h-3.5 w-3.5 text-rose-400 shrink-0" />
                          <span className="text-[11px] truncate">{item}</span>
                        </div>
                      ))}
                    </div>

                    <p className="text-[10px] text-slate-500 leading-normal font-sans italic pt-2 border-t border-slate-800/80">
                      Attention: Any task flagged with safeguarding markers triggers automated dispatch validation, requesting an **Enhanced DBS vetted handyman**. Handyman routing metrics and payment details are shielded at all times.
                    </p>
                  </div>

                  {/* Integration disclaimer */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2 font-sans text-xs">
                    <p className="font-bold text-slate-800">TaskBridge Middleware Capabilities</p>
                    <p className="text-slate-500 leading-relaxed text-[11px]">
                      TaskBridge is built to be strictly **compatible with most leading care management applications**. Carers simply submit notes inside your standard daily software, and our API intercepts, summarizes, and schedules domestic dispatches.
                    </p>
                  </div>
                </div>
              </div>

              {/* ================= AI INLINE TASK SUMMARY REVIEW SCREEN (Section 4) ================= */}
              {aiSuggestions && (
                <div className="bg-rose-50/20 border-2 border-rose-100 rounded-3xl p-6 sm:p-8 space-y-6 animate-fade-in relative text-left">
                  <div className="absolute top-4 right-4 bg-rose-500/10 text-rose-600 font-mono text-[9px] font-bold px-2 py-0.5 rounded-full border border-rose-200">
                    Active AI Parser: TaskBridge-Deconstruct-V2
                  </div>

                  <div>
                    <h3 className="font-display font-extrabold text-xl text-slate-900 flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-rose-500 fill-rose-500" />
                      <span>Review Suggested Safety Actions ({aiSuggestions.length})</span>
                    </h3>
                    <p className="font-sans text-xs text-slate-500 mt-1 max-w-2xl">
                      The note you provided was processed. We extracted individual discrete tasks below. You may edit these details to verify correct categorizations before dispatching to the TaskBridge queue.
                    </p>
                  </div>

                  {/* Suggested Tasks Edit Cards */}
                  <div className="space-y-4">
                    {aiSuggestions.map((sug, index) => (
                      <div key={sug.id} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4 text-left">
                        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start">
                          <div className="space-y-1 bg-slate-50/50 p-2 rounded-xl border border-slate-100 w-full sm:w-auto">
                            <span className="font-mono text-[9px] font-bold text-slate-400">ACTION SUGGESTION {index + 1}</span>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs font-bold text-slate-800">Recommended Category:</span>
                              <select
                                value={sug.category}
                                onChange={(e) => {
                                  const updated = [...aiSuggestions];
                                  updated[index].category = e.target.value;
                                  setAiSuggestions(updated);
                                }}
                                className="rounded border border-slate-200 bg-white px-2 py-0.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-rose-500"
                              >
                                {[
                                  "Lawn mowing", "Garden clearance", "Window cleaning",
                                  "Path clearing", "Loose rail repair", "Lock repairs",
                                  "Deep cleaning", "Appliance safety checks", "Trip hazard removal"
                                ].map((cat, i) => (
                                  <option key={i} value={cat}>{cat}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div className="flex flex-wrap sm:flex-nowrap gap-2 items-center">
                            {/* Urgent status toggle */}
                            <select
                              value={sug.urgency}
                              onChange={(e: any) => {
                                const updated = [...aiSuggestions];
                                updated[index].urgency = e.target.value;
                                setAiSuggestions(updated);
                              }}
                              className="rounded border border-slate-200 bg-white px-2 py-1 text-[11px] font-bold focus:outline-none text-slate-700 cursor-pointer"
                            >
                              <option value="Routine">Routine Urgency</option>
                              <option value="Medium">Medium Urgency</option>
                              <option value="Urgent">Urgent priority</option>
                            </select>

                            {/* Safe guarding toggle */}
                            <button
                              type="button"
                              onClick={() => {
                                const updated = [...aiSuggestions];
                                updated[index].safeguardingApplies = !sug.safeguardingApplies;
                                setAiSuggestions(updated);
                              }}
                              className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                                sug.safeguardingApplies 
                                  ? "bg-rose-50 text-rose-700 border-rose-205"
                                  : "bg-slate-50 text-slate-500 border-slate-200"
                              }`}
                            >
                              {sug.safeguardingApplies ? "● Vetting Trigger active" : "○ Vetting bypassed"}
                            </button>

                            {/* Remove/Delete Suggested Task action */}
                            <button
                              type="button"
                              onClick={() => {
                                const updated = aiSuggestions.filter((_, i) => i !== index);
                                setAiSuggestions(updated.length > 0 ? updated : null);
                                showToast("Task suggestion discarded successfully.");
                              }}
                              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50/50 rounded-xl border border-slate-200 hover:border-rose-250 transition-colors cursor-pointer"
                              title="Discard this parsed safety action"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {/* Summary Editable Note */}
                        <div className="space-y-1">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">AI Suggested Dispatch Summary</span>
                          <input
                            type="text"
                            required
                            value={sug.summary}
                            onChange={(e) => {
                              const updated = [...aiSuggestions];
                              updated[index].summary = e.target.value;
                              setAiSuggestions(updated);
                            }}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-rose-500 focus:border-rose-500 italic font-medium"
                          />
                        </div>

                        {/* Editable Location Settings per suggest card */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-slate-100 pt-3 text-xs font-sans">
                          <div className="sm:col-span-2 space-y-1">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Full Address</span>
                            <input
                              type="text"
                              value={sug.fullAddress || ""}
                              onChange={(e) => {
                                const updated = [...aiSuggestions];
                                updated[index].fullAddress = e.target.value;
                                setAiSuggestions(updated);
                              }}
                              placeholder="E.g. 104 Orchard Lane, Manchester"
                              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-rose-500"
                            />
                          </div>
                          <div className="space-y-1">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Postcode</span>
                            <input
                              type="text"
                              value={sug.postcode || ""}
                              onChange={(e) => {
                                const updated = [...aiSuggestions];
                                updated[index].postcode = e.target.value;
                                setAiSuggestions(updated);
                              }}
                              placeholder="E.g. M14 5TQ"
                              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-rose-500 font-semibold uppercase"
                            />
                          </div>
                        </div>

                        {/* Editable Secure keysafe code per suggest card */}
                        <div className="space-y-1 pt-1 font-sans text-xs">
                          <div className="flex justify-between items-center">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Keysafe Access Code</span>
                            {sug.keysafeCode && (
                              <span className="text-[8px] text-indigo-750 bg-indigo-50 border border-indigo-150 rounded px-1.5 font-bold font-mono">DBS Vetted Handyman Release Safe</span>
                            )}
                          </div>
                          <input
                            type="text"
                            value={sug.keysafeCode || ""}
                            onChange={(e) => {
                              const updated = [...aiSuggestions];
                              updated[index].keysafeCode = e.target.value;
                              setAiSuggestions(updated);
                            }}
                            placeholder="Optional keysafe code (e.g. C1234X)"
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-rose-500 font-mono font-bold tracking-wider"
                          />
                        </div>

                        {/* Safeguarding Vetting Notification Banner */}
                        {sug.safeguardingApplies && (
                          <div className="bg-indigo-50/50 border border-indigo-100 rounded-lg p-2.5 flex items-start gap-1.5 text-[10px] text-indigo-750 font-sans leading-relaxed">
                            <Lock className="h-3.5 w-3.5 text-indigo-500 shrink-0 mt-0.5" />
                            <div>
                              <span><strong>Safeguarding Trigger:</strong> Task involves direct vulnerable resident attendance. Security keysafe code: <strong>{sug.keysafeCode || "[Not Provided]"}</strong> will only be released once <strong>Enhanced DBS checked handymen</strong> arrive-checked on site.</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3 justify-end">
                    <button
                      type="button"
                      onClick={() => setAiSuggestions(null)}
                      className="bg-slate-200 hover:bg-slate-350 text-slate-700 font-sans text-xs font-bold py-2.5 px-4 rounded-xl transition-colors cursor-pointer"
                    >
                      Reset Draft Note
                    </button>
                    <button
                      type="button"
                      onClick={handleApproveSuggestions}
                      className="bg-slate-900 hover:bg-slate-800 text-white font-sans text-xs font-bold py-2.5 px-6 rounded-xl shadow transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <span>Approve For TaskBridge Assignment</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= SEGMENT 3: TASK STATUS BOARD ================= */}
          {activeTab === "status" && (
            <div className="space-y-6 animate-fade-in text-left">
              <div>
                <span className="font-mono text-[9px] font-bold text-rose-500 uppercase tracking-widest bg-rose-52/5 border border-rose-500/15 px-2.5 py-1 rounded-full">
                  Assure Progress Monitor
                </span>
                <h1 className="font-display font-extrabold text-2xl sm:text-3xl tracking-tight text-slate-900 mt-2">
                  Task Status Board
                </h1>
                <p className="font-sans text-xs text-slate-500 mt-1 max-w-xl">
                  Inspect active safety dispatches. Note that coordinator capabilities are locked: you cannot manually assign handymen or modify vetted records.
                </p>
              </div>

              {/* Filters list */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                {/* Free Text search */}
                <div className="relative w-full md:w-72">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Search className="h-3.5 w-3.5 text-slate-400" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search by resident name or category..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>

                {/* Status and Urgency dropdown selectors */}
                <div className="flex flex-wrap gap-2.5 w-full md:w-auto">
                  {/* Status Dropdown */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-550">
                    <Filter className="h-3.5 w-3.5 text-slate-400" />
                    <span>Status:</span>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="rounded-lg border border-slate-200 bg-slate-50/50 px-2 py-1 focus:outline-none focus:ring-1 focus:ring-rose-500"
                    >
                      <option value="All">All Statuses</option>
                      <option value="Draft">Draft</option>
                      <option value="Awaiting Care Approval">Awaiting Care Approval</option>
                      <option value="Pending TaskBridge Assignment">Pending Assignment</option>
                      <option value="Assigned">Assigned</option>
                      <option value="Checked In">On Site (Checked In)</option>
                      <option value="Awaiting Care Confirmation">Awaiting Care Confirmation</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>

                  {/* Priority Select */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-550">
                    <span>Priority:</span>
                    <select
                      value={urgencyFilter}
                      onChange={(e) => setUrgencyFilter(e.target.value)}
                      className="rounded-lg border border-slate-200 bg-slate-50/50 px-2 py-1 focus:outline-none focus:ring-1 focus:ring-rose-500"
                    >
                      <option value="All">All Priorities</option>
                      <option value="Routine">Routine</option>
                      <option value="Medium">Medium</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Task Items Grid / List representation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredTasks.map(task => (
                  <div 
                    key={task.id} 
                    className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 hover:border-rose-350 transition-all text-left flex flex-col justify-between"
                  >
                    <div className="space-y-2.5">
                      {/* Top bar header */}
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[9px] font-bold text-slate-450 bg-slate-50 px-1.5 py-0.5 border border-slate-100 rounded">{task.id}</span>
                          <span className="text-xs font-extrabold text-slate-900">{task.residentFullName} ({task.residentInitials})</span>
                        </div>
                        {getStatusBadge(task.status)}
                      </div>

                      {/* Summary details */}
                      <div>
                        <span className="font-mono text-[9px] font-bold text-rose-500 uppercase tracking-widest bg-rose-500/5 px-2 py-0.5 rounded border border-rose-500/10">
                          {task.category}
                        </span>
                        <p className="font-sans text-xs font-bold text-slate-800 mt-2">"{task.summary}"</p>
                      </div>

                      {/* Safeguarding Alert Trigger */}
                      {task.safeguardingApplies && (
                        <div className="bg-indigo-50/40 border border-indigo-100 rounded-lg p-2 text-[10px] text-indigo-750 font-sans flex items-center gap-1.5">
                          <Lock className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                          <span>Enhanced DBS vetted handyman required</span>
                        </div>
                      )}

                      {/* Safe Assigned Handyman Details only (No complete database file or third-party contacts exposed) */}
                      {task.assignedHandyman ? (
                        <div className="bg-slate-50 border border-slate-150 p-3 rounded-xl space-y-1 text-[11px] font-sans text-slate-600">
                          <p className="font-bold text-slate-800 text-[10px] uppercase tracking-wide border-b border-slate-150 pb-1 mb-1">
                            Assigned Handyman Record (Secure)
                          </p>
                          <div className="flex justify-between">
                            <span>Display Name:</span>
                            <strong className="text-slate-800">{task.assignedHandyman.firstName}</strong>
                          </div>
                          <div className="flex justify-between">
                            <span>Provider Network:</span>
                            <span className="text-slate-500">{task.assignedHandyman.company}</span>
                          </div>
                          <div className="flex justify-between font-mono text-[10px]">
                            <span>DBS Match Level:</span>
                            <span className="text-emerald-600 font-bold">{task.assignedHandyman.dbsVerifiedStatus}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl text-center text-[10px] font-sans text-slate-450 italic">
                          Awaiting TaskBridge auto-routing matched handyman...
                        </div>
                      )}
                    </div>

                    {/* Quick interactive sandbox actions and detailed CTA */}
                    <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-2 justify-between items-center bg-slate-50/20 -mx-5 -mb-5 p-4 rounded-b-2xl">
                      {/* Simulation Controller Link */}
                      {task.status !== "Completed" ? (
                        <button
                          type="button"
                          onClick={() => handleSimulateStatusAdvance(task.id)}
                          className="text-[10px] font-mono font-bold text-rose-500 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 bg-white px-2 py-1 rounded transition-colors flex items-center gap-1 shrink-0"
                          title="Simulate step change on the TaskBridge server"
                        >
                          <Sparkles className="h-3 w-3" />
                          <span>Simulate next step</span>
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-mono italic">Resolved and locked</span>
                      )}

                      <div className="flex gap-2">
                        {task.status === "Awaiting Care Confirmation" && (
                          <button
                            type="button"
                            onClick={() => { setSelectedDetailedTask(task); }}
                            className="bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg shadow-sm transition-colors cursor-pointer"
                          >
                            Review & Verify Completed
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => { setSelectedDetailedTask(task); }}
                          className="bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                        >
                          View Safe Record
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredTasks.length === 0 && (
                  <div className="md:col-span-2 py-16 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-white p-6">
                    <CheckCircle2 className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-sm font-bold text-slate-700">No safety tasks match your search</h3>
                    <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">Try resetting your active status dropdown or priority filters above.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================= SEGMENT 4: DEEP ALERTS & INFORMATIONAL NOTIFICATIONS ================= */}
          {activeTab === "notifications" && (
            <div className="space-y-6 animate-fade-in text-left">
              <div className="flex justify-between items-end border-b border-slate-150 pb-4">
                <div>
                  <span className="font-mono text-[9px] font-bold text-rose-500 uppercase tracking-widest bg-rose-50/5 border border-rose-500/15 px-2.5 py-1 rounded-full">
                    Audited Signal Feed
                  </span>
                  <h1 className="font-display font-extrabold text-2xl sm:text-3xl tracking-tight text-slate-900 mt-2">
                    Coordination Alerts
                  </h1>
                </div>

                <button
                  onClick={() => {
                    setNotifications(prev => prev.map(n => ({...n, read: true})));
                    showToast("All notifications marked as read.");
                  }}
                  className="text-xs font-semibold text-rose-650 hover:text-rose-700 underline"
                >
                  Mark all as read
                </button>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm divide-y divide-slate-100 overflow-hidden">
                {notifications.map(notif => (
                  <div 
                    key={notif.id} 
                    className={`p-5 flex gap-4 transition-colors items-start text-left text-xs ${
                      notif.read ? "bg-white text-slate-500" : "bg-rose-50/15 text-slate-800 font-medium"
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {notif.type === "success" && (
                        <div className="h-8 w-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                          <CheckCircle2 className="h-4 w-4" />
                        </div>
                      )}
                      {notif.type === "warning" && (
                        <div className="h-8 w-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center font-bold animate-pulse">
                          <AlertTriangle className="h-4 w-4" />
                        </div>
                      )}
                      {notif.type === "info" && (
                        <div className="h-8 w-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                          <Shield className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 space-y-1">
                      <p className="leading-relaxed">{notif.text}</p>
                      <span className="text-[10px] font-mono text-slate-400 block">{notif.time}</span>
                    </div>

                    {!notif.read && (
                      <button
                        onClick={() => {
                          setNotifications(prev => prev.map(n => n.id === notif.id ? {...n, read: true} : n));
                        }}
                        className="text-[10px] text-slate-400 hover:text-slate-800 underline shrink-0 cursor-pointer"
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ================= SECTION 6 & 7: TASK DETAIL DRAWER & CARE CONFIRMATION WORKFLOW ================= */}
      {selectedDetailedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-end p-0 bg-slate-950/60 backdrop-blur-sm animate-fade-in font-sans">
          <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col justify-between text-left overflow-y-auto">
            
            {/* Header section of detailed drawer */}
            <div>
              <div className="bg-slate-900 p-6 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-rose-500/10 to-transparent blur" />
                <button
                  onClick={() => setSelectedDetailedTask(null)}
                  className="absolute top-4 right-4 h-8 w-8 rounded-full bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>

                <div className="space-y-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[9px] font-bold text-rose-400 bg-rose-500/15 px-2 py-0.5 rounded border border-rose-500/20">
                      {selectedDetailedTask.id}
                    </span>
                    <span className="text-xs text-slate-300">Primrose Agency Audit Record</span>
                  </div>
                  <h3 className="font-display font-extrabold text-xl text-white mt-1">
                    {selectedDetailedTask.residentFullName} ({selectedDetailedTask.residentInitials})
                  </h3>
                  <div className="pt-2 flex items-center gap-2">
                    {getStatusBadge(selectedDetailedTask.status)}
                    {selectedDetailedTask.urgency === "Urgent" && (
                      <span className="font-mono text-[9px] text-rose-400 font-bold uppercase tracking-wider bg-rose-500/15 px-2 py-0.5 rounded border border-rose-500/30">
                        URGENT INTENSITY
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Body details */}
              <div className="p-6 space-y-6">
                
                {/* 1. Categorization and Preferred visit Window */}
                <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-400 block uppercase font-bold text-[9px] font-mono">Service Category Requested</span>
                    <strong className="text-slate-800 text-sm">{selectedDetailedTask.category}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block uppercase font-bold text-[9px] font-mono">Preferred Visit Slot</span>
                    <span className="text-slate-800 text-sm flex items-center gap-1.5 mt-0.5">
                      <Clock className="h-3.5 w-3.5 text-slate-400" /> {selectedDetailedTask.preferredWindow}
                    </span>
                  </div>
                </div>

                {/* 2. Original raw Caregiver Note input */}
                <div className="space-y-1">
                  <span className="text-slate-400 block uppercase font-bold text-[9px] font-mono">Original On-Duty Carer Observation</span>
                  <div className="bg-slate-50 border border-slate-150 rounded-xl p-3 text-xs text-slate-700 italic leading-relaxed">
                    "{selectedDetailedTask.originalCareNote}"
                  </div>
                </div>

                {/* 3. TaskBridge AI extracted summary */}
                <div className="space-y-1">
                  <span className="text-slate-400 block uppercase font-bold text-[9px] font-mono">AI-Generated suggested Summary</span>
                  <p className="text-slate-800 font-bold text-xs">
                    {selectedDetailedTask.summary}
                  </p>
                </div>

                {/* 3.5 Location and secure keysafe details */}
                <div className="bg-slate-50 border border-slate-205 rounded-xl p-4 space-y-2.5 text-xs text-left">
                  <h4 className="font-bold text-slate-800 text-[10px] uppercase tracking-wide border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-rose-500" />
                    <span>Location & Secure Access Credentials</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 font-sans">
                    <div>
                      <span className="text-slate-450 block text-[9px] uppercase font-bold">Resident Address & Postcode</span>
                      <strong className="text-slate-800 text-[11px] leading-relaxed block mt-0.5">
                        {selectedDetailedTask.fullAddress || "No address logged"}
                        {selectedDetailedTask.postcode ? `, ${selectedDetailedTask.postcode}` : ""}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-450 block text-[9px] uppercase font-bold flex items-center gap-1">
                        <Key className="h-3 w-3 text-indigo-500" />
                        <span>Keysafe Code</span>
                      </span>
                      {selectedDetailedTask.safeguardingApplies ? (
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-[11px] font-mono font-extrabold text-indigo-750 bg-indigo-50/80 border border-indigo-200 px-2 py-0.5 rounded shadow-sm">
                            {selectedDetailedTask.keysafeCode || "None Logged"}
                          </span>
                          <span className="text-[8px] bg-indigo-650 text-white font-extrabold px-1.5 py-0.5 rounded uppercase font-mono tracking-wide shrink-0">DBS Release Approved</span>
                        </div>
                      ) : (
                        <span className="text-[11px] font-mono font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded inline-block mt-1">
                          {selectedDetailedTask.keysafeCode || "None Logged"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* 4. Safeguarding trigger status bar */}
                {selectedDetailedTask.safeguardingApplies && (
                  <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 text-xs text-indigo-850 flex gap-2.5 leading-relaxed items-start">
                    <Lock className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Enhanced DBS vetted handyman required</p>
                      <p className="text-[11px] text-indigo-600 mt-1">
                        We checked the local operative register: only a registered technician with a clean, validated Enhanced DBS certification can be assigned to this address safely. No personal database contact details are exposed.
                      </p>
                    </div>
                  </div>
                )}

                {/* 5. Safe Assigned Handyman Information (Only safe display, no admin scoring, no payment caps) */}
                {selectedDetailedTask.assignedHandyman && (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 text-xs">
                    <h4 className="font-bold text-slate-900 text-[11px] uppercase tracking-wide border-b border-slate-200 pb-1.5 flex justify-between items-center">
                      <span>Assigned Operator Record</span>
                      <span className="font-mono text-[9px] text-emerald-600 bg-emerald-50 px-1 border border-emerald-150 rounded">Vetted Pass</span>
                    </h4>
                    <div className="grid grid-cols-2 gap-y-1.5 gap-x-4">
                      <div>
                        <span className="text-slate-400 block text-[9px]">Technician Display Name</span>
                        <strong className="text-slate-800">{selectedDetailedTask.assignedHandyman.firstName}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[9px]">Local Network Affiliation</span>
                        <strong className="text-slate-800">{selectedDetailedTask.assignedHandyman.company}</strong>
                      </div>
                      <div className="col-span-2">
                        <span className="text-slate-400 block text-[9px]">Scheduled Handyman Window</span>
                        <span className="text-slate-800 font-bold">{selectedDetailedTask.assignedHandyman.scheduledWindow}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 6. Status transition timeline log history */}
                <div className="space-y-3">
                  <span className="text-slate-400 block uppercase font-bold text-[9px] font-mono">Secure Transaction Timeline Audit</span>
                  <div className="relative border-l-2 border-slate-200 pl-4 space-y-4 text-xs ml-2">
                    {selectedDetailedTask.timeline.map((item, idx) => (
                      <div key={idx} className="relative">
                        <span className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-slate-900 flex items-center justify-center shadow-sm">
                          <span className="h-1.5 w-1.5 rounded-full bg-rose-450" />
                        </span>
                        <div className="space-y-0.5">
                          <div className="flex justify-between font-bold text-slate-800">
                            <span>{item.status}</span>
                            <span className="text-[10px] font-mono text-slate-400">{item.timestamp}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 leading-normal">{item.note}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 7. Before & After Completed Evidence Showcase (If available, Section 7) */}
                {selectedDetailedTask.status === "Awaiting Care Confirmation" && selectedDetailedTask.beforePhotoUrl && (
                  <div className="bg-rose-50/20 border border-rose-100 rounded-xl p-4 space-y-3">
                    <span className="text-rose-700 font-bold uppercase text-[9px] tracking-wider block">Visual Completion Evidence verified</span>
                    
                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="space-y-1 text-center">
                        <span className="text-[9px] text-slate-400 block">Carer Before Report</span>
                        <div className="h-28 rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                          <img src={selectedDetailedTask.beforePhotoUrl} alt="Before fix" className="w-full h-full object-cover" />
                        </div>
                      </div>
                      <div className="space-y-1 text-center">
                        <span className="text-[9px] text-slate-400 block">Vetted Handyman After Work</span>
                        <div className="h-28 rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                          <img src={selectedDetailedTask.afterPhotoUrl} alt="After fix" className="w-full h-full object-cover" />
                        </div>
                      </div>
                    </div>

                    <div className="text-xs bg-white p-2.5 rounded-lg border border-slate-150">
                      <span className="text-slate-400 block text-[9px] font-mono font-bold">Handyman Completion Notes:</span>
                      <p className="text-slate-700 italic mt-0.5">"{selectedDetailedTask.completionNotes}"</p>
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* Bottom Actions inside drawer (Section 7: Care confirmation workflow) */}
            <div className="p-6 bg-slate-50 border-t border-slate-150">
              {selectedDetailedTask.status === "Awaiting Care Confirmation" ? (
                <div className="space-y-3">
                  <div className="text-xs text-slate-600 leading-normal">
                     Please review the completed before/after photos and checkoff remarks. Confirming below closes the ticket in our database.
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleConfirmCompletion(selectedDetailedTask.id, "ISSUE", "Completed evidence appears incomplete / requires audit verification.")}
                      className="w-full bg-white hover:bg-slate-100 text-slate-700 border border-slate-250 font-sans text-xs font-bold py-3.5 px-4 rounded-xl shadow-sm transition-colors cursor-pointer"
                    >
                      Flag Issue / Follow-Up
                    </button>
                    <button
                      type="button"
                      onClick={() => handleConfirmCompletion(selectedDetailedTask.id, "APPROVE")}
                      className="w-full bg-slate-100 bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-650 text-white font-sans text-xs font-extrabold py-3.5 px-4 rounded-xl shadow transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Confirm Completed</span>
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setSelectedDetailedTask(null)}
                  className="w-full bg-slate-900 hover:bg-slate-805 text-white font-sans text-xs font-bold py-3 rounded-xl transition-colors cursor-pointer"
                >
                  Close Safe Auditor Panel
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ================= COMMAND PALETTE MODAL OVERLAY ================= */}
      {commandPaletteOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden">
            {/* Search Input */}
            <div className="p-4 border-b border-slate-800 flex items-center gap-3 bg-slate-950/40">
              <Command className="h-5 w-5 text-rose-500 animate-pulse" />
              <input
                type="text"
                autoFocus
                placeholder="Type a command, task ID, resident name or shortcut..."
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
              <div className="px-3 py-1 text-[10px] font-mono uppercase text-slate-500 tracking-wider">Fast Navigation Actions</div>
              
              {/* Commands list */}
              {[
                { label: "Go to Executive Dashboard", tab: "dashboard", desc: "View care overview, metrics & reports", shortcut: "D" },
                { label: "Create a New Safety Task", tab: "create", desc: "Transcribe care notes into repair jobs", shortcut: "C" },
                { label: "Open Task Status Board", tab: "status", desc: "Track on-site handymen & audit progress", shortcut: "S" },
                { label: "View Operational Alerts", tab: "notifications", desc: "Check alerts and real-time system webhooks", shortcut: "N" },
              ].filter(cmd => cmd.label.toLowerCase().includes(commandSearch.toLowerCase()) || cmd.desc.toLowerCase().includes(commandSearch.toLowerCase())).map((cmd, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setActiveTab(cmd.tab as any);
                    setSelectedDetailedTask(null);
                    setCommandPaletteOpen(false);
                    setCommandSearch("");
                  }}
                  className="w-full text-left p-3 rounded-xl hover:bg-slate-805 flex justify-between items-center group transition-all"
                >
                  <div className="text-xs">
                    <p className="font-bold text-slate-200 group-hover:text-white">{cmd.label}</p>
                    <p className="text-[10px] text-slate-500">{cmd.desc}</p>
                  </div>
                  <span className="bg-slate-800 text-slate-400 group-hover:text-rose-400 border border-slate-700 text-[10px] px-2 py-0.5 rounded-lg font-mono">
                    {cmd.shortcut}
                  </span>
                </button>
              ))}

              {/* Task search list */}
              {tasks.length > 0 && (
                <>
                  <div className="px-3 py-1 text-[10px] font-mono text-slate-500 tracking-wider mt-3">Matching Active Resident Tasks</div>
                  {tasks.filter(t => 
                    t.residentFullName.toLowerCase().includes(commandSearch.toLowerCase()) ||
                    t.category.toLowerCase().includes(commandSearch.toLowerCase()) ||
                    t.summary.toLowerCase().includes(commandSearch.toLowerCase()) ||
                    t.id.toLowerCase().includes(commandSearch.toLowerCase())
                  ).map((t, i) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        setActiveTab("status");
                        setSelectedDetailedTask(t);
                        setCommandPaletteOpen(false);
                        setCommandSearch("");
                      }}
                      className="w-full text-left p-3 rounded-xl hover:bg-slate-805 flex justify-between items-center group transition-all border border-transparent hover:border-slate-800"
                    >
                      <div className="text-xs">
                        <span className="font-mono text-[9px] text-rose-500 mr-1.5">{t.id}</span>
                        <span className="font-bold text-slate-255 group-hover:text-white">{t.residentFullName} ({t.residentInitials})</span>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">{t.summary}</p>
                      </div>
                      <span className="text-[9px] font-mono bg-slate-950/60 text-slate-400 border border-slate-850 px-1.5 py-0.5 rounded">
                        {t.status}
                      </span>
                    </button>
                  ))}
                </>
              )}
            </div>

            {/* Footer tips */}
            <div className="p-3 bg-slate-950/60 border-t border-slate-800 flex justify-between items-center text-[10px] text-slate-500 font-mono">
              <span>Shortcuts: Press D, C, S, N to navigate instantly</span>
              <span>Press ESC to dismiss</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
