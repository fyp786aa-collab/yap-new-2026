"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { toast } from "sonner";
import { signupSchema, type SignupInput } from "@/lib/validations/auth";
import { signupAction } from "@/actions/auth.actions";
import { ROUTES } from "@/lib/routes";
import { FormInput } from "@/components/ui/form-input";
import { ButtonPrimary } from "@/components/ui/button-primary";
import { Eye, EyeOff, UserPlus, CheckCircle2 } from "lucide-react";

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
  });

  async function onSubmit(data: SignupInput) {
    setIsLoading(true);
    try {
      const result = await signupAction(data);
      if (result.success) {
        setEmailSent(true);
      } else {
        toast.error(result.error || "Failed to create account");
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
          We&apos;ve sent a verification link to{" "}
          <span className="font-medium text-foreground">
            {getValues("email")}
          </span>
          . Please check your inbox and click the link to verify your account.
        </p>
        <p className="text-xs text-muted-foreground">
          Didn&apos;t receive the email? Check your spam folder.
        </p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-yap-primary">Create Account</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Start your YAP 2026 application journey
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

        <div className="relative">
          <FormInput
            label="Password"
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
          <UserPlus className="w-4 h-4 mr-2" />
          Create Account
        </ButtonPrimary>
      </form>

      <p className="text-center text-sm text-muted-foreground mt-6">
        Already have an account?{" "}
        <Link
          href={ROUTES.AUTH.LOGIN}
          className="text-yap-accent font-medium hover:underline"
        >
          Sign In
        </Link>
      </p>
    </div>
  );
}
