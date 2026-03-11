import { requireAuth } from "@/lib/session";
import { getApplicationByUserId } from "@/lib/db-queries/applications";
import { publicApplicationStatus } from "@/lib/public-application-status";
import {
  getDocumentsByApplication,
  getReferences,
} from "@/lib/db-queries/sections";
import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/routes";
import { DocumentsForm } from "@/components/forms/documents-form";

export const metadata = { title: "Documents & References" };

export default async function DocumentsPage() {
  const user = await requireAuth();
  const application = await getApplicationByUserId(user.id);
  if (!application || !application.consent_given)
    redirect(ROUTES.DASHBOARD.CONSENT);
  const isApplicant = user.role === "applicant";
  const displayStatus = isApplicant
    ? publicApplicationStatus(application.status)
    : application.status;

  if (displayStatus === "Submitted") redirect(ROUTES.DASHBOARD.SUBMITTED);

  const [documents, references] = await Promise.all([
    getDocumentsByApplication(application.id),
    getReferences(application.id),
  ]);

  const cvDoc = documents.find((d) => d.document_type === "CV");
  const transcriptDoc = documents.find((d) => d.document_type === "Transcript");
  const academicRef = references.find((r) => r.reference_type === "Academic");
  const supervisorRef = references.find(
    (r) => r.reference_type === "Supervisor_Volunteer",
  );

  const defaults = {
    academic_ref_name: academicRef?.name || "",
    academic_ref_position: academicRef?.position || "",
    academic_ref_contact: academicRef?.contact_number || "",
    academic_ref_email: academicRef?.email || "",
    supervisor_ref_name: supervisorRef?.name || "",
    supervisor_ref_position: supervisorRef?.position || "",
    supervisor_ref_contact: supervisorRef?.contact_number || "",
    supervisor_ref_email: supervisorRef?.email || "",
  };

  return (
    <DocumentsForm
      applicationId={application.id}
      defaultValues={defaults}
      existingCV={
        cvDoc ? { fileName: cvDoc.file_name, filePath: cvDoc.file_path } : null
      }
      existingTranscript={
        transcriptDoc
          ? {
              fileName: transcriptDoc.file_name,
              filePath: transcriptDoc.file_path,
            }
          : null
      }
    />
  );
}
