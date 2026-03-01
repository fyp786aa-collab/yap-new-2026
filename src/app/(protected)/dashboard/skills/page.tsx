import { requireAuth } from "@/lib/session";
import { getApplicationByUserId } from "@/lib/db-queries/applications";
import { getSkillsCompetencies } from "@/lib/db-queries/sections";
import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/routes";
import { SkillsForm } from "@/components/forms/skills-form";

export const metadata = { title: "Skills & Competencies" };

export default async function SkillsPage() {
  const user = await requireAuth();
  const application = await getApplicationByUserId(user.id);
  if (!application || !application.consent_given)
    redirect(ROUTES.DASHBOARD.CONSENT);
  if (application.status === "Submitted") redirect(ROUTES.DASHBOARD.SUBMITTED);

  const skills = await getSkillsCompetencies(application.id);

  const defaults = skills
    ? {
        communication: skills.communication,
        team_collaboration: skills.team_collaboration,
        problem_solving: skills.problem_solving,
        adaptability: skills.adaptability,
        leadership: skills.leadership,
        report_writing: skills.report_writing,
        microsoft_office: skills.microsoft_office,
        research_documentation: skills.research_documentation,
        community_engagement: skills.community_engagement,
        additional_skills: skills.additional_skills || "",
      }
    : undefined;

  return <SkillsForm defaultValues={defaults} />;
}
