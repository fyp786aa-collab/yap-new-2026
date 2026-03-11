import { requireAuth } from "@/lib/session";
import { getApplicationByUserId } from "@/lib/db-queries/applications";
import { getApplicantByUserId } from "@/lib/db-queries/applicants";
import { createApplicant } from "@/lib/db-queries/applicants";
import { createApplication } from "@/lib/db-queries/applications";
import { getSectionCompletion } from "@/lib/db-queries/applications";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { TopBar } from "@/components/layout/top-bar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { publicApplicationStatus } from "@/lib/public-application-status";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAuth();

  // Fetch applicant + application in parallel
  let [applicant, application] = await Promise.all([
    getApplicantByUserId(user.id),
    getApplicationByUserId(user.id),
  ]);

  if (!applicant) {
    const result = await createApplicant(user.id, user.email);
    if (!result.success || !result.data) {
      throw new Error("Failed to create applicant profile");
    }
    applicant = result.data;
  }

  if (!application) {
    const result = await createApplication(applicant.id);
    if (!result.success || !result.data) {
      throw new Error("Failed to create application");
    }
    application = result.data;
  }

  // Determine display status for applicants (only Draft or Submitted)
  const isApplicant = user.role === "applicant";
  const displayStatus = isApplicant
    ? publicApplicationStatus(application.status)
    : application.status;

  // If applicant and submitted, other pages may redirect accordingly
  if (isApplicant && displayStatus === "Submitted") {
    // We'll let the submitted page render; other pages will check
  }

  const completion = await getSectionCompletion(application.id);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar
          userEmail={user.email}
          completion={completion}
          applicationStatus={displayStatus}
          consentGiven={application.consent_given}
        />
        <div className="flex-1 flex flex-col min-h-screen">
          <TopBar userEmail={user.email} applicationStatus={displayStatus} />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-gray-50/50">
            <div className="max-w-4xl mx-auto">{children}</div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
