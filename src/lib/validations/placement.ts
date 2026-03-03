import { z } from "zod";

const wordCount = (text: string) => {
  if (!text || !text.trim()) return 0;
  return text.trim().split(/\s+/).length;
};

export const placementSchema = z
  .object({
    willing_gilgit_chitral: z
      .boolean({
        error: "Please indicate your willingness",
      })
      .refine((val) => val === true, {
        message:
          "You must confirm your willingness to be placed in Gilgit or Chitral",
      }),
    stayed_away_before: z.boolean({
      error: "Please answer this question",
    }),
    stay_away_description: z.string().optional().default(""),
    medical_conditions: z.string().optional().default(""),
  })
  .refine(
    (data) => {
      if (data.stayed_away_before) {
        return (
          data.stay_away_description &&
          data.stay_away_description.trim().length > 0
        );
      }
      return true;
    },
    {
      message: "Please describe your experience",
      path: ["stay_away_description"],
    },
  )
  .refine(
    (data) => {
      if (data.medical_conditions && data.medical_conditions.trim()) {
        return wordCount(data.medical_conditions) <= 100;
      }
      return true;
    },
    {
      message: "Medical conditions must not exceed 100 words",
      path: ["medical_conditions"],
    },
  );

export type PlacementInput = z.input<typeof placementSchema>;
