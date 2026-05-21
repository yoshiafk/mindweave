import React from "react";
import { Feather } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon = <Feather className="w-8 h-8 text-[#3E4F6E] dark:text-[#8FA1C4] stroke-[1.5]" />,
  title = "A quiet space awaits",
  description = "Take a gentle breath and put your thoughts into words. Even a few lines can help organize the mind.",
  actionText,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 py-16 animate-fade-in select-none">
      {/* Decorative pulse ring around the icon */}
      <div className="relative mb-6 flex items-center justify-center w-16 h-16 rounded-full bg-[#F2EFE9] dark:bg-neutral-800 border border-[#E4DFD5]/60 dark:border-neutral-700/60">
        <div className="absolute inset-0 rounded-full bg-[#EAE7DF] dark:bg-neutral-800/40 animate-ping opacity-25" />
        {icon}
      </div>
      
      <h3 className="text-lg font-semibold font-serif text-[#3E4F6E] dark:text-[#8FA1C4] mb-2 leading-snug">
        {title}
      </h3>
      
      <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-[280px] leading-relaxed mb-6 font-sans">
        {description}
      </p>

      {actionText && onAction && (
        <Button
          onClick={onAction}
          className="bg-[#3E4F6E] hover:bg-[#2C3B57] dark:bg-[#8FA1C4] dark:hover:bg-[#7287AD] text-white dark:text-neutral-900 rounded-full font-sans text-xs px-6 py-2 h-auto shadow-sm transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
        >
          {actionText}
        </Button>
      )}
    </div>
  );
}
