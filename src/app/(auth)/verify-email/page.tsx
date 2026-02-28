"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { verifyEmailAction } from "@/actions/auth.actions";
import { ROUTES } from "@/lib/routes";
import { ButtonPrimary } from "@/components/ui/button-primary";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    async function verify() {
      if (!token) {
        setStatus("error");
        setErrorMsg(
          "Invalid verification link. Please check your email for the correct link.",
        );
        return;
      }

      const result = await verifyEmailAction(token);
      if (result.success) {
        setStatus("success");
      } else {
        setStatus("error");
        setErrorMsg(result.error || "Verification failed");
      }
    }

    verify();
  }, [token]);

  if (status === "loading") {
    return (
      <div className="text-center py-12 animate-fade-in">
        <Loader2 className="w-10 h-10 text-yap-accent animate-spin mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-yap-primary">
          Verifying your email...
        </h2>
        <p className="text-muted-foreground mt-2">Please wait a moment.</p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="text-center py-8 animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-8 h-8 text-green-600 animate-scale-in" />
        </div>
        <h2 className="text-2xl font-bold text-yap-primary mb-2">
          Email Verified!
        </h2>
        <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
          Your account has been verified successfully. You can now sign in and
          start your application.
        </p>
        <Link href={ROUTES.AUTH.LOGIN}>
          <ButtonPrimary>Continue to Sign In</ButtonPrimary>
        </Link>
      </div>
    );
  }

  return (
    <div className="text-center py-8 animate-fade-in">
      <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
        <XCircle className="w-8 h-8 text-red-500" />
      </div>
      <h2 className="text-2xl font-bold text-yap-primary mb-2">
        Verification Failed
      </h2>
      <p className="text-muted-foreground mb-8 max-w-sm mx-auto">{errorMsg}</p>
      <Link href={ROUTES.AUTH.LOGIN}>
        <ButtonPrimary variant="outline">Back to Sign In</ButtonPrimary>
      </Link>
    </div>
  );
}
