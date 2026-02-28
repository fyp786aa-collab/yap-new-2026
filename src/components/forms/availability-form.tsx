"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { saveAvailabilityAction } from "@/actions/application.actions";
import { ROUTES } from "@/lib/routes";
import { SectionWrapper } from "@/components/forms/section-wrapper";
import { ButtonPrimary } from "@/components/ui/button-primary";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Save, Calendar } from "lucide-react";

interface AvailabilityFormProps {
  defaultValues?: { available_july_aug_2026: boolean };
}

export function AvailabilityForm({ defaultValues }: AvailabilityFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [available, setAvailable] = useState(
    defaultValues?.available_july_aug_2026 ?? false,
  );

  async function onSubmit() {
    setIsLoading(true);
    try {
      const result = await saveAvailabilityAction({
        available_july_aug_2026: available,
      });
      if (result.success) {
        toast.success("Availability confirmed!");
        router.push(ROUTES.DASHBOARD.DOCUMENTS);
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
      sectionKey="availability"
      title="Availability & Commitment"
      description="Confirm your availability for the programme"
    >
      <div className="space-y-6">
        <Card className="border-yap-accent/20 bg-yap-accent/5">
          <CardContent className="pt-5 pb-4">
            <div className="flex gap-3">
              <Calendar className="w-5 h-5 text-yap-accent shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-yap-primary">Programme Period</p>
                <p className="text-muted-foreground mt-1">
                  The Young Ambassador Programme internship placements take
                  place during <strong>July – August 2026</strong>. You must be
                  available for the full duration of the placement.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-start gap-3 p-4 rounded-lg border">
          <Checkbox
            id="available"
            checked={available}
            onCheckedChange={(checked) => setAvailable(checked === true)}
            className="mt-0.5"
          />
          <label
            htmlFor="available"
            className="text-sm leading-relaxed cursor-pointer"
          >
            I confirm that I am available to participate in the Young Ambassador
            Programme during <strong>July – August 2026</strong> and I commit to
            completing the full duration of my internship placement.
          </label>
        </div>

        <div className="flex justify-end pt-4">
          <ButtonPrimary
            onClick={onSubmit}
            loading={isLoading}
            disabled={!available}
          >
            <Save className="w-4 h-4 mr-2" />
            Save & Continue
          </ButtonPrimary>
        </div>
      </div>
    </SectionWrapper>
  );
}
