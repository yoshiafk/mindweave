"use client";

import React from "react";
import { motion } from "framer-motion";
import { MOODS, MOOD_CONFIG, type Mood } from "@/types";
import { cn } from "@/lib/utils";

interface MoodSelectorProps {
  value: Mood | null;
  onChange: (mood: Mood) => void;
  label?: string;
}

export function MoodSelector({ value, onChange, label }: MoodSelectorProps) {
  return (
    <div className="flex flex-col items-center gap-3 w-full py-2">
      {label && (
        <span className="text-xs font-medium text-neutral-400 dark:text-neutral-500 font-sans tracking-wide">
          {label}
        </span>
      )}
      
      <div className="flex items-center justify-between w-full max-w-[280px] px-2 py-3 bg-[#F2EFE9]/40 dark:bg-neutral-800/40 rounded-2xl border border-[#E4DFD5]/40 dark:border-neutral-700/20 backdrop-blur-sm">
        {MOODS.map((mood) => {
          const config = MOOD_CONFIG[mood];
          const isSelected = value === mood;
          const hasSelection = value !== null;
          
          return (
            <motion.button
              key={mood}
              type="button"
              onClick={() => onChange(mood)}
              className="flex flex-col items-center gap-1 focus:outline-none relative"
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <div
                className={cn(
                  "text-3xl transition-all duration-300 relative z-10 select-none",
                  hasSelection && !isSelected ? "opacity-35 grayscale scale-90" : "opacity-100 grayscale-0 scale-110"
                )}
                style={{
                  filter: isSelected ? `drop-shadow(0 4px 6px ${config.cssVar})` : undefined,
                }}
              >
                {config.emoji}
              </div>
              
              {/* Selected visual underglow indicator */}
              {isSelected && (
                <motion.div
                  layoutId="activeMoodDot"
                  className="w-1.5 h-1.5 rounded-full absolute -bottom-1"
                  style={{ backgroundColor: config.cssVar }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                />
              )}
              
              <span
                className={cn(
                  "text-[9px] font-medium font-sans uppercase tracking-wider transition-all duration-200 mt-1 select-none",
                  isSelected
                    ? "text-[#3E4F6E] dark:text-[#8FA1C4] font-semibold"
                    : "text-neutral-400 dark:text-neutral-500 opacity-60"
                )}
              >
                {config.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
