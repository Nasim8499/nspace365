import { asc, count, eq } from "drizzle-orm";
import { db } from "@/db";
import { apps, settings } from "@/db/schema";
import { seedApps } from "@/lib/seed-data";
import type { GithubState, StoreApp } from "@/lib/types";

let seeding: Promise<void> | null = null;

export function ensureSeed(): Promise<void> {
  if (!seeding) {
    seeding = (async () => {
      const [{ value }] = await db.select({ value: count() }).from(apps);
      if (Number(value) === 0) {
        await db.insert(apps).values(seedApps).onConflictDoNothing();
      }
    })().catch((e) => {
      seeding = null;
      throw e;
    });
  }
  return seeding;
}

export function serializeApp(row: typeof apps.$inferSelect): StoreApp {
  return {
    ...row,
    category: row.category as StoreApp["category"],
    status: row.status as StoreApp["status"],
    source: row.source as StoreApp["source"],
    meta: row.meta as StoreApp["meta"],
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function listApps(): Promise<StoreApp[]> {
  await ensureSeed();
  const rows = await db.select().from(apps).orderBy(asc(apps.sortOrder), asc(apps.name));
  return rows.map(serializeApp);
}

export async function getGithubState(): Promise<GithubState> {
  const [row] = await db.select().from(settings).where(eq(settings.key, "github"));
  if (!row) return { connected: false };
  return row.value as unknown as GithubState;
}

export async function setGithubState(state: GithubState) {
  await db
    .insert(settings)
    .values({ key: "github", value: state as unknown as Record<string, unknown> })
    .onConflictDoUpdate({ target: settings.key, set: { value: state as unknown as Record<string, unknown> } });
}
