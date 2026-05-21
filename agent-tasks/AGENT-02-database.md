# AGENT-02: Database Schema & Prisma Setup

> **Pre-requisite:** Read [AGENT-00-context.md](file:///Users/yoshiafk/Development/Personal%20Project/mindweave/agent-tasks/AGENT-00-context.md) first.  
> **Depends on:** AGENT-01 (project initialized)

---

## Objective

Set up Prisma ORM with Neon PostgreSQL, define the complete database schema matching the original Agent Task Document, create migrations, and seed initial data (roles, permissions, master user).

---

## Tasks

### 2.1 Initialize Prisma

```bash
npx prisma init
```

Configure `prisma/schema.prisma` datasource for Neon:

```prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["driverAdapters"]
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

### 2.2 Define Complete Schema

Translate ALL 13 tables from the Agent Task Document SQL schema to Prisma models:

```prisma
// ============================================
// 1. ROLES & PERMISSIONS (RBAC)
// ============================================

model Role {
  id          Int              @id @default(autoincrement())
  name        String           @unique // 'user', 'premium_user', 'master'
  description String?
  createdAt   DateTime         @default(now()) @map("created_at")
  users       User[]
  permissions RolePermission[]

  @@map("roles")
}

model Permission {
  id          Int              @id @default(autoincrement())
  name        String           @unique // 'write_entry', 'view_weekly_story', etc.
  description String?
  category    String?          // 'journaling', 'ai_features', 'export', 'admin'
  createdAt   DateTime         @default(now()) @map("created_at")
  roles       RolePermission[]

  @@map("permissions")
}

model RolePermission {
  id           Int        @id @default(autoincrement())
  roleId       Int        @map("role_id")
  permissionId Int        @map("permission_id")
  createdAt    DateTime   @default(now()) @map("created_at")
  role         Role       @relation(fields: [roleId], references: [id], onDelete: Cascade)
  permission   Permission @relation(fields: [permissionId], references: [id], onDelete: Cascade)

  @@unique([roleId, permissionId])
  @@map("role_permissions")
}

// ============================================
// 2. USERS
// ============================================

model User {
  id                   Int              @id @default(autoincrement())
  email                String           @unique
  passwordHash         String           @map("password_hash")
  name                 String
  roleId               Int              @map("role_id")
  subscriptionTier     String           @default("free") @map("subscription_tier") // 'free', 'premium', 'master'
  isActive             Boolean          @default(true) @map("is_active")
  isVerified           Boolean          @default(false) @map("is_verified")
  verificationToken    String?          @map("verification_token")
  resetPasswordToken   String?          @map("reset_password_token")
  resetPasswordExpires DateTime?        @map("reset_password_expires")
  lastLogin            DateTime?        @map("last_login")
  onboardingCompleted  Boolean          @default(false) @map("onboarding_completed")
  journeyReason        String?          @map("journey_reason") // What brought user here
  createdAt            DateTime         @default(now()) @map("created_at")
  updatedAt            DateTime         @updatedAt @map("updated_at")

  // Relations
  role          Role             @relation(fields: [roleId], references: [id])
  entries       JournalEntry[]
  stories       WeeklyStory[]
  reflections   AiReflection[]
  insights      PatternInsight[]
  subscription  Subscription?
  refreshTokens RefreshToken[]
  preferences   UserPreference?
  milestones    Milestone[]
  auditLogs     AuditLog[]

  @@index([email])
  @@index([roleId])
  @@index([subscriptionTier])
  @@map("users")
}

// ============================================
// 3. JOURNAL ENTRIES
// ============================================

model JournalEntry {
  id                   Int            @id @default(autoincrement())
  userId               Int            @map("user_id")
  entryDate            DateTime       @map("entry_date") @db.Date
  entryText            String         @map("entry_text")
  moodBefore           String?        @map("mood_before") // 'heavy', 'sad', 'okay', 'good', 'great'
  moodAfter            String?        @map("mood_after")
  tags                 String[]       @default([])
  wordCount            Int?           @map("word_count")
  isVoiceTranscription Boolean        @default(false) @map("is_voice_transcription")
  createdAt            DateTime       @default(now()) @map("created_at")
  updatedAt            DateTime       @updatedAt @map("updated_at")

  // Relations
  user        User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  reflections AiReflection[]

  @@index([userId, entryDate(sort: Desc)])
  @@index([userId, createdAt(sort: Desc)])
  @@map("journal_entries")
}

// ============================================
// 4. WEEKLY STORIES
// ============================================

model WeeklyStory {
  id                Int      @id @default(autoincrement())
  userId            Int      @map("user_id")
  weekStartDate     DateTime @map("week_start_date") @db.Date
  weekEndDate       DateTime @map("week_end_date") @db.Date
  storyTitle        String?  @map("story_title")
  storyContent      String   @map("story_content")
  narrativeStyle    String   @default("third_person") @map("narrative_style") // 'third_person', 'letter', 'chapter'
  emotionalJourney  Json?    @map("emotional_journey") // JSON array of daily moods
  keyThemes         String[] @default([]) @map("key_themes")
  highlightedQuotes String[] @default([]) @map("highlighted_quotes")
  strengthRecognition String? @map("strength_recognition")
  entryCount        Int?     @map("entry_count")
  aiProcessingTime  Int?     @map("ai_processing_time") // milliseconds
  isFavorited       Boolean  @default(false) @map("is_favorited")
  createdAt         DateTime @default(now()) @map("created_at")

  // Relations
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, weekStartDate(sort: Desc)])
  @@map("weekly_stories")
}

