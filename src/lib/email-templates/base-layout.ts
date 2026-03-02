import { APP_NAME, SUPPORT_EMAIL } from "@/lib/constants";

export function emailBaseLayout(content: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${APP_NAME}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Roboto', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.07);">
          <!-- Header -->
          <tr>
            <td style="background-color: #152232; padding: 32px 40px; text-align: center;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <img src="${process.env.APP_URL}/YAP Logo.png" alt="YAP Logo" width="56" height="56" style="border-radius: 12px; margin-bottom: 16px; object-fit: contain;" />
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <h1 style="color: #ffffff; font-size: 20px; font-weight: 600; margin: 0; letter-spacing: 0.5px;">
                      AKYSB Pakistan
                    </h1>
                    <p style="color: #82a845; font-size: 14px; margin: 4px 0 0; font-weight: 500;">
                      Young Ambassador Programme 2026
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #f1f5f9; padding: 24px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #64748b; font-size: 12px; margin: 0 0 8px;">
                Need help? Contact us at
                <a href="mailto:${SUPPORT_EMAIL}" style="color: #82a845; text-decoration: none;">${SUPPORT_EMAIL}</a>
              </p>
              <p style="color: #94a3b8; font-size: 11px; margin: 0;">
                &copy; 2026 AKYSB Pakistan. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
