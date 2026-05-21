# AGENT-10: Premium Subscription & Stripe Integration

> **Pre-requisite:** Read [AGENT-00-context.md](file:///Users/yoshiafk/Development/Personal%20Project/mindweave/agent-tasks/AGENT-00-context.md) first.  
> **Depends on:** AGENT-01 through AGENT-03 (auth), AGENT-02 (Subscription model)

---

## Objective

Implement the premium subscription system with Stripe. Includes checkout flow, webhook handling, subscription management, premium upgrade UI, and the premium gate component that restricts premium features for free users.

---

## Design Reference

- **Premium Upgrade Screen** — Design Spec Section 12
- **Monetization Strategy** — PRD Section 8
- **Subscription Endpoints** — Agent Task Doc Section 7

---

## Tasks

### 10.1 Configure Stripe

Create `src/lib/stripe.ts`:

```typescript
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
  typescript: true,
});

export const PLANS = {
  monthly: {
    priceId: process.env.STRIPE_PRICE_MONTHLY!,
    name: "Monthly",
    price: 4.99,
    interval: "month" as const,
  },
  annual: {
    priceId: process.env.STRIPE_PRICE_ANNUAL!,
    name: "Annual",
    price: 39.99,
    interval: "year" as const,
    monthlyEquivalent: 3.33,
  },
} as const;
```

### 10.2 Create Subscription API Routes

#### `src/app/api/subscriptions/route.ts`

**GET** — Get current subscription details
- Auth required
- Return subscription record + feature list for current tier

#### `src/app/api/subscriptions/checkout/route.ts`

**POST** — Create Stripe Checkout session
- Auth required
- Accept: tier ("premium"), billingCycle ("monthly" | "annual")
- Create Stripe Checkout session with:
  - Price ID
  - Success URL: `/settings/subscription?success=true`
  - Cancel URL: `/settings/subscription`
  - Customer email
  - Metadata with userId
- Return checkout URL

#### `src/app/api/subscriptions/cancel/route.ts`

**POST** — Cancel subscription (at period end)
- Auth required
- Call Stripe API to cancel at period end
- Update local subscription record
- Return cancellation confirmation

#### `src/app/api/subscriptions/portal/route.ts`

**POST** — Create Stripe Customer Portal session
- For managing billing details
- Return portal URL

### 10.3 Create Stripe Webhook Handler

Create `src/app/api/webhooks/stripe/route.ts`:

Handle Stripe webhook events:
- `checkout.session.completed` → Create/update subscription, upgrade user role
- `customer.subscription.updated` → Update subscription details
- `customer.subscription.deleted` → Downgrade user to free tier
- `invoice.payment_succeeded` → Update current period
- `invoice.payment_failed` → Handle payment failure

**Critical implementation:**
- Verify webhook signature with `STRIPE_WEBHOOK_SECRET`
- Use raw body for signature verification
- Idempotent handling (check if already processed)
- Update user's role and permissions when upgrading/downgrading:
  - Upgrade: Change roleId to premium_user, subscriptionTier to "premium"
  - Downgrade: Change roleId to user, subscriptionTier to "free"

### 10.4 Build Premium Upgrade Page

Create premium upgrade UI as a modal/page accessible from:
- Settings → Subscription
- Any premium-gated feature

Per Design Spec Section 12:
```
┌─────────────────────────────────────┐
│  [✕]                                │
│                                     │
│         ✨ Upgrade                  │
│  Unlock your full healing journey   │
│                                     │
│  ✓ Unlimited AI reflections         │
│  ✓ Multiple story styles            │
│  ✓ Monthly deep insights            │
│  ✓ Unlimited history                │
│  ✓ Cloud backup & sync              │
│  ✓ Export as beautiful PDF           │
│                                     │
│  💎 Annual - $39.99                 │  (Recommended)
│     ($3.33/month)                   │
│     [Select]                        │
│                                     │
│  💳 Monthly - $4.99                 │
│     [Select]                        │
│                                     │
│  7-day free trial • Cancel anytime  │
│  Continue with Free                 │
└─────────────────────────────────────┘
```

Implementation:
- shadcn `<Dialog>` or `<Sheet>` (modal)
- Feature list with checkmark icons
- Two plan cards (Annual recommended, Monthly)
- Annual shows savings
- "7-day free trial • Cancel anytime" trust text
- "Continue with Free" text link (dismisses)
- Not aggressive or pushy
- Select button redirects to Stripe Checkout

### 10.5 Build Premium Gate Component

Create `src/components/shared/premium-gate.tsx`:

Used to wrap premium-only features:
```tsx
<PremiumGate permission="receive_ai_reflections" feature="AI Reflections">
  <AiReflectionCard />
</PremiumGate>
```

Implementation:
- If user has permission → render children
- If user lacks permission → render upgrade prompt:
  - Lock icon
  - Feature name
  - Brief description of what they're missing
  - "Upgrade to Premium" button → opens premium modal
  - Gentle, not blocking (show a preview/teaser when possible)

### 10.6 Create Subscription Hook

Create `src/hooks/use-subscription.ts`:
```typescript
// useSubscription() — get current subscription
// useCreateCheckout() — mutation to create checkout session
// useCancelSubscription() — mutation to cancel
```

### 10.7 Handle Upgrade/Downgrade Side Effects

When user upgrades:
1. Update role and permissions in DB
2. Invalidate NextAuth session (force refresh)
3. Show success toast
4. Redirect to journal page

When user downgrades (at period end):
1. Show remaining premium time
2. At expiry: update role to free
3. Restrict access to premium features
4. Entry history limited to 7 days again

---

## Verification

- [ ] Stripe Checkout creates session correctly
- [ ] Webhook processes checkout.session.completed
- [ ] User role upgrades to premium_user after payment
- [ ] Premium features unlock after upgrade
- [ ] Subscription cancel sets cancel_at_period_end
- [ ] Downgrade at period end restricts features
- [ ] Premium gate shows for free users on premium features
- [ ] Upgrade modal is not aggressive (per design spec)
- [ ] Annual plan shows as recommended
- [ ] Webhook signature verification works
- [ ] Error handling for failed payments

---

## Files Created/Modified

| File | Action |
|------|--------|
| `src/lib/stripe.ts` | Created |
| `src/app/api/subscriptions/route.ts` | Created |
| `src/app/api/subscriptions/checkout/route.ts` | Created |
| `src/app/api/subscriptions/cancel/route.ts` | Created |
| `src/app/api/subscriptions/portal/route.ts` | Created |
| `src/app/api/webhooks/stripe/route.ts` | Created |
| `src/hooks/use-subscription.ts` | Created |
| `src/components/shared/premium-gate.tsx` | Updated |
| `src/components/settings/subscription-card.tsx` | Created |
| Premium upgrade modal component | Created |

---

**Estimated Time:** 3–4 hours  
**Next Task:** [AGENT-11 — Deployment & QA](file:///Users/yoshiafk/Development/Personal%20Project/mindweave/agent-tasks/AGENT-11-deployment.md)
