import { NextResponse } from "next/server";

/**
 * GET /api/history
 *
 * Returns the user's saved component history. Currently a stub — history is
 * stored client-side via Zustand. This route exists so clients don't need a
 * feature flag; it will be backed by a database when multi-device sync is added.
 */
export async function GET() {
  return NextResponse.json({ ok: true, components: [] });
}
