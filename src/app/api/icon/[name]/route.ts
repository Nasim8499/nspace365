import { iconSvg, paletteFor } from "@/lib/server/art";

// Auto-generated app icon / favicon for any repository name.
export async function GET(req: Request, ctx: { params: Promise<{ name: string }> }) {
  const { name } = await ctx.params;
  const decoded = decodeURIComponent(name);
  const url = new URL(req.url);
  const [d1, d2] = paletteFor(decoded);
  const clean = (v: string | null, d: string) => (v && /^#?[0-9a-fA-F]{6}$/.test(v) ? (v.startsWith("#") ? v : `#${v}`) : d);
  const svg = iconSvg(decoded, clean(url.searchParams.get("c1"), d1), clean(url.searchParams.get("c2"), d2));
  return new Response(svg, {
    headers: { "Content-Type": "image/svg+xml", "Cache-Control": "public, max-age=86400" },
  });
}
