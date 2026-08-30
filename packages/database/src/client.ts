import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";
import * as schema from "./schema.js";

let db: ReturnType<typeof drizzle> | null = null;

export async function getDatabase() {
  if (db) return db;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  const client = new Client({
    connectionString,
  });

  await client.connect();
  db = drizzle(client, { schema });

  return db;
}

export async function closeDatabase() {
  if (db) {
    // Drizzle doesn't manage connections directly
    // You need to manage the underlying client
    db = null;
  }
}

export { schema };

export type * from "./schema.js";
