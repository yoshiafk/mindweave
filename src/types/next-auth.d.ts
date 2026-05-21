import type { DefaultSession, DefaultUser } from "next-auth";
import type { JWT as DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      subscriptionTier: string;
      permissions: string[];
      isVerified: boolean;
      onboardingCompleted: boolean;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role: string;
    subscriptionTier: string;
    permissions: string[];
    isVerified: boolean;
    onboardingCompleted: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    role: string;
    subscriptionTier: string;
    permissions: string[];
    isVerified: boolean;
    onboardingCompleted: boolean;
  }
}
