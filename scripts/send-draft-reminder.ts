import { unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { getDb } from "../src/lib/db";
import { sendEmail } from "../src/lib/email";
import { draftApplicationReminderTemplate } from "../src/lib/email-templates/draft-application-reminder";

type DraftRecipient = {
  email: string;
  full_name: string | null;
  application_id: string;
};

type ReminderCheckpoint = {
  nextIndex: number;
  totalRecipients: number;
  updatedAt: string;
};

const BATCH_SIZE = 500;
const CHECKPOINT_PATH = path.resolve(
  process.cwd(),
  "scripts/.send-draft-reminder.checkpoint.json",
);

function getResumeIndex(totalRecipients: number): number {
  try {
    const raw = process.env.REMINDER_RESUME_INDEX?.trim();
    if (!raw) return 0;

    const parsed = Number(raw);
    if (!Number.isInteger(parsed) || parsed < 0 || parsed >= totalRecipients) {
      console.warn(
        `Ignoring invalid REMINDER_RESUME_INDEX=${raw}. It must be between 0 and ${Math.max(0, totalRecipients - 1)}.`,
      );
      return 0;
    }

    return parsed;
  } catch {
    return 0;
  }
}

async function writeCheckpoint(nextIndex: number, totalRecipients: number) {
  const payload: ReminderCheckpoint = {
    nextIndex,
    totalRecipients,
    updatedAt: new Date().toISOString(),
  };

  await writeFile(CHECKPOINT_PATH, JSON.stringify(payload, null, 2), "utf8");
}

async function clearCheckpoint() {
  try {
    await unlink(CHECKPOINT_PATH);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }
  }
}

async function main() {
  const sql = getDb();
  const reminderTestEmail = process.env.REMINDER_TEST_EMAIL?.trim();

  const senderFrom =
    process.env.REMINDER_FROM ||
    process.env.RESEND_REMINDER_FROM ||
    process.env.RESEND_FROM ||
    process.env.EMAIL_FROM;

  const rows = await sql`
    
SELECT
  u.email,
  NULLIF(TRIM(ap.full_name), '') AS full_name,
  a.id AS application_id,
  a.status 
FROM applications a
INNER JOIN applicants ap ON ap.id = a.applicant_id
INNER JOIN users u ON u.id = ap.user_id
WHERE u.email_verified = TRUE
  AND (
    a.status IS NULL OR
    a.status NOT IN ('Submitted','Under Review','Shortlisted','Selected','Rejected')
  )
  AND a.cohort_year = 2026
ORDER BY a.created_at ASC;
  `;

  let recipients = rows as DraftRecipient[];

  if (reminderTestEmail) {
    recipients = recipients.filter(
      (recipient) =>
        recipient.email.toLowerCase() === reminderTestEmail.toLowerCase(),
    );

    if (recipients.length === 0) {
      console.log(
        `No verified Draft applicant matched REMINDER_TEST_EMAIL=${reminderTestEmail}. Nothing to send.`,
      );
      return;
    }

    console.log(
      `REMINDER_TEST_EMAIL set. Restricting run to: ${reminderTestEmail}`,
    );
  }

  if (recipients.length === 0) {
    console.log("No verified Draft applicants found. Nothing to send.");
    return;
  }

  const startIndex = reminderTestEmail ? 0 : getResumeIndex(recipients.length);
  const totalToProcess = recipients.length - startIndex;

  if (startIndex > 0) {
    console.log(
      `Resuming from index ${startIndex} via REMINDER_RESUME_INDEX (remaining: ${totalToProcess}).`,
    );
  }

  console.log(`Found ${recipients.length} verified Draft applicants.`);
  console.log(`Using sender: ${senderFrom}`);
  console.log(`Batch size: ${BATCH_SIZE}`);

  let sent = 0;
  let failed = 0;
  const totalBatches = Math.ceil(totalToProcess / BATCH_SIZE);
  let stopAfterFailure = false;

  for (
    let batchStart = startIndex;
    batchStart < recipients.length;
    batchStart += BATCH_SIZE
  ) {
    if (stopAfterFailure) break;

    const batchEnd = Math.min(batchStart + BATCH_SIZE, recipients.length);
    const batchNumber = Math.floor((batchStart - startIndex) / BATCH_SIZE) + 1;
    console.log(
      `Processing batch ${batchNumber}/${totalBatches} (rows ${batchStart + 1}-${batchEnd})`,
    );

    for (let i = batchStart; i < batchEnd; i += 1) {
      const recipient = recipients[i];
      const name = recipient.full_name || "Candidate";

      const result = await sendEmail(
        recipient.email,
        "YAP Application Just Got Easier – Deadline Extended to 18 April, 10:00 PM",
        draftApplicationReminderTemplate(name),
        { from: senderFrom },
      );

      if (result.success) {
        sent += 1;
        console.log(`[SENT] ${recipient.email} (${recipient.application_id})`);

        if (!reminderTestEmail) {
          await writeCheckpoint(i + 1, recipients.length);
        }
      } else {
        failed += 1;
        console.error(
          `[FAILED] ${recipient.email} (${recipient.application_id}) -> ${result.error || "Unknown error"}`,
        );
        console.error(
          `Stopping after first failure. Resume with REMINDER_RESUME_INDEX=${i}.`,
        );
        stopAfterFailure = true;
        process.exitCode = 1;
        break;
      }
    }
  }

  if (!reminderTestEmail && !stopAfterFailure) {
    await clearCheckpoint();
  }

  console.log("--------------------------------------------------");
  console.log(`Reminder run completed. Sent: ${sent}, Failed: ${failed}`);

  if (failed > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error("Draft reminder job failed:", error);
  process.exit(1);
});
