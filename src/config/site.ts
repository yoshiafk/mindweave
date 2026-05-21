export const siteConfig = {
  name: "MindWeave",
  tagline: "Weave your thoughts into stories of healing",
  description:
    "A journaling app that helps you process emotions through daily writing, using AI to transform your thoughts into meaningful narratives and insights.",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ogImage: "/og-image.png",
  links: {
    privacy: "/privacy",
    terms: "/terms",
  },
} as const;
