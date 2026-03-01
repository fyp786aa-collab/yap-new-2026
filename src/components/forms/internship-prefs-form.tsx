"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { saveInternshipPrefsAction } from "@/actions/application.actions";
import { ROUTES } from "@/lib/routes";
import { AGENCIES } from "@/lib/constants";
import { SectionWrapper } from "@/components/forms/section-wrapper";
import { PriorityRanker } from "@/components/ui/priority-ranker";
import { ButtonPrimary } from "@/components/ui/button-primary";
import { Save } from "lucide-react";

interface InternshipPrefsFormProps {
  defaultValues?: Array<{ agency: string; priority_rank: number }>;
}

export function InternshipPrefsForm({
  defaultValues,
}: InternshipPrefsFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Initialize with defaults or default ordering
  const initialRankings =
    defaultValues && defaultValues.length === 6
      ? [...defaultValues].sort((a, b) => a.priority_rank - b.priority_rank)
      : AGENCIES.map((a, i) => ({ agency: a.value, priority_rank: i + 1 }));

  const [rankings, setRankings] =
    useState<Array<{ agency: string; priority_rank: number }>>(initialRankings);

  const initialRef = useRef(JSON.stringify(initialRankings));
  const isDirty = JSON.stringify(rankings) !== initialRef.current;

  async function onSubmit() {
    setIsLoading(true);
    try {
      const result = await saveInternshipPrefsAction({
        preferences: rankings,
      });
      if (result.success) {
        toast.success("Internship preferences saved!");
        router.push(ROUTES.DASHBOARD.SKILLS);
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
      sectionKey="internship-prefs"
      title="Internship Preferences"
      description="Rank all 6 AKDN agencies in order of preference (1 = most preferred)"
    >
      <div className="space-y-6">
        <PriorityRanker items={rankings} onChange={setRankings} />

        <div className="flex justify-end pt-4">
          <ButtonPrimary
            onClick={onSubmit}
            loading={isLoading}
            disabled={!isDirty}
          >
            <Save className="w-4 h-4 mr-2" />
            Save & Continue
          </ButtonPrimary>
        </div>
      </div>
    </SectionWrapper>
  );
}
