"use client";

import { iconFor } from "@/lib/icon-map";
import type { StoreApp } from "@/lib/types";

export default function AppIcon({ app, size = 60, className = "" }: { app: StoreApp; size?: number; className?: string }) {
  const radius = Math.round(size * 0.2237);
  const Icon = iconFor(app.icon);
  const iconUrl = app.meta?.iconUrl;
  return (
    <div
      className={`relative shrink-0 overflow-hidden shadow-sm ring-1 ring-black/5 ${className}`}
      style={{ width: size, height: size, borderRadius: size <= 64 ? 16 : radius }}
      aria-hidden
    >
      {iconUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={iconUrl} alt="" width={size} height={size} className="h-full w-full object-cover" draggable={false} />
      ) : (
        <div className="grid h-full w-full place-items-center" style={{ background: `linear-gradient(145deg, ${app.color1}, ${app.color2})` }}>
          <span className="absolute inset-0 bg-gradient-to-b from-white/35 to-transparent" />
          <Icon className="relative text-white drop-shadow-sm" size={Math.round(size * 0.5)} strokeWidth={2} />
        </div>
      )}
    </div>
  );
}
