# AGENT-03: Authentication System

> **Pre-requisite:** Read [AGENT-00-context.md](file:///Users/yoshiafk/Development/Personal%20Project/mindweave/agent-tasks/AGENT-00-context.md) first.  
> **Depends on:** AGENT-01 (project scaffold), AGENT-02 (database schema)

---

## Objective

Implement NextAuth.js v5 authentication with credentials provider (email/password), JWT strategy, role-based access control, registration flow, password reset, and route protection middleware.

---

## Tasks

### 3.1 Configure NextAuth.js v5

Create `src/lib/auth.ts`:
- Configure NextAuth with **Credentials provider**
- Use **JWT strategy** (not database sessions — better for serverless)
- Embed user role, permissions, and subscriptionTier in the JWT token
- Configure JWT callbacks to include user data
- Set up session callback to expose user data to client

Create `src/lib/auth-options.ts`:
- Credentials provider with email + password validation
- bcrypt password comparison
- Fetch user's role and permissions from DB via Prisma
- Return user object with permissions array

Create `src/app/api/auth/[...nextauth]/route.ts`:
- Export GET and POST handlers from NextAuth

### 3.2 Extend NextAuth Types

Create `src/types/next-auth.d.ts`:
```typescript
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
```

### 3.3 Create Registration API Route

Create `src/app/api/auth/register/route.ts`:

**POST /api/auth/register**
- Validate input with Zod (email, password strength, name)
- Check email uniqueness
- Hash password with bcrypt (cost factor 12)
- Create user with default 'user' role
- Create default UserPreference record
- Create default free Subscription record
- Return success (user redirects to login)

Validation rules (matching Agent Task Doc):
- Email: valid format, not already registered
- Password: min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
- Name: 2–100 characters

### 3.4 Create Password Reset Flow

Create `src/app/api/auth/forgot-password/route.ts`:
- **POST**: Accept email, generate reset token (nanoid), store in DB with 1h expiry
- Send reset email via Resend
- Always return 200 (security — don't reveal if email exists)

Create `src/app/api/auth/reset-password/route.ts`:
- **POST**: Accept token + new password, validate token not expired, hash new password, update user, clear token

### 3.5 Create Zod Validation Schemas

Create `src/lib/validators/auth.ts`:
```typescript
import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain uppercase letter")
    .regex(/[a-z]/, "Must contain lowercase letter")
    .regex(/[0-9]/, "Must contain a number")
    .regex(/[^A-Za-z0-9]/, "Must contain a special character"),
  name: z.string().min(2).max(100),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  newPassword: z
    .string()
    .min(8)
    .regex(/[A-Z]/)
    .regex(/[a-z]/)
    .regex(/[0-9]/)
    .regex(/[^A-Za-z0-9]/),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z
    .string()
    .min(8)
    .regex(/[A-Z]/)
    .regex(/[a-z]/)
    .regex(/[0-9]/)
    .regex(/[^A-Za-z0-9]/),
});
```

### 3.6 Create Authorization Helpers

Create `src/lib/auth-helpers.ts`:
```typescript
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { NextResponse } from "next/server";
import type { Permission } from "@/config/permissions";

// Get current session (server-side)
export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user ?? null;
}

// Check if user has specific permission
export function hasPermission(userPermissions: string[], required: Permission): boolean {
  return userPermissions.includes(required);
}

// Check if user has ALL required permissions
export function hasAllPermissions(userPermissions: string[], required: Permission[]): boolean {
  return required.every((p) => userPermissions.includes(p));
}

// API route guard — returns 401/403 or the user
export async function requireAuth(requiredPermissions?: Permission[]) {
  const user = await getCurrentUser();

  if (!user) {
    return { error: NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 }) };
  }

  if (requiredPermissions && !hasAllPermissions(user.permissions, requiredPermissions)) {
    return {
      error: NextResponse.json(
        { success: false, message: "Insufficient permissions", required: requiredPermissions },
        { status: 403 }
      ),
    };
  }

  return { user };
}
```

### 3.7 Create Middleware for Route Protection

Create `src/middleware.ts`:
```typescript
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Redirect to onboarding if not completed
    if (token && !token.onboardingCompleted && !pathname.startsWith("/onboarding")) {
      return NextResponse.redirect(new URL("/onboarding", req.url));
    }

    // Redirect from onboarding if already completed
    if (token && token.onboardingCompleted && pathname.startsWith("/onboarding")) {
      return NextResponse.redirect(new URL("/journal", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Public paths that don't require auth
        const publicPaths = ["/", "/login", "/register", "/forgot-password", "/reset-password", "/pricing", "/api/auth", "/api/health", "/api/webhooks"];
        if (publicPaths.some((p) => pathname.startsWith(p))) {
          return true;
        }

        // All other paths require authentication
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public|images|fonts|icons).*)",
  ],
};
```

### 3.8 Create Rate Limiting

Create `src/lib/rate-limit.ts`:
```typescript
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Login rate limiter: 5 attempts per 15 minutes
export const loginRateLimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "15 m"),
  prefix: "rl:login",
});

// API rate limiter: 100 requests per 15 minutes
export const apiRateLimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, "15 m"),
  prefix: "rl:api",
});

// AI rate limiter: 4 AI calls per week per user (from PRD)
export const aiRateLimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(4, "7 d"),
  prefix: "rl:ai",
});
```

### 3.9 Create Auth UI Pages

#### Login Page (`src/app/(auth)/login/page.tsx`)

Design per Design Spec:
- Clean, centered layout with warm cream background
- MindWeave logo/name at top
- Email + Password inputs (shadcn `<Input>`)
- "Sign In" primary button (twilight blue, 50px height)
- "Forgot password?" text link
- "Don't have an account? Sign up" text link
- Error toast for invalid credentials
- Loading state on button during submission
- Use `react-hook-form` + Zod for client validation

#### Register Page (`src/app/(auth)/register/page.tsx`)

Design per Design Spec:
- Same centered layout as login
- Name + Email + Password + Confirm Password inputs
- Password strength indicator (visual bar)
- "Create Account" primary button
- "Already have an account? Sign in" text link
- Validation errors shown inline
- On success → redirect to `/onboarding`

#### Forgot Password Page (`src/app/(auth)/forgot-password/page.tsx`)

- Email input
- "Send Reset Link" button
- Success state: "Check your email for reset instructions"
- Back to login link

#### Reset Password Page (`src/app/(auth)/reset-password/page.tsx`)

- Token from URL search params
- New password + confirm password
- "Reset Password" button
- On success → redirect to `/login` with success message

#### Auth Layout (`src/app/(auth)/layout.tsx`)

- Centered container (max-width 400px)
- Warm cream background
- MindWeave branding at top
- No bottom navigation
- Mobile-optimized padding

### 3.10 Create Auth Hook

Create `src/hooks/use-auth.ts`:
```typescript
import { useSession, signIn, signOut } from "next-auth/react";
import type { Permission } from "@/config/permissions";

export function useAuth() {
  const { data: session, status, update } = useSession();

  const user = session?.user ?? null;
  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated";

  const hasPermission = (permission: Permission) =>
    user?.permissions?.includes(permission) ?? false;

  const isPremium = user?.subscriptionTier === "premium" || user?.subscriptionTier === "master";
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
```

### 3.11 Create User Profile API Routes

Create `src/app/api/users/me/route.ts`:
- **GET**: Return current user profile (excluding password hash)
- **PUT**: Update name (with validation)

Create `src/app/api/users/me/password/route.ts`:
- **PUT**: Change password (verify current, hash new)

### 3.12 Create Audit Logging Utility

Create `src/lib/audit.ts`:
```typescript
import prisma from "@/lib/prisma";

export async function logAudit(params: {
  userId?: number;
  action: string;
  resourceType?: string;
  resourceId?: number;
  ipAddress?: string;
  userAgent?: string;
  status: "success" | "failed";
  errorMessage?: string;
}) {
  try {
    await prisma.auditLog.create({ data: params });
  } catch (error) {
    console.error("Audit log failed:", error);
  }
}
```

---

## Verification

- [ ] Registration creates user with correct role and permissions
- [ ] Login returns valid session with user data
- [ ] Invalid credentials return 401
- [ ] Rate limiting blocks after 5 failed login attempts
- [ ] JWT contains role, permissions, subscriptionTier
- [ ] Protected routes redirect to /login when unauthenticated
- [ ] Middleware redirects to /onboarding if not completed
- [ ] Password reset flow sends email and allows reset
- [ ] Change password validates current password
- [ ] Master user can log in with seeded credentials
- [ ] Auth pages render correctly on mobile with MindWeave styling
- [ ] Form validation shows errors inline

---

## Files Created/Modified

| File | Action |
|------|--------|
| `src/lib/auth.ts` | Created |
| `src/lib/auth-options.ts` | Created |
| `src/lib/auth-helpers.ts` | Created |
| `src/lib/rate-limit.ts` | Created |
| `src/lib/audit.ts` | Created |
| `src/lib/validators/auth.ts` | Created |
| `src/types/next-auth.d.ts` | Created |
| `src/middleware.ts` | Created |
| `src/hooks/use-auth.ts` | Created |
| `src/app/api/auth/[...nextauth]/route.ts` | Created |
| `src/app/api/auth/register/route.ts` | Created |
| `src/app/api/auth/forgot-password/route.ts` | Created |
| `src/app/api/auth/reset-password/route.ts` | Created |
| `src/app/api/users/me/route.ts` | Created |
| `src/app/api/users/me/password/route.ts` | Created |
| `src/app/(auth)/layout.tsx` | Created |
| `src/app/(auth)/login/page.tsx` | Created |
| `src/app/(auth)/register/page.tsx` | Created |
| `src/app/(auth)/forgot-password/page.tsx` | Created |
| `src/app/(auth)/reset-password/page.tsx` | Created |

---

**Estimated Time:** 3–4 hours  
**Next Task:** [AGENT-04 — Journal Entries](file:///Users/yoshiafk/Development/Personal%20Project/mindweave/agent-tasks/AGENT-04-journal-entries.md)
