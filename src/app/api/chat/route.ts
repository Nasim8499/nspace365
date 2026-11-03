import { NextResponse } from "next/server";
import { runAgent } from "@/lib/agent";
import { addMessage, getSession, listMessages, touchSession } from "@/lib/server/live";
import { knowledgeAnswer } from "@/lib/server/knowledge";
import type { Block } from "@/lib/types";

export const dynamic = "force-dynamic";

type Provider = "gemini" | "openai" | "deepseek" | "local";

interface Body {
  sessionId?: string;
  message?: string;
  provider?: Provider;
  apiKey?: string;
  model?: string;
  tone?: "concise" | "balanced" | "detailed";
  repo?: { name?: string; branch?: string; language?: string | null; liveUrl?: string } | null;
  knowledge?: string;
}

const SYSTEMS: Record<string, string> = {
  gemini: "You are the N Space build agent. Answer briefly and concretely about repositories, deployments and code changes.",
  openai: "You are the N Space build agent. Answer briefly and concretely about repositories, deployments and code changes.",
  deepseek: "You are the N Space build agent. Answer briefly and concretely about repositories, deployments and code changes."
};

async function callLLM(provider: Exclude<Provider, "local">, key: string, model: string, prompt: string) {
  if (provider === "gemini") {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEMS.gemini }] },
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.4, maxOutputTokens: 900 }
        }),
        cache: "no-store"
      }
    );
    if (!res.ok) throw new Error(`Gemini ${res.status}`);
    const d = await res.json();
    const parts = d?.candidates?.[0]?.content?.parts ?? [];
    return parts.map((p: { text?: string }) => p.text ?? "").join("").trim();
  }

  const url = provider === "openai" ? "https://api.openai.com/v1/chat/completions" : "https://api.deepseek.com/chat/completions";
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: SYSTEMS[provider] },
        { role: "user", content: prompt }
      ],
      temperature: 0.4,
      max_tokens: 900
    }),
    cache: "no-store"
  });
  if (!res.ok) throw new Error(`${provider} ${res.status}`);
  const d = await res.json();
  return String(d?.choices?.[0]?.message?.content ?? "").trim();
}


function pickNotes(notes: string, query: string): string {
  const lines = notes
    .split(/[\n•]+/)
    .map((l) => l.trim())
    .filter((l) => l.length > 2);
  if (!lines.length) return "";
  const words = query
    .toLowerCase()
    .split(/[^a-z0-9\u0980-\u09FF]+/)
    .filter((w) => w.length > 2);
  const scored = lines
    .map((line) => {
      const low = line.toLowerCase();
      const hits = words.filter((w) => low.includes(w)).length;
      return { line, hits };
    })
    .sort((a, b) => b.hits - a.hits);
  const best = scored.slice(0, 3).filter((s) => s.hits > 0);
  const chosen = best.length ? best : scored.slice(0, 2);
  return chosen.map((c) => c.line).join("\n");
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as Body;
  const text = body.message?.trim();
  if (!text) return NextResponse.json({ error: "message is required" }, { status: 400 });

  const session = (body.sessionId && getSession(body.sessionId)) || null;
  const sessionId = session?.id ?? body.sessionId ?? "local";

  if (session) addMessage({ sessionId, role: "user", content: text, blocks: [] });

  const provider = (body.provider ?? "local") as Provider;
  const key = body.apiKey?.trim();
  const model =
    body.model?.trim() ||
    (provider === "gemini" ? "gemini-2.0-flash" : provider === "openai" ? "gpt-4o-mini" : "deepseek-chat");

  const repo = body.repo ?? (session?.pinnedRepoId ? { name: session.pinnedRepoId } : null);
  const notes = String(body.knowledge ?? "").slice(0, 4000).trim();
  const prompt = [
    notes ? `Owner knowledge (authoritative):\n${notes}` : "",
    repo?.name ? `Repository: ${repo.name}${repo.branch ? ` (branch ${repo.branch})` : ""}` : "",
    `Request: ${text}`
  ]
    .filter(Boolean)
    .join("\n");

  let content = "";
  let blocks: Block[] = [];
  let used = "local";

  if (key && provider !== "local") {
    try {
      content = (await callLLM(provider, key, model, prompt)) || "";
      used = provider;
    } catch (err) {
      content = "";
      used = `${provider}-error:${(err as Error).message}`;
    }
  }

  const tone = (body.tone ?? "balanced") as "concise" | "balanced" | "detailed";

  if (!content && (provider === "local" || !key)) {
    const kb = knowledgeAnswer(text, tone, { repo: repo?.name ?? null });
    const noteHit = pickNotes(notes, text);
    if (noteHit) {
      const generic = /I can help with the workspace itself/i.test(kb ?? "");
      content = [noteHit, generic ? "" : kb].filter(Boolean).join("\n\n");
      used = "knowledge+notes";
    } else if (kb) {
      content = kb;
      used = "knowledge";
    }
  }

  if (!content) {
    const result = runAgent({
      text,
      branch: session?.branch ?? "main",
      ahead: 0,
      repo: repo?.name
        ? {
            name: repo.name,
            language: repo.language ?? null,
            defaultBranch: repo.branch ?? "main",
            liveUrl: repo.liveUrl
          }
        : null
    });
    content = result.content;
    blocks = result.blocks;
    if (!key) used = "built-in";
  }

  const assistant = addMessage({ sessionId, role: "assistant", content, blocks });
  const updated = session ? touchSession(session.id, { title: session.title === "New chat" ? text.slice(0, 40) : session.title }) : null;

  return NextResponse.json({
    userMessage: { id: assistant.id - 1, sessionId, role: "user", content: text, blocks: [], createdAt: assistant.createdAt },
    assistantMessage: assistant,
    session: updated,
    provider: used,
    history: session ? listMessages(sessionId) : []
  });
}

export async function GET() {
  return NextResponse.json({
    providers: ["gemini", "openai", "deepseek", "local"],
    note: "Send { message, provider, apiKey, model, sessionId } to chat with your own key."
  });
}
