"use client";

import React, { useState, use } from "react";
import { useRouter } from "next/navigation";
import { useEntry, useDeleteEntry } from "@/hooks/use-entries";
import { EntryEditor } from "@/components/journal/entry-editor";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format } from "date-fns";
import { type Mood, MOOD_CONFIG } from "@/types";
import {
  ArrowLeft,
  Edit2,
  Trash2,
  Sparkles,
  ArrowRight,
  FileText,
  Clock,
  Lock,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SingleEntryPageProps {
  params: Promise<{ id: string }>;
}

export default function SingleEntryPage({ params }: SingleEntryPageProps) {
  const router = useRouter();
  const { id } = use(params);
  const entryId = parseInt(id, 10);

  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Fetch entry using React Query hook
  const { data: entry, isLoading, isError, error, refetch } = useEntry(entryId);
  const deleteMutation = useDeleteEntry();

  const handleBack = () => {
    router.push("/journal");
  };

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(entryId);
      toast.success("Entry deleted successfully.");
      router.push("/journal");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete entry.";
      toast.error(message);
    }
  };

  // 1. Loading State
  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 select-none">
        <Loader2 className="w-8 h-8 text-[#3E4F6E] dark:text-[#8FA1C4] animate-spin mb-4" />
        <p className="text-xs text-neutral-400 font-sans">Opening your journal...</p>
      </div>
    );
  }

  // 2. Premium Limit Wall / Forbidden State
  const isHistoryLocked =
    isError &&
    error instanceof Error &&
    (error.message.includes("older than 7 days") || error.message.includes("Upgrade"));

  if (isHistoryLocked) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto select-none">
        <div className="w-16 h-16 rounded-full bg-amber-500/10 dark:bg-amber-400/10 flex items-center justify-center border border-amber-500/20 mb-6">
          <Lock className="w-7 h-7 text-amber-600 dark:text-amber-400" />
        </div>
        <h3 className="text-lg font-bold font-serif text-[#3E4F6E] dark:text-[#8FA1C4] mb-3">
          Journal Entry Locked
        </h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed mb-8 max-w-[280px]">
          This entry is older than 7 days. Upgrade to Premium to unlock unlimited access to your full journaling history.
        </p>
        <div className="flex flex-col gap-3 w-full px-4">
          <Button
            onClick={() => router.push("/settings")}
            className="w-full bg-[#3E4F6E] hover:bg-[#2C3B57] dark:bg-[#8FA1C4] dark:hover:bg-[#7287AD] text-white dark:text-neutral-900 rounded-full font-sans text-xs h-10 shadow-sm"
          >
            Upgrade Subscription
          </Button>
          <Button
            variant="ghost"
            onClick={handleBack}
            className="w-full text-xs font-sans text-neutral-500 dark:text-neutral-400"
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  // 3. General Error State
  if (isError || !entry) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center select-none">
        <p className="text-xs text-red-500 font-sans mb-4">
          {error instanceof Error ? error.message : "Failed to load entry details."}
        </p>
        <Button
          onClick={handleBack}
          className="bg-[#3E4F6E] text-white rounded-full font-sans text-xs px-6 py-2 h-auto"
        >
          Return to Journal
        </Button>
      </div>
    );
  }

  // 4. Edit Mode View
  if (isEditing) {
    // Format entry date to YYYY-MM-DD
    const entryDateStr = format(new Date(entry.entryDate), "yyyy-MM-dd");
    
    return (
      <div className="flex-1 flex flex-col p-6">
        <EntryEditor
          entryDate={entryDateStr}
          moodBefore={entry.moodBefore as Mood}
          selectedTags={entry.tags}
          initialEntryId={entry.id}
          initialContent={entry.entryText}
          onSuccess={() => {
            setIsEditing(false);
            refetch();
          }}
          onBack={() => setIsEditing(false)}
        />
      </div>
    );
  }

  // Formatting date for displaying
  const dateObj = new Date(entry.entryDate);
  const dateFormatted = format(dateObj, "EEEE, MMMM d, yyyy");
  const timeFormatted = format(new Date(entry.createdAt), "h:mm a");

  const moodBeforeConfig = entry.moodBefore ? MOOD_CONFIG[entry.moodBefore as Mood] : null;
  const moodAfterConfig = entry.moodAfter ? MOOD_CONFIG[entry.moodAfter as Mood] : null;

  // Retrieve the latest AI reflection
  const latestReflection = entry.reflections?.[0];

  return (
    <div className="flex-1 flex flex-col p-6 pb-24 max-w-md w-full mx-auto select-none relative">
      {/* Top Header Navigation Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-[#EBE8E0]/60 dark:border-neutral-800/60 mb-6">
        <button
          onClick={handleBack}
          className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-all text-neutral-500 hover:text-neutral-700"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsEditing(true)}
            className="w-8 h-8 rounded-full text-neutral-500 hover:text-[#3E4F6E] dark:hover:text-[#8FA1C4]"
            title="Edit entry"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowDeleteConfirm(true)}
            className="w-8 h-8 rounded-full text-neutral-500 hover:text-red-500"
            title="Delete entry"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Main Entry Info */}
      <div className="flex flex-col gap-6">
        {/* Header Metadata */}
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-bold font-serif text-[#3E4F6E] dark:text-[#8FA1C4] leading-tight">
            {dateFormatted}
          </h2>
          
          <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-[11px] text-neutral-400 dark:text-neutral-500 font-sans">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {timeFormatted}
            </span>
            {entry.wordCount !== undefined && entry.wordCount !== null && (
              <span className="flex items-center gap-1">
                <FileText className="w-3 h-3" />
                {entry.wordCount} words
              </span>
            )}
          </div>
        </div>

        {/* Mood Progression & Tags */}
        <div className="flex flex-col gap-3 py-3 border-y border-[#EBE8E0]/40 dark:border-neutral-800/40">
          {/* Mood block */}
          {(moodBeforeConfig || moodAfterConfig) && (
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-neutral-400 dark:text-neutral-500 font-sans">
                Emotional Shift
              </span>
              
              <div className="flex items-center gap-1.5 bg-[#F2EFE9]/40 dark:bg-neutral-800/40 px-3 py-1 rounded-full border border-[#E4DFD5]/20">
                {moodBeforeConfig && (
                  <span className="flex items-center gap-1 font-sans">
                    <span className="text-sm">{moodBeforeConfig.emoji}</span>
                    <span className="text-[10px] text-neutral-500">{moodBeforeConfig.label}</span>
                  </span>
                )}
                
                {moodBeforeConfig && moodAfterConfig && moodBeforeConfig.emoji !== moodAfterConfig.emoji && (
                  <ArrowRight className="w-3 h-3 text-neutral-400 dark:text-neutral-600 stroke-[2.5]" />
                )}
                
                {moodAfterConfig && moodBeforeConfig?.emoji !== moodAfterConfig.emoji && (
                  <span className="flex items-center gap-1 font-sans">
                    <span className="text-sm">{moodAfterConfig.emoji}</span>
                    <span className="text-[10px] text-neutral-500">{moodAfterConfig.label}</span>
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Tags list */}
          {entry.tags.length > 0 && (
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-neutral-400 dark:text-neutral-500 font-sans">
                Selected Tags
              </span>
              <div className="flex items-center gap-1.5 flex-wrap justify-end">
                {entry.tags.map((tag: string) => (
                  <Badge
                    key={tag}
                    className="bg-[#F2EFE9]/40 border-[#E4DFD5]/40 text-neutral-500 text-[10px] font-sans font-normal px-2.5 py-0.5 rounded-full dark:bg-neutral-800/50 dark:border-neutral-700/30 dark:text-neutral-400"
                  >
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Entry Text Render */}
        <div
          className="prose dark:prose-invert font-serif text-sm leading-relaxed text-neutral-700 dark:text-neutral-300 min-h-[150px]"
          dangerouslySetInnerHTML={{ __html: entry.entryText }}
        />

        {/* AI Reflection Box */}
        <div className="mt-4 flex flex-col gap-2">
          {latestReflection ? (
            <div className="bg-[#3E4F6E]/5 dark:bg-[#8FA1C4]/5 border border-[#3E4F6E]/10 dark:border-[#8FA1C4]/10 p-5 rounded-2xl flex flex-col gap-2.5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/5 rounded-full filter blur-xl" />
              
              <div className="flex items-center gap-1.5 text-[#3E4F6E] dark:text-[#8FA1C4]">
                <Sparkles className="w-4 h-4 fill-current animate-pulse" />
                <span className="text-[10px] font-semibold uppercase tracking-wider font-sans">
                  MindWeave Reflection
                </span>
              </div>
              
              <p className="text-xs font-serif leading-relaxed italic text-neutral-600 dark:text-neutral-300">
                {latestReflection.reflectionText}
              </p>
            </div>
          ) : (
            // Contemplative state if reflection is still generating or doesn't exist
            <div className="bg-[#F2EFE9]/30 dark:bg-neutral-800/30 border border-dashed border-[#E4DFD5]/60 dark:border-neutral-700/40 p-5 rounded-2xl flex flex-col gap-2 items-center text-center py-6">
              <Sparkles className="w-5 h-5 text-neutral-400 dark:text-neutral-600 animate-spin" style={{ animationDuration: "6s" }} />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 font-sans mt-1">
                Reflection in progress
              </span>
              <p className="text-[10px] text-neutral-400 dark:text-neutral-500 max-w-[200px] leading-relaxed">
                MindWeave is contemplating your words. Check back in a few minutes.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal Overlay */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6 select-none">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm bg-[#FBF9F4] dark:bg-[#1A1A1A] p-6 rounded-2xl border border-[#EBE8E0] dark:border-neutral-800 shadow-xl flex flex-col items-center text-center gap-5"
            >
              <div className="w-12 h-12 rounded-full bg-red-500/10 dark:bg-red-400/10 flex items-center justify-center border border-red-500/20">
                <Trash2 className="w-5 h-5 text-red-500" />
              </div>

              <div className="flex flex-col gap-1">
                <h3 className="text-sm font-semibold font-serif text-[#3E4F6E] dark:text-[#8FA1C4]">
                  Delete this entry?
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-[240px] leading-relaxed">
                  This action is permanent and cannot be undone. All reflections associated with this entry will also be deleted.
                </p>
              </div>

              <div className="flex w-full gap-3 mt-1">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 rounded-full font-sans text-xs h-9 border-[#EBE8E0] dark:border-neutral-800 text-neutral-600 dark:text-neutral-400"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDelete}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-full font-sans text-xs h-9 shadow-sm"
                >
                  Delete
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
