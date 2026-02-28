"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  error?: string;
  max?: number;
}

export function StarRating({
  label,
  value,
  onChange,
  error,
  max = 5,
}: StarRatingProps) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-[#152232]">
        {label} <span className="text-[#dc2626] ml-0.5">*</span>
      </label>
      <div className="flex items-center gap-1">
        {Array.from({ length: max }, (_, i) => i + 1).map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="p-0.5 transition-transform duration-150 hover:scale-125 focus:outline-none"
          >
            <Star
              className={cn(
                "h-6 w-6 transition-colors duration-200",
                star <= value
                  ? "fill-[#82a845] text-[#82a845]"
                  : "fill-gray-200 text-gray-300",
              )}
            />
          </button>
        ))}
        <span className="ml-2 text-sm text-gray-500">
          {value > 0 ? `${value}/${max}` : "Not rated"}
        </span>
      </div>
      {error && (
        <p className="text-[#dc2626] text-sm mt-1 animate-fade-in">{error}</p>
      )}
    </div>
  );
}
