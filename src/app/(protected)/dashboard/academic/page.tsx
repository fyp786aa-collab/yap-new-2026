import { requireAuth } from "@/lib/session";
import { getApplicationByUserId } from "@/lib/db-queries/applications";
import { publicApplicationStatus } from "@/lib/public-application-status";
import { getAcademicBackground } from "@/lib/db-queries/sections";
import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/routes";
import { AcademicForm } from "@/components/forms/academic-form";

export const metadata = { title: "Academic Background" };

export default async function AcademicPage() {
  const user = await requireAuth();
  const application = await getApplicationByUserId(user.id);
  if (!application || !application.consent_given)
    redirect(ROUTES.DASHBOARD.CONSENT);
  const isApplicant = user.role === "applicant";
  const displayStatus = isApplicant
    ? publicApplicationStatus(application.status)
    : application.status;

  if (displayStatus === "Submitted") redirect(ROUTES.DASHBOARD.SUBMITTED);

  const academic = await getAcademicBackground(application.id);

  const defaults = academic
    ? {
        matric_institution: academic.matric_institution || "",
        matric_grade: academic.matric_grade || "",
        matric_percentage: academic.matric_percentage,
        intermediate_institution: academic.intermediate_institution || "",
        intermediate_grade: academic.intermediate_grade || "",
        intermediate_percentage: academic.intermediate_percentage,
        university_name: academic.university_name,
        degree_program: academic.degree_program,
        major_specialization: academic.major_specialization,
        current_year_of_study: academic.current_year_of_study,
        cgpa_percentage: academic.cgpa_percentage,
        expected_graduation_month: academic.expected_graduation_month,
        expected_graduation_year: academic.expected_graduation_year,
        re_education_level: academic.re_education_level as
          | "Others"
          | "Matric"
          | "HRE"
          | "ARE",
      }
    : undefined;

  return <AcademicForm defaultValues={defaults} />;
}
