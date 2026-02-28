import { emailBaseLayout } from "./base-layout";

export function signupSuccessTemplate(): string {
  const content = `
    <h2 style="color: #152232; font-size: 22px; font-weight: 600; margin: 0 0 16px;">
      Welcome to YAP!
    </h2>
    <p style="color: #334155; font-size: 15px; line-height: 1.7; margin: 0 0 16px;">
      Dear Candidate,
    </p>
    <p style="color: #334155; font-size: 15px; line-height: 1.7; margin: 0 0 16px;">
      Thank you for logging into the AKYSB Pakistan – Young Ambassador Programme (YAP) Application Portal.
    </p>
    <p style="color: #334155; font-size: 15px; line-height: 1.7; margin: 0 0 16px;">
      We are excited about your interest in becoming a Young Ambassador. You may now begin completing your application form. Please ensure that all sections are filled carefully and accurately before submission.
    </p>
    <p style="color: #334155; font-size: 15px; line-height: 1.7; margin: 0 0 24px;">
      If you experience any technical issues, please contact the YAP support team at 
      <a href="mailto:yap.ysb@akcpk.org" style="color: #82a845; text-decoration: none; font-weight: 500;">yap.ysb@akcpk.org</a>
    </p>
    <p style="color: #334155; font-size: 15px; line-height: 1.7; margin: 0 0 8px;">
      We look forward to receiving your application.
    </p>
    <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e2e8f0;">
      <p style="color: #334155; font-size: 15px; line-height: 1.7; margin: 0;">
        Warm regards,
      </p>
      <p style="color: #152232; font-size: 15px; font-weight: 600; line-height: 1.7; margin: 4px 0 0;">
        AKYSB Pakistan
      </p>
      <p style="color: #82a845; font-size: 14px; margin: 2px 0 0;">
        Young Ambassador Programme Team
      </p>
    </div>
  `;
  return emailBaseLayout(content);
}
