import { requireAuth } from "@/lib/session";
import { getApplicationByUserId } from "@/lib/db-queries/applications";
import { getAvailabilityCommitment } from "@/lib/db-queries/sections";
import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/routes";
import { AvailabilityForm } from "@/components/forms/availability-form";

export const metadata = { title: "Availability & Commitment" };

export default async function AvailabilityPage() {
  const user = await requireAuth();
  const application = await getApplicationByUserId(user.id);
  if (!application || !application.consent_given)
    redirect(ROUTES.DASHBOARD.CONSENT);
  if (application.status === "Submitted") redirect(ROUTES.DASHBOARD.SUBMITTED);

  const availability = await getAvailabilityCommitment(application.id);

  return (
    <AvailabilityForm
      defaultValues={
        availability
          ? { available_july_aug_2026: availability.available_july_aug_2026 }
          : undefined
      }
    />
  );
}
