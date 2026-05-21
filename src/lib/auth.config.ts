import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  providers: [], // Required by NextAuthConfig type, populated in auth.ts
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Initial sign in — embed user data in JWT
      if (user) {
        token.id = user.id!;
        token.role = user.role;
        token.subscriptionTier = user.subscriptionTier;
        token.permissions = user.permissions;
        token.isVerified = user.isVerified;
        token.onboardingCompleted = user.onboardingCompleted;
      }

      // Allow updating session from client (e.g. after onboarding)
      if (trigger === "update" && session) {
        if (session.onboardingCompleted !== undefined) {
          token.onboardingCompleted = session.onboardingCompleted;
        }
        if (session.subscriptionTier !== undefined) {
          token.subscriptionTier = session.subscriptionTier;
        }
        if (session.permissions !== undefined) {
          token.permissions = session.permissions;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.subscriptionTier = token.subscriptionTier;
        session.user.permissions = token.permissions;
        session.user.isVerified = token.isVerified;
        session.user.onboardingCompleted = token.onboardingCompleted;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
