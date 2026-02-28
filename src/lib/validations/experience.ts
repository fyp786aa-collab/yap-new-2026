import { z } from "zod";

const wordCount = (text: string) => {
  if (!text || !text.trim()) return 0;
  return text.trim().split(/\s+/).length;
};

export const experienceSchema = z.object({
  description: z
    .string()
    .min(1, "Please describe your experience")
    .refine((val) => wordCount(val) <= 150, {
      message: "Description must not exceed 150 words",
    }),
});

export type ExperienceInput = z.infer<typeof experienceSchema>;
