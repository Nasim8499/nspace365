"use client";

/**
 * Deterministic generative artwork for a project card.
 * Same id always renders the same eye-catching graphic, no network needed.
 */

const PALETTES: [string, string, string][] = [
  ["#5B8CFF", "#8B5CF6", "#F472B6"],
  ["#0EA5E9", "#22D3EE", "#A7F3D0"],
  ["#F59E0B", "#FB7185", "#7C3AED"],
  ["#10B981", "#14B8A6", "#0EA5E9"],
  ["#6366F1", "#4338CA", "#22D3EE"],
  ["#F43F5E", "#F97316", "#FDE68A"],
  ["#8B5CF6", "#EC4899", "#60A5FA"],
  ["#0F766E", "#34D399", "#BBF7D0"],
];

function hash(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

export default function ArtTile({
  seed,
  label,
  className = "",
  rounded = 24,
}: {
  seed: string;
  label?: string;
  className?: string;
  rounded?: number;
}) {
  const h = hash(seed || "nspace");
  const palette = PALETTES[h % PALETTES.length];
  const angle = 25 + (h % 90);
  const blobA = { x: 12 + (h % 40), y: 8 + ((h >> 3) % 40), r: 34 + (h % 22) };
  const blobB = { x: 55 + ((h >> 5) % 38), y: 48 + ((h >> 7) % 40), r: 28 + ((h >> 2) % 26) };
  const initials = (label ?? seed)
    .replace(/[^a-zA-Z0-9 ]/g, " ")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("") || "N";

  return (
    <div className={`relative overflow-hidden ${className}`} style={{ borderRadius: rounded }}>
      <div className="absolute inset-0" style={{ background: `linear-gradient(${angle}deg, ${palette[0]}, ${palette[1]})` }} />
      <div
        className="absolute rounded-full blur-2xl"
        style={{
          left: `${blobA.x}%`,
          top: `${blobA.y}%`,
          width: `${blobA.r}%`,
          height: `${blobA.r}%`,
          background: palette[2],
          opacity: 0.75,
          transform: "translate(-30%, -30%)",
        }}
      />
      <div
        className="absolute rounded-full blur-2xl"
        style={{
          left: `${blobB.x}%`,
          top: `${blobB.y}%`,
          width: `${blobB.r}%`,
          height: `${blobB.r}%`,
          background: "rgba(255,255,255,0.55)",
          opacity: 0.55,
          transform: "translate(-50%, -50%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.16]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.9) 1px, transparent 0)",
          backgroundSize: "14px 14px",
        }}
      />
      <div className="absolute inset-0 grid place-items-center">
        <span className="text-[clamp(28px,16vw,72px)] font-black tracking-tight text-white/85 drop-shadow-[0_6px_18px_rgba(0,0,0,0.25)]">
          {initials}
        </span>
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-white/10" />
    </div>
  );
}
