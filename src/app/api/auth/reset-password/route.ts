import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { resetPasswordSchema } from "@/lib/validators/auth";
import { logAudit } from "@/lib/audit";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // 1. Validate inputs
    const result = resetPasswordSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: "Invalid fields", errors: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { token, newPassword } = result.data;

    // 2. Find user with matching token and valid expiry
    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Reset token is invalid or has expired." },
        { status: 400 }
      );
    }

    // 3. Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // 4. Update password and clear token/expiry
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    // 5. Log audit event
    await logAudit({
      userId: user.id,
      action: "reset_password",
      resourceType: "user",
      resourceId: user.id,
      status: "success",
    });

    return NextResponse.json({
      success: true,
      message: "Your password has been successfully reset. You can now log in.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred during password reset." },
      { status: 500 }
    );
  }
}
