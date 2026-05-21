# AGENT-00: Master Context — Read This Before Any Code

## ⚠️ MANDATORY: Every agent MUST read this file before starting ANY task file.

---

## 1. Project Overview

**Application:** MindWeave — AI-Powered Mental Health Journaling App  
**Tagline:** "Weave your thoughts into stories of healing"  
**Vision:** A mobile-first journaling web application that helps users process emotions through daily writing, using AI to transform fragmented thoughts into meaningful narratives, patterns, and insights.

**Target Audience:** Adults (22–45) experiencing emotional challenges, seeking self-guided mental health support through structured journaling.

---

## 2. Architecture Decision: Vercel Fullstack

The original docs specify React + Express + PostgreSQL. **We are adapting to a unified Vercel fullstack deployment:**

| Layer | Original Doc | Our Implementation |
|-------|-------------|-------------------|
| Frontend | React (CRA/Vite) + MUI/Tailwind | **Next.js 15 (App Router) + shadcn/ui + Tailwind CSS** |
| Backend | Express.js + Sequelize | **Next.js API Routes (Route Handlers) + Prisma ORM** |
| Database | PostgreSQL + Sequelize | **PostgreSQL (Neon) + Prisma ORM** |
| Auth | JWT (custom) | **NextAuth.js v5 (Auth.js) with JWT strategy** |
| AI | Anthropic Claude API | **Google Gemini API (Vercel AI SDK)** |
| Job Queue | Bull + Redis | **Vercel Cron Jobs + Inngest (or QStash)** |
| Deployment | Docker + AWS EC2/RDS | **Vercel (frontend + API) + Neon PostgreSQL** |
| Payments | Stripe | **Stripe (via API routes + webhooks)** |
| Caching | Redis | **Vercel KV (Redis) or unstable_cache** |

---

## 3. Technology Stack (Final)

### Core
- **Framework:** Next.js 15+ (App Router, Server Components, Server Actions)
- **Language:** TypeScript (strict mode)
- **Runtime:** Node.js 20+

### Frontend
- **UI Library:** shadcn/ui (Radix UI primitives + Tailwind CSS)
- **Styling:** Tailwind CSS v4 with CSS variables for theming
- **State Management:** React Context + TanStack Query v5
- **Forms:** React Hook Form + Zod validation
- **Charts:** Recharts
- **Rich Text:** Tiptap (for journal entries)
- **Date/Time:** date-fns
- **Icons:** Lucide React
- **Fonts:** Inter (UI) + Lora (serif, for stories)
- **Animations:** Framer Motion

### Backend (API Routes)
- **ORM:** Prisma 6+
- **Auth:** NextAuth.js v5 (Auth.js) with Credentials provider + JWT
- **Validation:** Zod (shared schemas between client/server)
- **AI:** Vercel AI SDK + @google/generative-ai
- **Email:** Resend
- **Payments:** Stripe (stripe npm package)
- **Background Jobs:** Inngest (serverless event-driven functions)
- **Rate Limiting:** @upstash/ratelimit + Vercel KV
- **Logging:** Pino (structured JSON logs)

### Database
- **Provider:** Neon (serverless PostgreSQL)
- **ORM:** Prisma with `@prisma/adapter-neon` for serverless
- **Migrations:** Prisma Migrate

### Infrastructure
- **Hosting:** Vercel
- **Database:** Neon PostgreSQL
- **Cache/KV:** Vercel KV (Upstash Redis)
- **Blob Storage:** Vercel Blob (for exports)
- **Cron:** Vercel Cron Jobs
- **Monitoring:** Vercel Analytics + Speed Insights

---

## 4. Project Structure

