"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ROUTES } from "@/lib/routes";
import { SectionWrapper } from "@/components/forms/section-wrapper";
import { FileUpload } from "@/components/ui/file-upload";
import { ButtonPrimary } from "@/components/ui/button-primary";
import { Card, CardContent } from "@/components/ui/card";
import { Save, Video, AlertCircle } from "lucide-react";

interface VideoFormProps {
  applicationId: string;
  existingVideo?: { fileName: string; filePath: string } | null;
}

export function VideoForm({ applicationId, existingVideo }: VideoFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [uploaded, setUploaded] = useState(!!existingVideo);

  async function onSave() {
    if (!uploaded) {
      toast.error("Please upload your video first");
      return;
    }
    setIsLoading(true);
    try {
      router.push(ROUTES.DASHBOARD.REVIEW);
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <SectionWrapper
      sectionKey="video"
      title="Video Submission"
      description="Record and upload a short introduction video"
    >
      <div className="space-y-6">
        {/* Instructions */}
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="pt-5 pb-4">
            <div className="flex gap-3">
              <Video className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="text-sm text-blue-700">
                <p className="font-medium">Video Guidelines</p>
                <ul className="mt-2 space-y-1 list-disc pl-4">
                  <li>Record a 1-2 minute introduction video</li>
                  <li>
                    Briefly introduce yourself and your motivation for YAP
                  </li>
                  <li>Speak clearly and face the camera</li>
                  <li>Maximum file size: 200MB</li>
                  <li>Accepted formats: MP4, MOV, AVI, WebM</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <FileUpload
          label="Introduction Video"
          accept=".mp4,.mov,.avi,.webm"
          maxSize={200 * 1024 * 1024}
          uploadUrl={ROUTES.API.UPLOAD}
          uploadParams={{ applicationId, documentType: "Video" }}
          currentFile={
            existingVideo
              ? { name: existingVideo.fileName, path: existingVideo.filePath }
              : null
          }
          required
          fileType="Video"
          onUploadComplete={() => setUploaded(true)}
        />

        {!uploaded && (
          <div className="flex items-center gap-2 text-sm text-amber-600">
            <AlertCircle className="w-4 h-4" />
            <span>Please upload your video to complete this section</span>
          </div>
        )}

        <div className="flex justify-end pt-4">
          <ButtonPrimary
            onClick={onSave}
            loading={isLoading}
            disabled={!uploaded}
          >
            <Save className="w-4 h-4 mr-2" />
            Save & Continue to Review
          </ButtonPrimary>
        </div>
      </div>
    </SectionWrapper>
  );
}
