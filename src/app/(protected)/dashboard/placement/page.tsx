import { requireAuth } from "@/lib/session";
import { getApplicationByUserId } from "@/lib/db-queries/applications";
import { publicApplicationStatus } from "@/lib/public-application-status";
import {
  getPlacementReadiness,
  getInternshipPreferences,
  getSkillsCompetencies,
} from "@/lib/db-queries/sections";
import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/routes";
import { CombinedPlacementForm } from "@/components/forms/combined-placement-form";

export const metadata = { title: "Placement, Preferences & Skills" };

export default async function PlacementPage() {
  const user = await requireAuth();
  const application = await getApplicationByUserId(user.id);
  if (!application || !application.consent_given)
    redirect(ROUTES.DASHBOARD.CONSENT);
  const isApplicant = user.role === "applicant";
  const displayStatus = isApplicant
    ? publicApplicationStatus(application.status)
    : application.status;

  if (displayStatus === "Submitted") redirect(ROUTES.DASHBOARD.SUBMITTED);

  const [placement, prefs, skills] = await Promise.all([
    getPlacementReadiness(application.id),
    getInternshipPreferences(application.id),
    getSkillsCompetencies(application.id),
  ]);

  const placementDefaults = placement
    ? {
        willing_gilgit_chitral: placement.willing_gilgit_chitral,
        stayed_away_before: placement.stayed_away_before,
        stay_away_description: placement.stay_away_description || "",
        medical_conditions: placement.medical_conditions || "",
      }
    : undefined;

  const internshipDefaults =
    prefs.length > 0
      ? prefs.map((p) => ({
          agency: p.agency,
          priority_rank: p.priority_rank,
        }))
      : undefined;

  const skillsDefaults = skills
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

  return (
    <CombinedPlacementForm
      placementDefaults={placementDefaults}
      internshipDefaults={internshipDefaults}
      skillsDefaults={skillsDefaults}
    />
  );
}
