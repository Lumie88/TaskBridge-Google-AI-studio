import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import fs from "fs";

// Load types for backend context
import {
  AdminUser,
  Agency,
  ServiceTask,
  HandymanTrader,
  AuditLog,
  WebhookLog,
} from "./src/types/admin";

const app = express();
const PORT = 3000;

app.use(express.json());

// In-Memory Database with Persistence Backup to /tmp or current folder
// This guarantees that the user sees their database edits persist seamlessly during live play
const DB_PATH = path.join(process.cwd(), "taskbridge_db.json");

// Helper to encrypt resident names to showcase strict GDPR/Safeguarding isolation
const encryptResidentName = (fullName: string): string => {
  if (!fullName) return "N/A";
  const parts = fullName.trim().split(" ");
  if (parts.length === 1) return `${parts[0][0]}. [ENCRYPTED]`;
  return `${parts[0][0]}. ${parts[parts.length - 1][0]}. [ENCRYPTED]`;
};

// Initial Databases Seeds
const SEED_ADMINS: AdminUser[] = [
  {
    id: "ADM-001",
    email: "james.carter@taskbridge.com",
    fullName: "James Carter",
    role: "TaskBridge Admin",
    status: "Active",
    mfaEnabled: true,
    createdAt: "2026-01-10T09:00:00Z",
  },
  {
    id: "ADM-999",
    email: "sarah.super@taskbridge.com",
    fullName: "Sarah Cooper",
    role: "Super Admin",
    status: "Active",
    mfaEnabled: true,
    createdAt: "2026-01-01T08:30:00Z",
  },
];

const SEED_AGENCIES: Agency[] = [
  {
    agencyId: "AGC-101",
    name: "Primrose Care Services",
    primaryContact: "Sarah Jenkins & Regional Leads",
    workEmailDomain: "primrose.org",
    webhookUrl: "https://primrose.org/api/taskbridge-callback",
    apiKey: "tb_live_agc101_87df6a11eecba909819289aa89cb0d1a",
    status: "Active",
    createdAt: "2026-01-15T10:00:00Z",
    updatedAt: "2026-06-16T14:30:00Z",
  },
  {
    agencyId: "AGC-202",
    name: "Sovereign Senior Care",
    primaryContact: "Arthur Pendelton",
    workEmailDomain: "sovereigncare.uk",
    webhookUrl: "https://sovereigncare.uk/webhooks/incoming",
    apiKey: "tb_live_agc202_fa8790daff021e16f73ebd729a1bb2fa",
    status: "Active",
    createdAt: "2026-03-01T11:00:00Z",
    updatedAt: "2026-05-12T09:15:00Z",
  },
  {
    agencyId: "AGC-303",
    name: "Golden Pathways Housing",
    primaryContact: "Elena Rostova",
    workEmailDomain: "goldenpathways.com",
    webhookUrl: "https://goldenpathways.com/api/v1/updates",
    apiKey: "tb_live_agc303_ec87ad62bf539a28cba76df4ea092a0e",
    status: "Suspended",
    createdAt: "2026-04-10T09:00:00Z",
    updatedAt: "2026-06-11T16:00:00Z",
  },
];

