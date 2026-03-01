import { requireAuth } from "@/lib/session";
import { getApplicationByUserId } from "@/lib/db-queries/applications";
import { getExperienceEngagement } from "@/lib/db-queries/sections";
import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/routes";
import { ExperienceForm } from "@/components/forms/experience-form";

export const metadata = { title: "Experience & Engagement" };

export default async function ExperiencePage() {
  const user = await requireAuth();
  const application = await getApplicationByUserId(user.id);
  if (!application || !application.consent_given)
    redirect(ROUTES.DASHBOARD.CONSENT);
  if (application.status === "Submitted") redirect(ROUTES.DASHBOARD.SUBMITTED);

  const experience = await getExperienceEngagement(application.id);

  return (
    <ExperienceForm
      defaultValues={
        experience ? { description: experience.description } : undefined
      }
    />
  );
}
