import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import { changePasswordSchema } from "@/lib/validators/auth";
import { logAudit } from "@/lib/audit";

export async function PUT(req: Request) {
  try {
    // 1. Protect route and retrieve user
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
    
    // 2. Validate input fields
    const result = changePasswordSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: "Invalid fields", errors: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword } = result.data;

    // 3. Retrieve user database record to compare current password
    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!dbUser) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    // 4. Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, dbUser.passwordHash);
    if (!isPasswordValid) {
      await logAudit({
        userId: dbUser.id,
        action: "change_password",
        resourceType: "user",
        resourceId: dbUser.id,
        status: "failed",
        errorMessage: "Incorrect current password",
      });

      return NextResponse.json(
        { success: false, message: "Incorrect current password" },
        { status: 400 }
      );
    }

    // 5. Hash new password
    const newHashedPassword = await bcrypt.hash(newPassword, 12);

    // 6. Update user password
    await prisma.user.update({
      where: { id: dbUser.id },
      data: { passwordHash: newHashedPassword },
    });

    // 7. Log success audit event
    await logAudit({
      userId: dbUser.id,
      action: "change_password",
      resourceType: "user",
      resourceId: dbUser.id,
      status: "success",
    });

    return NextResponse.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("PUT /api/users/me/password error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
