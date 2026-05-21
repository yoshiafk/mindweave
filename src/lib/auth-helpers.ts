import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { Permission } from "@/config/permissions";

/**
 * Get the current authenticated user from the server session.
 * Use in Server Components, API routes, and Server Actions.
 */
export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

/**
 * Check if a user has a specific permission.
 */
export function hasPermission(
  userPermissions: string[],
  required: Permission
): boolean {
  return userPermissions.includes(required);
}

/**
 * Check if a user has ALL required permissions.
 */
export function hasAllPermissions(
  userPermissions: string[],
  required: Permission[]
): boolean {
  return required.every((p) => userPermissions.includes(p));
}

/**
 * API route guard — returns the user or an error response.
 * Usage in route handlers:
 * ```ts
 * const result = await requireAuth();
 * if ("error" in result) return result.error;
 * const { user } = result;
 * ```
 */
export async function requireAuth(requiredPermissions?: Permission[]) {
  const user = await getCurrentUser();

  if (!user) {
    return {
      error: NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      ),
    };
  }

  if (
    requiredPermissions &&
    !hasAllPermissions(user.permissions, requiredPermissions)
  ) {
    return {
      error: NextResponse.json(
        {
          success: false,
          message: "Insufficient permissions",
          required: requiredPermissions,
        },
        { status: 403 }
      ),
    };
  }

  return { user };
}
