import { getDb, withTransaction } from "@/lib/db";

// ==================== LOCATION INFO ====================

export async function upsertLocationInfo(
  applicationId: string,
  data: {
    regional_council: string;
    local_council: string;
    jamatkhana: string;
    has_relatives_in_gilgit_chitral: boolean;
    relatives_name: string | null;
    relatives_address: string | null;
    relatives_contact: string | null;
  },
) {
  const sql = getDb();
  try {
    await sql`
      INSERT INTO location_info (application_id, regional_council, local_council, jamatkhana, has_relatives_in_gilgit_chitral, relatives_name, relatives_address, relatives_contact)
      VALUES (${applicationId}, ${data.regional_council}, ${data.local_council}, ${data.jamatkhana}, ${data.has_relatives_in_gilgit_chitral}, ${data.relatives_name}, ${data.relatives_address}, ${data.relatives_contact})
      ON CONFLICT (application_id) DO UPDATE SET
        regional_council = ${data.regional_council},
        local_council = ${data.local_council},
        jamatkhana = ${data.jamatkhana},
        has_relatives_in_gilgit_chitral = ${data.has_relatives_in_gilgit_chitral},
        relatives_name = ${data.relatives_name},
        relatives_address = ${data.relatives_address},
        relatives_contact = ${data.relatives_contact}
    `;
    return { success: true };
  } catch (error) {
    console.error("Error upserting location info:", error);
    return { success: false, error: "Failed to save location information" };
  }
}

// ==================== EMERGENCY CONTACT ====================

export async function upsertEmergencyContact(
  applicationId: string,
  data: { name: string; relationship: string; phone_number: string },
) {
  const sql = getDb();
  try {
    await sql`
      INSERT INTO emergency_contacts (application_id, name, relationship, phone_number)
      VALUES (${applicationId}, ${data.name}, ${data.relationship}, ${data.phone_number})
      ON CONFLICT (application_id) DO UPDATE SET
        name = ${data.name},
        relationship = ${data.relationship},
        phone_number = ${data.phone_number}
    `;
    return { success: true };
  } catch (error) {
    console.error("Error upserting emergency contact:", error);
    return { success: false, error: "Failed to save emergency contact" };
  }
}

// ==================== ACADEMIC BACKGROUND ====================

export async function upsertAcademicBackground(
  applicationId: string,
  data: {
    matric_institution: string;
    matric_grade: string;
    matric_percentage: number;
    intermediate_institution: string;
    intermediate_grade: string;
    intermediate_percentage: number;
    university_name: string;
    degree_program: string;
    major_specialization: string;
    current_year_of_study: number;
    cgpa_percentage: number;
    transcript_file_path: string | null;
    expected_graduation_month: number;
    expected_graduation_year: number;
    re_education_level: string;
  },
) {
  const sql = getDb();
  try {
    await sql`
      INSERT INTO academic_background (application_id, matric_institution, matric_grade, matric_percentage, intermediate_institution, intermediate_grade, intermediate_percentage, university_name, degree_program, major_specialization, current_year_of_study, cgpa_percentage, transcript_file_path, expected_graduation_month, expected_graduation_year, re_education_level)
      VALUES (${applicationId}, ${data.matric_institution}, ${data.matric_grade}, ${data.matric_percentage}, ${data.intermediate_institution}, ${data.intermediate_grade}, ${data.intermediate_percentage}, ${data.university_name}, ${data.degree_program}, ${data.major_specialization}, ${data.current_year_of_study}, ${data.cgpa_percentage}, ${data.transcript_file_path}, ${data.expected_graduation_month}, ${data.expected_graduation_year}, ${data.re_education_level})
      ON CONFLICT (application_id) DO UPDATE SET
        matric_institution = ${data.matric_institution},
        matric_grade = ${data.matric_grade},
        matric_percentage = ${data.matric_percentage},
        intermediate_institution = ${data.intermediate_institution},
        intermediate_grade = ${data.intermediate_grade},
        intermediate_percentage = ${data.intermediate_percentage},
        university_name = ${data.university_name},
        degree_program = ${data.degree_program},
        major_specialization = ${data.major_specialization},
        current_year_of_study = ${data.current_year_of_study},
        cgpa_percentage = ${data.cgpa_percentage},
        transcript_file_path = ${data.transcript_file_path},
        expected_graduation_month = ${data.expected_graduation_month},
        expected_graduation_year = ${data.expected_graduation_year},
        re_education_level = ${data.re_education_level}
    `;
    return { success: true };
  } catch (error) {
    console.error("Error upserting academic background:", error);
    return { success: false, error: "Failed to save academic information" };
  }
}