```
mindweave/
├── prisma/
│   ├── schema.prisma            # Database schema
│   ├── migrations/              # Prisma migrations
│   └── seed.ts                  # Seed data (roles, permissions, master user)
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── (auth)/              # Auth pages (login, register, etc.)
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   ├── forgot-password/page.tsx
│   │   │   └── layout.tsx       # Auth layout (centered, no nav)
│   │   ├── (app)/               # Authenticated app pages
│   │   │   ├── journal/page.tsx         # Write tab (Home)
│   │   │   ├── journal/[id]/page.tsx    # Single entry view
│   │   │   ├── stories/page.tsx         # Story tab
│   │   │   ├── stories/[id]/page.tsx    # Full story view
│   │   │   ├── insights/page.tsx        # Insights tab
│   │   │   ├── settings/page.tsx        # Settings tab
│   │   │   ├── settings/account/page.tsx
│   │   │   ├── settings/subscription/page.tsx
│   │   │   └── layout.tsx               # App layout (with bottom nav)
│   │   ├── (marketing)/         # Landing / public pages
│   │   │   ├── page.tsx         # Landing page
│   │   │   └── pricing/page.tsx
│   │   ├── onboarding/          # Onboarding flow
│   │   │   └── page.tsx
│   │   ├── api/                 # API Route Handlers
│   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   ├── entries/route.ts
│   │   │   ├── entries/[id]/route.ts
│   │   │   ├── entries/stats/route.ts
│   │   │   ├── stories/route.ts
│   │   │   ├── stories/[id]/route.ts
│   │   │   ├── stories/generate/route.ts
│   │   │   ├── ai/reflections/route.ts
│   │   │   ├── ai/insights/route.ts
│   │   │   ├── ai/prompts/route.ts
│   │   │   ├── ai/monthly-report/route.ts
│   │   │   ├── preferences/route.ts
│   │   │   ├── subscriptions/route.ts
│   │   │   ├── subscriptions/checkout/route.ts
│   │   │   ├── export/route.ts
│   │   │   ├── admin/users/route.ts
│   │   │   ├── admin/stats/route.ts
│   │   │   ├── webhooks/stripe/route.ts
│   │   │   └── health/route.ts
│   │   ├── layout.tsx           # Root layout
│   │   └── globals.css          # Global styles + Tailwind + CSS vars
│   ├── components/
│   │   ├── ui/                  # shadcn/ui components (auto-generated)
│   │   ├── journal/             # Journal-specific components
│   │   │   ├── entry-editor.tsx
│   │   │   ├── mood-selector.tsx
│   │   │   ├── tag-picker.tsx
│   │   │   ├── entry-card.tsx
│   │   │   ├── entry-list.tsx
│   │   │   └── writing-prompt.tsx
│   │   ├── stories/             # Story-specific components
│   │   │   ├── story-card.tsx
│   │   │   ├── story-reader.tsx
│   │   │   ├── emotional-journey.tsx
│   │   │   └── story-style-picker.tsx
│   │   ├── insights/            # Insights-specific components
│   │   │   ├── mood-chart.tsx
│   │   │   ├── streak-card.tsx
│   │   │   ├── insight-card.tsx
│   │   │   └── timeline-view.tsx
│   │   ├── settings/            # Settings components
│   │   │   ├── ai-settings.tsx
│   │   │   ├── notification-settings.tsx
│   │   │   ├── appearance-settings.tsx
│   │   │   └── account-settings.tsx
│   │   ├── onboarding/          # Onboarding flow components
│   │   │   ├── welcome-step.tsx
│   │   │   ├── privacy-step.tsx
│   │   │   ├── ai-level-step.tsx
│   │   │   └── journey-reason-step.tsx
│   │   ├── layout/              # Layout components
│   │   │   ├── bottom-nav.tsx
│   │   │   ├── app-header.tsx
│   │   │   └── mobile-shell.tsx
│   │   └── shared/              # Shared components
│   │       ├── empty-state.tsx
│   │       ├── loading-skeleton.tsx
│   │       ├── premium-gate.tsx
│   │       └── error-boundary.tsx
│   ├── lib/
│   │   ├── prisma.ts            # Prisma client singleton
│   │   ├── auth.ts              # NextAuth config
│   │   ├── auth-options.ts      # Auth providers config
│   │   ├── ai/
│   │   │   ├── client.ts        # Gemini client
│   │   │   ├── prompts.ts       # System prompts for AI features
│   │   │   └── story-generator.ts
│   │   ├── stripe.ts            # Stripe client
│   │   ├── resend.ts            # Email client
│   │   ├── rate-limit.ts        # Rate limiting with Upstash
│   │   ├── validators/          # Zod schemas (shared)
│   │   │   ├── auth.ts
│   │   │   ├── entry.ts
│   │   │   ├── story.ts
│   │   │   └── preferences.ts
│   │   └── utils.ts             # Shared utilities (cn, formatDate, etc.)
│   ├── hooks/
│   │   ├── use-entries.ts       # TanStack Query hooks for entries
│   │   ├── use-stories.ts
│   │   ├── use-insights.ts
│   │   ├── use-preferences.ts
│   │   └── use-auth.ts
│   ├── types/
│   │   ├── index.ts             # Shared TypeScript types
│   │   └── next-auth.d.ts       # NextAuth type extensions
│   └── config/
│       ├── site.ts              # Site metadata
│       ├── nav.ts               # Navigation config
│       └── permissions.ts       # Permission constants
├── public/
│   ├── fonts/
│   ├── icons/
│   └── images/
├── .env.local                   # Local environment variables
├── .env.example                 # Example env vars
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── components.json              # shadcn/ui config
└── vercel.json                  # Vercel deployment config
```

