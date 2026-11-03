import { NextResponse } from "next/server";
import { runAgent } from "@/lib/agent";
import { addMessage, getSession, listMessages, touchSession } from "@/lib/server/live";
import type { Block } from "@/lib/types";

export const dynamic = "force-dynamic";

type Provider = "gemini" | "openai" | "deepseek" | "local";

interface Body {
  sessionId?: string;
  message?: string;
  provider?: Provider;
  apiKey?: string;
  model?: string;
  repo?: { name?: string; branch?: string; language?: string | null; liveUrl?: string } | null;
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
  const prompt = [
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
