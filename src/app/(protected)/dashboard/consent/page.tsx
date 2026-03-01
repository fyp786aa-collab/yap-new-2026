import { requireAuth } from "@/lib/session";
import { getApplicationByUserId } from "@/lib/db-queries/applications";
import { getApplicantByUserId } from "@/lib/db-queries/applicants";
import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/routes";
import { ConsentForm } from "@/components/forms/consent-form";

export const metadata = {
  title: "Consent",
};

export default async function ConsentPage() {
  const user = await requireAuth();

  // If applicant already has personal info filled, they've passed consent
  const application = await getApplicationByUserId(user.id);
  if (application) {
    const applicant = await getApplicantByUserId(user.id);
    if (applicant?.full_name) {
      redirect(ROUTES.DASHBOARD.PERSONAL_INFO);
    }
  }

  return <ConsentForm userId={user.id} userEmail={user.email} />;
}
