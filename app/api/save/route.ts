import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/save
 *
 * Persists a component to the user's library. Currently a stub — the client
 * handles persistence via Zustand + localStorage. This route exists so the
 * client doesn't need a feature flag; it will forward to a database layer
 * (Prisma + auth) when server-side persistence is added.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body.code !== "string") {
    return NextResponse.json(
      { error: "Body must include `code` (string)." },
      { status: 400 }
    );
  }

  return NextResponse.json({ ok: true, persisted: false });
}
