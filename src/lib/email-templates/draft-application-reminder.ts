import { emailBaseLayout } from "./base-layout";

export function draftApplicationReminderTemplate(name = "Candidate"): string {
  const content = `
    <h2 style="color: #152232; font-size: 22px; font-weight: 600; margin: 0 0 16px;">
      Deadline Extended: Complete Your YAP 2026 Application
    </h2>
    <p style="color: #334155; font-size: 15px; line-height: 1.7; margin: 0 0 16px;">
      Dear ${name},
    </p>
    <p style="color: #334155; font-size: 15px; line-height: 1.7; margin: 0 0 16px;">
      This is a friendly reminder that your Young Ambassador Programme (YAP) 2026 application is still in <strong>Draft</strong> status.
    </p>
    <p style="color: #334155; font-size: 15px; line-height: 1.7; margin: 0 0 16px;">
      Good news — the application deadline has been <strong>extended to 18 April 2026</strong>, giving you extra time to complete and submit your application by <strong>10 PM PKT</strong>.
    </p>

    <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; border-radius: 0 8px 8px 0; padding: 20px 24px; margin: 24px 0;">
      <h3 style="color: #152232; font-size: 16px; font-weight: 600; margin: 0 0 12px;">
        Important Updates
      </h3>
      <p style="color: #334155; font-size: 14px; line-height: 1.8; margin: 0;">
  Due to some applicants experiencing limited internet connectivity challenges, CV/Resume remains <strong>required</strong>, while the following are now <strong>optional</strong>:
</p>
      <ul style="color: #334155; font-size: 14px; line-height: 1.8; margin: 12px 0 0; padding-left: 20px;">
        <li>University academic transcript</li>
        <li>Introductory video</li>
        <li>Academic reference</li>
      </ul>
    </div>

    <p style="color: #334155; font-size: 15px; line-height: 1.7; margin: 0 0 24px;">
      We encourage you to take advantage of this extended time and submit your application before the new deadline.
    </p>

    <p style="color: #334155; font-size: 15px; line-height: 1.7; margin: 0 0 24px;">
      Complete your application here:
      <a href="https://yap-new-2026.vercel.app" style="color: #82a845; text-decoration: none; font-weight: 600;">
        https://yap-new-2026.vercel.app
      </a>
    </p>

    <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e2e8f0;">
      <p style="color: #334155; font-size: 15px; line-height: 1.7; margin: 0;">
        Don’t miss this opportunity — we look forward to your submission.
      </p>
      <p style="color: #334155; font-size: 15px; line-height: 1.7; margin: 16px 0 0;">
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