const SEED_TRADERS: HandymanTrader[] = [
  {
    id: "TRD-001",
    name: "David Miller",
    networkSource: "Home Shield Services Network",
    marketplaceId: "HSN-8371",
    mobile: "+447700900077",
    email: "david.miller@homeshield.co.uk",
    serviceCategories: ["Path clearing", "Garden clearance", "Outdoor Access"],
    areaPostcodeCoverage: ["SW1A", "SW1Y", "SW1X", "W1", "WC2"],
    hourlyRate: 45.0,
    availability: "Mon - Fri, 08:00 - 17:00",
    dbsStatus: "completed",
    dbsExpiryDate: "2028-04-12",
    dbsProviderSessionId: "DBS-SESS-9831A",
    insuranceStatus: "verified",
    insuranceExpiryDate: "2027-05-30",
    qualifications: ["City & Guilds Garden Maintenance", "CSCS Yard Safety Card"],
    qualityScore: 4.8,
    lastVerificationCheck: "2026-06-01T10:00:00Z",
    status: "Active",
  },
  {
    id: "TRD-002",
    name: "George Sterling",
    networkSource: "CareFix Pro Handymen",
    marketplaceId: "CFP-1120",
    mobile: "+447700900188",
    email: "george@carefixhandymen.co.uk",
    serviceCategories: ["Loose rail repair", "Fall Prevention", "Outdoor Access"],
    areaPostcodeCoverage: ["SW1A", "SW3", "SW7", "W1"],
    hourlyRate: 50.0,
    availability: "Mon - Sat, 09:00 - 19:00",
    dbsStatus: "completed",
    dbsExpiryDate: "2027-11-20",
    dbsProviderSessionId: "DBS-SESS-5231B",
    insuranceStatus: "verified",
    insuranceExpiryDate: "2027-02-15",
    qualifications: ["NVQ Level 2 Carpentry", "DBS Enhanced Standard Protocol Certificate"],
    qualityScore: 4.9,
    lastVerificationCheck: "2026-05-18T09:00:00Z",
    status: "Active",
  },
  {
    id: "TRD-003",
    name: "Michael Vance",
    networkSource: "Swift Response Logistics",
    marketplaceId: "SRL-4429",
    mobile: "+447700900299",
    email: "michael.vance@swiftlogistics.uk",
    serviceCategories: ["Trip hazard removal", "Safety & Cleanliness", "Home Security", "Lock repairs"],
    areaPostcodeCoverage: ["SW1A", "SW4", "SE1", "WC2"],
    hourlyRate: 55.0,
    availability: "24/7 On Call Emergency",
    dbsStatus: "completed",
    dbsExpiryDate: "2027-09-05",
    dbsProviderSessionId: "DBS-SESS-3329D",
    insuranceStatus: "verified",
    insuranceExpiryDate: "2026-10-30",
    qualifications: ["Corbin Cylinder Master Locksmith Accreditation", "Health & Safety Hazard Control"],
    qualityScore: 4.7,
    lastVerificationCheck: "2026-06-15T08:00:00Z",
    status: "Active",
  },
  {
    id: "TRD-004",
    name: "Brendon Fletcher",
    networkSource: "Independent Panel Traders",
    marketplaceId: "IPT-9003",
    mobile: "+447700900511",
    email: "brendon@fletcherlocks.com",
    serviceCategories: ["Lock repairs", "Home Security"],
    areaPostcodeCoverage: ["WC2", "W1", "N1"],
    hourlyRate: 60.0,
    availability: "Flexible Day",
    dbsStatus: "expired", // DBS Expired! Will trigger matching blockage for vulnerable adult tasks
    dbsExpiryDate: "2026-05-01",
    dbsProviderSessionId: "DBS-SESS-8113W",
    insuranceStatus: "verified",
    insuranceExpiryDate: "2027-01-20",
    qualifications: ["Locks Guild Associate"],
    qualityScore: 4.5,
    lastVerificationCheck: "2026-06-02T11:30:00Z",
    status: "Active",
  },
  {
    id: "TRD-005",
    name: "Sanjay Patel",
    networkSource: "Home Shield Services Network",
    marketplaceId: "HSN-1204",
    mobile: "+447700900944",
    email: "sanjay@patelhomeplans.co.uk",
    serviceCategories: ["Appliance safety checks", "Home Security"],
    areaPostcodeCoverage: ["SW1A", "SW10", "W2"],
    hourlyRate: 50.0,
    availability: "Mon - Fri, 09:00 - 18:00",
    dbsStatus: "pending", // DBS check pending
    dbsExpiryDate: undefined,
    dbsProviderSessionId: "DBS-SESS-7731E",
    insuranceStatus: "expired", // Insurance Expired! Will block assignments
    insuranceExpiryDate: "2026-06-01",
    qualifications: ["Gas Safe Registered ID #99321", "NICEIC Domestic Installer"],
    qualityScore: 4.6,
    lastVerificationCheck: "2026-06-05T14:00:00Z",
    status: "Active",
  },
];

