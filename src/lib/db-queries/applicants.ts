import { getDb } from "@/lib/db";
import type { Applicant } from "@/types";

export async function createApplicant(
  userId: string,
  email: string,
): Promise<{ success: boolean; data?: Applicant; error?: string }> {
  const sql = getDb();
  try {
    const rows = await sql`
      INSERT INTO applicants (user_id, full_name, father_name, gender, date_of_birth, cnic, primary_contact, email)
      VALUES (${userId}, '', '', 'Male', '2000-01-01', '00000-0000000-0', '', ${email.toLowerCase()})
      RETURNING *
    `;
    return { success: true, data: rows[0] as Applicant };
  } catch (error: unknown) {
    console.error("Error creating applicant:", error);
    const pgError = error as { code?: string };
    if (pgError.code === "23505") {
      // Already exists - fetch and return
      const existing = await getApplicantByUserId(userId);
      if (existing) return { success: true, data: existing };
    }
    return { success: false, error: "Failed to create applicant profile" };
  }
}

export async function getApplicantByUserId(
  userId: string,
): Promise<Applicant | null> {
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
  } catch (error) {
    console.error("Error updating applicant:", error);
    return { success: false, error: "Failed to update personal information" };
  }
}
