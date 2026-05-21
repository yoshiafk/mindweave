import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import prisma from "@/lib/prisma";

/**
 * GET /api/entries/stats
 * Calculates journaling stats for the authenticated user.
 */
export async function GET(request: Request) {
  const authResult = await requireAuth();
  if ("error" in authResult) return authResult.error;
  const { user } = authResult;
  const userId = parseInt(user.id, 10);

  const timezone = request.headers.get("x-vercel-ip-timezone") || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

  try {
    // 1. Fetch all entry dates and word counts for streak & count calculations
    const entries = await prisma.journalEntry.findMany({
      where: { userId },
      select: {
        entryDate: true,
        wordCount: true,
        moodBefore: true,
        tags: true,
      },
      orderBy: { entryDate: "desc" },
    });

    const totalEntries = entries.length;

    // Helper to format Date objects as YYYY-MM-DD in UTC (since database Date columns return UTC midnight)
    const getUTCDateString = (d: Date) => {
      const year = d.getUTCFullYear();
      const month = String(d.getUTCMonth() + 1).padStart(2, "0");
      const day = String(d.getUTCDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    // Longest Streak calculation using UTC date calculations to prevent TZ errors
    const parseUTCDate = (dateStr: string) => {
      const [year, month, day] = dateStr.split("-").map(Number);
      return new Date(Date.UTC(year, month - 1, day));
    };

    // Helper to format current date as YYYY-MM-DD in the user's timezone
    const getTodayDateString = (tz: string) => {
      try {
        const formatter = new Intl.DateTimeFormat("en-CA", {
          timeZone: tz,
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        });
        return formatter.format(new Date());
      } catch (e) {
        return getUTCDateString(new Date());
      }
    };

    const uniqueDates = Array.from(
      new Set(entries.map((e: any) => getUTCDateString(e.entryDate)))
    ).sort((a, b) => b.localeCompare(a)); // Newest to oldest

    // 2. Streak Analysis
    let currentStreak = 0;
    let longestStreak = 0;

    const todayStr = getTodayDateString(timezone);
    const yesterdayDate = parseUTCDate(todayStr);
    yesterdayDate.setUTCDate(yesterdayDate.getUTCDate() - 1);
    const yesterdayStr = getUTCDateString(yesterdayDate);

    const wroteToday = uniqueDates.includes(todayStr);
    const wroteYesterday = uniqueDates.includes(yesterdayStr);

    if (wroteToday || wroteYesterday) {
      const checkDate = parseUTCDate(wroteToday ? todayStr : yesterdayStr);
      let checkStr = getUTCDateString(checkDate);

      while (uniqueDates.includes(checkStr)) {
        currentStreak++;
        checkDate.setUTCDate(checkDate.getUTCDate() - 1);
        checkStr = getUTCDateString(checkDate);
      }
    }

    const ascendingDates = [...uniqueDates].reverse();
    if (ascendingDates.length > 0) {
      let tempStreak = 1;
      longestStreak = 1;

      for (let i = 1; i < ascendingDates.length; i++) {
        const prev = parseUTCDate(ascendingDates[i - 1]);
        const curr = parseUTCDate(ascendingDates[i]);
        
        const diffTime = Math.abs(curr.getTime() - prev.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          tempStreak++;
        } else if (diffDays > 1) {
          tempStreak = 1;
        }

        if (tempStreak > longestStreak) {
          longestStreak = tempStreak;
        }
      }
    }

    if (currentStreak > longestStreak) {
      longestStreak = currentStreak;
    }

    // 3. Word Count Stats
    const totalWords = entries.reduce((sum, e: any) => sum + (e.wordCount || 0), 0);
    const averageWordsPerEntry = totalEntries > 0 ? Math.round(totalWords / totalEntries) : 0;

    // 4. Recent Volume (Week and Month) relative to user's local today date
    const sevenDaysAgo = parseUTCDate(todayStr);
    sevenDaysAgo.setUTCDate(sevenDaysAgo.getUTCDate() - 7);

    const thirtyDaysAgo = parseUTCDate(todayStr);
    thirtyDaysAgo.setUTCDate(thirtyDaysAgo.getUTCDate() - 30);

    const entriesThisWeek = entries.filter((e: any) => e.entryDate >= sevenDaysAgo).length;
    const entriesThisMonth = entries.filter((e: any) => e.entryDate >= thirtyDaysAgo).length;

    // 5. Mood Frequency (distribution)
    const moodDistribution: Record<string, number> = {
      heavy: 0,
      sad: 0,
      okay: 0,
      good: 0,
      great: 0,
    };

    entries.forEach((e: any) => {
      if (e.moodBefore && e.moodBefore in moodDistribution) {
        moodDistribution[e.moodBefore]++;
      }
    });

    // 6. Common Tags (Top 5)
    const tagCounts: Record<string, number> = {};
    entries.forEach((e: any) => {
      e.tags.forEach((tag: any) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    const commonTags = Object.entries(tagCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return NextResponse.json({
      success: true,
      data: {
        totalEntries,
        streaks: {
          current: currentStreak,
          longest: longestStreak,
        },
        wordCount: {
          total: totalWords,
          average: averageWordsPerEntry,
        },
        volume: {
          week: entriesThisWeek,
          month: entriesThisMonth,
        },
        moodDistribution,
        commonTags,
      },
    });
  } catch (error) {
    console.error("Failed to generate journal statistics:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
