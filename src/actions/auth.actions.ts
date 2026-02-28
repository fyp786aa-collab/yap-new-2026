"use server";

import {
  signupSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/lib/validations/auth";
import {
  createUser,
  findUserByEmail,
  verifyUserEmail,
  storeResetToken,
  resetPassword,
  getUserWithApplicationStatus,
  deleteUserById,
} from "@/lib/db-queries/users";
import { generateToken, hashToken } from "@/lib/utils/tokens";
import { addHours } from "@/lib/utils/datetime";
import { sendEmail } from "@/lib/email";
import { verifyEmailTemplate } from "@/lib/email-templates/verify-email";
import { signupSuccessTemplate } from "@/lib/email-templates/signup-success";
import { resetPasswordTemplate } from "@/lib/email-templates/reset-password";
import argon2 from "argon2";
import type { ActionResponse } from "@/types";

const APP_URL = process.env.APP_URL || "http://localhost:3000";

/**
 * Pre-login check: verify the email exists and is verified
 * before attempting signIn (to surface proper error messages).
 */
export async function preLoginCheckAction(
  email: string,
): Promise<ActionResponse> {
  try {
    const user = await findUserByEmail(email);
    if (!user) {
      // Don't reveal whether account exists
      return { success: true };
    }
    if (!user.email_verified) {
      return {
        success: false,
        error:
          "Please verify your email before logging in. Check your inbox for the verification link.",
      };
    }
    return { success: true };
  } catch {
    return { success: true }; // fail open, let signIn handle it
  }
}

export async function signupAction(formData: {
  email: string;
  password: string;
  confirmPassword: string;
}): Promise<ActionResponse> {
  try {
    const parsed = signupSchema.safeParse(formData);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const { email, password } = parsed.data;

    // Check if user already exists and application status
    const existing = await getUserWithApplicationStatus(email);
    if (existing) {
      if (existing.application_status === "Submitted") {
        return {
          success: false,
          error: "An application has already been submitted with this email",
        };
      }
      return {
        success: false,
        error:
          "An account with this email already exists. Please login instead.",
      };
    }

    // Hash password
    const passwordHash = await argon2.hash(password);

    // Generate verification token
    const token = generateToken();
    const tokenHash = hashToken(token);
    const expires = addHours(new Date(), 24).toISOString();

    // Create user
    const result = await createUser(email, passwordHash, tokenHash, expires);
    if (!result.success) {
      return {
        success: false,
        error: result.error || "Failed to create account",
      };
    }

    // Send verification email — if it fails, delete the user
    const verifyUrl = `${APP_URL}/verify-email?token=${token}`;
    try {
      await sendEmail(
        email,
        "Verify Your Email - AKYSB YAP 2026",
        verifyEmailTemplate(verifyUrl),
      );
    } catch (emailError) {
      console.error(
        "Failed to send verification email, rolling back user:",
        emailError,
      );
      // Rollback: remove the just-created user
      if (result.data?.id) {
        await deleteUserById(result.data.id);
      }
      return {
        success: false,
        error:
          "Failed to send verification email. Please try again or contact support.",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Signup error:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

export async function verifyEmailAction(
  token: string,
): Promise<ActionResponse> {
  try {
    if (!token) {
      return { success: false, error: "Invalid verification link" };
    }

    const tokenHash = hashToken(token);
    const result = await verifyUserEmail(tokenHash);

    if (!result.success) {
      return {
        success: false,
        error: result.error || "Invalid or expired verification link",
      };
    }

    // Send signup success email
    if (result.data?.email) {
      await sendEmail(
        result.data.email,
        "Welcome to AKYSB YAP 2026",
        signupSuccessTemplate(),
      );
    }

    return { success: true };
  } catch (error) {
    console.error("Verify email error:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

export async function forgotPasswordAction(formData: {
  email: string;
}): Promise<ActionResponse> {
  try {
    const parsed = forgotPasswordSchema.safeParse(formData);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const { email } = parsed.data;

    // Generate reset token
    const token = generateToken();
    const tokenHash = hashToken(token);
    const expires = addHours(new Date(), 1).toISOString();

    // Store token (won't error if user doesn't exist)
    const result = await storeResetToken(email, tokenHash, expires);

    // Always show success to prevent email enumeration
    if (result.success && result.found) {
      const resetUrl = `${APP_URL}/reset-password?token=${token}`;
      await sendEmail(
        email,
        "Reset Your Password - AKYSB YAP 2026",
        resetPasswordTemplate(resetUrl),
      );
    }

    return { success: true };
  } catch (error) {
    console.error("Forgot password error:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

export async function resetPasswordAction(formData: {
  token: string;
  password: string;
  confirmPassword: string;
}): Promise<ActionResponse> {
  try {
    const parsed = resetPasswordSchema.safeParse(formData);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const { token, password } = parsed.data;
    const tokenHash = hashToken(token);
    const passwordHash = await argon2.hash(password);

    const result = await resetPassword(tokenHash, passwordHash);
    if (!result.success) {
      return {
        success: false,
        error: result.error || "Invalid or expired reset link",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Reset password error:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}
