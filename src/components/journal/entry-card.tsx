"use client";

import React from "react";
import Link from "next/link";
import { format } from "date-fns";
import { type Mood, MOOD_CONFIG } from "@/types";
import { Badge } from "@/components/ui/badge";
import { FileText, ArrowRight } from "lucide-react";
// Clean HTML to plain text helper (for TiPtap rich-text snippet)
function getPlainText(htmlString: string): string {
  if (typeof window === "undefined") {
    // Basic server-side regex strip
    return htmlString.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  }
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = htmlString;
  return tempDiv.textContent || tempDiv.innerText || "";
}

interface EntryCardProps {
  entry: {
    id: number;
    entryDate: string | Date;
    entryText: string;
    moodBefore?: string | null;
    moodAfter?: string | null;
    tags: string[];
    wordCount?: number | null;
  };
}

export function EntryCard({ entry }: EntryCardProps) {
  const dateObj = new Date(entry.entryDate);
  const formattedDate = format(dateObj, "MMM d, yyyy");
  const plainTextSnippet = getPlainText(entry.entryText);

  const moodBeforeConfig = entry.moodBefore ? MOOD_CONFIG[entry.moodBefore as Mood] : null;
  const moodAfterConfig = entry.moodAfter ? MOOD_CONFIG[entry.moodAfter as Mood] : null;

  return (
    <Link
      href={`/journal/${entry.id}`}
      className="block group bg-white dark:bg-[#1E1E1E] p-5 rounded-2xl border border-[#EBE8E0] dark:border-neutral-800 hover:border-[#3E4F6E]/40 dark:hover:border-[#8FA1C4]/40 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden active:scale-[0.99]"
    >
      {/* Background soft glow based on mood after */}
      {moodAfterConfig && (
        <div
          className="absolute top-0 right-0 w-24 h-24 rounded-full filter blur-[40px] opacity-10 pointer-events-none"
          style={{ backgroundColor: moodAfterConfig.cssVar }}
        />
      )}

      <div className="flex flex-col gap-3">
        {/* Card Header: Date & Mood Progression */}
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 font-sans tracking-wide">
            {formattedDate}
          </span>

          <div className="flex items-center gap-1 bg-[#FBFBFB] dark:bg-neutral-900 border border-[#F2EFE9] dark:border-neutral-800/80 px-2 py-0.5 rounded-full select-none">
            {moodBeforeConfig && (
              <span className="text-sm" title={`Before: ${moodBeforeConfig.label}`}>
                {moodBeforeConfig.emoji}
              </span>
            )}
            
            {moodBeforeConfig && moodAfterConfig && moodBeforeConfig.emoji !== moodAfterConfig.emoji && (
              <ArrowRight className="w-2.5 h-2.5 text-neutral-400 dark:text-neutral-600 mx-0.5 stroke-[2.5]" />
            )}
            
            {moodAfterConfig && moodBeforeConfig?.emoji !== moodAfterConfig.emoji && (
              <span className="text-sm" title={`After: ${moodAfterConfig.label}`}>
                {moodAfterConfig.emoji}
              </span>
            )}
          </div>
        </div>

        {/* Card Title/Snippet */}
        <p className="text-xs text-neutral-600 dark:text-neutral-300 font-sans leading-relaxed line-clamp-3 group-hover:text-neutral-800 dark:group-hover:text-neutral-100 transition-colors">
          {plainTextSnippet || <span className="italic opacity-50">Empty entry</span>}
        </p>

        {/* Card Footer: Tags & Word Count */}
        <div className="flex items-center justify-between pt-1 border-t border-neutral-50 dark:border-neutral-800/60 mt-1">
          <div className="flex items-center gap-1.5 overflow-hidden max-w-[70%]">
            {entry.tags.slice(0, 3).map((tag) => (
              <Badge
                key={tag}
                className="bg-[#F2EFE9]/40 border-[#E4DFD5]/40 text-neutral-500 text-[9px] font-sans font-normal px-2 py-0.5 rounded-full shrink-0 dark:bg-neutral-800/50 dark:border-neutral-700/30 dark:text-neutral-400"
              >
                #{tag}
              </Badge>
            ))}
            {entry.tags.length > 3 && (
              <span className="text-[9px] text-neutral-400 font-sans">
                +{entry.tags.length - 3}
              </span>
            )}
          </div>

          {entry.wordCount !== undefined && entry.wordCount !== null && (
            <span className="flex items-center gap-1 text-[9px] text-neutral-400 dark:text-neutral-500 font-sans font-medium">
              <FileText className="w-3 h-3 text-neutral-400" />
              {entry.wordCount} words
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
