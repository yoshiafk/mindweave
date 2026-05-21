# AGENT-09: Onboarding Flow

> **Pre-requisite:** Read [AGENT-00-context.md](file:///Users/yoshiafk/Development/Personal%20Project/mindweave/agent-tasks/AGENT-00-context.md) first.  
> **Depends on:** AGENT-01, AGENT-02, AGENT-03

---

## Objective

Build the first-time user onboarding experience — a warm, non-pressured 4-step flow that introduces MindWeave's privacy, AI features, and gently asks about the user's journey. Sets initial preferences and completes onboarding flag.

---

## Design Reference

- **Onboarding Design** — Design Spec Section 8
- **Copy Tone** — Design Spec Section 15
- Screens: Welcome, Privacy, AI Introduction, Journey Reason

---

## Tasks

### 9.1 Create Onboarding Page

Create `src/app/onboarding/page.tsx`:

Multi-step flow with smooth transitions between steps:
- Step state managed with React state (current step 1-4)
- Progress indicator (1 of 3, 2 of 3, etc.)
- Gentle fade + slide animations between steps (Framer Motion)
- Skip option always available
- No bottom navigation (standalone flow)

### 9.2 Build Welcome Step

Create `src/components/onboarding/welcome-step.tsx`:

Per Design Spec Screen 1:
```
┌─────────────────────────────────────┐
│                                     │
│         ✨                          │
│                                     │
│      Welcome to                     │
│      MindWeave                      │
│                                     │
│  Your safe space to write,          │
│  reflect, and heal                  │
│                                     │
│  [     Get Started     ]            │
└─────────────────────────────────────┘
```

Implementation:
- Large sparkle icon or MindWeave logo
- Brand name in display typography
- Tagline in secondary text
- Single primary button "Get Started"
- Warm cream background
- Centered layout, generous spacing
- Subtle entrance animation (fade in + scale)

### 9.3 Build Privacy Step

Create `src/components/onboarding/privacy-step.tsx`:

Per Design Spec Screen 2:
```
┌─────────────────────────────────────┐
│  [Back]                    1 of 3   │
│                                     │
│         🔒                          │
│                                     │
│  Your words, your space             │
│                                     │
│  • End-to-end encryption            │
│  • Data stays on your device        │
│  • You control everything           │
│  • Delete anytime, no questions     │
│                                     │
│  [     I Understand     ]           │
│                                     │
│  Learn more about privacy           │
└─────────────────────────────────────┘
```

Implementation:
- Lock icon
- Privacy headline
- 4 bullet points with checkmark icons
- "I Understand" primary button
- "Learn more about privacy" text link (to privacy page)
- Back button

### 9.4 Build AI Level Step

Create `src/components/onboarding/ai-level-step.tsx`:

Per Design Spec Screen 3:
```
┌─────────────────────────────────────┐
│  [Back]                    2 of 3   │
│                                     │
│  Meet your AI companion             │
│                                     │
│  MindWeave uses AI to:              │
│  • Transform entries into stories   │
│  • Recognize emotional patterns     │
│  • Offer gentle reflections         │
│                                     │
│  How much AI support do you want?   │
│                                     │
│  ○ Full - All AI features           │
│  ● Moderate - Stories only          │  (Recommended)
│  ○ Minimal - Just journaling        │
│                                     │
│  [     Continue     ]               │
└─────────────────────────────────────┘
```

Implementation:
- AI companion introduction text
- Three feature bullets with icons
- Radio group for AI level (shadcn radio buttons or custom cards)
- "Moderate" pre-selected and marked "(Recommended)"
- Each option has brief description
- Continue button
- Value persisted to UserPreference.aiInvolvementLevel

### 9.5 Build Journey Reason Step

Create `src/components/onboarding/journey-reason-step.tsx`:

Per Design Spec Screen 4:
```
┌─────────────────────────────────────┐
│                          3 of 3     │
│                                     │
│  What brings you here?              │
│  (Optional - helps us understand)   │
│                                     │
│  ○ Heartbreak or relationship       │
│  ○ Grief or loss                    │
│  ○ Anxiety or stress                │
│  ○ Life transition                  │
│  ○ Just want to journal             │
│  ○ Prefer not to say                │
│                                     │
│  [     Start Writing     ]          │
│                                     │
│  Skip this step                     │
└─────────────────────────────────────┘
```

Implementation:
- Optional — user can skip
- Radio group for reason selection
- "Start Writing" primary button
- "Skip this step" text link
- Value persisted to User.journeyReason
- This info helps AI personalize prompts

### 9.6 Create Onboarding API Route

Create `src/app/api/onboarding/complete/route.ts`:

**POST** — Complete onboarding
- Auth required
- Accept: aiInvolvementLevel, journeyReason (optional)
- Update UserPreference with AI level
- Update User with journeyReason
- Set User.onboardingCompleted = true
- Return success
- Redirect client to `/journal`

### 9.7 Handle Onboarding State

- Middleware (from AGENT-03) redirects authenticated users with `onboardingCompleted === false` to `/onboarding`
- After onboarding completes, redirect to `/journal`
- Update NextAuth session to reflect onboardingCompleted = true

### 9.8 Animations

Per Design Spec Section 8:
- Gentle fade + slide transitions between steps
- Progress indicator animates between steps
- Entrance animations on icons/illustrations
- Duration: 300ms, easing: ease-in-out
- Respect "prefers-reduced-motion" system setting

---

## Verification

- [ ] New user after registration is redirected to /onboarding
- [ ] All 4 steps render correctly with proper copy
- [ ] Back navigation works between steps
- [ ] Progress indicator updates (1 of 3, 2 of 3, 3 of 3)
- [ ] AI level selection persists to user preferences
- [ ] Journey reason persists to user record
- [ ] Skip works (completes onboarding without journey reason)
- [ ] After completion, redirects to /journal
- [ ] Middleware prevents going back to /onboarding after completion
- [ ] Animations are smooth (respect reduced-motion)
- [ ] Mobile responsive — proper spacing at 375px

---

## Files Created/Modified

| File | Action |
|------|--------|
| `src/app/onboarding/page.tsx` | Created |
| `src/components/onboarding/welcome-step.tsx` | Created |
| `src/components/onboarding/privacy-step.tsx` | Created |
| `src/components/onboarding/ai-level-step.tsx` | Created |
| `src/components/onboarding/journey-reason-step.tsx` | Created |
| `src/app/api/onboarding/complete/route.ts` | Created |

---

**Estimated Time:** 2–3 hours  
**Next Task:** [AGENT-10 — Premium & Stripe](file:///Users/yoshiafk/Development/Personal%20Project/mindweave/agent-tasks/AGENT-10-premium-stripe.md)
