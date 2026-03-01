import { requireAuth } from "@/lib/session";
import { getApplicationByUserId } from "@/lib/db-queries/applications";
import { getApplicantByUserId } from "@/lib/db-queries/applicants";
import {
  getLocationInfo,
  getEmergencyContact,
} from "@/lib/db-queries/sections";
import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/routes";
import { PersonalInfoForm } from "@/components/forms/personal-info-form";

export const metadata = { title: "Personal Information" };

export default async function PersonalInfoPage() {
  const user = await requireAuth();
  const application = await getApplicationByUserId(user.id);
  if (!application || !application.consent_given)
    redirect(ROUTES.DASHBOARD.CONSENT);
  if (application.status === "Submitted") redirect(ROUTES.DASHBOARD.SUBMITTED);

  const [applicant, location, emergency] = await Promise.all([
    getApplicantByUserId(user.id),
    getLocationInfo(application.id),
    getEmergencyContact(application.id),
  ]);

  const defaults = {
    full_name: applicant?.full_name || "",
    father_name: applicant?.father_name || "",
    gender: (applicant?.gender as "Male" | "Female" | "Other") || "Male",
    date_of_birth: applicant?.date_of_birth
      ? new Date(applicant.date_of_birth).toISOString().slice(0, 10)
      : "",
    cnic: applicant?.cnic === "00000-0000000-0" ? "" : applicant?.cnic || "",
    primary_contact: applicant?.primary_contact || "",
    whatsapp_number: applicant?.whatsapp_number || "",
    email: applicant?.email || user.email,
    city_of_residence: applicant?.city_of_residence || "",
    hometown: applicant?.hometown || "",
    permanent_address: applicant?.permanent_address || "",
    current_address: applicant?.current_address || "",
    regional_council: location?.regional_council || "",
    local_council: location?.local_council || "",
    jamatkhana: location?.jamatkhana || "",
    has_relatives_gilgit_chitral:
      location?.has_relatives_in_gilgit_chitral || false,
    relatives_address: location?.relatives_address || "",
    relatives_contact: location?.relatives_contact || "",
    emergency_name: emergency?.name || "",
    emergency_relationship: emergency?.relationship || "",
    emergency_phone: emergency?.phone_number || "",
  };

  return <PersonalInfoForm defaultValues={defaults} />;
}
