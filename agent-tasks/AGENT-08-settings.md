# AGENT-08: Settings & User Preferences

> **Pre-requisite:** Read [AGENT-00-context.md](file:///Users/yoshiafk/Development/Personal%20Project/mindweave/agent-tasks/AGENT-00-context.md) first.  
> **Depends on:** AGENT-01 through AGENT-03 (auth), AGENT-02 (UserPreference model)

---

## Objective

Build the Settings page with all preference controls: privacy, AI features, notifications, appearance, and account management. Includes the preference API routes and real-time theme switching.

---

## Design Reference

- **Screen: Settings** — Design Spec Section 11
- **Dark Mode** — Design Spec Section 5
- **Accessibility** — Design Spec Section 6

---

## Tasks

### 8.1 Create Preferences API Routes

Create `src/app/api/preferences/route.ts`:

**GET** — Get user preferences
- Auth required
- Return full UserPreference record
- Auto-create default if none exists

**PUT** — Update preferences
- Auth required
- Validate with Zod (partial update allowed)
- Only update provided fields
- Return updated preferences

Create `src/lib/validators/preferences.ts`:
```typescript
export const updatePreferencesSchema = z.object({
  aiInvolvementLevel: z.enum(["full", "moderate", "minimal"]).optional(),
  enableReflectiveResponses: z.boolean().optional(),
  enablePatternInsights: z.boolean().optional(),
  enableWritingPrompts: z.boolean().optional(),
  notificationDailyReminder: z.boolean().optional(),
  notificationTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  notificationWeeklyStory: z.boolean().optional(),
  theme: z.enum(["light", "dark", "system"]).optional(),
  textSize: z.enum(["small", "medium", "large"]).optional(),
  weeklyStoryDay: z.enum(["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]).optional(),
  narrativeStylePreference: z.enum(["third_person", "letter", "chapter"]).optional(),
});
```

### 8.2 Create Preferences Hook

Create `src/hooks/use-preferences.ts`:
```typescript
// usePreferences() — get current preferences
// useUpdatePreferences() — mutation to update
// Optimistic updates for instant toggle feedback
```

### 8.3 Build Settings Page

Create `src/app/(app)/settings/page.tsx`:

Per Design Spec Section 11:
```
┌─────────────────────────────────────┐
│  Settings                           │
├─────────────────────────────────────┤
│  PRIVACY                            │
│  🔒 Face ID / Passcode    [ON]      │
│  ☁️  Cloud Backup         [OFF]     │
│  📤 Export All Entries      →       │
│                                     │
│  AI FEATURES                        │
│  🤖 AI Involvement: Moderate  →     │
│  💬 Reflective Responses  [ON]      │
│  💡 Pattern Insights      [ON]      │
│  ✍️  Writing Prompts      [ON]     │
│                                     │
│  NOTIFICATIONS                      │
│  🔔 Daily Reminders       [ON]      │
│     Time: 8:00 PM           →       │
│  📖 Weekly Story Ready    [ON]      │
│                                     │
│  APPEARANCE                         │
│  🌓 Dark Mode: Auto          →      │
│  📝 Text Size: Medium        →      │
│                                     │
│  ACCOUNT                            │
│  👤 Account Details          →      │
│  💳 Subscription: Free       →      │
│  ❓ Help & Support           →      │
│                                     │
│  Delete All Data                    │
└─────────────────────────────────────┘
```

Implementation:
- Grouped sections with labels (PRIVACY, AI FEATURES, etc.)
- Use shadcn `<Card>` for groups
- Use shadcn `<Switch>` for toggles
- Navigation items use `→` chevron
- Each toggle calls preference update API
- Instant visual feedback (optimistic update)
- "Delete All Data" in destructive red (muted, not aggressive per design spec)

### 8.4 Build AI Settings Component

Create `src/components/settings/ai-settings.tsx`:

- AI Involvement Level selector (Full / Moderate / Minimal)
  - Use shadcn `<Select>` or custom radio cards
  - Descriptions for each level:
    - Full: All AI features enabled
    - Moderate: Weekly stories only (recommended)
    - Minimal: Just journaling, no AI
- Toggle switches for individual features
- Premium gate on premium-only features (reflection, insights, monthly report)
- Features that are off because of AI level should be visually disabled

### 8.5 Build Notification Settings Component

Create `src/components/settings/notification-settings.tsx`:

- Daily reminder toggle
- Time picker for reminder time (shadcn `<Select>` with time options)
- Weekly story notification toggle
- Note: Actual push notifications are future (mobile). For web, this controls email notifications.

### 8.6 Build Appearance Settings Component

Create `src/components/settings/appearance-settings.tsx`:

- Theme selector: Light / Dark / System
  - Use `next-themes` setTheme
  - Visual preview cards showing each mode
  - Smooth transition (500ms fade per design spec)
- Text Size: Small / Medium / Large
  - Update CSS variable for font sizes
  - Preview text showing size
- Store in user preferences (syncs across devices)

### 8.7 Build Account Details Page

Create `src/app/(app)/settings/account/page.tsx`:

- Display name (editable)
- Email (display only)
- Change password link/form
- Account creation date
- Last login
- Delete account button (with confirmation dialog)

### 8.8 Build Subscription Page

Create `src/app/(app)/settings/subscription/page.tsx`:

- Current plan display (Free / Premium)
- Features available in current plan
- If free: "Upgrade to Premium" card (links to premium upgrade flow in AGENT-10)
- If premium: billing details, cancel option, plan details
- Usage stats (AI calls used this week)

### 8.9 Build Export Flow

Create export functionality accessible from Settings:

- Export format selection: PDF, TXT, JSON
- Date range selection
- Include/exclude stories and insights
- Show loading state during export generation
- Download link when complete
- Premium only (permission: `export_data`)

Create `src/app/api/export/route.ts`:
**POST** — Generate export
- Auth required, permission: `export_data`
- Accept format, dateRange, includes
- Generate file (use jspdf for PDF, or server-side text generation)
- Store in Vercel Blob
- Return download URL

### 8.10 Build Delete Confirmation Dialog

Create a shared delete confirmation component:
- Used for "Delete Entry", "Delete All Data", "Delete Account"
- shadcn `<AlertDialog>` with destructive variant
- Requires typing confirmation text for destructive actions
- Muted red color (not aggressive)

### 8.11 Handle Data Deletion

Create `src/app/api/users/me/data/route.ts`:
**DELETE** — Delete all user data
- Auth required
- Delete all entries, stories, reflections, insights, milestones
- Keep user account and preferences
- Audit log the action
- Confirmation required (token-based)

---

## Verification

- [ ] All toggle switches update preferences via API
- [ ] Theme switching works instantly (light/dark/system)
- [ ] Theme persists across page reloads
- [ ] AI involvement level controls feature visibility
- [ ] Premium features show lock icon for free users
- [ ] Text size changes apply globally
- [ ] Account details page shows correct user info
- [ ] Change password validates current password
- [ ] Export generates downloadable file (premium only)
- [ ] Delete confirmation requires explicit input
- [ ] Settings are responsive on mobile
- [ ] All sections grouped correctly per design spec

---

## Files Created/Modified

| File | Action |
|------|--------|
| `src/app/api/preferences/route.ts` | Created |
| `src/app/api/export/route.ts` | Created |
| `src/app/api/users/me/data/route.ts` | Created |
| `src/lib/validators/preferences.ts` | Created |
| `src/hooks/use-preferences.ts` | Created |
| `src/components/settings/ai-settings.tsx` | Created |
| `src/components/settings/notification-settings.tsx` | Created |
| `src/components/settings/appearance-settings.tsx` | Created |
| `src/components/settings/account-settings.tsx` | Created |
| `src/app/(app)/settings/page.tsx` | Created |
| `src/app/(app)/settings/account/page.tsx` | Created |
| `src/app/(app)/settings/subscription/page.tsx` | Created |

---

**Estimated Time:** 3–4 hours  
**Next Task:** [AGENT-09 — Onboarding Flow](file:///Users/yoshiafk/Development/Personal%20Project/mindweave/agent-tasks/AGENT-09-onboarding.md)
