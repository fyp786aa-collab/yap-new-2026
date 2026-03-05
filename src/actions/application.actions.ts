"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/session";
import {
  getApplicationByUserId,
  updateApplicationStatus,
  touchApplicationSaved,
  getSectionCompletion,
} from "@/lib/db-queries/applications";
import {
  getApplicantByUserId,
  updateApplicant,
  checkApplicantUniqueness,
} from "@/lib/db-queries/applicants";
import {
  upsertLocationInfo,
  upsertEmergencyContact,
  upsertAcademicBackground,
  upsertPlacementReadiness,
  upsertInternshipPreferences,
  upsertSkillsCompetencies,
  upsertExperienceEngagement,
  upsertMotivationAlignment,
  upsertAvailabilityCommitment,
  upsertReference,
  deleteReference,
} from "@/lib/db-queries/sections";
import { personalInfoSchema } from "@/lib/validations/personal-info";
import { academicSchema } from "@/lib/validations/academic";
import { placementSchema } from "@/lib/validations/placement";
import { internshipPrefsSchema } from "@/lib/validations/internship-prefs";
import { skillsSchema } from "@/lib/validations/skills";
import { experienceSchema } from "@/lib/validations/experience";
import { motivationSchema } from "@/lib/validations/motivation";
import { availabilitySchema } from "@/lib/validations/availability";
import { documentsSchema } from "@/lib/validations/documents";
import { nowPKTISO } from "@/lib/utils/datetime";
import { sendEmail } from "@/lib/email";
import { applicationSubmittedTemplate } from "@/lib/email-templates/application-submitted";
import type { ActionResponse } from "@/types";

async function getAppContext() {
  const user = await requireAuth();
  const application = await getApplicationByUserId(user.id);
  if (!application) {
    return {
      error: "Application not found" as const,
      user,
      application: null,
      applicant: null,
    };
  }
  if (application.status === "Submitted") {
    return {
      error: "Application already submitted" as const,
      user,
      application,
      applicant: null,
    };
  }
  const applicant = await getApplicantByUserId(user.id);
  return { error: null, user, application, applicant };
}

// ==================== SECTION 1: PERSONAL INFO ====================

export async function savePersonalInfoAction(
  formData: Record<string, unknown>,
): Promise<ActionResponse> {
  try {
    const ctx = await getAppContext();
    if (ctx.error) return { success: false, error: ctx.error };
    const { application, applicant } = ctx;

    const parsed = personalInfoSchema.safeParse(formData);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const data = parsed.data;

    // Validate emergency contact is not the same as personal contact info
    const emergencyFieldErrors: Record<string, string> = {};
    if (
      data.emergency_name.trim().toLowerCase() ===
      data.full_name.trim().toLowerCase()
    ) {
      emergencyFieldErrors.emergency_name =
        "Emergency contact name cannot be the same as your own name";
    }
    if (data.emergency_phone === data.primary_contact) {
      emergencyFieldErrors.emergency_phone =
        "Emergency contact number cannot be the same as your primary contact";
    }
    if (data.emergency_phone === data.whatsapp_number) {
      emergencyFieldErrors.emergency_phone =
        "Emergency contact number cannot be the same as your WhatsApp number";
    }

    // Check for unique constraint conflicts before updating
    const uniqueErrors = await checkApplicantUniqueness(ctx.user.id, {
      full_name: data.full_name,
      father_name: data.father_name,
      cnic: data.cnic,
      primary_contact: data.primary_contact,
      whatsapp_number: data.whatsapp_number,
    });

    const allFieldErrors = { ...emergencyFieldErrors, ...uniqueErrors };
    if (Object.keys(allFieldErrors).length > 0) {
      return {
        success: false,
        error: "Please fix the highlighted errors below",
        fieldErrors: allFieldErrors,
      };
    }

    // Update applicant fields
    const updateResult = await updateApplicant(ctx.user.id, {
      full_name: data.full_name,
      father_name: data.father_name,
      gender: data.gender,
      date_of_birth: data.date_of_birth,
      cnic: data.cnic,
      primary_contact: data.primary_contact,
      whatsapp_number: data.whatsapp_number,
      email: data.email,
      city_of_residence: data.city_of_residence,
      hometown: data.hometown,
      permanent_address: data.permanent_address,
      current_address: data.current_address,
    });
    if (!updateResult.success) {
      return {
        success: false,
        error: updateResult.error || "Failed to save personal information",
      };
    }

    // Location info
    await upsertLocationInfo(application!.id, {
      regional_council: data.regional_council,
      local_council: data.local_council,
      jamatkhana: data.jamatkhana,
      has_relatives_in_gilgit_chitral: data.has_relatives_gilgit_chitral,
      relatives_name: data.has_relatives_gilgit_chitral
        ? data.relatives_name || null
        : null,
      relatives_address: data.has_relatives_gilgit_chitral
        ? data.relatives_address || null
        : null,
      relatives_contact: data.has_relatives_gilgit_chitral
        ? data.relatives_contact || null
        : null,
    });

    // Emergency contact
    await upsertEmergencyContact(application!.id, {
      name: data.emergency_name,
      relationship: data.emergency_relationship,
      phone_number: data.emergency_phone,
    });

    await touchApplicationSaved(application!.id);
    revalidatePath("/dashboard", "layout");
    return { success: true };
  } catch (error) {
    console.error("Save personal info error:", error);
    return { success: false, error: "Failed to save personal information" };
  }
}