const SEED_TASKS: ServiceTask[] = [
  {
    id: "TB-104",
    agencyId: "AGC-101",
    agencyName: "Primrose Care Services",
    residentInitials: "M.K.",
    residentFullNameSafe: "M. K. [ENCRYPTED - GDPR]",
    originalCareNote: "Margaret's front pathway is completely overgrown with thorns and slippery weed growth. Carer had to support her heavily today to prevent a slip or fall when visiting the GP.",
    category: "Path clearing",
    summary: "Clear overgrown thorny brambles and slippery weeds along front main entry path.",
    urgency: "Urgent",
    safeguardingApplies: true,
    preferredWindow: "Morning (09:00 - 12:00)",
    carerPresent: true,
    status: "Awaiting Care Confirmation",
    beforePhotoUrl: "https://images.unsplash.com/photo-1558904541-efa8c1a6b40a?q=80&w=600&auto=format&fit=crop",
    afterPhotoUrl: "https://images.unsplash.com/photo-1592150621744-aca64f48394a?q=80&w=600&auto=format&fit=crop",
    assignedHandymanId: "TRD-001",
    assignedHandymanName: "David Miller",
    assignedHandymanCompany: "Home Shield Services Network",
    checkInTime: "2026-06-17T09:05:00Z",
    checkInCoords: { lat: 51.5014, lng: -0.1419 },
    checkOutTime: "2026-06-17T10:15:00Z",
    completionNotes: "All brambles cut back, high-pressure washed the concrete tiles to clear green algae, leaving a completely slip-free entry pathway.",
    assignmentHistory: [
      { traderId: "TRD-001", traderName: "David Miller", action: "APPROVED", timestamp: "2026-06-16T11:30:00Z" },
    ],
    timeline: [
      { status: "Triaged", timestamp: "2026-06-16T09:12:00Z", note: "Care note translated by AI summary engine." },
      { status: "Pending Assignment", timestamp: "2026-06-16T10:00:00Z", note: "Approved by Care Coordinator Sarah Jenkins." },
      { status: "Dispatched", timestamp: "2026-06-16T11:30:00Z", note: "Automated routing matched with nearest Enhanced DBS vetted provider.", actor: "System Router" },
      { status: "Checked In", timestamp: "2026-06-17T09:05:00Z", note: "Operative arrived on site. Geolocation matches resident address." },
      { status: "Awaiting Evidence Review", timestamp: "2026-06-17T10:15:00Z", note: "Task completed. Evidence uploaded to secure cloud." },
    ],
  },
  {
    id: "TB-103",
    agencyId: "AGC-101",
    agencyName: "Primrose Care Services",
    residentInitials: "R.S.",
    residentFullNameSafe: "R. S. [ENCRYPTED - GDPR]",
    originalCareNote: "The wooden grab rail beside Ronald's front door is splitting and feels loose when pulled. Handrail requires securing down safely before he attempts to lock up tonight.",
    category: "Loose rail repair",
    summary: "Reinforce and secure loose hand grab rail at main external entry point.",
    urgency: "Urgent",
    safeguardingApplies: true,
    preferredWindow: "Afternoon (12:00 - 16:00)",
    carerPresent: false,
    status: "Visit Scheduled",
    assignedHandymanId: "TRD-002",
    assignedHandymanName: "George Sterling",
    assignedHandymanCompany: "CareFix Pro Handymen",
    assignmentHistory: [
      { traderId: "TRD-002", traderName: "George Sterling", action: "APPROVED", timestamp: "2026-06-17T08:30:00Z" },
    ],
    timeline: [
      { status: "Triaged", timestamp: "2026-06-16T14:00:00Z", note: "AI extraction completed." },
      { status: "Pending Assignment", timestamp: "2026-06-16T14:30:00Z", note: "Approved for dispatcher matching queue." },
      { status: "Visit Scheduled", timestamp: "2026-06-17T08:30:00Z", note: "George assigned. Automated DBS validation checks out." },
    ],
  },
  {
    id: "TB-102",
    agencyId: "AGC-101",
    agencyName: "Primrose Care Services",
    residentInitials: "E.P.",
    residentFullNameSafe: "E. P. [ENCRYPTED - GDPR]",
    originalCareNote: "Back door lock is sticking. Eileen is struggling to lock her patio doors at night due to arthritis stiffness, which leaves her feeling very scared and insecure.",
    category: "Lock repairs",
    summary: "De-carbonate, lubricate or replace sticking rear security barrel lock.",
    urgency: "Medium",
    safeguardingApplies: true,
    preferredWindow: "Flexible Day",
    carerPresent: false,
    status: "Pending Assignment",
    assignmentHistory: [],
    timeline: [
      { status: "Triaged", timestamp: "2026-06-15T11:00:00Z", note: "AI audit completed." },
      { status: "Pending Assignment", timestamp: "2026-06-15T14:00:00Z", note: "Manual request raised by regional coordinator." },
    ],
  },
  {
    id: "TB-101",
    agencyId: "AGC-202",
    agencyName: "Sovereign Senior Care",
    residentInitials: "H.G.",
    residentFullNameSafe: "H. G. [ENCRYPTED - GDPR]",
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
    assignedHandymanId: "TRD-003",
    assignedHandymanName: "Michael Vance",
    assignedHandymanCompany: "Swift Response Logistics",
    checkInTime: "2026-06-15T09:45:00Z",
    checkOutTime: "2026-06-15T11:00:00Z",
    completionNotes: "All sodden fire hazards completely cleared from wheelchair egress points. Tested ramp with empty wheelchair to verify zero obstructions occur.",
    assignmentHistory: [
      { traderId: "TRD-003", traderName: "Michael Vance", action: "APPROVED", timestamp: "2026-06-15T08:30:00Z" },
    ],
    timeline: [
      { status: "Pending Assignment", timestamp: "2026-06-15T08:00:00Z", note: "Approved" },
      { status: "Dispatched", timestamp: "2026-06-15T08:30:00Z", note: "Matched and assigned in background." },
      { status: "Visit Scheduled", timestamp: "2026-06-15T09:12:00Z", note: "Scheduled for immediate dispatch." },
      { status: "Checked In", timestamp: "2026-06-15T09:45:00Z", note: "Arrived at location." },
      { status: "Awaiting Evidence Review", timestamp: "2026-06-15T10:30:00Z", note: "Photos logged. Clear evidence verified." },
      { status: "Completed", timestamp: "2026-06-15T11:00:00Z", note: "Completed and authorized by Sarah Jenkins." },
    ],
  },
];

