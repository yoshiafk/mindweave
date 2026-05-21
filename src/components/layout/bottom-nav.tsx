"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { bottomNavItems } from "@/config/nav";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="h-16 border-t border-[#EBE8E0]/60 dark:border-neutral-800 bg-[#FBF9F4]/95 dark:bg-[#181818]/95 backdrop-blur-md flex items-center justify-around px-2 z-30 pb-safe-bottom md:mb-6">
      {bottomNavItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center flex-1 h-full py-1 text-[11px] font-medium transition-all duration-300 relative group",
              isActive
                ? "text-[#3E4F6E] dark:text-[#8FA1C4]"
                : "text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300"
            )}
          >
            {/* Active background indicator light */}
            {isActive && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-0.5 bg-[#3E4F6E] dark:bg-[#8FA1C4] rounded-full" />
            )}
            
            <Icon
              className={cn(
                "w-5 h-5 mb-1 transition-transform duration-300",
                isActive ? "scale-110 stroke-[2.2]" : "group-hover:scale-105 stroke-[1.8]"
              )}
            />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