// ==================== PLACEMENT READINESS ====================

export async function upsertPlacementReadiness(
  applicationId: string,
  data: {
    willing_gilgit_chitral: boolean;
    stayed_away_before: boolean;
    stay_away_description: string | null;
    medical_conditions: string | null;
  },
) {
  const sql = getDb();
  try {
    await sql`
      INSERT INTO placement_readiness (application_id, willing_gilgit_chitral, stayed_away_before, stay_away_description, medical_conditions)
      VALUES (${applicationId}, ${data.willing_gilgit_chitral}, ${data.stayed_away_before}, ${data.stay_away_description}, ${data.medical_conditions})
      ON CONFLICT (application_id) DO UPDATE SET
        willing_gilgit_chitral = ${data.willing_gilgit_chitral},
        stayed_away_before = ${data.stayed_away_before},
        stay_away_description = ${data.stay_away_description},
        medical_conditions = ${data.medical_conditions}
    `;
    return { success: true };
  } catch (error) {
    console.error("Error upserting placement readiness:", error);
    return { success: false, error: "Failed to save placement information" };
  }
}

// ==================== INTERNSHIP PREFERENCES ====================

export async function upsertInternshipPreferences(
  applicationId: string,
  preferences: Array<{ agency: string; priority_rank: number }>,
) {
  try {
    await withTransaction((txn) => [
      txn`DELETE FROM internship_preferences WHERE application_id = ${applicationId}`,
      ...preferences.map(
        (pref) =>
          txn`INSERT INTO internship_preferences (application_id, agency, priority_rank)
              VALUES (${applicationId}, ${pref.agency}, ${pref.priority_rank})`,
      ),
    ]);
    return { success: true };
  } catch (error) {
    console.error("Error upserting internship preferences:", error);
    return { success: false, error: "Failed to save internship preferences" };
  }
}

// ==================== SKILLS & COMPETENCIES ====================

export async function upsertSkillsCompetencies(
  applicationId: string,
  data: {
    communication: number;
    team_collaboration: number;
    problem_solving: number;
    adaptability: number;
    leadership: number;
    report_writing: number;
    microsoft_office: number;
    research_documentation: number;
    community_engagement: number;
    additional_skills: string | null;
  },
) {
  const sql = getDb();
  try {
    await sql`
      INSERT INTO skills_competencies (application_id, communication, team_collaboration, problem_solving, adaptability, leadership, report_writing, microsoft_office, research_documentation, community_engagement, additional_skills)
      VALUES (${applicationId}, ${data.communication}, ${data.team_collaboration}, ${data.problem_solving}, ${data.adaptability}, ${data.leadership}, ${data.report_writing}, ${data.microsoft_office}, ${data.research_documentation}, ${data.community_engagement}, ${data.additional_skills})
      ON CONFLICT (application_id) DO UPDATE SET
        communication = ${data.communication},
        team_collaboration = ${data.team_collaboration},
        problem_solving = ${data.problem_solving},
        adaptability = ${data.adaptability},
        leadership = ${data.leadership},
        report_writing = ${data.report_writing},
        microsoft_office = ${data.microsoft_office},
        research_documentation = ${data.research_documentation},
        community_engagement = ${data.community_engagement},
        additional_skills = ${data.additional_skills}
    `;
    return { success: true };
  } catch (error) {
    console.error("Error upserting skills:", error);
    return { success: false, error: "Failed to save skills information" };
  }
}

