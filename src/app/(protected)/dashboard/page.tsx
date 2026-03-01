import { requireAuth } from "@/lib/session";
import {
  getApplicationByUserId,
  getSectionCompletion,
} from "@/lib/db-queries/applications";
import { getApplicantByUserId } from "@/lib/db-queries/applicants";
import { redirect } from "next/navigation";
import { ROUTES, SECTION_ORDER } from "@/lib/routes";
import { APP_NAME, COHORT_YEAR } from "@/lib/constants";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2,
  Circle,
  ArrowRight,
  FileCheck,
  AlertCircle,
} from "lucide-react";
import type { SectionCompletion } from "@/types";

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

export const metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const user = await requireAuth();
  const application = await getApplicationByUserId(user.id);

  // Redirect to consent if no application or applicant hasn't started the form
  if (!application) {
    redirect(ROUTES.DASHBOARD.CONSENT);
  }

  const applicant = await getApplicantByUserId(user.id);
  if (!applicant?.full_name) {
    redirect(ROUTES.DASHBOARD.CONSENT);
  }

  if (application.status === "Submitted") {
    redirect(ROUTES.DASHBOARD.SUBMITTED);
  }

  // Check if consent was given (application exists = consent given)
  const completion = await getSectionCompletion(application.id);
  const completedCount = Object.values(completion).filter(Boolean).length;
  const progressPercent = (completedCount / 10) * 100;

  // Find first incomplete section
  const firstIncomplete = SECTION_ORDER.find((s) => {
    const key = COMPLETION_KEY_MAP[s.key];
    return key && !completion[key];
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-yap-primary">
          Welcome to {APP_NAME}
        </h1>
        <p className="text-muted-foreground mt-1">
          Complete all 10 sections below to submit your application for YAP{" "}
          {COHORT_YEAR}.
        </p>
      </div>

      {/* Progress Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Application Progress</CardTitle>
              <CardDescription>
                {completedCount} of 10 sections completed
              </CardDescription>
            </div>
            <div className="text-2xl font-bold text-yap-accent">
              {Math.round(progressPercent)}%
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={progressPercent} className="h-2" />
          {completedCount === 10 ? (
            <div className="mt-4 flex items-center gap-2 text-sm text-green-600">
              <FileCheck className="w-4 h-4" />
              All sections complete! You can now review and submit your
              application.
            </div>
          ) : firstIncomplete ? (
            <div className="mt-4">
              <Link
                href={firstIncomplete.route}
                className="text-sm text-yap-accent hover:underline inline-flex items-center gap-1"
              >
                Continue with {firstIncomplete.label}
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Important Notice */}
      <Card className="border-amber-200 bg-amber-50/50">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-amber-800">Important</p>
              <p className="text-amber-700 mt-1">
                Remember to click <strong>Save &amp; Continue</strong> to save
                your progress before leaving a section. You can close the
                browser and return to complete your application at any time.
                Once submitted, you cannot make further changes.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section Grid */}
      <div className="grid gap-3 sm:grid-cols-2">
        {SECTION_ORDER.map((section) => {
          const completionKey = COMPLETION_KEY_MAP[section.key];
          const isComplete = completionKey ? completion[completionKey] : false;

          return (
            <Link key={section.key} href={section.route}>
              <Card className="hover:shadow-md hover:border-yap-accent/30 transition-all duration-200 cursor-pointer group h-full">
                <CardContent className="pt-5 pb-4 px-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      {isComplete ? (
                        <CheckCircle2 className="w-5 h-5 text-yap-accent shrink-0 mt-0.5" />
                      ) : (
                        <Circle className="w-5 h-5 text-muted-foreground/40 shrink-0 mt-0.5" />
                      )}
                      <div className="min-w-0">
                        <p className="font-medium text-sm text-foreground group-hover:text-yap-primary transition-colors">
                          {section.section}. {section.label}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {isComplete ? "Completed" : "Not started"}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-yap-accent transition-colors shrink-0 mt-1" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Review button */}
      {completedCount === 10 && (
        <div className="flex justify-center pt-4">
          <Link
            href={ROUTES.DASHBOARD.REVIEW}
            className="inline-flex items-center gap-2 bg-yap-accent text-white font-medium px-8 py-3 rounded-lg hover:bg-yap-accent-hover transition-colors shadow-lg shadow-yap-accent/25"
          >
            Review & Submit Application
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
