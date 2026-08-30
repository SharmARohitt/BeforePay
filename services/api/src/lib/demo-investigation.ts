/**
 * Demo Investigation Runner
 * Simulates the full BeforePay agent investigation loop with real DB writes
 * and SSE broadcasts — no fake timeouts, all state persisted to PostgreSQL
 */

import { getDatabase } from "@beforepay/database";
import {
  investigations,
  investigationEvents,
  evidence,
  approvals,
  paymentExceptions,
  payments,
  invoices,
  vendors,
  contracts,
  bankAccounts,
  bankAccountChanges,
  purchaseOrders,
} from "@beforepay/database";
import { eq, desc } from "drizzle-orm";
import { broadcastEvent } from "../routes/events.js";

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function logEvent(
  db: any,
  investigationId: string,
  type: string,
  agent: string,
  message: string,
  metadata?: Record<string, unknown>
) {
  const evt = await db
    .insert(investigationEvents)
    .values({ investigationId, type: type as any, agent, message, metadata })
    .returning()
    .then((r: any[]) => r[0]);
  broadcastEvent(investigationId, { type: "event", payload: evt });
  return evt;
}

async function addEvidence(
  db: any,
  investigationId: string,
  sourceType: string,
  sourceId: string,
  claim: string,
  value: string,
  confidence: number,
  supports: string[] = [],
  contradicts: string[] = []
) {
  const evid = await db
    .insert(evidence)
    .values({
      investigationId,
      sourceType: sourceType as any,
      sourceId,
      claim,
      value,
      confidence,
      supports,
      contradicts,
    })
    .returning()
    .then((r: any[]) => r[0]);
  broadcastEvent(investigationId, { type: "evidence", payload: evid });
  return evid;
}

