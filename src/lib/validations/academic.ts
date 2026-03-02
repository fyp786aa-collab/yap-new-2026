import { z } from "zod";

/** Expected percentage ranges per grade (Pakistan board system) */
export const GRADE_PERCENTAGE_RANGES: Record<
  string,
  { min: number; max: number }
> = {
  "A+": { min: 80, max: 100 },
  A: { min: 70, max: 100 },
  "B+": { min: 60, max: 84 },
  B: { min: 50, max: 74 },
  "C+": { min: 40, max: 64 },
  C: { min: 33, max: 54 },
  D: { min: 25, max: 44 },
  F: { min: 0, max: 34 },
};

export const academicSchema = z
  .object({
    // Matriculation
    matric_institution: z
      .string()
      .min(1, "Matriculation institution is required")
      .max(200),
    matric_grade: z.enum(["A+", "A", "B+", "B", "C+", "C", "D", "F"], {
      message: "Please select a valid grade",
    }),
    matric_percentage: z.coerce
      .number()
      .gt(0, "Percentage must be greater than 0")
      .max(100, "Percentage cannot exceed 100"),
    // Intermediate
    intermediate_institution: z
      .string()
      .min(1, "Intermediate institution is required")
      .max(200),
    intermediate_grade: z.enum(["A+", "A", "B+", "B", "C+", "C", "D", "F"], {
      message: "Please select a valid grade",
    }),
    intermediate_percentage: z.coerce
      .number()
      .gt(0, "Percentage must be greater than 0")
      .max(100, "Percentage cannot exceed 100"),
    // University
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
      .gt(0, "CGPA/Percentage must be greater than 0")
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
  })
  .superRefine((data, ctx) => {
    // Validate matric grade ↔ percentage
    const matricRange = GRADE_PERCENTAGE_RANGES[data.matric_grade];
    if (matricRange && !isNaN(data.matric_percentage)) {
      if (data.matric_percentage < matricRange.min) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Grade ${data.matric_grade} requires at least ${matricRange.min}%`,
          path: ["matric_percentage"],
        });
      } else if (data.matric_percentage > matricRange.max) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${data.matric_percentage}% is too high for grade ${data.matric_grade} — expected up to ${matricRange.max}%`,
          path: ["matric_percentage"],
        });
      }
    }

    // Validate intermediate grade ↔ percentage
    const interRange = GRADE_PERCENTAGE_RANGES[data.intermediate_grade];
    if (interRange && !isNaN(data.intermediate_percentage)) {
      if (data.intermediate_percentage < interRange.min) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Grade ${data.intermediate_grade} requires at least ${interRange.min}%`,
          path: ["intermediate_percentage"],
        });
      } else if (data.intermediate_percentage > interRange.max) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${data.intermediate_percentage}% is too high for grade ${data.intermediate_grade} — expected up to ${interRange.max}%`,
          path: ["intermediate_percentage"],
        });
      }
    }
  });

export type AcademicInput = z.input<typeof academicSchema>;
