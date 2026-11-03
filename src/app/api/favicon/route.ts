import { NextResponse } from "next/server";
import { iconSvg, paletteFor } from "@/lib/server/art";

export const dynamic = "force-dynamic";

/**
 * Real favicon resolver + proxy.
 *  /api/favicon?u=https://site.com&name=owner/repo
 * Fetches the site's own icon (apple-touch-icon, icon link, or /favicon.ico),
 * caches it, and falls back to a generated liquid-glass tile when the site has
 * no usable icon.
 */
const CACHE = new Map<string, { at: number; body: ArrayBuffer; type: string }>();
const TTL = 1000 * 60 * 60 * 12;

function absolute(base: string, href: string) {
  try {
    return new URL(href, base).toString();
  } catch {
    return null;
  }
}

async function grab(url: string): Promise<{ body: ArrayBuffer; type: string } | null> {
  try {
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (compatible; NSpaceFavicon/1.0)" }, cache: "no-store" });
    if (!res.ok) return null;
    const type = res.headers.get("content-type") ?? "";
    if (!/image\/|icon/.test(type)) return null;
    const body = await res.arrayBuffer();
    if (body.byteLength < 120) return null;
    return { body, type: type.split(";")[0] };
  } catch {
    return null;
  }
}

function fallbackSvg(name: string) {
  const [c1, c2] = paletteFor(name);
  return new Response(iconSvg(name.split("/").pop() || "N", c1, c2), {
    headers: { "Content-Type": "image/svg+xml", "Cache-Control": "public, max-age=86400" }
  });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const target = url.searchParams.get("u") ?? "";
  const name = url.searchParams.get("name") ?? target;

  if (!/^https?:\/\//.test(target)) return fallbackSvg(name);

  const cached = CACHE.get(target);
  if (cached && Date.now() - cached.at < TTL) {
    return new Response(cached.body, {
      headers: { "Content-Type": cached.type, "Cache-Control": "public, max-age=43200, stale-while-revalidate=86400" }
    });
  }

  let candidates: string[] = [];
  try {
    const page = await fetch(target, { headers: { "User-Agent": "Mozilla/5.0 (compatible; NSpaceFavicon/1.0)" }, cache: "no-store" });
    if (page.ok) {
      const html = (await page.text()).slice(0, 400_000);
      const links = [...html.matchAll(/<link[^>]+>/gi)].map((m) => m[0]);
      const scored: { href: string; score: number }[] = [];
      for (const tag of links) {
        if (!/rel=["'][^"']*icon/i.test(tag)) continue;
        const href = tag.match(/href=["']([^"']+)["']/i)?.[1];
        if (!href) continue;
        const abs = absolute(target, href);
        if (!abs) continue;
        let score = 1;
        if (/apple-touch-icon/i.test(tag)) score = 5;
        else if (/sizes=["'](180|192|512)/i.test(tag)) score = 4;
        else if (/svg/i.test(tag)) score = 3;
        const size = Number(tag.match(/sizes=["'](\d+)/i)?.[1] ?? 0);
        scored.push({ href: abs, score: score * 100 + size / 10 });
      }
      candidates = scored.sort((a, b) => b.score - a.score).map((s) => s.href);
      candidates.push(absolute(target, "/favicon.ico") ?? "");
    }
  } catch {
    /* fall through to defaults */
  }

  candidates.push(`https://icons.duckduckgo.com/ip3/${new URL(target).hostname}.ico`);
  candidates.push(`https://www.google.com/s2/favicons?sz=128&domain=${new URL(target).hostname}`);

  for (const c of candidates.filter(Boolean)) {
    const got = await grab(c);
    if (got) {
      CACHE.set(target, { at: Date.now(), ...got });
      return new Response(got.body, {
        headers: { "Content-Type": got.type, "Cache-Control": "public, max-age=43200, stale-while-revalidate=86400" }
      });
    }
  }

  return fallbackSvg(name);
}
