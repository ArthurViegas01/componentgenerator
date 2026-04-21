"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/**
 * A generated component, persisted in localStorage so the user's library
 * survives page reloads. When we add a backend, this store becomes a thin
 * cache in front of the API and the persistence layer can be dropped.
 */
export interface SavedComponent {
  id: string;
  name: string;
  prompt: string;
  code: string;
  tags: string[];
  favorite: boolean;
  createdAt: number;
  updatedAt: number;
  /** Optional revision history for the version-control feature. */
  revisions?: Array<{ code: string; at: number }>;
}

interface ComponentState {
  components: SavedComponent[];
  // Mutations
  add: (c: Omit<SavedComponent, "id" | "createdAt" | "updatedAt">) => SavedComponent;
  update: (id: string, patch: Partial<SavedComponent>) => void;
  remove: (id: string) => void;
  toggleFavorite: (id: string) => void;
  // Queries
  byId: (id: string) => SavedComponent | undefined;
  search: (q: string, tag?: string) => SavedComponent[];
}

const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);

export const useComponentStore = create<ComponentState>()(
  persist(
    (set, get) => ({
      components: [],

      add: (c) => {
        const now = Date.now();
        const created: SavedComponent = {
          ...c,
          id: uid(),
          createdAt: now,
          updatedAt: now,
        };
        set((s) => ({ components: [created, ...s.components] }));
        return created;
      },

      update: (id, patch) =>
        set((s) => ({
          components: s.components.map((c) =>
            c.id === id
              ? {
                  ...c,
                  ...patch,
                  updatedAt: Date.now(),
                  revisions:
                    patch.code && patch.code !== c.code
                      ? [...(c.revisions ?? []), { code: c.code, at: c.updatedAt }]
                      : c.revisions,
                }
              : c
          ),
        })),

      remove: (id) =>
        set((s) => ({ components: s.components.filter((c) => c.id !== id) })),

      toggleFavorite: (id) =>
        set((s) => ({
          components: s.components.map((c) =>
            c.id === id ? { ...c, favorite: !c.favorite } : c
          ),
        })),

      byId: (id) => get().components.find((c) => c.id === id),

      search: (q, tag) => {
        const needle = q.trim().toLowerCase();
        return get().components.filter((c) => {
          const matchesText =
            !needle ||
            c.name.toLowerCase().includes(needle) ||
            c.prompt.toLowerCase().includes(needle);
          const matchesTag = !tag || c.tags.includes(tag);
          return matchesText && matchesTag;
        });
      },
    }),
    {
      name: "ucg.components.v1",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
