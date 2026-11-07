# N Space — Mobile & Motion Guide

This is the working rulebook for every UI change in N Space. It exists because the
app is meant to feel like an iOS app on a phone first, and desktop second.
Follow the checklist at the bottom before merging anything that touches layout or animation.

**এক নজরে:** প্রতিটি কাজ শুরু করার আগে এই ফাইলটা দেখে নাও। নিচের নিয়মগুলো শুধু
পরামর্শ নয়, এগুলো সেই বাগগুলো আটকায় যেগুলো আমরা একবার মারাত্মকভাবে পেয়েছি
(মোবাইলে GET বাটন স্ক্রিনের বাইরে চলে যাওয়া, ৩,৪৮৯টা DOM নোড, অ্যানিমেশন না দেখা)।

---

## 1. The layout rule that broke mobile

**Symptom:** on a 390px iPhone the "All Projects" list rows were **686px wide**.
Every row's `GET` button landed at `x=702`, i.e. **312px off-screen and untappable**.
There was no horizontal scrollbar, so it just looked like the button did not exist.

**Cause:** a grid with no explicit mobile column count:

```tsx
// ❌ implicit column = auto, sized to max-content
<div className="grid gap-x-8 md:grid-cols-2">
```

`AppRow` uses `truncate` (`white-space: nowrap`), so the row's **max-content width is
the full un-truncated text**, and an implicit `auto` track happily grows to 686px
inside a 358px container. The parent `overflow-hidden` then silently clips it.

**Fix:**

```tsx
// ✅ mobile = repeat(1, minmax(0, 1fr)) — allowed to shrink
<div className="grid grid-cols-1 gap-x-8 md:grid-cols-2">
```

Plus `min-w-0` on the row itself and on its flexible middle column.

### Rules

1. **Never rely on an implicit grid column.** If a grid uses `md:grid-cols-*`, it MUST
   also declare its mobile columns (`grid-cols-1` or `grid-cols-2`).
2. Any flex/grid child that contains `truncate`, `line-clamp`, input fields, or a
   horizontally scrolling rail **must** get `min-w-0`. `min-width: auto` is the default
   and it is what lets text blow a container apart.
3. Horizontal rails are their own scroll container. Give them
   `-mx-4 px-4 md:-mx-8 md:px-8` so the first card still aligns to the page gutter.

### How to check it (do this every time)

Open the page at **390×844** and run in the console:

```js
[...document.querySelectorAll('[role="button"]')].forEach(el => {
  const r = el.getBoundingClientRect();
  if (r.right > innerWidth + 1) console.warn('OFF-SCREEN', r.width, el.textContent.slice(0, 30));
});
```

Or in Chrome DevTools: toggle a 390px device, then scroll the whole page slowly and
watch for anything clipped at the right edge. If `document.documentElement.scrollWidth`
equals the viewport while children are wider, the content is being **cut**, not scrolled.

---

## 2. Motion rules

The bug people reported was "nothing feels animated". Framer Motion was already wired in
(`AnimatePresence` view transitions, tab pill `layoutId`, toasts, launch overlay, GET button
morph), but almost every entrance used `initial`/`animate`, which **fires on mount**.

Because the whole Discover page mounts at once (2,700px tall), the rows below the fold
finished animating before the user ever scrolled to them. Result: the page feels static.

### Rules

1. **Above the fold → `animate`.** Hero cards, top bar, tab bar.
2. **Below the fold → `whileInView`** with `viewport={{ once: true, margin: "-40px" }}`.
   This is the single highest-impact motion change in the app.
3. **Stagger** with `delay: Math.min(index * 0.03, 0.18)`. Never unbounded stagger values.
4. **Duration ≤ 0.3s**, `ease: "easeOut"` — use the shared tokens in `src/lib/motion.ts`
   (`t`, `tFast`, `tMax`, `fadeUp`) instead of hardcoding durations in components.
5. **Every tappable surface gets `whileTap`** (`scale 0.97–0.99`). Press feedback is what
   makes a web app feel native.
6. **Hover-only effects are invisible on phones.** `hover:scale-*` on the hero image is
   desktop candy; do not count it as motion.
7. Respect `prefers-reduced-motion` — already handled globally in `globals.css`, but do
   not add motion that ignores it.
8. Do not animate `top`, `left`, `width`, or `height` continuously. Use `transform` and
   `opacity`, or `layout` when the layout genuinely has to move.

### Good pattern

```tsx
<motion.div
  initial={{ opacity: 0, y: 8 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: "-40px" }}
  transition={{ duration: 0.24, ease: "easeOut", delay: Math.min(index * 0.03, 0.18) }}
  whileTap={{ scale: 0.99 }}
>
```

---

## 3. Performance budget

The Discover screen once shipped **3,489 DOM nodes / 191 buttons** because the
"Your Projects" rail rendered **every synced repo**: 162 cards, 44,084px wide.

| Budget | Limit |
| --- | --- |
| DOM nodes on Discover | < 1,500 |
| Cards in a horizontal rail | ≤ 12, then a "+N more" tile (`RAIL_LIMIT` in `TodayView.tsx`) |
| `repos` list views | paginate or virtualise above ~50 rows |
| New client deps | no animation library beyond `framer-motion` |

---

## 4. Touch and readability

- Tap targets: **44×44 minimum**. `GET` is currently `h-8` (32px) — acceptable inside a
  large row hit area, but do not shrink it further.
- Tab labels are `text-[10px]`; keep them at or above 10px and fully opaque.
- Secondary text `#8E8E93` on white is ≈3.5:1 contrast. For anything below 14px use
  `#6C6C70` or darker to clear WCAG AA (4.5:1).
- Zoom is intentionally locked (`ViewportLock.tsx` + `maximumScale: 1`). That is a product
  decision, but it means **tiny text is a real accessibility risk** — keep body copy ≥ 13px.

---

## 5. PWA / iOS

- iOS ignores SVG for `apple-touch-icon`. The "Add to Home Screen" icon needs a **PNG**
  (180×180, ideally 512 too). Keep `/api/icon` for the in-app artwork, but point
  `metadata.icons.apple` and `manifest.ts` at real PNG files in `public/`.
- Always keep `viewport-fit=cover` plus `env(safe-area-inset-bottom)` for the floating tab
  bar — already handled via `--safe-bottom`.

---

## 6. Pre-merge checklist

Run through this before every PR that touches a view:

- [ ] `npm run typecheck` passes
- [ ] `npm run build` passes
- [ ] 390×844: no element crosses `innerWidth`, no clipped right edge
- [ ] 320×640: still no overflow (smallest common Android)
- [ ] Every list row's primary button is fully visible and tappable
- [ ] Below-the-fold sections use `whileInView`, not `animate`
- [ ] Console clean (no hydration or React key warnings)
- [ ] Discover DOM nodes still under 1,500
- [ ] Safe-area padding intact at the bottom

---

## 7. File map

| Concern | File |
| --- | --- |
| Grid / list rows | `src/components/views/TodayView.tsx`, `CategoryView.tsx`, `SearchView.tsx`, `GitHubView.tsx`, `src/components/ui/AppRow.tsx` |
| Motion tokens | `src/lib/motion.ts` |
| Global CSS, keyframes, reduced motion | `src/app/globals.css` |
| Viewport / zoom lock | `src/app/layout.tsx`, `src/components/shell/ViewportLock.tsx` |
| Tab bar / safe area | `src/components/shell/TabBar.tsx` |
| PWA manifest & icons | `src/app/manifest.ts`, `src/app/layout.tsx`, `public/` |
