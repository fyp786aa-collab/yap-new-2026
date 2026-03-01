"use client";

import { forwardRef, InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ className, label, error, hint, id, required, ...rest }, ref) => {
    const inputId = id || label.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="space-y-1.5">
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-[#152232]"
        >
          {label}
          {required && <span className="text-[#dc2626] ml-0.5">*</span>}
        </label>
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "h-10 border border-gray-300 rounded-lg px-4 py-2 w-full transition-all duration-200",
            "focus:border-[#82a845] focus:ring-1 focus:ring-[#82a845] focus:outline-none",
            "placeholder:text-gray-400",
            error &&
              "border-[#dc2626] bg-[#fef2f2] focus:ring-[#dc2626] focus:border-[#dc2626]",
            className,
          )}
          {...rest}
        />
        {hint && !error && <p className="text-gray-500 text-xs mt-1">{hint}</p>}
        {error && (
          <p className="text-[#dc2626] text-sm mt-1 animate-fade-in">{error}</p>
        )}
      </div>
    );
  },
);

FormInput.displayName = "FormInput";

export { FormInput };
