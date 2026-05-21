import { PenLine, BookOpen, BarChart3, Settings } from "lucide-react";

export const bottomNavItems = [
  { label: "Write", href: "/journal", icon: PenLine },
  { label: "Stories", href: "/stories", icon: BookOpen },
  { label: "Insights", href: "/insights", icon: BarChart3 },
  { label: "Settings", href: "/settings", icon: Settings },
] as const;
