import React from "react";
import { MobileShell } from "@/components/layout/mobile-shell";
import { AppHeader } from "@/components/layout/app-header";
import { BottomNav } from "@/components/layout/bottom-nav";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <MobileShell>
      <AppHeader />
      <main className="flex-1 overflow-y-auto relative flex flex-col bg-[#FBF9F4] dark:bg-[#181818] text-neutral-800 dark:text-neutral-200">
        {children}
      </main>
      <BottomNav />
    </MobileShell>
  );
}
