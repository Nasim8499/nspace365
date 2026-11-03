import { NextResponse } from "next/server";
import { liveApps } from "@/lib/server/live";

export const dynamic = "force-dynamic";

/**
 * Minimal Model Context Protocol server over HTTP (JSON-RPC 2.0).
 * Any MCP-capable agent can POST here to list and read the app catalogue.
 */
const TOOLS = [
  {
    name: "list_apps",
    description: "List every app / repository in the N Space dashboard with live URL and metadata.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Optional text filter on name, description or language" },
        limit: { type: "number", description: "Max results (default 50)" }
      }
    }
  },
  {
    name: "get_app",
    description: "Get one app by id, e.g. gh:owner/repo.",
    inputSchema: {
      type: "object",
      properties: { id: { type: "string" } },
      required: ["id"]
    }
  },
  {
    name: "repo_stats",
    description: "Totals for the connected GitHub accounts: repo count, languages, latest push.",
    inputSchema: { type: "object", properties: {} }
  },
  {
    name: "chat",
    description: "Send a prompt to the N Space build agent and get a short answer.",
    inputSchema: {
      type: "object",
      properties: {
        message: { type: "string" },
        provider: { type: "string", enum: ["gemini", "openai", "deepseek", "local"] },
        apiKey: { type: "string" },
        model: { type: "string" }
      },
      required: ["message"]
    }
  }
];

type Rpc = { jsonrpc?: string; id?: string | number | null; method?: string; params?: Record<string, unknown> };

const ok = (id: Rpc["id"], result: unknown) => ({ jsonrpc: "2.0", id: id ?? null, result });
const err = (id: Rpc["id"], code: number, message: string) => ({ jsonrpc: "2.0", id: id ?? null, error: { code, message } });

async function handle(rpc: Rpc, origin: string) {
  const id = rpc.id;
  switch (rpc.method) {
    case "initialize":
      return ok(id, {
        protocolVersion: "2025-06-18",
        capabilities: { tools: { listChanged: false } },
        serverInfo: { name: "nspace-dashboard", version: "1.0.0" }
      });
    case "notifications/initialized":
    case "initialized":
      return ok(id, {});
    case "ping":
      return ok(id, {});
    case "tools/list":
      return ok(id, { tools: TOOLS });
    case "tools/call": {
      const params = rpc.params ?? {};
      const name = String(params.name ?? "");
      const args = (params.arguments ?? {}) as Record<string, unknown>;
      const { apps, github } = await liveApps();

      if (name === "list_apps") {
        const q = String(args.query ?? "").toLowerCase();
        const limit = Number(args.limit ?? 50);
        const items = apps
          .filter((a) => !q || `${a.name} ${a.description} ${a.genre}`.toLowerCase().includes(q))
          .slice(0, limit)
          .map((a) => ({
            id: a.id,
            name: a.name,
            liveUrl: a.url,
            repo: a.meta.fullName ?? null,
            language: a.meta.language ?? null,
            stars: a.meta.stars ?? 0,
            pushedAt: a.meta.pushedAt ?? a.updatedAt
          }));
        return ok(id, { content: [{ type: "text", text: JSON.stringify({ total: apps.length, connected: github.connected, items }, null, 2) }] });
      }

      if (name === "get_app") {
        const app = apps.find((a) => a.id === String(args.id ?? ""));
        return ok(id, {
          content: [{ type: "text", text: app ? JSON.stringify(app, null, 2) : `No app with id ${String(args.id ?? "")}` }]
        });
      }

      if (name === "repo_stats") {
        const langs: Record<string, number> = {};
        let latest = 0;
        for (const a of apps) {
          const l = String(a.meta.language ?? "unknown");
          langs[l] = (langs[l] ?? 0) + 1;
          const t = +new Date(String(a.meta.pushedAt ?? a.updatedAt));
          if (t > latest) latest = t;
        }
        return ok(id, {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                { connected: github.connected, accounts: github.login, repos: github.repoCount ?? apps.length, languages: langs, latestPush: latest ? new Date(latest).toISOString() : null },
                null,
                2
              )
            }
          ]
        });
      }

      if (name === "chat") {
        const res = await fetch(`${origin}/api/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: String(args.message ?? ""),
            provider: args.provider ?? "local",
            apiKey: args.apiKey,
            model: args.model
          }),
          cache: "no-store"
        });
        const d = (await res.json()) as { assistantMessage?: { content?: string } };
        return ok(id, { content: [{ type: "text", text: d.assistantMessage?.content ?? "(no answer)" }] });
      }

      return err(id, -32601, `Unknown tool: ${name}`);
    }
    default:
      return err(id, -32601, `Unknown method: ${rpc.method ?? "(none)"}`);
  }
}

export async function POST(req: Request) {
  const origin = new URL(req.url).origin;
  const body = (await req.json().catch(() => null)) as Rpc | Rpc[] | null;
  if (!body) return NextResponse.json(err(null, -32700, "Parse error"), { status: 400 });

  const out = Array.isArray(body) ? await Promise.all(body.map((r) => handle(r, origin))) : await handle(body, origin);
  return NextResponse.json(out, {
    headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "*" }
  });
}

export async function GET(req: Request) {
  const origin = new URL(req.url).origin;
  return NextResponse.json({
    name: "nspace-dashboard",
    protocol: "MCP 2025-06-18 over JSON-RPC 2.0 (HTTP POST)",
    endpoint: `${origin}/api/mcp`,
    tools: TOOLS.map((t) => t.name),
    example: {
      jsonrpc: "2.0",
      id: 1,
      method: "tools/list"
    }
  });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Accept, MCP-Protocol-Version"
    }
  });
}
