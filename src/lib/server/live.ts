import type { ChatSession, GithubState, StoreApp } from "@/lib/types";

/**
 * Live data layer — no database required.
 * Repositories come straight from the connected GitHub accounts on every
 * request (with a short in-memory cache), so the store is always current.
 */

interface GhRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  has_pages?: boolean;
  language: string | null;
  topics?: string[];
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  default_branch: string;
  pushed_at: string;
  size: number;
  private: boolean;
  fork?: boolean;
  owner: { login: string; avatar_url: string };
}

export interface Account {
  label: string;
  token: string;
}

export function accounts(): Account[] {
  const list: Account[] = [];
  const a = process.env.GITHUB_TOKEN_SNB || process.env.GITHUB_TOKEN_1;
  const b = process.env.GITHUB_TOKEN_NASIM || process.env.GITHUB_TOKEN_2;
  if (a) list.push({ label: "snbwallet365-ops", token: a });
  if (b) list.push({ label: "Nasim8499", token: b });
  if (!list.length && process.env.GITHUB_TOKEN) list.push({ label: "github", token: process.env.GITHUB_TOKEN });
  return list;
}

const PALETTE = [
  ["#007AFF", "#5AC8FA"],
  ["#8B5CF6", "#C084FC"],
  ["#34C759", "#A3E635"],
  ["#FF9F0A", "#FFD60A"],
  ["#FF375F", "#FF6482"],
  ["#14B8A6", "#22D3EE"],
  ["#636366", "#8E8E93"],
  ["#5E5CE6", "#BF5AF2"],
];

function palette(seed: string) {
  let h = 7;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 100000;
  return PALETTE[h % PALETTE.length];
}

const GENRES: Record<string, string> = {
  TypeScript: "Developer Tools",
  JavaScript: "Developer Tools",
  Python: "Automation",
  HTML: "Web App",
  CSS: "Web App",
  Vue: "Web App",
  Shell: "Utilities",
};

export function repoToApp(r: GhRepo, index: number): StoreApp {
  const [c1, c2] = palette(r.full_name);
  const live =
    r.homepage && /^https?:\/\//.test(r.homepage)
      ? r.homepage
      : `https://${r.name.toLowerCase().replace(/[^a-z0-9-]/g, "-")}.vercel.app`;
  return {
    id: `gh:${r.full_name}`,
    name: r.name.replace(/[-_]/g, " ").replace(/\b\w/g, (m) => m.toUpperCase()),
    subtitle: r.description?.slice(0, 80) || `${r.owner.login} · ${r.language || "Project"}`,
    category: /game|play|arcade|quiz|runner|puzzle|blast|drift/i.test(`${r.name} ${r.description ?? ""}`) ? "games" : "apps",
    genre: GENRES[r.language || ""] || "Project",
    description: r.description || `${r.name} — synced live from github.com/${r.full_name}.`,
    color1: c1,
    color2: c2,
    icon: r.name.slice(0, 1).toUpperCase(),
    rating: Math.min(5, 3.8 + ((r.stargazers_count % 12) / 10)),
    ratings: 40 + (r.stargazers_count % 900),
    size: `${Math.max(1, Math.round(r.size / 1024))} MB`,
    age: "4+",
    version: `1.0.${(r.stargazers_count % 40) + (r.open_issues_count % 9)}`,
    developer: r.owner.login,
    changelog: `Latest push ${new Date(r.pushed_at).toLocaleDateString()} · branch ${r.default_branch}.`,
    badge: r.private ? "Private" : index < 3 ? "New" : null,
    url: live,
    source: "github",
    status: "available",
    meta: {
      fullName: r.full_name,
      branch: r.default_branch,
      pushedAt: r.pushed_at,
      stars: r.stargazers_count,
      forks: r.forks_count,
      language: r.language,
      topics: r.topics || [],
      htmlUrl: r.html_url,
      liveUrl: live,
      iconUrl: `/api/favicon?u=${encodeURIComponent(live)}&name=${encodeURIComponent(r.full_name)}`,
      iconFallback: `/api/icon/${encodeURIComponent(r.full_name)}?c1=${c1.replace("#", "")}&c2=${c2.replace("#", "")}`,
      previewUrl: live,
      private: r.private,
      openIssues: r.open_issues_count,
      account: r.owner.login,
    },
    sortOrder: index,
    updatedAt: r.pushed_at,
  };
}

