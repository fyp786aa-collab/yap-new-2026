"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { toast } from "sonner";
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "@/lib/validations/auth";
import { forgotPasswordAction } from "@/actions/auth.actions";
import { ROUTES } from "@/lib/routes";
import { FormInput } from "@/components/ui/form-input";
import { ButtonPrimary } from "@/components/ui/button-primary";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  async function onSubmit(data: ForgotPasswordInput) {
    setIsLoading(true);
    try {
      const result = await forgotPasswordAction(data);
      if (result.success) {
        setEmailSent(true);
      } else {
        toast.error(result.error || "Failed to send reset email");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  if (emailSent) {
    return (
      <div className="animate-fade-in text-center py-8">
        <div className="w-16 h-16 rounded-full bg-yap-accent/10 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-8 h-8 text-yap-accent" />
        </div>
        <h2 className="text-2xl font-bold text-yap-primary mb-2">
          Check Your Email
        </h2>
        <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
          If an account exists for{" "}
          <span className="font-medium text-foreground">
            {getValues("email")}
          </span>
          , we&apos;ve sent a password reset link.
        </p>
        <Link href={ROUTES.AUTH.LOGIN}>
          <ButtonPrimary variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Sign In
          </ButtonPrimary>
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-yap-primary">Reset Password</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Enter your email and we&apos;ll send you a reset link
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <FormInput
          label="Email Address"
          type="email"
          placeholder="your.email@example.com"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />

        <ButtonPrimary type="submit" className="w-full" loading={isLoading}>
          <Mail className="w-4 h-4 mr-2" />
          Send Reset Link
        </ButtonPrimary>
      </form>

      <p className="text-center text-sm text-muted-foreground mt-6">
        <Link
          href={ROUTES.AUTH.LOGIN}
          className="text-yap-accent font-medium hover:underline inline-flex items-center gap-1"
        >
          <ArrowLeft className="w-3 h-3" />
          Back to Sign In
        </Link>
      </p>
    </div>
  );
}
