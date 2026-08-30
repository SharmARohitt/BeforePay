/**
 * Contracts MCP Server
 * Tools for contract analysis and procurement verification
 */

import { getDatabase } from "@beforepay/database";
import { contracts, contractAmendments, purchaseOrders } from "@beforepay/database/schema";
import { eq } from "drizzle-orm";

export async function getActiveContract(vendorId: string) {
  const db = await getDatabase();

  const contract = await db
    .select()
    .from(contracts)
    .where(
      (c) =>
        c.vendorId === vendorId &&
        c.status === "active"
    )
    .then((results) => results[0]);

  if (!contract) {
    throw new Error(`No active contract found for vendor: ${vendorId}`);
  }

  const amendments = await db
    .select()
    .from(contractAmendments)
    .where(
      (a) =>
        a.contractId === contract.id &&
        a.status === "approved"
    );

  return {
    source: {
      type: "contract",
      id: contract.id,
    },
    data: {
      contractNumber: contract.contractNumber,
      version: contract.version,
      monthlyCeiling: contract.monthlyCeiling,
      currency: contract.currency,
      effectiveFrom: contract.effectiveFrom,
      effectiveTo: contract.effectiveTo,
      status: contract.status,
      approvedAmendments: amendments.map((a) => ({
        id: a.id,
        amountChange: a.amountChange,
        description: a.description,
        effectiveFrom: a.effectiveFrom,
      })),
      totalApprovedIncrease: amendments
        .reduce(
          (sum, a) =>
            sum +
            (a.status === "approved"
              ? parseFloat(a.amountChange.toString())
              : 0),
          0
        )
        .toString(),
    },
    retrievedAt: new Date().toISOString(),
  };
}

export async function analyzeContractCompliance(
  vendorId: string,
  invoiceAmount: number
): Promise<{
  compliant: boolean;
  ceiling: number;
  variance: number;
  variancePercentage: number;
  withinLimits: boolean;
  requiresAmendment: boolean;
  recommendations: string[];
}> {
  const db = await getDatabase();

  const contract = await db
    .select()
    .from(contracts)
    .where(
      (c) =>
        c.vendorId === vendorId &&
        c.status === "active"
    )
    .then((results) => results[0]);

  if (!contract) {
    return {
      compliant: false,
      ceiling: 0,
      variance: invoiceAmount,
      variancePercentage: 100,
      withinLimits: false,
      requiresAmendment: true,
      recommendations: ["No active contract found"],
    };
  }

  const ceiling = parseFloat(contract.monthlyCeiling.toString());
  const variance = invoiceAmount - ceiling;
  const variancePercentage = (variance / ceiling) * 100;
  const withinLimits = variance <= 0;

  const recommendations: string[] = [];
  if (!withinLimits) {
    recommendations.push("Invoice exceeds contract ceiling");
    recommendations.push("Contract amendment required");
    if (variancePercentage > 50) {
      recommendations.push("Significant overage detected");
    }
  }

  return {
    compliant: withinLimits,
    ceiling,
    variance,
    variancePercentage,
    withinLimits,
    requiresAmendment: !withinLimits,
    recommendations,
  };
}

export async function getPurchaseOrderDetails(poId: string) {
  const db = await getDatabase();

  const po = await db
    .select()
    .from(purchaseOrders)
    .where(eq(purchaseOrders.id, poId))
    .then((results) => results[0]);

  if (!po) {
    throw new Error(`Purchase Order not found: ${poId}`);
  }

  return {
    source: {
      type: "po",
      id: po.id,
    },
    data: {
      poNumber: po.poNumber,
      vendorId: po.vendorId,
      amount: po.amount,
      currency: po.currency,
      status: po.status,
      issuedAt: po.issuedAt,
      createdAt: po.createdAt,
    },
    retrievedAt: new Date().toISOString(),
  };
}

export async function checkPOCoverage(
  vendorId: string,
  invoiceAmount: number
): Promise<{
  covered: boolean;
  totalPOAmount: number;
  usedAmount: number;
  availableAmount: number;
  recommendations: string[];
}> {
  const db = await getDatabase();

  const pos = await db
    .select()
    .from(purchaseOrders)
    .where(
      (po) =>
        po.vendorId === vendorId &&
        po.status === "issued"
    );

  if (pos.length === 0) {
    return {
      covered: false,
      totalPOAmount: 0,
      usedAmount: 0,
      availableAmount: 0,
      recommendations: ["No active Purchase Orders found for this vendor"],
    };
  }

  const totalPOAmount = pos.reduce(
    (sum, po) => sum + parseFloat(po.amount.toString()),
    0
  );

  const covered = invoiceAmount <= totalPOAmount;

  return {
    covered,
    totalPOAmount,
    usedAmount: invoiceAmount,
    availableAmount: Math.max(0, totalPOAmount - invoiceAmount),
    recommendations: covered
      ? ["Invoice is covered by active POs"]
      : ["Invoice exceeds available PO coverage", "Additional PO required"],
  };
}
