export type UserRole = "applicant" | "reviewer" | "admin";

export type ApplicationStatus =
  | "Draft"
  | "Submitted"
  | "Under Review"
  | "Shortlisted"
  | "Selected"
  | "Rejected";

export interface User {
  id: string;
  email: string;
  role: UserRole;
  email_verified: boolean;
  created_at: string;
}

export interface SessionUser {
  id: string;
  email: string;
  role: UserRole;
  email_verified: boolean;
}

export interface Applicant {
  id: string;
  user_id: string;
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
}

export interface Application {
  id: string;
  applicant_id: string;
  cohort_year: number;
  status: ApplicationStatus;
  last_saved_at: string;
  submitted_at: string | null;
}

export interface LocationInfo {
  id: string;
  application_id: string;
  regional_council: string;
  local_council: string;
  jamatkhana: string;
  has_relatives_in_gilgit_chitral: boolean;
  relatives_address: string | null;
  relatives_contact: string | null;
}

export interface EmergencyContact {
  id: string;
  application_id: string;
  name: string;
  relationship: string;
  phone_number: string;
}

export interface AcademicBackground {
  id: string;
  application_id: string;
  university_name: string;
  degree_program: string;
  major_specialization: string;
  current_year_of_study: number;
  cgpa_percentage: number;
  transcript_file_path: string | null;
  expected_graduation_month: number;
  expected_graduation_year: number;
  re_education_level: string;
}

export interface PlacementReadiness {
  id: string;
  application_id: string;
  willing_gilgit_chitral: boolean;
  stayed_away_before: boolean;
  stay_away_description: string | null;
  medical_conditions: string | null;
}

export interface InternshipPreference {
  id: string;
  application_id: string;
  agency: string;
  priority_rank: number;
}

export interface SkillsCompetencies {
  id: string;
  application_id: string;
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
}

export interface ExperienceEngagement {
  id: string;
  application_id: string;
  description: string;
}

export interface MotivationAlignment {
  id: string;
  application_id: string;
  essay_response: string;
}

export interface AvailabilityCommitment {
  id: string;
  application_id: string;
  available_july_aug_2026: boolean;
}

export interface DocumentRecord {
  id: string;
  application_id: string;
  document_type: "CV" | "Transcript" | "Video";
  file_path: string;
  file_name: string | null;
  uploaded_at: string;
}

export interface ApplicationReference {
  id: string;
  application_id: string;
  reference_type: "Academic" | "Supervisor_Volunteer";
  name: string;
  position: string | null;
  contact_number: string | null;
  email: string | null;
}

export interface ActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface SectionCompletion {
  personalInfo: boolean;
  academic: boolean;
  placement: boolean;
  internshipPrefs: boolean;
  skills: boolean;
  experience: boolean;
  motivation: boolean;
  availability: boolean;
  documents: boolean;
  video: boolean;
}

export interface FullApplication {
  application: Application;
  applicant: Applicant;
  locationInfo: LocationInfo | null;
  emergencyContact: EmergencyContact | null;
  academic: AcademicBackground | null;
  placement: PlacementReadiness | null;
  internshipPrefs: InternshipPreference[];
  skills: SkillsCompetencies | null;
  experience: ExperienceEngagement | null;
  motivation: MotivationAlignment | null;
  availability: AvailabilityCommitment | null;
  documents: DocumentRecord[];
  references: ApplicationReference[];
}
