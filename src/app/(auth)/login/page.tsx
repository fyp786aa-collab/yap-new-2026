"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { preLoginCheckAction } from "@/actions/auth.actions";
import { ROUTES } from "@/lib/routes";
import { FormInput } from "@/components/ui/form-input";
import { ButtonPrimary } from "@/components/ui/button-primary";
import { Eye, EyeOff, LogIn } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginInput) {
    setIsLoading(true);
    try {
      // Pre-check email verification status
      const check = await preLoginCheckAction(data.email);
      if (!check.success) {
        toast.error(check.error || "Unable to sign in");
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
        Need help?{" "}
        <Link
          href="https://wa.me/923102692232"
          target="_blank"
          rel="noopener noreferrer"
          className="text-yap-accent font-medium hover:underline"
        >
          Chat with us on WhatsApp (+92 310 2692232)
        </Link>
        .
      </p>
    </div>
  );
}
