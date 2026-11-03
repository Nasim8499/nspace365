export type Category = "games" | "apps" | "arcade" | "developer";
export type AppStatus = "available" | "installed" | "update";

export interface RepoMeta {
  fullName?: string;
  branch?: string;
  pushedAt?: string;
  stars?: number;
  forks?: number;
  language?: string | null;
  topics?: string[];
  htmlUrl?: string;
  liveUrl?: string;
  iconUrl?: string;
  previewUrl?: string;
  private?: boolean;
  openIssues?: number;
  demo?: boolean;
}

export interface StoreApp {
  id: string;
  name: string;
  subtitle: string;
  category: Category;
  genre: string;
  description: string;
  color1: string;
  color2: string;
  icon: string;
  rating: number;
  ratings: number;
  size: string;
  age: string;
  version: string;
  developer: string;
  changelog: string;
  badge: string | null;
  url: string | null;
  source: "catalog" | "github";
  status: AppStatus;
  meta: RepoMeta & Record<string, unknown>;
  sortOrder: number;
  updatedAt: string;
}

export interface GithubState {
  connected: boolean;
  login?: string;
  avatar?: string;
  lastSync?: string;
  repoCount?: number;
  mode?: "token" | "user" | "repo" | "demo";
}

export interface ToolBlock {
  type: "tool";
  name: string;
  command: string;
  output: string;
  status: "success" | "error";
}
export interface DiffBlock {
  type: "diff";
  filename: string;
  language: string;
  code: string;
  deployable?: boolean;
}
export interface ReviewBlock {
  type: "review";
  findings: { severity: "high" | "medium" | "low"; title: string; detail: string; line?: string }[];
}
export interface ActionsBlock {
  type: "actions";
  items: { label: string; prompt: string }[];
}
export type Block = ToolBlock | DiffBlock | ReviewBlock | ActionsBlock;

export interface ChatMessage {
  id: number | string;
  sessionId: string;
  role: "user" | "assistant";
  content: string;
  blocks: Block[];
  createdAt: string;
}

export interface ChatSession {
  id: string;
  title: string;
  pinnedRepoId: string | null;
  branch: string;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}
