# AGENT-05: Weekly Stories — AI Story Generation

> **Pre-requisite:** Read [AGENT-00-context.md](file:///Users/yoshiafk/Development/Personal%20Project/mindweave/agent-tasks/AGENT-00-context.md) first.  
> **Depends on:** AGENT-01 through AGENT-04

---

## Objective

Build the Weekly Story feature — MindWeave's signature AI feature. Every week, the app transforms journal entries into a cohesive, beautifully formatted narrative. Includes the Gemini API integration, story generation API, story viewer page, emotional journey visualization, and story archive.

---

## Design Reference

- **Screen 2: Weekly Story** — Design Spec Section 3.2
- **Story Card** — Design Spec Section 3.3
- **Weekly Story Unlock Animation** — Design Spec Section 13.2
- **Empty State: No Stories Yet** — Design Spec Section 9.2
- **Sample Weekly Story** — PRD Section 14.1

---

## Tasks

### 5.1 Create Gemini AI Client

Create `src/lib/ai/client.ts`:
```typescript
import { GoogleGenerativeAI } from "@google/generative-ai";

export const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const geminiModel = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
});
```

### 5.2 Create AI Prompt Templates

Create `src/lib/ai/prompts.ts`:

**System prompt for story generation** (per PRD Section 4.2 — AI Tone):

```
You are a compassionate, empathetic narrative writer helping someone on their healing journey.

Core principles:
- Empathetic, never clinical
- Reflective, not prescriptive
- Recognize complexity of emotions
- Never minimize pain or rush healing
- Focus on the user's own words and strength
- Avoid toxic positivity
- Maintain the user's voice and style

Your tone examples:
✅ "You wrote about feeling lost, but also about taking that walk anyway. That's courage."
❌ "Don't worry, everything happens for a reason!"
✅ "This week had heavy moments, and you met them with honesty."
❌ "You should try to be more positive."
```

**Story generation prompt** — include:
- Narrative style instruction (third_person / letter / chapter)
- The week's entries (date, mood, text)
- Request structured output: story content, emotional journey, key themes, highlighted quotes, strength recognition
- Use JSON output format for structured extraction

**AI reflection prompt** — for post-entry reflections
**Writing prompt generation** — for contextual writing prompts

### 5.3 Create Story Generator Service

Create `src/lib/ai/story-generator.ts`:

```typescript
export async function generateWeeklyStory(params: {
  entries: JournalEntry[];
  narrativeStyle: NarrativeStyle;
  userName: string;
}): Promise<{
  content: string;
  emotionalJourney: { day: string; mood: string }[];
  themes: string[];
  quotes: string[];
  strengthRecognition: string;
}> {
  // 1. Validate minimum entries (at least 2)
  // 2. Build prompt with entries data
  // 3. Call Gemini API (gemini-2.5-flash)
  // 4. Parse structured response
  // 5. Return story components
}
```

### 5.4 Create Story API Routes

#### `src/app/api/stories/generate/route.ts`

**POST** — Generate weekly story
- Auth required, permission: `generate_weekly_story`
- Rate limit: check AI rate limit (4 calls/week for free, more for premium)
- Validate: weekStartDate, narrativeStyle
- Free users: only `third_person` style
- Premium users: any style
- Fetch entries for that week
- Require at least 2 entries
- Call story generator
- Save to `weekly_stories` table
- Return generated story

#### `src/app/api/stories/route.ts`

**GET** — List all user's stories (paginated)
- Auth required
- Sort by weekStartDate DESC
- Include basic metadata (no full content in list)

#### `src/app/api/stories/[id]/route.ts`

**GET** — Get full story with all details
- Auth required, verify ownership
- Return complete story with emotional journey, themes, quotes

#### `src/app/api/stories/[id]/favorite/route.ts`

**PUT** — Toggle favorite status
- Auth required, verify ownership

### 5.5 Create Zod Validators

Create `src/lib/validators/story.ts`:
```typescript
export const generateStorySchema = z.object({
  weekStartDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  narrativeStyle: z.enum(["third_person", "letter", "chapter"]).default("third_person"),
});
```

### 5.6 Create TanStack Query Hooks

Create `src/hooks/use-stories.ts`:
```typescript
// useStories() — list with pagination
// useStory(id) — single story
// useGenerateStory() — mutation
// useToggleFavorite() — mutation
```

### 5.7 Build Emotional Journey Visualization

Create `src/components/stories/emotional-journey.tsx`:

Per Design Spec:
```
Emotional Journey
▓▓▓░░░▓░░░░░░░░▓▓
Mon  Wed  Fri  Sun
```

Implementation:
- Horizontal bar/timeline showing 7 days
- Each day colored by mood (using mood colors from design spec)
- Day labels below
- Abstract and artistic — not a clinical chart
- Use mood indicator colors:
  - Heavy: `#2D3E50` (deep blue)
  - Sad: `#8B95A5` (misty gray)
  - Okay: `#D4A5A5` (soft rose)
  - Good: `#E8D4A0` (pale gold)
  - Great: `#6B8E7B` (forest green)
- Subtle animation on load (segments fill in sequentially)
- Days without entries shown as neutral/empty

### 5.8 Build Story Card Component

Create `src/components/stories/story-card.tsx`:

Per Design Spec (Story Card — Special):
```
╭─────────────────────────────╮
│                             │  Background: Gradient
│   Week of March 15-21       │  (Twilight Blue → Soft Lavender)
│                             │  Border Radius: 20px
│   "This week, you learned   │  Padding: 24px
│   that healing..."          │  Text: White
│                             │  Shadow: Medium
│   [Read Story →]            │
│                             │
╰─────────────────────────────╯
```

Implementation:
- Gradient background (twilight blue → soft lavender)
- White text
- 20px border radius
- Story title and first 3 lines preview
- "Read Story →" link
- Favorite indicator (heart icon)
- Entry count badge
- Pulse/shimmer animation when new story is available

### 5.9 Build Story Style Picker

Create `src/components/stories/story-style-picker.tsx`:

For choosing narrative style before/during generation:
- Three options: Third Person, Letter, Chapter
- Visual cards with example preview
- Free users: only Third Person (others show premium lock)
- Use shadcn `<ToggleGroup>` or custom radio cards
- Description for each:
  - Third Person: "This week, they learned that healing isn't linear..."
  - Letter: "Dear [Name], This week you showed courage when..."
  - Chapter: "Chapter 7: The Week of Small Victories"

### 5.10 Build Story Reader Component

Create `src/components/stories/story-reader.tsx`:

Full story reading experience (per Design Spec):
- Generous margins (20% left/right on desktop, 16px mobile)
- Serif font at 19pt (Lora) — `story-text` class
- Soft gradient background (subtle, not overpowering)
- Section breaks with subtle ornaments (em dash or decorative divider)
- Emotional journey timeline at top
- Key themes displayed as badges
- Highlighted quotes in special styling (larger, italic, indented)
- Strength recognition in a highlighted card
- Regenerate button (🔄) with style picker
- Favorite button (heart)
- Back navigation

### 5.11 Build Stories Page

Create `src/app/(app)/stories/page.tsx`:

Per Design Spec Screen 2:
```
┌─────────────────────────────────────┐
│  ← Your Stories                     │
├─────────────────────────────────────┤
│                                     │
│  ✨ Your Week                       │  Latest story card
│  January 15-21, 2026                │  (gradient, prominent)
│                                     │
│  [Emotional Journey timeline]       │
│                                     │
│  [Story preview card]               │  "Read Full Story →"
│                                     │
│  Key Themes                         │
│  • Self-compassion                  │
│                                     │
│  Previous Stories                   │
│  📖 Jan 8-14                        │  Story archive list
│  📖 Jan 1-7                         │
└─────────────────────────────────────┘
```

Implementation:
- Latest story prominently displayed at top
- Previous stories in a list below
- Empty state (per Design Spec 9.2): "Your first story arrives Sunday" with progress bar
- Loading skeleton while generating
- Generate button if no story for current week
- Pull-to-refresh to check for new story

### 5.12 Build Full Story View Page

Create `src/app/(app)/stories/[id]/page.tsx`:
- Full `<StoryReader>` component
- Server component for data fetching
- SEO-friendly (story title in page title)
- Share functionality (stripped of personal details — future feature)

---

## Verification

- [ ] Story generation calls Gemini API and returns valid story
- [ ] Generated story saves to database with all metadata
- [ ] Story list shows all user's stories paginated
- [ ] Emotional journey visualization renders with correct colors
- [ ] Story card shows gradient background and preview text
- [ ] Story reader displays in serif font with proper formatting
- [ ] Free users can only use "third_person" style
- [ ] Premium users can choose any narrative style
- [ ] Regenerate creates new story (same week, different style)
- [ ] Favorite toggle works
- [ ] Empty state shows progress toward first story
- [ ] Rate limiting prevents excessive AI calls
- [ ] Story generation works with 2+ entries for the week
- [ ] Error handling for insufficient entries

---

## Files Created/Modified

| File | Action |
|------|--------|
| `src/lib/ai/client.ts` | Created |
| `src/lib/ai/prompts.ts` | Created |
| `src/lib/ai/story-generator.ts` | Created |
| `src/lib/validators/story.ts` | Created |
| `src/hooks/use-stories.ts` | Created |
| `src/app/api/stories/generate/route.ts` | Created |
| `src/app/api/stories/route.ts` | Created |
| `src/app/api/stories/[id]/route.ts` | Created |
| `src/app/api/stories/[id]/favorite/route.ts` | Created |
| `src/components/stories/emotional-journey.tsx` | Created |
| `src/components/stories/story-card.tsx` | Created |
| `src/components/stories/story-style-picker.tsx` | Created |
| `src/components/stories/story-reader.tsx` | Created |
| `src/app/(app)/stories/page.tsx` | Created |
| `src/app/(app)/stories/[id]/page.tsx` | Created |

---

**Estimated Time:** 4–5 hours  
**Next Task:** [AGENT-06 — AI Features](file:///Users/yoshiafk/Development/Personal%20Project/mindweave/agent-tasks/AGENT-06-ai-features.md)
