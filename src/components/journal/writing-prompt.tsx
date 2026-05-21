"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, RefreshCw, X, ChevronRight } from "lucide-react";

interface WritingPromptProps {
  isVisible: boolean;
  onClose: () => void;
  onSelectPrompt: (prompt: string) => void;
}

const STATIC_PROMPTS = [
  "What is one small thing that went well today, no matter how minor?",
  "How does your body feel right now? Scan from head to toe.",
  "Describe a recent challenge and what it taught you about your strength.",
  "If your current mood was a weather forecast, what would it be?",
  "Write a letter of appreciation to someone who supported you recently.",
  "What is a boundary you set (or wish you had set) this week?",
  "What are you holding onto right now that you could gently let go of?",
  "Describe a place where you feel completely safe and at peace.",
];

export function WritingPrompt({
  isVisible,
  onClose,
  onSelectPrompt,
}: WritingPromptProps) {
  const [prompts] = useState<string[]>(() => {
    // Shuffle initial prompts
    return [...STATIC_PROMPTS].sort(() => Math.random() - 0.5);
  });
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentPrompt = prompts[currentIndex];

  const handleShuffle = () => {
    setCurrentIndex((prev) => (prev + 1) % prompts.length);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 350, damping: 26 }}
          className="absolute bottom-4 left-4 right-4 bg-white/95 dark:bg-[#202020]/95 backdrop-blur-md p-4 rounded-2xl border border-[#EBE8E0] dark:border-neutral-800 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.1)] z-40 select-none flex flex-col gap-3"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-1 border-b border-neutral-100 dark:border-neutral-800">
            <div className="flex items-center gap-1.5 text-amber-500">
              <Sparkles className="w-3.5 h-3.5 fill-current" />
              <span className="text-[10px] font-semibold uppercase tracking-wider font-sans">
                Writing Inspiration
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Prompt Content */}
          <div className="flex flex-col gap-3 py-1">
            <p className="text-xs font-serif italic text-neutral-700 dark:text-neutral-200 leading-relaxed min-h-[40px]">
              &ldquo;{currentPrompt}&rdquo;
            </p>

            <div className="flex items-center gap-2 mt-1">
              <button
                onClick={() => onSelectPrompt(currentPrompt)}
                className="flex-1 flex items-center justify-between text-left px-3 py-2 bg-[#3E4F6E]/5 hover:bg-[#3E4F6E]/10 dark:bg-[#8FA1C4]/10 dark:hover:bg-[#8FA1C4]/20 text-[#3E4F6E] dark:text-[#8FA1C4] rounded-xl text-xs font-medium transition-all group"
              >
                <span>Use this prompt</span>
                <ChevronRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
              </button>

              <button
                onClick={handleShuffle}
                className="p-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-all"
                title="Next prompt"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
