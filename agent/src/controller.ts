/**
 * Controller Agent
 * Orchestrates the payment exception investigation process
 * Acts as the primary decision-maker and delegator
 */

import { getDatabase } from "@beforepay/database";
import {
  investigations,
  investigationEvents,
  paymentExceptions,
  payments,
  invoices,
  vendors,
} from "@beforepay/database";
import { eq } from "drizzle-orm";
import type {
  Investigation,
  InvestigationEvent,
  PaymentException,
} from "@beforepay/types";

export interface InvestigationContext {
  exceptionId: string;
  paymentId: string;
  invoiceId: string;
  vendorId: string;
  currentAmount: number;
  exception: PaymentException;
  ledgerFindings?: Record<string, unknown>;
  counselFindings?: Record<string, unknown>;
  signalFindings?: Record<string, unknown>;
  evidenceGaps: string[];
  contradictions: string[];
  approvalRequired: boolean;
}

/**
 * Start investigation for a payment exception
 */
export async function startInvestigation(
  exceptionId: string,
  sessionId?: string
): Promise<Investigation> {
  const db = await getDatabase();

  // Fetch exception details
  const exception = await db
    .select()
    .from(paymentExceptions)
    .where(eq(paymentExceptions.id, exceptionId))
    .then((results) => results[0]);

  if (!exception) {
    throw new Error(`Payment exception not found: ${exceptionId}`);
  }

  // Fetch payment details
  const payment = await db
    .select()
    .from(payments)
    .where(eq(payments.id, exception.paymentId))
    .then((results) => results[0]);

  if (!payment) {
    throw new Error(`Payment not found: ${exception.paymentId}`);
  }

  // Fetch invoice details
  const invoice = await db
    .select()
    .from(invoices)
    .where(eq(invoices.id, payment.invoiceId))
    .then((results) => results[0]);

  if (!invoice) {
    throw new Error(`Invoice not found: ${payment.invoiceId}`);
  }

  // Create investigation record
  const investigation = await db
    .insert(investigations)
    .values({
      paymentExceptionId: exceptionId,
      trueforgeSessionId: sessionId,
      status: "investigating",
      startedAt: new Date(),
    })
    .returning()
    .then((results) => results[0]);

  // Log investigation start event
  await db.insert(investigationEvents).values({
    investigationId: investigation.id,
    type: "investigation_started",
    agent: "controller",
    message: `Investigation started for payment exception: ${exception.type}`,
    metadata: {
      exceptionId,
      paymentId: exception.paymentId,
      invoiceId: payment.invoiceId,
      vendorId: invoice.vendorId,
      amount: payment.amount,
      sessionId,
    },
  });

  return investigation;
}

/**
 * Build investigation context from payment exception
 */
export async function buildContext(
  exceptionId: string
): Promise<InvestigationContext> {
  const db = await getDatabase();

  const exception = await db
    .select()
    .from(paymentExceptions)
    .where(eq(paymentExceptions.id, exceptionId))
    .then((results) => results[0]);

  if (!exception) {
    throw new Error(`Exception not found: ${exceptionId}`);
  }

  const payment = await db
    .select()
    .from(payments)
    .where(eq(payments.id, exception.paymentId))
    .then((results) => results[0]);

  if (!payment) {
    throw new Error(`Payment not found`);
  }

  const invoice = await db
    .select()
    .from(invoices)
    .where(eq(invoices.id, payment.invoiceId))
    .then((results) => results[0]);

  if (!invoice) {
    throw new Error(`Invoice not found`);
  }

  const vendor = await db
    .select()
    .from(vendors)
    .where(eq(vendors.id, invoice.vendorId))
    .then((results) => results[0]);

  if (!vendor) {
    throw new Error(`Vendor not found`);
  }

  return {
    exceptionId,
    paymentId: exception.paymentId,
    invoiceId: payment.invoiceId,
    vendorId: invoice.vendorId,
    currentAmount: parseFloat(payment.amount.toString()),
    exception,
    evidenceGaps: [],
    contradictions: [],
    approvalRequired: false,
  };
}

/**
 * Analyze evidence gaps and determine what additional information is needed
 */
