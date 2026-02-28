import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/routes";
import type { SessionUser, UserRole } from "@/types";

/**
 * Proxy-based auth guard for server components.
 * Call this at the top of any protected page/layout.
 */
export async function requireAuth(): Promise<SessionUser> {
  const session = await auth();

  if (!session?.user?.id) {
    redirect(ROUTES.AUTH.LOGIN);
  }

  if (!session.user.emailVerified) {
    redirect(ROUTES.AUTH.LOGIN);
  }

  return {
    id: session.user.id,
    email: session.user.email!,
    role: (session.user.role ?? "applicant") as UserRole,
    email_verified: session.user.emailVerified ?? false,
  };
}

/**
 * Get session without redirecting (returns null if not authenticated)
 */
export async function getOptionalSession(): Promise<SessionUser | null> {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  return {
    id: session.user.id,
    email: session.user.email!,
    role: (session.user.role ?? "applicant") as UserRole,
    email_verified: session.user.emailVerified ?? false,
  };
}
