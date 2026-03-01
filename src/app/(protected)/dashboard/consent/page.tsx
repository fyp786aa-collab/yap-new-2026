import { requireAuth } from "@/lib/session";
import { getApplicationByUserId } from "@/lib/db-queries/applications";
import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/routes";
import { ConsentForm } from "@/components/forms/consent-form";

export const metadata = {
  title: "Consent",
};

export default async function ConsentPage() {
  const user = await requireAuth();

  // If consent already given, redirect to personal info
  const application = await getApplicationByUserId(user.id);
  if (application?.consent_given) {
    redirect(ROUTES.DASHBOARD.PERSONAL_INFO);
  }

  return <ConsentForm userId={user.id} userEmail={user.email} />;
}
