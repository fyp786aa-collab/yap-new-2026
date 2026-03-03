"use client";

import { useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  experienceSchema,
  type ExperienceInput,
  type VoluntaryExperience,
} from "@/lib/validations/experience";
import { saveExperienceAction } from "@/actions/application.actions";
import { ROUTES } from "@/lib/routes";
import { SectionWrapper } from "@/components/forms/section-wrapper";
import { FormInput } from "@/components/ui/form-input";
import { FormSelect } from "@/components/ui/form-select";
import { ButtonPrimary } from "@/components/ui/button-primary";
import { Save, Plus, Trash2 } from "lucide-react";

const currentYear = new Date().getFullYear();

const YEAR_OPTIONS = Array.from({ length: currentYear - 2000 + 1 }, (_, i) => ({
  label: String(currentYear - i),
  value: String(currentYear - i),
}));

const EMPTY_EXPERIENCE: VoluntaryExperience = {
  institution: "",
  from_year: currentYear,
  to_year: currentYear,
  responsibility: "",
};

interface ExperienceFormProps {
  defaultValues?: Partial<ExperienceInput>;
}

export function ExperienceForm({ defaultValues }: ExperienceFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(experienceSchema) as any,
    mode: "onBlur",
    defaultValues: {
      experiences:
        defaultValues?.experiences && defaultValues.experiences.length > 0
          ? defaultValues.experiences
          : [{ ...EMPTY_EXPERIENCE }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "experiences",
  });

  async function onSubmit(data: ExperienceInput) {
    setIsLoading(true);
    try {
      const result = await saveExperienceAction(data);
      if (result.success) {
        toast.success("Experience saved!");
        router.push(ROUTES.DASHBOARD.MOTIVATION);
      } else {
        toast.error(result.error || "Failed to save");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <SectionWrapper
      sectionKey="experience"
      title="Experience & Engagement"
      description="List up to 5 relevant volunteering experiences, internships, or community work."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="relative border rounded-lg p-4 space-y-4 bg-muted/30"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-yap-primary">
                  Experience {index + 1}
                </h4>
                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="text-red-500 hover:text-red-700 transition-colors p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <FormInput
                    label="Institution Name"
                    required
                    error={errors.experiences?.[index]?.institution?.message}
                    {...register(`experiences.${index}.institution`)}
                  />
                </div>
                <Controller
                  control={control}
                  name={`experiences.${index}.from_year`}
                  render={({ field }) => (
                    <FormSelect
                      label="From Year"
                      required
                      options={YEAR_OPTIONS}
                      error={errors.experiences?.[index]?.from_year?.message}
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
                  name={`experiences.${index}.to_year`}
                  render={({ field }) => (
                    <FormSelect
                      label="To Year"
                      required
                      options={YEAR_OPTIONS}
                      error={errors.experiences?.[index]?.to_year?.message}
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
                <div className="sm:col-span-2">
                  <FormInput
                    label="Responsibility"
                    required
                    placeholder="Briefly describe your role (one line)"
                    error={errors.experiences?.[index]?.responsibility?.message}
                    {...register(`experiences.${index}.responsibility`)}
                    maxLength={150}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Global array errors */}
        {errors.experiences?.root?.message && (
          <p className="text-sm text-red-500">
            {errors.experiences.root.message}
          </p>
        )}
        {errors.experiences?.message && (
          <p className="text-sm text-red-500">{errors.experiences.message}</p>
        )}

        {fields.length < 5 && (
          <button
            type="button"
            onClick={() => append({ ...EMPTY_EXPERIENCE })}
            className="inline-flex items-center gap-2 text-sm text-yap-accent hover:text-yap-accent-hover transition-colors font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Another Experience
          </button>
        )}

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
