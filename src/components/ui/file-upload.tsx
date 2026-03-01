"use client";

import { useRef, useState } from "react";
import { Upload, X, FileText, Film, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatFileSize } from "@/lib/utils/formatters";
import { ButtonPrimary } from "./button-primary";

interface FileUploadProps {
  label: string;
  accept: string;
  maxSize: number;
  error?: string;
  currentFile?: { name: string; path: string } | null;
  onUpload?: (file: File) => Promise<void>;
  uploadUrl?: string;
  uploadParams?: Record<string, string>;
  onUploadComplete?: (fileInfo?: { name: string; path: string }) => void;
  onRemove?: () => Promise<void> | void;
  loading?: boolean;
  fileType?: "CV" | "Transcript" | "Video";
  required?: boolean;
}

export function FileUpload({
  label,
  accept,
  maxSize,
  error,
  currentFile,
  onUpload,
  uploadUrl,
  uploadParams,
  onUploadComplete,
  onRemove,
  loading: externalLoading,
  fileType,
  required,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [localError, setLocalError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    path: string;
  } | null>(currentFile ?? null);

  const loading = externalLoading || uploading;

  const handleFile = async (file: File) => {
    setLocalError("");

    if (file.size > maxSize) {
      setLocalError(`File size must be under ${formatFileSize(maxSize)}`);
      return;
    }

    const acceptTypes = accept.split(",").map((t) => t.trim());
    const matchesType = acceptTypes.some((type) => {
      if (type.startsWith(".")) {
        return file.name.toLowerCase().endsWith(type);
      }
      return file.type === type || file.type.startsWith(type.replace("*", ""));
    });

    if (!matchesType) {
      setLocalError("Invalid file type");
      return;
    }

    if (uploadUrl) {
      setUploading(true);
      setProgress(0);
      try {
        const formData = new FormData();
        formData.append("file", file);
        if (uploadParams) {
          Object.entries(uploadParams).forEach(([k, v]) =>
            formData.append(k, v),
          );
        }

        const data = await new Promise<any>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open("POST", uploadUrl);

          xhr.upload.addEventListener("progress", (e) => {
            if (e.lengthComputable) {
              const pct = Math.round((e.loaded / e.total) * 100);
              setProgress(pct);
            }
          });

          xhr.addEventListener("load", () => {
            try {
              const json = JSON.parse(xhr.responseText);
              if (xhr.status >= 200 && xhr.status < 300) {
                resolve(json);
              } else {
                reject(new Error(json.error || "Upload failed"));
              }
            } catch {
              reject(new Error("Upload failed"));
            }
          });

          xhr.addEventListener("error", () =>
            reject(new Error("Upload failed. Please try again.")),
          );
          xhr.addEventListener("abort", () =>
            reject(new Error("Upload cancelled")),
          );

          xhr.send(formData);
        });

        setUploadedFile({ name: file.name, path: data.filePath || "" });
        onUploadComplete?.({ name: file.name, path: data.filePath || "" });
      } catch (err: any) {
        setLocalError(err?.message || "Upload failed. Please try again.");
      } finally {
        setUploading(false);
        setProgress(0);
      }
    } else if (onUpload) {
      await onUpload(file);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) await handleFile(file);
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await handleFile(file);
    if (inputRef.current) inputRef.current.value = "";
  };

  const FileIcon = fileType === "Video" ? Film : FileText;
  const displayFile = uploadedFile || currentFile;

  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-[#152232]">
        {label} {required && <span className="text-[#dc2626] ml-0.5">*</span>}
      </label>

      {displayFile ? (
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg animate-scale-in">
          <FileIcon className="h-8 w-8 text-[#82a845] shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[#152232] truncate">
              {displayFile.name}
            </p>
            <p className="text-xs text-gray-500">Uploaded successfully</p>
          </div>
          {onRemove && (
            <button
              type="button"
              disabled={removing}
              onClick={async () => {
                setRemoving(true);
                try {
                  await onRemove();
                  setUploadedFile(null);
                } catch {
                  // ignore – parent handles errors
                } finally {
                  setRemoving(false);
                }
              }}
              className="p-1.5 text-gray-400 hover:text-[#dc2626] transition-colors rounded-full hover:bg-red-50 disabled:opacity-50"
            >
              {removing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <X className="h-4 w-4" />
              )}
            </button>
          )}
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 cursor-pointer",
            dragOver
              ? "border-[#82a845] bg-green-50"
              : "border-gray-300 hover:border-[#82a845] hover:bg-gray-50",
            (error || localError) && "border-[#dc2626] bg-[#fef2f2]",
          )}
          onClick={() => inputRef.current?.click()}
        >
          <Upload
            className={cn(
              "h-10 w-10 mx-auto mb-3",
              dragOver ? "text-[#82a845]" : "text-gray-400",
            )}
          />
          <p className="text-sm font-medium text-[#152232] mb-1">
            {loading
              ? "Uploading..."
              : "Drop your file here or click to browse"}
          </p>
          <p className="text-xs text-gray-500">
            Max size: {formatFileSize(maxSize)} •{" "}
            {accept.replace(/\./g, "").toUpperCase()}
          </p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />

      {(error || localError) && (
        <p className="text-[#dc2626] text-sm mt-1 animate-fade-in">
          {error || localError}
        </p>
      )}

      {loading && (
        <div className="mt-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500">Uploading...</span>
            <span className="text-xs font-medium text-[#82a845]">
              {progress}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-[#82a845] h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
