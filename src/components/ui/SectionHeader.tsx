"use client";

export default function SectionHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <div className="mb-1 mt-9 flex items-end justify-between px-1">
      <h2 className="text-[22px] font-bold tracking-tight text-black">{title}</h2>
      {action && (
        <button onClick={onAction} className="text-[16px] font-medium text-[#007AFF] transition-opacity hover:opacity-70">
          {action}
        </button>
      )}
    </div>
  );
}

export function ViewHeader({ eyebrow, title }: { eyebrow?: string; title: string }) {
  return (
    <header className="px-1 pb-4 pt-6">
      {eyebrow && <p className="text-[13px] font-semibold uppercase tracking-wide text-[#8E8E93]">{eyebrow}</p>}
      <h1 className="text-[34px] font-bold leading-[1.1] tracking-tight text-black">{title}</h1>
    </header>
  );
}
