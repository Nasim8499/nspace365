"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Search, SearchX, TrendingUp, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useStore } from "@/components/store";
import AppRow from "@/components/ui/AppRow";
import SectionHeader, { ViewHeader } from "@/components/ui/SectionHeader";

const trending = ["Camera", "Racing", "Notes", "Puzzle", "Music", "TypeScript", "Fitness"];

export default function SearchView() {
  const { apps } = useStore();
  const [q, setQ] = useState("");
  const query = q.trim().toLowerCase();

  const results = useMemo(() => {
    if (!query) return [];
    return apps.filter((a) => {
      const hay = [a.name, a.subtitle, a.genre, a.developer, a.category, a.description, ...(a.meta.topics ?? []), a.meta.language ?? ""].join(" ").toLowerCase();
      return query.split(/\s+/).every((w) => hay.includes(w));
    });
  }, [apps, query]);

  const discover = useMemo(() => [...apps].sort((a, b) => b.ratings - a.ratings).slice(0, 6), [apps]);

  return (
    <div>
      <ViewHeader title="Search" />
      <div className="sticky top-0 z-10 -mx-4 bg-white/80 px-4 pb-3 pt-1 backdrop-blur-xl md:-mx-8 md:px-8">
        <label className="flex h-11 items-center gap-2 rounded-2xl border border-black/[0.04] bg-[#F2F2F7] px-3.5 transition-shadow focus-within:shadow-[0_0_0_3px_rgba(0,122,255,0.25)]">
          <Search size={18} className="text-[#8E8E93]" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Games, Apps, Repos and More"
            aria-label="Search"
            className="h-full flex-1 bg-transparent text-[17px] text-black outline-none placeholder:text-[#8E8E93]"
          />
          <AnimatePresence>
            {q && (
              <motion.button initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.7 }} transition={{ duration: 0.14, ease: "easeOut" }} onClick={() => setQ("")} aria-label="Clear" className="grid h-5 w-5 place-items-center rounded-full bg-[#8E8E93] text-white">
                <X size={12} strokeWidth={3} />
              </motion.button>
            )}
          </AnimatePresence>
        </label>
      </div>

      {!query ? (
        <>
          <SectionHeader title="Trending Searches" />
          <div className="mt-2">
            {trending.map((s, i) => (
              <motion.button
                key={s}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, ease: "easeOut", delay: i * 0.03 }}
                onClick={() => setQ(s)}
                className="flex w-full items-center gap-3 border-b border-black/[0.06] px-1 py-3 text-left text-[17px] text-[#007AFF] transition-colors hover:bg-black/[0.02]"
              >
                <TrendingUp size={17} className="text-[#8E8E93]" /> {s}
              </motion.button>
            ))}
          </div>
          <SectionHeader title="Discover" />
          <div className="mt-1 grid gap-x-8 md:grid-cols-2">
            {discover.map((a, i) => (
              <AppRow key={a.id} app={a} index={i} />
            ))}
          </div>
        </>
      ) : results.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2, ease: "easeOut" }} className="grid place-items-center py-20 text-center">
          <SearchX size={44} className="text-[#C7C7CC]" />
          <p className="mt-3 text-[20px] font-semibold text-black">No Results for “{q}”</p>
          <p className="text-[15px] text-[#8E8E93]">Check the spelling or try a new search.</p>
        </motion.div>
      ) : (
        <div className="mt-1 grid gap-x-8 md:grid-cols-2">
          {results.map((a, i) => (
            <AppRow key={a.id} app={a} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
