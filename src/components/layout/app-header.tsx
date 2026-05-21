"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { Sparkles } from "lucide-react";
import { format } from "date-fns";

export function AppHeader() {
  const { data: session } = useSession();
  const today = format(new Date(), "EEEE, MMM d");

  const tier = session?.user?.subscriptionTier;

  return (
    <header className="h-14 border-b border-[#EBE8E0]/60 dark:border-neutral-800 bg-[#FBF9F4]/90 dark:bg-[#181818]/90 backdrop-blur-md px-6 flex items-center justify-between z-30 select-none md:mt-6">
      <div className="flex flex-col">
        <h1 className="text-xl font-bold font-serif text-[#3E4F6E] dark:text-[#8FA1C4] leading-tight">
          MindWeave
        </h1>
        <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-sans tracking-wide">
          {today}
        </span>
      </div>

      <div className="flex items-center gap-3">
        {tier && tier !== "free" && (
          <span className="flex items-center gap-1 text-[10px] font-semibold bg-amber-500/10 dark:bg-amber-400/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/20">
            <Sparkles className="w-2.5 h-2.5 fill-current" />
            {tier.toUpperCase()}
          </span>
        )}
        <div className="w-7 h-7 rounded-full bg-[#EAE7DF] dark:bg-neutral-800 border border-[#DEDBD2] dark:border-neutral-700 flex items-center justify-center text-xs font-semibold text-neutral-600 dark:text-neutral-300">
          {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : "U"}
        </div>
      </div>
    </header>
  );
}
