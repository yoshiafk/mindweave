import { z } from "zod";
import { MOODS } from "@/types";

export const createEntrySchema = z.object({
  entryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (must be YYYY-MM-DD)"),
  entryText: z.string().min(1, "Write something...").max(50000, "Entry too long"),
  moodBefore: z.enum(MOODS).optional(),
  moodAfter: z.enum(MOODS).optional(),
  tags: z.array(z.string()).max(10, "You can select up to 10 tags").default([]),
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

export type CreateEntryInput = z.infer<typeof createEntrySchema>;
export type UpdateEntryInput = z.infer<typeof updateEntrySchema>;
export type EntryQueryInput = z.infer<typeof entryQuerySchema>;
