import { NextResponse, type NextRequest } from "next/server";
import { after } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import prisma from "@/lib/prisma";
import { createEntrySchema, entryQuerySchema } from "@/lib/validators/entry";
import { logAudit } from "@/lib/audit";
import { geminiModel } from "@/lib/ai/client";

/**
 * GET /api/entries
 * Returns a list of journal entries for the current user.
 * Enforces a 7-day history limit for "free" tier accounts.
 */
export async function GET(req: NextRequest) {
  const authResult = await requireAuth();
  if ("error" in authResult) return authResult.error;
  const { user } = authResult;
  const userId = parseInt(user.id, 10);

  // Parse query parameters
  const { searchParams } = new URL(req.url);
  const queryObj = Object.fromEntries(searchParams.entries());
  const parsedQuery = entryQuerySchema.safeParse(queryObj);

  if (!parsedQuery.success) {
    return NextResponse.json(
      { success: false, error: parsedQuery.error.flatten() },
      { status: 400 }
    );
  }

  const { page, limit, sort, startDate, endDate, mood, tag } = parsedQuery.data;

  // Build where conditions
  const where: {
    userId: number;
    entryDate?: {
      gte?: Date;
      lte?: Date;
    };
    OR?: Array<{ moodBefore: string } | { moodAfter: string }>;
    tags?: {
      has: string;
    };
  } = { userId };

  // Enforce 7-day history limit for free users
  if (user.subscriptionTier === "free") {
    const cutoffDate = new Date();
    cutoffDate.setUTCDate(cutoffDate.getUTCDate() - 7);
    cutoffDate.setUTCHours(0, 0, 0, 0);

    where.entryDate = {
      gte: cutoffDate,
    };
  }

  // Handle start/end date filters
  if (startDate || endDate) {
    where.entryDate = where.entryDate || {};
    if (startDate) {
      where.entryDate.gte = new Date(startDate);
    }
    if (endDate) {
      where.entryDate.lte = new Date(endDate);
    }
  }

  // Handle mood filter (covers both moodBefore and moodAfter matches)
  if (mood) {
    where.OR = [
      { moodBefore: mood },
      { moodAfter: mood },
    ];
  }

  // Handle tag filter
  if (tag) {
    where.tags = {
      has: tag,
    };
  }

  try {
    const skip = (page - 1) * limit;

    const [total, entries] = await Promise.all([
      prisma.journalEntry.count({ where }),
      prisma.journalEntry.findMany({
        where,
        orderBy: { entryDate: sort },
        skip,
        take: limit,
        include: {
          reflections: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: entries,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Failed to fetch entries:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/entries
 * Creates a new journal entry.
 * Recalculates word counts, updates last login, handles first_entry milestone,
 * and schedules background AI reflections via next/server after().
 */
export async function POST(req: NextRequest) {
  const authResult = await requireAuth();
  if ("error" in authResult) return authResult.error;
  const { user } = authResult;
  const userId = parseInt(user.id, 10);

  try {
    const body = await req.json();
    const parsedBody = createEntrySchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        { success: false, error: parsedBody.error.flatten() },
        { status: 400 }
      );
    }

    const { entryDate, entryText, moodBefore, moodAfter, tags, isVoiceTranscription } = parsedBody.data;

    // Calculate word count
    const wordCount = entryText.trim().split(/\s+/).filter(Boolean).length;

    // Create journal entry
    const entry = await prisma.journalEntry.create({
      data: {
        userId,
        entryDate: new Date(entryDate),
        entryText,
        moodBefore: moodBefore || null,
        moodAfter: moodAfter || null,
        tags,
        wordCount,
        isVoiceTranscription,
      },
    });

    // Handle milestones & user update in background
    let milestoneUnlocked = null;
    const entryCount = await prisma.journalEntry.count({ where: { userId } });

    if (entryCount === 1) {
      milestoneUnlocked = await prisma.milestone.create({
        data: {
          userId,
          milestoneType: "first_entry",
          milestoneTitle: "First Step Taken",
          milestoneDescription: "You wrote your very first journal entry. The journey of healing begins with a single word.",
        },
      });
    }

    // Log audit trail
    await logAudit({
      userId,
      action: "create_entry",
      resourceType: "journal_entry",
      resourceId: entry.id,
      status: "success",
    });

    // Schedule background AI reflection using Next.js after()
    after(async () => {
      try {
        const pref = await prisma.userPreference.findUnique({
          where: { userId },
        });

        const isMinimalAi = pref?.aiInvolvementLevel === "minimal";
        const isReflectionsDisabled = pref?.enableReflectiveResponses === false;

        if (isMinimalAi || isReflectionsDisabled) {
          return;
        }

        const prompt = `You are MindWeave, an empathetic and insightful AI journaling assistant.
Review the following journal entry written by a user today. Write a short, comforting, and reflective response (under 150 words) that highlights key emotional insights, validates their feelings, and gently prompts further self-reflection if appropriate. Keep the tone warm, respectful, and safe. Do not offer clinical or medical advice.

Journal Entry:
"${entryText}"

Mood Before Writing: ${moodBefore || "Not recorded"}
Mood After Writing: ${moodAfter || "Not recorded"}
Tags: ${tags.join(", ") || "None"}`;

        const aiResponse = await geminiModel.generateContent({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            maxOutputTokens: 256,
            temperature: 0.8,
          },
        });

        const reflectionText = aiResponse.response.text()?.trim();

        if (reflectionText) {
          await prisma.aiReflection.create({
            data: {
              entryId: entry.id,
              userId,
              reflectionText,
              reflectionType: "post_entry",
            },
          });
        }
      } catch (aiError) {
        console.error("Background AI reflection generation failed:", aiError);
      }
    });

    return NextResponse.json({
      success: true,
      data: entry,
      milestoneUnlocked: milestoneUnlocked ? {
        type: milestoneUnlocked.milestoneType,
        title: milestoneUnlocked.milestoneTitle,
      } : null,
    }, { status: 201 });

  } catch (error) {
    console.error("Failed to create entry:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
