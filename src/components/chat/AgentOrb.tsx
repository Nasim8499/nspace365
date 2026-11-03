"use client";

import { motion } from "framer-motion";

/**
 * Premium AI agent mark — layered liquid-glass orb with a conic sheen,
 * inner core and slow orbit. Pure CSS/SVG so it stays crisp at any size.
 */
export default function AgentOrb({ size = 64, live = false }: { size?: number; live?: boolean }) {
  const r = size / 2;
  return (
    <motion.div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      aria-hidden
    >
      {live && (
        <motion.span
          className="absolute inset-0 rounded-full"
          style={{ boxShadow: "0 0 0 1px rgba(10,132,255,0.35)" }}
          animate={{ scale: [1, 1.28], opacity: [0.6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
        />
      )}
      <span
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "conic-gradient(from 210deg, #0A84FF, #5AC8FA, #BF5AF2, #FF375F, #0A84FF)",
          filter: "saturate(115%)"
        }}
      />
      <span
        className="absolute rounded-full"
        style={{
          inset: size > 40 ? 3 : 2,
          background: "radial-gradient(120% 120% at 30% 18%, rgba(255,255,255,0.95), rgba(255,255,255,0.35) 38%, rgba(6,10,30,0.92))",
          backdropFilter: "blur(2px)"
        }}
      />
      <motion.span
        className="absolute inset-0 rounded-full"
        style={{
          background: "linear-gradient(150deg, rgba(255,255,255,0.85), rgba(255,255,255,0.05) 45%, rgba(255,255,255,0))",
          mixBlendMode: "screen"
        }}
        animate={{ opacity: [0.55, 0.9, 0.55] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <svg viewBox="0 0 24 24" className="absolute inset-0 h-full w-full" fill="none">
        <motion.path
          d="M12 5.6l1.5 3.9 3.9 1.5-3.9 1.5L12 16.4l-1.5-3.9L6.6 11l3.9-1.5L12 5.6z"
          fill="url(#g)"
          animate={{ opacity: [0.75, 1, 0.75], scale: [1, 1.06, 1] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "center" }}
        />
        <motion.circle
          cx="17.4"
          cy="7"
          r="1.05"
          fill="#EAF3FF"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
        />
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#9FD4FF" />
          </linearGradient>
        </defs>
      </svg>
      <span
        className="absolute rounded-full"
        style={{ inset: -r * 0.08, boxShadow: "inset 0 1px 0 rgba(255,255,255,0.85), 0 10px 26px rgba(10,80,200,0.28)" }}
      />
    </motion.div>
  );
}
