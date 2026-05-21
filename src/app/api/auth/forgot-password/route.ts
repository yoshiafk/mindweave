import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { Resend } from "resend";
import prisma from "@/lib/prisma";
import { forgotPasswordSchema } from "@/lib/validators/auth";
import { logAudit } from "@/lib/audit";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // 1. Validate inputs
    const result = forgotPasswordSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: "Invalid email address" },
        { status: 400 }
      );
    }

    const { email } = result.data;
    const lowerEmail = email.toLowerCase();

    // 2. Find user
    const user = await prisma.user.findUnique({
      where: { email: lowerEmail },
    });

    // 3. Security: if user does not exist, return success to prevent harvesting
    if (!user) {
      // Still log a audit event indicating an attempt for non-existent email, but keep it secure
      await logAudit({
        action: "forgot_password_request",
        resourceType: "user",
        status: "success",
        errorMessage: `Attempted reset for non-existent email: ${lowerEmail}`,
      });

      return NextResponse.json({
        success: true,
        message: "If the email is registered, a password reset link has been sent.",
      });
    }

    // 4. Generate token and expiry (1 hour)
    const token = nanoid(32);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // 5. Update user with reset details
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: token,
        resetPasswordExpires: expiresAt,
      },
    });

    // 6. Send the email or log it
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const resetLink = `${appUrl}/reset-password?token=${token}`;

    if (resend) {
      await resend.emails.send({
        from: process.env.EMAIL_FROM || "noreply@mindweave.app",
        to: user.email,
        subject: "Reset your MindWeave password",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #F8F6F1; color: #2A2A2A; border-radius: 12px;">
            <h2 style="color: #4A5B7C; font-family: serif; font-size: 24px; margin-bottom: 20px;">MindWeave</h2>
            <p>Hello ${user.name},</p>
            <p>We received a request to reset your password. You can reset it by clicking the link below:</p>
            <p style="margin: 30px 0;">
              <a href="${resetLink}" style="background-color: #4A5B7C; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Reset Password</a>
            </p>
            <p>If you did not request this, you can safely ignore this email. The link will expire in 1 hour.</p>
            <hr style="border: 0; border-top: 1px solid #E8E6E1; margin: 30px 0;" />
            <p style="font-size: 12px; color: #6B6B6B;">This is an automated email. Please do not reply.</p>
          </div>
        `,
      });
    } else {
      console.log("\n========================================================");
      console.log(`[DEV ONLY] PASSWORD RESET REQUEST FOR: ${user.email}`);
      console.log(`[DEV ONLY] RESET LINK: ${resetLink}`);
      console.log("========================================================\n");
    }

    // 7. Log success audit event
    await logAudit({
      userId: user.id,
      action: "forgot_password_request",
      resourceType: "user",
      resourceId: user.id,
      status: "success",
    });

    return NextResponse.json({
      success: true,
      message: "If the email is registered, a password reset link has been sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);

    return NextResponse.json(
      { success: false, message: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
