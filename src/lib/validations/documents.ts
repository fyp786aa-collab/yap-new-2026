import { z } from "zod";

export const documentsSchema = z.object({
  academic_ref_name: z.string().min(1, "Academic reference name is required"),
  academic_ref_position: z.string().min(1, "Position is required"),
  academic_ref_contact: z.string().min(1, "Contact number is required"),
  academic_ref_email: z.string().email("Please enter a valid email"),
  supervisor_ref_name: z.string().default(""),
  supervisor_ref_position: z.string().default(""),
  supervisor_ref_contact: z.string().default(""),
  supervisor_ref_email: z
    .string()
    .default("")
    .refine(
      (val) => !val || val === "" || z.string().email().safeParse(val).success,
      {
        message: "Please enter a valid email",
      },
    ),
});

export type DocumentsInput = z.input<typeof documentsSchema>;
