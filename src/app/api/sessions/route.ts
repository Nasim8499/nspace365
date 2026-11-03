import { NextResponse } from "next/server";
import { createSession, listSessions } from "@/lib/server/live";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ sessions: listSessions() });
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { pinnedRepoId?: string | null; title?: string };
  const session = createSession(body.pinnedRepoId ?? null, body.title ?? "New chat");
  return NextResponse.json({ session });
}
