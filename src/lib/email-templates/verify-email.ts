import { emailBaseLayout } from "./base-layout";

export function verifyEmailTemplate(verifyUrl: string): string {
  const content = `
    <h2 style="color: #152232; font-size: 22px; font-weight: 600; margin: 0 0 16px;">
      Verify Your Email Address
    </h2>
    <p style="color: #334155; font-size: 15px; line-height: 1.7; margin: 0 0 24px;">
      Thank you for registering with the AKYSB Pakistan – Young Ambassador Programme (YAP) Application Portal. 
      Please click the button below to verify your email address and activate your account.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding: 8px 0 32px;">
          <a href="${verifyUrl}" 
             style="display: inline-block; background-color: #82a845; color: #ffffff; text-decoration: none; 
                    padding: 14px 36px; border-radius: 8px; font-size: 15px; font-weight: 600; 
                    letter-spacing: 0.3px;">
            Verify Email Address
          </a>
        </td>
      </tr>
    </table>
    <p style="color: #64748b; font-size: 13px; line-height: 1.6; margin: 0 0 8px;">
      If the button doesn't work, copy and paste the following link into your browser:
    </p>
    <p style="color: #82a845; font-size: 12px; word-break: break-all; margin: 0 0 24px;">
      ${verifyUrl}
    </p>
    <p style="color: #94a3b8; font-size: 12px; margin: 0;">
      This verification link will expire in 24 hours. If you did not create an account, please ignore this email.
    </p>
  `;
  return emailBaseLayout(content);
}
