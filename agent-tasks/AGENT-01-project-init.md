# AGENT-01: Project Initialization & Scaffold

> **Pre-requisite:** Read [AGENT-00-context.md](file:///Users/yoshiafk/Development/Personal%20Project/mindweave/agent-tasks/AGENT-00-context.md) first.

---

## Objective

Initialize the Next.js 15 project with TypeScript, Tailwind CSS, shadcn/ui, and all foundational dependencies. Set up the project structure, design system, and development tooling.

---

## Tasks

### 1.1 Initialize Next.js Project

```bash
npx -y create-next-app@latest ./ --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --turbopack
```

- Use App Router
- Enable TypeScript strict mode
- Enable src directory
- Use `@/*` import alias

### 1.2 Install Core Dependencies

```bash
# UI & Styling
npm install class-variance-authority clsx tailwind-merge lucide-react
npm install framer-motion
npm install @radix-ui/react-icons

# Fonts
npm install @fontsource-variable/inter @fontsource-variable/lora

# Forms & Validation
npm install react-hook-form @hookform/resolvers zod

# Data Fetching
npm install @tanstack/react-query

# Date utilities
npm install date-fns

# Charts
npm install recharts

# Rich text editor
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-placeholder

# Auth
npm install next-auth@beta @auth/prisma-adapter

# Database
npm install prisma @prisma/client @prisma/adapter-neon @neondatabase/serverless

# AI
npm install ai @google/generative-ai @ai-sdk/google

# Email
npm install resend

# Payments
npm install stripe @stripe/stripe-js

# Rate limiting
npm install @upstash/ratelimit @upstash/redis

# Utilities
npm install bcryptjs nanoid sonner
npm install -D @types/bcryptjs

# Logging
npm install pino pino-pretty

# Dev dependencies
npm install -D prettier prettier-plugin-tailwindcss
```

### 1.3 Initialize shadcn/ui

```bash
npx shadcn@latest init
```

Configure `components.json`:
```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/app/globals.css",
    "baseColor": "zinc",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

Install initial shadcn/ui components:
```bash
npx shadcn@latest add button card input textarea label badge switch dialog sheet
npx shadcn@latest add dropdown-menu avatar separator skeleton tabs toast
npx shadcn@latest add select toggle toggle-group scroll-area tooltip popover
npx shadcn@latest add alert-dialog sonner form command progress
```

### 1.4 Configure Design System (globals.css)

Create the MindWeave design system in `src/app/globals.css`:

```css
@import "tailwindcss";

/* Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&display=swap');

@layer base {
  :root {
    /* === MindWeave Brand Colors === */
    --twilight-blue: 222 23% 39%;
    --soft-lavender: 270 20% 72%;
    --warm-cream: 40 33% 96%;

    /* Mood indicator colors */
    --mood-heavy: 207 30% 25%;
    --mood-sad: 215 10% 59%;
    --mood-hopeful: 0 25% 74%;
    --mood-peaceful: 40 50% 77%;
    --mood-grounded: 148 15% 49%;

    /* === shadcn/ui Token Overrides === */
    --background: 40 33% 96%;
    --foreground: 0 0% 16%;
    --card: 0 0% 100%;
    --card-foreground: 0 0% 16%;
    --popover: 0 0% 100%;
    --popover-foreground: 0 0% 16%;
    --primary: 222 23% 39%;
    --primary-foreground: 0 0% 100%;
    --secondary: 270 20% 92%;
    --secondary-foreground: 270 20% 30%;
    --muted: 40 20% 92%;
    --muted-foreground: 0 0% 42%;
    --accent: 270 20% 92%;
    --accent-foreground: 270 20% 30%;
    --destructive: 0 25% 63%;
    --destructive-foreground: 0 0% 100%;
    --success: 120 15% 56%;
    --warning: 27 40% 64%;
    --border: 40 16% 90%;
    --input: 40 16% 90%;
    --ring: 222 23% 39%;
    --radius: 0.75rem;

    /* Typography */
    --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
    --font-serif: 'Lora', Georgia, serif;
  }

  .dark {
    --background: 0 0% 10%;
    --foreground: 40 33% 96%;
    --card: 0 0% 16%;
    --card-foreground: 40 33% 96%;
    --popover: 0 0% 16%;
    --popover-foreground: 40 33% 96%;
    --primary: 222 23% 55%;
    --primary-foreground: 0 0% 100%;
    --secondary: 270 20% 25%;
    --secondary-foreground: 270 20% 85%;
    --muted: 0 0% 20%;
    --muted-foreground: 0 0% 72%;
    --accent: 0 0% 22%;
    --accent-foreground: 40 33% 96%;
    --destructive: 0 25% 50%;
    --destructive-foreground: 0 0% 100%;
    --border: 0 0% 100% / 0.08;
    --input: 0 0% 100% / 0.08;
    --ring: 222 23% 55%;
  }
}

@layer base {
  * {
    @apply border-border;
  }

  body {
    @apply bg-background text-foreground font-sans antialiased;
  }

  /* Journal entry typography — generous line height for breathing room */
  .journal-text {
    @apply text-[17px] leading-[1.6] tracking-normal;
  }

  /* Story typography — serif, literary feel */
  .story-text {
    @apply font-serif text-[19px] leading-[1.7] tracking-[-0.01em];
  }

  /* Display typography — semi-bold, slightly tight */
  .display-text {
    @apply text-[28px] font-semibold leading-[1.2] tracking-[-0.5px];
  }
}
```

### 1.5 Create Utility Functions

Create `src/lib/utils.ts`:
```typescript
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string, format?: string): string {
  // Use date-fns formatting
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
}

