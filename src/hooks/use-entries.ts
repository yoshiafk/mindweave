import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateEntryInput, UpdateEntryInput } from "@/lib/validators/entry";

/**
 * Hook to retrieve all entries for the user, with optional query filters.
 */
export function useEntries(params: {
  page?: number;
  limit?: number;
  sort?: "asc" | "desc";
  startDate?: string;
  endDate?: string;
  mood?: string;
  tag?: string;
} = {}) {
  return useQuery({
    queryKey: ["entries", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null) {
          searchParams.append(key, String(val));
        }
      });

      const res = await fetch(`/api/entries?${searchParams.toString()}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch entries");
      }

      return data; // returns { success: true, data: [...], meta: {...} }
    },
  });
}

/**
 * Hook to fetch a single journal entry by ID.
 */
export function useEntry(id?: number) {
  return useQuery({
    queryKey: ["entry", id],
    queryFn: async () => {
      if (!id) return null;
      const res = await fetch(`/api/entries/${id}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch entry");
      }

      return data.data;
    },
    enabled: !!id,
  });
}

/**
 * Hook to fetch entry statistics (streaks, word counts, mood frequency, common tags).
 */
export function useEntryStats() {
  return useQuery({
    queryKey: ["entry-stats"],
    queryFn: async () => {
      const res = await fetch("/api/entries/stats");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch journal statistics");
      }

      return data.data;
    },
  });
}

/**
 * Hook to create a new journal entry.
 */
export function useCreateEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateEntryInput) => {
      const res = await fetch("/api/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to create entry");
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entries"] });
      queryClient.invalidateQueries({ queryKey: ["entry-stats"] });
    },
  });
}

/**
 * Hook to update an existing entry (used for auto-saves and manual modifications).
 */
export function useUpdateEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, input }: { id: number; input: UpdateEntryInput }) => {
      const res = await fetch(`/api/entries/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to update entry");
      }

      return data.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["entries"] });
      queryClient.invalidateQueries({ queryKey: ["entry", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["entry-stats"] });
    },
  });
}

/**
 * Hook to delete an existing entry.
 */
export function useDeleteEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/entries/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to delete entry");
      }

      return data;
    },
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: ["entries"] });
      queryClient.invalidateQueries({ queryKey: ["entry", id] });
      queryClient.invalidateQueries({ queryKey: ["entry-stats"] });
    },
  });
}
