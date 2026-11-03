"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, ExternalLink, RotateCw, ShieldCheck, X } from "lucide-react";
import { useState } from "react";
import { useStore } from "@/components/store";

/** In-app browser: opens any project URL inside the app, native-Safari style. */
export default function BrowserSheet() {
  const { browserUrl, closeBrowser } = useStore();
  const [key, setKey] = useState(0);
  const [url, setUrl] = useState<string | null>(null);
  const live = browserUrl;

  const host = (() => {
    try {
      return live ? new URL(live).host : "";
    } catch {
      return "";
    }
  })();

  return (
    <AnimatePresence>
      {live && (
        <motion.div
          className="fixed inset-0 z-[90] flex flex-col bg-white"
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", stiffness: 320, damping: 34, mass: 0.9 }}
        >
          <div
            className="shrink-0 border-b border-black/[0.07] bg-white/85 backdrop-blur-2xl backdrop-saturate-150"
            style={{ paddingTop: "var(--safe-top)" }}
          >
            <div className="flex h-12 items-center gap-1 px-2">
              <button
                onClick={closeBrowser}
                aria-label="Close browser"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-[#007AFF] active:scale-95"
              >
                <X size={19} strokeWidth={2.4} />
              </button>
              <button
                onClick={() => setKey((k) => k + 1)}
                aria-label="Reload"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-[#007AFF] active:scale-95"
              >
                <RotateCw size={17} />
              </button>
              <div className="mx-1 flex h-9 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-[12px] bg-[#F2F2F7] px-3">
                <ShieldCheck size={12} className="shrink-0 text-[#34C759]" />
                <span className="truncate text-[12.5px] font-medium text-[#3C3C43]">{host || "Opening…"}</span>
              </div>
              <button
                onClick={() => setUrl(live)}
                aria-label="Open in new tab"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-[#007AFF] active:scale-95"
              >
                <ExternalLink size={17} />
              </button>
            </div>
            <div className="flex items-center gap-3 px-4 pb-2">
              <span className="flex items-center gap-1 text-[11px] font-semibold text-[#8E8E93]">
                <ArrowLeft size={13} /> back
              </span>
              <span className="flex items-center gap-1 text-[11px] font-semibold text-[#8E8E93]">
                <ArrowRight size={13} /> forward
              </span>
              <span className="ml-auto flex items-center gap-1 text-[11px] font-semibold text-[#34C759]">
                <motion.span
                  className="h-1.5 w-1.5 rounded-full bg-[#34C759]"
                  animate={{ opacity: [1, 0.35, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                live
              </span>
            </div>
          </div>

          <motion.div
            className="relative min-h-0 flex-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.12 }}
          >
            <iframe
              key={`${live}-${key}`}
              src={live}
              title={`${host} preview`}
              referrerPolicy="no-referrer"
              allow="clipboard-read; clipboard-write; fullscreen; geolocation"
              className="h-full w-full border-0 bg-white"
              onLoad={() => setUrl(live)}
            />
          </motion.div>
        </motion.div>
      )}
      {url ? null : null}
    </AnimatePresence>
  );
}
