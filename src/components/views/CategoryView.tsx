"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import GithubMark from "@/components/ui/GithubMark";
import { useMemo, useState } from "react";
import { useStore } from "@/components/store";
import AppRow from "@/components/ui/AppRow";
import HeroCard from "@/components/ui/HeroCard";
import SectionHeader, { ViewHeader } from "@/components/ui/SectionHeader";
import type { Category } from "@/lib/types";

const config: Record<"games" | "apps" | "arcade", { title: string; eyebrow: string; featured: string; badge: string; headline: string; image?: string }> = {
  games: { title: "Games", eyebrow: "Play something new", featured: "neondrift", badge: "FEATURED GAME", headline: "Race through\nthe neon night.", image: "/hero/hero-sunset.jpg" },
  apps: { title: "Apps", eyebrow: "Make every day better", featured: "canvas", badge: "EDITORS' CHOICE", headline: "Sketch, paint,\nanimate.", image: "/hero/hero-aurora.jpg" },
  arcade: { title: "Arcade", eyebrow: "Unlimited. No ads.", featured: "bloom", badge: "NOW IN ARCADE", headline: "Puzzles that\nblossom.", image: "/hero/hero-mint.jpg" },
};

export default function CategoryView({ category }: { category: Exclude<Category, "developer"> }) {
  const { apps, go } = useStore();
  const cfg = config[category];
  const [genre, setGenre] = useState("All");

  const items = useMemo(() => apps.filter((a) => a.category === category), [apps, category]);
  const genres = useMemo(() => ["All", ...Array.from(new Set(items.map((i) => i.genre)))], [items]);
  const shown = genre === "All" || !genres.includes(genre) ? items : items.filter((i) => i.genre === genre);
  const featured = apps.find((a) => a.id === cfg.featured);
  const devItems = category === "apps" ? apps.filter((a) => a.category === "developer") : [];

  return (
    <div>
      <ViewHeader eyebrow={cfg.eyebrow} title={cfg.title} />
      {featured && <HeroCard app={featured} image={cfg.image} badge={cfg.badge} title={cfg.headline} tall={false} />}

      <SectionHeader title={`Top ${cfg.title}`} />
      <div className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1 md:-mx-8 md:px-8">
        {genres.map((g) => {
          const on = g === genre || (g === "All" && !genres.includes(genre));
          return (
            <motion.button
              key={g}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.12, ease: "easeOut" }}
              onClick={() => setGenre(g)}
              className={`relative shrink-0 rounded-full border px-4 py-1.5 text-[14px] font-semibold transition-colors ${on ? "border-[#007AFF] bg-[#007AFF] text-white" : "border-black/[0.06] bg-[#F2F2F7] text-[#1C1C1E] hover:bg-[#E9E9EF]"}`}
            >
              {g}
            </motion.button>
          );
        })}
      </div>

      <div key={genre} className="mt-2 grid gap-x-8 md:grid-cols-2">
        {shown.map((a, i) => (
          <AppRow key={a.id} app={a} rank={i + 1} index={i} divider={i < shown.length - (shown.length % 2 === 0 ? 2 : 1) || true} />
        ))}
      </div>

      {category === "apps" && (
        <>
          <SectionHeader title="Developer Projects" action="Sync" onAction={() => go("github")} />
          <div className="mt-1 grid gap-x-8 md:grid-cols-2">
            {devItems.map((a, i) => (
              <AppRow key={a.id} app={a} index={i} divider />
            ))}
          </div>
          <motion.button
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.12, ease: "easeOut" }}
            onClick={() => go("github")}
            className="mt-4 flex w-full items-center gap-3 rounded-2xl border border-black/5 bg-[#F2F2F7] p-4 text-left transition-colors hover:bg-[#EBEBF0]"
          >
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-black text-white">
              <GithubMark size={22} />
            </span>
            <span className="flex-1">
              <span className="block text-[16px] font-semibold text-black">Sync your GitHub repositories</span>
              <span className="block text-[13px] text-[#8E8E93]">Auto-generate icons, previews and listings</span>
            </span>
            <ArrowRight size={18} className="text-[#007AFF]" />
          </motion.button>
        </>
      )}
    </div>
  );
}
