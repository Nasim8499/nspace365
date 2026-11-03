"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { GithubState, StoreApp } from "@/lib/types";

export type View = "today" | "games" | "apps" | "arcade" | "search" | "ai" | "github";

interface Toast {
  id: number;
  text: string;
}

interface StoreCtx {
  apps: StoreApp[];
  github: GithubState;
  loading: boolean;
  syncing: boolean;
  setSyncing: (v: boolean) => void;
  replaceData: (apps: StoreApp[], github: GithubState) => void;
  view: View;
  go: (v: View) => void;
  sheetId: string | null;
  openSheet: (id: string) => void;
  closeSheet: () => void;
  accountOpen: boolean;
  setAccountOpen: (v: boolean) => void;
  installing: Record<string, number>;
  getApp: (app: StoreApp) => void;
  removeApp: (app: StoreApp) => void;
  openApp: (app: StoreApp) => void;
  browserUrl: string | null;
  openBrowser: (url: string) => void;
  closeBrowser: () => void;
  launching: StoreApp | null;
  toasts: Toast[];
  toast: (text: string) => void;
  chatRepoRequest: { repoId: string; nonce: number } | null;
  askAboutRepo: (repoId: string) => void;
  clearChatRequest: () => void;
}

const Ctx = createContext<StoreCtx | null>(null);

export function useStore(): StoreCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error("useStore must be used inside StoreProvider");
  return v;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [apps, setApps] = useState<StoreApp[]>([]);
  const [github, setGithub] = useState<GithubState>({ connected: false });
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [view, setView] = useState<View>("today");
  const [sheetId, setSheetId] = useState<string | null>(null);
  const [accountOpen, setAccountOpen] = useState(false);
  const [installing, setInstalling] = useState<Record<string, number>>({});
  const [launching, setLaunching] = useState<StoreApp | null>(null);
  const [browserUrl, setBrowserUrl] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [chatRepoRequest, setChatRepoRequest] = useState<StoreCtx["chatRepoRequest"]>(null);
  const toastId = useRef(0);
  const installingRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    let alive = true;
    const pull = (silent: boolean) =>
      fetch("/api/apps", { cache: "no-store" })
        .then((r) => r.json())
        .then((d: { apps: StoreApp[]; github: GithubState }) => {
          if (!alive || !Array.isArray(d.apps)) return;
          setApps(d.apps);
          setGithub(d.github);
        })
        .catch(() => undefined)
        .finally(() => {
          if (alive && !silent) setLoading(false);
        });

    pull(false);
    const timer = setInterval(() => pull(true), 60_000);
    const onVisible = () => {
      if (document.visibilityState === "visible") pull(true);
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      alive = false;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  const toast = useCallback((text: string) => {
    const id = ++toastId.current;
    setToasts((t) => [...t.slice(-2), { id, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2600);
  }, []);

  const replaceData = useCallback((a: StoreApp[], g: GithubState) => {
    setApps(a);
    setGithub(g);
  }, []);

  const mutate = useCallback(
    async (app: StoreApp, action: "install" | "update" | "remove") => {
      try {
        const res = await fetch(`/api/apps/${encodeURIComponent(app.id)}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action }),
        });
        const d = (await res.json()) as { app?: StoreApp };
        if (d.app) setApps((prev) => prev.map((p) => (p.id === d.app!.id ? d.app! : p)));
      } catch {
        toast("Network error — try again");
      }
    },
    [toast],
  );

  const getApp = useCallback(
    (app: StoreApp) => {
      if (installingRef.current.has(app.id)) return;
      installingRef.current.add(app.id);
      const isUpdate = app.status === "update";
      setInstalling((p) => ({ ...p, [app.id]: 0.04 }));
      const timer = setInterval(() => {
        setInstalling((p) => {
          const cur = p[app.id] ?? 0;
          const next = Math.min(1, cur + 0.08 + Math.random() * 0.14);
          return { ...p, [app.id]: next };
        });
      }, 140);
      const total = 1300 + Math.random() * 500;
      setTimeout(async () => {
        clearInterval(timer);
        await mutate(app, isUpdate ? "update" : "install");
        installingRef.current.delete(app.id);
        setInstalling((p) => {
          const n = { ...p };
          delete n[app.id];
          return n;
        });
        toast(isUpdate ? `${app.name} updated` : `${app.name} downloaded`);
      }, total);
    },
    [mutate, toast],
  );

  const removeApp = useCallback(
    (app: StoreApp) => {
      void mutate(app, "remove");
      toast(`${app.name} removed`);
    },
    [mutate, toast],
  );

  const go = useCallback((v: View) => {
    setView(v);
    setSheetId(null);
    setAccountOpen(false);
  }, []);

  const openApp = useCallback(
    (app: StoreApp) => {
      if (app.url === "#ai") {
        go("ai");
        return;
      }
      if (app.url && /^https?:/.test(app.url)) {
        setBrowserUrl(app.url);
        return;
      }
      setLaunching(app);
      setTimeout(() => setLaunching(null), 1300);
    },
    [go, toast],
  );

  const askAboutRepo = useCallback(
    (repoId: string) => {
      setChatRepoRequest({ repoId, nonce: Date.now() });
      go("ai");
    },
    [go],
  );

  const value = useMemo<StoreCtx>(
    () => ({
      apps, github, loading, syncing, setSyncing, replaceData, view, go,
      sheetId, openSheet: setSheetId, closeSheet: () => setSheetId(null),
      accountOpen, setAccountOpen, installing, getApp, removeApp, openApp, launching,
    browserUrl, openBrowser: (u: string) => setBrowserUrl(u), closeBrowser: () => setBrowserUrl(null),
      toasts, toast, chatRepoRequest, askAboutRepo, clearChatRequest: () => setChatRepoRequest(null),
    }),
    [apps, github, loading, syncing, replaceData, view, go, sheetId, accountOpen, installing, getApp, removeApp, openApp, launching, browserUrl, toasts, toast, chatRepoRequest, askAboutRepo],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
