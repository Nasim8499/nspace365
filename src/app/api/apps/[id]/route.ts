import { NextResponse } from "next/server";
import { liveApps } from "@/lib/server/live";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const { apps } = await liveApps();
  const app = apps.find((a) => a.id === decodeURIComponent(id));
  if (!app) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ app });
}

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const { apps } = await liveApps();
  const app = apps.find((a) => a.id === decodeURIComponent(id));
  if (!app) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const body = (await req.json().catch(() => ({}))) as { action?: string };
  const next = { ...app };
  if (body.action === "install" || body.action === "update") next.status = "installed";
  if (body.action === "remove") next.status = "available";
  return NextResponse.json({ app: next });
}
