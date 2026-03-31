import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const resendFrom = process.env.RESEND_FROM || process.env.EMAIL_FROM;

const resend = resendApiKey ? new Resend(resendApiKey) : null;

export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  options?: { from?: string },
): Promise<{ success: boolean; error?: string }> {
  const fromAddress = options?.from || resendFrom;

  if (!fromAddress || !resend) {
    return {
      success: false,
      error: "Resend is not configured (set RESEND_API_KEY and RESEND_FROM).",
    };
  }

  try {
    const result = await resend.emails.send({
      from: fromAddress,
      to,
      subject,
      html,
    });

    if (!result.error) {
      return { success: true };
    }

    return {
      success: false,
      error: `Resend API error: ${result.error.message}`,
    };
  } catch (error) {
    return {
      success: false,
      error: `Resend request failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}
