"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import {
  preLoginCheckAction,
  resendVerificationEmailAction,
} from "@/actions/auth.actions";
import { ROUTES } from "@/lib/routes";
import { FormInput } from "@/components/ui/form-input";
import { ButtonPrimary } from "@/components/ui/button-primary";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Eye, EyeOff, LogIn } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showResendDialog, setShowResendDialog] = useState(false);
  const [resendEmail, setResendEmail] = useState("");
  const [isResending, setIsResending] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  async function handleResendVerificationEmail() {
    if (!resendEmail) {
      toast.error("Email is missing. Please enter your email and try again.");
      return;
    }

    setIsResending(true);
    try {
      const result = await resendVerificationEmailAction(resendEmail);
      if (!result.success) {
        toast.error(result.error || "Unable to resend verification email");
        return;
      }

      toast.success("Verification email sent. Please check your inbox.");
      setShowResendDialog(false);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsResending(false);
    }
  }

  async function onSubmit(data: LoginInput) {
    setIsLoading(true);
    try {
      // Pre-check email verification status
      const check = await preLoginCheckAction(data.email);
      if (!check.success) {
        if (check.data?.verificationLinkExpired) {
          setResendEmail(check.data.email || data.email);
          setShowResendDialog(true);
          toast.error(
            "Your verification link has expired. Please resend a new verification email.",
          );
        } else {
          toast.error(
            check.error ||
              "Your email is not verified yet. Please verify your email.",
          );
        }
        setIsLoading(false);
        return;
      }

      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Invalid email or password");
      } else {
        router.push(ROUTES.DASHBOARD.HOME);
        router.refresh();
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-yap-primary">Welcome Back</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Sign in to continue your application
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

        <div>
          <div className="relative">
            <FormInput
              label="Password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              autoComplete="current-password"
              error={errors.password?.message}
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9.5 text-muted-foreground hover:text-foreground transition-colors"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          <div className="flex justify-end mt-1">
            <Link
              href={ROUTES.AUTH.FORGOT_PASSWORD}
              className="text-xs text-yap-accent hover:underline"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <ButtonPrimary type="submit" className="w-full" loading={isLoading}>
          <LogIn className="w-4 h-4 mr-2" />
          Sign In
        </ButtonPrimary>
      </form>

      <p className="text-center text-sm text-muted-foreground mt-6">
        Don&apos;t have an account?{" "}
        <Link
          href={ROUTES.AUTH.SIGNUP}
          className="text-yap-accent font-medium hover:underline"
        >
          Create Account
        </Link>
      </p>

      <p className="text-center text-sm mt-4">
        Having technical issues? contact us at{" "}
        <a
          href="mailto:yap.ysb@akcpk.org"
          className="text-yap-accent hover:underline"
        >
          yap.ysb@akcpk.org
        </a>
      </p>

      <Dialog open={showResendDialog} onOpenChange={setShowResendDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Verification Link Expired</DialogTitle>
            <DialogDescription>
              Your previous verification link has expired. Click below to resend
              a new verification email.
            </DialogDescription>
          </DialogHeader>

          <p className="text-sm text-muted-foreground">{resendEmail}</p>

          <DialogFooter>
            <ButtonPrimary
              type="button"
              variant="outline"
              onClick={() => setShowResendDialog(false)}
            >
              Cancel
            </ButtonPrimary>
            <ButtonPrimary
              type="button"
              onClick={handleResendVerificationEmail}
              loading={isResending}
            >
              Resend Verification Email
            </ButtonPrimary>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
