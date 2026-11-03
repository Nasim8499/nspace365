"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, type ReactNode } from "react";

export default function Modal({
  open, onClose, children, label, maxWidth = "md:max-w-2xl",
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  label: string;
  maxWidth?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center md:p-6" role="dialog" aria-modal="true" aria-label={label}>
          <motion.div
            className="absolute inset-0 bg-black/30 backdrop-blur-[3px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={onClose}
          />
          <motion.div
            className={`relative flex max-h-[94dvh] w-full flex-col overflow-hidden rounded-t-3xl border border-black/5 bg-white shadow-[0_24px_80px_rgba(0,0,0,0.22)] md:max-h-[88dvh] md:rounded-3xl ${maxWidth}`}
            initial={{ opacity: 0, y: 48, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 32, scale: 0.98 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
          >
            <div className="mx-auto mt-2 h-1 w-9 shrink-0 rounded-full bg-black/15 md:hidden" />
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute right-4 top-4 z-10 grid h-8 w-8 place-items-center rounded-full bg-black/[0.06] text-[#8E8E93] backdrop-blur-md transition-colors hover:bg-black/10"
            >
              <X size={16} strokeWidth={2.6} />
            </button>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