// ============================================
// 5. AI REFLECTIONS
// ============================================

model AiReflection {
  id             Int      @id @default(autoincrement())
  entryId        Int      @map("entry_id")
  userId         Int      @map("user_id")
  reflectionText String   @map("reflection_text")
  reflectionType String   @default("post_entry") @map("reflection_type") // 'post_entry', 'pattern_alert', 'strength_recognition'
  isRead         Boolean  @default(false) @map("is_read")
  createdAt      DateTime @default(now()) @map("created_at")

  // Relations
  entry JournalEntry @relation(fields: [entryId], references: [id], onDelete: Cascade)
  user  User         @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([entryId])
  @@index([userId, createdAt(sort: Desc)])
  @@map("ai_reflections")
}

// ============================================
// 6. PATTERN INSIGHTS
// ============================================

model PatternInsight {
  id                 Int      @id @default(autoincrement())
  userId             Int      @map("user_id")
  insightType        String?  @map("insight_type") // 'trigger', 'coping_mechanism', 'mood_correlation', 'writing_pattern'
  insightTitle       String?  @map("insight_title")
  insightDescription String?  @map("insight_description")
  supportingData     Json?    @map("supporting_data") // JSON with evidence
  dateRangeStart     DateTime? @map("date_range_start") @db.Date
  dateRangeEnd       DateTime? @map("date_range_end") @db.Date
  confidenceScore    Decimal?  @map("confidence_score") @db.Decimal(3, 2) // 0.00 to 1.00
  isAcknowledged     Boolean   @default(false) @map("is_acknowledged")
  createdAt          DateTime  @default(now()) @map("created_at")

  // Relations
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, createdAt(sort: Desc)])
  @@map("pattern_insights")
}

// ============================================
// 7. SUBSCRIPTIONS
// ============================================

model Subscription {
  id                 Int       @id @default(autoincrement())
  userId             Int       @unique @map("user_id")
  subscriptionTier   String    @map("subscription_tier") // 'free', 'premium'
  status             String    @default("active") // 'active', 'cancelled', 'expired', 'trial'
  paymentProvider    String?   @map("payment_provider") // 'stripe'
  paymentProviderId  String?   @map("payment_provider_id") // Stripe subscription ID
  billingCycle       String?   @map("billing_cycle") // 'monthly', 'annual'
  amount             Decimal?  @db.Decimal(10, 2)
  currency           String    @default("USD")
  trialStartDate     DateTime? @map("trial_start_date")
  trialEndDate       DateTime? @map("trial_end_date")
  currentPeriodStart DateTime? @map("current_period_start")
  currentPeriodEnd   DateTime? @map("current_period_end")
  cancelAtPeriodEnd  Boolean   @default(false) @map("cancel_at_period_end")
  cancelledAt        DateTime? @map("cancelled_at")
  createdAt          DateTime  @default(now()) @map("created_at")
  updatedAt          DateTime  @updatedAt @map("updated_at")

  // Relations
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([status])
  @@map("subscriptions")
}

// ============================================
// 8. REFRESH TOKENS
// ============================================

model RefreshToken {
  id              Int       @id @default(autoincrement())
  userId          Int       @map("user_id")
  token           String    @unique
  expiresAt       DateTime  @map("expires_at")
  createdAt       DateTime  @default(now()) @map("created_at")
  revokedAt       DateTime? @map("revoked_at")
  replacedByToken String?   @map("replaced_by_token")

  // Relations
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([token])
  @@map("refresh_tokens")
}

// ============================================
// 9. USER PREFERENCES
// ============================================

