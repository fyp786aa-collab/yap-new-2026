import { z } from "zod";

export const academicSchema = z.object({
  university_name: z.string().min(1, "University name is required").max(200),
  degree_program: z.string().min(1, "Degree program is required").max(200),
  major_specialization: z
    .string()
    .min(1, "Major/Specialization is required")
    .max(150),
  current_year_of_study: z.coerce
    .number()
    .min(1, "Year of study is required")
    .max(4, "Year must be between 1 and 4"),
  cgpa_percentage: z.coerce
    .number()
    .min(0, "CGPA/Percentage must be a positive number")
    .max(100, "Value cannot exceed 100"),
  expected_graduation_month: z.coerce
    .number()
    .min(1, "Graduation month is required")
    .max(12),
  expected_graduation_year: z.coerce
    .number()
    .min(2024, "Invalid year")
    .max(2035, "Invalid year"),
  re_education_level: z.enum(
    ["Others", "Matric", "HRE", "ARE"],
    "Please select RE education level",
  ),
});

export type AcademicInput = z.input<typeof academicSchema>;