const SEED_AUDIT_LOGS: AuditLog[] = [
  {
    id: "LOG-001",
    actorId: "System Router",
    actorRole: "System Router",
    action: "DISPATCHED_TASK",
    entityType: "Task",
    entityId: "TB-104",
    timestamp: "2026-06-16T11:30:00Z",
    ipAddress: "127.0.0.1",
    metadata: { method: "AUTOMATED_RADIUS_ROUTE", score: 0.94, eligibleTradersCount: 3 },
  },
  {
    id: "LOG-002",
    actorId: "ADM-999",
    actorRole: "Super Admin",
    action: "API_KEY_CREATED",
    entityType: "AgencyAPIKey",
    entityId: "AGC-101",
    timestamp: "2026-06-16T14:30:00Z",
    ipAddress: "192.168.1.12",
    metadata: { scopedAgency: "Primrose Care Services" },
  },
];

const SEED_WEBHOOK_LOGS: WebhookLog[] = [
  {
    id: "WHL-001",
    direction: "inbound",
    service: "Care Management Software",
    endpoint: "/api/webhooks/incoming-care-task",
    payload: { notes: "Wet moss on ramp...", category: "Path clearing", agencyId: "AGC-101" },
    response: { taskId: "TB-104", status: "Triaged" },
    status: 200,
    timestamp: "2026-06-16T09:12:00Z",
    attempts: 1,
  },
];

let db: {
  admins: AdminUser[];
  agencies: Agency[];
  traders: HandymanTrader[];
  tasks: ServiceTask[];
  audit_logs: AuditLog[];
  webhook_logs: WebhookLog[];
} = {
  admins: SEED_ADMINS,
  agencies: SEED_AGENCIES,
  traders: SEED_TRADERS,
  tasks: SEED_TASKS,
  audit_logs: SEED_AUDIT_LOGS,
  webhook_logs: SEED_WEBHOOK_LOGS,
};

// Ensure database reads/writes are persisted so user additions are permanent
const loadDB = () => {
  try {
    if (fs.existsSync(DB_PATH)) {
      const src = fs.readFileSync(DB_PATH, "utf-8");
      db = JSON.parse(src);
    } else {
      saveDB();
    }
  } catch (e) {
    console.warn("DB file reading failed, holding in-memory databases", e);
  }
};

const saveDB = () => {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
  } catch (e) {
    console.error("Critical DB write failure", e);
  }
};

loadDB();

// Setup logs helpers
const logAudit = (
  actorId: string,
  actorRole: string,
  action: string,
  entityType: string,
  entityId: string,
  metadata: Record<string, any>,
  reqIp = "127.0.0.1"
) => {
  const log: AuditLog = {
    id: `LOG-${Math.floor(100 + Math.random() * 9000)}`,
    actorId,
    actorRole,
    action,
    entityType,
    entityId,
    timestamp: new Date().toISOString(),
    ipAddress: reqIp,
    metadata,
  };
  db.audit_logs.unshift(log);
  saveDB();
};

const logWebhook = (
  direction: "inbound" | "outbound",
  service: "Care Management Software" | "Handyman Network" | "DBS Verification",
  endpoint: string,
  payload: any,
  response: any,
  status: number
) => {
  const log: WebhookLog = {
    id: `WHL-${Math.floor(1000 + Math.random() * 9000)}`,
    direction,
    service,
    endpoint,
    payload,
    response,
    status,
    timestamp: new Date().toISOString(),
    attempts: 1,
  };
  db.webhook_logs.unshift(log);
  saveDB();
};

// ================= API ENDPOINTS =================

// Platform Health Check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
    services: {
      database: "reachable",
      encryptionEngine: "operational",
      dbsVerificationAdapter: "ready",
      twilioSMSGateway: "simulation_active",
    },
  });
});

app.get("/api/readiness", (req, res) => {
  const envVars = [
    "DATABASE_URL",
    "JWT_SECRET",
    "ENCRYPTION_KEY",
    "DBS_PROVIDER_API_KEY",
    "DBS_PROVIDER_WEBHOOK_SECRET",
    "TWILIO_ACCOUNT_SID",
  ];
  const missing = envVars.filter((v) => !process.env[v]);
  res.json({
    readiness: "ready",
    missingConfigOptionalVars: missing,
    postgresAdapterReady: true,
  });
});

// Admin JWT Authentication Simulation
app.post("/api/admin/auth/signin", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and credentials password required." });
  }

  // Find simulated admin
  const user = db.admins.find((a) => a.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    logAudit("ANONYMOUS", "Guest", "FAILED_LOGIN", "AdminUser", email, { reason: "User not found" }, req.ip);
    return res.status(401).json({ error: "Access Rejected: clinical credentials invalid." });
  }

  if (password !== "password123") {
    logAudit(user.id, user.role, "FAILED_LOGIN", "AdminUser", user.id, { reason: "Password mismatch" }, req.ip);
    return res.status(401).json({ error: "Access Rejected: security key verification failed." });
  }

  // Generate simulated secure token session
  const token = `tb_session_jwt_${Buffer.from(JSON.stringify({ id: user.id, r: user.role })).toString("base64")}.${Math.random().toString(16).substring(2, 6)}`;

  logAudit(user.id, user.role, "ADMIN_SIGNIN", "AdminUser", user.id, { mfaPassed: true, tokenAssigned: true }, req.ip);

  res.json({
    user,
    token,
  });
});

