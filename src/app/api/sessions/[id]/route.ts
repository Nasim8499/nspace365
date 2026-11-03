import { NextResponse } from "next/server";
import { deleteSession, getSession, listMessages, touchSession } from "@/lib/server/live";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const session = getSession(id);
  if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });
  return NextResponse.json({ session, messages: listMessages(id) });
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = (await req.json().catch(() => ({}))) as { pinnedRepoId?: string | null; title?: string; branch?: string; pinned?: boolean };
  const session = touchSession(id, {
    ...(body.pinnedRepoId !== undefined ? { pinnedRepoId: body.pinnedRepoId } : {}),
    ...(body.title ? { title: body.title } : {}),
    ...(body.branch ? { branch: body.branch } : {}),
    ...(body.pinned !== undefined ? { pinned: body.pinned } : {})
  });
  if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });
  return NextResponse.json({ session });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  deleteSession(id);
  return NextResponse.json({ ok: true });
}
