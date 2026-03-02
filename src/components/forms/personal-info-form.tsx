"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  personalInfoSchema,
  type PersonalInfoInput,
} from "@/lib/validations/personal-info";
import { savePersonalInfoAction } from "@/actions/application.actions";
import { ROUTES } from "@/lib/routes";
import { GENDER_OPTIONS, RELATIONSHIP_OPTIONS } from "@/lib/constants";
import { getRegionOptions, getLocalCouncilsByRegion } from "@/data/councils";
import { getJamatkhanasByLocalCouncil } from "@/data/jamatkhanas";
import { SectionWrapper } from "@/components/forms/section-wrapper";
import { FormInput } from "@/components/ui/form-input";
import { FormSelect } from "@/components/ui/form-select";
import { ButtonPrimary } from "@/components/ui/button-primary";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Save } from "lucide-react";

interface PersonalInfoFormProps {
  defaultValues?: Partial<PersonalInfoInput>;
}

export function PersonalInfoForm({ defaultValues }: PersonalInfoFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors, isDirty },
  } = useForm<PersonalInfoInput>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      full_name: "",
      father_name: "",
      gender: "Male",
      date_of_birth: "",
      regional_council: "",
      local_council: "",
      jamatkhana: "",
      cnic: "",
      primary_contact: "",
      whatsapp_number: "",
      email: "",
      city_of_residence: "",
      hometown: "",
      permanent_address: "",
      current_address: "",
      emergency_name: "",
      emergency_relationship: "",
      emergency_phone: "",
      has_relatives_gilgit_chitral: false,
      relatives_name: "",
      relatives_address: "",
      relatives_contact: "",
      ...defaultValues,
    },
  });

  const selectedRegion = watch("regional_council");
  const selectedLocalCouncil = watch("local_council");
  const hasRelatives = watch("has_relatives_gilgit_chitral");

  const regionOptions = getRegionOptions();
  const localCouncilOptions = useMemo(
    () => (selectedRegion ? getLocalCouncilsByRegion(selectedRegion) : []),
    [selectedRegion],
  );
  const jamatkhanaOptions = useMemo(
    () =>
      selectedLocalCouncil
        ? getJamatkhanasByLocalCouncil(selectedLocalCouncil)
        : [],
    [selectedLocalCouncil],
  );
  const prevRegionRef = useRef(selectedRegion);
  const prevLocalCouncilRef = useRef(selectedLocalCouncil);

  // Clear dependent fields only when user actually changes region
  useEffect(() => {
    if (prevRegionRef.current !== selectedRegion) {
      if (prevRegionRef.current !== "") {
        setValue("local_council", "");
        setValue("jamatkhana", "");
      }
      prevRegionRef.current = selectedRegion;
    }
  }, [selectedRegion, setValue]);

  // Clear jamatkhana when local council changes (if current value not in new list)
  useEffect(() => {
    if (prevLocalCouncilRef.current !== selectedLocalCouncil) {
      if (prevLocalCouncilRef.current !== "" && selectedLocalCouncil) {
        const jks = getJamatkhanasByLocalCouncil(selectedLocalCouncil);
        if (!jks.includes(watch("jamatkhana"))) {
          setValue("jamatkhana", "");
        }
      }
      prevLocalCouncilRef.current = selectedLocalCouncil;
    }
  }, [selectedLocalCouncil, setValue, watch]);

  async function onSubmit(data: PersonalInfoInput) {
    setIsLoading(true);
    try {
      const result = await savePersonalInfoAction(data);
      if (result.success) {
        toast.success("Personal information saved!");
        router.push(ROUTES.DASHBOARD.ACADEMIC);
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
      sectionKey="personal-info"
      title="Personal Information"
      description="Tell us about yourself"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Details */}
        <div className="grid gap-4 sm:grid-cols-2">
          <FormInput
            label="Full Name"
            required
            error={errors.full_name?.message}
            {...register("full_name")}
          />
          <FormInput
            label="Father's Name"
            required
            error={errors.father_name?.message}
            {...register("father_name")}
          />
          <Controller
            control={control}
            name="gender"
            defaultValue={defaultValues?.gender ?? "Male"}
            render={({ field }) => (
              <FormSelect
                label="Gender"
                required
                options={GENDER_OPTIONS.map((g) => ({
                  label: g.label,
                  value: g.value,
                }))}
                error={errors.gender?.message}
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
          <FormInput
            label="Date of Birth"
            type="date"
            required
            error={errors.date_of_birth?.message}
            {...register("date_of_birth")}
          />
        </div>

        <Separator />

        {/* Location */}
        <div>
          <h3 className="text-sm font-semibold text-yap-primary mb-3">
            Regional & Council Information
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Controller
              control={control}
              name="regional_council"
              defaultValue={defaultValues?.regional_council ?? ""}
              render={({ field }) => (
                <FormSelect
                  label="Regional Council"
                  required
                  options={regionOptions.map((r) => ({
                    label: r.label,
                    value: r.value,
                  }))}
                  error={errors.regional_council?.message}
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
            <Controller
              control={control}
              name="local_council"
              defaultValue={defaultValues?.local_council ?? ""}
              render={({ field }) => (
                <FormSelect
                  label="Local Council"
                  required
                  options={localCouncilOptions.map((c) => ({
                    label: c,
                    value: c,
                  }))}
                  error={errors.local_council?.message}
                  disabled={!selectedRegion}
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
            <div className="sm:col-span-2">
              <Controller
                control={control}
                name="jamatkhana"
                defaultValue={defaultValues?.jamatkhana ?? ""}
                render={({ field }) => (
                  <FormSelect
                    label="Jamatkhana"
                    required
                    options={jamatkhanaOptions.map((j) => ({
                      label: j,
                      value: j,
                    }))}
                    error={errors.jamatkhana?.message}
                    disabled={!selectedLocalCouncil}
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
        </div>

        <Separator />

        {/* ID & Contact */}
        <div>
          <h3 className="text-sm font-semibold text-yap-primary mb-3">
            Contact Information
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormInput
              label="CNIC"
              required
              placeholder="XXXXX-XXXXXXX-X"
              hint="Format: XXXXX-XXXXXXX-X"
              error={errors.cnic?.message}
              {...register("cnic")}
            />
            <FormInput
              label="Primary Contact"
              required
              placeholder="03XX-XXXXXXX"
              error={errors.primary_contact?.message}
              {...register("primary_contact")}
            />
            <FormInput
              label="WhatsApp Number"
              required
              placeholder="03XX-XXXXXXX"
              error={errors.whatsapp_number?.message}
              {...register("whatsapp_number")}
            />
            <FormInput
              label="Email"
              type="email"
              required
              error={errors.email?.message}
              {...register("email")}
            />
          </div>
        </div>

        <Separator />

        {/* Addresses */}
        <div>
          <h3 className="text-sm font-semibold text-yap-primary mb-3">
            Addresses
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormInput
              label="City of Residence"
              required
              error={errors.city_of_residence?.message}
              {...register("city_of_residence")}
            />
            <FormInput
              label="Hometown"
              required
              error={errors.hometown?.message}
              {...register("hometown")}
            />
            <FormInput
              label="Permanent Address"
              required
              error={errors.permanent_address?.message}
              {...register("permanent_address")}
            />
            <FormInput
              label="Current Address"
              required
              error={errors.current_address?.message}
              {...register("current_address")}
            />
          </div>
        </div>

        <Separator />

        {/* Emergency Contact */}
        <div>
          <h3 className="text-sm font-semibold text-yap-primary mb-3">
            Emergency Contact
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormInput
              label="Contact Name"
              required
              error={errors.emergency_name?.message}
              {...register("emergency_name")}
            />
            <Controller
              control={control}
              name="emergency_relationship"
              defaultValue={defaultValues?.emergency_relationship ?? ""}
              render={({ field }) => (
                <FormSelect
                  label="Relationship"
                  required
                  options={RELATIONSHIP_OPTIONS.map((r) => ({
                    label: r,
                    value: r,
                  }))}
                  error={errors.emergency_relationship?.message}
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
            <FormInput
              label="Contact Number"
              required
              placeholder="03XX-XXXXXXX"
              error={errors.emergency_phone?.message}
              {...register("emergency_phone")}
            />
          </div>
        </div>

        <Separator />

        {/* Relatives in GB/Chitral */}
        <div>
          <h3 className="text-sm font-semibold text-yap-primary mb-3">
            Relatives in Gilgit-Baltistan / Chitral
          </h3>
          <div className="flex items-center gap-3 mb-4">
            <Checkbox
              id="has_relatives"
              checked={hasRelatives}
              onCheckedChange={(checked) =>
                setValue("has_relatives_gilgit_chitral", checked === true, {
                  shouldValidate: true,
                })
              }
            />
            <label htmlFor="has_relatives" className="text-sm cursor-pointer">
              I have relatives living in Gilgit-Baltistan or Chitral
            </label>
          </div>
          {hasRelatives && (
            <div className="grid gap-4 sm:grid-cols-2 animate-fade-in">
              <FormInput
                label="Relative's Name"
                required
                error={errors.relatives_name?.message}
                {...register("relatives_name")}
              />
              <FormInput
                label="Relatives Address"
                required
                error={errors.relatives_address?.message}
                {...register("relatives_address")}
              />
              <FormInput
                label="Relatives Contact"
                required
                error={errors.relatives_contact?.message}
                {...register("relatives_contact")}
              />
            </div>
          )}
        </div>

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
