import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";
import * as schema from "../src/schema.js";
import {
  companies,
  vendors,
  vendorContacts,
  bankAccounts,
  bankAccountChanges,
  contracts,
  purchaseOrders,
  invoices,
  payments,
  paymentExceptions,
} from "../src/schema.js";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

async function seed() {
  console.log("🌱 Starting database seeding...");

  const client = new Client({
    connectionString: DATABASE_URL,
  });

  try {
    await client.connect();
    console.log("✓ Connected to database");

    const db = drizzle(client, { schema });

    // Create NovaStack company
    const company = await db
      .insert(companies)
      .values({
        name: "NovaStack",
      })
      .returning();

    console.log("✓ Company created: NovaStack");

    // Create Acme Cloud Services vendor
    const vendor = await db
      .insert(vendors)
      .values({
        companyId: company[0].id,
        name: "Acme Cloud Services",
        legalName: "Acme Cloud Services Pvt Ltd",
        status: "active",
        riskStatus: "medium",
      })
      .returning();

    console.log("✓ Vendor created: Acme Cloud Services");

    // Create vendor contacts
    const contact1 = await db
      .insert(vendorContacts)
      .values({
        vendorId: vendor[0].id,
        name: "John Smith",
        email: "john.smith@acmecloud.com",
        isVerified: true,
        verifiedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      })
      .returning();

    const contact2 = await db
      .insert(vendorContacts)
      .values({
        vendorId: vendor[0].id,
        name: "Jane Doe",
        email: "jane.doe@acmecloud.com",
        isVerified: true,
        verifiedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      })
      .returning();

    console.log("✓ Vendor contacts created");

    // Create bank accounts - OLD account
    const oldBankAccount = await db
      .insert(bankAccounts)
      .values({
        vendorId: vendor[0].id,
        bankName: "HDFC Bank",
        maskedAccount: "****4821",
        routingReference: "HDFC0004821",
        status: "inactive",
        effectiveFrom: new Date("2024-01-01"),
      })
      .returning();

    console.log("✓ Old bank account created");

    // Create bank accounts - NEW account (changed 3 days ago)
    const newBankAccount = await db
      .insert(bankAccounts)
      .values({
        vendorId: vendor[0].id,
        bankName: "ICICI Bank",
        maskedAccount: "****9137",
        routingReference: "ICIC0009137",
        status: "active",
        effectiveFrom: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      })
      .returning();

    console.log("✓ New bank account created");

    // Record bank change
    const bankChange = await db
      .insert(bankAccountChanges)
      .values({
        vendorId: vendor[0].id,
        previousAccountId: oldBankAccount[0].id,
        newAccountId: newBankAccount[0].id,
        requestedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        requestedBy: "jane.doe@acmecloud.com",
        source: "email",
        status: "pending",
      })
      .returning();

    console.log("✓ Bank account change recorded");

    // Create contract
    const contract = await db
      .insert(contracts)
      .values({
        vendorId: vendor[0].id,
        contractNumber: "CT-2024-001",
        version: 3,
        monthlyCeiling: "550000",
        currency: "INR",
        effectiveFrom: new Date("2024-01-01"),
        effectiveTo: new Date("2025-12-31"),
        status: "active",
      })
      .returning();

    console.log("✓ Contract created with ₹550,000 ceiling");

    // Create PO
    const po = await db
      .insert(purchaseOrders)
      .values({
        vendorId: vendor[0].id,
        poNumber: "PO-2024-08-001",
        amount: "550000",
        currency: "INR",
        status: "issued",
        issuedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      })
      .returning();

    console.log("✓ Purchase Order created for ₹550,000");

    // Create historical invoices (normal amounts)
    const historicalInvoices = [
      {
        invoiceNumber: "INV-2024-001",
        amount: "498000",
      },
      {
        invoiceNumber: "INV-2024-002",
        amount: "501000",
      },
      {
        invoiceNumber: "INV-2024-003",
        amount: "512000",
      },
      {
        invoiceNumber: "INV-2024-004",
        amount: "507000",
      },
      {
        invoiceNumber: "INV-2024-005",
        amount: "519000",
      },
      {
        invoiceNumber: "INV-2024-006",
        amount: "503000",
      },
    ];

    for (const histInv of historicalInvoices) {
      await db
        .insert(invoices)
        .values({
          vendorId: vendor[0].id,
          invoiceNumber: histInv.invoiceNumber,
          amount: histInv.amount,
          currency: "INR",
          issueDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          dueDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
          status: "paid",
          poId: po[0].id,
        })
        .returning();
    }

    console.log("✓ Historical invoices created (₹498K - ₹519K)");

    // Create SUSPICIOUS invoice - EXCEEDS contract ceiling significantly
    const suspiciousInvoice = await db
      .insert(invoices)
      .values({
        vendorId: vendor[0].id,
        invoiceNumber: "INV-48291",
        amount: "842000",
        currency: "INR",
        issueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        status: "received",
        poId: po[0].id,
      })
      .returning();

    console.log("✓ Suspicious invoice created: INV-48291 for ₹842,000");

    // Create payment for suspicious invoice
    const payment = await db
      .insert(payments)
      .values({
        invoiceId: suspiciousInvoice[0].id,
        amount: "842000",
        currency: "INR",
        status: "pending",
        scheduledAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      })
      .returning();

    console.log("✓ Payment created for suspicious invoice");

    // Create payment exception
    const exception = await db
      .insert(paymentExceptions)
      .values({
        paymentId: payment[0].id,
        type: "amount_mismatch",
        severity: "high",
        status: "new",
      })
      .returning();

    console.log("✓ Payment exception created");

    console.log("\n✅ Database seeding completed successfully!");
    console.log("\n📊 Demo Case Summary:");
    console.log("  Company: NovaStack");
    console.log("  Vendor: Acme Cloud Services");
    console.log("  Current Invoice: ₹842,000");
    console.log("  Contract Ceiling: ₹550,000");
    console.log("  Variance: +₹292,000 (+67.4%)");
    console.log("  Bank Changed: 3 days ago (HDFC → ICICI)");
    console.log("  Status: Ready for investigation");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    throw error;
  } finally {
    await client.end();
  }
}

seed();