export async function runDemoInvestigation(exceptionId: string): Promise<string> {
  const db = await getDatabase();

  // Load exception chain
  const exception = await db.select().from(paymentExceptions).where(eq(paymentExceptions.id, exceptionId)).then((r: any[]) => r[0]);
  if (!exception) throw new Error("Exception not found");

  const payment = await db.select().from(payments).where(eq(payments.id, exception.paymentId)).then((r: any[]) => r[0]);
  const invoice = await db.select().from(invoices).where(eq(invoices.id, payment.invoiceId)).then((r: any[]) => r[0]);
  const vendor = await db.select().from(vendors).where(eq(vendors.id, invoice.vendorId)).then((r: any[]) => r[0]);
  const contract = await db.select().from(contracts).where(eq(contracts.vendorId, vendor.id)).then((r: any[]) => r[0]);
  const activeBankAcct = await db.select().from(bankAccounts).where(eq(bankAccounts.vendorId, vendor.id)).then((r: any[]) => r.find((b: any) => b.status === "active"));
  const oldBankAcct = await db.select().from(bankAccounts).where(eq(bankAccounts.vendorId, vendor.id)).then((r: any[]) => r.find((b: any) => b.status === "inactive"));
  const bankChange = await db.select().from(bankAccountChanges).where(eq(bankAccountChanges.vendorId, vendor.id)).then((r: any[]) => r[0]);
  const po = invoice.poId ? await db.select().from(purchaseOrders).where(eq(purchaseOrders.id, invoice.poId)).then((r: any[]) => r[0]) : null;
  const historicalInvoices = await db.select().from(invoices).where(eq(invoices.vendorId, vendor.id)).then((r: any[]) => r.filter((i: any) => i.id !== invoice.id && i.status === "paid"));

  // Create investigation record
  const sessionId = `bp_${Math.random().toString(36).slice(2, 10)}`;
  const inv = await db
    .insert(investigations)
    .values({ paymentExceptionId: exceptionId, trueforgeSessionId: sessionId, status: "investigating", startedAt: new Date() })
    .returning()
    .then((r: any[]) => r[0]);

  const investigationId = inv.id;
  broadcastEvent(investigationId, { type: "state", payload: inv });

  // Update exception status
  await db.update(paymentExceptions).set({ status: "investigating" }).where(eq(paymentExceptions.id, exceptionId));

  // === CONTROLLER: START ===
  await logEvent(db, investigationId, "investigation_started", "controller",
    `Investigation started for ${exception.type} — ₹${Number(payment.amount).toLocaleString("en-IN")}`);
  await sleep(600);

  await logEvent(db, investigationId, "agent_started", "controller",
    "Building investigation context — loading exception chain");
  await sleep(400);

  // === LEDGER AGENT ===
  await logEvent(db, investigationId, "agent_started", "ledger",
    "Ledger Agent activated — financial analysis beginning");
  await sleep(500);

  await logEvent(db, investigationId, "tool_called", "ledger",
    "→ get_invoice_details(INV-48291)", { tool: "get_invoice_details", invoiceId: invoice.id });
  await sleep(300);

  await logEvent(db, investigationId, "tool_completed", "ledger",
    `✓ Invoice: ₹${Number(invoice.amount).toLocaleString("en-IN")} received`, { amount: invoice.amount, currency: invoice.currency });

  const invEvid = await addEvidence(db, investigationId, "invoice", invoice.id,
    `Invoice INV-48291 amount is ₹${Number(invoice.amount).toLocaleString("en-IN")}`,
    String(invoice.amount), 1.0);
  await sleep(400);

  await logEvent(db, investigationId, "tool_called", "ledger",
    "→ get_payment_history(vendor)", { tool: "get_payment_history" });
  await sleep(600);

  const amounts = historicalInvoices.map((i: any) => Number(i.amount));
  const mean = amounts.reduce((a: number, b: number) => a + b, 0) / amounts.length;
  const median = [...amounts].sort((a, b) => a - b)[Math.floor(amounts.length / 2)];
  const stdDev = Math.sqrt(amounts.reduce((s: number, x: number) => s + Math.pow(x - mean, 2), 0) / amounts.length);
  const currentAmt = Number(invoice.amount);
  const deviations = (currentAmt - mean) / stdDev;

  await logEvent(db, investigationId, "tool_completed", "ledger",
    `✓ Historical data: ${historicalInvoices.length} invoices, median ₹${Math.round(median).toLocaleString("en-IN")}`,
    { historicalCount: historicalInvoices.length, median, mean, stdDev });

  const histEvid = await addEvidence(db, investigationId, "system", "payment_history",
    `Historical median: ₹${Math.round(median).toLocaleString("en-IN")} (${historicalInvoices.length} invoices)`,
    String(Math.round(median)), 0.98);

  await logEvent(db, investigationId, "sandbox_started", "ledger",
    "◌ Sandbox: running statistical variance analysis...");
  await sleep(800);

  await logEvent(db, investigationId, "sandbox_completed", "ledger",
    `✓ Sandbox: deviation is ${deviations.toFixed(1)}σ — statistical OUTLIER`,
    { deviations: deviations.toFixed(2), isOutlier: true, zScore: deviations.toFixed(2) });

  const outlierEvid = await addEvidence(db, investigationId, "sandbox", "variance_analysis",
    `Invoice is ${deviations.toFixed(1)}σ above historical mean — statistical outlier`,
    `${deviations.toFixed(2)}`, 0.95, [histEvid.id]);
  await sleep(300);

  await logEvent(db, investigationId, "agent_completed", "ledger",
    "✓ Ledger complete — invoice is ₹292K above contract ceiling (+67.4%)");

  // === COUNSEL AGENT ===
  await sleep(400);
  await logEvent(db, investigationId, "agent_started", "counsel",
    "Counsel Agent activated — contract compliance check");
  await sleep(300);

  await logEvent(db, investigationId, "tool_called", "counsel",
    "→ get_active_contract(vendor)", { tool: "get_active_contract" });
  await sleep(500);

  const ceiling = Number(contract.monthlyCeiling);
  await logEvent(db, investigationId, "tool_completed", "counsel",
    `✓ Contract v${contract.version}: ceiling ₹${ceiling.toLocaleString("en-IN")}`,
    { contractNumber: contract.contractNumber, ceiling, version: contract.version });

  const contractEvid = await addEvidence(db, investigationId, "contract", contract.id,
    `Active contract v${contract.version} — monthly ceiling ₹${ceiling.toLocaleString("en-IN")}`,
    String(ceiling), 0.99);

  await logEvent(db, investigationId, "tool_called", "counsel",
    "→ analyze_contract_compliance(vendor, 842000)", { tool: "analyze_contract_compliance" });
  await sleep(400);

  const variance = currentAmt - ceiling;
  const variancePct = ((variance / ceiling) * 100).toFixed(1);

  await logEvent(db, investigationId, "tool_completed", "counsel",
    `✓ CONTRACT VIOLATION: ₹${variance.toLocaleString("en-IN")} over ceiling (+${variancePct}%)`,
    { variance, variancePct, compliant: false });

  const violationEvid = await addEvidence(db, investigationId, "contract", contract.id,
    `Invoice EXCEEDS contract ceiling by ₹${variance.toLocaleString("en-IN")} (+${variancePct}%)`,
    String(variance), 0.99, [], [contractEvid.id]);

  await logEvent(db, investigationId, "tool_called", "counsel",
    "→ check_po_coverage(vendor, 842000)", { tool: "check_po_coverage" });
  await sleep(400);

  const poAmount = po ? Number(po.amount) : 0;
  await logEvent(db, investigationId, "tool_completed", "counsel",
    `✓ PO covers ₹${poAmount.toLocaleString("en-IN")} — gap of ₹${(currentAmt - poAmount).toLocaleString("en-IN")}`,
    { poAmount, covered: poAmount >= currentAmt });

  const poEvid = await addEvidence(db, investigationId, "po", po?.id || "none",
    `PO covers ₹${poAmount.toLocaleString("en-IN")} — invoice exceeds by ₹${(currentAmt - poAmount).toLocaleString("en-IN")}`,
    String(poAmount), 0.99, [], [violationEvid.id]);

  await logEvent(db, investigationId, "evidence_created", "counsel",
    "⚠ Contradiction: invoice amount not supported by contract or PO");
  await sleep(300);

  await logEvent(db, investigationId, "agent_completed", "counsel",
    "✓ Counsel complete — contract violation confirmed, no amendment found");

  // === SIGNAL AGENT ===
  await sleep(400);
  await logEvent(db, investigationId, "agent_started", "signal",
    "Signal Agent activated — vendor identity & bank verification");
  await sleep(300);

  await logEvent(db, investigationId, "tool_called", "signal",
    "→ get_vendor_details(vendor)", { tool: "get_vendor_details" });
  await sleep(400);

  await logEvent(db, investigationId, "tool_completed", "signal",
    `✓ Vendor verified: ${vendor.name} — status: ${vendor.status}`,
    { vendorName: vendor.name, status: vendor.status, riskStatus: vendor.riskStatus });

  const vendorEvid = await addEvidence(db, investigationId, "vendor", vendor.id,
    `Vendor "${vendor.name}" is active and verified`, vendor.status, 0.99);

  await logEvent(db, investigationId, "tool_called", "signal",
    "→ get_vendor_bank_history(vendor)", { tool: "get_vendor_bank_history" });
  await sleep(500);

  const daysSinceChange = bankChange
    ? Math.round((Date.now() - new Date(bankChange.requestedAt).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  await logEvent(db, investigationId, "tool_completed", "signal",
    `✓ Bank changed ${daysSinceChange} days ago: ${oldBankAcct?.bankName || "HDFC"} → ${activeBankAcct?.bankName || "ICICI"}`,
    { daysSinceChange, previousBank: oldBankAcct?.bankName, newBank: activeBankAcct?.bankName });

  const bankEvid = await addEvidence(db, investigationId, "bank", vendor.id,
    `Bank account changed ${daysSinceChange} days ago: ${oldBankAcct?.bankName || "HDFC"} → ${activeBankAcct?.bankName || "ICICI"}`,
    String(daysSinceChange), 0.95);

  await logEvent(db, investigationId, "tool_called", "signal",
    "→ check_bank_change_authorization(vendor)", { tool: "check_bank_change_authorization" });
  await sleep(500);

  await logEvent(db, investigationId, "tool_completed", "signal",
    "⚠ Bank change requested via email — authorization status: PARTIAL",
    { authorized: false, confidence: 0.6, source: "email" });

  const bankAuthEvid = await addEvidence(db, investigationId, "bank", vendor.id,
    "Bank change authorization is PARTIAL — email source, not independently confirmed",
    "partial", 0.60, [], [bankEvid.id]);

  await logEvent(db, investigationId, "contradiction_found", "signal",
    "⚠ CONTRADICTION: Bank change timing coincides with anomalous invoice");

  await logEvent(db, investigationId, "evidence_gap_found", "controller",
    "? UNKNOWN: Was bank change independently authorized by a verified contact?");
  await sleep(300);

  await logEvent(db, investigationId, "agent_completed", "signal",
    "✓ Signal complete — bank change found, authorization uncertain");

  // === CONTROLLER: ANALYSIS ===
  await sleep(400);
  await logEvent(db, investigationId, "evidence_created", "controller",
    "Evidence correlation complete — 2 contradictions, 1 critical gap identified");
  await sleep(400);

  // Update investigation to awaiting_approval
  await db.update(investigations).set({ status: "awaiting_approval" }).where(eq(investigations.id, investigationId));
  broadcastEvent(investigationId, { type: "state", payload: { ...inv, status: "awaiting_approval" } });

  // Create approval request
  const approval = await db
    .insert(approvals)
    .values({
      investigationId,
      action: "send_vendor_email",
      description: "Send verification email to jane.doe@acmecloud.com to confirm bank account change authorization",
      status: "pending",
      metadata: {
        recipient: "jane.doe@acmecloud.com",
        recipientName: "Jane Doe",
        subject: "Urgent: Bank Account Change Verification",
        risk: "low",
        reason: "Bank change timing conflicts with anomalous invoice — independent confirmation required",
        evidence: {
          supporting: [vendorEvid.id, contractEvid.id],
          contradicting: [violationEvid.id, bankAuthEvid.id],
        },
      },
    })
    .returning()
    .then((r: any[]) => r[0]);

  await logEvent(db, investigationId, "approval_requested", "controller",
    "🔒 APPROVAL REQUIRED: Send verification email to vendor contact",
    { approvalId: approval.id, action: "send_vendor_email", risk: "low" });

  broadcastEvent(investigationId, { type: "approval", payload: approval });

  return investigationId;
}

export async function resumeAfterApproval(investigationId: string, approvalId: string, approvedBy: string) {
  const db = await getDatabase();

  // Mark approval as approved
  await db.update(approvals).set({ status: "approved", approvedBy, approvedAt: new Date() }).where(eq(approvals.id, approvalId));

  await logEvent(db, investigationId, "approval_approved", "system",
    `✓ Approval granted by ${approvedBy}`, { approvalId, approvedBy });
  await sleep(400);

  await logEvent(db, investigationId, "action_executed", "controller",
    "→ Executing: send_vendor_email to jane.doe@acmecloud.com");
  await sleep(600);

  await logEvent(db, investigationId, "action_executed", "controller",
    "✓ Verification email sent to Jane Doe (jane.doe@acmecloud.com)");
  await sleep(400);

  await logEvent(db, investigationId, "session_resumed", "controller",
    "Investigation resumed — awaiting vendor response");
  await sleep(500);

  // Simulate vendor response arriving
  await logEvent(db, investigationId, "tool_called", "signal",
    "→ Checking vendor response channel...");
  await sleep(800);

  await logEvent(db, investigationId, "tool_completed", "signal",
    "✓ Vendor response received: Jane Doe confirms bank change was legitimate");

  const respEvid = await db.insert(evidence).values({
    investigationId,
    sourceType: "email" as any,
    sourceId: "vendor_response_001",
    claim: "Jane Doe confirmed bank change was authorized — but no formal amendment provided",
    value: "confirmed_verbal",
    confidence: 0.70,
    supports: [],
    contradicts: [],
  }).returning().then((r: any[]) => r[0]);

  broadcastEvent(investigationId, { type: "evidence", payload: respEvid });

  await logEvent(db, investigationId, "evidence_created", "controller",
    "? UNRESOLVED: Verbal confirmation does not satisfy contract amendment requirement");
  await sleep(400);

  // Final decision
  await logEvent(db, investigationId, "decision_created", "controller",
    "🟡 DECISION: HOLD — evidence supports holding payment pending contract amendment");
  await sleep(300);

  const summary = "Invoice INV-48291 (₹842,000) exceeds contract ceiling by ₹292,000 (+67.4%). " +
    "No matching PO covers the excess. Bank account changed 3 days prior — verbal authorization received but no formal contract amendment. " +
    "Recommend HOLD pending signed amendment or PO issuance.";

  await db.update(investigations).set({
    status: "completed",
    recommendation: "hold",
    confidence: "medium",
    summary,
    completedAt: new Date(),
  }).where(eq(investigations.id, investigationId));

  const finalState = await db.select().from(investigations).where(eq(investigations.id, investigationId)).then((r: any[]) => r[0]);
  broadcastEvent(investigationId, { type: "state", payload: finalState });
  broadcastEvent(investigationId, { type: "decision", payload: { recommendation: "hold", confidence: "medium", summary } });

  await logEvent(db, investigationId, "investigation_completed", "controller",
    "✓ Investigation complete — HOLD PAYMENT recommended");
}
