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

  // If application already exists, redirect to dashboard
  const application = await getApplicationByUserId(user.id);
  if (application) {
    redirect(ROUTES.DASHBOARD.HOME);
  }

  return <ConsentForm userId={user.id} userEmail={user.email} />;
}
