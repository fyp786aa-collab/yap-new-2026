"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface DobPickerProps {
  value: string; // "YYYY-MM-DD" or ""
  onChange: (value: string) => void;
  error?: string;
  label?: string;
  required?: boolean;
  minYear?: number;
  maxYear?: number;
}

const MONTHS = [
  { value: "01", label: "Jan" },
  { value: "02", label: "Feb" },
  { value: "03", label: "Mar" },
  { value: "04", label: "Apr" },
  { value: "05", label: "May" },
  { value: "06", label: "Jun" },
  { value: "07", label: "Jul" },
  { value: "08", label: "Aug" },
  { value: "09", label: "Sep" },
  { value: "10", label: "Oct" },
  { value: "11", label: "Nov" },
  { value: "12", label: "Dec" },
];

function getDaysInMonth(month: number, year: number): number {
  if (!month || !year) return 31;
  return new Date(year, month, 0).getDate();
}

export function DobPicker({
  value,
  onChange,
  error,
  label = "Date of Birth",
  required,
  minYear = 2002,
  maxYear = 2008,
}: DobPickerProps) {
  // Parse current value
  const [selectedYear, selectedMonth, selectedDay] = useMemo(() => {
    if (!value) return ["", "", ""];
    const parts = value.split("-");
    if (parts.length !== 3) return ["", "", ""];
    return [parts[0], parts[1], parts[2]];
  }, [value]);

  // Generate year options (descending for easier selection)
  const years = useMemo(() => {
    const result: number[] = [];
    for (let y = maxYear; y >= minYear; y--) {
      result.push(y);
    }
    return result;
  }, [minYear, maxYear]);

  // Generate day options based on selected month/year
  const days = useMemo(() => {
    const month = parseInt(selectedMonth) || 0;
    const year = parseInt(selectedYear) || 0;
    const maxDays = getDaysInMonth(month, year);
    const result: number[] = [];
    for (let d = 1; d <= maxDays; d++) {
      result.push(d);
    }
    return result;
  }, [selectedMonth, selectedYear]);

  function handleChange(part: "year" | "month" | "day", val: string) {
    let year = selectedYear;
    let month = selectedMonth;
    let day = selectedDay;

    if (part === "year") year = val;
    if (part === "month") month = val;
    if (part === "day") day = val;

    // If all parts are selected, emit the full date string
    if (year && month && day) {
      // Clamp day if month/year changed and day exceeds max
      const maxDays = getDaysInMonth(parseInt(month), parseInt(year));
      const clampedDay = Math.min(parseInt(day), maxDays);
      const dayStr = String(clampedDay).padStart(2, "0");
      onChange(`${year}-${month}-${dayStr}`);
    } else if (year || month || day) {
      // Partial — store what we can so selections are preserved
      const y = year || "0000";
      const m = month || "00";
      const d = day || "00";
      onChange(`${y}-${m}-${d}`);
    } else {
      onChange("");
    }
  }

  const selectClass = cn(
    "h-10 border border-gray-300 rounded-lg px-3 py-2 w-full transition-all duration-200 bg-white appearance-none",
    "focus:border-yap-accent focus:ring-1 focus:ring-yap-accent focus:outline-none",
    "text-sm",
    error &&
      "border-yap-error bg-red-50 focus:ring-yap-error focus:border-yap-error",
  );

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-yap-primary">
          {label}
          {required && <span className="text-yap-error ml-0.5">*</span>}
        </label>
      )}
      <div className="grid grid-cols-3 gap-2">
        {/* Day */}
        <select
          value={selectedDay}
          onChange={(e) => handleChange("day", e.target.value)}
          className={selectClass}
          aria-label="Day"
        >
          <option value="">Day</option>
          {days.map((d) => (
            <option key={d} value={String(d).padStart(2, "0")}>
              {d}
            </option>
          ))}
        </select>

        {/* Month */}
        <select
          value={selectedMonth}
          onChange={(e) => handleChange("month", e.target.value)}
          className={selectClass}
          aria-label="Month"
        >
          <option value="">Month</option>
          {MONTHS.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>

        {/* Year */}
        <select
          value={selectedYear}
          onChange={(e) => handleChange("year", e.target.value)}
          className={selectClass}
          aria-label="Year"
        >
          <option value="">Year</option>
          {years.map((y) => (
            <option key={y} value={String(y)}>
              {y}
            </option>
          ))}
        </select>
      </div>
      {error && (
        <p className="text-yap-error text-sm mt-1 animate-fade-in">{error}</p>
      )}
    </div>
  );
}
