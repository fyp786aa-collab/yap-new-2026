import type { ApplicationStatus } from "@/types";

export function publicApplicationStatus(
  s: ApplicationStatus,
): ApplicationStatus {
  return s === "Draft" ? "Draft" : "Submitted";
}

export default publicApplicationStatus;
