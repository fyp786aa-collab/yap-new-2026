export const APP_NAME = "Young Ambassador Programme 2026";
export const APP_SHORT_NAME = "YAP 2026";
export const SUPPORT_EMAIL = "yap.ysb@akcpk.org";
export const COHORT_YEAR = 2026;

export const GENDER_OPTIONS = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
] as const;

export const RE_EDUCATION_OPTIONS = [
  { value: "Others", label: "Others" },
  { value: "Matric", label: "Matric" },
  { value: "HRE", label: "HRE" },
  { value: "ARE", label: "ARE" },
] as const;

export const AGENCIES = [
  {
    value: "AKESP",
    label: "AKESP",
    fullForm: "Aga Khan Education Service, Pakistan",
  },
  {
    value: "AKHS",
    label: "AKHS",
    fullForm: "Aga Khan Health Services, Pakistan",
  },
  {
    value: "AKRSP",
    label: "AKRSP",
    fullForm: "Aga Khan Rural Support Programme, Pakistan",
  },
  {
    value: "AKAH",
    label: "AKAH",
    fullForm: "Aga Khan Agency for Habitat, Pakistan",
  },
  { value: "Serena Hotels", label: "Serena Hotels", fullForm: "Serena Hotels" },
  {
    value: "Accelerate Prosperity",
    label: "Accelerate Prosperity",
    fullForm: "Accelerate Prosperity",
  },
] as const;

export const SKILL_CATEGORIES = [
  { key: "communication", label: "Communication Skills" },
  { key: "team_collaboration", label: "Team Collaboration" },
  { key: "problem_solving", label: "Problem Solving" },
  { key: "adaptability", label: "Adaptability" },
  { key: "leadership", label: "Leadership" },
  { key: "report_writing", label: "Report Writing" },
  { key: "microsoft_office", label: "Microsoft Office" },
  { key: "research_documentation", label: "Research & Documentation" },
  { key: "community_engagement", label: "Community Engagement" },
] as const;

export const YEAR_OF_STUDY_OPTIONS = [
  { value: 1, label: "Year 1" },
  { value: 2, label: "Year 2" },
  { value: 3, label: "Year 3" },
  { value: 4, label: "Year 4" },
] as const;

export const APPLICATION_STATUSES = [
  "Draft",
  "Submitted",
  "Under Review",
  "Shortlisted",
  "Selected",
  "Rejected",
] as const;

export const RELATIONSHIP_OPTIONS = [
  "Father",
  "Mother",
  "Brother",
  "Sister",
  "Spouse",
  "Uncle",
  "Aunt",
  "Guardian",
  "Other",
] as const;

export const MONTHS = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
] as const;

export const MAX_FILE_SIZES = {
  CV: 5 * 1024 * 1024, // 5MB
  TRANSCRIPT: 10 * 1024 * 1024, // 10MB
  VIDEO: 100 * 1024 * 1024, // 100MB
} as const;

export const ALLOWED_FILE_TYPES = {
  CV: ["application/pdf"],
  TRANSCRIPT: ["application/pdf"],
  VIDEO: ["video/mp4", "video/quicktime"],
} as const;
