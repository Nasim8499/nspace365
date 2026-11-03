"use client";

import { motion } from "framer-motion";
import { Gamepad2, Joystick, Layers, Newspaper, Search, TerminalSquare, type LucideIcon } from "lucide-react";
import { useStore, type View } from "@/components/store";

const tabs: { id: View; label: string; icon: LucideIcon }[] = [
  { id: "today", label: "Discover", icon: Newspaper },
  { id: "games", label: "Games", icon: Gamepad2 },
  { id: "apps", label: "Apps", icon: Layers },
  { id: "arcade", label: "Arcade", icon: Joystick },
  { id: "search", label: "Search", icon: Search },
  { id: "ai", label: "Build", icon: TerminalSquare },
];

export default function TabBar() {
  const { view, go } = useStore();
  const active = view === "github" ? "apps" : view;

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-3 z-40 mx-auto flex max-w-md items-center justify-between rounded-[30px] border border-black/5 bg-white/70 p-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.06)] backdrop-blur-xl backdrop-saturate-150 lg:inset-x-auto lg:left-5 lg:top-1/2 lg:mx-0 lg:w-[84px] lg:max-w-none lg:-translate-y-1/2 lg:flex-col lg:gap-1 lg:rounded-[34px] lg:p-2"
      style={{ bottom: "calc(var(--safe-bottom) + 12px)" }}
    >
      {tabs.map((t) => {
        const on = active === t.id;
        const Icon = t.icon;
        return (
          <button
            key={t.id}
            onClick={() => go(t.id)}
            aria-label={t.label}
            aria-current={on ? "page" : undefined}
            className="relative flex flex-1 flex-col items-center gap-0.5 rounded-[24px] px-1 py-2 outline-none focus-visible:ring-2 focus-visible:ring-[#007AFF]/40 lg:w-full lg:flex-none lg:py-3"
          >
            {on && (
              <motion.span
                layoutId="tab-pill"
                className="absolute inset-0 rounded-[24px] bg-[#007AFF]/10"
                transition={{ duration: 0.26, ease: "easeOut" }}
              />
            )}
            <motion.span animate={{ scale: on ? 1.06 : 1 }} transition={{ duration: 0.2, ease: "easeOut" }} className="relative">
              <Icon size={22} strokeWidth={on ? 2.4 : 2} className={on ? "text-[#007AFF]" : "text-[#8E8E93]"} />
            </motion.span>
            <span className={`relative text-[10px] font-semibold tracking-tight ${on ? "text-[#007AFF]" : "text-[#8E8E93]"}`}>{t.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
