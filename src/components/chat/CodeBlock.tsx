"use client";

import { motion } from "framer-motion";
import { Check, Copy, FileCode2, Rocket } from "lucide-react";
import { useState, type ReactNode } from "react";
import type { DiffBlock } from "@/lib/types";

const KEYWORDS = new Set([
  "const", "let", "var", "function", "return", "if", "else", "await", "async", "import", "from", "export", "default", "new", "throw", "try", "catch",
  "func", "final", "class", "struct", "pub", "fn", "use", "type", "interface", "extends", "for", "while", "in", "as", "self", "let", "mut", "nil", "err",
]);

const TOKEN = /(\/\/.*$|`(?:\\.|[^`])*`|"(?:\\.|[^"])*"|'(?:\\.|[^'])*'|\b\d+(?:\.\d+)?\b|\b[A-Za-z_]\w*\b)/g;

function highlight(line: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  TOKEN.lastIndex = 0;
  while ((m = TOKEN.exec(line))) {
    if (m.index > last) out.push(line.slice(last, m.index));
    const tok = m[0];
    let cls = "";
    if (tok.startsWith("//")) cls = "text-[#8E8E93] italic";
    else if (/^["'`]/.test(tok)) cls = "text-[#C4411F]";
    else if (/^\d/.test(tok)) cls = "text-[#1C7C54]";
    else if (KEYWORDS.has(tok)) cls = "text-[#AD3DA4] font-medium";
    else if (/^[A-Z]/.test(tok)) cls = "text-[#3E6FA8]";
    out.push(cls ? <span key={m.index} className={cls}>{tok}</span> : tok);
    last = m.index + tok.length;
  }
  if (last < line.length) out.push(line.slice(last));
  return out;
}

export default function CodeBlock({ block, onDeploy }: { block: DiffBlock; onDeploy?: () => void }) {
  const [copied, setCopied] = useState(false);
  const lines = block.code.split("\n");
  const added = lines.filter((l) => l.startsWith("+")).length;
  const removed = lines.filter((l) => l.startsWith("-")).length;

  const copy = async () => {
    const clean = lines.filter((l) => !l.startsWith("@@") && !l.startsWith("-")).map((l) => (l.startsWith("+") ? l.slice(1) : l.slice(1))).join("\n");
    try {
      await navigator.clipboard.writeText(clean);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {}
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-black/[0.07] bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-black/[0.06] bg-[#FAFAFC] px-3 py-2">
        <FileCode2 size={15} className="shrink-0 text-[#8E8E93]" />
        <span className="min-w-0 flex-1 truncate font-mono text-[12.5px] text-[#1C1C1E]">{block.filename}</span>
        <span className="hidden font-mono text-[11.5px] sm:inline">
          <span className="text-[#1C7C54]">+{added}</span> <span className="text-[#C4271D]">−{removed}</span>
        </span>
        <motion.button whileTap={{ scale: 0.92 }} transition={{ duration: 0.12, ease: "easeOut" }} onClick={copy} className="flex h-7 items-center gap-1 rounded-full bg-[#F2F2F7] px-2.5 text-[12px] font-semibold text-[#007AFF]" aria-label="Copy code">
          {copied ? <Check size={13} /> : <Copy size={13} />} {copied ? "Copied" : "Copy"}
        </motion.button>
        {block.deployable && onDeploy && (
          <motion.button whileTap={{ scale: 0.92 }} transition={{ duration: 0.12, ease: "easeOut" }} onClick={onDeploy} className="flex h-7 items-center gap-1 rounded-full bg-[#007AFF] px-2.5 text-[12px] font-semibold text-white" aria-label="Deploy">
            <Rocket size={13} /> Deploy
          </motion.button>
        )}
      </div>
      <pre className="no-scrollbar overflow-x-auto py-1.5 font-mono text-[12.5px] leading-[1.65] text-[#1C1C1E]">
        {lines.map((l, i) => {
          const hunk = l.startsWith("@@");
          const add = l.startsWith("+");
          const del = l.startsWith("-");
          return (
            <div key={i} className={`flex min-w-max px-3 ${hunk ? "bg-[#007AFF]/[0.07] text-[#007AFF]" : add ? "bg-[#34C759]/[0.13]" : del ? "bg-[#FF3B30]/[0.10]" : ""}`}>
              <span className={`mr-3 w-3 select-none ${add ? "text-[#1C7C54]" : del ? "text-[#C4271D]" : "text-[#C7C7CC]"}`}>{hunk ? "" : add ? "+" : del ? "−" : " "}</span>
              <code>{hunk ? l : highlight(l.slice(1))}</code>
            </div>
          );
        })}
      </pre>
    </div>
  );
}
