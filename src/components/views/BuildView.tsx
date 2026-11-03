"use client";

import { motion } from "framer-motion";
import { Brain, Check, Cloud, Sparkles, Terminal } from "lucide-react";
import { useEffect, useState } from "react";
import ChatView from "@/components/chat/ChatView";
import { PROVIDER_KEY, SETTINGS_KEY, readKeys, readProvider, type KeyBag } from "@/components/onboarding/Onboarding";

type Provider = "local" | "gemini" | "openai" | "deepseek";

const ENGINES: { id: Provider; label: string; note: string; icon: typeof Brain }[] = [
  { id: "local", label: "Self-hosted", note: "Built-in knowledge · no key", icon: Brain },
  { id: "gemini", label: "Gemini", note: "Cloud · your API key", icon: Sparkles },
  { id: "openai", label: "OpenAI", note: "Cloud · your API key", icon: Cloud },
  { id: "deepseek", label: "DeepSeek", note: "Cloud · your API key", icon: Terminal },
];

const KNOWLEDGE_KEY = "nspace.build.knowledge.v1";

export default function BuildView() {
  const [provider, setProvider] = useState<Provider>("local");
  const [bag, setBag] = useState<KeyBag>({ gemini: "", openai: "", deepseek: "", github1: "", github2: "", localServer: "" });
  const [knowledge, setKnowledge] = useState("");
  const [saved, setSaved] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setProvider(readProvider() as Provider);
    setBag(readKeys());
    try {
      setKnowledge(localStorage.getItem(KNOWLEDGE_KEY) ?? "");
    } catch {}
  }, []);

  function persist(next: { provider?: Provider; bag?: KeyBag; knowledge?: string }) {
    const p = next.provider ?? provider;
    const b = next.bag ?? bag;
    const k = next.knowledge ?? knowledge;
    setProvider(p);
    setBag(b);
    setKnowledge(k);
    try {
      localStorage.setItem(PROVIDER_KEY, p);
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(b));
      localStorage.setItem(KNOWLEDGE_KEY, k);
    } catch {}
    setSaved(true);
    setTimeout(() => setSaved(false), 1600);
  }

  const activeKey = provider === "gemini" ? bag.gemini : provider === "openai" ? bag.openai : provider === "deepseek" ? bag.deepseek : "";
  const keyMissing = provider !== "local" && !activeKey;

  return (
    <div className="flex h-full flex-col">
      <div className="shrink-0 border-b border-black/[0.06] bg-white/80 px-4 pb-2.5 pt-2 backdrop-blur-xl md:px-6">
        <div className="flex items-center gap-2">
          <div className="flex min-w-0 flex-1 gap-1 overflow-x-auto rounded-[16px] bg-black/[0.055] p-1 [scrollbar-width:none]">
            {ENGINES.map((e) => {
              const on = provider === e.id;
              const Icon = e.icon;
              return (
                <button
                  key={e.id}
                  onClick={() => persist({ provider: e.id })}
                  className={
                    "relative flex shrink-0 items-center gap-1.5 rounded-[12px] px-2.5 py-1.5 text-[12px] font-semibold transition-colors " +
                    (on ? "bg-white text-[#0A84FF] shadow-sm" : "text-[#6C6C70]")
                  }
                >
                  <Icon size={13} />
                  {e.label}
                </button>
              );
            })}
          </div>
          <button
            onClick={() => setOpen((v) => !v)}
            className="shrink-0 rounded-[12px] bg-black/[0.055] px-2.5 py-2 text-[12px] font-semibold text-[#1C1C1E]"
          >
            {saved ? <Check size={14} className="text-[#34C759]" /> : "Setup"}
          </button>
        </div>

        <p className="mt-1 px-1 text-[11px] text-[#8E8E93]">
          {ENGINES.find((e) => e.id === provider)?.note}
          {keyMissing ? " · add a key in Setup" : ""}
        </p>

        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-2 overflow-hidden rounded-[18px] border border-white/80 bg-white/70 p-3 shadow-[0_12px_28px_rgba(17,24,39,0.08)]"
          >
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#8E8E93]">Cloud key</p>
            <input
              type="password"
              value={provider === "gemini" ? bag.gemini : provider === "openai" ? bag.openai : bag.deepseek}
              onChange={(e) => persist({ bag: { ...bag, [provider === "local" ? "gemini" : provider]: e.target.value } })}
              placeholder={provider === "gemini" ? "Gemini API key · AIza…" : provider === "openai" ? "sk-…" : "DeepSeek key"}
              className="w-full rounded-[12px] bg-[#F2F2F7] px-3 py-2.5 text-[13px] text-[#1C1C1E] outline-none"
            />
            <p className="mb-1.5 mt-3 text-[11px] font-semibold uppercase tracking-wide text-[#8E8E93]">Self-hosted knowledge</p>
            <textarea
              value={knowledge}
              onChange={(e) => persist({ knowledge: e.target.value })}
              rows={3}
              placeholder="Company rules, visa steps, prices, tone rules… the built-in engine answers from this instantly, without any key."
              className="w-full resize-none rounded-[12px] bg-[#F2F2F7] px-3 py-2.5 text-[13px] leading-snug text-[#1C1C1E] outline-none"
            />
            <p className="mt-2 text-[11px] leading-snug text-[#8E8E93]">
              Keys stay on this device. Cloud replies use your key only when you pick that engine.
            </p>
          </motion.div>
        )}
      </div>

      <div className="min-h-0 flex-1">
        <ChatView />
      </div>
    </div>
  );
}
