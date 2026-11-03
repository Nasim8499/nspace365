"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { useStore } from "@/components/store";
import AppIcon from "@/components/ui/AppIcon";

export function Toasts() {
  const { toasts } = useStore();
  return (
    <div className="pointer-events-none fixed inset-x-0 top-16 z-[70] flex flex-col items-center gap-2 px-4">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: -16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.96 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="flex items-center gap-2 rounded-full border border-black/5 bg-white/85 px-4 py-2.5 text-[14px] font-medium text-[#1C1C1E] shadow-[0_8px_32px_rgba(0,0,0,0.12)] backdrop-blur-xl"
          >
            <CheckCircle2 size={17} className="text-[#34C759]" />
            {t.text}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export function LaunchOverlay() {
  const { launching } = useStore();
  return (
    <AnimatePresence>
      {launching && (
        <motion.div
          key={launching.id}
          className="fixed inset-0 z-[80] grid place-items-center"
          style={{ background: `linear-gradient(160deg, ${launching.color1}, ${launching.color2})` }}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.06 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
        >
          <div className="flex flex-col items-center gap-5 text-white">
            <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.28, ease: "easeOut" }}>
              <AppIcon app={launching} size={120} className="!ring-white/40" />
            </motion.div>
            <p className="text-[22px] font-bold tracking-tight">{launching.name}</p>
            <div className="h-1 w-32 overflow-hidden rounded-full bg-white/30">
              <motion.div className="h-full bg-white" initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 1, ease: "easeOut" }} />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
