"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  placementSchema,
  type PlacementInput,
} from "@/lib/validations/placement";
import { savePlacementAction } from "@/actions/application.actions";
import { ROUTES } from "@/lib/routes";
import { SectionWrapper } from "@/components/forms/section-wrapper";
import { FormTextarea } from "@/components/ui/form-textarea";
import { ButtonPrimary } from "@/components/ui/button-primary";
import { Checkbox } from "@/components/ui/checkbox";
import { Save } from "lucide-react";

interface PlacementFormProps {
  defaultValues?: Partial<PlacementInput>;
}

export function PlacementForm({ defaultValues }: PlacementFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PlacementInput>({
    resolver: zodResolver(placementSchema),
    defaultValues: {
      willing_gilgit_chitral: false,
      stayed_away_before: false,
      stay_away_description: "",
      medical_conditions: "",
      ...defaultValues,
    },
  });

  const willingGC = watch("willing_gilgit_chitral");
  const stayedAway = watch("stayed_away_before");

  async function onSubmit(data: PlacementInput) {
    setIsLoading(true);
    try {
      const result = await savePlacementAction(data);
      if (result.success) {
        toast.success("Placement readiness saved!");
        router.push(ROUTES.DASHBOARD.INTERNSHIP_PREFS);
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
      sectionKey="placement"
      title="Placement Readiness"
      description="Your willingness and readiness for placement"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Willing to serve in GB/Chitral */}
        <div>
          <label className="text-sm font-medium text-foreground block mb-2">
            Are you willing to be placed in Gilgit-Baltistan or Chitral?{" "}
            <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-3">
            <Checkbox
              id="willing_gc"
              checked={willingGC}
              onCheckedChange={(checked) =>
                setValue("willing_gilgit_chitral", checked === true, {
                  shouldValidate: true,
                })
              }
            />
            <label htmlFor="willing_gc" className="text-sm cursor-pointer">
              Yes, I am willing to be placed in Gilgit-Baltistan or Chitral
            </label>
          </div>
          {errors.willing_gilgit_chitral && (
            <p className="text-xs text-red-500 mt-1">
              {errors.willing_gilgit_chitral.message}
            </p>
          )}
        </div>

        {/* Stayed away before */}
        <div>
          <label className="text-sm font-medium text-foreground block mb-2">
            Have you stayed away from home before?{" "}
            <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-3">
            <Checkbox
              id="stayed_away"
              checked={stayedAway}
              onCheckedChange={(checked) =>
                setValue("stayed_away_before", checked === true, {
                  shouldValidate: true,
                })
              }
            />
            <label htmlFor="stayed_away" className="text-sm cursor-pointer">
              Yes, I have stayed away from home before
            </label>
          </div>
        </div>

        {stayedAway && (
          <div className="animate-fade-in">
            <FormTextarea
              label="Please describe your experience staying away from home"
              required
              error={errors.stay_away_description?.message}
              {...register("stay_away_description")}
            />
          </div>
        )}

        {/* Medical Conditions */}
        <FormTextarea
          label="Do you have any medical conditions or allergies we should know about?"
          hint="Maximum 100 words. Leave blank if not applicable."
          maxWords={100}
          error={errors.medical_conditions?.message}
          {...register("medical_conditions")}
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
