import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { loginSchema } from "@/lib/validations/auth";
import {
  findUserByEmail,
  findUserById,
  getUserPasswordHash,
} from "@/lib/db-queries/users";
import argon2 from "argon2";
import { ROUTES } from "@/lib/routes";

const USER_RECHECK_INTERVAL_MS = 6 * 60 * 60 * 1000; // 6 hours

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const parsed = loginSchema.safeParse(credentials);
          if (!parsed.success) return null;

          const { email, password } = parsed.data;

          const user = await findUserByEmail(email);
          if (!user) return null;

          // Email verification is checked client-side via preLoginCheckAction
          // so we just reject unverified users silently here
          if (!user.email_verified) return null;

          const passwordHash = await getUserPasswordHash(email);
          if (!passwordHash) return null;

          const isValid = await argon2.verify(passwordHash, password);
          if (!isValid) return null;

          return {
            id: user.id,
            email: user.email,
            role: user.role,
            emailVerified: user.email_verified,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  pages: {
    signIn: ROUTES.AUTH.LOGIN,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.role = (user as Record<string, unknown>).role as string;
        token.emailVerified = (user as Record<string, unknown>)
          .emailVerified as boolean;
        (token as Record<string, unknown>).userCheckedAt = Date.now();
        return token;
      }

      // Re-check user existence only periodically instead of every request.
      if (token.id) {
        const lastChecked =
          typeof (token as Record<string, unknown>).userCheckedAt === "number"
            ? ((token as Record<string, unknown>).userCheckedAt as number)
            : 0;

        const shouldRecheck =
          Date.now() - lastChecked > USER_RECHECK_INTERVAL_MS;

        if (shouldRecheck) {
          const dbUser = await findUserById(token.id as string);
          if (!dbUser) {
            // User was deleted — invalidate the token
            return null as unknown as typeof token;
          }
          (token as Record<string, unknown>).userCheckedAt = Date.now();
        }
      }

      return token;
    },
    async session({ session, token }) {
      // If user was deleted (token invalidated), return empty session
      if (!token.id) {
        return null as unknown as typeof session;
      }
      if (session.user) {
        session.user.id = token.id as string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (session.user as any).role = token.role as string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (session.user as any).emailVerified = token.emailVerified as boolean;
      }
      return session;
    },
  },
  trustHost: true,
});
