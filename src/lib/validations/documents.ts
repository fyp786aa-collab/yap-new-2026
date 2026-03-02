import { z } from "zod";

export const documentsSchema = z.object({
  academic_ref_name: z.string().min(1, "Academic reference name is required"),
  academic_ref_position: z.string().min(1, "Position is required"),
  academic_ref_contact: z.string().min(1, "Contact number is required"),
  academic_ref_email: z
    .string()
    .min(1, "Academic reference email is required")
    .email("Please enter a valid email"),
  // Supervisor reference (optional, but validated if provided)
  supervisor_ref_name: z
    .string()
    .optional()
    .refine((val) => !val || val.trim().length > 0, {
      message: "Supervisor name cannot be empty if provided",
    }),
  supervisor_ref_position: z
    .string()
    .optional()
    .refine((val) => !val || val.trim().length > 0, {
      message: "Position cannot be empty if provided",
    }),
  supervisor_ref_contact: z
    .string()
    .optional()
    .refine((val) => !val || /^03\d{2}-\d{7}$/.test(val), {
      message: "Phone must be in format 03XX-XXXXXXX",
    }),
  supervisor_ref_email: z
    .string()
    .optional()
    .refine((val) => !val || z.string().email().safeParse(val).success, {
      message: "Please enter a valid email",
    }),
});

export type DocumentsInput = z.infer<typeof documentsSchema>;
