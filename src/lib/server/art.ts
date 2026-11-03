const PALETTES: [string, string][] = [
  ["#0A84FF", "#5E5CE6"],
  ["#FF9F0A", "#FF375F"],
  ["#30D158", "#00C7BE"],
  ["#BF5AF2", "#FF2D55"],
  ["#64D2FF", "#0A84FF"],
  ["#FFD60A", "#FF9F0A"],
  ["#5E5CE6", "#BF5AF2"],
  ["#FF6482", "#FF9F0A"],
  ["#34C759", "#0A84FF"],
];

export function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function paletteFor(name: string): [string, string] {
  return PALETTES[hash(name) % PALETTES.length];
}

export function esc(s: string): string {
  return s.replace(/[<>&"']/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&#39;" })[c] as string);
}

export function monogram(name: string): string {
  const parts = name.split(/[-_.\s]+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).replace(/^./, (c) => c.toUpperCase());
}

export function iconSvg(name: string, c1: string, c2: string): string {
  const letters = esc(monogram(name));
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
<defs>
<linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${esc(c1)}"/><stop offset="1" stop-color="${esc(c2)}"/></linearGradient>
<linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".45"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/></linearGradient>
</defs>
<rect width="512" height="512" rx="114" fill="url(#g)"/>
<rect width="512" height="512" rx="114" fill="url(#s)"/>
<circle cx="400" cy="120" r="150" fill="#fff" fill-opacity=".1"/>
<text x="256" y="324" text-anchor="middle" font-family="-apple-system,'SF Pro Display',Inter,Helvetica,Arial,sans-serif" font-size="210" font-weight="700" fill="#fff" letter-spacing="-6">${letters}</text>
</svg>`;
}

export function previewSvg(opts: { title: string; desc: string; url: string; c1: string; c2: string }): string {
  const { title, desc, url, c1, c2 } = opts;
  const words = desc.split(" ");
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    if ((cur + " " + w).trim().length > 46) {
      lines.push(cur.trim());
      cur = w;
    } else cur += " " + w;
  }
  if (cur.trim()) lines.push(cur.trim());
  const descSvg = lines
    .slice(0, 3)
    .map((l, i) => `<text x="96" y="${392 + i * 36}" font-size="26" fill="#3C3C43" fill-opacity=".75">${esc(l)}</text>`)
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="800" viewBox="0 0 1280 800" font-family="-apple-system,'SF Pro Display',Inter,Helvetica,Arial,sans-serif">
<defs>
<linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${esc(c1)}"/><stop offset="1" stop-color="${esc(c2)}"/></linearGradient>
</defs>
<rect width="1280" height="800" fill="#F2F2F7"/>
<rect x="0" y="0" width="1280" height="64" fill="#fff"/>
<circle cx="36" cy="32" r="8" fill="#FF5F57"/><circle cx="62" cy="32" r="8" fill="#FEBC2E"/><circle cx="88" cy="32" r="8" fill="#28C840"/>
<rect x="320" y="14" width="640" height="36" rx="18" fill="#F2F2F7"/>
<text x="640" y="38" text-anchor="middle" font-size="16" fill="#8E8E93">${esc(url.replace(/^https?:\/\//, "").slice(0, 60))}</text>
<rect x="0" y="64" width="1280" height="736" fill="#fff"/>
<rect x="64" y="128" width="1152" height="560" rx="40" fill="url(#g)" fill-opacity=".1"/>
<rect x="96" y="160" width="72" height="72" rx="18" fill="url(#g)"/>
<text x="96" y="318" font-size="64" font-weight="700" fill="#1C1C1E" letter-spacing="-2">${esc(title.slice(0, 28))}</text>
${descSvg}
<rect x="96" y="560" width="160" height="56" rx="28" fill="#007AFF"/>
<text x="176" y="596" text-anchor="middle" font-size="22" font-weight="600" fill="#fff">Open</text>
<rect x="272" y="560" width="160" height="56" rx="28" fill="#fff" stroke="#000" stroke-opacity=".08"/>
<text x="352" y="596" text-anchor="middle" font-size="22" font-weight="600" fill="#007AFF">Docs</text>
<rect x="760" y="176" width="400" height="460" rx="32" fill="#fff" stroke="#000" stroke-opacity=".06"/>
<rect x="792" y="208" width="200" height="20" rx="10" fill="#E5E5EA"/>
<rect x="792" y="248" width="336" height="120" rx="20" fill="url(#g)" fill-opacity=".85"/>
<rect x="792" y="392" width="336" height="16" rx="8" fill="#E5E5EA"/>
<rect x="792" y="424" width="260" height="16" rx="8" fill="#E5E5EA"/>
<rect x="792" y="472" width="160" height="136" rx="20" fill="#F2F2F7"/>
<rect x="968" y="472" width="160" height="136" rx="20" fill="#F2F2F7"/>
</svg>`;
}