// ==================== SECTION 2: ACADEMIC ====================

export async function saveAcademicAction(
  formData: Record<string, unknown>,
): Promise<ActionResponse> {
  try {
    const ctx = await getAppContext();
    if (ctx.error) return { success: false, error: ctx.error };

    const parsed = academicSchema.safeParse(formData);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const data = parsed.data;
    await upsertAcademicBackground(ctx.application!.id, {
      matric_institution: data.matric_institution,
      matric_grade: data.matric_grade,
      matric_percentage: data.matric_percentage,
      intermediate_institution: data.intermediate_institution,
      intermediate_grade: data.intermediate_grade,
      intermediate_percentage: data.intermediate_percentage,
      university_name: data.university_name,
      degree_program: data.degree_program,
      major_specialization: data.major_specialization,
      current_year_of_study: data.current_year_of_study,
      cgpa_percentage: data.cgpa_percentage,
      transcript_file_path: null, // handled by upload route
      expected_graduation_month: data.expected_graduation_month,
      expected_graduation_year: data.expected_graduation_year,
      re_education_level: data.re_education_level,
    });

    await touchApplicationSaved(ctx.application!.id);
    revalidatePath("/dashboard", "layout");
    return { success: true };
  } catch (error) {
    console.error("Save academic error:", error);
    return { success: false, error: "Failed to save academic information" };
  }
}

// ==================== SECTION 3: PLACEMENT ====================

export async function savePlacementAction(
  formData: Record<string, unknown>,
): Promise<ActionResponse> {
  try {
    const ctx = await getAppContext();
    if (ctx.error) return { success: false, error: ctx.error };

    const parsed = placementSchema.safeParse(formData);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const data = parsed.data;
    await upsertPlacementReadiness(ctx.application!.id, {
      willing_gilgit_chitral: data.willing_gilgit_chitral,
      stayed_away_before: data.stayed_away_before,
      stay_away_description: data.stayed_away_before
        ? data.stay_away_description || null
        : null,
      medical_conditions: data.medical_conditions || null,
    });

    await touchApplicationSaved(ctx.application!.id);
    revalidatePath("/dashboard", "layout");
    return { success: true };
  } catch (error) {
    console.error("Save placement error:", error);
    return { success: false, error: "Failed to save placement information" };
  }
}

// ==================== SECTION 4: INTERNSHIP PREFS ====================

export async function saveInternshipPrefsAction(formData: {
  preferences: Array<{ agency: string; priority_rank: number }>;
}): Promise<ActionResponse> {
  try {
    const ctx = await getAppContext();
    if (ctx.error) return { success: false, error: ctx.error };

    const parsed = internshipPrefsSchema.safeParse(formData);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    await upsertInternshipPreferences(
      ctx.application!.id,
      parsed.data.preferences,
    );

    await touchApplicationSaved(ctx.application!.id);
    revalidatePath("/dashboard", "layout");
    return { success: true };
  } catch (error) {
    console.error("Save internship prefs error:", error);
    return { success: false, error: "Failed to save internship preferences" };
  }
}

// ==================== SECTION 5: SKILLS ====================

export async function saveSkillsAction(
  formData: Record<string, unknown>,
): Promise<ActionResponse> {
  try {
    const ctx = await getAppContext();
    if (ctx.error) return { success: false, error: ctx.error };

    const parsed = skillsSchema.safeParse(formData);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const data = parsed.data;
    await upsertSkillsCompetencies(ctx.application!.id, {
      communication: data.communication,
      team_collaboration: data.team_collaboration,
      problem_solving: data.problem_solving,
      adaptability: data.adaptability,
      leadership: data.leadership,
      report_writing: data.report_writing,
      microsoft_office: data.microsoft_office,
      research_documentation: data.research_documentation,
      community_engagement: data.community_engagement,
      additional_skills: data.additional_skills || null,
    });

    await touchApplicationSaved(ctx.application!.id);
    revalidatePath("/dashboard", "layout");
    return { success: true };
  } catch (error) {
    console.error("Save skills error:", error);
    return { success: false, error: "Failed to save skills information" };
  }
}

// ==================== SECTION 6: EXPERIENCE ====================

export async function saveExperienceAction(formData: {
  experiences: Array<{
    institution: string;
    from_year: number;
    to_year: number;
    responsibility: string;
  }>;
}): Promise<ActionResponse> {
  try {
    const ctx = await getAppContext();
    if (ctx.error) return { success: false, error: ctx.error };

    const parsed = experienceSchema.safeParse(formData);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    await upsertExperienceEngagement(
      ctx.application!.id,
      parsed.data.experiences,
    );

    await touchApplicationSaved(ctx.application!.id);
    revalidatePath("/dashboard", "layout");
    return { success: true };
  } catch (error) {
    console.error("Save experience error:", error);
    return { success: false, error: "Failed to save experience information" };
  }
}

