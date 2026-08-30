/**
 * Finance MCP Server
 * Tools for financial analysis and invoice/payment examination
 */

import { getDatabase } from "@beforepay/database";
import { invoices, payments, contracts, purchaseOrders } from "@beforepay/database/schema";
import { eq } from "drizzle-orm";

export interface FinanceAnalysisResult {
  invoiceId: string;
  amount: number;
  currency: string;
  contractCeiling: number;
  variance: number;
  variancePercentage: number;
  historicalMedian: number;
  historicalMean: number;
  standardDeviation: number;
  currentDeviation: number;
  isOutlier: boolean;
  poAmount?: number;
  status: string;
}

export async function getInvoiceDetails(invoiceId: string) {
  const db = await getDatabase();

  const invoice = await db
    .select()
    .from(invoices)
    .where(eq(invoices.id, invoiceId))
    .then((results) => results[0]);

  if (!invoice) {
    throw new Error(`Invoice not found: ${invoiceId}`);
  }

  return {
    source: {
      type: "invoice",
      id: invoice.id,
    },
    data: {
      invoiceNumber: invoice.invoiceNumber,
      amount: invoice.amount,
      currency: invoice.currency,
      issueDate: invoice.issueDate,
      dueDate: invoice.dueDate,
      status: invoice.status,
      vendorId: invoice.vendorId,
      poId: invoice.poId,
    },
    retrievedAt: new Date().toISOString(),
  };
}

export async function analyzeInvoiceVariance(
  invoiceId: string,
  vendorId: string
): Promise<FinanceAnalysisResult> {
  const db = await getDatabase();

  // Get current invoice
  const currentInvoice = await db
    .select()
    .from(invoices)
    .where(eq(invoices.id, invoiceId))
    .then((results) => results[0]);

  if (!currentInvoice) {
    throw new Error(`Invoice not found: ${invoiceId}`);
  }

  // Get historical invoices for this vendor
  const historicalInvoices = await db
    .select()
    .from(invoices)
    .where(eq(invoices.vendorId, vendorId))
    .then((results) =>
      results.filter(
        (inv) =>
          inv.id !== invoiceId &&
          inv.status === "paid" &&
          inv.issueDate.getTime() < currentInvoice.issueDate.getTime()
      )
    );

  // Calculate statistics
  const amounts = historicalInvoices.map((inv) => parseFloat(inv.amount.toString()));
  const mean = amounts.length > 0 ? amounts.reduce((a, b) => a + b, 0) / amounts.length : 0;
  const median = amounts.length > 0 ? amounts.sort((a, b) => a - b)[Math.floor(amounts.length / 2)] : 0;
  const variance = amounts.length > 0 ? amounts.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / amounts.length : 0;
  const stdDev = Math.sqrt(variance);

  const currentAmount = parseFloat(currentInvoice.amount.toString());
  const deviation = currentAmount - mean;
  const deviationStdDevs = stdDev > 0 ? deviation / stdDev : 0;

  // Get contract ceiling
  const contract = await db
    .select()
    .from(contracts)
    .where(eq(contracts.vendorId, vendorId))
    .then((results) => results.find((c) => c.status === "active"));

  const contractCeiling = contract ? parseFloat(contract.monthlyCeiling.toString()) : 0;
  const contractVariance = currentAmount - contractCeiling;
  const contractVariancePercentage = contractCeiling > 0 ? (contractVariance / contractCeiling) * 100 : 0;

  // Get PO if exists
  const po = currentInvoice.poId
    ? await db
        .select()
        .from(purchaseOrders)
        .where(eq(purchaseOrders.id, currentInvoice.poId))
        .then((results) => results[0])
    : null;

  return {
    invoiceId,
    amount: currentAmount,
    currency: currentInvoice.currency,
    contractCeiling,
    variance: contractVariance,
    variancePercentage: contractVariancePercentage,
    historicalMedian: median,
    historicalMean: mean,
    standardDeviation: stdDev,
    currentDeviation: deviationStdDevs,
    isOutlier: Math.abs(deviationStdDevs) > 2, // 2 sigma rule
    poAmount: po ? parseFloat(po.amount.toString()) : undefined,
    status: currentInvoice.status,
  };
}

export async function getPaymentHistory(vendorId: string) {
  const db = await getDatabase();

  const vendorInvoices = await db
    .select()
    .from(invoices)
    .where(eq(invoices.vendorId, vendorId));

  const vendorPayments = await Promise.all(
    vendorInvoices.map(async (inv) => {
      const invPayments = await db
        .select()
        .from(payments)
        .where(eq(payments.invoiceId, inv.id));
      return { invoice: inv, payments: invPayments };
    })
  );

  return {
    source: {
      type: "vendor",
      id: vendorId,
    },
    data: {
      totalInvoices: vendorInvoices.length,
      totalPaid: vendorPayments
        .filter((p) => p.payments.some((pay) => pay.status === "released"))
        .length,
      averageAmount:
        vendorInvoices.length > 0
          ? vendorInvoices
              .reduce((sum, inv) => sum + parseFloat(inv.amount.toString()), 0)
              .toString()
          : "0",
      history: vendorPayments.map((p) => ({
        invoiceId: p.invoice.id,
        invoiceNumber: p.invoice.invoiceNumber,
        amount: p.invoice.amount,
        issueDate: p.invoice.issueDate,
        payments: p.payments.map((pay) => ({
          status: pay.status,
          amount: pay.amount,
          releasedAt: pay.releasedAt,
        })),
      })),
    },
    retrievedAt: new Date().toISOString(),
  };
}
