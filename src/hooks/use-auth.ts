"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import type { Permission } from "@/config/permissions";

export function useAuth() {
  const { data: session, status, update } = useSession();

  const user = session?.user ?? null;
  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated";

  const hasPermission = (permission: Permission) =>
    user?.permissions?.includes(permission) ?? false;

  const isPremium =
    user?.subscriptionTier === "premium" ||
    user?.subscriptionTier === "master";
  const isMaster = user?.subscriptionTier === "master";

  return {
    user,
    isLoading,
    isAuthenticated,
    hasPermission,
    isPremium,
    isMaster,
    signIn,
    signOut,
    updateSession: update,
  };
}
