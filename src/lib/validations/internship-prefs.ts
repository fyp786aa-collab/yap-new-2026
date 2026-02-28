import { z } from "zod";
import { AGENCIES } from "@/lib/constants";

const agencyValues: string[] = AGENCIES.map((a) => a.value);

export const internshipPrefsSchema = z.object({
  preferences: z
    .array(
      z.object({
        agency: z.string().refine((val) => agencyValues.includes(val), {
          message: "Invalid agency",
        }),
        priority_rank: z.coerce.number().min(1).max(6),
      }),
    )
    .length(6, "You must rank all 6 agencies")
    .refine(
      (prefs) => {
        const ranks = prefs.map((p) => p.priority_rank);
        return new Set(ranks).size === 6;
      },
      { message: "Each agency must have a unique priority rank" },
    )
    .refine(
      (prefs) => {
        const agencies = prefs.map((p) => p.agency);
        return new Set(agencies).size === 6;
      },
      { message: "Each agency must be selected exactly once" },
    ),
});

export type InternshipPrefsInput = z.infer<typeof internshipPrefsSchema>;
