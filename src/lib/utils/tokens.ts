import crypto from "crypto";

/**
 * Generate a cryptographically secure random token
 */
export function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Hash a token using SHA-256
 * We store hashed tokens in DB, never plaintext
 */
export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Check if a token expiry date has passed
 */
export function isTokenExpired(expires: Date | string): boolean {
  const expiryDate = typeof expires === "string" ? new Date(expires) : expires;
  return expiryDate.getTime() < Date.now();
}
