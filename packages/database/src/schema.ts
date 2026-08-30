import {
  pgTable,
  text,
  integer,
  decimal,
  timestamp,
  boolean,
  varchar,
  uuid,
  jsonb,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

/**
 * Enums for type safety
 */
export const vendorStatusEnum = pgEnum("vendor_status", [
  "active",
  "inactive",
  "suspended",
]);
export const vendorRiskEnum = pgEnum("vendor_risk_status", [
  "low",
  "medium",
  "high",
  "unknown",
]);
export const bankAccountStatusEnum = pgEnum("bank_account_status", [
  "active",
  "inactive",
  "pending",
]);
export const bankAccountChangeStatusEnum = pgEnum(
  "bank_account_change_status",
  ["pending", "verified", "suspicious", "rejected"]
);
export const bankAccountChangeSourceEnum = pgEnum(
  "bank_account_change_source",
  ["direct", "email", "system"]
);
export const contractStatusEnum = pgEnum("contract_status", [
  "active",
  "expired",
  "draft",
  "terminated",
]);
export const contractAmendmentStatusEnum = pgEnum(
  "contract_amendment_status",
  ["pending", "approved", "rejected"]
);
export const purchaseOrderStatusEnum = pgEnum("purchase_order_status", [
  "draft",
  "issued",
  "received",
  "closed",
]);
export const invoiceStatusEnum = pgEnum("invoice_status", [
  "draft",
  "issued",
  "received",
  "paid",
  "disputed",
]);
export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "scheduled",
  "released",
  "failed",
  "reversed",
]);
export const paymentExceptionTypeEnum = pgEnum("payment_exception_type", [
  "amount_mismatch",
  "contract_violation",
  "unusual_vendor",
  "bank_change",
  "missing_po",
  "duplicate_payment",
  "timing_anomaly",
  "unknown",
]);
export const exceptionSeverityEnum = pgEnum("exception_severity", [
  "low",
  "medium",
  "high",
  "critical",
]);
export const exceptionStatusEnum = pgEnum("exception_status", [
  "new",
  "investigating",
  "resolved",
  "dismissed",
]);
export const investigationStatusEnum = pgEnum("investigation_status", [
  "pending",
  "investigating",
  "awaiting_approval",
  "approved",
  "rejected",
  "completed",
]);
export const investigationRecommendationEnum = pgEnum(
  "investigation_recommendation",
  ["verified", "hold", "block"]
);
export const confidenceEnum = pgEnum("confidence_level", [
  "high",
  "medium",
  "low",
]);
export const evidenceSourceEnum = pgEnum("evidence_source_type", [
  "invoice",
  "contract",
  "po",
  "vendor",
  "bank",
  "email",
  "system",
  "sandbox",
  "inference",
]);
export const investigationEventTypeEnum = pgEnum("investigation_event_type", [
  "investigation_started",
  "agent_started",
  "agent_completed",
  "tool_called",
  "tool_completed",
  "tool_failed",
  "sandbox_started",
  "sandbox_completed",
  "evidence_created",
  "contradiction_found",
  "evidence_gap_found",
  "approval_requested",
  "approval_approved",
  "approval_rejected",
  "action_executed",
  "action_failed",
  "session_resumed",
  "decision_created",
  "investigation_completed",
]);
export const approvalStatusEnum = pgEnum("approval_status", [
  "pending",
  "approved",
  "rejected",
]);

/**
 * Core Business Tables
 */

