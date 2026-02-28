"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface ButtonPrimaryProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  variant?: "primary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

const ButtonPrimary = forwardRef<HTMLButtonElement, ButtonPrimaryProps>(
  (
    {
      className,
      children,
      loading,
      disabled,
      variant = "primary",
      size = "md",
      ...props
    },
    ref,
  ) => {
    const baseClasses =
      "rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2";

    const sizeClasses = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-5 py-2.5",
      lg: "px-6 py-3 text-lg",
    };

    const variantClasses = {
      primary:
        "bg-[#82a845] text-white hover:bg-[#6d9038] hover:shadow-lg hover:scale-[1.02] focus:ring-[#82a845]",
      outline:
        "border-2 border-[#82a845] text-[#82a845] hover:bg-[#82a845] hover:text-white hover:shadow-lg hover:scale-[1.02] focus:ring-[#82a845]",
      ghost:
        "text-[#152232] hover:bg-gray-100 hover:scale-[1.02] focus:ring-gray-300",
    };

    return (
      <button
        ref={ref}
        className={cn(
          baseClasses,
          sizeClasses[size],
          variantClasses[variant],
          className,
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  },
);

ButtonPrimary.displayName = "ButtonPrimary";

export { ButtonPrimary };
