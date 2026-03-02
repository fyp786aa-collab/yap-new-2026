import { z } from "zod";

const currentYear = new Date().getFullYear();

const voluntaryExperienceSchema = z.object({
  institution: z
    .string()
    .min(1, "Institution name is required")
    .max(200, "Institution name too long"),
  from_year: z.coerce
    .number()
    .min(2000, "Year must be 2000 or later")
    .max(currentYear, `Year cannot exceed ${currentYear}`),
  to_year: z.coerce
    .number()
    .min(2000, "Year must be 2000 or later")
    .max(currentYear + 1, `Year cannot exceed ${currentYear + 1}`),
  responsibility: z
    .string()
    .min(1, "Responsibility is required")
    .max(150, "Responsibility must be one line (max 150 characters)"),
});

export const experienceSchema = z.object({
  experiences: z
    .array(voluntaryExperienceSchema)
    .min(1, "Please add at least one voluntary experience")
    .max(5, "Maximum 5 voluntary experiences allowed")
    .refine((exps) => exps.every((e) => e.to_year >= e.from_year), {
      message: "To Year must be equal to or after From Year",
    }),
});

export type VoluntaryExperience = z.infer<typeof voluntaryExperienceSchema>;
export type ExperienceInput = z.infer<typeof experienceSchema>;
