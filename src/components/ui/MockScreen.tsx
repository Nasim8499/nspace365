"use client";

import { iconFor } from "@/lib/icon-map";
import type { StoreApp } from "@/lib/types";

/** Procedurally rendered "screenshot" in the app's brand colours. */
export default function MockScreen({ app, variant }: { app: StoreApp; variant: number }) {
  const Icon = iconFor(app.icon);
  const g = `linear-gradient(160deg, ${app.color1}, ${app.color2})`;
  const soft = `linear-gradient(160deg, ${app.color1}22, ${app.color2}33)`;

  return (
    <div className="relative h-full w-full overflow-hidden rounded-[28px] border border-black/10 bg-white shadow-[0_8px_28px_rgba(0,0,0,0.1)]">
      <div className="absolute left-1/2 top-2 z-10 h-4 w-16 -translate-x-1/2 rounded-full bg-black/85" />
      {variant === 0 && (
        <div className="flex h-full flex-col justify-end p-4 pb-8 text-white" style={{ background: g }}>
          <Icon className="absolute -right-6 top-10 text-white/20" size={170} strokeWidth={1.2} />
          <p className="relative text-[11px] font-semibold uppercase tracking-widest text-white/80">Welcome to</p>
          <p className="relative text-[26px] font-bold leading-tight tracking-tight">{app.name}</p>
          <p className="relative mt-1 text-[12px] text-white/85">{app.subtitle}</p>
          <div className="relative mt-4 h-9 rounded-full bg-white/90" />
        </div>
      )}
      {variant === 1 && (
        <div className="h-full px-3 pt-10" style={{ background: "#F2F2F7" }}>
          <p className="mb-2 px-1 text-[18px] font-bold text-black">Library</p>
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="mb-2 flex items-center gap-2 rounded-2xl bg-white p-2 shadow-sm">
              <div className="h-9 w-9 rounded-xl" style={{ background: g, opacity: 1 - i * 0.12 }} />
              <div className="flex-1 space-y-1.5">
                <div className="h-2 w-3/4 rounded-full bg-black/80" />
                <div className="h-1.5 w-1/2 rounded-full bg-black/15" />
              </div>
            </div>
          ))}
        </div>
      )}
      {variant === 2 && (
        <div className="h-full px-3 pt-10" style={{ background: soft }}>
          <p className="mb-3 px-1 text-[18px] font-bold text-black">Insights</p>
          <div className="rounded-2xl bg-white p-3 shadow-sm">
            <div className="flex h-24 items-end gap-1.5">
              {[40, 65, 50, 85, 60, 95, 70].map((h, i) => (
                <div key={i} className="flex-1 rounded-t-md" style={{ height: `${h}%`, background: g }} />
              ))}
            </div>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <div className="h-16 rounded-2xl bg-white shadow-sm" />
            <div className="h-16 rounded-2xl shadow-sm" style={{ background: g }} />
          </div>
        </div>
      )}
      {variant >= 3 && (
        <div className="h-full bg-white px-3 pt-10">
          <div className="mb-3 h-28 rounded-3xl" style={{ background: g }} />
          <div className="grid grid-cols-2 gap-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="aspect-square rounded-2xl" style={{ background: soft }} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
