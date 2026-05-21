"use client";

import React, { useState, useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { useCreateEntry, useUpdateEntry } from "@/hooks/use-entries";
import { WritingPrompt } from "./writing-prompt";
import { MoodSelector } from "./mood-selector";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ArrowLeft, Maximize2, Minimize2, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { type Mood, type JournalEntry } from "@/types";
import { cn } from "@/lib/utils";

interface EntryEditorProps {
  entryDate: string; // YYYY-MM-DD
  moodBefore: Mood | null;
  selectedTags: string[];
  onSuccess: (entry: JournalEntry) => void;
  onBack: () => void;
  initialEntryId?: number | null;
  initialContent?: string;
}

export function EntryEditor({
  entryDate,
  moodBefore,
  selectedTags,
  onSuccess,
  onBack,
  initialEntryId = null,
  initialContent = "",
}: EntryEditorProps) {
  const [mounted, setMounted] = useState(false);
  const [entryId, setEntryId] = useState<number | null>(initialEntryId);
  
  // Auto-save States
  const [lastSavedContent, setLastSavedContent] = useState(initialContent);
  const [saveStatus, setSaveStatus] = useState<"draft" | "saving" | "saved" | "error">("draft");
  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null);

  // Focus Mode
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Idle Prompt State
  const [showPrompt, setShowPrompt] = useState(false);
  const idleTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Post-Writing Mood Check-in Modal
  const [showMoodCheckIn, setShowMoodCheckIn] = useState(false);
  const [moodAfter, setMoodAfter] = useState<Mood | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createMutation = useCreateEntry();
  const updateMutation = useUpdateEntry();

  // Prevent Tiptap Hydration mismatch
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "How are you feeling? Type your heart out...",
        emptyEditorClass: "is-editor-empty before:content-[attr(data-placeholder)] before:text-neutral-400 dark:before:text-neutral-600 before:absolute before:left-0 before:pointer-events-none font-serif italic text-sm",
      }),
    ],
    content: initialContent || "",
    editorProps: {
      attributes: {
        class: "focus:outline-none min-h-[300px] max-h-[500px] overflow-y-auto font-serif text-sm leading-relaxed text-neutral-800 dark:text-neutral-200 relative",
      },
    },
  });

  // Track user typing to reset 30s idle prompt timer
  useEffect(() => {
    if (!editor) return;

    const handleUpdate = () => {
      const currentContent = editor.getHTML();
      if (currentContent !== lastSavedContent) {
        setSaveStatus("draft");
      }

      // Reset idle timer
      if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
      setShowPrompt(false);

      idleTimeoutRef.current = setTimeout(() => {
        const text = editor.getText().trim();
        // Show prompt if user is focused and has typed some characters but then paused
        if (text.length > 0 && editor.isFocused) {
          setShowPrompt(true);
        }
      }, 30000); // 30 seconds
    };

    editor.on("update", handleUpdate);
    return () => {
      editor.off("update", handleUpdate);
      if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
    };
  }, [editor, lastSavedContent]);

  // 10-second Autosave Loop
  useEffect(() => {
    const interval = setInterval(async () => {
      if (!editor) return;
      const currentContent = editor.getHTML();
      const plainText = editor.getText().trim();

      // Don't autosave if empty or content hasn't changed or is currently saving
      if (!plainText || currentContent === lastSavedContent || saveStatus === "saving") {
        return;
      }

      setSaveStatus("saving");
      try {
        if (entryId) {
          await updateMutation.mutateAsync({
            id: entryId,
            input: {
              entryText: currentContent,
              tags: selectedTags,
              moodBefore: moodBefore || undefined,
            },
          });
          setSaveStatus("saved");
          setLastSavedContent(currentContent);
          setLastSavedTime(new Date());
        } else {
          const res = await createMutation.mutateAsync({
            entryDate,
            entryText: currentContent,
            moodBefore: moodBefore || undefined,
            tags: selectedTags,
            isVoiceTranscription: false,
          });
          setEntryId(res.data.id);
          setSaveStatus("saved");
          setLastSavedContent(currentContent);
          setLastSavedTime(new Date());
        }
      } catch (err) {
        console.error("Autosave failed:", err);
        setSaveStatus("error");
      }
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, [editor, entryId, lastSavedContent, saveStatus, entryDate, moodBefore, selectedTags, createMutation, updateMutation]);

  const handleSelectPrompt = (prompt: string) => {
    if (!editor) return;
    editor.commands.insertContent(`<p class="italic text-neutral-500 dark:text-neutral-400">Prompt: ${prompt}</p><p></p>`);
    editor.commands.focus();
    setShowPrompt(false);
  };

  const handleDoneClick = () => {
    if (!editor || editor.getText().trim().length === 0) return;
    // Open post-writing emotional check-in
    setShowMoodCheckIn(true);
  };

  const handleFinalSubmit = async () => {
    if (!editor || isSubmitting) return;
    setIsSubmitting(true);

    const currentContent = editor.getHTML();

    try {
      let finalEntry;
      if (entryId) {
        finalEntry = await updateMutation.mutateAsync({
          id: entryId,
          input: {
            entryText: currentContent,
            moodAfter: moodAfter || undefined,
            moodBefore: moodBefore || undefined,
            tags: selectedTags,
          },
        });
      } else {
        const res = await createMutation.mutateAsync({
          entryDate,
          entryText: currentContent,
          moodBefore: moodBefore || undefined,
          moodAfter: moodAfter || undefined,
          tags: selectedTags,
          isVoiceTranscription: false,
        });
        finalEntry = res.data;
      }
      onSuccess(finalEntry);
    } catch (err) {
      console.error("Final save failed:", err);
    } finally {
      setIsSubmitting(false);
      setShowMoodCheckIn(false);
    }
  };

  const getStatusText = () => {
    if (saveStatus === "saving") return "Saving...";
    if (saveStatus === "saved") {
      if (!lastSavedTime) return "Saved just now";
      return `Saved at ${format(lastSavedTime, "HH:mm")}`;
    }
    if (saveStatus === "error") return "Save failed";
    return "Draft";
  };

  if (!mounted) {
    return (
      <div className="h-64 bg-white/40 dark:bg-neutral-800/40 border border-[#E4DFD5]/40 dark:border-neutral-700/20 rounded-2xl animate-pulse flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-neutral-300 animate-spin" />
      </div>
    );
  }

  const isTextEmpty = !editor || editor.getText().trim().length === 0;

  return (
    <div
      className={cn(
        "flex flex-col flex-1 transition-all duration-500 relative",
        isFullScreen
          ? "fixed inset-0 z-50 bg-[#FBF9F4] dark:bg-[#181818] p-6 flex flex-col md:p-8"
          : "w-full"
      )}
    >
      {/* Editor Header Bar */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#EBE8E0]/60 dark:border-neutral-800/60 z-10">
        <div className="flex items-center gap-2">
          {!isFullScreen && (
            <button
              onClick={onBack}
              className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-all text-neutral-500 hover:text-neutral-700"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <span className="text-[10px] font-sans font-medium text-neutral-400 dark:text-neutral-500 bg-[#F2EFE9]/40 dark:bg-neutral-800/40 px-2 py-0.5 rounded-full select-none">
            {getStatusText()}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Focus Mode button */}
          <button
            onClick={() => setIsFullScreen(!isFullScreen)}
            className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-all text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
            title={isFullScreen ? "Exit focus mode" : "Immersive focus mode"}
          >
            {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <Button
            onClick={handleDoneClick}
            disabled={isTextEmpty}
            className="bg-[#3E4F6E] hover:bg-[#2C3B57] dark:bg-[#8FA1C4] dark:hover:bg-[#7287AD] text-white dark:text-neutral-900 rounded-full font-sans text-xs px-4 h-8 gap-1 shadow-sm transition-all duration-300"
          >
            <Check className="w-3.5 h-3.5" />
            Done
          </Button>
        </div>
      </div>

      {/* Editor Body */}
      <div className="flex-1 flex flex-col relative py-2">
        <EditorContent editor={editor} className="flex-1" />

        {/* 30s Idle Writing Prompt drawer */}
        <WritingPrompt
          isVisible={showPrompt}
          onClose={() => setShowPrompt(false)}
          onSelectPrompt={handleSelectPrompt}
        />
      </div>

      {/* Post-Writing Mood Modal Slide-up */}
      <AnimatePresence>
        {showMoodCheckIn && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end justify-center select-none">
            {/* Modal Card */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="w-full max-w-md bg-[#FBF9F4] dark:bg-[#1A1A1A] p-6 rounded-t-[32px] border-t border-[#EBE8E0] dark:border-neutral-800 shadow-[0_-15px_40px_rgba(0,0,0,0.15)] flex flex-col items-center gap-6"
            >
              {/* Subtle top indicator bar */}
              <div className="w-12 h-1 bg-neutral-200 dark:bg-neutral-800 rounded-full mb-1" />

              <div className="text-center flex flex-col gap-1.5">
                <h3 className="text-lg font-bold font-serif text-[#3E4F6E] dark:text-[#8FA1C4]">
                  Post-Writing Check-in
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-[280px] leading-relaxed font-sans">
                  You wrote a beautiful entry. Now that you&apos;ve put your thoughts down, how do you feel?
                </p>
              </div>

              {/* Mood picker */}
              <MoodSelector
                value={moodAfter}
                onChange={setMoodAfter}
                label="Selected Mood After Writing"
              />

              <div className="flex w-full gap-3 mt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowMoodCheckIn(false)}
                  disabled={isSubmitting}
                  className="flex-1 rounded-full font-sans text-xs h-10 border-[#EBE8E0] dark:border-neutral-800 text-neutral-600 dark:text-neutral-400"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleFinalSubmit}
                  disabled={isSubmitting || !moodAfter}
                  className="flex-1 bg-[#3E4F6E] hover:bg-[#2C3B57] dark:bg-[#8FA1C4] dark:hover:bg-[#7287AD] text-white dark:text-neutral-900 rounded-full font-sans text-xs h-10 gap-1.5 shadow-sm"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  Save & Complete
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