// ==================== EXPERIENCE & ENGAGEMENT ====================

export async function upsertExperienceEngagement(
  applicationId: string,
  experiences: Array<{
    institution: string;
    from_year: number;
    to_year: number;
    responsibility: string;
  }>,
) {
  try {
    await withTransaction((txn) => [
      txn`DELETE FROM voluntary_experiences WHERE application_id = ${applicationId}`,
      ...experiences.map(
        (exp) =>
          txn`INSERT INTO voluntary_experiences (application_id, institution, from_year, to_year, responsibility)
              VALUES (${applicationId}, ${exp.institution}, ${exp.from_year}, ${exp.to_year}, ${exp.responsibility})`,
      ),
    ]);
    return { success: true };
  } catch (error) {
    console.error("Error upserting experience:", error);
    return { success: false, error: "Failed to save experience information" };
  }
}

// ==================== MOTIVATION & ALIGNMENT ====================

export async function upsertMotivationAlignment(
  applicationId: string,
  essayResponse: string,
  scenarioResponse: string,
) {
  const sql = getDb();
  try {
    await sql`
      INSERT INTO motivation_alignment (application_id, essay_response, scenario_response)
      VALUES (${applicationId}, ${essayResponse}, ${scenarioResponse})
      ON CONFLICT (application_id) DO UPDATE SET
        essay_response = ${essayResponse},
        scenario_response = ${scenarioResponse}
    `;
    return { success: true };
  } catch (error) {
    console.error("Error upserting motivation:", error);
    return { success: false, error: "Failed to save motivation information" };
  }
}

// ==================== AVAILABILITY & COMMITMENT ====================

export async function upsertAvailabilityCommitment(
  applicationId: string,
  available: boolean,
) {
  const sql = getDb();
  try {
    await sql`
      INSERT INTO availability_commitment (application_id, available_july_aug_2026)
      VALUES (${applicationId}, ${available})
      ON CONFLICT (application_id) DO UPDATE SET available_july_aug_2026 = ${available}
    `;
    return { success: true };
  } catch (error) {
    console.error("Error upserting availability:", error);
    return { success: false, error: "Failed to save availability information" };
  }
}

// ==================== DOCUMENTS ====================

export async function upsertDocument(
  applicationId: string,
  documentType: string,
  filePath: string,
  fileName: string,
) {
  const sql = getDb();
  try {
    // Delete existing document of same type, then insert new
    await sql`DELETE FROM documents WHERE application_id = ${applicationId} AND document_type = ${documentType}`;
    await sql`
      INSERT INTO documents (application_id, document_type, file_path, file_name)
      VALUES (${applicationId}, ${documentType}, ${filePath}, ${fileName})
    `;
    return { success: true };
  } catch (error) {
    console.error("Error upserting document:", error);
    return { success: false, error: "Failed to save document" };
  }
}

export async function getDocumentsByApplication(applicationId: string) {
  const sql = getDb();
  try {
    const rows = await sql`
      SELECT * FROM documents WHERE application_id = ${applicationId}
    `;
    return rows;
  } catch (error) {
    console.error("Error getting documents:", error);
    return [];
  }
}

export async function deleteDocument(
  applicationId: string,
  documentType: string,
): Promise<{ success: boolean; filePath?: string; error?: string }> {
  const sql = getDb();
  try {
    const rows = await sql`
      DELETE FROM documents
      WHERE application_id = ${applicationId} AND document_type = ${documentType}
      RETURNING file_path
    `;
    const filePath = (rows as any)[0]?.file_path ?? null;
    return { success: true, filePath };
  } catch (error) {
    console.error("Error deleting document:", error);
    return { success: false, error: "Failed to delete document" };
  }
}

// ==================== REFERENCES ====================

