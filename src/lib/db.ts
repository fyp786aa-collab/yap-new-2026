import { neon } from "@neondatabase/serverless";
import type { NeonQueryInTransaction } from "@neondatabase/serverless";

/**
 * Get a Neon SQL client for parameterized queries
 * Uses tagged template literals: sql`SELECT * FROM users WHERE id = ${id}`
 */
export function getDb() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable is not set");
  }
  return neon(databaseUrl);
}

/**
 * Execute multiple queries within a single HTTP-transaction.
 *
 * Neon's HTTP driver sends each tagged-template query as a separate HTTP
 * request, so plain BEGIN / COMMIT / ROLLBACK have NO effect.
 * Use `sql.transaction(txn => [...])` instead – it batches every query
 * into one HTTP call that the server wraps in a real Postgres transaction.
 *
 * The callback receives a `txn` template-tag and must return an *array*
 * of query expressions (txn`...`).  All succeed or all roll back.
 */
export async function withTransaction(
  callback: (
    txn: (
      strings: TemplateStringsArray,
      ...values: unknown[]
    ) => NeonQueryInTransaction,
  ) => NeonQueryInTransaction[],
): Promise<unknown[]> {
  const sql = getDb();
  return sql.transaction(callback);
}
