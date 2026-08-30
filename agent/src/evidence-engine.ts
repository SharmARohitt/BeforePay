/**
 * Evidence Engine
 * Core system for evidence correlation, contradiction detection, and gap analysis
 */

import { getDatabase } from "@beforepay/database";
import { evidence, investigations } from "@beforepay/database/schema";
import { eq } from "drizzle-orm";
import type { Evidence as EvidenceType } from "@beforepay/types";

export interface CorrelatedEvidence {
  id: string;
  claim: string;
  sourceType: string;
  sourceId: string;
  confidence: number;
  supports: string[];
  contradicts: string[];
  status: "supported" | "contradicted" | "unknown" | "inferred";
}

export interface EvidenceGapAnalysis {
  supported: CorrelatedEvidence[];
  contradicted: CorrelatedEvidence[];
  unknown: CorrelatedEvidence[];
  inferred: CorrelatedEvidence[];
  gaps: string[];
  contradictions: {
    claim1: string;
    claim2: string;
    severity: "low" | "medium" | "high";
  }[];
}

/**
 * Create evidence from tool output
 */
export async function createEvidence(
  investigationId: string,
  sourceType: string,
  sourceId: string,
  claim: string,
  value: string | number | boolean,
  confidence: number,
  supports: string[] = [],
  contradicts: string[] = []
): Promise<EvidenceType> {
  const db = await getDatabase();

  const evid = await db
    .insert(evidence)
    .values({
      investigationId,
      sourceType: sourceType as any,
      sourceId,
      claim,
      value: String(value),
      confidence,
      supports,
      contradicts,
    })
    .returning()
    .then((results) => results[0]);

  return evid as EvidenceType;
}

/**
 * Get all evidence for an investigation
 */
export async function getInvestigationEvidence(
  investigationId: string
): Promise<CorrelatedEvidence[]> {
  const db = await getDatabase();

  const allEvidence = await db
    .select()
    .from(evidence)
    .where(eq(evidence.investigationId, investigationId));

  return allEvidence.map((e) => ({
    id: e.id,
    claim: e.claim,
    sourceType: e.sourceType,
    sourceId: e.sourceId,
    confidence: parseFloat(e.confidence.toString()),
    supports: (e.supports as string[]) || [],
    contradicts: (e.contradicts as string[]) || [],
    status: determineEvidenceStatus(e),
  }));
}

/**
 * Determine evidence status based on relationships
 */
function determineEvidenceStatus(e: any): "supported" | "contradicted" | "unknown" | "inferred" {
  if (e.sourceType === "inference" || e.sourceType === "sandbox") {
    return "inferred";
  }
  if ((e.contradicts as string[])?.length > 0) {
    return "contradicted";
  }
  if ((e.supports as string[])?.length > 0) {
    return "supported";
  }
  return "unknown";
}

/**
 * Analyze evidence for contradictions
 */
export async function detectContradictions(
  investigationId: string
): Promise<{
  claim: string;
  conflictsWith: string;
  severity: "low" | "medium" | "high";
}[]> {
  const allEvidence = await getInvestigationEvidence(investigationId);

  const contradictions: {
    claim: string;
    conflictsWith: string;
    severity: "low" | "medium" | "high";
  }[] = [];

  for (const e of allEvidence) {
    if (e.contradicts.length > 0) {
      for (const conflictId of e.contradicts) {
        const conflictingE = allEvidence.find((ev) => ev.id === conflictId);
        if (conflictingE) {
          // Severity based on confidence levels
          const minConfidence = Math.min(e.confidence, conflictingE.confidence);
          let severity: "low" | "medium" | "high" = "low";
          if (minConfidence > 0.7) {
            severity = "high";
          } else if (minConfidence > 0.4) {
            severity = "medium";
          }

          contradictions.push({
            claim: e.claim,
            conflictsWith: conflictingE.claim,
            severity,
          });
        }
      }
    }
  }

  return contradictions;
}

/**
 * Identify evidence gaps
 */
export async function identifyEvidenceGaps(
  investigationId: string
): Promise<{
  category: string;
  description: string;
  priority: "low" | "medium" | "high";
}[]> {
  const allEvidence = await getInvestigationEvidence(investigationId);

  const gaps: {
    category: string;
    description: string;
    priority: "low" | "medium" | "high";
  }[] = [];

  // Check for required evidence categories
  const hasFinancialAnalysis = allEvidence.some((e) =>
    ["invoice", "contract", "po"].includes(e.sourceType)
  );
  if (!hasFinancialAnalysis) {
    gaps.push({
      category: "Financial Data",
      description: "Missing financial analysis and variance calculation",
      priority: "high",
    });
  }

  const hasVendorInfo = allEvidence.some((e) =>
    ["vendor", "bank"].includes(e.sourceType)
  );
  if (!hasVendorInfo) {
    gaps.push({
      category: "Vendor Information",
      description: "Missing vendor verification and bank account details",
      priority: "high",
    });
  }

  const hasContractInfo = allEvidence.some((e) => e.sourceType === "contract");
  if (!hasContractInfo) {
    gaps.push({
      category: "Contract Terms",
      description: "Missing active contract details",
      priority: "high",
    });
  }

  const hasCommunications = allEvidence.some((e) => e.sourceType === "email");
  if (!hasCommunications) {
    gaps.push({
      category: "Communications",
      description: "No email evidence collected",
      priority: "medium",
    });
  }

  const hasApprovals = allEvidence.some((e) =>
    e.claim.toLowerCase().includes("approv")
  );
  if (!hasApprovals) {
    gaps.push({
      category: "Approvals",
      description: "No approval or authorization evidence found",
      priority: "medium",
    });
  }

  return gaps;
}

