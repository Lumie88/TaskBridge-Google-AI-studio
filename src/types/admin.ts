export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  role: "TaskBridge Admin" | "Super Admin";
  status: "Active" | "Suspended";
  mfaEnabled: boolean;
  createdAt: string;
}

export interface Agency {
  agencyId: string;
  name: string;
  primaryContact: string;
  workEmailDomain: string;
  webhookUrl: string;
  apiKey: string;
  status: "Active" | "Suspended";
  createdAt: string;
  updatedAt: string;
  coordinatorEmail?: string;
  tempPassword?: string;
  passwordChanged?: boolean;
  activePassword?: string;
  lastPasswordChangedAt?: string;
}

export interface ServiceTask {
  id: string;
  agencyId: string;
  agencyName: string;
  residentInitials: string;
  residentFullNameSafe: string; // encrypted/sanitized display
  originalCareNote: string;
  summary: string;
  category: string;
  urgency: "Routine" | "Medium" | "Urgent";
  safeguardingApplies: boolean;
  preferredWindow: string;
  carerPresent: boolean;
  photoUrl?: string;
  beforePhotoUrl?: string;
  afterPhotoUrl?: string;
  status:
    | "Triaged"
    | "Pending Assignment"
    | "Assignment Review"
    | "Dispatched"
    | "Visit Scheduled"
    | "Checked In"
    | "Awaiting Evidence Review"
    | "Awaiting Care Confirmation"
    | "Completed"
    | "Blocked"
    | "Failed Dispatch";
  assignedHandymanId?: string;
  assignedHandymanName?: string;
  assignedHandymanCompany?: string;
  assignmentHistory: {
    traderId: string;
    traderName: string;
    action: "PROPOSED" | "APPROVED" | "REJECTED";
    timestamp: string;
    reason?: string;
  }[];
  timeline: {
    status: string;
    timestamp: string;
    note: string;
    actor?: string;
  }[];
  token?: string;
  checkInTime?: string;
  checkInCoords?: { lat: number; lng: number };
  checkOutTime?: string;
  completionNotes?: string;
  fullAddress?: string;
  postcode?: string;
  keysafeCode?: string;
}

export interface HandymanTrader {
  id: string;
  name: string;
  networkSource: string;
  marketplaceId: string;
  mobile: string;
  email: string;
  serviceCategories: string[];
  areaPostcodeCoverage: string[];
  hourlyRate: number;
  availability: string;
  dbsStatus: "pending" | "completed" | "failed" | "expired" | "not_started";
  dbsExpiryDate?: string;
  dbsProviderSessionId?: string;
  insuranceStatus: "verified" | "expired" | "missing";
  insuranceExpiryDate?: string;
  qualifications: string[];
  qualityScore: number;
  lastVerificationCheck: string;
  status: "Active" | "Suspended";
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorRole: string;
  action: string;
  entityType: string;
  entityId: string;
  timestamp: string;
  ipAddress: string;
  metadata: Record<string, any>;
}

export interface WebhookLog {
  id: string;
  direction: "inbound" | "outbound";
  service: string;
  endpoint: string;
  payload: any;
  response: any;
  status: number;
  timestamp: string;
  attempts: number;
}
