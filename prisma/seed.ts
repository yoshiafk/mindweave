import path from "node:path";
import dotenv from "dotenv";
dotenv.config({ path: path.join(__dirname, "..", ".env.local") });
dotenv.config({ path: path.join(__dirname, "..", ".env") });

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding MindWeave database...\n");

  // ============================================
  // 1. Create Roles
  // ============================================
  console.log("Creating roles...");

  const userRole = await prisma.role.upsert({
    where: { name: "user" },
    update: {},
    create: { name: "user", description: "Free tier user with basic features" },
  });

  const premiumRole = await prisma.role.upsert({
    where: { name: "premium_user" },
    update: {},
    create: {
      name: "premium_user",
      description: "Premium subscriber with all features",
    },
  });

  const masterRole = await prisma.role.upsert({
    where: { name: "master" },
    update: {},
    create: {
      name: "master",
      description: "Master user with admin privileges and all features unlocked",
    },
  });

  console.log(`  ✅ Roles: user (${userRole.id}), premium_user (${premiumRole.id}), master (${masterRole.id})`);

  // ============================================
  // 2. Create Permissions (13 total)
  // ============================================
  console.log("Creating permissions...");

  const permissionData = [
    // Journaling
    { name: "write_entry", description: "Create and edit journal entries", category: "journaling" },
    { name: "view_entries", description: "Read own journal entries", category: "journaling" },
    { name: "voice_transcription", description: "Use voice-to-text for entries", category: "journaling" },
    // AI Features
    { name: "generate_weekly_story", description: "Generate AI weekly narrative story", category: "ai_features" },
    { name: "receive_ai_reflections", description: "Get AI reflective responses after entries", category: "ai_features" },
    { name: "view_pattern_insights", description: "Access AI pattern recognition insights", category: "ai_features" },
    { name: "generate_monthly_report", description: "Generate monthly deep insights report", category: "ai_features" },
    { name: "multiple_story_styles", description: "Choose from multiple narrative styles", category: "ai_features" },
    // Storage & Export
    { name: "unlimited_history", description: "Access unlimited entry history (vs 7 days)", category: "storage" },
    { name: "cloud_backup", description: "Enable cloud backup and sync", category: "storage" },
    { name: "export_data", description: "Export entries as PDF/text/JSON", category: "export" },
    // Appearance
    { name: "custom_themes", description: "Access custom themes and font options", category: "appearance" },
    // Admin
    { name: "admin_access", description: "Full system administration access", category: "admin" },
  ];

  const permissions: { id: number; name: string }[] = [];
  for (const perm of permissionData) {
    const p = await prisma.permission.upsert({
      where: { name: perm.name },
      update: {},
      create: perm,
    });
    permissions.push(p);
  }

  console.log(`  ✅ Permissions: ${permissions.length} created`);

  // ============================================
  // 3. Assign Permissions to Roles
  // ============================================
  console.log("Assigning permissions to roles...");

  // Permissions available to free users
  const freePermNames = ["write_entry", "view_entries", "generate_weekly_story"];

  // Permissions exclusive to admin
  const adminPermNames = ["admin_access"];

  for (const perm of permissions) {
    // Free role → basic permissions
    if (freePermNames.includes(perm.name)) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: userRole.id,
            permissionId: perm.id,
          },
        },
        update: {},
        create: { roleId: userRole.id, permissionId: perm.id },
      });
    }

    // Premium role → everything except admin
    if (!adminPermNames.includes(perm.name)) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: premiumRole.id,
            permissionId: perm.id,
          },
        },
        update: {},
        create: { roleId: premiumRole.id, permissionId: perm.id },
      });
    }

    // Master role → everything
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: masterRole.id,
          permissionId: perm.id,
        },
      },
      update: {},
      create: { roleId: masterRole.id, permissionId: perm.id },
    });
  }

  // Count assignments per role
  const freeCount = await prisma.rolePermission.count({ where: { roleId: userRole.id } });
  const premiumCount = await prisma.rolePermission.count({ where: { roleId: premiumRole.id } });
  const masterCount = await prisma.rolePermission.count({ where: { roleId: masterRole.id } });
  console.log(`  ✅ Role permissions: user=${freeCount}, premium=${premiumCount}, master=${masterCount}`);

  // ============================================
  // 4. Create Master User
  // ============================================
  console.log("Creating master user...");

  const passwordHash = await bcrypt.hash("Master@123!Change", 12);
  const masterUser = await prisma.user.upsert({
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

  // Create default preferences for master user
  await prisma.userPreference.upsert({
    where: { userId: masterUser.id },
    update: {},
    create: {
      userId: masterUser.id,
      aiInvolvementLevel: "full",
    },
  });

  // Create default subscription for master user
  await prisma.subscription.upsert({
    where: { userId: masterUser.id },
    update: {},
    create: {
      userId: masterUser.id,
      subscriptionTier: "master",
      status: "active",
    },
  });

  console.log(`  ✅ Master user: master@mindweave.com (ID: ${masterUser.id})`);

  // ============================================
  // Done!
  // ============================================
  console.log("\n🎉 Seed complete!");
  console.log("───────────────────────────────────────");
  console.log("  Master login: master@mindweave.com");
  console.log("  Password:     Master@123!Change");
  console.log("  ⚠️  CHANGE THIS PASSWORD IN PRODUCTION!");
  console.log("───────────────────────────────────────");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
