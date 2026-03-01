import { z } from "zod";

export const availabilitySchema = z.object({
  available_july_aug_2026: z
    .boolean({
      error: "Please confirm your availability",
    })
    .refine((val) => val === true, {
      message:
        "You must confirm your availability for July – August 2026 to continue",
    }),
});

export type AvailabilityInput = z.infer<typeof availabilitySchema>;
