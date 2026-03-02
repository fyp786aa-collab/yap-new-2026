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

  const experiences = await getExperienceEngagement(application.id);

  const defaults =
    experiences && experiences.length > 0
      ? {
          experiences: experiences.map((e: any) => ({
            institution: e.institution,
            from_year: e.from_year,
            to_year: e.to_year,
            responsibility: e.responsibility,
          })),
        }
      : undefined;

  return <ExperienceForm defaultValues={defaults} />;
}
