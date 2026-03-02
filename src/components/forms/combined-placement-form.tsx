"use client";

import { useState, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  placementSchema,
  type PlacementInput,
} from "@/lib/validations/placement";
import { skillsSchema, type SkillsInput } from "@/lib/validations/skills";
import {
  savePlacementAction,
  saveInternshipPrefsAction,
  saveSkillsAction,
} from "@/actions/application.actions";
import { ROUTES } from "@/lib/routes";
import { AGENCIES, SKILL_CATEGORIES } from "@/lib/constants";
import { SectionWrapper } from "@/components/forms/section-wrapper";
import { FormTextarea } from "@/components/ui/form-textarea";
import { ButtonPrimary } from "@/components/ui/button-primary";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { StarRating } from "@/components/ui/star-rating";
import { PriorityRanker } from "@/components/ui/priority-ranker";
import { Separator } from "@/components/ui/separator";
import { Save } from "lucide-react";

interface CombinedPlacementFormProps {
  placementDefaults?: Partial<PlacementInput>;
  internshipDefaults?: Array<{ agency: string; priority_rank: number }>;
  skillsDefaults?: Partial<SkillsInput>;
}

export function CombinedPlacementForm({
  placementDefaults,
  internshipDefaults,
  skillsDefaults,
}: CombinedPlacementFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Placement form
  const {
    register: registerPlacement,
    handleSubmit: handleSubmitPlacement,
    setValue: setPlacementValue,
    watch: watchPlacement,
    control: controlPlacement,
    formState: { errors: placementErrors },
  } = useForm<PlacementInput>({
    resolver: zodResolver(placementSchema),
    defaultValues: {
      willing_gilgit_chitral: false,
      stayed_away_before: false,
      stay_away_description: "",
      medical_conditions: "",
      ...placementDefaults,
    },
  });

  const willingGC = watchPlacement("willing_gilgit_chitral");
  const stayedAway = watchPlacement("stayed_away_before");

  // Internship preferences
  const initialRankings =
    internshipDefaults && internshipDefaults.length === 6
      ? [...internshipDefaults].sort(
          (a, b) => a.priority_rank - b.priority_rank,
        )
      : AGENCIES.map((a, i) => ({ agency: a.value, priority_rank: i + 1 }));

  const [rankings, setRankings] =
    useState<Array<{ agency: string; priority_rank: number }>>(initialRankings);

  // Skills form
  const {
    register: registerSkills,
    setValue: setSkillsValue,
    watch: watchSkills,
    formState: { errors: skillsErrors, isValid: skillsValid },
    trigger: triggerSkills,
  } = useForm<SkillsInput>({
    resolver: zodResolver(skillsSchema),
    mode: "onChange",
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
      ...skillsDefaults,
    },
  });

  async function onSubmit(placementData: PlacementInput) {
    // Also validate skills
    const skillsOk = await triggerSkills();
    if (!skillsOk) {
      toast.error("Please rate all skills before saving");
      return;
    }

    setIsLoading(true);
    try {
      // Save all three sections
      const [placementResult, prefsResult, skillsResult] = await Promise.all([
        savePlacementAction(placementData),
        saveInternshipPrefsAction({ preferences: rankings }),
        saveSkillsAction({
          communication: watchSkills("communication"),
          team_collaboration: watchSkills("team_collaboration"),
          problem_solving: watchSkills("problem_solving"),
          adaptability: watchSkills("adaptability"),
          leadership: watchSkills("leadership"),
          report_writing: watchSkills("report_writing"),
          microsoft_office: watchSkills("microsoft_office"),
          research_documentation: watchSkills("research_documentation"),
          community_engagement: watchSkills("community_engagement"),
          additional_skills: watchSkills("additional_skills") || "",
        }),
      ]);

      if (
        placementResult.success &&
        prefsResult.success &&
        skillsResult.success
      ) {
        toast.success("Placement, preferences & skills saved!");
        router.push(ROUTES.DASHBOARD.EXPERIENCE);
      } else {
        const error =
          placementResult.error || prefsResult.error || skillsResult.error;
        toast.error(error || "Failed to save");
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
      title="Placement, Preferences & Skills"
      description="Your readiness, internship preferences, and skills assessment"
    >
      <form onSubmit={handleSubmitPlacement(onSubmit)} className="space-y-8">
        {/* ===== PLACEMENT READINESS ===== */}
        <div>
          <h3 className="text-sm font-bold text-yap-primary mb-4 uppercase tracking-wide">
            Placement Readiness
          </h3>

          <div className="space-y-6">
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
                    setPlacementValue(
                      "willing_gilgit_chitral",
                      checked === true,
                      {
                        shouldValidate: true,
                      },
                    )
                  }
                />
                <label htmlFor="willing_gc" className="text-sm cursor-pointer">
                  Yes, I am willing to be placed in Gilgit-Baltistan or Chitral
                </label>
              </div>
              {placementErrors.willing_gilgit_chitral && (
                <p className="text-xs text-red-500 mt-1">
                  {placementErrors.willing_gilgit_chitral.message}
                </p>
              )}
            </div>

            {/* Stayed away before */}
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">
                Have you stayed away from home before?{" "}
                <span className="text-red-500">*</span>
              </label>
              <RadioGroup
                value={
                  stayedAway === true ? "yes" : stayedAway === false ? "no" : ""
                }
                onValueChange={(val) =>
                  setPlacementValue("stayed_away_before", val === "yes", {
                    shouldValidate: true,
                  })
                }
                className="flex gap-6"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="yes" id="stayed_away_yes" />
                  <label
                    htmlFor="stayed_away_yes"
                    className="text-sm cursor-pointer"
                  >
                    Yes
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="no" id="stayed_away_no" />
                  <label
                    htmlFor="stayed_away_no"
                    className="text-sm cursor-pointer"
                  >
                    No
                  </label>
                </div>
              </RadioGroup>
              {placementErrors.stayed_away_before && (
                <p className="text-xs text-red-500 mt-1">
                  {placementErrors.stayed_away_before.message}
                </p>
              )}
            </div>

            {stayedAway && (
              <div className="animate-fade-in">
                <Controller
                  control={controlPlacement}
                  name="stay_away_description"
                  render={({ field }) => (
                    <FormTextarea
                      label="Please briefly describe your experience of living away from home, including any challenges or personal growth you experienced"
                      required
                      maxWords={150}
                      disableCopyPaste
                      error={placementErrors.stay_away_description?.message}
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
              </div>
            )}

            <Controller
              control={controlPlacement}
              name="medical_conditions"
              render={({ field }) => (
                <FormTextarea
                  label="Do you have any medical conditions or allergies we should know about?"
                  hint="Maximum 100 words. Leave blank if not applicable."
                  maxWords={100}
                  error={placementErrors.medical_conditions?.message}
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
          </div>
        </div>

        <Separator />

        {/* ===== INTERNSHIP PREFERENCES ===== */}
        <div>
          <h3 className="text-sm font-bold text-yap-primary mb-4 uppercase tracking-wide">
            Internship Preferences
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Rank all 6 AKDN agencies in order of preference (1 = most preferred)
          </p>
          <PriorityRanker items={rankings} onChange={setRankings} />
        </div>

        <Separator />

        {/* ===== SKILLS & COMPETENCIES ===== */}
        <div>
          <h3 className="text-sm font-bold text-yap-primary mb-2 uppercase tracking-wide">
            Skills & Competencies
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Rate your skills on a scale of 1 to 5 (1 = Beginner, 5 = Expert)
          </p>
          <div className="space-y-4">
            {SKILL_CATEGORIES.map((skill) => {
              const fieldName = skill.key as keyof SkillsInput;
              const value = watchSkills(fieldName) as number;
              const error = skillsErrors[fieldName];

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
                        setSkillsValue(fieldName, v, {
                          shouldValidate: true,
                          shouldDirty: true,
                        })
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

          <div className="mt-4">
            <FormTextarea
              label="Additional Skills (optional)"
              hint="Mention any other relevant skills not listed above"
              error={skillsErrors.additional_skills?.message}
              {...registerSkills("additional_skills")}
            />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <ButtonPrimary
            type="submit"
            loading={isLoading}
            disabled={!willingGC}
          >
            <Save className="w-4 h-4 mr-2" />
            Save & Continue
          </ButtonPrimary>
        </div>
      </form>
    </SectionWrapper>
  );
}