export async function analyzeEvidenceGaps(
  context: InvestigationContext
): Promise<{
  known: string[];
  conflicting: string[];
  unknown: string[];
  required: string[];
}> {
  const gaps = {
    known: [] as string[],
    conflicting: [] as string[],
    unknown: [] as string[],
    required: [] as string[],
  };

  // Check ledger findings
  if (context.ledgerFindings) {
    if ((context.ledgerFindings as any).isOutlier) {
      gaps.conflicting.push("Invoice amount is statistical outlier");
    } else {
      gaps.known.push("Invoice within historical variance range");
    }
  } else {
    gaps.required.push("Financial analysis (Ledger Agent)");
  }

  // Check counsel findings
  if (context.counselFindings) {
    const counsel = context.counselFindings as any;
    if (counsel.compliant) {
      gaps.known.push("Contract compliance verified");
    } else {
      gaps.conflicting.push("Contract ceiling exceeded");
      gaps.required.push("Contract amendment or authorization");
    }
  } else {
    gaps.required.push("Contract compliance check (Counsel Agent)");
  }

  // Check signal findings
  if (context.signalFindings) {
    const signal = context.signalFindings as any;
    if (signal.bankChangeAuthorized) {
      gaps.known.push("Bank change verified");
    } else if (signal.recentBankChange) {
      gaps.conflicting.push("Recent bank change not fully authorized");
      gaps.required.push("Bank change authorization verification");
    }
  } else {
    gaps.required.push("Vendor verification (Signal Agent)");
  }

  return gaps;
}

/**
 * Determine if human approval is required
 */
export function requiresApproval(context: InvestigationContext): boolean {
  // Approval required if:
  // 1. Significant contract violation
  // 2. Bank change detected
  // 3. Unverified vendor contacts involved
  // 4. High-value anomaly
  // 5. Multiple conflicting evidence items

  const amount = context.currentAmount;
  const violations = context.contradictions.length;
  const unknowns = context.evidenceGaps.length;

  return violations > 0 || unknowns > 2 || amount > 750000;
}

/**
 * Generate investigation summary
 */
export async function generateInvestigationSummary(
  investigationId: string,
  context: InvestigationContext
): Promise<string> {
  const gapAnalysis = await analyzeEvidenceGaps(context);

  let summary = `Payment Exception Investigation\n`;
  summary += `Exception Type: ${context.exception.type}\n`;
  summary += `Invoice Amount: ₹${context.currentAmount.toLocaleString()}\n\n`;

  summary += `Evidence Summary:\n`;
  summary += `Known: ${gapAnalysis.known.length > 0 ? gapAnalysis.known.join(", ") : "None"}\n`;
  summary += `Conflicting: ${gapAnalysis.conflicting.length > 0 ? gapAnalysis.conflicting.join(", ") : "None"}\n`;
  summary += `Unknown: ${gapAnalysis.unknown.length > 0 ? gapAnalysis.unknown.join(", ") : "None"}\n`;
  summary += `Required: ${gapAnalysis.required.length > 0 ? gapAnalysis.required.join(", ") : "None"}\n`;

  return summary;
}

/**
 * Log investigation event
 */
export async function logInvestigationEvent(
  investigationId: string,
  type: string,
  agent: string,
  message: string,
  metadata?: Record<string, unknown>
): Promise<InvestigationEvent> {
  const db = await getDatabase();

  const event = await db
    .insert(investigationEvents)
    .values({
      investigationId,
      type: type as any,
      agent,
      message,
      metadata,
    })
    .returning()
    .then((results) => results[0]);

  return event;
}

/**
 * Complete investigation with recommendation
 */
export async function completeInvestigation(
  investigationId: string,
  recommendation: "verified" | "hold" | "block",
  confidence: "high" | "medium" | "low",
  summary: string
): Promise<Investigation> {
  const db = await getDatabase();

  const investigation = await db
    .update(investigations)
    .set({
      status: "completed",
      recommendation,
      confidence,
      summary,
      completedAt: new Date(),
    })
    .where(eq(investigations.id, investigationId))
    .returning()
    .then((results) => results[0]);

  await logInvestigationEvent(
    investigationId,
    "investigation_completed",
    "controller",
    `Investigation completed with recommendation: ${recommendation}`,
    { recommendation, confidence }
  );

  return investigation;
}
