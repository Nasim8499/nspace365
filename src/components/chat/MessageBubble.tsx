"use client";

import { motion } from "framer-motion";
import { AlertTriangle, Check, ChevronRight, Info, Sparkles, SquareTerminal, XCircle } from "lucide-react";
import type { ReactNode } from "react";
import type { Block, ChatMessage } from "@/lib/types";
import CodeBlock from "./CodeBlock";

function inline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((p, i) => {
    if (p.startsWith("**")) return <strong key={i} className="font-semibold">{p.slice(2, -2)}</strong>;
    if (p.startsWith("`")) return <code key={i} className="rounded-md bg-black/[0.06] px-1.5 py-0.5 font-mono text-[0.88em]">{p.slice(1, -1)}</code>;
    return p;
  });
}

const sev = {
  high: { cls: "bg-[#FF3B30]/10 text-[#C4271D]", Icon: XCircle },
  medium: { cls: "bg-[#FF9500]/12 text-[#B36200]", Icon: AlertTriangle },
  low: { cls: "bg-[#007AFF]/10 text-[#0058B8]", Icon: Info },
} as const;

function BlockView({ block, onPrompt }: { block: Block; onPrompt: (p: string) => void }) {
  if (block.type === "tool") {
    return (
      <div className="overflow-hidden rounded-2xl border border-black/[0.07] bg-white">
        <div className="flex items-center gap-2 px-3 py-2">
          <span className={`grid h-5 w-5 place-items-center rounded-full ${block.status === "success" ? "bg-[#34C759] text-white" : "bg-[#FF3B30] text-white"}`}>
            <Check size={12} strokeWidth={3.5} />
          </span>
          <SquareTerminal size={14} className="text-[#8E8E93]" />
          <code className="min-w-0 flex-1 truncate font-mono text-[12.5px] font-medium text-[#1C1C1E]">{block.command}</code>
          <span className="text-[11px] font-semibold uppercase tracking-wide text-[#8E8E93]">{block.name.replace("_", " ")}</span>
        </div>
        <pre className="no-scrollbar overflow-x-auto whitespace-pre border-t border-black/[0.05] bg-[#FAFAFC] px-3 py-2 font-mono text-[12px] leading-relaxed text-[#3C3C43]/80">{block.output}</pre>
      </div>
    );
  }
  if (block.type === "diff") return <CodeBlock block={block} onDeploy={() => onPrompt("deploy")} />;
  if (block.type === "review") {
    return (
      <div className="space-y-2">
        {block.findings.map((f, i) => {
          const S = sev[f.severity];
          return (
            <div key={i} className="rounded-2xl border border-black/[0.07] bg-white p-3">
              <div className="flex items-center gap-2">
                <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold uppercase ${S.cls}`}>
                  <S.Icon size={12} /> {f.severity}
                </span>
                <p className="text-[14px] font-semibold text-[#1C1C1E]">{f.title}</p>
              </div>
              <p className="mt-1.5 text-[13.5px] leading-snug text-[#3C3C43]/80">{inline(f.detail)}</p>
              {f.line && <p className="mt-1.5 font-mono text-[11.5px] text-[#8E8E93]">{f.line}</p>}
            </div>
          );
        })}
      </div>
    );
  }
  return (
    <div className="flex flex-wrap gap-2">
      {block.items.map((a) => (
        <motion.button
          key={a.label}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.12, ease: "easeOut" }}
          onClick={() => onPrompt(a.prompt)}
          className="flex items-center gap-1 rounded-full border border-[#007AFF]/20 bg-white px-3.5 py-1.5 text-[13.5px] font-semibold text-[#007AFF] transition-colors hover:bg-[#007AFF]/5"
        >
          {a.label} <ChevronRight size={14} />
        </motion.button>
      ))}
    </div>
  );
}

export default function MessageBubble({ message, onPrompt, latest }: { message: ChatMessage; onPrompt: (p: string) => void; latest: boolean }) {
  if (message.role === "user") {
    return (
      <motion.div initial={{ opacity: 0, y: 10, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.2, ease: "easeOut" }} className="flex justify-end">
        <div className="max-w-[85%] whitespace-pre-wrap break-words rounded-[22px] rounded-br-lg bg-[#007AFF] px-4 py-2.5 text-[16px] leading-snug text-white shadow-[0_4px_14px_rgba(0,122,255,0.25)]">
          {message.content}
        </div>
      </motion.div>
    );
  }
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22, ease: "easeOut" }} className="flex gap-2.5">
      <span className="mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#007AFF] to-[#5AC8FA] text-white">
        <Sparkles size={14} />
      </span>
      <div className="min-w-0 max-w-[calc(100%-2.25rem)] flex-1 space-y-2.5">
        <div className="inline-block max-w-full rounded-[22px] rounded-tl-lg border border-black/5 bg-[#F2F2F7] px-4 py-2.5 text-[16px] leading-snug text-[#1C1C1E]">{inline(message.content)}</div>
        {message.blocks.map((b, i) => (
          <motion.div key={i} initial={latest ? { opacity: 0, y: 8 } : false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.24, ease: "easeOut", delay: latest ? 0.12 + i * 0.1 : 0 }}>
            <BlockView block={b} onPrompt={onPrompt} />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
