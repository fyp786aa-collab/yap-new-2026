"use client";

import { forwardRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

interface FormSelectProps {
  label: string;
  error?: string;
  options: Array<{ value: string | number; label: string }>;
  placeholder?: string;
  // Allow react-hook-form register props to be spread in
  name?: string;
  onChange?: (e: any) => void;
  onBlur?: () => void;
  value?: string | number;
  defaultValue?: string | number;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

const FormSelect = forwardRef<HTMLInputElement, FormSelectProps>(
  (
    {
      className,
      label,
      error,
      options,
      placeholder,
      name,
      onChange,
      onBlur,
      value,
      defaultValue,
      required,
      disabled,
    },
    ref,
  ) => {
    const selectId = name || label.toLowerCase().replace(/\s+/g, "-");
    const [val, setVal] = useState<string>(
      value != null && value !== ""
        ? String(value)
        : defaultValue != null && defaultValue !== ""
          ? String(defaultValue)
          : "",
    );

    useEffect(() => {
      if (value != null && value !== "") setVal(String(value));
      else if (value === "" || value === undefined) setVal("");
    }, [value]);

    return (
      <div className="space-y-1.5">
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-[#152232]"
        >
          {label}
          {required && <span className="text-[#dc2626] ml-0.5">*</span>}
        </label>

        <Select
          value={val}
          disabled={disabled}
          onValueChange={(v) => {
            setVal(v);
            if (onChange) onChange({ target: { name, value: v } });
          }}
        >
          <SelectTrigger
            size="default"
            className={cn(
              // match FormInput height/rounding so selects and inputs align visually
              "h-10 rounded-lg border border-gray-300 px-4 py-2.5 w-full bg-white transition-all duration-200",
              "focus:border-[#82a845] focus:ring-1 focus:ring-[#82a845] focus:outline-none",
              error &&
                "border-[#dc2626] bg-[#fef2f2] focus:ring-[#dc2626] focus:border-[#dc2626]",
              className,
            )}
          >
            <SelectValue>
              {val
                ? options.find((o) => String(o.value) === val)?.label
                : placeholder || "Select..."}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {options.map((opt) => (
              <SelectItem key={opt.value} value={String(opt.value)}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* hidden native input so react-hook-form register works and browser validation isn't triggered */}
        <input
          ref={ref as any}
          type="hidden"
          id={selectId}
          name={name}
          value={val}
          onBlur={onBlur}
          onChange={() => {}}
        />

        {error && (
          <p className="text-[#dc2626] text-sm mt-1 animate-fade-in">{error}</p>
        )}
      </div>
    );
  },
);

FormSelect.displayName = "FormSelect";

export { FormSelect };
