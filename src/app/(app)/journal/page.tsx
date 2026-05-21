"use client";

import React, { useState } from "react";
import { MoodSelector } from "@/components/journal/mood-selector";
import { TagPicker } from "@/components/journal/tag-picker";
import { EntryEditor } from "@/components/journal/entry-editor";
import { EntryList } from "@/components/journal/entry-list";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format } from "date-fns";
import { type Mood } from "@/types";
import { PenLine } from "lucide-react";

export default function JournalPage() {
  const [moodBefore, setMoodBefore] = useState<Mood | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isWriting, setIsWriting] = useState(false);

  // Get today's date in YYYY-MM-DD format
  const getTodayDateString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleStartWriting = () => {
    if (!moodBefore) {
      toast.error("Please select a mood before writing.");
      return;
    }
    setIsWriting(true);
  };

  const handleSuccess = () => {
    toast.success("Journal entry saved successfully.");
    setIsWriting(false);
    setMoodBefore(null);
    setSelectedTags([]);
  };

  const todayFormatted = format(new Date(), "MMMM d, yyyy");

  if (isWriting) {
    return (
      <div className="flex-1 flex flex-col p-6">
        <EntryEditor
          entryDate={getTodayDateString()}
          moodBefore={moodBefore}
          selectedTags={selectedTags}
          onSuccess={handleSuccess}
          onBack={() => setIsWriting(false)}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 p-6 pb-20 max-w-md w-full mx-auto select-none">
      {/* Date display & introduction */}
      <div className="flex flex-col gap-1.5 text-center mt-2">
        <span className="text-[10px] uppercase font-bold text-neutral-400 dark:text-neutral-500 font-sans tracking-widest">
          Daily Journal
        </span>
        <h2 className="text-2xl font-bold font-serif text-[#3E4F6E] dark:text-[#8FA1C4]">
          {todayFormatted}
        </h2>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 font-sans">
          Take a quiet moment for yourself. How is your heart doing?
        </p>
      </div>

      {/* Pre-writing configuration card */}
      <div className="bg-white dark:bg-[#1E1E1E] p-6 rounded-2xl border border-[#EBE8E0] dark:border-neutral-800 shadow-sm flex flex-col gap-6 items-center">
        {/* Mood select */}
        <MoodSelector
          value={moodBefore}
          onChange={setMoodBefore}
          label="Select your mood before writing"
        />

        {/* Tag select */}
        <TagPicker
          selectedTags={selectedTags}
          onChange={setSelectedTags}
          maxTags={5}
        />

        {/* Action Button */}
        <Button
          onClick={handleStartWriting}
          disabled={!moodBefore}
          className="w-full bg-[#3E4F6E] hover:bg-[#2C3B57] dark:bg-[#8FA1C4] dark:hover:bg-[#7287AD] text-white dark:text-neutral-900 rounded-full font-sans text-xs h-10 gap-1.5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
        >
          <PenLine className="w-3.5 h-3.5" />
          Start Journaling
        </Button>
      </div>

      {/* History section */}
      <div className="flex flex-col gap-4 mt-2">
        <EntryList />
      </div>
    </div>
  );
}