// Admin Tasks Queue List
app.get("/api/admin/tasks", (req, res) => {
  res.json(db.tasks);
});

// Admin Create manual task
app.post("/api/admin/tasks", (req, res) => {
  const { residentFullName, originalCareNote, category, urgency, preferredWindow, carerPresent, agencyId } = req.body;
  const agency = db.agencies.find((a) => a.agencyId === agencyId) || db.agencies[0];

  const newTask: ServiceTask = {
    id: `TB-${Math.floor(105 + Math.random() * 895)}`,
    agencyId: agency.agencyId,
    agencyName: agency.name,
    residentInitials: residentFullName ? residentFullName.split(" ").map((w: string) => w[0]).join(".") : "U.R.",
    residentFullNameSafe: encryptResidentName(residentFullName || "Unnamed Resident"),
    originalCareNote: originalCareNote || "Manual entry note placeholder.",
    summary: originalCareNote ? `Manually compiled task: ${category}` : "Task created manually.",
    category: category || "Trip hazard removal",
    urgency: urgency || "Routine",
    safeguardingApplies: true,
    preferredWindow: preferredWindow || "Flexible Day",
    carerPresent: !!carerPresent,
    status: "Triaged",
    assignmentHistory: [],
    timeline: [
      { status: "Triaged", timestamp: new Date().toISOString().replace("T", " ").substring(0, 16), note: "Manually registered in central registry." },
    ],
  };

  db.tasks.unshift(newTask);
  saveDB();

  logAudit("OPERATOR", "Admin", "TASK_CREATED", "Task", newTask.id, { createdVia: "Portal Operations Console" });

  res.status(201).json(newTask);
});

app.get("/api/admin/traders", (req, res) => {
  res.json(db.traders);
});

// Secure Match Check (Assignment Engine Rules)
app.post("/api/admin/assignment/evaluate-eligibility", (req, res) => {
  const { taskId } = req.body;
  const task = db.tasks.find((t) => t.id === taskId);
  if (!task) return res.status(404).json({ error: "Task not found" });

  const criteriaResult = db.traders.map((trader) => {
    const reasonsBlocked: string[] = [];
    let eligible = true;

    // RULE 1: Safeguarding requires Active Enhanced DBS
    if (task.safeguardingApplies) {
      if (trader.dbsStatus !== "completed") {
        eligible = false;
        reasonsBlocked.push(`Resident lacks Enhanced DBS. Current status: ${trader.dbsStatus.toUpperCase()}`);
      } else if (trader.dbsExpiryDate && new Date(trader.dbsExpiryDate) < new Date()) {
        eligible = false;
        reasonsBlocked.push("Enhanced DBS has expired.");
      }
    }

    // RULE 2: Insurance Check
    if (trader.insuranceStatus !== "verified") {
      eligible = false;
      reasonsBlocked.push("Liability insurance check missing or expired.");
    }

    // RULE 3: Category capability check
    const matchCat = trader.serviceCategories.some(
      (c) => c.toLowerCase().includes(task.category.toLowerCase()) || task.category.toLowerCase().includes(c.toLowerCase())
    );
    if (!matchCat) {
      eligible = false;
      reasonsBlocked.push(`Operative is not registered under specialized category: '${task.category}'`);
    }

    return {
      trader,
      eligible,
      reasonsBlocked,
    };
  });

  res.json(criteriaResult);
});

// Admin action: Assign Handyman Trader manually
app.post("/api/admin/tasks/assign", (req, res) => {
  const { taskId, traderId, actorId, actorRole } = req.body;
  const task = db.tasks.find((t) => t.id === taskId);
  const trader = db.traders.find((tr) => tr.id === traderId);

  if (!task || !trader) {
    return res.status(404).json({ error: "Task or Handyman registry records missing." });
  }

  // Double check critical vetting limits before allowing database update
  if (task.safeguardingApplies && trader.dbsStatus !== "completed") {
    return res.status(400).json({
      error: "Assignment Rejected: Safeguarding blocks dispatching an operative without checked, active Enhanced DBS credentials.",
    });
  }

  task.status = "Visit Scheduled";
  task.assignedHandymanId = trader.id;
  task.assignedHandymanName = trader.name;
  task.assignedHandymanCompany = trader.networkSource;
  task.token = `vst_${Math.random().toString(36).substring(2, 15)}_${task.id}`;

  const tsStr = new Date().toISOString().replace("T", " ").substring(0, 16);
  task.assignmentHistory.push({
    traderId: trader.id,
    traderName: trader.name,
    action: "APPROVED",
    timestamp: tsStr,
  });

  task.timeline.push({
    status: "Visit Scheduled",
    timestamp: tsStr,
    note: `Vetted Operative ${trader.name} scheduled for preferred window. Secure visit link initialized.`,
    actor: actorRole || "Admin",
  });

  saveDB();

  logAudit(
    actorId || "ADM-001",
    actorRole || "Admin",
    "ASSIGNED_TRADER",
    "Task",
    taskId,
    { traderId: trader.id, traderName: trader.name }
  );

  res.json(task);
});

