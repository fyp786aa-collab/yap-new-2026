"use client";

import { forwardRef, SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface FormSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  options: Array<{ value: string | number; label: string }>;
  placeholder?: string;
}

const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(
  ({ className, label, error, options, placeholder, id, ...props }, ref) => {
    const selectId = id || label.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="space-y-1.5">
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-[#152232]"
        >
          {label}
          {props.required && <span className="text-[#dc2626] ml-0.5">*</span>}
        </label>
        <select
          ref={ref}
          id={selectId}
          className={cn(
            "border border-gray-300 rounded-lg px-4 py-2.5 w-full transition-all duration-200 bg-white",
            "focus:border-[#82a845] focus:ring-1 focus:ring-[#82a845] focus:outline-none",
            error &&
              "border-[#dc2626] bg-[#fef2f2] focus:ring-[#dc2626] focus:border-[#dc2626]",
            className,
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="text-[#dc2626] text-sm mt-1 animate-fade-in">{error}</p>
        )}
      </div>
    );
  },
);

FormSelect.displayName = "FormSelect";

export { FormSelect };
