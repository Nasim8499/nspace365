"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

const PASSWORD = "VisaHOBe1323@";
const SEEN_KEY = "nspace.onboarded.v1";

export const SETTINGS_KEY = "nspace.keys.v1";
export const PROVIDER_KEY = "nspace.provider.v1";

export interface KeyBag {
  gemini: string;
  openai: string;
  deepseek: string;
  github1: string;
  github2: string;
  localServer: string;
}

export function readKeys(): KeyBag {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return { gemini: "", openai: "", deepseek: "", github1: "", github2: "", localServer: "", ...JSON.parse(raw) } as KeyBag;
  } catch {}
  return { gemini: "", openai: "", deepseek: "", github1: "", github2: "", localServer: "" };
}

export function readProvider(): "gemini" | "openai" | "deepseek" | "local" {
  try {
    const v = localStorage.getItem(PROVIDER_KEY);
    if (v === "gemini" || v === "openai" || v === "deepseek") return v;
  } catch {}
  return "local";
}

function LiquidMark({ size = 118 }: { size?: number }) {
  return (
    <motion.div
      initial={{ scale: 0.55, opacity: 0, filter: "blur(14px)" }}
      animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      className="relative grid place-items-center"
      style={{ width: size, height: size }}
    >
      <motion.span
        className="absolute inset-0 rounded-[30%] bg-white/55 backdrop-blur-2xl"
        animate={{ borderRadius: ["30%", "42%", "30%"], rotate: [0, 8, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.95), 0 24px 60px rgba(0,80,200,0.28)" }}
      />
      <motion.span
        className="absolute inset-[14%] rounded-full bg-gradient-to-br from-[#007AFF] via-[#5AC8FA] to-[#BF5AF2] opacity-90"
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
        style={{ filter: "blur(0.4px)", boxShadow: "inset 0 2px 12px rgba(255,255,255,0.65)" }}
      />
      <span className="relative text-[26px] font-bold text-white drop-shadow">N</span>
    </motion.div>
  );
}

function Ripple() {
  return (
    <div className="relative grid h-40 w-40 place-items-center">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="absolute rounded-full border border-white/70"
          initial={{ width: 60, height: 60, opacity: 0.9 }}
          animate={{ width: 190, height: 190, opacity: 0 }}
          transition={{ duration: 1.5, delay: i * 0.22, ease: "easeOut", repeat: Infinity }}
        />
      ))}
      <motion.div
        initial={{ scale: 0.7 }}
        animate={{ scale: [0.7, 1.06, 1] }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      >
        <LiquidMark size={86} />
      </motion.div>
    </div>
  );
}

export default function Onboarding({ children }: { children: React.ReactNode }) {
  const [stage, setStage] = useState<"boot" | "locked" | "flash" | "open">("boot");
  const [value, setValue] = useState("");
  const [wrong, setWrong] = useState(false);

  useEffect(() => {
    let done = false;
    try {
      done = localStorage.getItem(SEEN_KEY) === "1";
    } catch {}
    if (done) {
      setStage("open");
      return;
    }
    const t = setTimeout(() => setStage("locked"), 1750);
    return () => clearTimeout(t);
  }, []);

  function unlock() {
    if (value === PASSWORD) {
      try {
        localStorage.setItem(SEEN_KEY, "1");
      } catch {}
      setWrong(false);
      setStage("flash");
      setTimeout(() => setStage("open"), 1450);
    } else {
      setWrong(true);
      setTimeout(() => setWrong(false), 700);
    }
  }

  return (
    <>
      {stage === "open" ? children : null}
      <AnimatePresence>
        {stage !== "open" && (
          <motion.div
            key="gate"
            className="fixed inset-0 z-[100] overflow-hidden"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.04, filter: "blur(10px)" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            style={{
              background:
                "radial-gradient(1200px 700px at 15% -10%, #d7e8ff 0%, transparent 58%), radial-gradient(900px 700px at 90% 8%, #ffe0f2 0%, transparent 55%), radial-gradient(900px 800px at 60% 110%, #d9f9e8 0%, transparent 55%), linear-gradient(170deg,#f7f9fd,#eef2fa)"
            }}
          >
            <motion.div
              className="absolute -left-24 top-10 h-[420px] w-[420px] rounded-full bg-[#007AFF]/20 blur-[90px]"
              animate={{ y: [0, 26, 0], x: [0, 16, 0] }}
              transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute -right-20 bottom-0 h-[380px] w-[380px] rounded-full bg-[#BF5AF2]/20 blur-[90px]"
              animate={{ y: [0, -22, 0] }}
              transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
            />

            <div className="relative flex h-full flex-col items-center justify-center px-6">
              {stage === "boot" && (
                <div className="flex flex-col items-center gap-6">
                  <LiquidMark />
                  <motion.p
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                    className="text-[15px] font-medium tracking-tight text-[#1C1C1E]/70"
                  >
                    N Space
                  </motion.p>
                  <motion.div
                    className="h-[3px] w-28 overflow-hidden rounded-full bg-black/10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                  >
                    <motion.span
                      className="block h-full rounded-full bg-[#007AFF]"
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 1.4, ease: "easeInOut" }}
                    />
                  </motion.div>
                </div>
              )}

              {stage === "locked" && (
                <motion.div
                  initial={{ opacity: 0, y: 18, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full max-w-[360px]"
                >
                  <div className="flex flex-col items-center gap-4">
                    <LiquidMark size={78} />
                    <div className="text-center">
                      <h1 className="text-[22px] font-semibold tracking-tight text-[#1C1C1E]">N Space</h1>
                      <p className="mt-1 text-[13px] text-[#8E8E93]">Enter the password to unlock your workspace</p>
                    </div>
                  </div>

                  <motion.div
                    animate={wrong ? { x: [0, -9, 9, -6, 6, 0] } : { x: 0 }}
                    transition={{ duration: 0.42 }}
                    className="mt-7 rounded-[22px] border border-white/80 bg-white/60 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_18px_44px_rgba(17,24,39,0.12)] backdrop-blur-2xl"
                  >
                    <input
                      type="password"
                      inputMode="text"
                      autoFocus
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && unlock()}
                      placeholder="Password"
                      className="w-full rounded-[14px] bg-white/80 px-4 py-3 text-[16px] tracking-tight text-[#1C1C1E] outline-none placeholder:text-[#AEAEB2]"
                    />
                    <button
                      onClick={unlock}
                      className="mt-2.5 w-full rounded-[14px] bg-gradient-to-b from-[#0A84FF] to-[#0060DF] py-3 text-[15px] font-semibold text-white shadow-[0_10px_24px_rgba(0,96,223,0.35)] active:scale-[0.99]"
                    >
                      Unlock
                    </button>
                  </motion.div>

                  <AnimatePresence>
                    {wrong && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mt-3 text-center text-[12.5px] font-medium text-[#FF3B30]"
                      >
                        Wrong password, try again
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}

              {stage === "flash" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="flex flex-col items-center gap-6"
                >
                  <Ripple />
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.35 }}
                    className="text-[14px] font-medium tracking-tight text-[#1C1C1E]/70"
                  >
                    Unlocking your space…
                  </motion.p>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
