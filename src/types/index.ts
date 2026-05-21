// ================================================
// MindWeave — Shared TypeScript Types
// ================================================

// Mood types matching Design Spec Section 3.3
export const MOODS = ["heavy", "sad", "okay", "good", "great"] as const;
export type Mood = (typeof MOODS)[number];

// Mood metadata for UI rendering
export const MOOD_CONFIG: Record<
  Mood,
  { emoji: string; label: string; cssVar: string }
> = {
  heavy: { emoji: "😢", label: "Heavy", cssVar: "var(--mood-heavy)" },
  sad: { emoji: "😟", label: "Sad", cssVar: "var(--mood-sad)" },
  okay: { emoji: "😐", label: "Okay", cssVar: "var(--mood-okay)" },
  good: { emoji: "🙂", label: "Good", cssVar: "var(--mood-good)" },
  great: { emoji: "😊", label: "Great", cssVar: "var(--mood-great)" },
};

// Narrative styles for weekly stories
export const NARRATIVE_STYLES = [
  "third_person",
  "letter",
  "chapter",
] as const;
export type NarrativeStyle = (typeof NARRATIVE_STYLES)[number];

export const NARRATIVE_STYLE_CONFIG: Record<
  NarrativeStyle,
  { label: string; description: string; example: string }
> = {
  third_person: {
    label: "Third Person",
    description: "A narrative told about you",
    example: '"This week, they learned that healing isn\'t linear..."',
  },
  letter: {
    label: "Letter to Yourself",
    description: "A personal letter from your story",
    example: '"Dear you, this week you showed courage when..."',
  },
  chapter: {
    label: "Chapter Format",
    description: "Your week as a book chapter",
    example: '"Chapter 7: The Week of Small Victories"',
  },
};

// Journal tags
export const JOURNAL_TAGS = [
  "anxiety",
  "gratitude",
  "breakthrough",
  "setback",
  "hope",
  "anger",
  "peace",
  "grief",
  "love",
  "fear",
  "growth",
  "reflection",
  "coping",
  "walking",
] as const;
export type JournalTag = (typeof JOURNAL_TAGS)[number];

// Subscription tiers
export const SUBSCRIPTION_TIERS = ["free", "premium", "master"] as const;
export type SubscriptionTier = (typeof SUBSCRIPTION_TIERS)[number];

// AI involvement levels
export const AI_LEVELS = ["full", "moderate", "minimal"] as const;
export type AiLevel = (typeof AI_LEVELS)[number];

export const AI_LEVEL_CONFIG: Record<
  AiLevel,
  { label: string; description: string; recommended?: boolean }
> = {
  full: {
    label: "Full",
    description: "All AI features enabled — stories, reflections, insights",
  },
  moderate: {
    label: "Moderate",
    description: "Weekly stories only — our recommendation",
    recommended: true,
  },
  minimal: {
    label: "Minimal",
    description: "Just journaling — no AI features",
  },
};

// Journey reasons (onboarding)
export const JOURNEY_REASONS = [
  "heartbreak",
  "grief",
  "anxiety",
  "life_transition",
  "just_journal",
  "prefer_not_say",
] as const;
export type JourneyReason = (typeof JOURNEY_REASONS)[number];

export const JOURNEY_REASON_CONFIG: Record<
  JourneyReason,
  { label: string }
> = {
  heartbreak: { label: "Heartbreak or relationship" },
  grief: { label: "Grief or loss" },
  anxiety: { label: "Anxiety or stress" },
  life_transition: { label: "Life transition" },
  just_journal: { label: "Just want to journal" },
  prefer_not_say: { label: "Prefer not to say" },
};

// ============================================
// AI Reflection & Journal Entry Types
// ============================================

export interface AiReflection {
  id: number;
  entryId: number;
  userId: number;
  reflectionText: string;
  reflectionType: string;
  isRead: boolean;
  createdAt: string | Date;
}

export interface JournalEntry {
  id: number;
  userId: number;
  entryDate: string | Date;
  entryText: string;
  moodBefore?: Mood | string | null;
  moodAfter?: Mood | string | null;
  tags: string[];
  wordCount?: number | null;
  isVoiceTranscription: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
  reflections?: AiReflection[];
}

