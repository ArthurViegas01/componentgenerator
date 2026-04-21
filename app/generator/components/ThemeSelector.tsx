"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Sun, Moon, Monitor } from "lucide-react";
import { DEFAULT_PALETTES, useThemeStore } from "@/lib/store/themeStore";
import { useTheme } from "@/lib/hooks/useTheme";

/**
 * Compact palette + mode picker meant for the generator toolbar. The larger
 * theme-editing UI (custom palette composer, save/delete) can live on a
 * dedicated settings page later.
 */
export function ThemeSelector() {
  // Wire the effect that syncs DOM classes / CSS vars.
  useTheme();

  const mode = useThemeStore((s) => s.mode);
  const setMode = useThemeStore((s) => s.setMode);
  const paletteId = useThemeStore((s) => s.paletteId);
  const setPalette = useThemeStore((s) => s.setPalette);
  // NOTE: do NOT select `s.allPalettes()` directly — it returns a new array
  // each call, which causes useSyncExternalStore to detect a changed
  // snapshot on every render and loop forever. Select the raw inputs and
  // combine them with useMemo so the reference is stable across renders.
  const customPalettes = useThemeStore((s) => s.customPalettes);
  const palettes = useMemo(
    () => [...DEFAULT_PALETTES, ...customPalettes],
    [customPalettes]
  );

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center rounded-md border border-border bg-card p-0.5">
        <ModeButton
          active={mode === "light"}
          onClick={() => setMode("light")}
          icon={<Sun className="h-3.5 w-3.5" />}
          label="Light"
        />
        <ModeButton
          active={mode === "system"}
          onClick={() => setMode("system")}
          icon={<Monitor className="h-3.5 w-3.5" />}
          label="System"
        />
        <ModeButton
          active={mode === "dark"}
          onClick={() => setMode("dark")}
          icon={<Moon className="h-3.5 w-3.5" />}
          label="Dark"
        />
      </div>

      <div className="flex items-center gap-1 overflow-x-auto">
        {palettes.map((p) => (
          <motion.button
            key={p.id}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setPalette(p.id)}
            aria-label={`Use ${p.name} palette`}
            aria-pressed={paletteId === p.id}
            title={p.name}
            className={`relative h-6 w-6 rounded-full ring-offset-2 ring-offset-background transition ${
              paletteId === p.id ? "ring-2 ring-primary" : ""
            }`}
            style={{
              background: `linear-gradient(135deg, ${p.primary} 0%, ${p.secondary} 60%, ${p.accent} 100%)`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function ModeButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      title={label}
      className={`inline-flex items-center gap-1 rounded px-2 py-1 text-xs transition ${
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {icon}
    </button>
  );
}
