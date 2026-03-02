"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  documentsSchema,
  type DocumentsInput,
} from "@/lib/validations/documents";
import { saveDocumentsAction } from "@/actions/application.actions";
import { ROUTES } from "@/lib/routes";
import { SectionWrapper } from "@/components/forms/section-wrapper";
import { FormInput } from "@/components/ui/form-input";
import { FileUpload } from "@/components/ui/file-upload";
import { ButtonPrimary } from "@/components/ui/button-primary";
import { Separator } from "@/components/ui/separator";
import { Save } from "lucide-react";

async function deleteUploadedFile(applicationId: string, documentType: string) {
  const res = await fetch(ROUTES.API.DELETE_UPLOAD, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ applicationId, documentType }),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Failed to remove file");
  }
}

interface DocumentsFormProps {
  applicationId: string;
  defaultValues?: Partial<DocumentsInput>;
  existingCV?: { fileName: string; filePath: string } | null;
  existingTranscript?: { fileName: string; filePath: string } | null;
}

export function DocumentsForm({
  applicationId,
  defaultValues,
  existingCV,
  existingTranscript,
}: DocumentsFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [cvUploaded, setCvUploaded] = useState(!!existingCV);
  const [transcriptUploaded, setTranscriptUploaded] =
    useState(!!existingTranscript);
  const [cvError, setCvError] = useState("");
  const [transcriptError, setTranscriptError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty: formIsDirty },
  } = useForm<DocumentsInput>({
    resolver: zodResolver(documentsSchema),
    defaultValues: {
      academic_ref_name: "",
      academic_ref_position: "",
      academic_ref_contact: "",
      academic_ref_email: "",
      supervisor_ref_name: "",
      supervisor_ref_position: "",
      supervisor_ref_contact: "",
      supervisor_ref_email: "",
      ...defaultValues,
    },
  });

  async function onSubmit(data: DocumentsInput) {
    // Validate required file uploads
    let hasFileError = false;
    if (!cvUploaded) {
      setCvError("CV/Resume is required. Please upload your CV.");
      hasFileError = true;
    }
    if (!transcriptUploaded) {
      setTranscriptError(
        "Academic transcript is required. Please upload your transcript.",
      );
      hasFileError = true;
    }
    if (hasFileError) return;

    setIsLoading(true);
    try {
      const result = await saveDocumentsAction(data);
      if (result.success) {
        toast.success("Documents & references saved!");
        router.push(ROUTES.DASHBOARD.VIDEO);
      } else {
        toast.error(result.error || "Failed to save");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <SectionWrapper
      sectionKey="documents"
      title="Documents & References"
      description="Upload your documents and provide references"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* File Uploads */}
        <div>
          <h3 className="text-sm font-semibold text-yap-primary mb-3">
            Upload Documents
          </h3>
          <div className="space-y-4">
            <FileUpload
              label="CV/Resume"
              accept=".pdf,.doc,.docx"
              maxSize={5 * 1024 * 1024}
              uploadUrl={ROUTES.API.UPLOAD}
              uploadParams={{ applicationId, documentType: "CV" }}
              currentFile={
                existingCV
                  ? { name: existingCV.fileName, path: existingCV.filePath }
                  : null
              }
              required
              error={cvError}
              onUploadComplete={() => {
                setCvUploaded(true);
                setCvError("");
              }}
              onRemove={async () => {
                await deleteUploadedFile(applicationId, "CV");
                setCvUploaded(false);
              }}
            />
            <FileUpload
              label="Academic Transcript"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              maxSize={10 * 1024 * 1024}
              uploadUrl={ROUTES.API.UPLOAD}
              uploadParams={{ applicationId, documentType: "Transcript" }}
              currentFile={
                existingTranscript
                  ? {
                      name: existingTranscript.fileName,
                      path: existingTranscript.filePath,
                    }
                  : null
              }
              required
              error={transcriptError}
              onUploadComplete={() => {
                setTranscriptUploaded(true);
                setTranscriptError("");
              }}
              onRemove={async () => {
                await deleteUploadedFile(applicationId, "Transcript");
                setTranscriptUploaded(false);
              }}
            />
          </div>
        </div>

        <Separator />

        {/* Academic Reference */}
        <div>
          <h3 className="text-sm font-semibold text-yap-primary mb-3">
            Academic Reference (Required)
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormInput
              label="Name"
              required
              error={errors.academic_ref_name?.message}
              {...register("academic_ref_name")}
            />
            <FormInput
              label="Position/Title"
              required
              error={errors.academic_ref_position?.message}
              {...register("academic_ref_position")}
            />
            <FormInput
              label="Contact Number"
              required
              error={errors.academic_ref_contact?.message}
              {...register("academic_ref_contact")}
            />
            <FormInput
              label="Email"
              type="email"
              required
              error={errors.academic_ref_email?.message}
              {...register("academic_ref_email")}
            />
          </div>
        </div>

        <Separator />

        {/* Supervisor Reference */}
        <div>
          <h3 className="text-sm font-semibold text-yap-primary mb-3">
            Supervisor / Volunteer Reference (Optional)
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormInput
              label="Name"
              error={errors.supervisor_ref_name?.message}
              {...register("supervisor_ref_name")}
            />
            <FormInput
              label="Position/Title"
              error={errors.supervisor_ref_position?.message}
              {...register("supervisor_ref_position")}
            />
            <FormInput
              label="Contact Number"
              error={errors.supervisor_ref_contact?.message}
              {...register("supervisor_ref_contact")}
            />
            <FormInput
              label="Email"
              type="email"
              error={errors.supervisor_ref_email?.message}
              {...register("supervisor_ref_email")}
            />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <ButtonPrimary
            type="submit"
            loading={isLoading}
            disabled={!formIsDirty && cvUploaded && transcriptUploaded}
          >
            <Save className="w-4 h-4 mr-2" />
            Save & Continue
          </ButtonPrimary>
        </div>
      </form>
    </SectionWrapper>
  );
}
