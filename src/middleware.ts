import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  // 1. Define path groups
  const isAuthPage = ["/login", "/register", "/forgot-password", "/reset-password"].includes(pathname);
  const isPublicPage = ["/", "/pricing"].includes(pathname);
  const isApiRoute = pathname.startsWith("/api");
  const isOnboardingPage = pathname.startsWith("/onboarding");

  // Allow standard NextAuth API calls, health check, and Stripe webhooks
  const isExcludedApi =
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/health") ||
    pathname.startsWith("/api/webhooks");

  if (isExcludedApi) {
    return NextResponse.next();
  }

  // 2. Unauthenticated User flow
  if (!isLoggedIn) {
    // Redirect from private pages (including onboarding, dashboard, journal, etc.) to login
    if (!isAuthPage && !isPublicPage && !isApiRoute) {
      const loginUrl = new URL("/login", req.nextUrl);
      // Optional: append original path as callback
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // 3. Authenticated User flow
  const onboardingCompleted = req.auth?.user?.onboardingCompleted;

  // Logged-in users should not see auth pages (login, register, reset, etc.)
  if (isAuthPage) {
    const redirectPath = onboardingCompleted ? "/journal" : "/onboarding";
    return NextResponse.redirect(new URL(redirectPath, req.nextUrl));
  }

  // Handle onboarding state redirects
  if (!onboardingCompleted && !isOnboardingPage && !isApiRoute && !isPublicPage) {
    return NextResponse.redirect(new URL("/onboarding", req.nextUrl));
  }

  if (onboardingCompleted && isOnboardingPage) {
    return NextResponse.redirect(new URL("/journal", req.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  // Match all request paths except static files, public images, fonts, favicon
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public|images|fonts|icons|api/health|api/webhooks).*)",
  ],
};
