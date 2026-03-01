import { neon } from "@neondatabase/serverless";
import type { NeonQueryInTransaction } from "@neondatabase/serverless";

// Cache the neon SQL client to avoid creating a new instance on every query
let _sql: ReturnType<typeof neon> | null = null;

/**
 * Get a Neon SQL client for parameterized queries
 * Uses tagged template literals: sql`SELECT * FROM users WHERE id = ${id}`
 */
export function getDb() {
  if (!_sql) {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error("DATABASE_URL environment variable is not set");
    }
    _sql = neon(databaseUrl);
  }
  return _sql;
}

/**
 * Retry a database query with exponential backoff.
 * Useful for handling transient connection timeouts to Neon.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelayMs = 1000,
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const errorMessage = String(error);
      // Only retry on connection/network errors, not on SQL errors
      const isRetryable =
        errorMessage.includes("fetch failed") ||
        errorMessage.includes("ConnectTimeoutError") ||
        errorMessage.includes("ECONNREFUSED") ||
        errorMessage.includes("ETIMEDOUT");
      if (!isRetryable || attempt === maxRetries - 1) throw error;
      console.warn(
        `Database query attempt ${attempt + 1}/${maxRetries} failed, retrying in ${baseDelayMs * (attempt + 1)}ms...`,
      );
      await new Promise((r) => setTimeout(r, baseDelayMs * (attempt + 1)));
    }
  }
  throw lastError;
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
