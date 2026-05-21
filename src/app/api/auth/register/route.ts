import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { registerSchema } from "@/lib/validators/auth";
import { logAudit } from "@/lib/audit";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // 1. Validate inputs
    const result = registerSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: "Invalid fields", errors: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { email, password, name } = result.data;

    // 2. Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "Email already registered" },
        { status: 400 }
      );
    }

    // 3. Find the default 'user' role
    const userRole = await prisma.role.findUnique({
      where: { name: "user" },
    });

    if (!userRole) {
      console.error("Default 'user' role not found in the database. Ensure db:seed has run.");
      return NextResponse.json(
        { success: false, message: "System configuration error. Please try again later." },
        { status: 500 }
      );
    }

    // 4. Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // 5. Create user along with default preferences and subscription atomically
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        name,
        passwordHash: hashedPassword,
        roleId: userRole.id,
        subscriptionTier: "free",
        isActive: true,
        isVerified: false,
        onboardingCompleted: false,
        preferences: {
          create: {
            aiInvolvementLevel: "moderate",
            enableReflectiveResponses: true,
            enablePatternInsights: true,
            enableWritingPrompts: true,
            notificationDailyReminder: true,
            notificationTime: "20:00",
            notificationWeeklyStory: true,
            theme: "system",
            textSize: "medium",
            weeklyStoryDay: "sunday",
            narrativeStylePreference: "third_person",
          },
        },
        subscription: {
          create: {
            subscriptionTier: "free",
            status: "active",
            currency: "USD",
          },
        },
      },
    });

    // 6. Log audit event
    await logAudit({
      userId: user.id,
      action: "register",
      resourceType: "user",
      resourceId: user.id,
      status: "success",
    });

    return NextResponse.json(
      {
        success: true,
        message: "User registered successfully",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    
    await logAudit({
      action: "register",
      resourceType: "user",
      status: "failed",
      errorMessage: error instanceof Error ? error.message : "Unknown error",
    });

    return NextResponse.json(
      { success: false, message: "An unexpected error occurred during registration" },
      { status: 500 }
    );
  }
}
