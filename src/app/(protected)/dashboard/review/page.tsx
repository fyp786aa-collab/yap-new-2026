import { requireAuth } from "@/lib/session";
import {
  getApplicationByUserId,
  getSectionCompletion,
  getFullApplication,
} from "@/lib/db-queries/applications";
import { publicApplicationStatus } from "@/lib/public-application-status";
import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/routes";
import { ReviewContent } from "@/components/forms/review-content";

export const metadata = { title: "Review & Submit" };

export default async function ReviewPage() {
  const user = await requireAuth();
  const application = await getApplicationByUserId(user.id);
  if (!application || !application.consent_given)
    redirect(ROUTES.DASHBOARD.CONSENT);
  const isApplicant = user.role === "applicant";
  const displayStatus = isApplicant
    ? publicApplicationStatus(application.status)
    : application.status;

  if (displayStatus === "Submitted") redirect(ROUTES.DASHBOARD.SUBMITTED);

  const [completion, fullApp] = await Promise.all([
    getSectionCompletion(application.id),
    getFullApplication(application.id),
  ]);

  const allComplete = Object.values(completion).every(Boolean);

  return (
    <ReviewContent
      completion={completion}
      fullApplication={fullApp}
      allComplete={allComplete}
    />
  );
}
