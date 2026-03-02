"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { consentSchema, type ConsentInput } from "@/lib/validations/consent";
import { submitConsentAction } from "@/actions/consent.actions";
import { ROUTES } from "@/lib/routes";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ButtonPrimary } from "@/components/ui/button-primary";
import { ArrowRight, Shield, AlertCircle } from "lucide-react";

interface ConsentFormProps {
  userId: string;
  userEmail: string;
}

export function ConsentForm({ userId, userEmail }: ConsentFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ConsentInput>({
    resolver: zodResolver(consentSchema),
    defaultValues: {
      consent_documents: false as unknown as true,
      consent_truthful: false as unknown as true,
    },
  });

  const consent1 = watch("consent_documents");
  const consent3 = watch("consent_truthful");

  async function onSubmit(data: ConsentInput) {
    setIsLoading(true);
    try {
      const result = await submitConsentAction(userId, userEmail, data);
      if (result.success) {
        toast.success("Consent recorded. Starting your application!");
        window.location.href = ROUTES.DASHBOARD.PERSONAL_INFO;
      } else {
        toast.error(result.error || "Failed to record consent");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-yap-primary">
          Before You Begin
        </h1>
        <p className="text-muted-foreground mt-1">
          Please review and agree to the following terms before starting your
          application.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Consent 1: Documents */}
        <Card
          className={
            errors.consent_documents ? "border-red-300 bg-red-50/30" : ""
          }
        >
          <CardContent className="pt-5 pb-4">
            <div className="flex items-start gap-3">
              <Checkbox
                id="consent_documents"
                checked={consent1 === true}
                onCheckedChange={(checked) =>
                  setValue(
                    "consent_documents",
                    checked === true ? true : (false as unknown as true),
                    { shouldValidate: true },
                  )
                }
                className="mt-0.5"
              />
              <label
                htmlFor="consent_documents"
                className="text-sm leading-relaxed cursor-pointer"
              >
                I consent to the use of my submitted documents, and videos by
                AKYSB for the purpose of application review, internship
                placement, and programme-related communications.
              </label>
            </div>
            {errors.consent_documents && (
              <p className="text-xs text-red-500 mt-2 ml-7">
                {errors.consent_documents.message}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Consent 3: Truthful */}
        <Card
          className={
            errors.consent_truthful ? "border-red-300 bg-red-50/30" : ""
          }
        >
          <CardContent className="pt-5 pb-4">
            <div className="flex items-start gap-3">
              <Checkbox
                id="consent_truthful"
                checked={consent3 === true}
                onCheckedChange={(checked) =>
                  setValue(
                    "consent_truthful",
                    checked === true ? true : (false as unknown as true),
                    { shouldValidate: true },
                  )
                }
                className="mt-0.5"
              />
              <label
                htmlFor="consent_truthful"
                className="text-sm leading-relaxed cursor-pointer"
              >
                I agree that all responses I submit in this form will be my own
                original work. I understand that using AI tools or outside help
                to write my answers is not allowed and may lead to immediate
                disqualification of my application.
              </label>
            </div>
            {errors.consent_truthful && (
              <p className="text-xs text-red-500 mt-2 ml-7">
                {errors.consent_truthful.message}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Info box */}
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="pt-5 pb-4">
            <div className="flex gap-3">
              <Shield className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="text-sm text-blue-700">
                <p className="font-medium">Your data is secure</p>
                <p className="mt-1">
                  Your information will only be used for the YAP application
                  process and will be handled in accordance with AKYSB&apos;s
                  data privacy policy.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <ButtonPrimary type="submit" className="w-full" loading={isLoading}>
          Agree & Continue
          <ArrowRight className="w-4 h-4 ml-2" />
        </ButtonPrimary>
      </form>
    </div>
  );
}
