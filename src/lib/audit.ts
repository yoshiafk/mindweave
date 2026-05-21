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
    // Audit logging should never break the main flow
    console.error("Audit log failed:", error);
  }
}