export const companies = pgTable("companies", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const vendors = pgTable("vendors", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id),
  name: varchar("name", { length: 255 }).notNull(),
  legalName: varchar("legal_name", { length: 255 }).notNull(),
  status: vendorStatusEnum("status").notNull().default("active"),
  riskStatus: vendorRiskEnum("risk_status").notNull().default("unknown"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const vendorContacts = pgTable("vendor_contacts", {
  id: uuid("id").primaryKey().defaultRandom(),
  vendorId: uuid("vendor_id")
    .notNull()
    .references(() => vendors.id),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  isVerified: boolean("is_verified").notNull().default(false),
  verifiedAt: timestamp("verified_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const bankAccounts = pgTable("bank_accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  vendorId: uuid("vendor_id")
    .notNull()
    .references(() => vendors.id),
  bankName: varchar("bank_name", { length: 255 }).notNull(),
  maskedAccount: varchar("masked_account", { length: 20 }).notNull(),
  routingReference: varchar("routing_reference", { length: 20 }).notNull(),
  status: bankAccountStatusEnum("status").notNull().default("active"),
  effectiveFrom: timestamp("effective_from").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const bankAccountChanges = pgTable("bank_account_changes", {
  id: uuid("id").primaryKey().defaultRandom(),
  vendorId: uuid("vendor_id")
    .notNull()
    .references(() => vendors.id),
  previousAccountId: uuid("previous_account_id").references(
    () => bankAccounts.id
  ),
  newAccountId: uuid("new_account_id")
    .notNull()
    .references(() => bankAccounts.id),
  requestedAt: timestamp("requested_at").notNull(),
  requestedBy: varchar("requested_by", { length: 255 }),
  source: bankAccountChangeSourceEnum("source").notNull().default("direct"),
  status: bankAccountChangeStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const contracts = pgTable("contracts", {
  id: uuid("id").primaryKey().defaultRandom(),
  vendorId: uuid("vendor_id")
    .notNull()
    .references(() => vendors.id),
  contractNumber: varchar("contract_number", { length: 255 }).notNull(),
  version: integer("version").notNull().default(1),
  monthlyCeiling: decimal("monthly_ceiling", { precision: 15, scale: 2 })
    .notNull(),
  currency: varchar("currency", { length: 3 }).notNull().default("INR"),
  effectiveFrom: timestamp("effective_from").notNull(),
  effectiveTo: timestamp("effective_to"),
  status: contractStatusEnum("status").notNull().default("active"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const contractAmendments = pgTable("contract_amendments", {
  id: uuid("id").primaryKey().defaultRandom(),
  contractId: uuid("contract_id")
    .notNull()
    .references(() => contracts.id),
  amountChange: decimal("amount_change", { precision: 15, scale: 2 })
    .notNull(),
  description: text("description"),
  effectiveFrom: timestamp("effective_from").notNull(),
  approvedBy: varchar("approved_by", { length: 255 }),
  status: contractAmendmentStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const purchaseOrders = pgTable("purchase_orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  vendorId: uuid("vendor_id")
    .notNull()
    .references(() => vendors.id),
  poNumber: varchar("po_number", { length: 255 }).notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).notNull().default("INR"),
  status: purchaseOrderStatusEnum("status").notNull().default("draft"),
  issuedAt: timestamp("issued_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const invoices = pgTable("invoices", {
  id: uuid("id").primaryKey().defaultRandom(),
  vendorId: uuid("vendor_id")
    .notNull()
    .references(() => vendors.id),
  invoiceNumber: varchar("invoice_number", { length: 255 }).notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).notNull().default("INR"),
  issueDate: timestamp("issue_date").notNull(),
  dueDate: timestamp("due_date").notNull(),
  status: invoiceStatusEnum("status").notNull().default("issued"),
  poId: uuid("po_id").references(() => purchaseOrders.id),
  lineItems: jsonb("line_items"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const payments = pgTable("payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  invoiceId: uuid("invoice_id")
    .notNull()
    .references(() => invoices.id),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).notNull().default("INR"),
  status: paymentStatusEnum("status").notNull().default("pending"),
  scheduledAt: timestamp("scheduled_at").notNull(),
  releasedAt: timestamp("released_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const paymentExceptions = pgTable("payment_exceptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  paymentId: uuid("payment_id")
    .notNull()
    .references(() => payments.id),
  type: paymentExceptionTypeEnum("type").notNull(),
  severity: exceptionSeverityEnum("severity").notNull(),
  status: exceptionStatusEnum("status").notNull().default("new"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/**
 * Investigation & Evidence Tables
 */

export const investigations = pgTable("investigations", {
  id: uuid("id").primaryKey().defaultRandom(),
  paymentExceptionId: uuid("payment_exception_id")
    .notNull()
    .references(() => paymentExceptions.id),
  trueforgeSessionId: varchar("trueforge_session_id", { length: 255 }),
  status: investigationStatusEnum("status").notNull().default("pending"),
  startedAt: timestamp("started_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
  recommendation: investigationRecommendationEnum("recommendation"),
  confidence: confidenceEnum("confidence"),
  summary: text("summary"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const evidence = pgTable("evidence", {
  id: uuid("id").primaryKey().defaultRandom(),
  investigationId: uuid("investigation_id")
    .notNull()
    .references(() => investigations.id),
  sourceType: evidenceSourceEnum("source_type").notNull(),
  sourceId: varchar("source_id", { length: 255 }).notNull(),
  claim: text("claim").notNull(),
  value: text("value").notNull(),
  confidence: decimal("confidence", { precision: 3, scale: 2 })
    .notNull()
    .default("0.5"),
  supports: jsonb("supports"),
  contradicts: jsonb("contradicts"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const investigationEvents = pgTable("investigation_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  investigationId: uuid("investigation_id")
    .notNull()
    .references(() => investigations.id),
  type: investigationEventTypeEnum("type").notNull(),
  agent: varchar("agent", { length: 255 }),
  tool: varchar("tool", { length: 255 }),
  message: text("message").notNull(),
  metadata: jsonb("metadata"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const approvals = pgTable("approvals", {
  id: uuid("id").primaryKey().defaultRandom(),
  investigationId: uuid("investigation_id")
    .notNull()
    .references(() => investigations.id),
  action: varchar("action", { length: 255 }).notNull(),
  description: text("description"),
  status: approvalStatusEnum("status").notNull().default("pending"),
  requestedAt: timestamp("requested_at").notNull().defaultNow(),
  approvedAt: timestamp("approved_at"),
  approvedBy: varchar("approved_by", { length: 255 }),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/**
 * Audit & Communication Tables
 */

export const emails = pgTable("emails", {
  id: uuid("id").primaryKey().defaultRandom(),
  threadId: varchar("thread_id", { length: 255 }).notNull(),
  from: varchar("from", { length: 255 }).notNull(),
  to: varchar("to", { length: 255 }).notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  body: text("body").notNull(),
  timestamp: timestamp("timestamp").notNull(),
  verifiedSender: boolean("verified_sender").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const activityLog = pgTable("activity_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  entityType: varchar("entity_type", { length: 255 }).notNull(),
  entityId: varchar("entity_id", { length: 255 }).notNull(),
  action: varchar("action", { length: 255 }).notNull(),
  changes: jsonb("changes"),
  userId: varchar("user_id", { length: 255 }),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/**
 * Relations
 */

export const companiesRelations = relations(companies, ({ many }) => ({
  vendors: many(vendors),
}));

export const vendorsRelations = relations(vendors, ({ one, many }) => ({
  company: one(companies, {
    fields: [vendors.companyId],
    references: [companies.id],
  }),
  contacts: many(vendorContacts),
  bankAccounts: many(bankAccounts),
  bankAccountChanges: many(bankAccountChanges),
  contracts: many(contracts),
  purchaseOrders: many(purchaseOrders),
  invoices: many(invoices),
}));

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  vendor: one(vendors, {
    fields: [invoices.vendorId],
    references: [vendors.id],
  }),
  payments: many(payments),
  po: one(purchaseOrders, {
    fields: [invoices.poId],
    references: [purchaseOrders.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one, many }) => ({
  invoice: one(invoices, {
    fields: [payments.invoiceId],
    references: [invoices.id],
  }),
  exceptions: many(paymentExceptions),
}));

export const paymentExceptionsRelations = relations(
  paymentExceptions,
  ({ one, many }) => ({
    payment: one(payments, {
      fields: [paymentExceptions.paymentId],
      references: [payments.id],
    }),
    investigations: many(investigations),
  })
);

export const investigationsRelations = relations(
  investigations,
  ({ one, many }) => ({
    exception: one(paymentExceptions, {
      fields: [investigations.paymentExceptionId],
      references: [paymentExceptions.id],
    }),
    evidence: many(evidence),
    events: many(investigationEvents),
    approvals: many(approvals),
  })
);

export const evidenceRelations = relations(evidence, ({ one }) => ({
  investigation: one(investigations, {
    fields: [evidence.investigationId],
    references: [investigations.id],
  }),
}));

export const investigationEventsRelations = relations(
  investigationEvents,
  ({ one }) => ({
    investigation: one(investigations, {
      fields: [investigationEvents.investigationId],
      references: [investigations.id],
    }),
  })
);

export const approvalsRelations = relations(approvals, ({ one }) => ({
  investigation: one(investigations, {
    fields: [approvals.investigationId],
    references: [investigations.id],
  }),
}));