model UserPreference {
  id                       Int      @id @default(autoincrement())
  userId                   Int      @unique @map("user_id")
  aiInvolvementLevel       String   @default("moderate") @map("ai_involvement_level") // 'full', 'moderate', 'minimal'
  enableReflectiveResponses Boolean  @default(true) @map("enable_reflective_responses")
  enablePatternInsights    Boolean  @default(true) @map("enable_pattern_insights")
  enableWritingPrompts     Boolean  @default(true) @map("enable_writing_prompts")
  notificationDailyReminder Boolean @default(true) @map("notification_daily_reminder")
  notificationTime         String   @default("20:00") @map("notification_time")
  notificationWeeklyStory  Boolean  @default(true) @map("notification_weekly_story")
  theme                    String   @default("system") // 'light', 'dark', 'system'
  textSize                 String   @default("medium") @map("text_size") // 'small', 'medium', 'large'
  weeklyStoryDay           String   @default("sunday") @map("weekly_story_day") // Day of week for story generation
  narrativeStylePreference String   @default("third_person") @map("narrative_style_preference")
  createdAt                DateTime @default(now()) @map("created_at")
  updatedAt                DateTime @updatedAt @map("updated_at")

  // Relations
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("user_preferences")
}

// ============================================
// 10. MILESTONES
// ============================================

model Milestone {
  id                   Int      @id @default(autoincrement())
  userId               Int      @map("user_id")
  milestoneType        String   @map("milestone_type") // 'first_entry', '7_days', '30_days', '100_entries', etc.
  milestoneTitle       String?  @map("milestone_title")
  milestoneDescription String?  @map("milestone_description")
  achievedAt           DateTime @default(now()) @map("achieved_at")
  isViewed             Boolean  @default(false) @map("is_viewed")

  // Relations
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, achievedAt(sort: Desc)])
  @@map("milestones")
}

// ============================================
// 11. AUDIT LOGS
// ============================================

model AuditLog {
  id           Int      @id @default(autoincrement())
  userId       Int?     @map("user_id")
  action       String   // 'login', 'logout', 'create_entry', 'delete_entry', etc.
  resourceType String?  @map("resource_type") // 'entry', 'story', 'account'
  resourceId   Int?     @map("resource_id")
  ipAddress    String?  @map("ip_address")
  userAgent    String?  @map("user_agent")
  status       String?  // 'success', 'failed'
  errorMessage String?  @map("error_message")
  createdAt    DateTime @default(now()) @map("created_at")

  // Relations
  user User? @relation(fields: [userId], references: [id], onDelete: SetNull)

  @@index([userId, createdAt(sort: Desc)])
  @@index([action, createdAt(sort: Desc)])
  @@map("audit_logs")
}
```

### 2.3 Create Prisma Client Singleton

Create `src/lib/prisma.ts`:

```typescript
import { PrismaClient } from "@prisma/client";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import ws from "ws";