/**
 * Correlate all evidence for comprehensive analysis
 */
export async function correlateEvidence(
  investigationId: string
): Promise<EvidenceGapAnalysis> {
  const allEvidence = await getInvestigationEvidence(investigationId);
  const contradictions = await detectContradictions(investigationId);
  const gaps = await identifyEvidenceGaps(investigationId);

  const supported = allEvidence.filter((e) => e.status === "supported");
  const contradicted = allEvidence.filter((e) => e.status === "contradicted");
  const unknown = allEvidence.filter((e) => e.status === "unknown");
  const inferred = allEvidence.filter((e) => e.status === "inferred");

  const gapDescriptions = gaps.map((g) => `${g.category}: ${g.description}`);

  return {
    supported,
    contradicted,
    unknown,
    inferred,
    gaps: gapDescriptions,
    contradictions: contradictions.map((c) => ({
      claim1: c.claim,
      claim2: c.conflictsWith,
      severity: c.severity,
    })),
  };
}

/**
 * Calculate investigation confidence based on evidence
 */
export async function calculateConfidence(
  investigationId: string
): Promise<{
  overall: "high" | "medium" | "low";
  score: number;
  reasoning: string[];
}> {
  const correlation = await correlateEvidence(investigationId);

  const reasoning: string[] = [];
  let score = 0;
  let maxScore = 0;

  // Financial evidence strength
  const financialEvidence = correlation.supported.filter((e) =>
    ["invoice", "contract", "po"].includes(e.sourceType)
  );
  const financialScore = (financialEvidence.length / 3) * 25;
  score += financialScore;
  maxScore += 25;
  if (financialScore > 20) {
    reasoning.push("Strong financial evidence base");
  } else if (financialScore > 10) {
    reasoning.push("Moderate financial evidence");
  } else {
    reasoning.push("Weak financial evidence");
  }

  // Contradiction severity
  const highSeverityContradictions = correlation.contradictions.filter(
    (c) => c.severity === "high"
  ).length;
  const contradictionScore = Math.max(0, 25 - highSeverityContradictions * 10);
  score += contradictionScore;
  maxScore += 25;
  if (highSeverityContradictions > 0) {
    reasoning.push(
      `${highSeverityContradictions} high-severity contradiction(s) detected`
    );
  } else {
    reasoning.push("No critical contradictions");
  }

  // Evidence gaps
  const criticalGaps = correlation.gaps.length;
  const gapScore = Math.max(0, 25 - criticalGaps * 5);
  score += gapScore;
  maxScore += 25;
  if (criticalGaps > 0) {
    reasoning.push(`${criticalGaps} evidence gap(s) identified`);
  } else {
    reasoning.push("Complete evidence coverage");
  }

  // Vendor verification
  const vendorEvidence = correlation.supported.filter(
    (e) => e.sourceType === "vendor"
  );
  const vendorScore = vendorEvidence.length > 0 ? 25 : 10;
  score += vendorScore;
  maxScore += 25;
  if (vendorEvidence.length > 0) {
    reasoning.push("Vendor verification completed");
  } else {
    reasoning.push("Vendor verification pending");
  }

  const normalizedScore = (score / maxScore) * 100;
  let overall: "high" | "medium" | "low";

  if (normalizedScore >= 75) {
    overall = "high";
  } else if (normalizedScore >= 50) {
    overall = "medium";
  } else {
    overall = "low";
  }

  return {
    overall,
    score: normalizedScore,
    reasoning,
  };
}

/**
 * Generate evidence summary report
 */
export async function generateEvidenceReport(
  investigationId: string
): Promise<string> {
  const correlation = await correlateEvidence(investigationId);
  const confidence = await calculateConfidence(investigationId);

  let report = `EVIDENCE REPORT\n`;
  report += `Investigation: ${investigationId}\n`;
  report += `Confidence: ${confidence.overall} (${confidence.score.toFixed(1)}%)\n\n`;

  report += `SUPPORTED CLAIMS (${correlation.supported.length}):\n`;
  correlation.supported.forEach((e) => {
    report += `  ✓ ${e.claim} [${(e.confidence * 100).toFixed(0)}%]\n`;
  });

  report += `\nCONTRADICTED CLAIMS (${correlation.contradicted.length}):\n`;
  correlation.contradicted.forEach((e) => {
    report += `  ✗ ${e.claim} [conflicts: ${e.contradicts.join(", ")}]\n`;
  });

  report += `\nUNKNOWN/UNVERIFIED (${correlation.unknown.length}):\n`;
  correlation.unknown.forEach((e) => {
    report += `  ? ${e.claim}\n`;
  });

  report += `\nCONTRADICTIONS (${correlation.contradictions.length}):\n`;
  correlation.contradictions.forEach((c) => {
    report += `  ⚠ ${c.severity.toUpperCase()}: "${c.claim1}" vs "${c.claim2}"\n`;
  });

  report += `\nEVIDENCE GAPS:\n`;
  correlation.gaps.forEach((g) => {
    report += `  - ${g}\n`;
  });

  report += `\nCONFIDENCE REASONING:\n`;
  confidence.reasoning.forEach((r) => {
    report += `  • ${r}\n`;
  });

  return report;
}
