import { hash } from "@/lib/server/art";
import type { Block, DiffBlock } from "@/lib/types";

export interface AgentContext {
  text: string;
  branch: string;
  ahead: number; // local commits not yet pushed
  repo: { name: string; language: string | null; defaultBranch: string; liveUrl?: string } | null;
}

export interface AgentResult {
  content: string;
  blocks: Block[];
  branch?: string;
  /** commits made / pushed so the route can persist state via blocks */
}

const sha = (seed: string) => hash(seed).toString(16).padStart(8, "0").slice(0, 7);

function diffFor(lang: string | null, seed: number): DiffBlock {
  const variants: DiffBlock[] = [
    {
      type: "diff", filename: "src/lib/api.ts", language: "typescript", deployable: true,
      code: `@@ -12,9 +12,16 @@ export async function fetchProjects() {
-  const res = await fetch("/api/projects");
-  return res.json();
+  const res = await fetch("/api/projects", { cache: "no-store" });
+  if (!res.ok) {
+    throw new Error(\`Projects request failed: \${res.status}\`);
+  }
+  const data = (await res.json()) as Project[];
+  return data.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
 }`,
    },
    {
      type: "diff", filename: "src/components/GlassCard.tsx", language: "typescript", deployable: true,
      code: `@@ -4,7 +4,11 @@ export function GlassCard({ children }: Props) {
   return (
-    <div className="bg-white rounded-xl p-4">
+    <div className="rounded-3xl border border-black/5 bg-white/70 p-4
+      shadow-[0_8px_32px_rgba(0,0,0,0.06)] backdrop-blur-xl">
       {children}
     </div>
   );`,
    },
    {
      type: "diff", filename: "src/hooks/useSync.ts", language: "typescript", deployable: true,
      code: `@@ -21,6 +21,12 @@ export function useSync(repo: string) {
-  useEffect(() => { sync(repo); }, []);
+  useEffect(() => {
+    const ctrl = new AbortController();
+    sync(repo, { signal: ctrl.signal }).catch(() => undefined);
+    return () => ctrl.abort();
+  }, [repo]);`,
    },
  ];
  if (lang === "Swift") {
    return {
      type: "diff", filename: "Sources/Ledger/BudgetStore.swift", language: "swift", deployable: true,
      code: `@@ -30,8 +30,13 @@ final class BudgetStore: ObservableObject {
-    func load() {
-        self.items = try! storage.read()
-    }
+    @MainActor
+    func load() async {
+        do {
+            items = try await storage.read()
+        } catch {
+            logger.error("Load failed: \\(error.localizedDescription)")
+        }
+    }`,
    };
  }
  if (lang === "Go") {
    return {
      type: "diff", filename: "internal/server/handler.go", language: "go", deployable: true,
      code: `@@ -44,7 +44,12 @@ func (s *Server) handleList(w http.ResponseWriter, r *http.Request) {
-	items, _ := s.store.List()
-	json.NewEncoder(w).Encode(items)
+	items, err := s.store.List(r.Context())
+	if err != nil {
+		http.Error(w, "store unavailable", http.StatusServiceUnavailable)
+		return
+	}
+	json.NewEncoder(w).Encode(items)`,
    };
  }
  if (lang === "Rust") {
    return {
      type: "diff", filename: "src/tiles.rs", language: "rust", deployable: true,
      code: `@@ -58,6 +58,10 @@ pub fn render(tile: &Tile) -> Result<Vec<u8>> {
-    let data = std::fs::read(&tile.path).unwrap();
+    let data = std::fs::read(&tile.path)
+        .with_context(|| format!("reading tile {}", tile.path.display()))?;
     encode(&data)`,
    };
  }
  return variants[seed % variants.length];
}

const HELP_ACTIONS = [
  { label: "git pull", prompt: "git pull" },
  { label: "Review code", prompt: "Review my latest changes" },
  { label: "Create branch", prompt: "Create branch feature/glass-polish" },
  { label: "Commit", prompt: 'git commit -m "feat: polish glass surfaces"' },
];

