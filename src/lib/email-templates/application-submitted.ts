import { emailBaseLayout } from "./base-layout";

export function applicationSubmittedTemplate(name = "Candidate"): string {
  const content = `
    <h2 style="color: #152232; font-size: 22px; font-weight: 600; margin: 0 0 16px;">
      Application Submitted Successfully
    </h2>
    <p style="color: #334155; font-size: 15px; line-height: 1.7; margin: 0 0 16px;">
      Dear ${name},
    </p>
    <p style="color: #334155; font-size: 15px; line-height: 1.7; margin: 0 0 16px;">
      Thank you for submitting your application for the AKYSB Pakistan – Young Ambassador Programme (YAP).
    </p>
    <p style="color: #334155; font-size: 15px; line-height: 1.7; margin: 0 0 16px;">
      This email confirms that your application has been successfully received. Our selection committee will now review your submission carefully.
    </p>
    <div style="background-color: #f8fafc; border-left: 4px solid #82a845; border-radius: 0 8px 8px 0; padding: 20px 24px; margin: 24px 0;">
      <h3 style="color: #152232; font-size: 16px; font-weight: 600; margin: 0 0 12px;">
        What happens next:
      </h3>
      <ul style="color: #334155; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
        <li>Applications will be screened based on eligibility and program criteria.</li>
        <li>Shortlisted candidates will be contacted for the next stage of the selection process.</li>
        <li>Please keep your phone and email active for further communication.</li>
      </ul>
    </div>
    <p style="color: #334155; font-size: 15px; line-height: 1.7; margin: 24px 0 8px;">
      We appreciate the time and effort you have invested in your application and wish you the very best.
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
