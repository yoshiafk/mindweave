import { GoogleGenerativeAI } from "@google/generative-ai";
import { google } from "@ai-sdk/google";

// ================================================
// MindWeave — Gemini AI Client
// ================================================
// Uses Google's Gemini 2.5 Flash for:
// - Weekly story generation
// - AI reflections (post-entry)
// - Pattern insight analysis
// - Contextual writing prompts
// - Monthly reports
// ================================================

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable is required");
}

/**
 * Native Google GenAI client — for direct Gemini API calls
 * Use this when you need fine-grained control over the request.
 */
export const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Gemini model instance for content generation.
 * Using gemini-2.5-flash for fast, cost-effective generation.
 */
export const geminiModel = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  generationConfig: {
    temperature: 0.8, // Warm, creative but controlled
    topP: 0.95,
    maxOutputTokens: 4096,
  },
});

/**
 * Vercel AI SDK provider — for streaming and structured output.
 * Use this with the Vercel AI SDK `generateText` / `streamText` functions.
 */
export const geminiProvider = google("gemini-2.5-flash");

/**
 * AI model configuration constants
 */
export const AI_CONFIG = {
  /** Max tokens for story generation */
  STORY_MAX_TOKENS: 4096,
  /** Max tokens for reflections */
  REFLECTION_MAX_TOKENS: 512,
  /** Max tokens for insights */
  INSIGHT_MAX_TOKENS: 2048,
  /** Max tokens for writing prompts */
  PROMPT_MAX_TOKENS: 128,
  /** Max tokens for monthly reports */
  REPORT_MAX_TOKENS: 8192,
  /** Temperature for empathetic content (stories, reflections) */
  EMPATHETIC_TEMP: 0.8,
  /** Temperature for analytical content (insights, reports) */
  ANALYTICAL_TEMP: 0.5,
} as const;
