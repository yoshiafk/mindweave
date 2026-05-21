import React from "react";

interface MobileShellProps {
  children: React.ReactNode;
}

export function MobileShell({ children }: MobileShellProps) {
  return (
    <div className="min-h-dvh w-full flex items-center justify-center bg-[#F2EFE9] dark:bg-[#121212] md:py-8 md:px-4 font-sans">
      <div className="relative w-full max-w-md h-dvh md:h-[840px] md:rounded-[32px] md:shadow-2xl border border-[#EBE8E0]/60 dark:border-neutral-800 bg-[#FBF9F4] dark:bg-[#181818] overflow-hidden flex flex-col">
        {/* Subtle camera notch indicator on desktop only */}
        <div className="hidden md:flex absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#EBE8E0] dark:bg-neutral-800 rounded-b-xl z-50 items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-neutral-400 dark:bg-neutral-700 mr-2" />
          <div className="w-10 h-1.5 rounded-full bg-neutral-400 dark:bg-neutral-700" />
        </div>
        
        {/* Content Shell */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {children}
        </div>
      </div>
    </div>
  );
}
