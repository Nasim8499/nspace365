"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, KeyRound, Lock, LogOut, Server, ShieldCheck, Unlock, UserRound, X } from "lucide-react";
import { useEffect, useState } from "react";
import { PROVIDER_KEY, readAdmin, readKeys, readProvider, readTone, SETTINGS_KEY, setAdmin, unlockAdmin, writeTone, type KeyBag } from "@/components/onboarding/Onboarding";
import { useStore } from "@/components/store";

type Provider = "local" | "gemini" | "openai" | "deepseek";

const FIELDS: { key: keyof KeyBag; label: string; hint: string; placeholder: string }[] = [
  { key: "gemini", label: "Gemini API key", hint: "Google AI Studio · generateContent", placeholder: "AIza…" },
  { key: "openai", label: "OpenAI API key", hint: "platform.openai.com · gpt-4o-mini", placeholder: "sk-…" },
  { key: "deepseek", label: "DeepSeek API key", hint: "platform.deepseek.com · deepseek-chat", placeholder: "sk-…" },
  { key: "github1", label: "GitHub account 1 token", hint: "snbwallet365-ops (optional override)", placeholder: "ghp_…" },
  { key: "github2", label: "GitHub account 2 token", hint: "Nasim8499 (optional override)", placeholder: "ghp_…" },
  { key: "localServer", label: "Local AI server", hint: "any device on your network", placeholder: "http://192.168.0.10:8787" }
];

