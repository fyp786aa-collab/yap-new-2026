import { requireAuth } from "@/lib/session";
import { getApplicationByUserId } from "@/lib/db-queries/applications";
import { getApplicantByUserId } from "@/lib/db-queries/applicants";
import { createApplicant } from "@/lib/db-queries/applicants";
import { createApplication } from "@/lib/db-queries/applications";
import { getSectionCompletion } from "@/lib/db-queries/applications";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { TopBar } from "@/components/layout/top-bar";
import { SidebarProvider } from "@/components/ui/sidebar";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAuth();

  // Ensure applicant + application records exist
  let applicant = await getApplicantByUserId(user.id);
  if (!applicant) {
    const result = await createApplicant(user.id, user.email);
    if (!result.success || !result.data) {
      throw new Error("Failed to create applicant profile");
    }
    applicant = result.data;
  }

  let application = await getApplicationByUserId(user.id);
  if (!application) {
    const result = await createApplication(applicant.id);
    if (!result.success || !result.data) {
      throw new Error("Failed to create application");
    }
    application = result.data;
  }

  // If submitted, redirect to submitted page (unless already there)
  if (application.status === "Submitted") {
    // We'll let the submitted page render; other pages will check
  }

  const completion = await getSectionCompletion(application.id);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar
          userEmail={user.email}
          completion={completion}
          applicationStatus={application.status}
        />
        <div className="flex-1 flex flex-col min-h-screen">
          <TopBar
            userEmail={user.email}
            applicationStatus={application.status}
          />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-gray-50/50">
            <div className="max-w-4xl mx-auto">{children}</div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