export async function upsertReference(
  applicationId: string,
  referenceType: string,
  data: {
    name: string;
    position: string | null;
    contact_number: string | null;
    email: string | null;
  },
) {
  const sql = getDb();
  try {
    // Delete existing reference of same type
    await sql`DELETE FROM application_references WHERE application_id = ${applicationId} AND reference_type = ${referenceType}`;
    await sql`
      INSERT INTO application_references (application_id, reference_type, name, position, contact_number, email)
      VALUES (${applicationId}, ${referenceType}, ${data.name}, ${data.position}, ${data.contact_number}, ${data.email})
    `;
    return { success: true };
  } catch (error) {
    console.error("Error upserting reference:", error);
    return { success: false, error: "Failed to save reference" };
  }
}

export async function deleteReference(
  applicationId: string,
  referenceType: string,
) {
  const sql = getDb();
  try {
    await sql`
      DELETE FROM application_references
      WHERE application_id = ${applicationId} AND reference_type = ${referenceType}
    `;
    return { success: true };
  } catch (error) {
    console.error("Error deleting reference:", error);
    return { success: false, error: "Failed to delete reference" };
  }
}

// ==================== SECTION DATA FETCHERS ====================

export async function getLocationInfo(applicationId: string) {
  const sql = getDb();
  try {
    const rows =
      await sql`SELECT * FROM location_info WHERE application_id = ${applicationId}`;
    return rows[0] || null;
  } catch (error) {
    console.error("Error getting location info:", error);
    return null;
  }
}

export async function getEmergencyContact(applicationId: string) {
  const sql = getDb();
  try {
    const rows =
      await sql`SELECT * FROM emergency_contacts WHERE application_id = ${applicationId}`;
    return rows[0] || null;
  } catch (error) {
    console.error("Error getting emergency contact:", error);
    return null;
  }
}

export async function getAcademicBackground(applicationId: string) {
  const sql = getDb();
  try {
    const rows =
      await sql`SELECT * FROM academic_background WHERE application_id = ${applicationId}`;
    return rows[0] || null;
  } catch (error) {
    console.error("Error getting academic background:", error);
    return null;
  }
}

export async function getPlacementReadiness(applicationId: string) {
  const sql = getDb();
  try {
    const rows =
      await sql`SELECT * FROM placement_readiness WHERE application_id = ${applicationId}`;
    return rows[0] || null;
  } catch (error) {
    console.error("Error getting placement readiness:", error);
    return null;
  }
}

export async function getInternshipPreferences(applicationId: string) {
  const sql = getDb();
  try {
    const rows =
      await sql`SELECT * FROM internship_preferences WHERE application_id = ${applicationId} ORDER BY priority_rank`;
    return rows;
  } catch (error) {
    console.error("Error getting internship preferences:", error);
    return [];
  }
}

export async function getSkillsCompetencies(applicationId: string) {
  const sql = getDb();
  try {
    const rows =
      await sql`SELECT * FROM skills_competencies WHERE application_id = ${applicationId}`;
    return rows[0] || null;
  } catch (error) {
    console.error("Error getting skills:", error);
    return null;
  }
}

export async function getExperienceEngagement(applicationId: string) {
  const sql = getDb();
  try {
    const rows =
      await sql`SELECT * FROM voluntary_experiences WHERE application_id = ${applicationId} ORDER BY from_year`;
    return rows;
  } catch (error) {
    console.error("Error getting experience:", error);
    return [];
  }
}

export async function getMotivationAlignment(applicationId: string) {
  const sql = getDb();
  try {
    const rows =
      await sql`SELECT * FROM motivation_alignment WHERE application_id = ${applicationId}`;
    return rows[0] || null;
  } catch (error) {
    console.error("Error getting motivation:", error);
    return null;
  }
}

export async function getAvailabilityCommitment(applicationId: string) {
  const sql = getDb();
  try {
    const rows =
      await sql`SELECT * FROM availability_commitment WHERE application_id = ${applicationId}`;
    return rows[0] || null;
  } catch (error) {
    console.error("Error getting availability:", error);
    return null;
  }
}

export async function getReferences(applicationId: string) {
  const sql = getDb();
  try {
    const rows =
      await sql`SELECT * FROM application_references WHERE application_id = ${applicationId}`;
    return rows;
  } catch (error) {
    console.error("Error getting references:", error);
    return [];
  }
}
