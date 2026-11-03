"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp, GitBranch, GitCommitHorizontal, GitPullRequestArrow, PanelLeft, Rocket, ScanSearch, SquarePen, Upload, Sparkles } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useStore } from "@/components/store";
import { readKeys, readProvider } from "@/components/onboarding/Onboarding";
import type { ChatMessage, ChatSession } from "@/lib/types";
import ChatDrawer from "./ChatDrawer";
import MessageBubble from "./MessageBubble";

const QUICK = [
  { label: "git pull", prompt: "git pull", icon: GitPullRequestArrow },
  { label: "Commit", prompt: 'git commit -m "feat: polish glass surfaces"', icon: GitCommitHorizontal },
  { label: "Push", prompt: "git push", icon: Upload },
  { label: "New branch", prompt: "Create branch feature/liquid-glass", icon: GitBranch },
  { label: "Review", prompt: "Review my latest changes", icon: ScanSearch },
  { label: "Deploy", prompt: "deploy", icon: Rocket },
];

export default function ChatView() {
  const { apps, chatRepoRequest, clearChatRequest, toast } = useStore();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [ready, setReady] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  const active = sessions.find((s) => s.id === activeId) ?? null;
  const repo = apps.find((a) => a.id === active?.pinnedRepoId);

  const loadMessages = useCallback(async (id: string) => {
    const r = await fetch(`/api/sessions/${id}`, { cache: "no-store" });
    const d = (await r.json()) as { messages?: ChatMessage[] };
    setMessages(d.messages ?? []);
  }, []);

  const createSession = useCallback(async (pinnedRepoId: string | null = null) => {
    const r = await fetch("/api/sessions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ pinnedRepoId }) });
    const d = (await r.json()) as { session: ChatSession };
    setSessions((s) => [d.session, ...s]);
    setActiveId(d.session.id);
    setMessages([]);
    return d.session;
  }, []);

  // initial load
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const r = await fetch("/api/sessions", { cache: "no-store" });
        const d = (await r.json()) as { sessions: ChatSession[] };
        if (!alive) return;
        if (d.sessions.length) {
          setSessions(d.sessions);
          setActiveId(d.sessions[0].id);
          await loadMessages(d.sessions[0].id);
        } else {
          await createSession();
        }
      } catch {
        toast("Could not load chats");
      } finally {
        if (alive) setReady(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, [loadMessages, createSession, toast]);

  // "Ask AI" from a repo
  useEffect(() => {
    if (!ready || !chatRepoRequest) return;
    const { repoId } = chatRepoRequest;
    clearChatRequest();
    const name = apps.find((a) => a.id === repoId)?.name ?? "repo";
    void createSession(repoId).then(() => toast(`Pinned ${name}`));
  }, [ready, chatRepoRequest, clearChatRequest, createSession, apps, toast]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, sending]);

  const send = useCallback(
    async (text: string) => {
      const msg = text.trim();
      if (!msg || sending) return;
      let sid = activeId;
      if (!sid) sid = (await createSession()).id;
      setInput("");
      if (taRef.current) taRef.current.style.height = "auto";
      const temp: ChatMessage = { id: `tmp-${Date.now()}`, sessionId: sid, role: "user", content: msg, blocks: [], createdAt: new Date().toISOString() };
      setMessages((m) => [...m, temp]);
      setSending(true);
      const keys = readKeys();
      const provider = readProvider();
      const apiKey = provider === "gemini" ? keys.gemini : provider === "openai" ? keys.openai : provider === "deepseek" ? keys.deepseek : "";
      const localServer = (keys.localServer || "").trim().replace(/\/$/, "");
      const repoPayload = repo ? { name: repo.name, branch: repo.meta.branch, language: repo.meta.language, liveUrl: repo.url } : null;

      if (localServer && provider === "local") {
        try {
          const local = await fetch(`${localServer}/api/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionId: sid, message: msg, provider: "local", repo: repoPayload }),
          });
          if (local.ok) {
            const ld = (await local.json()) as { assistantMessage?: { content?: string; blocks?: unknown[] } };
            const text = ld.assistantMessage?.content ?? "";
            if (text) {
              setMessages((m) => [
                ...m.filter((x) => x.id !== temp.id),
                { ...temp, role: "user", content: msg },
                { id: `local-${Date.now()}`, sessionId: sid, role: "assistant", content: text, blocks: (ld.assistantMessage?.blocks as never) ?? [], createdAt: new Date().toISOString() },
              ]);
              setSending(false);
              return;
            }
          }
        } catch {
          /* local instance offline — fall through to the hosted API */
        }
      }

      try {
        const [res] = await Promise.all([
          fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
            sessionId: sid,
            message: msg,
            provider,
            apiKey,
            repo: repoPayload,
          }) }),
          new Promise((r) => setTimeout(r, 700)),
        ]);
        const d = (await res.json()) as { userMessage: ChatMessage; assistantMessage: ChatMessage; session: ChatSession; error?: string };
        if (!res.ok) throw new Error(d.error ?? "Failed");
        setMessages((m) => [...m.filter((x) => x.id !== temp.id), d.userMessage, d.assistantMessage]);
        setSessions((s) => s.map((x) => (x.id === d.session.id ? d.session : x)));
      } catch {
        setMessages((m) => m.filter((x) => x.id !== temp.id));
        toast("Message failed — try again");
        setInput(msg);
      } finally {
        setSending(false);
      }
    },
    [activeId, sending, createSession, toast],
  );

  const patch = async (id: string, body: Record<string, unknown>) => {
    const r = await fetch(`/api/sessions/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const d = (await r.json()) as { session?: ChatSession };
    if (d.session) setSessions((s) => s.map((x) => (x.id === d.session!.id ? d.session! : x)));
  };

  const del = async (id: string) => {
    await fetch(`/api/sessions/${id}`, { method: "DELETE" });
    const rest = sessions.filter((s) => s.id !== id);
    setSessions(rest);
    if (id === activeId) {
      if (rest.length) {
        setActiveId(rest[0].id);
        await loadMessages(rest[0].id);
      } else {
        await createSession();
      }
    }
  };

  const selectSession = async (id: string) => {
    setActiveId(id);
    setDrawer(false);
    setMessages([]);
    await loadMessages(id);
  };

  return (
    <div className="relative flex h-full flex-col bg-[#FFFFFF] lg:pl-[112px]">
      {/* chat header */}
      <div className="flex shrink-0 items-center gap-2 border-b border-black/[0.05] px-3 py-2 md:px-6">
        <button onClick={() => setDrawer(true)} aria-label="Open chats" className="grid h-9 w-9 place-items-center rounded-full bg-[#F2F2F7] text-[#1C1C1E] transition-colors hover:bg-[#E9E9EF]">
          <PanelLeft size={18} />
        </button>
        <div className="min-w-0 flex-1 text-center">
          <p className="truncate text-[16px] font-semibold">{active?.title ?? "AI Terminal"}</p>
          <p className="flex items-center justify-center gap-1 truncate text-[12px] text-[#8E8E93]">
            <GitBranch size={11} className="text-[#007AFF]" />
            <span className="font-mono text-[#007AFF]">{active?.branch ?? "main"}</span>
            <span>·</span>
            <span className="truncate">{repo ? repo.meta.fullName : "no repo pinned"}</span>
          </p>
        </div>
        <button onClick={() => createSession(active?.pinnedRepoId ?? null)} aria-label="New chat" className="grid h-9 w-9 place-items-center rounded-full bg-[#F2F2F7] text-[#007AFF] transition-colors hover:bg-[#E9E9EF]">
          <SquarePen size={17} />
        </button>
      </div>

      {/* messages */}
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 md:px-6">
        <div className="mx-auto max-w-3xl space-y-4 py-5">
          {ready && messages.length === 0 && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.26, ease: "easeOut" }} className="flex flex-col items-center pt-8 text-center sm:pt-14">
              <span className="grid h-16 w-16 place-items-center rounded-[22px] bg-gradient-to-br from-[#007AFF] to-[#5AC8FA] text-white shadow-[0_12px_32px_rgba(0,122,255,0.3)]">
                <Sparkles size={30} />
              </span>
              <h2 className="mt-5 text-[28px] font-bold tracking-tight">What should we ship today?</h2>
              <p className="mt-1.5 max-w-md text-[15px] text-[#8E8E93]">Run Git operations and code reviews in plain language. {repo ? `Working in ${repo.name}.` : "Pin a repo from the drawer for context."}</p>
              <div className="mt-7 grid w-full max-w-xl grid-cols-2 gap-2.5">
                {QUICK.slice(0, 4).map((q, i) => (
                  <motion.button
                    key={q.label}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22, ease: "easeOut", delay: 0.06 * i }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => send(q.prompt)}
                    className="flex items-center gap-2.5 rounded-2xl border border-black/[0.06] bg-white p-3.5 text-left shadow-sm transition-colors hover:bg-[#F2F2F7]"
                  >
                    <q.icon size={18} className="shrink-0 text-[#007AFF]" />
                    <span>
                      <span className="block text-[14.5px] font-semibold text-black">{q.label}</span>
                      <span className="block truncate font-mono text-[11.5px] text-[#8E8E93]">{q.prompt}</span>
                    </span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {messages.map((m, i) => (
            <MessageBubble key={m.id} message={m} onPrompt={send} latest={i === messages.length - 1} />
          ))}

          <AnimatePresence>
            {sending && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18, ease: "easeOut" }} className="flex gap-2.5">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#007AFF] to-[#5AC8FA] text-white"><Sparkles size={14} /></span>
                <div className="flex items-center gap-1 rounded-[22px] rounded-tl-lg border border-black/5 bg-[#F2F2F7] px-4 py-3.5">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="typing-dot h-2 w-2 rounded-full bg-[#8E8E93]" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={endRef} />
        </div>
      </div>

      {/* composer */}
      <div className="shrink-0 px-3 pb-[calc(var(--safe-bottom)+5.75rem)] pt-2 md:px-6 lg:pb-5">
        <div className="mx-auto max-w-3xl">
          <div className="no-scrollbar -mx-1 mb-2 flex gap-2 overflow-x-auto px-1">
            {QUICK.map((q) => (
              <motion.button
                key={q.label}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.12, ease: "easeOut" }}
                onClick={() => send(q.prompt)}
                disabled={sending}
                className="flex shrink-0 items-center gap-1.5 rounded-full border border-black/[0.06] bg-white px-3 py-1.5 text-[13px] font-semibold text-[#1C1C1E] shadow-sm transition-colors hover:bg-[#F2F2F7] disabled:opacity-50"
              >
                <q.icon size={14} className="text-[#007AFF]" /> {q.label}
              </motion.button>
            ))}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void send(input);
            }}
            className="flex items-end gap-2 rounded-[26px] border border-black/[0.06] bg-[#F2F2F7] p-1.5 pl-4 transition-shadow focus-within:shadow-[0_0_0_3px_rgba(0,122,255,0.2)]"
          >
            <textarea
              ref={taRef}
              value={input}
              rows={1}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = Math.min(e.target.scrollHeight, 140) + "px";
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send(input);
                }
              }}
              placeholder="Message N Terminal…  try “git pull”"
              aria-label="Message"
              className="max-h-[140px] min-h-[40px] flex-1 resize-none bg-transparent py-2.5 text-[16px] leading-snug text-[#1C1C1E] outline-none placeholder:text-[#8E8E93]"
            />
            <motion.button
              type="submit"
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.12, ease: "easeOut" }}
              disabled={!input.trim() || sending}
              aria-label="Send"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#007AFF] text-white transition-opacity disabled:bg-[#C7C7CC]"
            >
              <ArrowUp size={20} strokeWidth={2.8} />
            </motion.button>
          </form>
        </div>
      </div>

      <ChatDrawer
        open={drawer}
        onClose={() => setDrawer(false)}
        sessions={sessions}
        activeId={activeId}
        onSelect={selectSession}
        onNew={async () => {
          await createSession(active?.pinnedRepoId ?? null);
          setDrawer(false);
        }}
        onDelete={del}
        onTogglePin={(s) => patch(s.id, { pinned: !s.pinned })}
        onPinRepo={(rid) => active && patch(active.id, { pinnedRepoId: rid })}
      />
    </div>
  );
}