// ==================== SECTION 7: MOTIVATION ====================

export async function saveMotivationAction(formData: {
  essay_response: string;
  scenario_response: string;
}): Promise<ActionResponse> {
  try {
    const ctx = await getAppContext();
    if (ctx.error) return { success: false, error: ctx.error };

    const parsed = motivationSchema.safeParse(formData);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    await upsertMotivationAlignment(
      ctx.application!.id,
      parsed.data.essay_response,
      parsed.data.scenario_response,
    );

    await touchApplicationSaved(ctx.application!.id);
    revalidatePath("/dashboard", "layout");
    return { success: true };
  } catch (error) {
    console.error("Save motivation error:", error);
    return { success: false, error: "Failed to save motivation information" };
  }
}

// ==================== SECTION 8: AVAILABILITY ====================

export async function saveAvailabilityAction(formData: {
  available_july_aug_2026: boolean;
}): Promise<ActionResponse> {
  try {
    const ctx = await getAppContext();
    if (ctx.error) return { success: false, error: ctx.error };

    const parsed = availabilitySchema.safeParse(formData);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    await upsertAvailabilityCommitment(
      ctx.application!.id,
      parsed.data.available_july_aug_2026,
    );

    await touchApplicationSaved(ctx.application!.id);
    revalidatePath("/dashboard", "layout");
    return { success: true };
  } catch (error) {
    console.error("Save availability error:", error);
    return { success: false, error: "Failed to save availability information" };
  }
}

// ==================== SECTION 9: DOCUMENTS & REFERENCES ====================

export async function saveDocumentsAction(
  formData: Record<string, unknown>,
): Promise<ActionResponse> {
  try {
    const ctx = await getAppContext();
    if (ctx.error) return { success: false, error: ctx.error };

    const parsed = documentsSchema.safeParse(formData);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const data = parsed.data;

    // Academic reference (required)
    await upsertReference(ctx.application!.id, "Academic", {
      name: data.academic_ref_name,
      position: data.academic_ref_position || null,
      contact_number: data.academic_ref_contact || null,
      email: data.academic_ref_email || null,
    });

    // Supervisor reference (optional)
    if (data.supervisor_ref_name && data.supervisor_ref_name.trim()) {
      await upsertReference(ctx.application!.id, "Supervisor_Volunteer", {
        name: data.supervisor_ref_name,
        position: data.supervisor_ref_position || null,
        contact_number: data.supervisor_ref_contact || null,
        email: data.supervisor_ref_email || null,
      });
    } else {
      // If supervisor fields are empty, remove any existing supervisor reference
      await deleteReference(ctx.application!.id, "Supervisor_Volunteer");
    }

    await touchApplicationSaved(ctx.application!.id);
    revalidatePath("/dashboard", "layout");
    return { success: true };
  } catch (error) {
    console.error("Save documents error:", error);
    return { success: false, error: "Failed to save documents information" };
  }
}

// ==================== SECTION 10: VIDEO (just mark as done) ====================

export async function saveVideoAction(): Promise<ActionResponse> {
  try {
    const ctx = await getAppContext();
    if (ctx.error) return { success: false, error: ctx.error };
    // Video upload is handled by the upload API route
    // This action just touches the save timestamp
    await touchApplicationSaved(ctx.application!.id);
    revalidatePath("/dashboard", "layout");
    return { success: true };
  } catch (error) {
    console.error("Save video error:", error);
    return { success: false, error: "Failed to save video section" };
  }
}

// ==================== SUBMIT APPLICATION ====================

export async function submitApplicationAction(): Promise<ActionResponse> {
  try {
    const ctx = await getAppContext();
    if (ctx.error) return { success: false, error: ctx.error };

    // Verify all sections are complete
    const completion = await getSectionCompletion(ctx.application!.id);
    const allComplete = Object.values(completion).every(Boolean);

    if (!allComplete) {
      const incomplete = Object.entries(completion)
        .filter(([, v]) => !v)
        .map(([k]) => k);
      return {
        success: false,
        error: `Please complete all sections before submitting. Incomplete: ${incomplete.join(", ")}`,
      };
    }

    // Update status to submitted
    const now = nowPKTISO();
    await updateApplicationStatus(ctx.application!.id, "Submitted", now);
    revalidatePath("/dashboard", "layout");

    // Send confirmation email
    try {
      await sendEmail(
        ctx.user.email,
        "Application Submitted - AKYSB YAP 2026",
        applicationSubmittedTemplate(),
      );
    } catch (emailError) {
      console.error("Failed to send confirmation email:", emailError);
      // Don't fail the submission if email fails
    }

    return { success: true };
  } catch (error) {
    console.error("Submit application error:", error);
    return { success: false, error: "Failed to submit application" };
  }
}
