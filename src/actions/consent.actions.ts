"use server";

import { consentSchema, type ConsentInput } from "@/lib/validations/consent";
import { createApplicant } from "@/lib/db-queries/applicants";
import { createApplication } from "@/lib/db-queries/applications";
import { getApplicantByUserId } from "@/lib/db-queries/applicants";
import type { ActionResponse } from "@/types";

export async function submitConsentAction(
  userId: string,
  email: string,
  formData: ConsentInput,
): Promise<ActionResponse> {
  try {
    const parsed = consentSchema.safeParse(formData);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    // Ensure applicant exists
    let applicant = await getApplicantByUserId(userId);
    if (!applicant) {
      const result = await createApplicant(userId, email);
      if (!result.success || !result.data) {
        return { success: false, error: "Failed to create applicant profile" };
      }
      applicant = result.data;
    }

    // Ensure application exists
    const appResult = await createApplication(applicant.id);
    if (!appResult.success) {
      return { success: false, error: "Failed to create application" };
    }

    return { success: true };
  } catch (error) {
    console.error("Consent error:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}