// Required for Neon serverless in Node.js
neonConfig.webSocketConstructor = ws;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaNeon(pool);
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
```

### 2.4 Create Seed File

Create `prisma/seed.ts`:

```typescript
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // 1. Create Roles
  const userRole = await prisma.role.upsert({
    where: { name: "user" },
    update: {},
    create: { name: "user", description: "Free tier user with basic features" },
  });

  const premiumRole = await prisma.role.upsert({
    where: { name: "premium_user" },
    update: {},
    create: { name: "premium_user", description: "Premium subscriber with all features" },
  });

  const masterRole = await prisma.role.upsert({
    where: { name: "master" },
    update: {},
    create: { name: "master", description: "Master user with admin privileges" },
  });

  // 2. Create Permissions (all 13 from the spec)
  const permissionData = [
    { name: "write_entry", description: "Create journal entries", category: "journaling" },
    { name: "view_entries", description: "Read own journal entries", category: "journaling" },
    { name: "generate_weekly_story", description: "Generate AI weekly story", category: "ai_features" },
    { name: "receive_ai_reflections", description: "Get AI reflective responses", category: "ai_features" },
    { name: "view_pattern_insights", description: "Access pattern recognition insights", category: "ai_features" },
    { name: "generate_monthly_report", description: "Generate monthly deep insights", category: "ai_features" },
    { name: "unlimited_history", description: "Access unlimited entry history", category: "storage" },
    { name: "cloud_backup", description: "Enable cloud backup and sync", category: "storage" },
    { name: "export_data", description: "Export entries as PDF/text", category: "export" },
    { name: "multiple_story_styles", description: "Choose from multiple story narrative styles", category: "ai_features" },
    { name: "voice_transcription", description: "Use voice-to-text for entries", category: "journaling" },
    { name: "custom_themes", description: "Access custom themes and fonts", category: "appearance" },
    { name: "admin_access", description: "Full system administration", category: "admin" },
  ];

  const permissions = [];
  for (const perm of permissionData) {
    const p = await prisma.permission.upsert({
      where: { name: perm.name },
      update: {},
      create: perm,
    });
    permissions.push(p);
  }

  // 3. Assign permissions to roles
  const freePerms = ["write_entry", "view_entries", "generate_weekly_story"];
  const adminPerms = ["admin_access"];

  for (const perm of permissions) {
    // Free role gets basic permissions
    if (freePerms.includes(perm.name)) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: userRole.id, permissionId: perm.id } },
        update: {},
        create: { roleId: userRole.id, permissionId: perm.id },
      });
    }

    // Premium role gets all except admin
    if (!adminPerms.includes(perm.name)) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: premiumRole.id, permissionId: perm.id } },
        update: {},
        create: { roleId: premiumRole.id, permissionId: perm.id },
      });
    }

    // Master role gets everything
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: masterRole.id, permissionId: perm.id } },
      update: {},
      create: { roleId: masterRole.id, permissionId: perm.id },
    });
  }

  // 4. Create Master User
  const passwordHash = await bcrypt.hash("Master@123!Change", 12);
  await prisma.user.upsert({
    where: { email: "master@mindweave.com" },
    update: {},
    create: {
      email: "master@mindweave.com",
      passwordHash,
      name: "Master Admin",
      roleId: masterRole.id,
      subscriptionTier: "master",
      isActive: true,
      isVerified: true,
      onboardingCompleted: true,
    },
  });

  console.log("✅ Seed complete!");
  console.log("Master user: master@mindweave.com / Master@123!Change");
  console.log("⚠️  CHANGE THIS PASSWORD IN PRODUCTION!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

Add to `package.json`:
```json
{
  "prisma": {
    "seed": "npx tsx prisma/seed.ts"
  }
}
```

### 2.5 Run Migration & Seed

```bash
# Generate migration
npx prisma migrate dev --name init

# Run seed
npx prisma db seed

# Generate Prisma Client
npx prisma generate
```

### 2.6 Create TypeScript Types

Create `src/types/index.ts` with shared types derived from Prisma:

```typescript
import type { User, JournalEntry, WeeklyStory, AiReflection, PatternInsight } from "@prisma/client";

// User without sensitive fields
export type SafeUser = Omit<User, "passwordHash" | "verificationToken" | "resetPasswordToken" | "resetPasswordExpires">;

// Mood types
export const MOODS = ["heavy", "sad", "okay", "good", "great"] as const;
export type Mood = (typeof MOODS)[number];

// Mood metadata (for UI display)
export const MOOD_CONFIG: Record<Mood, { emoji: string; label: string; color: string }> = {
  heavy: { emoji: "😢", label: "Heavy", color: "var(--mood-heavy)" },
  sad: { emoji: "😟", label: "Sad", color: "var(--mood-sad)" },
  okay: { emoji: "😐", label: "Okay", color: "var(--mood-reflective)" },
  good: { emoji: "🙂", label: "Good", color: "var(--mood-hopeful)" },
  great: { emoji: "😊", label: "Great", color: "var(--mood-grounded)" },
};

// Narrative styles
export const NARRATIVE_STYLES = ["third_person", "letter", "chapter"] as const;
export type NarrativeStyle = (typeof NARRATIVE_STYLES)[number];

// Tag options
export const JOURNAL_TAGS = [
  "anxiety", "gratitude", "breakthrough", "setback",
  "hope", "anger", "peace", "grief", "love", "fear",
  "growth", "reflection", "coping", "walking",
] as const;
export type JournalTag = (typeof JOURNAL_TAGS)[number];

// Subscription tiers
export const SUBSCRIPTION_TIERS = ["free", "premium", "master"] as const;
export type SubscriptionTier = (typeof SUBSCRIPTION_TIERS)[number];

// AI involvement levels
export const AI_LEVELS = ["full", "moderate", "minimal"] as const;
export type AiLevel = (typeof AI_LEVELS)[number];

// Re-export Prisma types
export type { User, JournalEntry, WeeklyStory, AiReflection, PatternInsight };
```

---

## Verification

- [ ] `npx prisma validate` passes
- [ ] `npx prisma migrate dev` runs successfully
- [ ] `npx prisma db seed` creates roles, permissions, and master user
- [ ] `npx prisma studio` opens and shows all 11 tables with correct data
- [ ] Master user exists with email `master@mindweave.com`
- [ ] Roles have correct permission assignments (free: 3, premium: 12, master: 13)
- [ ] TypeScript types compile without errors

---

## Files Created/Modified

| File | Action |
|------|--------|
| `prisma/schema.prisma` | Created (complete schema) |
| `prisma/seed.ts` | Created |
| `src/lib/prisma.ts` | Created (singleton client) |
| `src/types/index.ts` | Created (shared types) |
| `package.json` | Modified (prisma seed config) |

---

**Estimated Time:** 1–2 hours  
**Next Task:** [AGENT-03 — Authentication System](file:///Users/yoshiafk/Development/Personal%20Project/mindweave/agent-tasks/AGENT-03-auth.md)