export default function SettingsSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { role, user, signOutNow, apps } = useStore();
  const [tone, setTone] = useState<"concise" | "balanced" | "detailed">("balanced");
  const [bag, setBag] = useState<KeyBag>({ gemini: "", openai: "", deepseek: "", github1: "", github2: "", localServer: "" });
  const [provider, setProvider] = useState<Provider>("local");
  const [admin, setAdminState] = useState(false);
  const [pin, setPin] = useState("");
  const [pinNote, setPinNote] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!open) return;
    setBag(readKeys());
    setProvider(readProvider());
    setTone(readTone());
    setAdminState(readAdmin());
    setPin("");
    setPinNote(null);
    setSaved(false);
  }, [open]);

  function save() {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(bag));
      localStorage.setItem(PROVIDER_KEY, provider);
    } catch {}
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  }

  const mcpUrl = typeof window !== "undefined" ? `${window.location.origin}/api/mcp` : "/api/mcp";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[95] flex items-end justify-center sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/25 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ y: 40, scale: 0.98, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 30, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className="relative m-3 w-full max-w-[520px] overflow-hidden rounded-[28px] border border-white/80 bg-white/80 shadow-[0_30px_80px_rgba(17,24,39,0.25)] backdrop-blur-2xl"
          >
            <div className="flex items-center gap-2 border-b border-black/[0.06] px-5 py-4">
              <span className="grid h-8 w-8 place-items-center rounded-[11px] bg-gradient-to-br from-[#007AFF] to-[#5AC8FA] text-white">
                <KeyRound size={16} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-semibold tracking-tight text-[#1C1C1E]">Keys & connections</p>
                <p className="text-[11.5px] text-[#8E8E93]">{role === "admin" ? "Admin · full access" : role === "staff" ? "Staff · limited access" : "Stored only on this device"}</p>
              </div>
              <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full bg-black/[0.05] text-[#3C3C43]">
                <X size={15} />
              </button>
            </div>

            <div className="max-h-[62vh] overflow-y-auto px-5 py-4">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[#8E8E93]">AI provider</p>
              <div className="mb-4 grid grid-cols-4 gap-1.5 rounded-[16px] bg-black/[0.05] p-1">
                {(["local", "gemini", "openai", "deepseek"] as Provider[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => setProvider(p)}
                    className={`rounded-[12px] py-2 text-[12px] font-semibold capitalize transition ${
                      provider === p ? "bg-white text-[#1C1C1E] shadow-[0_2px_8px_rgba(0,0,0,0.10)]" : "text-[#6C6C70]"
                    }`}
                  >
                    {p === "local" ? "Built-in" : p}
                  </button>
                ))}
              </div>

              {FIELDS.map((f) => (
                <div key={f.key} className="mb-3">
                  <label className="mb-1 flex items-baseline justify-between">
                    <span className="text-[12.5px] font-semibold text-[#1C1C1E]">{f.label}</span>
                    <span className="text-[10.5px] text-[#AEAEB2]">{f.hint}</span>
                  </label>
                  <div className="flex items-center gap-2 rounded-[14px] border border-black/[0.06] bg-white/90 px-3">
                    <input
                      type="password"
                      value={bag[f.key]}
                      onChange={(e) => setBag({ ...bag, [f.key]: e.target.value })}
                      placeholder={f.placeholder}
                      className="w-full bg-transparent py-2.5 text-[13px] outline-none placeholder:text-[#C7C7CC]"
                    />
                  </div>
                </div>
              ))}

              <p className="mb-2 mt-1 text-[11px] font-semibold uppercase tracking-wide text-[#8E8E93]">Reply tone</p>
              <div className="mb-4 grid grid-cols-3 gap-1.5 rounded-[16px] bg-black/[0.05] p-1">
                {(["concise", "balanced", "detailed"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      setTone(t);
                      writeTone(t);
                    }}
                    className={`rounded-[12px] py-2 text-[12px] font-semibold capitalize transition ${
                      tone === t ? "bg-white text-[#1C1C1E] shadow-[0_2px_8px_rgba(0,0,0,0.10)]" : "text-[#6C6C70]"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div className="mb-4 rounded-[16px] border border-black/[0.06] bg-white/80 p-3">
                <p className="flex items-center gap-1.5 text-[12px] font-semibold text-[#1C1C1E]">
                  <UserRound size={13} /> Account
                </p>
                <p className="mt-1 truncate text-[11.5px] text-[#3C3C43]">
                  {user ? `${user.name} · ${user.email}` : "Not signed in"}
                  {user?.provider === "google" ? " · Google" : ""}
                </p>

                {admin ? (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <span className="flex items-center gap-1 rounded-full bg-[#34C759]/12 px-2.5 py-1 text-[11px] font-semibold text-[#1E8E3E]">
                      <Unlock size={11} /> Admin unlocked · {apps.length} projects
                    </span>
                    <button onClick={() => { setAdmin(false); setAdminState(false); }} className="rounded-full bg-black/[0.06] px-2.5 py-1 text-[11px] font-semibold text-[#1C1C1E]">
                      Lock
                    </button>
                    <button onClick={signOutNow} className="flex items-center gap-1 rounded-full bg-[#FF3B30]/10 px-2.5 py-1 text-[11px] font-semibold text-[#FF3B30]">
                      <LogOut size={11} /> Sign out
                    </button>
                  </div>
                ) : (
                  <div className="mt-2 flex items-center gap-1.5">
                    <div className="flex flex-1 items-center gap-1.5 rounded-[12px] bg-[#F2F2F7] px-2.5">
                      <Lock size={12} className="text-[#8E8E93]" />
                      <input
                        type="password"
                        value={pin}
                        onChange={(e) => setPin(e.target.value)}
                        placeholder="Admin PIN"
                        className="w-full bg-transparent py-2 text-[13px] outline-none"
                      />
                    </div>
                    <button
                      onClick={() => {
                        if (unlockAdmin(pin)) {
                          setAdminState(true);
                          setPinNote("Admin unlocked");
                        } else {
                          setPinNote("Wrong PIN");
                        }
                        setPin("");
                      }}
                      className="rounded-[12px] bg-[#0A84FF] px-3 py-2 text-[12px] font-semibold text-white"
                    >
                      Unlock
                    </button>
                  </div>
                )}
                {pinNote && <p className="mt-1.5 text-[11px] font-medium text-[#0A84FF]">{pinNote}</p>}
              </div>

              <div className="mt-5 rounded-[16px] border border-black/[0.06] bg-[#F2F2F7]/70 p-3">
                <p className="flex items-center gap-1.5 text-[12px] font-semibold text-[#1C1C1E]">
                  <Server size={13} /> MCP server
                </p>
                <code className="mt-1 block break-all text-[11px] text-[#3C3C43]">{mcpUrl}</code>
                <p className="mt-1 text-[11px] leading-snug text-[#8E8E93]">
                  Any MCP-capable agent can POST JSON-RPC here. Tools: list_apps, get_app, repo_stats, chat.
                </p>
              </div>

              <p className="mt-3 flex items-start gap-1.5 text-[11px] leading-snug text-[#8E8E93]">
                <ShieldCheck size={13} className="mt-[1px] shrink-0" />
                GitHub tokens are optional. Without them the dashboard reads the two accounts connected on the server.
              </p>
            </div>

            <div className="border-t border-black/[0.06] px-5 py-3">
              <button
                onClick={save}
                className="flex w-full items-center justify-center gap-1.5 rounded-[14px] bg-gradient-to-b from-[#0A84FF] to-[#0060DF] py-3 text-[15px] font-semibold text-white shadow-[0_10px_24px_rgba(0,96,223,0.3)]"
              >
                {saved ? <Check size={16} /> : null}
                {saved ? "Saved" : "Save keys"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
