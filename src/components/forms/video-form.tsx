"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ROUTES } from "@/lib/routes";
import { SectionWrapper } from "@/components/forms/section-wrapper";
import { FileUpload } from "@/components/ui/file-upload";
import { ButtonPrimary } from "@/components/ui/button-primary";
import { Card, CardContent } from "@/components/ui/card";
import { Save, Video, AlertCircle } from "lucide-react";

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

interface VideoFormProps {
  applicationId: string;
  existingVideo?: { fileName: string; filePath: string } | null;
}

/** Extract Google Drive file ID from a Drive URL */
function extractDriveFileId(url: string): string | null {
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

export function VideoForm({ applicationId, existingVideo }: VideoFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [uploaded, setUploaded] = useState(!!existingVideo);
  const [videoPath, setVideoPath] = useState(existingVideo?.filePath || "");

  const previewUrl = useMemo(() => {
    if (!videoPath) return null;
    const fileId = extractDriveFileId(videoPath);
    return fileId ? `https://drive.google.com/file/d/${fileId}/preview` : null;
  }, [videoPath]);

  async function onSave() {
    setIsLoading(true);
    try {
      router.push(ROUTES.DASHBOARD.REVIEW);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <SectionWrapper sectionKey="video" title="Video Submission" description="">
      <div className="space-y-6">
        {/* Instructions */}
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="pt-5 pb-4">
            <div className="flex gap-3">
              <Video className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="text-sm text-blue-700">
                <p className="font-medium">Video Guidelines</p>
                <p className="mt-2">
                  YAP is a highly competitive six-week residential internship
                  programme designed to develop participants&apos; professional
                  competence, leadership capacity, and meaningful community
                  impact.
                </p>
                <p className="mt-2">
                  Share what genuinely motivates you to be part of this
                  programme, how you believe this experience will contribute to
                  your professional growth and long-term aspirations, and in
                  what ways you intend to use the skills, exposure, and learning
                  gained to create a positive and lasting impact within your
                  community. Your video response should reflect clarity and
                  demonstrate your understanding of the values and rigor of the
                  programme.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="pt-5 pb-4">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-sm text-amber-700">
                <p className="font-medium">Instructions</p>
                <ul className="mt-2 space-y-1 list-disc pl-4">
                  <li>Language can be Urdu or English</li>
                  <li>Should have your own genuine thoughts</li>
                  <li>Don&apos;t read from the screen</li>
                  <li>Record a video (maximum 2 minutes)</li>
                  <li>Maximum file size: 40MB</li>
                  <li>Accepted format: MP4</li>
                  <li>
                    If your video is under 2 minutes but exceeds the 40MB limit,
                    please compress the video before uploading.
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="text-xs text-muted-foreground">
          Video upload is optional.
        </p>

        <FileUpload
          label="Upload Video (Optional)"
          accept=".mp4"
          maxSize={40 * 1024 * 1024}
          maxDuration={120}
          uploadUrl={ROUTES.API.UPLOAD}
          videoUploadSessionUrl={ROUTES.API.VIDEO_UPLOAD_SESSION}
          videoUploadCompleteUrl={ROUTES.API.VIDEO_UPLOAD_COMPLETE}
          uploadParams={{ applicationId, documentType: "Video" }}
          currentFile={
            existingVideo
              ? { name: existingVideo.fileName, path: existingVideo.filePath }
              : null
          }
          fileType="Video"
          onUploadComplete={(fileInfo) => {
            setUploaded(true);
            if (fileInfo?.path) setVideoPath(fileInfo.path);
          }}
          onRemove={async () => {
            await deleteUploadedFile(applicationId, "Video");
            setUploaded(false);
            setVideoPath("");
            toast.success("Video removed");
          }}
        />

        {/* Video Preview */}
        {uploaded && previewUrl && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-yap-primary">
              Video Preview
            </h3>
            <div className="rounded-lg overflow-hidden border border-gray-200 bg-black aspect-video">
              <iframe
                src={previewUrl}
                className="w-full h-full"
                allow="autoplay; encrypted-media"
                allowFullScreen
                title="Video Preview"
              />
            </div>
          </div>
        )}

        {!uploaded && (
          <div className="flex items-center gap-2 text-sm text-amber-600">
            <AlertCircle className="w-4 h-4" />
            <span>You can continue without uploading a video.</span>
          </div>
        )}

        <div className="flex justify-end pt-4">
          <ButtonPrimary onClick={onSave} loading={isLoading}>
            <Save className="w-4 h-4 mr-2" />
            Save & Continue to Review
          </ButtonPrimary>
        </div>
      </div>
    </SectionWrapper>
  );
}
