export const ROUTES = {
  AUTH: {
    LOGIN: "/login",
    SIGNUP: "/signup",
    VERIFY_EMAIL: "/verify-email",
    FORGOT_PASSWORD: "/forgot-password",
    RESET_PASSWORD: "/reset-password",
  },
  DASHBOARD: {
    HOME: "/dashboard",
    CONSENT: "/dashboard/consent",
    PERSONAL_INFO: "/dashboard/personal-info",
    ACADEMIC: "/dashboard/academic",
    PLACEMENT: "/dashboard/placement",
    INTERNSHIP_PREFS: "/dashboard/internship-prefs",
    SKILLS: "/dashboard/skills",
    EXPERIENCE: "/dashboard/experience",
    MOTIVATION: "/dashboard/motivation",
    AVAILABILITY: "/dashboard/availability",
    DOCUMENTS: "/dashboard/documents",
    VIDEO: "/dashboard/video",
    REVIEW: "/dashboard/review",
    SUBMITTED: "/dashboard/submitted",
  },
  API: {
    UPLOAD: "/api/upload",
    DELETE_UPLOAD: "/api/upload",
  },
} as const;

export type RouteKey = typeof ROUTES;

export const SECTION_ORDER = [
  {
    key: "personal-info",
    label: "Personal Information",
    route: ROUTES.DASHBOARD.PERSONAL_INFO,
    section: 1,
  },
  {
    key: "academic",
    label: "Academic Background",
    route: ROUTES.DASHBOARD.ACADEMIC,
    section: 2,
  },
  {
    key: "placement",
    label: "Placement, Preferences & Skills",
    route: ROUTES.DASHBOARD.PLACEMENT,
    section: 3,
  },
  {
    key: "experience",
    label: "Experience & Engagement",
    route: ROUTES.DASHBOARD.EXPERIENCE,
    section: 4,
  },
  {
    key: "motivation",
    label: "Motivation & Alignment",
    route: ROUTES.DASHBOARD.MOTIVATION,
    section: 5,
  },
  {
    key: "availability",
    label: "Availability & Commitment",
    route: ROUTES.DASHBOARD.AVAILABILITY,
    section: 6,
  },
  {
    key: "documents",
    label: "Documents & References",
    route: ROUTES.DASHBOARD.DOCUMENTS,
    section: 7,
  },
  {
    key: "video",
    label: "Video Submission",
    route: ROUTES.DASHBOARD.VIDEO,
    section: 8,
  },
] as const;
