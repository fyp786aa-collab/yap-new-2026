"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { submitApplicationAction } from "@/actions/application.actions";
import { ROUTES, SECTION_ORDER } from "@/lib/routes";
import { AGENCIES } from "@/lib/constants";
import type { SectionCompletion } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ButtonPrimary } from "@/components/ui/button-primary";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle2,
  XCircle,
  Pencil,
  Send,
  AlertTriangle,
} from "lucide-react";

const COMPLETION_KEY_MAP: Record<string, keyof SectionCompletion> = {
  "personal-info": "personalInfo",
  academic: "academic",
  placement: "placement",
  "internship-prefs": "internshipPrefs",
  skills: "skills",
  experience: "experience",
  motivation: "motivation",
  availability: "availability",
  documents: "documents",
  video: "video",
};

interface ReviewContentProps {
  completion: SectionCompletion;
  fullApplication: Record<string, unknown> | null;
  allComplete: boolean;
}

export function ReviewContent({
  completion,
  fullApplication,
  allComplete,
}: ReviewContentProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const app = fullApplication?.application as Record<string, unknown> | null;
  const loc = fullApplication?.locationInfo as Record<string, unknown> | null;
  const emergency = fullApplication?.emergencyContact as Record<
    string,
    unknown
  > | null;
  const academic = fullApplication?.academic as Record<string, unknown> | null;
  const placement = fullApplication?.placement as Record<
    string,
    unknown
  > | null;
  const prefs = ((fullApplication?.internshipPrefs as unknown) || []) as Array<
    Record<string, unknown>
  >;
  const skills = fullApplication?.skills as Record<string, unknown> | null;
  const experience = fullApplication?.experience as Record<
    string,
    unknown
  > | null;
  const motivation = fullApplication?.motivation as Record<
    string,
    unknown
  > | null;
  const availability = fullApplication?.availability as Record<
    string,
    unknown
  > | null;
  const docs = ((fullApplication?.documents as unknown) || []) as Array<
    Record<string, unknown>
  >;
  const refs = ((fullApplication?.references as unknown) || []) as Array<
    Record<string, unknown>
  >;

  async function handleSubmit() {
    setIsSubmitting(true);
    try {
      const result = await submitApplicationAction();
      if (result.success) {
        toast.success("Application submitted successfully!");
        router.push(ROUTES.DASHBOARD.SUBMITTED);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to submit");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-yap-primary">Review & Submit</h1>
        <p className="text-muted-foreground mt-1">
          Review your application before submitting. Once submitted, you cannot
          make changes.
        </p>
      </div>

      {/* Completion checklist */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Section Completion</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2">
            {SECTION_ORDER.map((section) => {
              const key = COMPLETION_KEY_MAP[section.key];
              const isComplete = key ? completion[key] : false;
              return (
                <div
                  key={section.key}
                  className="flex items-center justify-between py-1.5"
                >
                  <div className="flex items-center gap-2">
                    {isComplete ? (
                      <CheckCircle2 className="w-4 h-4 text-yap-accent" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400" />
                    )}
                    <span className="text-sm">
                      {section.section}. {section.label}
                    </span>
                  </div>
                  <Link href={section.route}>
                    <Pencil className="w-3.5 h-3.5 text-muted-foreground hover:text-yap-accent transition-colors" />
                  </Link>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Summary sections */}
      {app && (
        <>
          <ReviewSection
            title="1. Personal Information"
            editRoute={ROUTES.DASHBOARD.PERSONAL_INFO}
            complete={completion.personalInfo}
          >
            <div className="grid gap-2 sm:grid-cols-2 text-sm">
              <Field label="Full Name" value={app.full_name as string} />
              <Field label="Father's Name" value={app.father_name as string} />
              <Field label="Gender" value={app.gender as string} />
              <Field
                label="Date of Birth"
                value={
                  app.date_of_birth
                    ? new Date(app.date_of_birth as any).toLocaleDateString(
                        "en-GB",
                        { day: "2-digit", month: "short", year: "numeric" },
                      )
                    : ""
                }
              />
              <Field label="CNIC" value={app.cnic as string} />
              <Field label="Email" value={app.email as string} />
              <Field
                label="Primary Contact"
                value={app.primary_contact as string}
              />
              <Field label="WhatsApp" value={app.whatsapp_number as string} />
              {loc && (
                <>
                  <Field
                    label="Regional Council"
                    value={loc.regional_council as string}
                  />
                  <Field
                    label="Local Council"
                    value={loc.local_council as string}
                  />
                  <Field label="Jamatkhana" value={loc.jamatkhana as string} />
                </>
              )}
              {emergency && (
                <>
                  <Field
                    label="Emergency Contact"
                    value={`${emergency.name} (${emergency.relationship})`}
                  />
                  <Field
                    label="Emergency Phone"
                    value={emergency.phone_number as string}
                  />
                </>
              )}
            </div>
          </ReviewSection>

          <ReviewSection
            title="2. Academic Background"
            editRoute={ROUTES.DASHBOARD.ACADEMIC}
            complete={completion.academic}
          >
            {academic && (
              <div className="grid gap-2 sm:grid-cols-2 text-sm">
                <Field
                  label="University"
                  value={academic.university_name as string}
                />
                <Field
                  label="Degree"
                  value={academic.degree_program as string}
                />
                <Field
                  label="Major"
                  value={academic.major_specialization as string}
                />
                <Field
                  label="Year"
                  value={`Year ${academic.current_year_of_study}`}
                />
                <Field
                  label="CGPA/%"
                  value={String(academic.cgpa_percentage)}
                />
                <Field
                  label="RE Education"
                  value={academic.re_education_level as string}
                />
              </div>
            )}
          </ReviewSection>

          <ReviewSection
            title="3. Placement Readiness"
            editRoute={ROUTES.DASHBOARD.PLACEMENT}
            complete={completion.placement}
          >
            {placement && (
              <div className="text-sm space-y-2">
                <Field
                  label="Willing for GB/Chitral"
                  value={placement.willing_gilgit_chitral ? "Yes" : "No"}
                />
                <Field
                  label="Stayed away before"
                  value={placement.stayed_away_before ? "Yes" : "No"}
                />
                {!!placement.medical_conditions && (
                  <Field
                    label="Medical Conditions"
                    value={placement.medical_conditions as string}
                  />
                )}
              </div>
            )}
          </ReviewSection>

          <ReviewSection
            title="4. Internship Preferences"
            editRoute={ROUTES.DASHBOARD.INTERNSHIP_PREFS}
            complete={completion.internshipPrefs}
          >
            {prefs.length > 0 && (
              <div className="text-sm space-y-1">
                {prefs.map((p) => {
                  const agency = AGENCIES.find((a) => a.value === p.agency);
                  return (
                    <div
                      key={p.priority_rank as number}
                      className="flex items-center gap-2"
                    >
                      <span className="w-6 h-6 rounded-full bg-yap-accent/10 text-yap-accent text-xs font-bold flex items-center justify-center">
                        {p.priority_rank as number}
                      </span>
                      <span>{agency?.label || (p.agency as string)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </ReviewSection>

          <ReviewSection
            title="5. Skills & Competencies"
            editRoute={ROUTES.DASHBOARD.SKILLS}
            complete={completion.skills}
          >
            {skills && (
              <div className="grid gap-2 sm:grid-cols-2 text-sm">
                <Field
                  label="Communication"
                  value={`${skills.communication}/5`}
                />
                <Field
                  label="Team Collaboration"
                  value={`${skills.team_collaboration}/5`}
                />
                <Field
                  label="Problem Solving"
                  value={`${skills.problem_solving}/5`}
                />
                <Field
                  label="Adaptability"
                  value={`${skills.adaptability}/5`}
                />
                <Field label="Leadership" value={`${skills.leadership}/5`} />
                <Field
                  label="Report Writing"
                  value={`${skills.report_writing}/5`}
                />
                <Field
                  label="Microsoft Office"
                  value={`${skills.microsoft_office}/5`}
                />
                <Field
                  label="Research & Documentation"
                  value={`${skills.research_documentation}/5`}
                />
                <Field
                  label="Community Engagement"
                  value={`${skills.community_engagement}/5`}
                />
              </div>
            )}
          </ReviewSection>

          <ReviewSection
            title="6. Experience & Engagement"
            editRoute={ROUTES.DASHBOARD.EXPERIENCE}
            complete={completion.experience}
          >
            {experience && (
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {experience.description as string}
              </p>
            )}
          </ReviewSection>

          <ReviewSection
            title="7. Motivation & Alignment"
            editRoute={ROUTES.DASHBOARD.MOTIVATION}
            complete={completion.motivation}
          >
            {motivation && (
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {motivation.essay_response as string}
              </p>
            )}
          </ReviewSection>

          <ReviewSection
            title="8. Availability & Commitment"
            editRoute={ROUTES.DASHBOARD.AVAILABILITY}
            complete={completion.availability}
          >
            {availability && (
              <div className="text-sm">
                <Field
                  label="Available Jul-Aug 2026"
                  value={availability.available_july_aug_2026 ? "Yes" : "No"}
                />
              </div>
            )}
          </ReviewSection>

          <ReviewSection
            title="9. Documents & References"
            editRoute={ROUTES.DASHBOARD.DOCUMENTS}
            complete={completion.documents}
          >
            <div className="text-sm space-y-2">
              {docs.map((d) => (
                <Field
                  key={d.document_type as string}
                  label={d.document_type as string}
                  value={(d.file_name as string) || "Uploaded"}
                />
              ))}
              {refs.map((r) => (
                <Field
                  key={r.reference_type as string}
                  label={`${r.reference_type} Ref`}
                  value={`${r.name} - ${r.email || ""}`}
                />
              ))}
            </div>
          </ReviewSection>

          <ReviewSection
            title="10. Video Submission"
            editRoute={ROUTES.DASHBOARD.VIDEO}
            complete={completion.video}
          >
            <div className="text-sm">
              {docs.find((d) => d.document_type === "Video") ? (
                <Field label="Video" value="Uploaded" />
              ) : (
                <p className="text-muted-foreground">No video uploaded</p>
              )}
            </div>
          </ReviewSection>
        </>
      )}

      {/* Submit section */}
      <Card
        className={allComplete ? "border-yap-accent/30" : "border-amber-300"}
      >
        <CardContent className="pt-6">
          {!allComplete ? (
            <div className="flex items-center gap-3 text-amber-600">
              <AlertTriangle className="w-5 h-5" />
              <p className="text-sm font-medium">
                Please complete all sections before submitting your application.
              </p>
            </div>
          ) : showConfirm ? (
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium">Are you sure?</p>
                  <p className="text-muted-foreground mt-1">
                    Once submitted, you cannot edit your application. Please
                    make sure all information is accurate.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <ButtonPrimary
                  variant="outline"
                  onClick={() => setShowConfirm(false)}
                >
                  Cancel
                </ButtonPrimary>
                <ButtonPrimary onClick={handleSubmit} loading={isSubmitting}>
                  <Send className="w-4 h-4 mr-2" />
                  Yes, Submit Application
                </ButtonPrimary>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <ButtonPrimary
                onClick={() => setShowConfirm(true)}
                className="px-10"
              >
                <Send className="w-4 h-4 mr-2" />
                Submit Application
              </ButtonPrimary>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ReviewSection({
  title,
  editRoute,
  complete,
  children,
}: {
  title: string;
  editRoute: string;
  complete: boolean;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {complete ? (
              <CheckCircle2 className="w-4 h-4 text-yap-accent" />
            ) : (
              <XCircle className="w-4 h-4 text-red-400" />
            )}
            <CardTitle className="text-sm font-semibold">{title}</CardTitle>
          </div>
          <Link
            href={editRoute}
            className="text-xs text-yap-accent hover:underline inline-flex items-center gap-1"
          >
            <Pencil className="w-3 h-3" />
            Edit
          </Link>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function Field({ label, value }: { label: string; value: string | boolean }) {
  const displayValue =
    typeof value === "boolean" ? (value ? "Yes" : "No") : value;
  return (
    <div>
      <span className="text-muted-foreground">{label}: </span>
      <span className="font-medium">{displayValue || "—"}</span>
    </div>
  );
}
