"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  resetPasswordSchema,
  type ResetPasswordInput,
} from "@/lib/validations/auth";
import { resetPasswordAction } from "@/actions/auth.actions";
import { ROUTES } from "@/lib/routes";
import { FormInput } from "@/components/ui/form-input";
import { ButtonPrimary } from "@/components/ui/button-primary";
import { Eye, EyeOff, Lock, CheckCircle2 } from "lucide-react";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token },
  });

  async function onSubmit(data: ResetPasswordInput) {
    setIsLoading(true);
    try {
      const result = await resetPasswordAction(data);
      if (result.success) {
        setResetDone(true);
      } else {
        toast.error(result.error || "Failed to reset password");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="text-center py-8 animate-fade-in">
        <h2 className="text-2xl font-bold text-yap-primary mb-2">
          Invalid Reset Link
        </h2>
        <p className="text-muted-foreground mb-6">
          This password reset link is invalid or has expired.
        </p>
        <Link href={ROUTES.AUTH.FORGOT_PASSWORD}>
          <ButtonPrimary variant="outline">Request New Link</ButtonPrimary>
        </Link>
      </div>
    );
  }

  if (resetDone) {
    return (
      <div className="text-center py-8 animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-8 h-8 text-green-600 animate-scale-in" />
        </div>
        <h2 className="text-2xl font-bold text-yap-primary mb-2">
          Password Reset!
        </h2>
        <p className="text-muted-foreground mb-8">
          Your password has been changed successfully.
        </p>
        <Link href={ROUTES.AUTH.LOGIN}>
          <ButtonPrimary>Sign In</ButtonPrimary>
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-yap-primary">New Password</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Choose a strong password for your account
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <input type="hidden" {...register("token")} />

        <div className="relative">
          <FormInput
            label="New Password"
            type={showPassword ? "text" : "password"}
            placeholder="Min 8 chars, uppercase, number, special"
            autoComplete="new-password"
            error={errors.password?.message}
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-[38px] text-muted-foreground hover:text-foreground transition-colors"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>

        <div className="relative">
          <FormInput
            label="Confirm Password"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Re-enter your password"
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-[38px] text-muted-foreground hover:text-foreground transition-colors"
            tabIndex={-1}
          >
            {showConfirmPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>

        <ButtonPrimary type="submit" className="w-full" loading={isLoading}>
          <Lock className="w-4 h-4 mr-2" />
          Reset Password
        </ButtonPrimary>
      </form>
    </div>
  );
}
