"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  experienceSchema,
  type ExperienceInput,
} from "@/lib/validations/experience";
import { saveExperienceAction } from "@/actions/application.actions";
import { ROUTES } from "@/lib/routes";
import { SectionWrapper } from "@/components/forms/section-wrapper";
import { FormTextarea } from "@/components/ui/form-textarea";
import { ButtonPrimary } from "@/components/ui/button-primary";
import { Save } from "lucide-react";

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
  } = useForm<ExperienceInput>({
    resolver: zodResolver(experienceSchema),
    defaultValues: {
      description: "",
      ...defaultValues,
    },
  });

  async function onSubmit(data: ExperienceInput) {
    setIsLoading(true);
    try {
      const result = await saveExperienceAction(data);
      if (result.success) {
        toast.success("Experience saved!");
        router.push(ROUTES.DASHBOARD.MOTIVATION);
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
      sectionKey="experience"
      title="Experience & Engagement"
      description="Describe your relevant experiences, volunteer work, and community engagement"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Controller
          control={control}
          name="description"
          defaultValue={defaultValues?.description ?? ""}
          render={({ field }) => (
            <FormTextarea
              label="Describe your relevant experience"
              required
              hint="Include volunteer work, internships, community projects, or any relevant engagement. Maximum 150 words."
              maxWords={150}
              disableCopyPaste
              rows={8}
              error={errors.description?.message}
              value={field.value}
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
