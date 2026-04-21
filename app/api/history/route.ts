import { NextResponse } from "next/server";

/**
 * GET /api/history
 *
 * Stub — the canonical history lives in the browser's Zustand store today.
 * Returning an empty array keeps API consumers happy until server-side
 * persistence is added (Prisma + auth).
 */
export async function GET() {
  return NextResponse.json({
    ok: true,
    components: [],
    note:
      "History is currently stored client-side via Zustand. Wire up a database here when adding multi-device sync.",
  });
}
