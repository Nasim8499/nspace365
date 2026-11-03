import { NextResponse } from "next/server";
import { liveApps } from "@/lib/server/live";

export const dynamic = "force-dynamic";

export async function GET() {
  const { apps, github } = await liveApps();
  return NextResponse.json({ apps, github });
}

export async function POST() {
  const { apps, github } = await liveApps();
  return NextResponse.json({ apps, github });
}
