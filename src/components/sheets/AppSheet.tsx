"use client";

import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Clock, ExternalLink, GitBranch, MessageSquareText, Share, Star, Trash2, Users } from "lucide-react";
import { useRef } from "react";
import { useStore } from "@/components/store";
import AppIcon from "@/components/ui/AppIcon";
import GetButton from "@/components/ui/GetButton";
import GithubMark from "@/components/ui/GithubMark";
import MockScreen from "@/components/ui/MockScreen";
import Modal from "@/components/ui/Modal";
import { compact, timeAgo } from "@/lib/format";
import type { StoreApp } from "@/lib/types";

export default function AppSheet() {
  const { apps, sheetId, closeSheet } = useStore();
  const app = apps.find((a) => a.id === sheetId) ?? null;
  // keep last app rendered during exit animation
  const last = useRef<StoreApp | null>(null);
  if (app) last.current = app;
  const shown = app ?? last.current;

  return (
    <Modal open={!!sheetId && !!app} onClose={closeSheet} label={shown?.name ?? "App"}>
      {shown && <SheetBody app={shown} />}
    </Modal>
  );
}

function SheetBody({ app }: { app: StoreApp }) {
  const { apps, removeApp, toast, askAboutRepo } = useStore();
  const scroller = useRef<HTMLDivElement>(null);
  const isRepo = app.source === "github";
  const m = app.meta;
  const peers = apps.filter((a) => a.category === app.category).sort((a, b) => b.ratings - a.ratings);
  const rank = peers.findIndex((a) => a.id === app.id) + 1;

  const share = async () => {
    const link = typeof window !== "undefined" ? `${window.location.origin}/#${app.id}` : app.name;
    try {
      await navigator.clipboard.writeText(link);
      toast("Link copied");
    } catch {
      toast("Copy not available");
    }
  };

  const stats: { top: string; big: React.ReactNode; sub: string }[] = [
    { top: `${compact(app.ratings)} ${isRepo ? "STARS" : "RATINGS"}`, big: app.rating.toFixed(1), sub: "★★★★★".slice(0, Math.round(app.rating)) },
    { top: "AGE", big: app.age, sub: isRepo ? "Visibility" : "Years Old" },
    { top: "CHART", big: `#${rank}`, sub: app.genre || "Category" },
    { top: "DEVELOPER", big: <Users size={24} />, sub: app.developer },
    { top: isRepo ? "LANGUAGE" : "SIZE", big: isRepo ? (m.language ?? "—") : app.size.split(" ")[0], sub: isRepo ? "Primary" : app.size.split(" ")[1] ?? "" },
  ];

  const shots = [0, 1, 2, 3];

  return (
    <div className="pb-8">
      {/* header */}
      <div className="flex gap-4 px-5 pb-2 pt-8 sm:gap-5 sm:px-8 sm:pt-10">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.26, ease: "easeOut" }}>
          <div className="sm:hidden"><AppIcon app={app} size={96} /></div>
          <div className="hidden sm:block"><AppIcon app={app} size={120} /></div>
        </motion.div>
        <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5 pr-8">
          <div>
            {app.badge && <p className="text-[11px] font-bold uppercase tracking-wider text-[#007AFF]">{app.badge}</p>}
            <h2 className="text-[24px] font-bold leading-tight tracking-tight text-black sm:text-[28px]">{app.name}</h2>
            <p className="mt-0.5 line-clamp-2 text-[14px] leading-snug text-[#8E8E93] sm:text-[15px]">{app.subtitle}</p>
          </div>
          <div className="mt-3 flex items-center gap-2.5">
            <GetButton app={app} variant="solid" large />
            <button onClick={share} aria-label="Share" className="grid h-10 w-10 place-items-center rounded-full bg-[#F2F2F7] text-[#007AFF] transition-colors hover:bg-[#E9E9EF]">
              <Share size={18} />
            </button>
            {app.status === "installed" && app.url !== "#ai" && (
              <button onClick={() => removeApp(app)} aria-label="Remove" className="grid h-10 w-10 place-items-center rounded-full bg-[#F2F2F7] text-[#FF3B30] transition-colors hover:bg-[#E9E9EF]">
                <Trash2 size={17} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* stats */}
      <div className="no-scrollbar mt-5 flex overflow-x-auto border-y border-black/[0.06] px-2 py-3 sm:px-6">
        {stats.map((s, i) => (
          <div key={s.top} className={`flex min-w-[104px] flex-1 flex-col items-center justify-center px-3 text-center ${i > 0 ? "border-l border-black/[0.06]" : ""}`}>
            <p className="text-[11px] font-bold uppercase tracking-wide text-[#8E8E93]">{s.top}</p>
            <div className="my-0.5 flex h-8 items-center text-[22px] font-bold text-[#1C1C1E]">{s.big}</div>
            <p className="max-w-[100px] truncate text-[12px] text-[#8E8E93]">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* screenshots */}
      <div className="relative mt-6">
        <div className="mb-3 flex items-center justify-between px-5 sm:px-8">
          <h3 className="text-[20px] font-bold tracking-tight">Preview</h3>
          <div className="hidden gap-1.5 md:flex">
            <button onClick={() => scroller.current?.scrollBy({ left: -280, behavior: "smooth" })} aria-label="Previous" className="grid h-8 w-8 place-items-center rounded-full bg-[#F2F2F7] text-[#007AFF]"><ChevronLeft size={18} /></button>
            <button onClick={() => scroller.current?.scrollBy({ left: 280, behavior: "smooth" })} aria-label="Next" className="grid h-8 w-8 place-items-center rounded-full bg-[#F2F2F7] text-[#007AFF]"><ChevronRight size={18} /></button>
          </div>
        </div>
        <div ref={scroller} className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-1 sm:px-8">
          {isRepo && m.previewUrl && (
            <div className="aspect-[16/10] h-[260px] shrink-0 snap-start overflow-hidden rounded-2xl border border-black/10 bg-[#F2F2F7] shadow-[0_8px_28px_rgba(0,0,0,0.1)] sm:h-[300px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={m.previewUrl} alt="Live preview" className="h-full w-full object-cover" />
            </div>
          )}
          {shots.map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.26, ease: "easeOut", delay: 0.05 * i }}
              className="aspect-[9/19] h-[260px] shrink-0 snap-start sm:h-[300px]"
            >
              <MockScreen app={app} variant={i} />
            </motion.div>
          ))}
        </div>
      </div>

      {/* repo panel */}
      {isRepo && (
        <div className="mx-5 mt-6 rounded-3xl border border-black/5 bg-[#F2F2F7] p-4 sm:mx-8">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { icon: GitBranch, label: "Branch", value: m.branch },
              { icon: Clock, label: "Last commit", value: timeAgo(m.pushedAt) },
              { icon: Star, label: "Stars", value: compact(m.stars ?? 0) },
              { icon: GithubMark as unknown as typeof Star, label: "Forks", value: compact(m.forks ?? 0) },
            ].map((i) => (
              <div key={i.label} className="rounded-2xl bg-white p-3 shadow-sm">
                <i.icon size={16} className="text-[#007AFF]" />
                <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#8E8E93]">{i.label}</p>
                <p className="truncate text-[16px] font-semibold text-[#1C1C1E]">{i.value}</p>
              </div>
            ))}
          </div>
          {!!m.topics?.length && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {m.topics.map((t) => (
                <span key={t} className="rounded-full bg-white px-2.5 py-1 text-[12px] font-medium text-[#007AFF] shadow-sm">{t}</span>
              ))}
            </div>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            <a href={m.liveUrl} target="_blank" rel="noopener noreferrer" className="inline-flex h-10 items-center gap-2 rounded-full bg-[#007AFF] px-5 text-[15px] font-semibold text-white shadow-[0_4px_14px_rgba(0,122,255,0.35)]">
              <ExternalLink size={16} /> Launch live preview
            </a>
            <a href={m.htmlUrl} target="_blank" rel="noopener noreferrer" className="inline-flex h-10 items-center gap-2 rounded-full bg-white px-4 text-[15px] font-semibold text-[#007AFF] shadow-sm">
              <GithubMark size={16} /> Repository
            </a>
            <button onClick={() => askAboutRepo(app.id)} className="inline-flex h-10 items-center gap-2 rounded-full bg-white px-4 text-[15px] font-semibold text-[#007AFF] shadow-sm">
              <MessageSquareText size={16} /> Ask AI
            </button>
          </div>
        </div>
      )}

      {/* what's new */}
      <div className="mt-7 px-5 sm:px-8">
        <div className="flex items-end justify-between">
          <h3 className="text-[20px] font-bold tracking-tight">What’s New</h3>
          <span className="text-[13px] text-[#8E8E93]">{timeAgo(m.pushedAt ?? app.updatedAt)}</span>
        </div>
        <p className="mt-0.5 text-[13px] text-[#8E8E93]">Version {app.version}</p>
        <p className="mt-2 text-[15px] leading-relaxed text-[#1C1C1E]">{app.changelog}</p>
      </div>

      <div className="mx-5 mt-6 h-px bg-black/[0.06] sm:mx-8" />
      <p className="mt-5 px-5 text-[15px] leading-relaxed text-[#1C1C1E] sm:px-8">{app.description}</p>

      {/* info */}
      <div className="mt-7 px-5 sm:px-8">
        <h3 className="text-[20px] font-bold tracking-tight">Information</h3>
        <dl className="mt-2">
          {[
            ["Seller", app.developer],
            ["Size", app.size],
            ["Category", app.genre || app.category],
            ["Compatibility", "iPhone, iPad, Mac, Web"],
            ["Age Rating", app.age],
            ["Price", "Free"],
          ].map(([k, v]) => (
            <div key={k} className="flex items-center justify-between gap-6 border-b border-black/[0.06] py-3 text-[15px]">
              <dt className="text-[#8E8E93]">{k}</dt>
              <dd className="truncate text-right text-[#1C1C1E]">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
