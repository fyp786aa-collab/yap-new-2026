"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
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
    formState: { errors },
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
      relatives_address: "",
      relatives_contact: "",
      ...defaultValues,
    },
  });

  const selectedRegion = watch("regional_council");
  const selectedLocalCouncil = watch("local_council");
  const hasRelatives = watch("has_relatives_gilgit_chitral");

  const regionOptions = getRegionOptions();
  const [localCouncilOptions, setLocalCouncilOptions] = useState<string[]>([]);
  const [jamatkhanaOptions, setJamatkhanaOptions] = useState<string[]>([]);

  useEffect(() => {
    if (selectedRegion) {
      const councils = getLocalCouncilsByRegion(selectedRegion);
      setLocalCouncilOptions(councils);
      if (!councils.includes(watch("local_council"))) {
        setValue("local_council", "");
        setValue("jamatkhana", "");
        setJamatkhanaOptions([]);
      }
    } else {
      setLocalCouncilOptions([]);
      setJamatkhanaOptions([]);
    }
  }, [selectedRegion, setValue, watch]);

  useEffect(() => {
    if (selectedLocalCouncil) {
      const jks = getJamatkhanasByLocalCouncil(selectedLocalCouncil);
      setJamatkhanaOptions(jks);
      if (!jks.includes(watch("jamatkhana"))) {
        setValue("jamatkhana", "");
      }
    } else {
      setJamatkhanaOptions([]);
    }
  }, [selectedLocalCouncil, setValue, watch]);

  async function onSubmit(data: PersonalInfoInput) {
    setIsLoading(true);
    try {
      const result = await savePersonalInfoAction(data);
      if (result.success) {
        toast.success("Personal information saved!");
        router.push(ROUTES.DASHBOARD.ACADEMIC);
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
          <FormSelect
            label="Gender"
            required
            options={GENDER_OPTIONS.map((g) => ({
              label: g.label,
              value: g.value,
            }))}
            error={errors.gender?.message}
            {...register("gender")}
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
            <FormSelect
              label="Regional Council"
              required
              options={regionOptions.map((r) => ({
                label: r.label,
                value: r.value,
              }))}
              error={errors.regional_council?.message}
              {...register("regional_council")}
            />
            <FormSelect
              label="Local Council"
              required
              options={localCouncilOptions.map((c) => ({ label: c, value: c }))}
              error={errors.local_council?.message}
              disabled={!selectedRegion}
              {...register("local_council")}
            />
            <div className="sm:col-span-2">
              <FormSelect
                label="Jamatkhana"
                required
                options={jamatkhanaOptions.map((j) => ({ label: j, value: j }))}
                error={errors.jamatkhana?.message}
                disabled={!selectedLocalCouncil}
                {...register("jamatkhana")}
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
            <FormSelect
              label="Relationship"
              required
              options={RELATIONSHIP_OPTIONS.map((r) => ({
                label: r,
                value: r,
              }))}
              error={errors.emergency_relationship?.message}
              {...register("emergency_relationship")}
            />
            <FormInput
              label="Contact Phone"
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
          <ButtonPrimary type="submit" loading={isLoading}>
            <Save className="w-4 h-4 mr-2" />
            Save & Continue
          </ButtonPrimary>
        </div>
      </form>
    </SectionWrapper>
  );
}