---

## 5. Design System Mapping (Design Spec → shadcn/ui)

### Color Tokens (CSS Variables)

Map the MindWeave design spec colors to Tailwind CSS variables in `globals.css`:

```css
:root {
  /* Brand colors */
  --twilight-blue: 222 23% 39%;      /* #4A5B7C */
  --soft-lavender: 270 20% 72%;      /* #B8A9C9 */
  --warm-cream: 40 33% 96%;          /* #F8F6F1 */

  /* Mood colors */
  --mood-heavy: 207 30% 25%;         /* #2D3E50 */
  --mood-reflective: 215 10% 59%;    /* #8B95A5 */
  --mood-hopeful: 0 25% 74%;         /* #D4A5A5 */
  --mood-peaceful: 40 50% 77%;       /* #E8D4A0 */
  --mood-grounded: 148 15% 49%;      /* #6B8E7B */

  /* Map to shadcn/ui tokens */
  --background: 40 33% 96%;          /* warm cream */
  --foreground: 0 0% 16%;            /* #2A2A2A warm black */
  --primary: 222 23% 39%;            /* twilight blue */
  --secondary: 270 20% 72%;          /* soft lavender */
  --muted-foreground: 0 0% 42%;      /* #6B6B6B */
  --destructive: 0 25% 63%;          /* #C67B7B muted red */
  --success: 120 15% 56%;            /* #7BA37B soft green */
  --warning: 27 40% 64%;             /* #D4A574 warm amber */
  --card: 0 0% 100%;
  --border: 40 16% 90%;              /* #E8E6E1 */
  --ring: 222 23% 39%;
  --radius: 0.75rem;                 /* 12px base radius */
}

.dark {
  --background: 0 0% 10%;            /* #1A1A1A */
  --foreground: 40 33% 96%;          /* cream white */
  --card: 0 0% 16%;                  /* #2A2A2A */
  --muted-foreground: 0 0% 72%;      /* #B8B8B8 */
  --border: 0 0% 100% / 0.08;
}
```

### Component Mapping

| Design Spec Component | shadcn/ui Component | Customization |
|----------------------|--------------------|----|
| Primary Button | `<Button>` | Custom colors, 50px height, 12px radius |
| Secondary Button | `<Button variant="outline">` | Twilight blue border |
| Text Button | `<Button variant="ghost">` | Text secondary color |
| Standard Card | `<Card>` | 16px radius, soft shadow |
| Story Card | `<Card>` | Gradient background, 20px radius |
| Text Input | `<Textarea>` | Custom for journal, 12px radius |
| Mood Selector | Custom component | 5 emojis, scale animation |
| Settings Toggle | `<Switch>` | Grouped in card sections |
| Tag Picker | `<Badge>` + `<Toggle>` | Multi-select badges |
| Navigation | Custom bottom tab bar | 4 tabs: Write, Story, Insights, Settings |
| Modal/Sheet | `<Sheet>` or `<Dialog>` | Slide up for mobile |
| Loading | `<Skeleton>` | Pulsing skeleton screens |
| Charts | Recharts | Brand colors |
| Toast | `<Sonner>` (sonner) | Warm, non-aggressive |

---

## 6. Database Schema (Prisma)

The database schema follows the original Agent Task Document's SQL schema, translated to Prisma format. See **AGENT-02** for the complete `schema.prisma`.

Key tables: User, Role, Permission, RolePermission, JournalEntry, WeeklyStory, AiReflection, PatternInsight, Subscription, RefreshToken, UserPreference, Milestone, AuditLog.

---

## 7. Authentication Strategy

**NextAuth.js v5 (Auth.js)** with:
- **Credentials Provider** (email/password with bcrypt)
- **JWT Strategy** (not database sessions — better for serverless)
- Access token in JWT, refresh handled by NextAuth's rotation
- Role and permissions embedded in JWT token
- Middleware-based route protection (`middleware.ts`)

---

## 8. API Structure

All API routes live under `src/app/api/`. They follow the original Agent Task Document's endpoint design but adapted to Next.js Route Handlers:

