import { z } from "zod";

const wordCount = (text: string) => {
  if (!text || !text.trim()) return 0;
  return text.trim().split(/\s+/).length;
};

export const motivationSchema = z.object({
  essay_response: z
    .string()
    .min(1, "Please write your motivation essay")
    .refine((val) => wordCount(val) <= 150, {
      message: "Essay must not exceed 150 words",
    }),
});

export type MotivationInput = z.infer<typeof motivationSchema>;
