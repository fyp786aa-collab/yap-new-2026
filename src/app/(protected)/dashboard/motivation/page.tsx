import { requireAuth } from "@/lib/session";
import { getApplicationByUserId } from "@/lib/db-queries/applications";
import { getMotivationAlignment } from "@/lib/db-queries/sections";
import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/routes";
import { MotivationForm } from "@/components/forms/motivation-form";

export const metadata = { title: "Motivation & Alignment" };

export default async function MotivationPage() {
  const user = await requireAuth();
  const application = await getApplicationByUserId(user.id);
  if (!application || !application.consent_given)
    redirect(ROUTES.DASHBOARD.CONSENT);
  if (application.status === "Submitted") redirect(ROUTES.DASHBOARD.SUBMITTED);

  const motivation = await getMotivationAlignment(application.id);

  return (
    <MotivationForm
      defaultValues={
        motivation
          ? {
              essay_response: motivation.essay_response,
              scenario_response: (motivation as any).scenario_response || "",
            }
          : undefined
      }
    />
  );
}
