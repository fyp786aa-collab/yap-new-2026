import { getDb } from "@/lib/db";
import type { User } from "@/types";

export interface EmailVerificationStatus {
  exists: boolean;
  emailVerified: boolean;
  verificationLinkExpired: boolean;
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const sql = getDb();
  try {
    const rows = await sql`
      SELECT id, email, role, email_verified, created_at
      FROM users WHERE email = ${email.toLowerCase()} LIMIT 1
    `;
    return rows.length > 0 ? (rows[0] as User) : null;
  } catch (error) {
    console.error("Error finding user by email:", error);
    return null;
  }
}

export async function findUserById(id: string): Promise<User | null> {
  const sql = getDb();
  try {
    const rows = await sql`
      SELECT id, email, role, email_verified, created_at
      FROM users WHERE id = ${id} LIMIT 1
    `;
    return rows.length > 0 ? (rows[0] as User) : null;
  } catch (error) {
    console.error("Error finding user by id:", error);
    return null;
  }
}

export async function getEmailVerificationStatusByEmail(
  email: string,
): Promise<EmailVerificationStatus> {
  const sql = getDb();
  try {
    const rows = await sql`
      SELECT email_verified, email_verify_expires
      FROM users
      WHERE email = ${email.toLowerCase()}
      LIMIT 1
    `;

    if (rows.length === 0) {
      return {
        exists: false,
        emailVerified: false,
        verificationLinkExpired: false,
      };
    }

    const row = rows[0] as {
      email_verified: boolean;
      email_verify_expires: string | null;
    };

    const emailVerified = row.email_verified;
    const verificationLinkExpired =
      !emailVerified &&
      (!row.email_verify_expires ||
        new Date(row.email_verify_expires).getTime() <= Date.now());

    return {
      exists: true,
      emailVerified,
      verificationLinkExpired,
    };
  } catch (error) {
    console.error("Error getting email verification status:", error);
    return {
      exists: false,
      emailVerified: false,
      verificationLinkExpired: false,
    };
  }
}

export async function getUserPasswordHash(
  email: string,
): Promise<string | null> {
  const sql = getDb();
  try {
    const rows = await sql`
      SELECT password_hash FROM users WHERE email = ${email.toLowerCase()} LIMIT 1
    `;
    return rows.length > 0 ? (rows[0].password_hash as string) : null;
  } catch (error) {
    console.error("Error getting password hash:", error);
    return null;
  }
}

export async function createUser(
  email: string,
  passwordHash: string,
  verifyTokenHash: string,
  verifyExpires: string,
) {
  const sql = getDb();
  try {
    const rows = await sql`
      INSERT INTO users (email, password_hash, role, email_verified, email_verify_token, email_verify_expires)
      VALUES (${email.toLowerCase()}, ${passwordHash}, 'applicant', false, ${verifyTokenHash}, ${verifyExpires}::timestamptz)
      RETURNING id, email, role, email_verified, created_at
    `;
    return { success: true, data: rows[0] as User };
  } catch (error: unknown) {
    console.error("Error creating user:", error);
    const pgError = error as { code?: string };
    if (pgError.code === "23505") {
      return { success: false, error: "Email already in use" };
    }
    return { success: false, error: "Failed to create account" };
  }
}

export async function verifyUserEmail(tokenHash: string) {
  const sql = getDb();
  try {
    const rows = await sql`
      UPDATE users
      SET email_verified = true,
          email_verify_token = NULL,
          email_verify_expires = NULL,
          updated_at = NOW()
      WHERE email_verify_token = ${tokenHash}
        AND email_verify_expires > NOW()
      RETURNING id, email
    `;
    if (rows.length === 0) {
      return { success: false, error: "Invalid or expired verification link" };
    }
    return { success: true, data: rows[0] };
  } catch (error) {
    console.error("Error verifying email:", error);
    return { success: false, error: "Failed to verify email" };
  }
}

export async function storeEmailVerificationToken(
  email: string,
  tokenHash: string,
  expires: string,
) {
  const sql = getDb();
  try {
    const rows = await sql`
      UPDATE users
      SET email_verify_token = ${tokenHash},
          email_verify_expires = ${expires}::timestamptz,
          updated_at = NOW()
      WHERE email = ${email.toLowerCase()}
        AND email_verified = false
      RETURNING id, email
    `;

    return { success: true, found: rows.length > 0, data: rows[0] };
  } catch (error) {
    console.error("Error storing email verification token:", error);
    return {
      success: false,
      found: false,
      error: "Failed to refresh verification link",
    };
  }
}

export async function storeResetToken(
  email: string,
  tokenHash: string,
  expires: string,
) {
  const sql = getDb();
  try {
    const rows = await sql`
      UPDATE users
      SET reset_password_token = ${tokenHash},
          reset_password_expires = ${expires}::timestamptz,
          updated_at = NOW()
      WHERE email = ${email.toLowerCase()} AND email_verified = true
      RETURNING id
    `;
    return { success: true, found: rows.length > 0 };
  } catch (error) {
    console.error("Error storing reset token:", error);
    return { success: false, error: "Failed to process request" };
  }
}

export async function resetPassword(
  tokenHash: string,
  newPasswordHash: string,
) {
  const sql = getDb();
  try {
    const rows = await sql`
      UPDATE users
      SET password_hash = ${newPasswordHash},
          reset_password_token = NULL,
          reset_password_expires = NULL,
          updated_at = NOW()
      WHERE reset_password_token = ${tokenHash}
        AND reset_password_expires > NOW()
      RETURNING id, email
    `;
    if (rows.length === 0) {
      return { success: false, error: "Invalid or expired reset link" };
    }
    return { success: true, data: rows[0] };
  } catch (error) {
    console.error("Error resetting password:", error);
    return { success: false, error: "Failed to reset password" };
  }
}

export async function getUserWithApplicationStatus(email: string) {
  const sql = getDb();
  try {
    const rows = await sql`
      SELECT u.id, u.email, u.role, u.email_verified, a.status as application_status
      FROM users u
      LEFT JOIN applicants ap ON u.id = ap.user_id
      LEFT JOIN applications a ON ap.id = a.applicant_id
      WHERE u.email = ${email.toLowerCase()}
      LIMIT 1
    `;
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error("Error getting user with application status:", error);
    return null;
  }
}

/**
 * Delete a user by their ID (used to rollback signup when email fails)
 */
export async function deleteUserById(id: string) {
  const sql = getDb();
  try {
    await sql`DELETE FROM users WHERE id = ${id}`;
    return { success: true };
  } catch (error) {
    console.error("Error deleting user:", error);
    return { success: false };
  }
}
