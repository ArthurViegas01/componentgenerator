"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type ColorMode = "light" | "dark" | "system";

export interface Palette {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
}

/** 10 curated palettes shipped by default. Users can also save custom ones. */
export const DEFAULT_PALETTES: Palette[] = [
  { id: "indigo",   name: "Indigo",        primary: "#6366f1", secondary: "#8b5cf6", accent: "#06b6d4", background: "#ffffff", foreground: "#0f172a" },
  { id: "rose",     name: "Rose",          primary: "#f43f5e", secondary: "#ec4899", accent: "#f59e0b", background: "#ffffff", foreground: "#0f172a" },
  { id: "emerald",  name: "Emerald",       primary: "#10b981", secondary: "#14b8a6", accent: "#84cc16", background: "#ffffff", foreground: "#0f172a" },
  { id: "amber",    name: "Amber",         primary: "#f59e0b", secondary: "#f97316", accent: "#eab308", background: "#fffbeb", foreground: "#1c1917" },
  { id: "slate",    name: "Slate",         primary: "#475569", secondary: "#334155", accent: "#06b6d4", background: "#f8fafc", foreground: "#0f172a" },
  { id: "midnight", name: "Midnight",      primary: "#818cf8", secondary: "#a78bfa", accent: "#22d3ee", background: "#0f172a", foreground: "#f1f5f9" },
  { id: "candy",    name: "Candy",         primary: "#ec4899", secondary: "#a855f7", accent: "#22d3ee", background: "#fdf2f8", foreground: "#1f2937" },
  { id: "forest",   name: "Forest",        primary: "#16a34a", secondary: "#15803d", accent: "#ca8a04", background: "#f7fee7", foreground: "#14532d" },
  { id: "ocean",    name: "Ocean",         primary: "#0284c7", secondary: "#0891b2", accent: "#6366f1", background: "#ecfeff", foreground: "#0c4a6e" },
  { id: "mono",     name: "Monochrome",    primary: "#111827", secondary: "#374151", accent: "#6b7280", background: "#ffffff", foreground: "#111827" },
];

interface ThemeState {
  mode: ColorMode;
  paletteId: string;
  customPalettes: Palette[];
  setMode: (m: ColorMode) => void;
  setPalette: (id: string) => void;
  saveCustomPalette: (p: Omit<Palette, "id">) => Palette;
  removeCustomPalette: (id: string) => void;
  /** Resolve the current palette regardless of where it's stored. */
  resolvePalette: () => Palette;
  /** All palettes — defaults + user-defined. */
  allPalettes: () => Palette[];
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: "system",
      paletteId: "indigo",
      customPalettes: [],

      setMode: (mode) => set({ mode }),
      setPalette: (paletteId) => set({ paletteId }),

      saveCustomPalette: (p) => {
        const palette: Palette = {
          ...p,
          id: `custom-${Date.now().toString(36)}`,
        };
        set((s) => ({ customPalettes: [...s.customPalettes, palette] }));
        return palette;
      },

      removeCustomPalette: (id) =>
        set((s) => ({
          customPalettes: s.customPalettes.filter((p) => p.id !== id),
        })),

      allPalettes: () => [...DEFAULT_PALETTES, ...get().customPalettes],

      resolvePalette: () => {
        const all = get().allPalettes();
        return all.find((p) => p.id === get().paletteId) ?? DEFAULT_PALETTES[0];
      },
    }),
    {
      name: "ucg.theme.v1",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
