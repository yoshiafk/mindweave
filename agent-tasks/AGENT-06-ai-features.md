# AGENT-06: AI Features — Reflections, Insights, Monthly Reports

> **Pre-requisite:** Read [AGENT-00-context.md](file:///Users/yoshiafk/Development/Personal%20Project/mindweave/agent-tasks/AGENT-00-context.md) first.  
> **Depends on:** AGENT-01 through AGENT-05

---

## Objective

Build the remaining AI-powered features: post-entry reflective responses, pattern recognition insights, contextual writing prompts, and monthly deep insights report. These are primarily premium features (except basic writing prompts for free users).

---

## Design Reference

- PRD Section 3.3: AI Companion & Insights
- PRD Section 3.1: Writing Prompts (AI-Powered)
- PRD Section 4.2: AI Tone & Guidelines
- Agent Task Doc: AI Features Endpoints (Section 6)

---

## Tasks

### 6.1 AI Reflection Generation

Create `src/lib/ai/reflection-generator.ts`:

After a user saves an entry (if they have `receive_ai_reflections` permission and it's enabled):

```typescript
export async function generateReflection(params: {
  entryText: string;
  moodBefore?: string;
  recentEntries?: string[]; // Last 3-5 entries for context
}): Promise<string> {
  // Call Gemini with reflection prompt
  // Tone: empathetic, non-judgmental, trauma-informed
  // NOT advice — gentle reflection
  // Example output:
  // "It sounds like today was heavy. But you came here and wrote it out—
  //  that takes courage. What would you say to a friend feeling this way?"
}
```

**Integration points:**
- Trigger after entry creation (if user preference enables it)
- Store in `ai_reflections` table
- Display on entry detail page and in notification-style card

### 6.2 AI Reflection API Routes

Create `src/app/api/ai/reflections/route.ts`:

**GET** — Get reflections
- Auth required, permission: `receive_ai_reflections`
- Query params: entry_id, unread_only, page, limit
- Return reflections with associated entry info

Create `src/app/api/ai/reflections/[id]/read/route.ts`:

**POST** — Mark reflection as read

### 6.3 Pattern Insight Analysis

Create `src/lib/ai/insight-analyzer.ts`:

Analyzes user's entries over time to identify patterns:

```typescript
export async function analyzePatterns(params: {
  entries: JournalEntry[];
  existingInsights: PatternInsight[];
  dateRange: { start: Date; end: Date };
}): Promise<{
  insights: Array<{
    type: "trigger" | "coping_mechanism" | "mood_correlation" | "writing_pattern";
    title: string;
    description: string;
    supportingData: Record<string, unknown>;
    confidenceScore: number;
  }>;
}> {
  // Analyze entries for:
  // - Recurring words/phrases → themes
  // - Mood patterns (what days are better/worse)
  // - Coping mechanisms (actions that correlate with mood improvement)
  // - Writing patterns (length, frequency)
  // - Triggers (situations that precede negative moods)
}
```

**Trigger conditions:**
- Run after user accumulates 7+ days of entries
- Re-run weekly or when significant new data
- Use Vercel Cron or trigger on nth entry creation

### 6.4 Pattern Insight API Routes

Create `src/app/api/ai/insights/route.ts`:

**GET** — Get pattern insights
- Auth required, permission: `view_pattern_insights`
- Query params: type, acknowledged, page, limit
- Return insights sorted by creation date

Create `src/app/api/ai/insights/[id]/acknowledge/route.ts`:

**POST** — Acknowledge an insight (user has seen it)

### 6.5 Contextual Writing Prompt Generation

Create `src/app/api/ai/prompts/route.ts`:

**GET** — Generate contextual writing prompt
- Auth required
- Uses recent entries and identified themes for context
- Fallback to static prompts if AI unavailable or rate limited
- Returns a single prompt string

Prompt generation considers:
- Recent writing themes
- Time since last entry
- Identified emotional patterns
- Time of day
- Example: "What made you feel safe today?" / "What would you tell yourself from last month?"

### 6.6 Monthly Report Generation

Create `src/lib/ai/report-generator.ts`:

```typescript
export async function generateMonthlyReport(params: {
  entries: JournalEntry[];
  stories: WeeklyStory[];
  insights: PatternInsight[];
  month: string; // "2026-05"
}): Promise<{
  summary: string;
  moodTrends: { week: string; avgMood: number }[];
  writingStats: { totalEntries: number; totalWords: number; avgPerDay: number };
  topThemes: string[];
  triggerPatterns: string[];
  copingStrategies: string[];
  growthAreas: string[];
  suggestedPrompts: string[];
}> {
  // Deep analysis of full month
  // Identify trends, triggers, coping strategies
  // Generate visual-ready data
}
```

Create `src/app/api/ai/monthly-report/route.ts`:

**POST** — Generate monthly report
- Auth required, permission: `generate_monthly_report` (premium only)
- Validate month parameter
- Rate limited (1 per month)
- Returns structured report data

### 6.7 Build AI Reflection Card Component

Create `src/components/journal/ai-reflection-card.tsx`:

Per Design Spec Section 4.1 (AI Response Arrival):
- Card slides up from bottom (Framer Motion)
- Gentle bounce on entry (400ms)
- Warm cream/lavender background
- Subtle AI indicator icon (✨ or 💭)
- Reflection text in slightly different font style
- "Was this helpful?" feedback (thumbs up/down)
- Mark as read on view
- Dismissible

### 6.8 Build Insight Card Component

Create `src/components/insights/insight-card.tsx`:

Per Design Spec Section 3.2 (Screen 3):
```
┌─────────────────────────────┐
│ 💡 You've mentioned "walk"  │
│    8 times this month. It   │
│    seems to help you feel   │
│    grounded.                │
└─────────────────────────────┘
```

Implementation:
- Icon based on insight type (💡 pattern, 🌱 growth, ⚡ trigger, 🛡️ coping)
- Title in semi-bold
- Description in regular weight
- Supporting data (frequency, percentage) subtly shown
- Confidence indicator (subtle, not shown to user — used internally)
- "Got it" dismiss button (acknowledge)
- Warm, human language

---

## Verification

- [ ] AI reflection generates after entry creation (when enabled)
- [ ] Reflection displays correctly on entry detail page
- [ ] Pattern insights generate for users with 7+ days of data
- [ ] Insights show correct type icons and descriptions
- [ ] Acknowledge insight marks as read
- [ ] Writing prompts are contextual when AI available, static as fallback
- [ ] Monthly report generates for premium users only
- [ ] Rate limiting works for AI calls
- [ ] AI tone matches spec (empathetic, not clinical)
- [ ] Error handling for AI API failures (graceful degradation)
- [ ] Free users see premium gate when trying to access AI features

---

## Files Created/Modified

| File | Action |
|------|--------|
| `src/lib/ai/reflection-generator.ts` | Created |
| `src/lib/ai/insight-analyzer.ts` | Created |
| `src/lib/ai/report-generator.ts` | Created |
| `src/app/api/ai/reflections/route.ts` | Created |
| `src/app/api/ai/reflections/[id]/read/route.ts` | Created |
| `src/app/api/ai/insights/route.ts` | Created |
| `src/app/api/ai/insights/[id]/acknowledge/route.ts` | Created |
| `src/app/api/ai/prompts/route.ts` | Created |
| `src/app/api/ai/monthly-report/route.ts` | Created |
| `src/components/journal/ai-reflection-card.tsx` | Created |
| `src/components/insights/insight-card.tsx` | Created |
| `src/components/shared/premium-gate.tsx` | Created |

---

**Estimated Time:** 3–4 hours  
**Next Task:** [AGENT-07 — Insights & Charts](file:///Users/yoshiafk/Development/Personal%20Project/mindweave/agent-tasks/AGENT-07-insights.md)
