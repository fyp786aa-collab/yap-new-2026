"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  motivationSchema,
  type MotivationInput,
} from "@/lib/validations/motivation";
import { saveMotivationAction } from "@/actions/application.actions";
import { ROUTES } from "@/lib/routes";
import { SectionWrapper } from "@/components/forms/section-wrapper";
import { FormTextarea } from "@/components/ui/form-textarea";
import { ButtonPrimary } from "@/components/ui/button-primary";
import { Save } from "lucide-react";

interface MotivationFormProps {
  defaultValues?: Partial<MotivationInput>;
}

export function MotivationForm({ defaultValues }: MotivationFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty },
  } = useForm<MotivationInput>({
    resolver: zodResolver(motivationSchema),
    defaultValues: {
      essay_response: "",
      ...defaultValues,
    },
  });

  async function onSubmit(data: MotivationInput) {
    setIsLoading(true);
    try {
      const result = await saveMotivationAction(data);
      if (result.success) {
        toast.success("Motivation essay saved!");
        router.push(ROUTES.DASHBOARD.AVAILABILITY);
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
      sectionKey="motivation"
      title="Motivation & Alignment"
      description="Tell us why you want to join YAP and how it aligns with your goals"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Controller
          control={control}
          name="essay_response"
          defaultValue={defaultValues?.essay_response ?? ""}
          render={({ field }) => (
            <FormTextarea
              label="Why do you want to join the Young Ambassador Programme?"
              required
              hint="Share your motivation, career goals, and how YAP aligns with your aspirations. Maximum 150 words."
              maxWords={150}
              disableCopyPaste
              rows={8}
              error={errors.essay_response?.message}
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
