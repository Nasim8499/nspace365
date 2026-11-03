import { paletteFor, previewSvg } from "@/lib/server/art";

/**
 * Preview screenshot endpoint.
 * Returns a rendered metadata card by default. The URL contract
 * (/api/preview/:repo?url=...) is deliberately compatible with a headless
 * Playwright screenshot worker: point this route at one and the SVG fallback
 * is replaced by a real capture of the live site.
 */
export async function GET(req: Request, ctx: { params: Promise<{ name: string }> }) {
  const { name } = await ctx.params;
  const decoded = decodeURIComponent(name);
  const url = new URL(req.url);
  const [c1, c2] = paletteFor(decoded);
  const svg = previewSvg({
    title: decoded,
    desc: (url.searchParams.get("desc") || "Synced from GitHub and published to N Space.").slice(0, 160),
    url: url.searchParams.get("url") || `https://github.com/${decoded}`,
    c1,
    c2,
  });
  return new Response(svg, {
    headers: { "Content-Type": "image/svg+xml", "Cache-Control": "public, max-age=3600" },
  });
}