export function runAgent(ctx: AgentContext): AgentResult {
  const raw = ctx.text.trim();
  const t = raw.toLowerCase();
  const repoName = ctx.repo?.name ?? "workspace";
  const seed = hash(repoName + raw);
  const lang = ctx.repo?.language ?? null;
  const branch = ctx.branch;

  const noRepoNote = ctx.repo ? "" : "\n\nTip: pin a repository from the side panel so I can work against a real project context.";

  // ---- create branch
  const branchMatch =
    raw.match(/(?:checkout\s+-b|switch\s+-c|branch\s+create|create\s+(?:a\s+)?(?:new\s+)?branch|new\s+branch|make\s+(?:a\s+)?branch)\s+(?:called\s+|named\s+)?["']?([\w./-]+)/i);
  if (branchMatch) {
    const name = branchMatch[1];
    return {
      content: `Created and switched to **${name}** in \`${repoName}\`. The branch tracks \`origin/${branch}\` until you push.${noRepoNote}`,
      branch: name,
      blocks: [
        { type: "tool", name: "create_branch", command: `git checkout -b ${name}`, status: "success", output: `Switched to a new branch '${name}'` },
        { type: "actions", items: [{ label: "Commit changes", prompt: `git commit -m "chore: start ${name}"` }, { label: "Review code", prompt: "Review my latest changes" }] },
      ],
    };
  }

  // ---- pull
  if (/\bpull\b|\bsync\b.*\b(repo|branch)\b|\bfetch\b/.test(t)) {
    const files = 2 + (seed % 3);
    const diff = diffFor(lang, seed);
    return {
      content: `Pulled the latest from \`origin/${branch}\`. ${files} files changed — here is the most relevant diff.${noRepoNote}`,
      blocks: [
        {
          type: "tool", name: "git_pull", command: `git pull origin ${branch}`, status: "success",
          output: `From github.com:${repoName}\n * branch            ${branch}     -> FETCH_HEAD\nUpdating ${sha(raw)}..${sha(raw + "1")}\nFast-forward\n ${files} files changed, ${12 + (seed % 40)} insertions(+), ${3 + (seed % 9)} deletions(-)`,
        },
        { ...diff, deployable: false },
      ],
    };
  }

  // ---- commit
  if (/\bcommit\b/.test(t)) {
    const msgMatch = raw.match(/-m\s+["'“](.+?)["'”]\s*$/) || raw.match(/commit(?:\s+(?:with|message|msg|changes|these|all))*\s*[:\-]?\s*["'“]?(.{3,})["'”]?$/i);
    const generic = /^(changes|all|these|everything|my changes|the changes|it|now)$/i;
    const picked = (msgMatch?.[1] ?? "").replace(/["']+$/, "").trim();
    const message = picked && !generic.test(picked) ? picked : "chore: update project";
    const id = sha(message + repoName + Date.now());
    const diff = diffFor(lang, seed);
    return {
      content: `Staged all changes and committed to **${branch}**. You now have ${ctx.ahead + 1} unpushed commit${ctx.ahead + 1 === 1 ? "" : "s"}.${noRepoNote}`,
      blocks: [
        { type: "tool", name: "git_add", command: "git add -A", status: "success", output: "Staged 3 files" },
        {
          type: "tool", name: "git_commit", command: `git commit -m "${message}"`, status: "success",
          output: `[${branch} ${id}] ${message}\n 3 files changed, ${18 + (seed % 30)} insertions(+), ${4 + (seed % 8)} deletions(-)`,
        },
        diff,
        { type: "actions", items: [{ label: "Push to origin", prompt: "git push" }] },
      ],
    };
  }

  // ---- push
  if (/\bpush\b/.test(t)) {
    const n = Math.max(ctx.ahead, 1);
    return {
      content: `Pushed ${n} commit${n === 1 ? "" : "s"} to \`origin/${branch}\`. ${ctx.repo?.liveUrl ? "Your deploy hook is ready." : "You can trigger a deploy next."}`,
      blocks: [
        {
          type: "tool", name: "git_push", command: `git push origin ${branch}`, status: "success",
          output: `Enumerating objects: ${9 + (seed % 12)}, done.\nCompressing objects: 100% (${5 + (seed % 6)}/${5 + (seed % 6)}), done.\nWriting objects: 100% (${n * 3}/${n * 3}), done.\nTo github.com:${repoName}\n   ${sha(raw)}..${sha(raw + "p")}  ${branch} -> ${branch}`,
        },
        { type: "actions", items: [{ label: "Deploy", prompt: "deploy" }, { label: "Open pull request", prompt: "open a pull request" }] },
      ],
    };
  }

  // ---- deploy
  if (/\bdeploy|\bship\b|\brelease\b/.test(t)) {
    return {
      content: `Deployment finished for \`${repoName}\` from **${branch}**. Build passed all checks.`,
      blocks: [
        {
          type: "tool", name: "deploy_hook", command: `POST /hooks/deploy?ref=${branch}`, status: "success",
          output: `▲ Building…  (14.2s)\n✓ Type check passed\n✓ 38 tests passed\n✓ Deployed to ${ctx.repo?.liveUrl ?? `https://${repoName}.nspace.app`}`,
        },
      ],
    };
  }

  // ---- review
  if (/\breview\b|\baudit\b|\blint\b|\bcheck (my|the) (code|changes)\b/.test(t)) {
    const diff = diffFor(lang, seed + 1);
    return {
      content: `I reviewed the latest changes on **${branch}**. Found 3 items worth addressing — one is high priority.${noRepoNote}`,
      blocks: [
        { type: "tool", name: "code_review", command: `git diff origin/${branch}...HEAD --stat`, status: "success", output: ` ${diff.filename} | 17 +++++++-----\n 2 other files changed, 41 insertions(+), 9 deletions(-)` },
        {
          type: "review",
          findings: [
            { severity: "high", title: "Unhandled request failure", detail: "The fetch result is parsed without checking `res.ok`, so a 500 will surface as a confusing JSON error.", line: diff.filename + ":14" },
            { severity: "medium", title: "Missing cleanup on unmount", detail: "The effect starts async work with no abort signal, which can set state after the component unmounts.", line: diff.filename + ":27" },
            { severity: "low", title: "Prefer typed response", detail: "Cast the payload to a named type to keep call sites checked end-to-end.", line: diff.filename + ":19" },
          ],
        },
        { ...diff, deployable: true },
      ],
    };
  }

  // ---- status / log / branches
  if (/\bstatus\b|\blog\b|\bhistory\b|\bdiff\b|\bwhere am i\b/.test(t)) {
    return {
      content: `You are on **${branch}** in \`${repoName}\` with ${ctx.ahead} unpushed commit${ctx.ahead === 1 ? "" : "s"}.${noRepoNote}`,
      blocks: [
        {
          type: "tool", name: "git_status", command: "git status -sb", status: "success",
          output: `## ${branch}...origin/${branch}${ctx.ahead ? ` [ahead ${ctx.ahead}]` : ""}\n M src/components/GlassCard.tsx\n M src/lib/api.ts\n?? notes/ideas.md`,
        },
        { type: "actions", items: HELP_ACTIONS.slice(0, 3) },
      ],
    };
  }

  // ---- pull request
  if (/pull request|\bpr\b/.test(t)) {
    return {
      content: `Opened a draft pull request from **${branch}** into \`${ctx.repo?.defaultBranch ?? "main"}\`.`,
      blocks: [
        {
          type: "tool", name: "create_pr", command: `gh pr create --draft --base ${ctx.repo?.defaultBranch ?? "main"} --head ${branch}`, status: "success",
          output: `Creating draft pull request for ${branch} into ${ctx.repo?.defaultBranch ?? "main"} in ${repoName}\nhttps://github.com/${repoName}/pull/${12 + (seed % 80)}`,
        },
      ],
    };
  }

  // ---- fallback / help
  const greeting = /^(hi|hello|hey|help|what can you do)/.test(t);
  return {
    content: greeting
      ? `Hi! I'm your N Terminal assistant. I can run Git operations on **${repoName}** and review code — just ask in plain language.${noRepoNote}`
      : `I can help with Git operations on \`${repoName}\`. Try one of these — I'll run it against **${branch}**.${noRepoNote}`,
    blocks: [
      { type: "actions", items: HELP_ACTIONS },
    ],
  };
}