export function calculateWordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}
```

### 1.6 Create Site Configuration

Create `src/config/site.ts`:
```typescript
export const siteConfig = {
  name: "MindWeave",
  tagline: "Weave your thoughts into stories of healing",
  description: "A journaling app that helps you process emotions through daily writing, using AI to transform your thoughts into meaningful narratives and insights.",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ogImage: "/og-image.png",
  links: {
    privacy: "/privacy",
    terms: "/terms",
  },
};
```

Create `src/config/nav.ts`:
```typescript
import { PenLine, BookOpen, BarChart3, Settings } from "lucide-react";

export const bottomNavItems = [
  { label: "Write", href: "/journal", icon: PenLine },
  { label: "Stories", href: "/stories", icon: BookOpen },
  { label: "Insights", href: "/insights", icon: BarChart3 },
  { label: "Settings", href: "/settings", icon: Settings },
] as const;
```

Create `src/config/permissions.ts`:
```typescript
export const PERMISSIONS = {
  WRITE_ENTRY: "write_entry",
  VIEW_ENTRIES: "view_entries",
  GENERATE_WEEKLY_STORY: "generate_weekly_story",
  RECEIVE_AI_REFLECTIONS: "receive_ai_reflections",
  VIEW_PATTERN_INSIGHTS: "view_pattern_insights",
  GENERATE_MONTHLY_REPORT: "generate_monthly_report",
  UNLIMITED_HISTORY: "unlimited_history",
  CLOUD_BACKUP: "cloud_backup",
  EXPORT_DATA: "export_data",
  MULTIPLE_STORY_STYLES: "multiple_story_styles",
  VOICE_TRANSCRIPTION: "voice_transcription",
  CUSTOM_THEMES: "custom_themes",
  ADMIN_ACCESS: "admin_access",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const FREE_PERMISSIONS: Permission[] = [
  PERMISSIONS.WRITE_ENTRY,
  PERMISSIONS.VIEW_ENTRIES,
  PERMISSIONS.GENERATE_WEEKLY_STORY,
];

export const PREMIUM_PERMISSIONS: Permission[] = [
  ...FREE_PERMISSIONS,
  PERMISSIONS.RECEIVE_AI_REFLECTIONS,
  PERMISSIONS.VIEW_PATTERN_INSIGHTS,
  PERMISSIONS.GENERATE_MONTHLY_REPORT,
  PERMISSIONS.UNLIMITED_HISTORY,
  PERMISSIONS.CLOUD_BACKUP,
  PERMISSIONS.EXPORT_DATA,
  PERMISSIONS.MULTIPLE_STORY_STYLES,
  PERMISSIONS.VOICE_TRANSCRIPTION,
  PERMISSIONS.CUSTOM_THEMES,
];

export const MASTER_PERMISSIONS: Permission[] = [
  ...PREMIUM_PERMISSIONS,
  PERMISSIONS.ADMIN_ACCESS,
];
```

### 1.7 Create Root Layout

Update `src/app/layout.tsx`:
```tsx
import type { Metadata, Viewport } from "next";
import { Inter, Lora } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryProvider } from "@/components/query-provider";
import "./globals.css";
import { siteConfig } from "@/config/site";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  metadataBase: new URL(siteConfig.url),
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F8F6F1" },
    { media: "(prefers-color-scheme: dark)", color: "#1A1A1A" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${lora.variable} font-sans`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            {children}
          </QueryProvider>
          <Toaster position="top-center" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### 1.8 Create Provider Components

Create `src/components/theme-provider.tsx` — use `next-themes`:
```bash
npm install next-themes
```

Create `src/components/query-provider.tsx` — TanStack Query provider.

### 1.9 Set Up .env.example

Create `.env.example` with all required environment variables (see AGENT-00 Section 11).

### 1.10 Create Empty Directory Structure

Create all directories from the project structure in AGENT-00 Section 4. Add `.gitkeep` files to empty directories.

### 1.11 Configure Tailwind

Update `tailwind.config.ts` to include:
- Custom font families (Inter, Lora)
- Extended color palette with mood colors
- Custom animations (fade-in, slide-up, pulse-soft, etc.)
- Container queries if needed

### 1.12 Create .gitignore

Ensure `.gitignore` covers:
- `node_modules/`
- `.env.local`
- `.next/`
- `prisma/*.db`
- `.vercel/`

---

## Verification

- [ ] `npm run dev` starts without errors
- [ ] Pages render with warm cream background (#F8F6F1)
- [ ] Inter font loads correctly
- [ ] shadcn/ui Button component renders with twilight blue color
- [ ] Dark mode toggle works (system / light / dark)
- [ ] No TypeScript errors (`npx tsc --noEmit`)
- [ ] All directories from project structure exist

---

## Files Created/Modified

| File | Action |
|------|--------|
| `package.json` | Modified (deps added) |
| `src/app/globals.css` | Modified (design system) |
| `src/app/layout.tsx` | Modified (fonts, providers, metadata) |
| `src/lib/utils.ts` | Created |
| `src/config/site.ts` | Created |
| `src/config/nav.ts` | Created |
| `src/config/permissions.ts` | Created |
| `src/components/theme-provider.tsx` | Created |
| `src/components/query-provider.tsx` | Created |
| `components.json` | Created (shadcn config) |
| `tailwind.config.ts` | Modified |
| `.env.example` | Created |
| `.gitignore` | Modified |
| All `src/components/*/` dirs | Created (empty + .gitkeep) |
| All `src/lib/*/` dirs | Created (empty + .gitkeep) |

---

**Estimated Time:** 1–2 hours  
**Next Task:** [AGENT-02 — Database Schema & Prisma](file:///Users/yoshiafk/Development/Personal%20Project/mindweave/agent-tasks/AGENT-02-database.md)
