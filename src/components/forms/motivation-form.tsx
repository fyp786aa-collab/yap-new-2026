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
import { Separator } from "@/components/ui/separator";
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
      scenario_response: "",
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
      description=""
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Controller
          control={control}
          name="essay_response"
          defaultValue={defaultValues?.essay_response ?? ""}
          render={({ field }) => (
            <FormTextarea
              label="Learning through reflection is an important part of growth. Briefly explain what “reflection in action” means to you. Also, share a real example from your life where you had to adjust your thinking or behavior while a situation was happening, and explain what you learned from that experience. Additionally, describe how you believe practicing reflection will help you make the most of this internship."
              required
              maxWords={250}
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

        <Separator />

        <Controller
          control={control}
          name="scenario_response"
          defaultValue={defaultValues?.scenario_response ?? ""}
          render={({ field }) => (
            <FormTextarea
              label={
                "You have recently relocated to a new city for this six-week residential internship. It is now your third week, and you are still adjusting to the institutional culture, expectations, and communication style. You have been assigned a collaborative project with other interns and team members; however, the instructions provided are broad rather than highly detailed, and team members have significantly different work styles. There are occasional misunderstandings regarding deadlines and responsibilities, and you feel hesitant to ask too many questions because you do not want to appear inexperienced. At the same time, you are living away from home, adapting to a new routine, and striving to perform at a high standard. How would you approach this situation? In your response, explain how you would manage communication within the team, seek clarity without undermining your confidence, maintain professionalism while adapting to a new environment, and apply personal strategies to stay focused and resilient during this adjustment period. Please respond in detail, clearly outlining your thought process and actions."
              }
              required
              maxWords={250}
              disableCopyPaste
              rows={8}
              error={errors.scenario_response?.message}
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
