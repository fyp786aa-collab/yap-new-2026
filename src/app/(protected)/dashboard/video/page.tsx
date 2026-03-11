import { requireAuth } from "@/lib/session";
import { getApplicationByUserId } from "@/lib/db-queries/applications";
import { publicApplicationStatus } from "@/lib/public-application-status";
import { getDocumentsByApplication } from "@/lib/db-queries/sections";
import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/routes";
import { VideoForm } from "@/components/forms/video-form";

export const metadata = { title: "Video Submission" };

export default async function VideoPage() {
  const user = await requireAuth();
  const application = await getApplicationByUserId(user.id);
  if (!application || !application.consent_given)
    redirect(ROUTES.DASHBOARD.CONSENT);
  const isApplicant = user.role === "applicant";
  const displayStatus = isApplicant
    ? publicApplicationStatus(application.status)
    : application.status;

  if (displayStatus === "Submitted") redirect(ROUTES.DASHBOARD.SUBMITTED);

  const documents = await getDocumentsByApplication(application.id);
  const videoDoc = documents.find((d) => d.document_type === "Video");

  return (
    <VideoForm
      applicationId={application.id}
      existingVideo={
        videoDoc
          ? { fileName: videoDoc.file_name, filePath: videoDoc.file_path }
          : null
      }
    />
  );
}
