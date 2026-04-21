import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/save
 *
 * Stub endpoint — when a real backend is wired up (Prisma + Postgres or
 * similar), this route should:
 *   1. Validate the authenticated user (NextAuth session)
 *   2. Persist the component to the user's library
 *   3. Return the canonical record with a server-generated ID
 *
 * Today the client persists via Zustand + localStorage, so this route just
 * acknowledges the payload. Keeping the route present so the client code
 * doesn't need a feature flag.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body.code !== "string") {
    return NextResponse.json(
      { error: "Body must include `code` (string)." },
      { status: 400 }
    );
  }

  // TODO(server-persistence): forward to your DB layer.
  return NextResponse.json({
    ok: true,
    persisted: false,
    note: "Saved client-side only. Server persistence is not yet wired up.",
  });
}
