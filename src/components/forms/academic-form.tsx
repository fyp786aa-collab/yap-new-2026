"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
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
import { Save } from "lucide-react";

interface AcademicFormProps {
  defaultValues?: Partial<AcademicInput>;
}

export function AcademicForm({ defaultValues }: AcademicFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AcademicInput>({
    resolver: zodResolver(academicSchema),
    defaultValues: {
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
        router.refresh();
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
          <FormSelect
            label="Current Year of Study"
            required
            options={YEAR_OF_STUDY_OPTIONS.map((y) => ({
              label: y.label,
              value: String(y.value),
            }))}
            error={errors.current_year_of_study?.message}
            {...register("current_year_of_study")}
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

        <div>
          <h3 className="text-sm font-semibold text-yap-primary mt-4 mb-3">
            Expected Graduation
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormSelect
              label="Month"
              required
              options={MONTHS.map((m) => ({
                label: m.label,
                value: String(m.value),
              }))}
              error={errors.expected_graduation_month?.message}
              {...register("expected_graduation_month")}
            />
            <FormSelect
              label="Year"
              required
              options={yearOptions}
              error={errors.expected_graduation_year?.message}
              {...register("expected_graduation_year")}
            />
          </div>
        </div>

        <FormSelect
          label="Religious Education Level"
          required
          options={RE_EDUCATION_OPTIONS.map((r) => ({
            label: r.label,
            value: r.value,
          }))}
          error={errors.re_education_level?.message}
          {...register("re_education_level")}
        />

        <div className="flex justify-end pt-4">
          <ButtonPrimary type="submit" loading={isLoading}>
            <Save className="w-4 h-4 mr-2" />
            Save & Continue
          </ButtonPrimary>
        </div>
      </form>
    </SectionWrapper>
  );
}