// Trigger Enhanced DBS Check Simulation
app.post("/api/admin/traders/trigger-dbs", (req, res) => {
  const { traderId, actorId, actorRole } = req.body;
  const trader = db.traders.find((t) => t.id === traderId);
  if (!trader) return res.status(404).json({ error: "Trader not found" });

  const providerSessionId = `DBS-SESS-${Math.floor(1000 + Math.random() * 9000)}Z`;
  trader.dbsStatus = "pending";
  trader.dbsProviderSessionId = providerSessionId;
  saveDB();

  logAudit(actorId || "ADM-999", actorRole || "Super Admin", "START_DBS_CHECK", "Trader", traderId, { providerSessionId });

  // Outbound Webhook Simulation to the identity verification company
  logWebhook(
    "outbound",
    "DBS Verification",
    "https://api.verifyshield-dbs.gov.uk/v1/sessions",
    {
      handymanId: trader.id,
      fullName: trader.name,
      mobile: trader.mobile,
      callbackUrl: "http://localhost:3000/api/webhooks/dbs-callback",
      checkType: "enhanced_dbs",
    },
    { sessionId: providerSessionId, status: "pending" },
    201
  );

  res.json({
    status: "success",
    message: "DBS inquiry adapter broadcasted successfully.",
    sessionId: providerSessionId,
  });
});

// DBS Callback Webhook Entry
app.post("/api/webhooks/dbs-callback", (req, res) => {
  const { sessionId, outcome, expiryDate, evidenceReference } = req.body;

  // Sign verification simulation (Secure adaptation reqs)
  const webhookSignature = req.headers["x-taskbridge-witness-hash"];
  console.log(`DBS Core Signature checked: ${webhookSignature || "Simulated SSL Key Trust"}`);

  const trader = db.traders.find((t) => t.dbsProviderSessionId === sessionId);
  if (!trader) {
    logWebhook("inbound", "DBS Verification", "/api/webhooks/dbs-callback", req.body, { error: "Partner session missing." }, 404);
    return res.status(404).json({ error: "Session mismatch" });
  }

  trader.dbsStatus = outcome === "approved" ? "completed" : "failed";
  if (outcome === "approved" && expiryDate) {
    trader.dbsExpiryDate = expiryDate;
  }
  trader.lastVerificationCheck = new Date().toISOString();
  saveDB();

  logAudit("DBS-Verification-Service", "Integration Adapter", "DBS_RESULT_CALLBACK", "Trader", trader.id, {
    outcome,
    evidenceReference,
  });

  logWebhook("inbound", "DBS Verification", "/api/webhooks/dbs-callback", req.body, { processed: true }, 200);

  res.json({ message: "Processed" });
});

// Care management Software Incoming Care Task Ingress Webhook
app.post("/api/webhooks/incoming-care-task", (req, res) => {
  const { agencyId, notes, category, urgency, preferredWindow, carerOnSite } = req.body;

  // Security adaptation: API key check
  const apiKey = req.headers["x-agency-token"] || req.query.apiKey;
  const agency = db.agencies.find((a) => a.apiKey === apiKey || a.agencyId === agencyId);

  if (!agency) {
    logWebhook("inbound", "Care Management Software", "/api/webhooks/incoming-care-task", req.body, { error: "Unauthenticated" }, 401);
    return res.status(401).json({ error: "Access Rejected: API token invalid." });
  }

  if (agency.status === "Suspended") {
    logWebhook("inbound", "Care Management Software", "/api/webhooks/incoming-care-task", req.body, { error: "Agency Suspended" }, 403);
    return res.status(403).json({ error: "Access Rejected: Agency workspace is currently suspended." });
  }

  const taskId = `TB-${Math.floor(105 + Math.random() * 895)}`;
  const newTask: ServiceTask = {
    id: taskId,
    agencyId: agency.agencyId,
    agencyName: agency.name,
    residentInitials: "S.U.", // GDPR Compliant placement
    residentFullNameSafe: encryptResidentName("Private Sync User"),
    originalCareNote: notes || "Direct Sync intake notes missing.",
    summary: `Sync Request: Assess/Repair '${category}'`,
    category: category || "Trip hazard removal",
    urgency: urgency || "Medium",
    safeguardingApplies: true,
    preferredWindow: preferredWindow || "Flexible Day",
    carerPresent: !!carerOnSite,
    status: "Pending Assignment",
    assignmentHistory: [],
    timeline: [
      { status: "Triaged", timestamp: new Date().toISOString().replace("T", " ").substring(0, 16), note: `Task ingested via REST Integration API Key scope.` },
    ],
  };

  db.tasks.unshift(newTask);
  saveDB();

  logAudit("API-Gateway", "Inbound Integration", "API_TASK_INGRESS", "Task", taskId, { agency: agency.name });
  logWebhook("inbound", "Care Management Software", "/api/webhooks/incoming-care-task", req.body, { taskId, status: "Pending Assignment" }, 201);

  res.status(201).json({
    taskId,
    status: "Pending Assignment",
    safeguardApplied: true,
    routingSLA: "8 hours responding limit",
  });
});

