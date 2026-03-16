import { z } from "zod";

export const availabilitySchema = z.object({
  available_july_aug_2026: z.boolean({
    error: "Please select your availability",
  }),
});

export type AvailabilityInput = z.infer<typeof availabilitySchema>;
