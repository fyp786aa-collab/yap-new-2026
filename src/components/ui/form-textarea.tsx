"use client";

import { forwardRef, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { countWords } from "@/lib/utils/formatters";

interface FormTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  hint?: string;
  maxWords?: number;
  value?: string;
  disableCopyPaste?: boolean;
}

const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  (
    {
      className,
      label,
      error,
      hint,
      maxWords,
      value,
      disableCopyPaste,
      id,
      ...props
    },
    ref,
  ) => {
    const textareaId = id || label.toLowerCase().replace(/\s+/g, "-");
    const currentWords = value ? countWords(value) : 0;

    const handlePaste = (e: React.ClipboardEvent) => {
      if (disableCopyPaste) e.preventDefault();
    };

    const handleCopy = (e: React.ClipboardEvent) => {
      if (disableCopyPaste) e.preventDefault();
    };

    return (
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-[#152232]"
          >
            {label}
            {props.required && <span className="text-[#dc2626] ml-0.5">*</span>}
          </label>
          {maxWords && (
            <span
              className={cn(
                "text-xs",
                currentWords > maxWords
                  ? "text-[#dc2626] font-medium"
                  : "text-gray-500",
              )}
            >
              {currentWords}/{maxWords} words
            </span>
          )}
        </div>
        <textarea
          ref={ref}
          id={textareaId}
          value={value}
          onPaste={handlePaste}
          onCopy={handleCopy}
          className={cn(
            "border border-gray-300 rounded-lg px-4 py-2.5 w-full transition-all duration-200 resize-y min-h-[120px]",
            "focus:border-[#82a845] focus:ring-1 focus:ring-[#82a845] focus:outline-none",
            "placeholder:text-gray-400",
            error &&
              "border-[#dc2626] bg-[#fef2f2] focus:ring-[#dc2626] focus:border-[#dc2626]",
            className,
          )}
          {...props}
        />
        {error && (
          <p className="text-[#dc2626] text-sm mt-1 animate-fade-in">{error}</p>
        )}
        {hint && !error && <p className="text-gray-500 text-xs mt-1">{hint}</p>}
      </div>
    );
  },
);

FormTextarea.displayName = "FormTextarea";

export { FormTextarea };
