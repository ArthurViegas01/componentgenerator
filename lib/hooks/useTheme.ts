"use client";

import { useEffect } from "react";
import { useThemeStore, type ColorMode } from "@/lib/store/themeStore";

/**
 * Subscribes to the theme store and syncs `document.documentElement` with the
 * active color mode + palette. Applies palette colors as CSS variables so
 * that both Tailwind and inline previews can read them.
 */
export function useTheme() {
  const mode = useThemeStore((s) => s.mode);
  const palette = useThemeStore((s) => s.resolvePalette());
  const setMode = useThemeStore((s) => s.setMode);
  const setPalette = useThemeStore((s) => s.setPalette);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const root = document.documentElement;
    const isDark = resolveDark(mode);
    root.classList.toggle("dark", isDark);

    // CSS custom properties the Tailwind config reads (see globals.css)
    root.style.setProperty("--color-primary", palette.primary);
    root.style.setProperty("--color-secondary", palette.secondary);
    root.style.setProperty("--color-accent", palette.accent);
    root.style.setProperty(
      "--background",
      isDark ? "222 47% 11%" : hexToHsl(palette.background)
    );
    root.style.setProperty(
      "--foreground",
      isDark ? "210 40% 98%" : hexToHsl(palette.foreground)
    );
  }, [mode, palette]);

  // Listen for OS theme changes when mode === "system"
  useEffect(() => {
    if (typeof window === "undefined" || mode !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = () => {
      document.documentElement.classList.toggle("dark", mq.matches);
    };
    mq.addEventListener("change", listener);
    return () => mq.removeEventListener("change", listener);
  }, [mode]);

  return { mode, palette, setMode, setPalette };
}

function resolveDark(mode: ColorMode): boolean {
  if (mode === "dark") return true;
  if (mode === "light") return false;
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

/** Rough hex → "H S% L%" conversion for CSS variable compatibility. */
function hexToHsl(hex: string): string {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16) / 255;
  const g = parseInt(clean.substring(2, 4), 16) / 255;
  const b = parseInt(clean.substring(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}
