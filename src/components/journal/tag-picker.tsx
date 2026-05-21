"use client";

import React, { useRef } from "react";
import { JOURNAL_TAGS } from "@/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TagPickerProps {
  selectedTags: string[];
  onChange: (tags: string[]) => void;
  maxTags?: number;
}

export function TagPicker({
  selectedTags,
  onChange,
  maxTags = 10,
}: TagPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onChange(selectedTags.filter((t) => t !== tag));
    } else {
      if (selectedTags.length < maxTags) {
        onChange([...selectedTags, tag]);
      }
    }
  };

  return (
    <div className="w-full flex flex-col gap-2 py-2">
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 font-sans tracking-wide">
          Focus tags
        </span>
        <span className="text-[10px] text-neutral-400 dark:text-neutral-500">
          {selectedTags.length}/{maxTags} selected
        </span>
      </div>

      {/* Horizontal scroll container with hidden scrollbar */}
      <div
        ref={containerRef}
        className="w-full flex overflow-x-auto gap-1.5 py-1 px-0.5 scrollbar-none select-none scroll-smooth"
        style={{
          msOverflowStyle: "none",
          scrollbarWidth: "none",
        }}
      >
        {JOURNAL_TAGS.map((tag) => {
          const isSelected = selectedTags.includes(tag);
          
          return (
            <button
              key={tag}
              type="button"
              onClick={() => handleTagToggle(tag)}
              className="focus:outline-none shrink-0"
            >
              <Badge
                className={cn(
                  "px-3 py-1 text-[11px] rounded-full border transition-all duration-300 font-sans font-normal",
                  isSelected
                    ? "bg-[#3E4F6E] hover:bg-[#2C3B57] text-white border-[#3E4F6E] dark:bg-[#8FA1C4] dark:hover:bg-[#7287AD] dark:text-neutral-900 dark:border-[#8FA1C4] font-medium scale-[1.03] shadow-sm"
                    : "bg-[#F2EFE9]/40 hover:bg-[#EAE7DF]/75 border-[#E4DFD5]/40 text-neutral-500 hover:text-neutral-700 dark:bg-neutral-800/40 dark:hover:bg-neutral-700/50 dark:border-neutral-700/20 dark:text-neutral-400 dark:hover:text-neutral-200"
                )}
              >
                {tag}
              </Badge>
            </button>
          );
        })}
      </div>
    </div>
  );
}
