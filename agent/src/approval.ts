/**
 * Approval System
 * Implements human-in-the-loop authorization for critical actions
 */

import { getDatabase } from "@beforepay/database";
import { approvals, investigationEvents } from "@beforepay/database/schema";
import { eq } from "drizzle-orm";
import type { Approval } from "@beforepay/types";

export interface ApprovalRequest {
  investigationId: string;
  action: string;
  description?: string;
  recipient?: string;
  reason?: string;
  evidence?: {
    supporting: string[];
    contradicting: string[];
  };
  risk?: "low" | "medium" | "high";
  metadata?: Record<string, unknown>;
}

export interface ApprovalResponse {
  approved: boolean;
  approvedBy: string;
  reasoning?: string;
  timestamp: Date;
}

/**
 * Request approval for a critical action
 */
export async function requestApproval(
  request: ApprovalRequest
): Promise<Approval> {
  const db = await getDatabase();

  const approval = await db
    .insert(approvals)
    .values({
      investigationId: request.investigationId,
      action: request.action,
      description: request.description,
      status: "pending",
      metadata: {
        recipient: request.recipient,
        reason: request.reason,
        evidence: request.evidence,
        risk: request.risk,
        ...request.metadata,
      },
    })
    .returning()
    .then((results) => results[0]);

  // Log approval requested event
  await db.insert(investigationEvents).values({
    investigationId: request.investigationId,
    type: "approval_requested",
    agent: "controller",
    message: `Approval requested for action: ${request.action}`,
    metadata: {
      approvalId: approval.id,
      action: request.action,
      risk: request.risk,
    },
  });

  return approval;
}

/**
 * Approve a pending approval request
 */
export async function approveRequest(
  approvalId: string,
  approvedBy: string,
  reasoning?: string
): Promise<Approval> {
  const db = await getDatabase();

  const approval = await db
    .update(approvals)
    .set({
      status: "approved",
      approvedBy,
      approvedAt: new Date(),
      metadata: {
        ...(approvals.metadata ?? {}),
        reasoning,
      },
    })
    .where(eq(approvals.id, approvalId))
    .returning()
    .then((results) => results[0]);

  // Log approval event
  await db.insert(investigationEvents).values({
    investigationId: approval.investigationId,
    type: "approval_approved",
    agent: "system",
    message: `Approval granted for action: ${approval.action}`,
    metadata: {
      approvalId,
      approvedBy,
      reasoning,
    },
  });

  return approval;
}

/**
 * Reject a pending approval request
 */
export async function rejectRequest(
  approvalId: string,
  rejectedBy: string,
  reason: string
): Promise<Approval> {
  const db = await getDatabase();

  const approval = await db
    .update(approvals)
    .set({
      status: "rejected",
      metadata: {
        ...(approvals.metadata ?? {}),
        rejectedBy,
        rejectionReason: reason,
      },
    })
    .where(eq(approvals.id, approvalId))
    .returning()
    .then((results) => results[0]);

  // Log rejection event
  await db.insert(investigationEvents).values({
    investigationId: approval.investigationId,
    type: "approval_rejected",
    agent: "system",
    message: `Approval denied for action: ${approval.action}`,
    metadata: {
      approvalId,
      rejectedBy,
      reason,
    },
  });

  return approval;
}

/**
 * Get pending approvals for an investigation
 */
export async function getPendingApprovals(
  investigationId: string
): Promise<Approval[]> {
  const db = await getDatabase();

  return await db
    .select()
    .from(approvals)
    .where(
      (a) =>
        a.investigationId === investigationId &&
        a.status === "pending"
    );
}

/**
 * Check if an approval is pending
 */
export async function hasApprovalsPending(
  investigationId: string
): Promise<boolean> {
  const pending = await getPendingApprovals(investigationId);
  return pending.length > 0;
}

/**
 * Get approval status
 */
export async function getApprovalStatus(
  approvalId: string
): Promise<Approval | null> {
  const db = await getDatabase();

  return await db
    .select()
    .from(approvals)
    .where(eq(approvals.id, approvalId))
    .then((results) => results[0] || null);
}

/**
 * Determine if action requires approval based on risk and type
 */
export function isApprovalRequired(
  action: string,
  riskLevel: "low" | "medium" | "high",
  metadata?: Record<string, unknown>
): boolean {
  // High risk actions always require approval
  if (riskLevel === "high") return true;

  // Specific actions that always require approval
  const requiresApproval = [
    "send_vendor_email",
    "hold_payment",
    "release_payment",
    "block_payment",
    "modify_contract",
    "dispute_invoice",
  ];

  if (requiresApproval.includes(action)) return true;

  // Medium risk requires approval if value is significant
  if (riskLevel === "medium") {
    const value = metadata?.amount as number;
    if (value && value > 500000) return true;
  }

  return false;
}

/**
 * Create approval checkpoint UI data
 */
export function createApprovalCheckpoint(
  approval: Approval
): {
  title: string;
  action: string;
  description: string;
  evidence: {
    supporting: string[];
    contradicting: string[];
  };
  risk: string;
  recipient?: string;
  reasoning?: string;
} {
  const metadata = approval.metadata as Record<string, unknown> || {};

  return {
    title: "HUMAN APPROVAL REQUIRED",
    action: approval.action,
    description: approval.description || "",
    evidence: (metadata.evidence as any) || {
      supporting: [],
      contradicting: [],
    },
    risk: (metadata.risk as string) || "unknown",
    recipient: metadata.recipient as string | undefined,
    reasoning: metadata.reason as string | undefined,
  };
}
