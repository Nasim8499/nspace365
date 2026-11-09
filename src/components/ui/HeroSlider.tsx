"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useStore, type View } from "@/components/store";

interface Slide {
  id: string;
  brand: string;
  headline: string;
  sub: string;
  image: string;
  tint: string;
  view: View;
  cta: string;
  logo: "github" | "vercel" | "cloudflare" | "lovable" | "base44" | "nspace";
}

const SLIDES: Slide[] = [
  {
    id: "github",
    brand: "GitHub",
    headline: "Your repos,\nas an app store.",
    sub: "83 repositories, live from the GitHub API",
    image: "/hero/hero-aurora.jpg",
    tint: "#0A84FF",
    view: "github",
    cta: "Browse repos",
    logo: "github",
  },
  {
    id: "vercel",
    brand: "Vercel",
    headline: "Ship it\nin one tap.",
    sub: "Token in, deployments and domains out",
    image: "/hero/hero-mint.jpg",
    tint: "#111111",
    view: "connections",
    cta: "Connect Vercel",
    logo: "vercel",
  },
  {
    id: "cloudflare",
    brand: "Cloudflare",
    headline: "Workers,\nKV and Pages.",
    sub: "Edge runtime wired to the same workspace",
    image: "/hero/hero-sunset.jpg",
    tint: "#F38020",
    view: "connections",
    cta: "Connect Cloudflare",
    logo: "cloudflare",
  },
  {
    id: "lovable",
    brand: "Lovable",
    headline: "Design first,\nthen build.",
    sub: "Generated screens land in your projects",
    image: "/hero/hero-aurora.jpg",
    tint: "#FF375F",
    view: "apps",
    cta: "Open projects",
    logo: "lovable",
  },
  {
    id: "base44",
    brand: "Base44",
    headline: "Agent plus\nbackend.",
    sub: "Entities, functions and automations ready",
    image: "/hero/hero-mint.jpg",
    tint: "#5E5CE6",
    view: "ai",
    cta: "Open agent",
    logo: "base44",
  },
  {
    id: "nspace",
    brand: "N Space",
    headline: "One workspace,\nall your keys.",
    sub: "Models, skills, knowledge in one place",
    image: "/hero/hero-sunset.jpg",
    tint: "#30D158",
    view: "account",
    cta: "Your account",
    logo: "nspace",
  },
];

