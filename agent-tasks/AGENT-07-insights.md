# AGENT-07: Insights Dashboard & Charts

> **Pre-requisite:** Read [AGENT-00-context.md](file:///Users/yoshiafk/Development/Personal%20Project/mindweave/agent-tasks/AGENT-00-context.md) first.  
> **Depends on:** AGENT-01 through AGENT-06

---

## Objective

Build the Insights tab — a visual dashboard showing mood trends, writing streaks, pattern insights, and timeline view. Uses Recharts for data visualization with MindWeave brand colors.

---

## Design Reference

- **Screen 3: Insights** — Design Spec Section 3.2
- **Empty State: Not Enough Data** — Design Spec Section 9.3
- **PRD Section 3.4:** Motivation & Engagement (milestones, streaks, journey map)

---

## Tasks

### 7.1 Build Streak Card Component

Create `src/components/insights/streak-card.tsx`:

```
┌─────────────────────────────┐
│  21 days of writing         │
│  ✨ Keep going              │
└─────────────────────────────┘
```

- Current streak number prominently displayed
- Encouraging message (from copy library)
- Milestone indicator if reaching a milestone (7, 14, 30, 60, 100 days)
- Subtle animation when streak increases
- Icon changes based on streak length

### 7.2 Build Mood Over Time Chart

Create `src/components/insights/mood-chart.tsx`:

Per Design Spec:
```
📊 Mood Over Time
     ╱╲    ╱╲
    ╱  ╲  ╱  ╲
 ──╱────╲╱────╲────
  Week 1  Week 2  Week 3
```

Implementation with Recharts:
- Line/Area chart showing mood trends over time
- X-axis: days or weeks (configurable)
- Y-axis: mood scale (heavy=1, sad=2, okay=3, good=4, great=5)
- Use mood colors for the line gradient
- Brand colors (twilight blue for line, soft lavender for area fill)
- Simplified — not clinical, feels artistic
- Tooltip showing date and mood on hover
- Filter: Last 7 days, 30 days, 3 months
- Responsive sizing
- No grid lines — clean look

### 7.3 Build Mood Distribution Chart

Create `src/components/insights/mood-distribution.tsx`:

- Horizontal bar chart or donut chart
- Shows percentage of each mood type
- Each mood colored with its design spec color
- Emoji labels
- Subtle entrance animation

### 7.4 Build Tag Cloud / Common Tags

Create `src/components/insights/tag-cloud.tsx`:

- Most common tags displayed as badges
- Size/weight indicates frequency
- Top 5-8 tags
- Color coded

### 7.5 Build Timeline View Component

Create `src/components/insights/timeline-view.tsx`:

Per PRD (Visual Journey Map):
- Timeline view of all entries with mood indicators
- Can see patterns at a glance (dark weeks vs. lighter weeks)
- Calendar grid with mood-colored dots
- Click/tap any day to see entry preview
- Scrollable by month
- Uses mood indicator colors from design spec

Implementation:
- Monthly calendar grid
- Each day with entry shows colored dot (mood color)
- Days without entries are empty/gray
- Tap → shows entry preview in a sheet/popover
- "Looking Back" feature: highlight "on this day last month"

### 7.6 Build Writing Stats Card

Create `src/components/insights/writing-stats.tsx`:

- Total entries count
- Total words written
- Average words per entry
- Entries this week/month
- Use subtle counter animation on load

### 7.7 Build Milestone Component

Create `src/components/insights/milestone-card.tsx`:

Per PRD Section 3.4:
- "10 entries completed"
- "First full month of journaling"
- "100 days of self-reflection"
- Each milestone has warm celebratory design
- Soft confetti animation for new milestones (subtle, per design spec)
- Icon based on milestone type (🌱 first entry, 🌿 7 days, 🌳 30 days, ⭐ 100 days)

### 7.8 Build Insights Page

Create `src/app/(app)/insights/page.tsx`:

Per Design Spec Screen 3:
```
┌─────────────────────────────────────┐
│  Insights                    [Filter]│
├─────────────────────────────────────┤
│                                     │
│  [21 days writing streak card]      │
│                                     │
│  Emotional Patterns                 │
│  [Mood Over Time chart]             │
│                                     │
│  Recent Insights                    │
│  [💡 Insight card 1]               │
│  [🌱 Insight card 2]               │
│                                     │
│  [View Full Timeline →]             │
└─────────────────────────────────────┘
```

Implementation:
- Cards-based layout for scannability
- Streak card at top
- Mood chart below
- AI pattern insights (from AGENT-06) in cards
- Writing stats card
- Link to full timeline view
- Empty state (per Design Spec 9.3): "Building your insights... We need at least 7 days of writing to spot meaningful patterns."
- Filter button for time range

### 7.9 Build Full Timeline Page

Create `src/app/(app)/insights/timeline/page.tsx`:
- Full timeline/calendar view
- Monthly navigation (prev/next)
- Mood dots on each day
- Tap to preview entry
- "Looking Back" highlights

### 7.10 Create Milestone Checking Logic

Create `src/lib/milestones.ts`:

```typescript
const MILESTONE_DEFINITIONS = [
  { type: "first_entry", title: "First Step", description: "You wrote your first entry", condition: (stats) => stats.totalEntries >= 1 },
  { type: "7_day_streak", title: "One Week Strong", description: "7 consecutive days of writing", condition: (stats) => stats.currentStreak >= 7 },
  { type: "30_day_streak", title: "A Month of Showing Up", description: "30 consecutive days of writing", condition: (stats) => stats.currentStreak >= 30 },
  { type: "50_entries", title: "Fifty Stories", description: "You've written 50 entries", condition: (stats) => stats.totalEntries >= 50 },
  { type: "100_entries", title: "Centurion of Self-Reflection", description: "100 entries — you're committed to your journey", condition: (stats) => stats.totalEntries >= 100 },
  { type: "first_story", title: "Your First Story", description: "You received your first weekly story", condition: (stats) => stats.totalStories >= 1 },
  { type: "10000_words", title: "Ten Thousand Words", description: "You've written more than 10,000 words", condition: (stats) => stats.totalWords >= 10000 },
];

export async function checkAndCreateMilestones(userId: number) {
  // 1. Get user stats
  // 2. Get existing milestones
  // 3. Check for new milestones not yet achieved
  // 4. Create new milestone records
  // 5. Return newly achieved milestones (for notification)
}
```

Call this function after entry creation and story generation.

---

## Verification

- [ ] Streak card shows correct current streak
- [ ] Mood chart renders with correct data and brand colors
- [ ] Mood distribution shows correct percentages
- [ ] Timeline/calendar shows mood dots on correct days
- [ ] Tapping a day on timeline shows entry preview
- [ ] Insight cards display with correct icons and text
- [ ] Milestones trigger at correct thresholds
- [ ] Empty state shows for users with < 7 days of data
- [ ] All charts are responsive (mobile-friendly)
- [ ] Charts use brand colors (not default Recharts colors)
- [ ] Writing stats show accurate numbers

---

## Files Created/Modified

| File | Action |
|------|--------|
| `src/components/insights/streak-card.tsx` | Created |
| `src/components/insights/mood-chart.tsx` | Created |
| `src/components/insights/mood-distribution.tsx` | Created |
| `src/components/insights/tag-cloud.tsx` | Created |
| `src/components/insights/timeline-view.tsx` | Created |
| `src/components/insights/writing-stats.tsx` | Created |
| `src/components/insights/milestone-card.tsx` | Created |
| `src/hooks/use-insights.ts` | Created |
| `src/lib/milestones.ts` | Created |
| `src/app/(app)/insights/page.tsx` | Created |
| `src/app/(app)/insights/timeline/page.tsx` | Created |

---

**Estimated Time:** 3–4 hours  
**Next Task:** [AGENT-08 — Settings & Preferences](file:///Users/yoshiafk/Development/Personal%20Project/mindweave/agent-tasks/AGENT-08-settings.md)
