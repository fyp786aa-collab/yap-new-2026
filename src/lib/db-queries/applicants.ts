import { getDb } from "@/lib/db";
import { cache } from "react";
import type { Applicant } from "@/types";

export async function createApplicant(
  userId: string,
  email: string,
): Promise<{ success: boolean; data?: Applicant; error?: string }> {
  const sql = getDb();
  try {
    const rows = await sql`
      INSERT INTO applicants (user_id, email)
      VALUES (${userId}, ${email.toLowerCase()})
      ON CONFLICT (user_id) DO UPDATE SET email = EXCLUDED.email
      RETURNING *
    `;
    return { success: true, data: rows[0] as Applicant };
  } catch (error: unknown) {
    console.error("Error creating applicant:", error);
    return { success: false, error: "Failed to create applicant profile" };
  }
}

export const getApplicantByUserId = cache(
  async (userId: string): Promise<Applicant | null> => {
    const sql = getDb();
    try {
      const rows = await sql`
      SELECT * FROM applicants WHERE user_id = ${userId} LIMIT 1
    `;
      return rows.length > 0 ? (rows[0] as Applicant) : null;
    } catch (error) {
      console.error("Error fetching applicant:", error);
      return null;
    }
  },
);

/**
 * Check if any unique fields already belong to another applicant.
 * Returns a map of field name → error message for ALL conflicts, or null if clear.
 */
export async function checkApplicantUniqueness(
  userId: string,
  data: {
    full_name: string;
    father_name: string;
    cnic: string;
    primary_contact: string;
    whatsapp_number: string;
  },
): Promise<Record<string, string> | null> {
  const sql = getDb();
  try {
    const errors: Record<string, string> = {};

    // Check CNIC
    const cnicRows = await sql`
      SELECT id FROM applicants
      WHERE cnic = ${data.cnic} AND user_id != ${userId}
      LIMIT 1
    `;
    if (cnicRows.length > 0) {
      errors.cnic = "CNIC must be unique";
    }

    // Check primary contact
    const primaryRows = await sql`
      SELECT id FROM applicants
      WHERE primary_contact = ${data.primary_contact} AND user_id != ${userId}
      LIMIT 1
    `;
    if (primaryRows.length > 0) {
      errors.primary_contact = "Primary contact must be unique";
    }

    // Check WhatsApp number
    const whatsappRows = await sql`
      SELECT id FROM applicants
      WHERE whatsapp_number = ${data.whatsapp_number} AND user_id != ${userId}
      LIMIT 1
    `;
    if (whatsappRows.length > 0) {
      errors.whatsapp_number = "WhatsApp number must be unique";
    }

    // // Check full_name + father_name combination
    // const nameRows = await sql`
    //   SELECT id FROM applicants
    //   WHERE LOWER(full_name) = LOWER(${data.full_name})
    //     AND LOWER(father_name) = LOWER(${data.father_name})
    //     AND user_id != ${userId}
    //   LIMIT 1
    // `;
    // if (nameRows.length > 0) {
    //   errors.full_name =
    //     "An applicant with this name and father's name already exists";
    //   errors.father_name =
    //     "An applicant with this name and father's name already exists";
    // }

    return Object.keys(errors).length > 0 ? errors : null;
  } catch (error) {
    console.error("Error checking applicant uniqueness:", error);
    return {
      _form: "Failed to validate personal information. Please try again.",
    };
  }
}

export async function updateApplicant(
  userId: string,
  data: {
    full_name: string;
    father_name: string;
    gender: string;
    date_of_birth: string;
    cnic: string;
    primary_contact: string;
    whatsapp_number: string;
    email: string;
    city_of_residence: string;
    hometown: string;
    permanent_address: string;
    current_address: string;
  },
) {
  const sql = getDb();
  try {
    const rows = await sql`
      UPDATE applicants SET
        full_name = ${data.full_name},
        father_name = ${data.father_name},
        gender = ${data.gender},
        date_of_birth = ${data.date_of_birth}::date,
        cnic = ${data.cnic},
        primary_contact = ${data.primary_contact},
        whatsapp_number = ${data.whatsapp_number},
        email = ${data.email},
        city_of_residence = ${data.city_of_residence},
        hometown = ${data.hometown},
        permanent_address = ${data.permanent_address},
        current_address = ${data.current_address},
        updated_at = NOW()
      WHERE user_id = ${userId}
      RETURNING *
    `;
    if (rows.length === 0) {
      return { success: false, error: "Applicant not found" };
    }
    return { success: true, data: rows[0] as Applicant };
  } catch (error: unknown) {
    console.error("Error updating applicant:", error);
    // Surface friendly message for unique constraint violations
    const msg = String(error);
    if (msg.includes("unique") || msg.includes("duplicate key")) {
      if (msg.includes("cnic"))
        return {
          success: false,
          error: "CNIC must be unique.",
        };
      if (msg.includes("primary_contact"))
        return {
          success: false,
          error: "Primary contact number must be unique.",
        };
      if (msg.includes("whatsapp_number"))
        return {
          success: false,
          error: "WhatsApp number must be unique.",
        };
      return {
        success: false,
        error: "A duplicate value was found. Please check your information.",
      };
    }
    return { success: false, error: "Failed to update personal information" };
  }
}
