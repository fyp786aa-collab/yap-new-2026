import { getDb } from "@/lib/db";
import { COHORT_YEAR } from "@/lib/constants";
import type { Application, SectionCompletion } from "@/types";

export async function createApplication(applicantId: string) {
  const sql = getDb();
  try {
    const rows = await sql`
      INSERT INTO applications (applicant_id, cohort_year, status)
      VALUES (${applicantId}, ${COHORT_YEAR}, 'Draft')
      ON CONFLICT (applicant_id, cohort_year) DO NOTHING
      RETURNING *
    `;
    if (rows.length === 0) {
      // Already exists
      const existing = await getApplicationByApplicantId(applicantId);
      if (existing) return { success: true, data: existing };
      return { success: false, error: "Failed to create application" };
    }
    return { success: true, data: rows[0] as Application };
  } catch (error) {
    console.error("Error creating application:", error);
    return { success: false, error: "Failed to create application" };
  }
}

export async function getApplicationByApplicantId(
  applicantId: string,
): Promise<Application | null> {
  const sql = getDb();
  try {
    const rows = await sql`
      SELECT * FROM applications
      WHERE applicant_id = ${applicantId} AND cohort_year = ${COHORT_YEAR}
      LIMIT 1
    `;
    return rows.length > 0 ? (rows[0] as Application) : null;
  } catch (error) {
    console.error("Error fetching application:", error);
    return null;
  }
}

export async function getApplicationByUserId(
  userId: string,
): Promise<Application | null> {
  const sql = getDb();
  try {
    const rows = await sql`
      SELECT a.* FROM applications a
      JOIN applicants ap ON a.applicant_id = ap.id
      WHERE ap.user_id = ${userId} AND a.cohort_year = ${COHORT_YEAR}
      LIMIT 1
    `;
    return rows.length > 0 ? (rows[0] as Application) : null;
  } catch (error) {
    console.error("Error fetching application by user:", error);
    return null;
  }
}

export async function updateApplicationStatus(
  applicationId: string,
  status: string,
  submittedAt?: string,
) {
  const sql = getDb();
  try {
    if (submittedAt) {
      await sql`
        UPDATE applications SET status = ${status}, submitted_at = ${submittedAt}::timestamptz, updated_at = NOW()
        WHERE id = ${applicationId}
      `;
    } else {
      await sql`
        UPDATE applications SET status = ${status}, updated_at = NOW()
        WHERE id = ${applicationId}
      `;
    }
    return { success: true };
  } catch (error) {
    console.error("Error updating application status:", error);
    return { success: false, error: "Failed to update application" };
  }
}

export async function touchApplicationSaved(applicationId: string) {
  const sql = getDb();
  try {
    await sql`
      UPDATE applications SET last_saved_at = NOW(), updated_at = NOW()
      WHERE id = ${applicationId}
    `;
  } catch (error) {
    console.error("Error touching application:", error);
  }
}

export async function getSectionCompletion(
  applicationId: string,
): Promise<SectionCompletion> {
  const sql = getDb();
  try {
    const rows = await sql`
      SELECT
        EXISTS(SELECT 1 FROM applicants ap JOIN applications a ON a.applicant_id = ap.id WHERE a.id = ${applicationId} AND ap.full_name != '' AND ap.full_name IS NOT NULL) as personal_info,
        EXISTS(SELECT 1 FROM academic_background WHERE application_id = ${applicationId} AND university_name IS NOT NULL) as academic,
        EXISTS(SELECT 1 FROM placement_readiness WHERE application_id = ${applicationId} AND willing_gilgit_chitral IS NOT NULL) as placement,
        (SELECT COUNT(*) FROM internship_preferences WHERE application_id = ${applicationId}) >= 6 as internship_prefs,
        EXISTS(SELECT 1 FROM skills_competencies WHERE application_id = ${applicationId} AND communication IS NOT NULL) as skills,
        EXISTS(SELECT 1 FROM experience_engagement WHERE application_id = ${applicationId} AND description IS NOT NULL AND description != '') as experience,
        EXISTS(SELECT 1 FROM motivation_alignment WHERE application_id = ${applicationId} AND essay_response IS NOT NULL AND essay_response != '') as motivation,
        EXISTS(SELECT 1 FROM availability_commitment WHERE application_id = ${applicationId} AND available_july_aug_2026 IS NOT NULL) as availability,
        EXISTS(SELECT 1 FROM documents WHERE application_id = ${applicationId} AND document_type = 'CV') as documents,
        EXISTS(SELECT 1 FROM documents WHERE application_id = ${applicationId} AND document_type = 'Video') as video
    `;
    const r = rows[0];
    return {
      personalInfo: !!r.personal_info,
      academic: !!r.academic,
      placement: !!r.placement,
      internshipPrefs: !!r.internship_prefs,
      skills: !!r.skills,
      experience: !!r.experience,
      motivation: !!r.motivation,
      availability: !!r.availability,
      documents: !!r.documents,
      video: !!r.video,
    };
  } catch (error) {
    console.error("Error getting section completion:", error);
    return {
      personalInfo: false,
      academic: false,
      placement: false,
      internshipPrefs: false,
      skills: false,
      experience: false,
      motivation: false,
      availability: false,
      documents: false,
      video: false,
    };
  }
}

export async function getFullApplication(applicationId: string) {
  const sql = getDb();
  try {
    const [
      appRows,
      locRows,
      emergRows,
      acadRows,
      placRows,
      prefRows,
      skillRows,
      expRows,
      motRows,
      availRows,
      docRows,
      refRows,
    ] = await Promise.all([
      sql`SELECT a.*, ap.* FROM applications a JOIN applicants ap ON a.applicant_id = ap.id WHERE a.id = ${applicationId}`,
      sql`SELECT * FROM location_info WHERE application_id = ${applicationId}`,
      sql`SELECT * FROM emergency_contacts WHERE application_id = ${applicationId}`,
      sql`SELECT * FROM academic_background WHERE application_id = ${applicationId}`,
      sql`SELECT * FROM placement_readiness WHERE application_id = ${applicationId}`,
      sql`SELECT * FROM internship_preferences WHERE application_id = ${applicationId} ORDER BY priority_rank`,
      sql`SELECT * FROM skills_competencies WHERE application_id = ${applicationId}`,
      sql`SELECT * FROM experience_engagement WHERE application_id = ${applicationId}`,
      sql`SELECT * FROM motivation_alignment WHERE application_id = ${applicationId}`,
      sql`SELECT * FROM availability_commitment WHERE application_id = ${applicationId}`,
      sql`SELECT * FROM documents WHERE application_id = ${applicationId}`,
      sql`SELECT * FROM application_references WHERE application_id = ${applicationId}`,
    ]);

    return {
      application: appRows[0] || null,
      locationInfo: locRows[0] || null,
      emergencyContact: emergRows[0] || null,
      academic: acadRows[0] || null,
      placement: placRows[0] || null,
      internshipPrefs: prefRows || [],
      skills: skillRows[0] || null,
      experience: expRows[0] || null,
      motivation: motRows[0] || null,
      availability: availRows[0] || null,
      documents: docRows || [],
      references: refRows || [],
    };
  } catch (error) {
    console.error("Error getting full application:", error);
    return null;
  }
}