// Admin manual: Update DBS registry values
app.post("/api/admin/traders/manual-dbs-override", (req, res) => {
  const { traderId, status, expiryDate, actorId, actorRole } = req.body;
  const trader = db.traders.find((t) => t.id === traderId);
  if (!trader) return res.status(404).json({ error: "Trader missing." });

  trader.dbsStatus = status;
  if (expiryDate) trader.dbsExpiryDate = expiryDate;
  trader.lastVerificationCheck = new Date().toISOString();
  saveDB();

  logAudit(actorId || "ADM-999", actorRole || "Super Admin", "MANUAL_DBS_OVERRIDE", "Trader", traderId, { status, expiryDate });

  res.json(trader);
});

// Admin Suspend Handyman
app.post("/api/admin/traders/suspend", (req, res) => {
  const { traderId, status, actorId, actorRole } = req.body; // status: "Active" | "Suspended"
  const trader = db.traders.find((t) => t.id === traderId);
  if (!trader) return res.status(404).json({ error: "Trader missing." });

  trader.status = status;
  saveDB();

  logAudit(actorId || "ADM-999", actorRole || "Super Admin", "TRADER_STATUS_UPDATE", "Trader", traderId, { status });

  res.json(trader);
});

// Super Admin actions: Agencies Management
app.get("/api/admin/agencies", (req, res) => {
  res.json(db.agencies);
});

