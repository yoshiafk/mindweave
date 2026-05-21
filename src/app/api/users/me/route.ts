import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import { z } from "zod";

const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name must be at most 100 characters"),
});

export async function GET() {
  try {
    // Protect route and retrieve session user
    const authResult = await requireAuth();
    if ("error" in authResult) {
      return authResult.error;
    }

    const { user } = authResult;
    const userId = parseInt(user.id, 10);

    if (isNaN(userId)) {
      return NextResponse.json({ success: false, message: "Invalid user session ID" }, { status: 400 });
    }

    // Retrieve user profile excluding password hash
    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: {
          select: {
            name: true,
            description: true,
          },
        },
        subscriptionTier: true,
        isVerified: true,
        onboardingCompleted: true,
        createdAt: true,
        lastLogin: true,
        preferences: true,
      },
    });

    if (!dbUser) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, user: dbUser });
  } catch (error) {
    console.error("GET /api/users/me error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const authResult = await requireAuth();
    if ("error" in authResult) {
      return authResult.error;
    }

    const { user } = authResult;
    const userId = parseInt(user.id, 10);

    if (isNaN(userId)) {
      return NextResponse.json({ success: false, message: "Invalid user session ID" }, { status: 400 });
    }

    const body = await req.json();
    const result = updateProfileSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: "Invalid name format", errors: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name } = result.data;

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { name },
      select: {
        id: true,
        email: true,
        name: true,
        subscriptionTier: true,
        isVerified: true,
        onboardingCompleted: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("PUT /api/users/me error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
