/**
 * Vendor MCP Server
 * Tools for vendor verification and contact authentication
 */

import { getDatabase } from "@beforepay/database";
import {
  vendors,
  vendorContacts,
  bankAccounts,
  bankAccountChanges,
} from "@beforepay/database/schema";
import { eq } from "drizzle-orm";

export async function getVendorDetails(vendorId: string) {
  const db = await getDatabase();

  const vendor = await db
    .select()
    .from(vendors)
    .where(eq(vendors.id, vendorId))
    .then((results) => results[0]);

  if (!vendor) {
    throw new Error(`Vendor not found: ${vendorId}`);
  }

  const contacts = await db
    .select()
    .from(vendorContacts)
    .where(eq(vendorContacts.vendorId, vendorId));

  const bankAccts = await db
    .select()
    .from(bankAccounts)
    .where(eq(bankAccounts.vendorId, vendorId));

  return {
    source: {
      type: "vendor",
      id: vendor.id,
    },
    data: {
      name: vendor.name,
      legalName: vendor.legalName,
      status: vendor.status,
      riskStatus: vendor.riskStatus,
      contactCount: contacts.length,
      activeContacts: contacts.filter((c) => c.isVerified).length,
      bankAccountCount: bankAccts.length,
      activeBankAccount: bankAccts.find((b) => b.status === "active"),
      contacts: contacts.map((c) => ({
        name: c.name,
        email: c.email,
        verified: c.isVerified,
        verifiedAt: c.verifiedAt,
      })),
    },
    retrievedAt: new Date().toISOString(),
  };
}

export async function getVendorBankHistory(vendorId: string) {
  const db = await getDatabase();

  const bankAccts = await db
    .select()
    .from(bankAccounts)
    .where(eq(bankAccounts.vendorId, vendorId));

  const changes = await db
    .select()
    .from(bankAccountChanges)
    .where(eq(bankAccountChanges.vendorId, vendorId));

  return {
    source: {
      type: "bank",
      id: vendorId,
    },
    data: {
      currentAccounts: bankAccts
        .filter((b) => b.status === "active")
        .map((b) => ({
          id: b.id,
          bankName: b.bankName,
          maskedAccount: b.maskedAccount,
          effectiveFrom: b.effectiveFrom,
        })),
      previousAccounts: bankAccts
        .filter((b) => b.status !== "active")
        .map((b) => ({
          id: b.id,
          bankName: b.bankName,
          maskedAccount: b.maskedAccount,
          effectiveFrom: b.effectiveFrom,
          status: b.status,
        })),
      recentChanges: changes
        .sort(
          (a, b) =>
            b.requestedAt.getTime() - a.requestedAt.getTime()
        )
        .slice(0, 10)
        .map((c) => ({
          id: c.id,
          requestedAt: c.requestedAt,
          requestedBy: c.requestedBy,
          source: c.source,
          status: c.status,
        })),
    },
    retrievedAt: new Date().toISOString(),
  };
}

export async function verifyVendorContact(
  vendorId: string,
  email: string
) {
  const db = await getDatabase();

  const contact = await db
    .select()
    .from(vendorContacts)
    .where(
      (c) =>
        c.vendorId === vendorId &&
        c.email === email
    )
    .then((results) => results[0]);

  if (!contact) {
    return {
      verified: false,
      reason: "Contact not found",
    };
  }

  return {
    source: {
      type: "vendor",
      id: vendorId,
    },
    data: {
      name: contact.name,
      email: contact.email,
      verified: contact.isVerified,
      verifiedAt: contact.verifiedAt,
      isAuthorizedForBankChange:
        contact.isVerified &&
        contact.verifiedAt &&
        new Date().getTime() - contact.verifiedAt.getTime() < 90 * 24 * 60 * 60 * 1000,
    },
    retrievedAt: new Date().toISOString(),
  };
}

export async function checkBankChangeAuthorization(
  vendorId: string,
  newBankAccount: string
): Promise<{
  authorized: boolean;
  confidence: number;
  authorizedBy?: string;
  authorizedDate?: Date;
  reason: string;
}> {
  const db = await getDatabase();

  // Check if verified contact requested the change
  const recentChange = await db
    .select()
    .from(bankAccountChanges)
    .where(
      (c) =>
        c.vendorId === vendorId
    )
    .then((results) =>
      results
        .sort(
          (a, b) =>
            b.requestedAt.getTime() - a.requestedAt.getTime()
        )
        .find(
          (c) =>
            new Date().getTime() - c.requestedAt.getTime() <
            7 * 24 * 60 * 60 * 1000
        )
    );

  if (!recentChange || !recentChange.requestedBy) {
    return {
      authorized: false,
      confidence: 0,
      reason: "No recent bank change request found",
    };
  }

  const contact = await db
    .select()
    .from(vendorContacts)
    .where(
      (c) =>
        c.vendorId === vendorId &&
        c.email === recentChange.requestedBy
    )
    .then((results) => results[0]);

  if (!contact) {
    return {
      authorized: false,
      confidence: 0,
      reason: "Requester not found in vendor contacts",
    };
  }

  if (!contact.isVerified) {
    return {
      authorized: false,
      confidence: 0.2,
      reason: "Contact is not verified",
    };
  }

  return {
    authorized: true,
    confidence: 0.8,
    authorizedBy: contact.name,
    authorizedDate: recentChange.requestedAt,
    reason: "Verified contact requested bank change",
  };
}
