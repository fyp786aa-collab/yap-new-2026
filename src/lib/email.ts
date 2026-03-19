import nodemailer from "nodemailer";
import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const resendFrom = process.env.RESEND_FROM || process.env.EMAIL_FROM;
const emailFrom =
  process.env.EMAIL_FROM ||
  process.env.RESEND_FROM ||
  (process.env.GMAIL_USER
    ? `"AKYSB Pakistan - YAP" <${process.env.GMAIL_USER}>`
    : undefined);

const resend = resendApiKey ? new Resend(resendApiKey) : null;

const gmailTransporter =
  process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD
    ? nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD,
        },
      })
    : null;

export async function sendEmail(
  to: string,
  subject: string,
  html: string,
): Promise<{ success: boolean; error?: string }> {
  if (!emailFrom) {
    return {
      success: false,
      error:
        "Missing sender configuration (set EMAIL_FROM or RESEND_FROM/GMAIL_USER).",
    };
  }

  const errors: string[] = [];

  if (resend && resendFrom) {
    try {
      const result = await resend.emails.send({
        from: resendFrom,
        to,
        subject,
        html,
      });

      if (!result.error) {
        return { success: true };
      }

      errors.push(`Resend API error: ${result.error.message}`);
    } catch (error) {
      errors.push(
        `Resend request failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  try {
    if (!gmailTransporter) {
      throw new Error("Gmail fallback is not configured.");
    }

    await gmailTransporter.sendMail({
      from: emailFrom,
      to,
      subject,
      html,
    });
    return { success: true };
  } catch (error) {
    console.error("Email send error:", error);

    const gmailError =
      error instanceof Error
        ? error.message
        : "Failed to send email via Gmail fallback";
    errors.push(`Gmail SMTP error: ${gmailError}`);

    return { success: false, error: errors.join(" | ") };
  }
}
