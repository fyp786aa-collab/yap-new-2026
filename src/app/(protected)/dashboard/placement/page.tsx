import { requireAuth } from "@/lib/session";
import { getApplicationByUserId } from "@/lib/db-queries/applications";
import { getPlacementReadiness } from "@/lib/db-queries/sections";
import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/routes";
import { PlacementForm } from "@/components/forms/placement-form";

export const metadata = { title: "Placement Readiness" };

export default async function PlacementPage() {
  const user = await requireAuth();
  const application = await getApplicationByUserId(user.id);
  if (!application || !application.consent_given)
    redirect(ROUTES.DASHBOARD.CONSENT);
  if (application.status === "Submitted") redirect(ROUTES.DASHBOARD.SUBMITTED);

  const placement = await getPlacementReadiness(application.id);

  const defaults = placement
    ? {
        willing_gilgit_chitral: placement.willing_gilgit_chitral,
        stayed_away_before: placement.stayed_away_before,
        stay_away_description: placement.stay_away_description || "",
        medical_conditions: placement.medical_conditions || "",
      }
    : undefined;

  return <PlacementForm defaultValues={defaults} />;
}