```
POST /api/auth/register          → Custom route (not NextAuth)
POST /api/auth/[...nextauth]     → NextAuth handler
GET  /api/entries                → Journal entries (paginated)
POST /api/entries                → Create entry
GET  /api/entries/[id]           → Single entry
PUT  /api/entries/[id]           → Update entry
DELETE /api/entries/[id]         → Delete entry
GET  /api/entries/stats          → Journal stats
POST /api/stories/generate       → Generate weekly story
GET  /api/stories                → List stories
GET  /api/stories/[id]           → Single story
PUT  /api/stories/[id]/favorite  → Toggle favorite
GET  /api/ai/reflections         → AI reflections
GET  /api/ai/insights            → Pattern insights
POST /api/ai/monthly-report      → Generate monthly report
GET  /api/preferences            → User preferences
PUT  /api/preferences            → Update preferences
GET  /api/subscriptions          → Current subscription
POST /api/subscriptions/checkout → Stripe checkout
POST /api/subscriptions/cancel   → Cancel subscription
POST /api/export/entries         → Export entries
GET  /api/admin/users            → Admin: list users
GET  /api/admin/stats            → Admin: system stats
POST /api/webhooks/stripe        → Stripe webhook handler
GET  /api/health                 → Health check
```

---

## 9. Agent Task Execution Order

```
AGENT-00 → AGENT-01 → AGENT-02 → AGENT-03 → AGENT-04 → AGENT-05
   ↓          ↓          ↓          ↓          ↓          ↓
Context   Project    Database    Auth      Journal    Weekly
(READ)    Init       + Prisma    System    Entries    Stories

→ AGENT-06 → AGENT-07 → AGENT-08 → AGENT-09 → AGENT-10 → AGENT-11
     ↓          ↓          ↓          ↓          ↓          ↓
   AI        Insights   Settings   Onboarding  Premium   Deploy
   Features  + Charts   + Prefs    Flow        + Stripe  + QA
```

**Dependencies:**
- AGENT-01 must complete first (project scaffold)
- AGENT-02 must complete before AGENT-03+ (database needed)
- AGENT-03 must complete before AGENT-04+ (auth needed)
- AGENT-04 through AGENT-09 can partially overlap but prefer sequential
- AGENT-10 depends on AGENT-04 (entries) for Stripe webhook
- AGENT-11 (deployment) is last

---

## 10. Key Design Principles

From the Design Specification — **every agent must internalize these:**

1. **Sanctuary First** — The app feels like a safe, private space
2. **Invisible Technology** — AI feels like gentle wisdom, not a robot
3. **Emotional Honesty** — Design acknowledges pain without trying to fix it
4. **Respectful Minimalism** — Only show what's needed
5. **Mobile-First** — All UI designed for phone screens first, web second
6. **Privacy Sacred** — If choosing between feature and privacy, privacy wins

### AI Tone (for all AI-generated content):
- ✅ Empathetic, never clinical
- ✅ Reflective, not prescriptive
- ❌ Never toxic positivity
- ❌ Never minimizes pain or rushes healing

---

## 11. Environment Variables

```bash
# .env.local
DATABASE_URL="postgresql://..."          # Neon PostgreSQL
DIRECT_URL="postgresql://..."            # Neon direct connection (for migrations)

NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

GEMINI_API_KEY="your-gemini-api-key"           # Get from Google AI Studio

STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PRICE_MONTHLY="price_..."
STRIPE_PRICE_ANNUAL="price_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

RESEND_API_KEY="re_..."
EMAIL_FROM="noreply@mindweave.app"

KV_URL="..."                             # Vercel KV (Upstash Redis)
KV_REST_API_URL="..."
KV_REST_API_TOKEN="..."
KV_REST_API_READ_ONLY_TOKEN="..."

BLOB_READ_WRITE_TOKEN="..."              # Vercel Blob

NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## 12. Important Constraints

1. **No separate backend server** — Everything runs in Next.js
2. **No Docker** — Vercel handles deployment
3. **No Redis server** — Use Vercel KV (Upstash Redis) or in-memory for dev
4. **No Bull job queue** — Use Inngest or Vercel Cron for background tasks
5. **TypeScript everywhere** — No JavaScript files
6. **Zod for ALL validation** — Shared between client and server
7. **Server Components by default** — Client components only when needed (interactivity)
8. **shadcn/ui components** — Don't create custom low-level UI; use shadcn
9. **Mobile-first CSS** — Use Tailwind responsive prefixes (sm:, md:, lg:)
10. **Warm cream background** — Not pure white, always `#F8F6F1` in light mode

---

**Document Version:** 1.0  
**Created:** May 21, 2026  
**Status:** Master Context — Active
