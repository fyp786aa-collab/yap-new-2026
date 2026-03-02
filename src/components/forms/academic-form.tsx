"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { academicSchema, type AcademicInput } from "@/lib/validations/academic";
import { saveAcademicAction } from "@/actions/application.actions";
import { ROUTES } from "@/lib/routes";
import {
  RE_EDUCATION_OPTIONS,
  YEAR_OF_STUDY_OPTIONS,
  MONTHS,
} from "@/lib/constants";
import { SectionWrapper } from "@/components/forms/section-wrapper";
import { FormInput } from "@/components/ui/form-input";
import { FormSelect } from "@/components/ui/form-select";
import { ButtonPrimary } from "@/components/ui/button-primary";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Save, Info } from "lucide-react";

const GRADE_OPTIONS = [
  { value: "A+", label: "A+" },
  { value: "A", label: "A" },
  { value: "B+", label: "B+" },
  { value: "B", label: "B" },
  { value: "C+", label: "C+" },
  { value: "C", label: "C" },
  { value: "D", label: "D" },
  { value: "F", label: "F" },
];

interface AcademicFormProps {
  defaultValues?: Partial<AcademicInput>;
}

export function AcademicForm({ defaultValues }: AcademicFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty },
  } = useForm<AcademicInput>({
    resolver: zodResolver(academicSchema),
    defaultValues: {
      matric_institution: "",
      matric_grade: undefined,
      matric_percentage: undefined,
      intermediate_institution: "",
      intermediate_grade: undefined,
      intermediate_percentage: undefined,
      university_name: "",
      degree_program: "",
      major_specialization: "",
      current_year_of_study: undefined,
      cgpa_percentage: undefined,
      expected_graduation_month: undefined,
      expected_graduation_year: undefined,
      re_education_level: undefined,
      ...defaultValues,
    },
  });

  async function onSubmit(data: AcademicInput) {
    setIsLoading(true);
    try {
      const result = await saveAcademicAction(data);
      if (result.success) {
        toast.success("Academic information saved!");
        router.push(ROUTES.DASHBOARD.PLACEMENT);
      } else {
        toast.error(result.error || "Failed to save");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 12 }, (_, i) => ({
    label: String(currentYear + i),
    value: String(currentYear + i),
  }));

  return (
    <SectionWrapper
      sectionKey="academic"
      title="Academic Background"
      description="Tell us about your education"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* A/O Level Guidance */}
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="pt-5 pb-4">
            <div className="flex gap-3">
              <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="text-sm text-blue-700">
                <p className="font-medium">O-Level / A-Level Students</p>
                <p className="mt-1">
                  If you studied O-Levels or A-Levels, please enter the
                  equivalent Matric / Intermediate percentage. You can use the{" "}
                  <a
                    href="https://maqsad.io/a-level-equivalence-calculator"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline font-medium hover:text-blue-900"
                  >
                    Maqsad Equivalence Calculator
                  </a>{" "}
                  to convert your grades.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Matriculation */}
        <div>
          <h3 className="text-sm font-semibold text-yap-primary mb-3">
            Matriculation
          </h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <FormInput
              label="Institution Name"
              required
              error={errors.matric_institution?.message}
              {...register("matric_institution")}
            />
            <Controller
              control={control}
              name="matric_grade"
              defaultValue={(defaultValues?.matric_grade ?? "") as any}
              render={({ field }) => (
                <FormSelect
                  label="Grade"
                  required
                  options={GRADE_OPTIONS}
                  error={errors.matric_grade?.message}
                  value={field.value as string}
                  onChange={(e: any) => {
                    if (typeof e === "string") field.onChange(e);
                    else if (e?.target) field.onChange(e.target.value);
                  }}
                  onBlur={field.onBlur}
                  name={field.name}
                />
              )}
            />
            <FormInput
              label="Percentage"
              type="number"
              required
              placeholder="e.g., 85"
              step="0.01"
              error={errors.matric_percentage?.message}
              {...register("matric_percentage")}
            />
          </div>
        </div>

        <Separator />

        {/* Intermediate */}
        <div>
          <h3 className="text-sm font-semibold text-yap-primary mb-3">
            Intermediate
          </h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <FormInput
              label="Institution Name"
              required
              error={errors.intermediate_institution?.message}
              {...register("intermediate_institution")}
            />
            <Controller
              control={control}
              name="intermediate_grade"
              defaultValue={(defaultValues?.intermediate_grade ?? "") as any}
              render={({ field }) => (
                <FormSelect
                  label="Grade"
                  required
                  options={GRADE_OPTIONS}
                  error={errors.intermediate_grade?.message}
                  value={field.value as string}
                  onChange={(e: any) => {
                    if (typeof e === "string") field.onChange(e);
                    else if (e?.target) field.onChange(e.target.value);
                  }}
                  onBlur={field.onBlur}
                  name={field.name}
                />
              )}
            />
            <FormInput
              label="Percentage"
              type="number"
              required
              placeholder="e.g., 85"
              step="0.01"
              error={errors.intermediate_percentage?.message}
              {...register("intermediate_percentage")}
            />
          </div>
        </div>

        <Separator />

        {/* University */}
        <div>
          <h3 className="text-sm font-semibold text-yap-primary mb-3">
            University / Higher Education
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <FormInput
                label="University/Institution Name"
                required
                error={errors.university_name?.message}
                {...register("university_name")}
              />
            </div>
            <FormInput
              label="Degree Program"
              required
              error={errors.degree_program?.message}
              {...register("degree_program")}
            />
            <FormInput
              label="Major/Specialization"
              required
              error={errors.major_specialization?.message}
              {...register("major_specialization")}
            />
            <Controller
              control={control}
              name="current_year_of_study"
              defaultValue={
                defaultValues?.current_year_of_study
                  ? String(defaultValues.current_year_of_study)
                  : ""
              }
              render={({ field }) => (
                <FormSelect
                  label="Current Year of Study"
                  required
                  options={YEAR_OF_STUDY_OPTIONS.map((y) => ({
                    label: y.label,
                    value: String(y.value),
                  }))}
                  error={errors.current_year_of_study?.message}
                  value={field.value as string | number}
                  onChange={(e: any) => {
                    if (typeof e === "string") field.onChange(e);
                    else if (e?.target) field.onChange(e.target.value);
                  }}
                  onBlur={field.onBlur}
                  name={field.name}
                />
              )}
            />
            <FormInput
              label="CGPA / Percentage"
              type="number"
              required
              placeholder="e.g., 3.5 or 85"
              hint="Enter CGPA (0-4) or percentage (0-100)"
              step="0.01"
              error={errors.cgpa_percentage?.message}
              {...register("cgpa_percentage")}
            />
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-yap-primary mt-4 mb-3">
            Expected Graduation
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Controller
              control={control}
              name="expected_graduation_month"
              defaultValue={
                defaultValues?.expected_graduation_month
                  ? String(defaultValues.expected_graduation_month)
                  : ""
              }
              render={({ field }) => (
                <FormSelect
                  label="Month"
                  required
                  options={MONTHS.map((m) => ({
                    label: m.label,
                    value: String(m.value),
                  }))}
                  error={errors.expected_graduation_month?.message}
                  value={field.value as string | number}
                  onChange={(e: any) => {
                    if (typeof e === "string") field.onChange(e);
                    else if (e?.target) field.onChange(e.target.value);
                  }}
                  onBlur={field.onBlur}
                  name={field.name}
                />
              )}
            />
            <Controller
              control={control}
              name="expected_graduation_year"
              defaultValue={
                defaultValues?.expected_graduation_year
                  ? String(defaultValues.expected_graduation_year)
                  : ""
              }
              render={({ field }) => (
                <FormSelect
                  label="Year"
                  required
                  options={yearOptions}
                  error={errors.expected_graduation_year?.message}
                  value={field.value as string | number}
                  onChange={(e: any) => {
                    if (typeof e === "string") field.onChange(e);
                    else if (e?.target) field.onChange(e.target.value);
                  }}
                  onBlur={field.onBlur}
                  name={field.name}
                />
              )}
            />
          </div>
        </div>

        <Controller
          control={control}
          name="re_education_level"
          defaultValue={(defaultValues?.re_education_level ?? "") as any}
          render={({ field }) => (
            <FormSelect
              label="Religious Education Level"
              required
              options={RE_EDUCATION_OPTIONS.map((r) => ({
                label: r.label,
                value: r.value,
              }))}
              error={errors.re_education_level?.message}
              value={field.value as string}
              onChange={(e: any) => {
                if (typeof e === "string") field.onChange(e);
                else if (e?.target) field.onChange(e.target.value);
              }}
              onBlur={field.onBlur}
              name={field.name}
            />
          )}
        />

        <div className="flex justify-end pt-4">
          <ButtonPrimary type="submit" loading={isLoading} disabled={!isDirty}>
            <Save className="w-4 h-4 mr-2" />
            Save & Continue
          </ButtonPrimary>
        </div>
      </form>
    </SectionWrapper>
  );
}
