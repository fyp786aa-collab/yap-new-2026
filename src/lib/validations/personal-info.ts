import { z } from "zod";

export const personalInfoSchema = z
  .object({
    full_name: z
      .string()
      .min(2, "Full name must be at least 2 characters")
      .max(150),
    father_name: z
      .string()
      .min(2, "Father name must be at least 2 characters")
      .max(150),
    gender: z.enum(["Male", "Female", "Other"], "Please select a gender"),
    date_of_birth: z.string().min(1, "Date of birth is required"),
    regional_council: z.string().min(1, "Regional council is required"),
    local_council: z.string().min(1, "Local council is required"),
    jamatkhana: z.string().min(1, "Jamatkhana is required"),
    cnic: z
      .string()
      .min(1, "CNIC is required")
      .regex(/^\d{5}-\d{7}-\d{1}$/, "CNIC must be in format XXXXX-XXXXXXX-X"),
    primary_contact: z
      .string()
      .min(1, "Primary contact is required")
      .regex(/^03\d{2}-\d{7}$/, "Phone must be in format 03XX-XXXXXXX"),
    whatsapp_number: z
      .string()
      .min(1, "WhatsApp number is required")
      .regex(/^03\d{2}-\d{7}$/, "Phone must be in format 03XX-XXXXXXX"),
    email: z.string().email("Please enter a valid email"),
    city_of_residence: z.string().min(1, "City of residence is required"),
    hometown: z.string().min(1, "Hometown is required"),
    permanent_address: z.string().min(1, "Permanent address is required"),
    current_address: z.string().min(1, "Current address is required"),
    emergency_name: z.string().min(1, "Emergency contact name is required"),
    emergency_relationship: z.string().min(1, "Relationship is required"),
    emergency_phone: z
      .string()
      .min(1, "Emergency contact phone is required")
      .regex(/^03\d{2}-\d{7}$/, "Phone must be in format 03XX-XXXXXXX"),
    has_relatives_gilgit_chitral: z.boolean(),
    relatives_address: z.string().optional().default(""),
    relatives_contact: z.string().optional().default(""),
  })
  .refine(
    (data) => {
      if (data.has_relatives_gilgit_chitral) {
        return (
          data.relatives_address && data.relatives_address.trim().length > 0
        );
      }
      return true;
    },
    {
      message: "Please provide relatives address",
      path: ["relatives_address"],
    },
  )
  .refine(
    (data) => {
      if (data.has_relatives_gilgit_chitral) {
        // ensure relatives contact present and matches phone format
        return (
          data.relatives_contact &&
          data.relatives_contact.trim().length > 0 &&
          /^03\d{2}-\d{7}$/.test(data.relatives_contact)
        );
      }
      return true;
    },
    {
      message: "Relatives contact must be in format 03XX-XXXXXXX",
      path: ["relatives_contact"],
    },
  );

export type PersonalInfoInput = z.input<typeof personalInfoSchema>;
