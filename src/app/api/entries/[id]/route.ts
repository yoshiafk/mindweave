import { NextResponse, type NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import prisma from "@/lib/prisma";
import { updateEntrySchema } from "@/lib/validators/entry";
import { logAudit } from "@/lib/audit";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/entries/[id]
 * Fetches a single entry by ID. Enforces ownership and the 7-day free tier limit.
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  const authResult = await requireAuth();
  if ("error" in authResult) return authResult.error;
  const { user } = authResult;
  const userId = parseInt(user.id, 10);

  const { id } = await params;
  const entryId = parseInt(id, 10);

  if (isNaN(entryId)) {
    return NextResponse.json(
      { success: false, message: "Invalid entry ID" },
      { status: 400 }
    );
  }

  try {
    const entry = await prisma.journalEntry.findUnique({
      where: { id: entryId },
      include: {
        reflections: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!entry) {
      return NextResponse.json(
        { success: false, message: "Entry not found" },
        { status: 404 }
      );
    }

    if (entry.userId !== userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access to entry" },
        { status: 403 }
      );
    }

    // Enforce 7-day limit on retrieval for free tier users
    if (user.subscriptionTier === "free") {
      const cutoffDate = new Date();
      cutoffDate.setUTCDate(cutoffDate.getUTCDate() - 7);
      cutoffDate.setUTCHours(0, 0, 0, 0);

      if (entry.entryDate < cutoffDate) {
        return NextResponse.json(
          {
            success: false,
            message: "This entry is older than 7 days. Upgrade to Premium to access your full history.",
            code: "HISTORY_LIMIT_EXCEEDED",
          },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      data: entry,
    });
  } catch (error) {
    console.error("Failed to fetch single entry:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/entries/[id]
 * Updates a single entry. Validates inputs, checks ownership, and updates word count.
 */
export async function PUT(req: NextRequest, { params }: RouteParams) {
  const authResult = await requireAuth();
  if ("error" in authResult) return authResult.error;
  const { user } = authResult;
  const userId = parseInt(user.id, 10);

  const { id } = await params;
  const entryId = parseInt(id, 10);

  if (isNaN(entryId)) {
    return NextResponse.json(
      { success: false, message: "Invalid entry ID" },
      { status: 400 }
    );
  }

  try {
    const entry = await prisma.journalEntry.findUnique({
      where: { id: entryId },
    });

    if (!entry) {
      return NextResponse.json(
        { success: false, message: "Entry not found" },
        { status: 404 }
      );
    }

    if (entry.userId !== userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access to entry" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parsedBody = updateEntrySchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        { success: false, error: parsedBody.error.flatten() },
        { status: 400 }
      );
    }

    const { entryText, moodBefore, moodAfter, tags } = parsedBody.data;

    // Prepare update data
    const updateData: {
      entryText?: string;
      wordCount?: number;
      moodBefore?: string | null;
      moodAfter?: string | null;
      tags?: string[];
    } = {};
    if (entryText !== undefined) {
      updateData.entryText = entryText;
      updateData.wordCount = entryText.trim().split(/\s+/).filter(Boolean).length;
    }
    if (moodBefore !== undefined) updateData.moodBefore = moodBefore;
    if (moodAfter !== undefined) updateData.moodAfter = moodAfter;
    if (tags !== undefined) updateData.tags = tags;

    const updatedEntry = await prisma.journalEntry.update({
      where: { id: entryId },
      data: updateData,
    });

    await logAudit({
      userId,
      action: "update_entry",
      resourceType: "journal_entry",
      resourceId: entryId,
      status: "success",
    });

    return NextResponse.json({
      success: true,
      data: updatedEntry,
    });
  } catch (error) {
    console.error("Failed to update entry:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/entries/[id]
 * Deletes a single entry and audits the action. Related AI reflections are cascade deleted by DB configuration.
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const authResult = await requireAuth();
  if ("error" in authResult) return authResult.error;
  const { user } = authResult;
  const userId = parseInt(user.id, 10);

  const { id } = await params;
  const entryId = parseInt(id, 10);

  if (isNaN(entryId)) {
    return NextResponse.json(
      { success: false, message: "Invalid entry ID" },
      { status: 400 }
    );
  }

  try {
    const entry = await prisma.journalEntry.findUnique({
      where: { id: entryId },
    });

    if (!entry) {
      return NextResponse.json(
        { success: false, message: "Entry not found" },
        { status: 404 }
      );
    }

    if (entry.userId !== userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access to entry" },
        { status: 403 }
      );
    }

    await prisma.journalEntry.delete({
      where: { id: entryId },
    });

    await logAudit({
      userId,
      action: "delete_entry",
      resourceType: "journal_entry",
      resourceId: entryId,
      status: "success",
    });

    return NextResponse.json({
      success: true,
      message: "Entry deleted successfully",
    });
  } catch (error) {
    console.error("Failed to delete entry:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
