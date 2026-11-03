"use client";

import { motion } from "framer-motion";
import { Bell, ChevronRight, Download, RefreshCw, Smartphone, TerminalSquare } from "lucide-react";
import { useState } from "react";
import { useStore } from "@/components/store";
import AppIcon from "@/components/ui/AppIcon";
import GetButton from "@/components/ui/GetButton";
import GithubMark from "@/components/ui/GithubMark";
import Modal from "@/components/ui/Modal";
import { timeAgo } from "@/lib/format";

export default function AccountModal() {
  const { accountOpen, setAccountOpen, github, apps, go, getApp, openSheet, installing } = useStore();
  const [notify, setNotify] = useState(true);
  const installed = apps.filter((a) => a.status === "installed" || a.status === "update");
  const updates = apps.filter((a) => a.status === "update");

  const Row = ({ icon: Icon, tint, label, value, onClick }: { icon: typeof Bell; tint: string; label: string; value?: string; onClick: () => void }) => (
    <button onClick={onClick} className="flex w-full items-center gap-3 border-b border-black/[0.06] px-4 py-3 text-left transition-colors last:border-0 hover:bg-black/[0.02]">
      <span className="grid h-8 w-8 place-items-center rounded-lg text-white" style={{ background: tint }}>
        <Icon size={17} />
      </span>
      <span className="flex-1 text-[16px] text-black">{label}</span>
      {value && <span className="max-w-[40%] truncate text-[14px] text-[#8E8E93]">{value}</span>}
      <ChevronRight size={16} className="text-[#C7C7CC]" />
    </button>
  );

  return (
    <Modal open={accountOpen} onClose={() => setAccountOpen(false)} label="Account" maxWidth="md:max-w-md">
      <div className="bg-[#F2F2F7] px-4 pb-8 pt-8">
        <h2 className="mb-5 text-center text-[17px] font-semibold">Account</h2>

        <div className="rounded-3xl border border-black/5 bg-white p-5 text-center shadow-sm">
          <div className="mx-auto h-20 w-20 overflow-hidden rounded-full ring-4 ring-[#F2F2F7]">
            {github.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={github.avatar} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="grid h-full w-full place-items-center bg-gradient-to-br from-[#5AC8FA] to-[#007AFF] text-[32px] font-semibold text-white">
                {(github.login ?? "N").slice(0, 1).toUpperCase()}
              </span>
            )}
          </div>
          <p className="mt-3 text-[20px] font-bold tracking-tight">{github.login ?? "N Space Developer"}</p>
          <p className="text-[14px] text-[#8E8E93]">{github.connected ? `GitHub synced ${timeAgo(github.lastSync)}` : "N Space ID · Free plan"}</p>
          <div className="mt-4 grid grid-cols-3 divide-x divide-black/[0.06] rounded-2xl bg-[#F2F2F7] py-2.5">
            {[
              [installed.length, "Apps"],
              [updates.length, "Updates"],
              [github.repoCount ?? 0, "Repos"],
            ].map(([n, l]) => (
              <div key={l as string}>
                <p className="text-[20px] font-bold">{n}</p>
                <p className="text-[12px] text-[#8E8E93]">{l}</p>
              </div>
            ))}
          </div>
        </div>

        {updates.length > 0 && (
          <div className="mt-5">
            <div className="mb-1.5 flex items-center justify-between px-2">
              <p className="text-[13px] font-semibold uppercase tracking-wide text-[#8E8E93]">Available Updates</p>
              <button onClick={() => updates.forEach((u) => !(u.id in installing) && getApp(u))} className="flex items-center gap-1 text-[14px] font-semibold text-[#007AFF]">
                <RefreshCw size={13} /> Update All
              </button>
            </div>
            <div className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
              {updates.map((u) => (
                <div key={u.id} onClick={() => openSheet(u.id)} className="flex cursor-pointer items-center gap-3 border-b border-black/[0.06] p-3 last:border-0">
                  <AppIcon app={u} size={48} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[16px] font-semibold">{u.name}</p>
                    <p className="line-clamp-1 text-[12.5px] text-[#8E8E93]">{u.changelog}</p>
                  </div>
                  <GetButton app={u} />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-5 overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
          <Row icon={GithubMark as unknown as typeof Bell} tint="#1C1C1E" label="GitHub" value={github.connected ? "Connected" : "Connect"} onClick={() => go("github")} />
          <Row icon={TerminalSquare} tint="#007AFF" label="AI Terminal" value="Open" onClick={() => go("ai")} />
          <Row icon={Download} tint="#34C759" label="Purchased" value={`${installed.length} apps`} onClick={() => go("apps")} />
          <div className="flex items-center gap-3 px-4 py-3">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#FF3B30] text-white"><Bell size={17} /></span>
            <span className="flex-1 text-[16px]">Notifications</span>
            <button
              role="switch"
              aria-checked={notify}
              aria-label="Notifications"
              onClick={() => setNotify((n) => !n)}
              className={`relative h-[31px] w-[51px] rounded-full transition-colors duration-200 ${notify ? "bg-[#34C759]" : "bg-[#E5E5EA]"}`}
            >
              <motion.span layout transition={{ duration: 0.2, ease: "easeOut" }} className="absolute top-0.5 h-[27px] w-[27px] rounded-full bg-white shadow-md" style={{ left: notify ? 22 : 2 }} />
            </button>
          </div>
        </div>

        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-black/5 bg-white p-4 text-[13px] leading-snug text-[#8E8E93] shadow-sm">
          <Smartphone size={18} className="mt-0.5 shrink-0 text-[#007AFF]" />
          Install N Space on your Home Screen: tap Share in Safari, then “Add to Home Screen” for the full-screen PWA experience.
        </div>
      </div>
    </Modal>
  );
}
