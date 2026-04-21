"use client";

import { create } from "zustand";

/**
 * Ephemeral editor session — kept in memory only. We deliberately avoid
 * persisting this so that reloading the generator gives a clean slate.
 * Anything worth keeping should be promoted to `componentStore` via Save.
 */
export type Viewport = "mobile" | "tablet" | "desktop";
export type GenStatus = "idle" | "streaming" | "ready" | "error";

interface EditorState {
  prompt: string;
  code: string;
  status: GenStatus;
  errorMessage: string | null;
  viewport: Viewport;
  view: "preview" | "code" | "split";
  warnings: string[];

  // Mutations
  setPrompt: (s: string) => void;
  setCode: (s: string) => void;
  appendCode: (chunk: string) => void;
  reset: () => void;
  setStatus: (s: GenStatus, error?: string | null) => void;
  setViewport: (v: Viewport) => void;
  setView: (v: EditorState["view"]) => void;
  setWarnings: (w: string[]) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  prompt: "",
  code: "",
  status: "idle",
  errorMessage: null,
  viewport: "desktop",
  view: "split",
  warnings: [],

  setPrompt: (prompt) => set({ prompt }),
  setCode: (code) => set({ code }),
  appendCode: (chunk) =>
    set((s) => ({ code: s.code + chunk, status: "streaming" })),

  reset: () =>
    set({
      code: "",
      status: "idle",
      errorMessage: null,
      warnings: [],
    }),

  setStatus: (status, errorMessage = null) => set({ status, errorMessage }),
  setViewport: (viewport) => set({ viewport }),
  setView: (view) => set({ view }),
  setWarnings: (warnings) => set({ warnings }),
}));
