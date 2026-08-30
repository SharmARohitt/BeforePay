/**
 * Core domain types for BeforePay
 * Foundation for all entities in the system
 */

export interface Company {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Vendor {
  id: string;
  companyId: string;
  name: string;
  legalName: string;
  status: "active" | "inactive" | "suspended";
  riskStatus: "low" | "medium" | "high" | "unknown";
  createdAt: Date;
  updatedAt: Date;
}

export interface VendorContact {
  id: string;
  vendorId: string;
  name: string;
  email: string;
  isVerified: boolean;
  verifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface BankAccount {
  id: string;
  vendorId: string;
  bankName: string;
  maskedAccount: string;
  routingReference: string;
  status: "active" | "inactive" | "pending";
  effectiveFrom: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface BankAccountChange {
  id: string;
  vendorId: string;
  previousAccountId?: string;
  newAccountId: string;
  requestedAt: Date;
  requestedBy?: string;
  source: "direct" | "email" | "system";
  status: "pending" | "verified" | "suspicious" | "rejected";
  createdAt: Date;
  updatedAt: Date;
}

export interface Contract {
  id: string;
  vendorId: string;
  contractNumber: string;
  version: number;
  monthlyCeiling: number;
  currency: string;
  effectiveFrom: Date;
  effectiveTo?: Date;
  status: "active" | "expired" | "draft" | "terminated";
  createdAt: Date;
  updatedAt: Date;
}

export interface ContractAmendment {
  id: string;
  contractId: string;
  amountChange: number;
  description: string;
  effectiveFrom: Date;
  approvedBy?: string;
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
  updatedAt: Date;
}

export interface PurchaseOrder {
  id: string;
  vendorId: string;
  poNumber: string;
  amount: number;
  currency: string;
  status: "draft" | "issued" | "received" | "closed";
  issuedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Invoice {
  id: string;
  vendorId: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  issueDate: Date;
  dueDate: Date;
  status: "draft" | "issued" | "received" | "paid" | "disputed";
  poId?: string;
  lineItems?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  currency: string;
  status: "pending" | "scheduled" | "released" | "failed" | "reversed";
  scheduledAt: Date;
  releasedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type PaymentExceptionType =
  | "amount_mismatch"
  | "contract_violation"
  | "unusual_vendor"
  | "bank_change"
  | "missing_po"
  | "duplicate_payment"
  | "timing_anomaly"
  | "unknown";

export interface PaymentException {
  id: string;
  paymentId: string;
  type: PaymentExceptionType;
  severity: "low" | "medium" | "high" | "critical";
  status: "new" | "investigating" | "resolved" | "dismissed";
  createdAt: Date;
  updatedAt: Date;
}

export type InvestigationStatus =
  | "pending"
  | "investigating"
  | "awaiting_approval"
  | "approved"
  | "rejected"
  | "completed";

export type InvestigationRecommendation = "verified" | "hold" | "block";

export interface Investigation {
  id: string;
  paymentExceptionId: string;
  trueforgeSessionId?: string;
  status: InvestigationStatus;
  startedAt: Date;
  completedAt?: Date;
  recommendation?: InvestigationRecommendation;
  confidence?: "high" | "medium" | "low";
  summary?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type EvidenceSourceType =
  | "invoice"
  | "contract"
  | "po"
  | "vendor"
  | "bank"
  | "email"
  | "system"
  | "sandbox"
  | "inference";

export type EvidenceRelation = "supports" | "contradicts" | "references";

export interface Evidence {
  id: string;
  investigationId: string;
  sourceType: EvidenceSourceType;
  sourceId: string;
  claim: string;
  value: string | number | boolean;
  confidence: number; // 0-1
  supports: string[]; // Array of claim IDs this supports
  contradicts: string[]; // Array of claim IDs this contradicts
  createdAt: Date;
  updatedAt: Date;
}

export type InvestigationEventType =
  | "investigation_started"
  | "agent_started"
  | "agent_completed"
  | "tool_called"
  | "tool_completed"
  | "tool_failed"
  | "sandbox_started"
  | "sandbox_completed"
  | "evidence_created"
  | "contradiction_found"
  | "evidence_gap_found"
  | "approval_requested"
  | "approval_approved"
  | "approval_rejected"
  | "action_executed"
  | "action_failed"
  | "session_resumed"
  | "decision_created"
  | "investigation_completed";

export interface InvestigationEvent {
  id: string;
  investigationId: string;
  type: InvestigationEventType;
  agent?: string;
  tool?: string;
  message: string;
  metadata?: Record<string, unknown>;
  timestamp: Date;
  createdAt: Date;
}

export interface Approval {
  id: string;
  investigationId: string;
  action: string;
  description?: string;
  status: "pending" | "approved" | "rejected";
  requestedAt: Date;
  approvedAt?: Date;
  approvedBy?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Evidence Gap Analysis
 * Categorizes evidence into: KNOWN, CONFLICTING, UNKNOWN, REQUIRED
 */

export interface EvidenceGapAnalysis {
  investigationId: string;
  known: EvidenceItem[];
  conflicting: EvidenceItem[];
  unknown: string[];
  required: string[];
  createdAt: Date;
}

export interface EvidenceItem {
  id: string;
  claim: string;
  confidence: number;
  source: string;
}

/**
 * Investigation Decision Package
 * Final output of investigation
 */

export interface DecisionPackage {
  investigationId: string;
  recommendation: InvestigationRecommendation;
  confidence: "high" | "medium" | "low";
  summary: string;
  supportingEvidence: Evidence[];
  contradictingEvidence: Evidence[];
  missingEvidence: string[];
  nextActions: string[];
  auditTrail: InvestigationEvent[];
  createdAt: Date;
}

/**
 * TrueForge Integration Types
 */

export interface TrueForgeSession {
  sessionId: string;
  status: "active" | "paused" | "completed" | "error";
  agentState?: Record<string, unknown>;
  approvalPending?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MCPToolCall {
  toolName: string;
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
  error?: string;
  duration: number;
  timestamp: Date;
}

/**
 * API Response Types
 */

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  metadata?: {
    timestamp: Date;
    requestId: string;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
