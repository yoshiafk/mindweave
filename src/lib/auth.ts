import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { authConfig } from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        // Find user with role and permissions
        const user = await prisma.user.findUnique({
          where: { email },
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        });

        if (!user || !user.isActive) {
          await logAudit({
            action: "login_attempt",
            resourceType: "user",
            ipAddress: "unknown",
            status: "failed",
            errorMessage: user ? "Account inactive" : "User not found",
          });
          return null;
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
          await logAudit({
            userId: user.id,
            action: "login_attempt",
            resourceType: "user",
            resourceId: user.id,
            status: "failed",
            errorMessage: "Invalid password",
          });
          return null;
        }

        // Extract permission names
        const permissions = user.role.permissions.map(
          (rp: any) => rp.permission.name
        );

        // Update last login
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLogin: new Date() },
        });

        await logAudit({
          userId: user.id,
          action: "login",
          resourceType: "user",
          resourceId: user.id,
          status: "success",
        });

        return {
          id: String(user.id),
          email: user.email,
          name: user.name,
          role: user.role.name,
          subscriptionTier: user.subscriptionTier,
          permissions,
          isVerified: user.isVerified,
          onboardingCompleted: user.onboardingCompleted,
        };
      },
    }),
  ],
});

