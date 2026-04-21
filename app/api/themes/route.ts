import { NextResponse } from "next/server";
import { DEFAULT_PALETTES } from "@/lib/store/themeStore";

/**
 * GET /api/themes
 *
 * Returns the built-in palette catalog. We expose this over HTTP so future
 * clients (e.g. a Figma plugin) can consume the same set without bundling
 * the Zustand store.
 */
export async function GET() {
  return NextResponse.json({
    ok: true,
    palettes: DEFAULT_PALETTES,
  });
}
