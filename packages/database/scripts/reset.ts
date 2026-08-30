import { Client } from "pg";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

async function reset() {
  console.log("🔄 Resetting database...");

  const client = new Client({
    connectionString: DATABASE_URL,
  });

  try {
    await client.connect();
    console.log("✓ Connected to database");

    // Get all tables
    const result = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
    `);

    const tables = result.rows.map((row) => row.table_name);

    if (tables.length === 0) {
      console.log("ℹ️  No tables to drop");
    } else {
      // Drop all tables
      await client.query(`
        DROP TABLE IF EXISTS ${tables.join(", ")} CASCADE
      `);
      console.log(`✓ Dropped ${tables.length} tables`);
    }

    // Drop all enums
    const enumResult = await client.query(`
      SELECT enumlabel
      FROM pg_enum
    `);

    if (enumResult.rows.length > 0) {
      const enumTypes = [
        "vendor_status",
        "vendor_risk_status",
        "bank_account_status",
        "bank_account_change_status",
        "bank_account_change_source",
        "contract_status",
        "contract_amendment_status",
        "purchase_order_status",
        "invoice_status",
        "payment_status",
        "payment_exception_type",
        "exception_severity",
        "exception_status",
        "investigation_status",
        "investigation_recommendation",
        "confidence_level",
        "evidence_source_type",
        "investigation_event_type",
        "approval_status",
      ];

      for (const enumType of enumTypes) {
        await client.query(`DROP TYPE IF EXISTS ${enumType} CASCADE`).catch(() => {
          // Ignore if type doesn't exist
        });
      }
      console.log("✓ Dropped enum types");
    }

    console.log("✅ Database reset completed");
  } catch (error) {
    console.error("❌ Reset failed:", error);
    throw error;
  } finally {
    await client.end();
  }
}

reset();