let cache: { at: number; apps: StoreApp[]; state: GithubState } | null = null;
const TTL = 45_000;

export async function liveApps(): Promise<{ apps: StoreApp[]; github: GithubState }> {
  if (cache && Date.now() - cache.at < TTL) return { apps: cache.apps, github: cache.state };

  const list = accounts();
  const collected: StoreApp[] = [];
  let login: string | undefined;
  let avatar: string | undefined;
  let lastPush = 0;

  for (const acc of list) {
    try {
      const res = await fetch("https://api.github.com/user/repos?per_page=100&sort=pushed&affiliation=owner%2Ccollaborator%2Corganization_member", {
        headers: {
          Authorization: `Bearer ${acc.token}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
        cache: "no-store",
      });
      if (!res.ok) continue;
      const repos = (await res.json()) as GhRepo[];
      if (!Array.isArray(repos)) continue;
      repos
        .filter((r) => !r.fork)
        .sort((a, b) => +new Date(b.pushed_at) - +new Date(a.pushed_at))
        .forEach((r) => {
          collected.push(repoToApp(r, collected.length));
          const t = +new Date(r.pushed_at);
          if (t > lastPush) lastPush = t;
          if (!login) login = r.owner.login;
          if (!avatar) avatar = r.owner.avatar_url;
        });
    } catch {
      continue;
    }
  }

  const state: GithubState = collected.length
    ? {
        connected: true,
        login: list.map((a) => a.label).join(" + "),
        avatar,
        lastSync: new Date().toISOString(),
        repoCount: collected.length,
        mode: "token",
      }
    : { connected: false, mode: "demo", lastSync: new Date().toISOString(), repoCount: 0 };

  const apps = collected;
  cache = { at: Date.now(), apps, state };
  return { apps, github: state };
}

export function findApp(apps: StoreApp[], id: string) {
  return apps.find((a) => a.id === id) ?? null;
}

/* ---------- in-memory chat sessions (stateless host friendly) ---------- */

interface MemMessage {
  id: number;
  sessionId: string;
  role: "user" | "assistant";
  content: string;
  blocks: unknown[];
  createdAt: string;
}

interface MemStore {
  sessions: Map<string, ChatSession>;
  messages: Map<string, MemMessage[]>;
  seq: number;
}

const g = globalThis as unknown as { __nsStore?: MemStore };
const mem: MemStore =
  g.__nsStore ??
  (g.__nsStore = {
    sessions: new Map(),
    messages: new Map(),
    seq: 0,
  });

export function listSessions(): ChatSession[] {
  return [...mem.sessions.values()].sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt));
}

export function createSession(pinnedRepoId: string | null, title = "New chat"): ChatSession {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const session: ChatSession = {
    id,
    title,
    pinnedRepoId,
    branch: "main",
    pinned: false,
    createdAt: now,
    updatedAt: now,
  };
  mem.sessions.set(id, session);
  mem.messages.set(id, []);
  return session;
}

export function getSession(id: string) {
  return mem.sessions.get(id) ?? null;
}

export function listMessages(id: string) {
  return mem.messages.get(id) ?? [];
}

export function addMessage(m: Omit<MemMessage, "id" | "createdAt">) {
  const msg: MemMessage = { ...m, id: ++mem.seq, createdAt: new Date().toISOString() };
  mem.messages.set(m.sessionId, [...(mem.messages.get(m.sessionId) ?? []), msg]);
  return msg;
}

export function touchSession(id: string, patch: Partial<ChatSession>) {
  const s = mem.sessions.get(id);
  if (!s) return null;
  const next = { ...s, ...patch, updatedAt: new Date().toISOString() };
  mem.sessions.set(id, next);
  return next;
}
