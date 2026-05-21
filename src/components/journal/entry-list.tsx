"use client";

import React, { useState } from "react";
import { useEntries } from "@/hooks/use-entries";
import { EntryCard } from "./entry-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Filter, ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import { MOODS, MOOD_CONFIG, JOURNAL_TAGS, type Mood, type JournalEntry } from "@/types";
import { cn } from "@/lib/utils";

export function EntryList() {
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [sort, setSort] = useState<"asc" | "desc">("desc");
  const [selectedMood, setSelectedMood] = useState<Mood | "">("");
  const [selectedTag, setSelectedTag] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);

  // Fetch entries with React Query
  const { data, isLoading, isError, refetch } = useEntries({
    page,
    limit,
    sort,
    mood: selectedMood || undefined,
    tag: selectedTag || undefined,
  });

  const entries = data?.data || [];
  const totalPages = data?.meta?.totalPages || 1;

  const handleMoodFilter = (mood: Mood) => {
    setSelectedMood(selectedMood === mood ? "" : mood);
    setPage(1);
  };

  const handleTagFilter = (tag: string) => {
    setSelectedTag(selectedTag === tag ? "" : tag);
    setPage(1);
  };

  const clearFilters = () => {
    setSelectedMood("");
    setSelectedTag("");
    setPage(1);
  };

  const isFiltered = selectedMood !== "" || selectedTag !== "";

  return (
    <div className="flex flex-col gap-4 w-full select-none">
      {/* Header controls */}
      <div className="flex items-center justify-between pb-2 border-b border-[#EBE8E0]/40 dark:border-neutral-800/40">
        <h2 className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 font-sans tracking-wide">
          Recent entries
        </h2>
        
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSort(sort === "desc" ? "asc" : "desc")}
            className="w-8 h-8 rounded-full text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
            title="Sort direction"
          >
            <ArrowUpDown className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "w-8 h-8 rounded-full transition-colors",
              showFilters || isFiltered
                ? "bg-[#3E4F6E]/5 text-[#3E4F6E] dark:bg-[#8FA1C4]/10 dark:text-[#8FA1C4]"
                : "text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
            )}
            title="Filters"
          >
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Expandable filters drawer */}
      {showFilters && (
        <div className="bg-[#F2EFE9]/40 dark:bg-neutral-800/40 p-4 rounded-2xl border border-[#E4DFD5]/40 dark:border-neutral-700/20 backdrop-blur-sm flex flex-col gap-3 animate-fade-in">
          {/* Mood filter row */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider font-sans">
              Filter by Mood
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {MOODS.map((mood) => {
                const config = MOOD_CONFIG[mood];
                const active = selectedMood === mood;
                return (
                  <button
                    key={mood}
                    onClick={() => handleMoodFilter(mood)}
                    className={cn(
                      "flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border transition-all shrink-0",
                      active
                        ? "bg-[#3E4F6E] border-[#3E4F6E] text-white dark:bg-[#8FA1C4] dark:border-[#8FA1C4] dark:text-neutral-900"
                        : "bg-white/80 dark:bg-neutral-900/80 border-[#E4DFD5]/60 dark:border-neutral-700/40 text-neutral-600 dark:text-neutral-300"
                    )}
                  >
                    <span>{config.emoji}</span>
                    <span className="text-[10px]">{config.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tag filter row */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider font-sans">
              Filter by Tag
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {JOURNAL_TAGS.map((tag) => {
                const active = selectedTag === tag;
                return (
                  <button
                    key={tag}
                    onClick={() => handleTagFilter(tag)}
                    className={cn(
                      "px-2.5 py-0.5 rounded-full text-[10px] font-normal border transition-all shrink-0 font-sans",
                      active
                        ? "bg-[#3E4F6E] border-[#3E4F6E] text-white dark:bg-[#8FA1C4] dark:border-[#8FA1C4] dark:text-neutral-900"
                        : "bg-white/80 dark:bg-neutral-900/80 border-[#E4DFD5]/60 dark:border-neutral-700/40 text-neutral-500 dark:text-neutral-400"
                    )}
                  >
                    #{tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Clear button */}
          {isFiltered && (
            <button
              onClick={clearFilters}
              className="text-[10px] font-medium text-[#3E4F6E] dark:text-[#8FA1C4] hover:underline self-end font-sans"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Loading Skeletons */}
      {isLoading && (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-28 bg-neutral-100 dark:bg-neutral-800/50 rounded-2xl animate-pulse border border-[#EBE8E0]/40 dark:border-neutral-800/40"
            />
          ))}
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div className="text-center py-8">
          <p className="text-xs text-red-500 font-sans">
            Unable to load journal history. Please try again.
          </p>
          <Button
            onClick={() => refetch()}
            variant="link"
            className="text-xs text-[#3E4F6E] dark:text-[#8FA1C4] mt-2 font-sans"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && entries.length === 0 && (
        <EmptyState
          icon={<BookOpen className="w-8 h-8 text-[#3E4F6E] dark:text-[#8FA1C4] stroke-[1.5]" />}
          title={isFiltered ? "No matching entries" : "No entries yet"}
          description={
            isFiltered
              ? "We couldn't find any entries matching those filters. Try adjusting them."
              : "Your journaling space is clear. Write down your thoughts, observations, or reflections today."
          }
          actionText={isFiltered ? "Reset Filters" : undefined}
          onAction={isFiltered ? clearFilters : undefined}
        />
      )}

      {/* Cards List */}
      {!isLoading && !isError && entries.length > 0 && (
        <div className="flex flex-col gap-3">
          {entries.map((entry: JournalEntry) => (
            <EntryCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}

      {/* Pagination controls */}
      {!isLoading && !isError && totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 mt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="h-8 rounded-xl font-sans text-xs px-3 border-[#EBE8E0] dark:border-neutral-800 text-neutral-600 dark:text-neutral-400"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </Button>

          <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-sans font-medium">
            Page {page} of {totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="h-8 rounded-xl font-sans text-xs px-3 border-[#EBE8E0] dark:border-neutral-800 text-neutral-600 dark:text-neutral-400"
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
