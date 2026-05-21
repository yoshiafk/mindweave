# AGENT-04: Journal Entries — Core Feature

> **Pre-requisite:** Read [AGENT-00-context.md](file:///Users/yoshiafk/Development/Personal%20Project/mindweave/agent-tasks/AGENT-00-context.md) first.  
> **Depends on:** AGENT-01, AGENT-02, AGENT-03

---

## Objective

Build the complete journal entry system — the heart of MindWeave. This includes the Write (Home) page, full-screen writing mode, entry CRUD API routes, mood selector, tag picker, entry list, auto-save, and writing prompts. This is where users spend 80% of their time.

---

## Design Reference

Refer to Design Spec sections:
- **Screen 1: Write (Home)** — Section 3.2
- **Screen 4: Full-Screen Writing Mode** — Section 3.2
- **Mood Selector** — Section 3.3
- **Input Field (Journal Entry)** — Section 3.3
- **Empty State: First Entry** — Section 9.1
- **Micro-interactions: Mood Selection, Save Entry** — Section 4.1

---

## Tasks

### 4.1 Create Entry API Routes

#### `src/app/api/entries/route.ts`

**POST** — Create new journal entry
- Auth required, permission: `write_entry`
- Validate with Zod: entryDate, entryText, moodBefore, moodAfter, tags
- Auto-calculate wordCount
- Check for milestones (first_entry, streaks)
- If user has `receive_ai_reflections` permission and it's enabled in preferences, trigger async AI reflection generation
- Return created entry

**GET** — List entries (paginated)
- Auth required, permission: `view_entries`
- Query params: page, limit, sort, start_date, end_date, mood, tag
- Free users: limit to last 7 days of history
- Premium/Master: unlimited history
- Return entries + pagination metadata

#### `src/app/api/entries/[id]/route.ts`

**GET** — Get single entry with AI reflection
- Auth required, verify entry belongs to user
- Include associated AI reflection if exists

**PUT** — Update entry
- Auth required, verify ownership
- Recalculate wordCount on text change
- Validate with Zod

**DELETE** — Delete entry
- Auth required, verify ownership
- Cascade deletes AI reflections
- Log audit event

#### `src/app/api/entries/stats/route.ts`

**GET** — Get journaling statistics
- Total entries, current streak, longest streak
- Total words written, avg words per entry
- Entries this week/month
- Most common tags (top 5)
- Mood distribution (count by mood type)

### 4.2 Create Zod Validation Schemas

Create `src/lib/validators/entry.ts`:
```typescript
import { z } from "zod";
import { MOODS, JOURNAL_TAGS } from "@/types";

export const createEntrySchema = z.object({
  entryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  entryText: z.string().min(1, "Write something...").max(50000),
  moodBefore: z.enum(MOODS).optional(),
  moodAfter: z.enum(MOODS).optional(),
  tags: z.array(z.string()).max(10).default([]),
  isVoiceTranscription: z.boolean().default(false),
});

export const updateEntrySchema = z.object({
  entryText: z.string().min(1).max(50000).optional(),
  moodBefore: z.enum(MOODS).optional(),
  moodAfter: z.enum(MOODS).optional(),
  tags: z.array(z.string()).max(10).optional(),
});

export const entryQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  sort: z.enum(["asc", "desc"]).default("desc"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  mood: z.enum(MOODS).optional(),
  tag: z.string().optional(),
});
```

### 4.3 Create TanStack Query Hooks

Create `src/hooks/use-entries.ts`:
```typescript
// useEntries() — list with pagination, filters
// useEntry(id) — single entry
// useEntryStats() — statistics
// useCreateEntry() — mutation
// useUpdateEntry() — mutation
// useDeleteEntry() — mutation
```

All hooks should:
- Use TanStack Query v5 patterns
- Include optimistic updates for create/update/delete
- Invalidate relevant queries on mutation success
- Handle error states gracefully

### 4.4 Build Mood Selector Component

Create `src/components/journal/mood-selector.tsx`:

Per Design Spec Section 3.3 (Mood Selector):
```
😢    😟    😐    🙂    😊
Heavy  Sad  Okay  Good  Great

Unselected: opacity 0.4, grayscale
Selected: opacity 1.0, scale 1.2, color accent glow
```

Implementation:
- 5 emoji buttons in a row
- Unselected state: `opacity-40 grayscale`
- Selected state: `opacity-100 scale-110` with soft glow (box-shadow)
- Use Framer Motion for scale animation (200ms ease-out)
- Label text below each emoji
- Optional: haptic feedback concept (visual pulse)
- Accessible: proper aria-labels, keyboard navigation
- Controlled component: `value`, `onChange` props

### 4.5 Build Tag Picker Component

Create `src/components/journal/tag-picker.tsx`:

- Horizontal scroll of tag badges
- Use shadcn `<Badge>` + `<Toggle>` or `<ToggleGroup>`
- Tags from `JOURNAL_TAGS` constant
- Selected tags highlighted in twilight blue
- Unselected tags in muted/outline style
- Multi-select behavior
- Animated: subtle scale on toggle
- Optional: custom tag input

### 4.6 Build Entry Editor Component

Create `src/components/journal/entry-editor.tsx`:

This is the core writing experience. Per Design Spec:
- Use Tiptap editor for rich text (minimal — just paragraphs, no toolbar)
- Placeholder text: "Start writing..." (fades to gentle prompt after 30s idle)
- Font: 17pt Regular, line-height 1.6 (`journal-text` class)
- Background: White in light mode, #2A2A2A in dark mode
- Border: 1px #E8E6E1, radius 12px
- Focus state: border changes to twilight blue
- Expands as user types (auto-resize)
- **Auto-save**: Debounced save every 10 seconds of changes
- Auto-save indicator: subtle "Saved 3 seconds ago" text that fades in/out
- Word count display (optional, subtle)

### 4.7 Build Writing Prompt Component

Create `src/components/journal/writing-prompt.tsx`:

Per Design Spec Section 3.2 & 4.1:
- Appears after 30 seconds of idle (no typing in editor)
- Fade-in from bottom animation
- Shows contextual AI-generated prompt or fallback static prompt
- Dismissible with downward swipe / X button
- Static fallback prompts:
  - "What's on your mind right now?"
  - "What would you tell yourself from last month?"
  - "What made you feel safe today?"
  - "What are you grateful for?"
  - "What's something you're carrying today?"

### 4.8 Build Entry Card Component

Create `src/components/journal/entry-card.tsx`:

For the "Your Recent Entries" list on home page:
- Date display (e.g., "Yesterday", "2 days ago", "May 18")
- Entry text preview (truncated to 2 lines)
- Mood emoji indicator
- Tags as small badges
- Word count
- Tap → navigate to full entry view
- Swipe left → delete confirmation (mobile gesture)
- Subtle hover effect

### 4.9 Build Entry List Component

Create `src/components/journal/entry-list.tsx`:

- Renders list of `<EntryCard>` components
- Pagination (infinite scroll or load more button)
- Loading skeletons while fetching
- Empty state when no entries
- Pull-to-refresh concept

### 4.10 Build Write (Home) Page

Create `src/app/(app)/journal/page.tsx`:

Per Design Spec Screen 1:
```
┌─────────────────────────────────────┐
│  MindWeave        [Lock] [•••]      │  Header
├─────────────────────────────────────┤
│  Thursday, May 21                   │  Date (large, soft)
│                                     │
│  How are you feeling?               │  Mood check-in
│  😢  😟  😐  🙂  😊                │
│                                     │
│ ┌─────────────────────────────────┐ │  Journal entry
│ │ Start writing...                │ │  (Tiptap editor)
│ │                                 │ │
│ └─────────────────────────────────┘ │
│                                     │
│  [🏷️ Tags]                         │  Tag picker
│                                     │
│  ─────────────────────────          │
│  Your Recent Entries                │  Last 3 entries
│  • Yesterday - "Finding peace..."   │
│  • 2 days ago - "Today was hard..." │
└─────────────────────────────────────┘
```

Page implementation:
- Server component for initial data fetch (recent entries)
- Client components for interactive parts (editor, mood, tags)
- Today's date displayed prominently
- Mood selector appears first
- Entry editor with auto-save
- Tag picker below editor
- "Done" / save button (or rely on auto-save)
- Recent entries list (last 3)
- Empty state if no entries yet (per Design Spec Section 9.1)

### 4.11 Build Full-Screen Writing Mode

When user taps into the text editor, transition to immersive writing mode:

Per Design Spec Screen 4:
```
┌─────────────────────────────────────┐
│  [✕] Done                           │  Minimal header
├─────────────────────────────────────┤
│  Thursday, May 21                   │  Date, centered
│  😐 Reflective                      │  Selected mood
│                                     │
│  Today I noticed...                 │  User's writing
│  |                                  │  Cursor
│                                     │
│  ─────────────────────────          │
│  💭 Writing Prompt:                 │  After 30s idle
│  "What would you tell your          │
│  yesterday self?"                   │
└─────────────────────────────────────┘
```

Implementation:
- Use shadcn `<Sheet>` (full screen) or CSS transition
- Hides all UI except Done button, date, mood
- Background: single color or soft blur
- Writing prompt appears after 30s idle
- "Done" button triggers post-writing mood check
- Haptic success animation on save (checkmark draw)

### 4.12 Build Single Entry View Page

Create `src/app/(app)/journal/[id]/page.tsx`:
- Display full entry text with date and mood
- Show tags
- Show AI reflection if exists (in a card below)
- Edit button → opens editor pre-filled
- Delete button → confirmation dialog
- Back navigation

### 4.13 Build Post-Writing Mood Check

After user finishes writing (presses "Done"):
- Small modal/sheet: "How are you feeling now?"
- Same mood selector
- "Skip" option
- Compares pre/post mood for insights
- Subtle animation

### 4.14 Create App Layout with Bottom Navigation

Create `src/app/(app)/layout.tsx`:
- App header with MindWeave logo and optional actions
- Main content area (scrollable)
- Bottom tab navigation (per Design Spec Section 3.1):
  - ✍️ Write (Home) → `/journal`
  - 📖 Stories → `/stories`
  - 📊 Insights → `/insights`
  - ⚙️ Settings → `/settings`
- Active tab highlighted with twilight blue
- 44px minimum touch targets
- Hide bottom nav when in full-screen writing mode

Create `src/components/layout/bottom-nav.tsx`:
- Use Lucide icons (PenLine, BookOpen, BarChart3, Settings)
- Active indicator (color + subtle background)
- Smooth transition between tabs
- Fixed at bottom, 60px height
- Safe area inset for notched phones

Create `src/components/layout/app-header.tsx`:
- MindWeave text or logo
- Optional lock icon (if privacy mode enabled)
- Optional actions menu (three dots)

Create `src/components/layout/mobile-shell.tsx`:
- Wrapper that constrains to mobile-like width on desktop (max-width 430px centered)
- Or full responsive layout for web

---

## Verification

- [ ] Create entry saves correctly with all fields
- [ ] Entry list paginates correctly
- [ ] Mood selector animates smoothly (scale + opacity)
- [ ] Tags can be selected/deselected
- [ ] Auto-save works (debounced)
- [ ] "Saved X seconds ago" indicator shows/hides
- [ ] Full-screen writing mode toggles correctly
- [ ] Writing prompt appears after 30s idle
- [ ] Entry card shows preview, mood, tags
- [ ] Empty state shows when no entries
- [ ] Delete entry shows confirmation dialog
- [ ] Entry stats API returns correct calculations
- [ ] Free users see only 7 days of history
- [ ] Bottom navigation works across all tabs
- [ ] Mobile responsive — looks great on 375px width

---

## Files Created/Modified

| File | Action |
|------|--------|
| `src/app/api/entries/route.ts` | Created |
| `src/app/api/entries/[id]/route.ts` | Created |
| `src/app/api/entries/stats/route.ts` | Created |
| `src/lib/validators/entry.ts` | Created |
| `src/hooks/use-entries.ts` | Created |
| `src/components/journal/mood-selector.tsx` | Created |
| `src/components/journal/tag-picker.tsx` | Created |
| `src/components/journal/entry-editor.tsx` | Created |
| `src/components/journal/writing-prompt.tsx` | Created |
| `src/components/journal/entry-card.tsx` | Created |
| `src/components/journal/entry-list.tsx` | Created |
| `src/components/layout/bottom-nav.tsx` | Created |
| `src/components/layout/app-header.tsx` | Created |
| `src/components/layout/mobile-shell.tsx` | Created |
| `src/components/shared/empty-state.tsx` | Created |
| `src/app/(app)/layout.tsx` | Created |
| `src/app/(app)/journal/page.tsx` | Created |
| `src/app/(app)/journal/[id]/page.tsx` | Created |

---

**Estimated Time:** 4–6 hours  
**Next Task:** [AGENT-05 — Weekly Stories](file:///Users/yoshiafk/Development/Personal%20Project/mindweave/agent-tasks/AGENT-05-weekly-stories.md)