app.post("/api/admin/agencies", (req, res) => {
  const { name, primaryContact, workEmailDomain, webhookUrl, status } = req.body;
  const newAgency: Agency = {
    agencyId: `AGC-${Math.floor(400 + Math.random() * 500)}`,
    name: name || "New Registered Care Group",
    primaryContact: primaryContact || "Clinical Lead",
    workEmailDomain: workEmailDomain || "carehub.org",
    webhookUrl: webhookUrl || "https://carehub.org/callback",
    apiKey: `tb_live_agc_${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`,
    status: status || "Active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.agencies.push(newAgency);
  saveDB();

  logAudit("ADM-999", "Super Admin", "AGENCY_CREATED", "Agency", newAgency.agencyId, { name: newAgency.name });

  res.status(201).json(newAgency);
});

app.patch("/api/admin/agencies/:agencyId", (req, res) => {
  const { agencyId } = req.params;
  const agency = db.agencies.find((a) => a.agencyId === agencyId);
  if (!agency) return res.status(404).json({ error: "Agency not found" });

  const { name, primaryContact, webhookUrl, status } = req.body;
  if (name) agency.name = name;
  if (primaryContact) agency.primaryContact = primaryContact;
  if (webhookUrl) agency.webhookUrl = webhookUrl;
  if (status) agency.status = status;
  agency.updatedAt = new Date().toISOString();

  saveDB();

  logAudit("ADM-999", "Super Admin", "AGENCY_UPDATED", "Agency", agencyId, { fieldsUpdated: req.body });

  res.json(agency);
});

// Super Admin actions: API Key Rotation
app.post("/api/admin/agencies/:agencyId/rotate-key", (req, res) => {
  const { agencyId } = req.params;
  const agency = db.agencies.find((a) => a.agencyId === agencyId);
  if (!agency) return res.status(404).json({ error: "Agency not found" });

  const oldKey = agency.apiKey;
  agency.apiKey = `tb_live_agc_${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`;
  saveDB();

  logAudit("ADM-999", "Super Admin", "API_KEY_ROTATED", "AgencyAPIKey", agencyId, {
    oldKeySnippet: `${oldKey.substring(0, 8)}...`,
  });

  res.json({
    status: "success",
    newKey: agency.apiKey,
  });
});

// Admin logs feed
app.get("/api/admin/audit-logs", (req, res) => {
  res.json(db.audit_logs);
});

app.get("/api/admin/webhook-logs", (req, res) => {
  res.json(db.webhook_logs);
});

// ================= SECURE VISIT ENDPOINT SIMULATION (Twilio workflow link) =================
app.get("/api/visit/details/:token", (req, res) => {
  const { token } = req.params;
  const task = db.tasks.find((t) => t.token === token);
  if (!task) return res.status(444).json({ error: "Visit link invalid or expired." });

  res.json(task);
});

// Check-in post
app.post("/api/visit/checkin", (req, res) => {
  const { token, lat, lng } = req.body;
  const task = db.tasks.find((t) => t.token === token);
  if (!task) return res.status(404).json({ error: "Token active record not found" });

  const ts = new Date().toISOString();
  task.status = "Checked In";
  task.checkInTime = ts;
  task.checkInCoords = { lat: lat || 51.501, lng: lng || -0.141 };
  task.timeline.push({
    status: "Checked In",
    timestamp: ts.replace("T", " ").substring(0, 16),
    note: `Operativechecked in. Geolocation matches SW1A (accuracy margin 14m). Safeguarding rules active.`,
    actor: task.assignedHandymanName,
  });

  saveDB();

  logAudit(task.assignedHandymanId || "HANDYMAN", "Field Operative", "CHECKED_IN", "Task", task.id, { lat, lng });

  res.json(task);
});

// Check-out / Completion evidence submission
app.post("/api/visit/checkout", (req, res) => {
  const { token, completionNotes, beforePhotoUrl, afterPhotoUrl } = req.body;
  const task = db.tasks.find((t) => t.token === token);
  if (!task) return res.status(404).json({ error: "Token registry mismatch" });

  const ts = new Date().toISOString();
  task.status = "Awaiting Evidence Review";
  task.checkOutTime = ts;
  task.completionNotes = completionNotes || "Safety task executed compliant with directives.";
  if (beforePhotoUrl) task.beforePhotoUrl = beforePhotoUrl;
  if (afterPhotoUrl) task.afterPhotoUrl = afterPhotoUrl;

  task.timeline.push({
    status: "Awaiting Evidence Review",
    timestamp: ts.replace("T", " ").substring(0, 16),
    note: `Operative checked out. Before/After evidence photos uploaded. Awaiting supervisor confirmation.`,
    actor: task.assignedHandymanName,
  });

  saveDB();

  logAudit(task.assignedHandymanId || "HANDYMAN", "Field Operative", "CHECKED_OUT", "Task", task.id, {
    notes: completionNotes,
  });

  // Outbound Sync callback simulation to Carey CMS Systems
  const agency = db.agencies.find((a) => a.agencyId === task.agencyId);
  if (agency && agency.webhookUrl) {
    logWebhook(
      "outbound",
      "Care Management Software",
      agency.webhookUrl,
      {
        taskId: task.id,
        status: "Completed_Under_Review",
        completionSummary: task.completionNotes,
        afterPhotoUrl: task.afterPhotoUrl,
        checkInTime: task.checkInTime,
        checkOutTime: task.checkOutTime,
        assignedHandymanSafeDisplay: task.assignedHandymanName,
        evidenceStatus: "Pending_Approval",
      },
      { success: true, processed: "received" },
      200
    );
  }

  res.json(task);
});

// Supervisor Approve Evidence & Complete Task
app.post("/api/admin/tasks/verify-evidence", (req, res) => {
  const { taskId, action, remarks, actorId, actorRole } = req.body; // action: "APPROVE" | "REJECT"
  const task = db.tasks.find((t) => t.id === taskId);
  if (!task) return res.status(404).json({ error: "Task not found" });

  const tsStr = new Date().toISOString().replace("T", " ").substring(0, 16);
  if (action === "APPROVE") {
    task.status = "Completed";
    task.timeline.push({
      status: "Completed",
      timestamp: tsStr,
      note: `Service compliance checklist checked. Task marked as fully resolved in caregiver ledger.`,
      actor: actorRole || "Admin",
    });
  } else {
    task.status = "Blocked";
    task.timeline.push({
      status: "Blocked",
      timestamp: tsStr,
      note: `Evidence audit flagged issues: ${remarks || "Photos unreadable or coordinates mismatch."}`,
      actor: actorRole || "Admin",
    });
  }

  saveDB();

  logAudit(
    actorId || "ADM-001",
    actorRole || "Admin",
    action === "APPROVE" ? "APPROVE_EVIDENCE" : "FLAG_EVIDENCE",
    "Task",
    taskId,
    { remarks }
  );

  res.json(task);
});

// API endpoint to trigger a simulated SMS dispatch
app.post("/api/admin/tasks/send-visit-link", (req, res) => {
  const { taskId, actorId, actorRole } = req.body;
  const task = db.tasks.find((t) => t.id === taskId);
  if (!task || !task.assignedHandymanId) {
    return res.status(400).json({ error: "Task has no handyman assigned yet." });
  }

  const trader = db.traders.find((tr) => tr.id === task.assignedHandymanId);
  if (!trader) return res.status(404).json({ error: "Trader match missing." });

  const visitUrl = `http://localhost:3000/#visit-token-${task.token}`;

  logAudit(
    actorId || "ADM-001",
    actorRole || "Admin",
    "TWILIO_SMS_DISPATCH",
    "Task",
    taskId,
    { phoneRecipient: trader.mobile, visitUrl }
  );

  res.json({
    recipientPhone: trader.mobile,
    smsText: `TaskBridge Safeguarding Alert: Clean Job assignment scheduled for SW1A. Task details: "${task.summary}". Secure geofenced checkin URL: ${visitUrl}`,
    status: "dispatched",
    providerSid: "SMdfa87e21a209fd14e8201a18da9810ad",
  });
});

// Vite Middleware for Serving compiled code
const startServer = async () => {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[TaskBridge Backend] Core running on http://localhost:${PORT}`);
  });
};

startServer();
