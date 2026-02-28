import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { loginSchema } from "@/lib/validations/auth";
import { findUserByEmail, getUserPasswordHash } from "@/lib/db-queries/users";
import argon2 from "argon2";
import { ROUTES } from "@/lib/routes";

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
      }
      return token;
    },
    async session({ session, token }) {
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