function BrandLogo({ kind, size = 22 }: { kind: Slide["logo"]; size?: number }) {
  if (kind === "github") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M12 .5C5.7.5.5 5.7.5 12c0 5.1 3.3 9.4 7.8 10.9.6.1.8-.3.8-.6v-2c-3.2.7-3.8-1.4-3.8-1.4-.5-1.3-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.1.1 1.7 1.1 1.7 1.1 1 1.7 2.7 1.2 3.3.9.1-.7.4-1.2.7-1.5-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2a11 11 0 0 1 6 0C17.4 4.4 18.4 4.7 18.4 4.7c.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6 4.5-1.5 7.8-5.8 7.8-10.9C23.5 5.7 18.3.5 12 .5z" />
      </svg>
    );
  }
  if (kind === "vercel") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M12 2 23 21H1L12 2z" />
      </svg>
    );
  }
  if (kind === "cloudflare") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M17.6 12.6c.1-.4.2-.8.2-1.2 0-2.6-2.1-4.7-4.7-4.7-2 0-3.7 1.3-4.4 3.1-.4-.2-.9-.3-1.4-.3C5.8 9.5 4.5 10.8 4.5 12.4c0 .2 0 .4.1.6C3.1 13.3 2 14.6 2 16c0 1.7 1.4 3 3.1 3h12.3c1.7 0 3.1-1.4 3.1-3.1 0-1.5-1.1-2.8-2.5-3.1l-.4-.2z" />
      </svg>
    );
  }
  if (kind === "lovable") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M12 21s-8-4.9-8-10.4A4.6 4.6 0 0 1 12 7a4.6 4.6 0 0 1 8 3.6C20 16.1 12 21 12 21z" />
      </svg>
    );
  }
  if (kind === "base44") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
        <path d="M5 19V8l7-4 7 4v11" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 19v-5h6v5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden>
      <path d="M5 19V5l14 14V5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function HeroSlider() {
  const { go } = useStore();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hidden, setHidden] = useState(false);
  const reduce = useReducedMotion();

  const DURATION = 5200;
  const count = SLIDES.length;
  const next = useCallback(() => setIndex((i) => (i + 1) % count), [count]);
  const prev = useCallback(() => setIndex((i) => (i - 1 + count) % count), [count]);

  useEffect(() => {
    const onVis = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  useEffect(() => {
    if (paused || hidden || reduce) return;
    const t = setTimeout(next, DURATION);
    return () => clearTimeout(t);
  }, [index, paused, hidden, reduce, next]);

  const slide = SLIDES[index];
  const stamp = String(index + 1).padStart(2, "0");
  const total = String(count).padStart(2, "0");

  return (
    <motion.section
      aria-label="Featured platforms"
      aria-roledescription="carousel"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") next();
        if (e.key === "ArrowLeft") prev();
      }}
      drag={reduce ? false : "x"}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.12}
      onDragEnd={(_, info) => {
        if (info.offset.x < -56) next();
        else if (info.offset.x > 56) prev();
      }}
      onPointerDown={() => setPaused(true)}
      onPointerUp={() => setPaused(false)}
      onPointerCancel={() => setPaused(false)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      style={{ touchAction: "pan-y" }}
      className="relative isolate cursor-grab overflow-hidden rounded-[30px] bg-[#08080C] ring-1 ring-white/10 outline-none focus-visible:ring-2 focus-visible:ring-white/40 active:cursor-grabbing"
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -inset-16 -z-10 rounded-full opacity-60 blur-[64px]"
        animate={{ backgroundColor: slide.tint }}
        transition={{ duration: 0.9, ease: "easeOut" }}
      />

      <div className="relative h-[266px] sm:h-[300px]">
        <AnimatePresence initial={false}>
          <motion.div
            key={slide.id}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.div
              className="absolute inset-0"
              initial={reduce ? false : { scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: reduce ? 0 : 7, ease: "linear" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={slide.image} alt="" className="h-full w-full object-cover" />
            </motion.div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/10" />
            <div
              className="absolute inset-0"
              style={{ background: `radial-gradient(130% 95% at 84% 4%, ${slide.tint}66 0%, transparent 60%)` }}
            />
            <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_0%_100%,rgba(0,0,0,0.72),transparent_55%)]" />
          </motion.div>
        </AnimatePresence>

        <div className="relative flex h-full flex-col justify-between p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2.5 rounded-full bg-white/10 py-1.5 pl-1.5 pr-3.5 ring-1 ring-inset ring-white/20 backdrop-blur-md">
              <span
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]"
                style={{ backgroundColor: `${slide.tint}D9` }}
              >
                <BrandLogo kind={slide.logo} size={16} />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[12.5px] font-semibold leading-tight text-white">{slide.brand}</span>
                <span className="flex items-center gap-1 text-[9.5px] font-medium uppercase leading-tight tracking-[0.14em] text-white/60">
                  <span className="inline-block h-1 w-1 rounded-full bg-emerald-400" />
                  connected
                </span>
              </span>
            </div>

            <div className="flex shrink-0 items-center gap-1.5">
              <span className="mr-0.5 font-mono text-[11px] tabular-nums tracking-tight text-white/55">
                {stamp}
                <span className="text-white/30">/{total}</span>
              </span>
              <button
                type="button"
                onClick={prev}
                aria-label="Previous platform"
                className="grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white ring-1 ring-inset ring-white/20 backdrop-blur-md transition-transform active:scale-95 sm:h-9 sm:w-9"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <button
                type="button"
                onClick={next}
                aria-label="Next platform"
                className="grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white ring-1 ring-inset ring-white/20 backdrop-blur-md transition-transform active:scale-95 sm:h-9 sm:w-9"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M9 6l6 6-6 6" />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0" aria-live="polite">
              <AnimatePresence mode="wait">
                <motion.div
                  key={slide.id + "-text"}
                  initial={reduce ? false : { opacity: 0, y: 16, filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={reduce ? { opacity: 1 } : { opacity: 0, y: -12, filter: "blur(8px)" }}
                  transition={{ duration: reduce ? 0 : 0.55, ease: [0.16, 1, 0.3, 1] }}
                >
                  <h2 className="whitespace-pre-line bg-gradient-to-b from-white via-white to-white/80 bg-clip-text text-[27px] font-bold leading-[1.05] tracking-[-0.035em] text-transparent sm:text-[33px]">
                    {slide.headline}
                  </h2>
                  <p className="mt-1.5 max-w-[255px] text-[12.5px] leading-snug text-white/75">{slide.sub}</p>
                </motion.div>
              </AnimatePresence>

              <motion.button
                type="button"
                whileTap={{ scale: 0.96 }}
                onClick={() => go(slide.view)}
                className="mt-3.5 inline-flex h-11 items-center gap-1.5 rounded-full bg-white px-4 text-[13px] font-semibold text-[#08080C]"
                style={{ boxShadow: `0 12px 30px -10px ${slide.tint}` }}
              >
                {slide.cta}
                <ArrowUpRight size={15} strokeWidth={2.6} />
              </motion.button>
            </div>

            <div className="hidden shrink-0 flex-col items-end gap-1.5 sm:flex">
              {SLIDES.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={s.brand}
                  aria-current={i === index}
                  className={`grid h-7 w-7 place-items-center rounded-full ring-1 transition-all ${
                    i === index ? "bg-white text-[#08080C] ring-white" : "bg-white/10 text-white/70 ring-white/25 hover:bg-white/20"
                  }`}
                >
                  <BrandLogo kind={s.logo} size={13} />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 flex gap-1 px-5 pb-2.5 sm:px-6">
          {SLIDES.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Go to ${s.brand}`}
              className="flex-1 py-2"
            >
              <span className="block h-[3px] overflow-hidden rounded-full bg-white/25">
                {i === index && (
                  <span
                    key={`${slide.id}-bar`}
                    className="block h-full rounded-full bg-white"
                    style={
                      reduce
                        ? { width: "100%" }
                        : {
                            animation: `nspaceSlideFill ${DURATION}ms linear forwards`,
                            animationPlayState: paused || hidden ? "paused" : "running",
                          }
                    }
                  />
                )}
              </span>
            </button>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
