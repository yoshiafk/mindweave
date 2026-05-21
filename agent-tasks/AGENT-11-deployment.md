# AGENT-11: Deployment, Admin, & QA

> **Pre-requisite:** Read [AGENT-00-context.md](file:///Users/yoshiafk/Development/Personal%20Project/mindweave/agent-tasks/AGENT-00-context.md) first.  
> **Depends on:** ALL previous agents (AGENT-01 through AGENT-10)

---

## Objective

Final agent task — deploy MindWeave to Vercel, build admin panel, create landing page, implement health checks, configure Vercel Cron Jobs, and perform comprehensive QA across the entire application.

---

## Tasks

### 11.1 Build Admin Dashboard (Master User Only)

#### Admin Users Page

Create `src/app/(app)/admin/page.tsx` and `src/app/(app)/admin/users/page.tsx`:

Per Agent Task Doc Section 9:
- List all users (paginated, searchable)
- Filter by role, subscription tier, active status
- Show: name, email, role, subscription, entries count, last login
- Inline actions: update subscription tier, toggle active status
- Protect with `admin_access` permission

#### Admin Stats Page

Create `src/app/(app)/admin/stats/page.tsx`:
- Total users, active users (30d)
- Free vs. premium breakdown
- Total entries, entries this week
- Total stories generated
- AI API usage (tokens, estimated cost)
- Charts with Recharts (user growth, entry growth)

#### Admin API Routes

Create `src/app/api/admin/users/route.ts`:
**GET** — List users (paginated, filterable, searchable)
- Permission: `admin_access`

Create `src/app/api/admin/users/[id]/route.ts`:
**PUT** — Update user subscription/role/active status
- Permission: `admin_access`

Create `src/app/api/admin/stats/route.ts`:
**GET** — System-wide statistics
- Permission: `admin_access`

### 11.2 Build Landing Page

Create `src/app/(marketing)/page.tsx`:

A beautiful, conversion-optimized landing page:
- Hero section: MindWeave tagline, value prop, CTA button
- Features section: Journal, Stories, Insights
- How it works: 3-step visual flow
- Sample weekly story excerpt (from PRD Appendix 14.1)
- Testimonial/trust section
- Pricing section (Free vs Premium comparison)
- Final CTA: "Start Your Healing Journey"
- Footer with privacy, terms links

Design:
- Uses the MindWeave color palette
- Warm, inviting, not clinical
- Mobile responsive
- Smooth scroll animations (Framer Motion)
- Inter font for UI, Lora for story excerpts

### 11.3 Build Pricing Page

Create `src/app/(marketing)/pricing/page.tsx`:

- Free tier vs Premium tier comparison table
- Feature checklist for each tier
- CTA buttons
- FAQ section
- Same warm aesthetic as landing page

### 11.4 Create Health Check Endpoint

Create `src/app/api/health/route.ts`:

```typescript
export async function GET() {
  const health = {
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: "unknown",
    version: process.env.npm_package_version || "1.0.0",
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    health.database = "connected";
  } catch {
    health.database = "disconnected";
    return NextResponse.json(health, { status: 503 });
  }

  return NextResponse.json(health);
}
```

### 11.5 Configure Vercel Deployment

Create `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/weekly-stories",
      "schedule": "0 18 * * 0"
    },
    {
      "path": "/api/cron/cleanup-tokens",
      "schedule": "0 0 * * *"
    }
  ]
}
```

#### Vercel Cron: Weekly Story Generation

Create `src/app/api/cron/weekly-stories/route.ts`:
- Runs every Sunday at 6 PM
- Finds all users with 2+ entries this week
- Queues story generation for each
- Uses user's preferred narrative style
- Vercel cron secret verification

#### Vercel Cron: Token Cleanup

Create `src/app/api/cron/cleanup-tokens/route.ts`:
- Runs daily at midnight
- Deletes expired refresh tokens (>30 days)
- Cleans up expired password reset tokens

### 11.6 Configure Environment Variables on Vercel

Document all required Vercel environment variables:
- `DATABASE_URL` — Neon PostgreSQL connection string
- `DIRECT_URL` — Neon direct connection for migrations
- `NEXTAUTH_URL` — Production URL
- `NEXTAUTH_SECRET` — Strong random secret
- `GEMINI_API_KEY`
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_*`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `RESEND_API_KEY`, `EMAIL_FROM`
- `KV_*` — Vercel KV credentials
- `BLOB_READ_WRITE_TOKEN` — Vercel Blob
- `CRON_SECRET` — For cron job verification
- `NEXT_PUBLIC_APP_URL`

### 11.7 Configure next.config.ts

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  images: {
    remotePatterns: [
      // Add any image domains needed
    ],
  },
  headers: async () => [
    {
      source: "/api/:path*",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-XSS-Protection", value: "1; mode=block" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      ],
    },
  ],
};

export default nextConfig;
```

### 11.8 SEO & Meta Tags

Ensure all pages have proper:
- `<title>` tags (via Next.js metadata)
- Meta descriptions
- Open Graph tags
- Structured data for landing page
- Sitemap generation (`next-sitemap` or manual)
- robots.txt

### 11.9 Error Handling & Loading States

Create shared components:
- `src/components/shared/error-boundary.tsx` — React error boundary
- `src/components/shared/loading-skeleton.tsx` — Consistent skeleton screens

Ensure all pages have:
- `loading.tsx` files with skeleton screens
- `error.tsx` files with friendly error messages
- `not-found.tsx` files for 404s
- Per Design Spec Section 10 — warm, non-blaming error messages

### 11.10 PWA Configuration (Optional)

If desired, add PWA support:
- `manifest.json` with MindWeave theme colors
- Service worker for offline journaling
- App icon set (multiple sizes)
- Splash screen configuration

---

## QA Checklist

### Authentication
- [ ] Register new user → onboarding → journal
- [ ] Login with valid credentials
- [ ] Login with invalid credentials → error message
- [ ] Password reset flow (request → email → reset)
- [ ] Session persists across page refreshes
- [ ] Logout clears session
- [ ] Protected routes redirect to login

### Journal Entries
- [ ] Create entry with mood, tags, text
- [ ] Auto-save works (debounced)
- [ ] Edit existing entry
- [ ] Delete entry with confirmation
- [ ] Entry list paginates correctly
- [ ] Free user: limited to 7 days history
- [ ] Mood selector animates correctly
- [ ] Full-screen writing mode works
- [ ] Writing prompt appears after idle

### Weekly Stories
- [ ] Generate story with 2+ entries
- [ ] Story displays with serif font
- [ ] Emotional journey visualization renders
- [ ] Toggle favorite works
- [ ] Free user: third_person only
- [ ] Premium user: all styles available
- [ ] Empty state shows progress

### AI Features
- [ ] Reflections generate after entry (if enabled)
- [ ] Pattern insights show for 7+ day users
- [ ] Monthly report generates (premium only)
- [ ] Writing prompts are contextual
- [ ] AI rate limiting works

### Insights
- [ ] Streak card shows correct count
- [ ] Mood chart renders with data
- [ ] Timeline calendar shows mood dots
- [ ] Milestones trigger at thresholds

### Settings
- [ ] Theme toggle (light/dark/system)
- [ ] All preferences save correctly
- [ ] AI level changes affect feature visibility
- [ ] Export works (premium only)
- [ ] Account details editable
- [ ] Delete data with confirmation

### Premium
- [ ] Stripe checkout creates session
- [ ] Webhook upgrades user role
- [ ] Premium features unlock
- [ ] Cancel at period end works
- [ ] Premium gate shows for free users

### Responsive Design
- [ ] All pages look great at 375px (mobile)
- [ ] All pages look great at 768px (tablet)
- [ ] All pages look great at 1440px (desktop)
- [ ] Bottom nav works on mobile
- [ ] Touch targets ≥ 44px

### Performance
- [ ] Lighthouse score ≥ 90 (Performance)
- [ ] Lighthouse score ≥ 90 (Accessibility)
- [ ] No CLS (layout shift) issues
- [ ] Images optimized
- [ ] Bundle size reasonable

### Security
- [ ] No sensitive data in client-side code
- [ ] API routes validate auth
- [ ] RBAC enforced on all endpoints
- [ ] Rate limiting active
- [ ] CORS configured correctly
- [ ] Security headers set

---

## Files Created/Modified

| File | Action |
|------|--------|
| `src/app/(app)/admin/page.tsx` | Created |
| `src/app/(app)/admin/users/page.tsx` | Created |
| `src/app/(app)/admin/stats/page.tsx` | Created |
| `src/app/api/admin/users/route.ts` | Created |
| `src/app/api/admin/users/[id]/route.ts` | Created |
| `src/app/api/admin/stats/route.ts` | Created |
| `src/app/(marketing)/page.tsx` | Created |
| `src/app/(marketing)/pricing/page.tsx` | Created |
| `src/app/api/health/route.ts` | Created |
| `src/app/api/cron/weekly-stories/route.ts` | Created |
| `src/app/api/cron/cleanup-tokens/route.ts` | Created |
| `vercel.json` | Created |
| `next.config.ts` | Modified |
| `src/components/shared/error-boundary.tsx` | Created |
| `src/components/shared/loading-skeleton.tsx` | Updated |
| Various `loading.tsx`, `error.tsx`, `not-found.tsx` | Created |

---

**Estimated Time:** 4–6 hours  

---

## Total Project Estimate

| Agent | Task | Estimated Time |
|-------|------|---------------|
| AGENT-01 | Project Init & Scaffold | 1–2 hours |
| AGENT-02 | Database & Prisma | 1–2 hours |
| AGENT-03 | Authentication | 3–4 hours |
| AGENT-04 | Journal Entries (Core) | 4–6 hours |
| AGENT-05 | Weekly Stories | 4–5 hours |
| AGENT-06 | AI Features | 3–4 hours |
| AGENT-07 | Insights & Charts | 3–4 hours |
| AGENT-08 | Settings & Preferences | 3–4 hours |
| AGENT-09 | Onboarding Flow | 2–3 hours |
| AGENT-10 | Premium & Stripe | 3–4 hours |
| AGENT-11 | Deployment & QA | 4–6 hours |
| **Total** | | **31–44 hours** |
