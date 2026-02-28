"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { skillsSchema, type SkillsInput } from "@/lib/validations/skills";
import { saveSkillsAction } from "@/actions/application.actions";
import { ROUTES } from "@/lib/routes";
import { SKILL_CATEGORIES } from "@/lib/constants";
import { SectionWrapper } from "@/components/forms/section-wrapper";
import { StarRating } from "@/components/ui/star-rating";
import { FormTextarea } from "@/components/ui/form-textarea";
import { ButtonPrimary } from "@/components/ui/button-primary";
import { Save } from "lucide-react";

interface SkillsFormProps {
  defaultValues?: Partial<SkillsInput>;
}

export function SkillsForm({ defaultValues }: SkillsFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SkillsInput>({
    resolver: zodResolver(skillsSchema),
    defaultValues: {
      communication: 0,
      team_collaboration: 0,
      problem_solving: 0,
      adaptability: 0,
      leadership: 0,
      report_writing: 0,
      microsoft_office: 0,
      research_documentation: 0,
      community_engagement: 0,
      additional_skills: "",
      ...defaultValues,
    },
  });

  async function onSubmit(data: SkillsInput) {
    setIsLoading(true);
    try {
      const result = await saveSkillsAction(data);
      if (result.success) {
        toast.success("Skills saved!");
        router.push(ROUTES.DASHBOARD.EXPERIENCE);
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

  return (
    <SectionWrapper
      sectionKey="skills"
      title="Skills & Competencies"
      description="Rate your skills on a scale of 1 to 5 (1 = Beginner, 5 = Expert)"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          {SKILL_CATEGORIES.map((skill) => {
            const fieldName = skill.key as keyof SkillsInput;
            const value = watch(fieldName) as number;
            const error = errors[fieldName];

            return (
              <div
                key={skill.key}
                className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
              >
                <label className="text-sm font-medium text-foreground">
                  {skill.label}
                </label>
                <div className="flex flex-col items-end gap-1">
                  <StarRating
                    label={skill.label}
                    value={value || 0}
                    onChange={(v) =>
                      setValue(fieldName, v, { shouldValidate: true })
                    }
                  />
                  {error && (
                    <p className="text-xs text-red-500">{error.message}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <FormTextarea
          label="Additional Skills (optional)"
          hint="Mention any other relevant skills not listed above"
          error={errors.additional_skills?.message}
          {...register("additional_skills")}
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
