# N Space সম্পূর্ণ গাইডলাইন (বাংলা)

এই ডকুমেন্টটা N Space প্রজেক্টের সম্পূর্ণ কাজের বিধি। এখানে চারটা জিনিস আছে:
কী কী সমস্যা পাওয়া গেছে (প্রমাণসহ), কী ঠিক করা হয়েছে, কী এখনো বাকি, এবং
পরেরবার কাজ করার সময় কোন নিয়ম মানতে হবে।

ফাইলটা নতুন কিছু ঠিক করার আগে এবং PR দেওয়ার আগে পড়া বাধ্যতামূলক।

---

## ভাগ ১. প্রজেক্ট ও ডিপ্লয়মেন্ট ফ্লো

| জিনিস | মান |
| --- | --- |
| লাইভ সাইট | https://iosliquid365.vercel.app/ |
| সোর্স রিপো | github.com/snbwallet365-ops/nspace365 (পাবলিক) |
| স্ট্যাক | Next.js 16 (App Router, Turbopack), React 19, TypeScript, Tailwind v4, framer-motion, Drizzle + Postgres |
| হোস্টিং | Vercel, `main` ব্র্যাঞ্চে পুশ হলেই অটো ডিপ্লয় |
| মোবাইল টার্গেট | iPhone 390x844 প্রাইমারি, Android 320x640 ন্যূনতম |
| অ্যাপ স্ট্রাকচার | বাইরের শেল `overflow-hidden` + ভেতরে `<main>` স্ক্রল করে |

কোড থেকে লাইভ হওয়ার পথ:

```
লোকাল কোড  ->  ব্র্যাঞ্চ  ->  PR  ->  রিভিউ + মার্জ (main)  ->  Vercel অটো ডিপ্লয়  ->  যাচাই
```

মনে রাখার বিষয়: বাইরের শেল `overflow-hidden`, তাই ভেতরের কোনো এলিমেন্ট
স্ক্রিনের চেয়ে চওড়া হলে সেটা স্ক্রল হবে না, চুপচাপ কেটে যাবে। কোনো স্ক্রলবারও
দেখাবে না। এটা এই প্রজেক্টে বাগ ধরার সবচেয়ে বড় ফাঁদ।

---

## ভাগ ২. সম্পূর্ণ অডিট রিপোর্ট

অডিট চালানো হয়েছে আসল লাইভ সাইটে, headless Chrome দিয়ে, তিনটা ভিউপোর্টে
(390x844, 393x851, 320x640), DOM মেপে।

### 🔴 সমস্যা ১: প্রতিটি লিস্ট সারি স্ক্রিনের চেয়ে ২৯৬px চওড়া (ক্রিটিক্যাল)

- ৩৯০px স্ক্রিনে প্রতিটি "All Projects" সারি ছিল **৬৮৬px**।
- প্রতিটি সারির GET বাটন ছিল x = **৭০২**-এ, মানে স্ক্রিনের ৩১২px বাইরে।
- `btnVisible: false`। মানে মোবাইল ইউজার লিস্ট থেকে কোনো অ্যাপ খুলতেই পারত না।
- `document.scrollWidth` ছিল ঠিক ৩৯০, তাই কোনো স্ক্রলবারও ছিল না।
  ফলে বাটনটা "নেই" মনে হচ্ছিল, "কাটা" মনে হচ্ছিল না।
- সংখ্যা: ৩০টা এলিমেন্ট ভিউপোর্টের চেয়ে চওড়া, ২০৩টার মধ্যে ৫৩টা টেক্সট সত্যিই কাটা পড়ছিল।

**মূল কারণ:** গ্রিডে মোবাইলের কলাম ডিফাইন করা ছিল না।

```tsx
<div className="grid gap-x-8 md:grid-cols-2">   // ❌ ভুল
```

কলাম ডিফাইন না করলে ব্রাউজার implicit ট্র্যাক বানায়, আর সেই ট্র্যাকের সাইজ হয়
`auto`, মানে item-এর max-content। সারিতে `truncate` আছে, যেটা
`white-space: nowrap` সেট করে। তাই max-content = পুরো না-কাটা লেখার চওড়া।
ফলে ৩৫৮px কলামের ভেতরে ৬৮৬px ট্র্যাক তৈরি হয়ে যায়।

### 🔴 সমস্যা ২: অ্যানিমেশন স্ক্রল করার আগেই শেষ হয়ে যাচ্ছিল

- ফ্রেমার মোশন বসানোই ছিল (view transition, tab pill, toast, launch overlay, GET মর্ফ)।
- কিন্তু প্রায় সব entrance ছিল `initial` + `animate`, যেটা **মাউন্টের সময়েই** চলে।
- পুরো Discover পেজ একসাথে মাউন্ট হয় (২,৭৯২px লম্বা)। তাই নিচের অংশে
  স্ক্রল করে যাওয়ার সময় অ্যানিমেশন অনেক আগেই শেষ।
- মাপা ফল: লোডের পর `runningAnimationCount = 0`। ৩,৪৮৯ এলিমেন্টে ০টা অ্যানিমেশন চলছে।
- এটাই "কিছুই অ্যানিমেটেড না, ল্যাক লাগে" অনুভূতির কারণ।

### 🟠 সমস্যা ৩: প্রথম পেইন্টে ৩,৪৮৯ DOM নোড

- "Your Projects" রেলে **১৬২টা** রিপো কার্ড রেন্ডার হচ্ছিল।
- রেলের চওড়া **৪৪,০৮৪px**। এক পেজে ১৯১টা বাটন।
- ফল: কম দামের ফোনে স্ক্রল ও ট্যাপে ল্যাগ, স্ক্রল করলে ঝাঁকুনি।

### 🟠 সমস্যা ৪: iOS হোম স্ক্রিন আইকন কাজ করত না

- `manifest.webmanifest`-এ `"type": "image/png"` লেখা, কিন্তু `src` ছিল
  `/api/icon/N?...`, যেটা SVG ফেরত দেয়।
- iOS `apple-touch-icon`-এ SVG একেবারেই নেয় না। ফলে "Add to Home Screen"
  করলে আইকন ফাঁকা বা ডিফল্ট দেখাত।
- উপরন্তু `public/manifest.webmanifest` ফাইলটা `src/app/manifest.ts`-কে
  শ্যাডো করে। মানে জেনারেট হওয়া ম্যানিফেস্ট নয়, পাবলিক ফাইলটাই সার্ভ হয়।

### 🟡 সমস্যা ৫: ছোট ট্যাপ টার্গেট ও ছোট লেখা (এখনো বাকি)

- ৪৪x৪৪-এর নিচে **১৮৪টা** ইন্টারঅ্যাকটিভ এলিমেন্ট।
- GET বাটনের উচ্চতা ৩২px, ট্যাব লেবেল ১০px।
- `#8E8E93` লেখা সাদার উপর কনট্রাস্ট আনুমানিক **৩.৫:১**, WCAG AA দরকার ৪.৫:১।
  ১২ থেকে ১৩px লেখায় এটা মোবাইলে পড়তে কষ্ট হয়।

### 🟡 সমস্যা ৬: zoom বন্ধ (ইচ্ছাকৃত, তাই ছোঁয়া হয়নি)

- `layout.tsx`-এ `maximumScale: 1`, `userScalable: false`, আর
  `ViewportLock.tsx` আলাদা করে pinch, double-tap, Ctrl+zoom ব্লক করে।
- কমিট মেসেজে "zoom locked" লেখা আছে, তাই এটা ইচ্ছাকৃত সিদ্ধান্ত। ভাঙা হয়নি।
- তবে এর মানে হলো: ছোট লেখা ঠিক করা এখন অ্যাক্সেসিবিলিটির জন্য বেশি জরুরি,
  কারণ ইউজার জুম করে পড়তে পারবে না।

### 🟢 যা ঠিক ছিল (হাত দেওয়ার দরকার নেই)

- কোনো console error বা page error নেই।
- কোনো ভাঙা ইমেজ নেই।
- page-level horizontal scroll নেই (৩৯০, ৩৯৩, ৩২০ সব জায়গায় ০)।
- safe-area handling আছে (`--safe-bottom` + `env(safe-area-inset-bottom)`)।
- horizontal রেলের swipe ঠিকঠাক কাজ করে (টেস্টে scrollLeft ১৬ থেকে ২৮৮ হয়েছে)।
- ডেস্কটপ ১৪৪০px লেআউট সুন্দর, ওখানে কোনো সমস্যা নেই।

---

## ভাগ ৩. যা ঠিক করা হয়েছে

### ফিক্স ১: মোবাইল ওভারফ্লো

```tsx
// src/components/views/TodayView.tsx
<div className="mt-1 grid grid-cols-1 gap-x-8 md:grid-cols-2">
```

`grid-cols-1` কম্পাইল হয় `repeat(1, minmax(0, 1fr))`-এ, যেটা min-content-এর
নিচে নামতে পারে। সাথে `AppRow`-এ `min-w-0` যোগ করা হয়েছে।

একই বাগ আরও তিন জায়গায় ছিল, সব ঠিক করা হয়েছে:
`CategoryView.tsx`, `SearchView.tsx`, `GitHubView.tsx`।

**যাচাই:** সারি ৬৮৬px থেকে **৩৫৮px**, GET বাটন ৭০২ থেকে **৩৭৪px**, সম্পূর্ণ ট্যাপেবল।

### ফিক্স ২: স্ক্রলে অ্যানিমেশন দেখা যায়

```tsx
<motion.div
  initial={{ opacity: 0, y: 8 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: "-40px" }}
  transition={{ duration: 0.24, ease: "easeOut", delay: Math.min(index * 0.03, 0.18) }}
  whileTap={{ scale: 0.99 }}
>
```

বদলানো হয়েছে: `AppRow`, "Your Projects" রেলের কার্ড, "Fresh from your repos"
কার্ড, GitHub CTA সেকশন। সাথে সব জায়গায় `whileTap` প্রেস ফিডব্যাক।

### ফিক্স ৩: পারফরম্যান্স

```tsx
const RAIL_LIMIT = 10;
const rail = repos.slice(0, RAIL_LIMIT);
```

রেলে এখন ১০টা কার্ড (মোট repos ৮৩ হলে ১১টা চাইল্ড), তারপর "+N more repos" টাইল যেটা Repos ট্যাবে নিয়ে যায়।
**ফল:** রেল ৪৪,০৮৪px থেকে ২,৯১৬px, DOM নোড ৩,৪৮৯ থেকে **৬৩৩** (HeroSlider যোগ হওয়ার পরেও)।

### ফিক্স ৪: iOS আইকন

- `public/apple-touch-icon-180.png`, `public/icon-192.png`, `public/icon-512.png` যোগ করা হয়েছে।
- `public/manifest.webmanifest` ও `src/app/layout.tsx` আসল PNG-তে পয়েন্ট করছে।
- **যাচাই:** তিনটা ফাইলই `200 image/png`, HTML-এ `apple-touch-icon ... type="image/png"` আসছে।

### ফিক্স ৫: রিপো গাইড

`docs/MOBILE_MOTION_GUIDE.md` (ইংরেজি) এবং এই ফাইল (বাংলা)।

---

## ভাগ ৪. যা এখনো বাকি (ধাপে ধাপে করতে হবে)

### বাকি ১: ছোট লেখার কনট্রাস্ট

`#8E8E93` যেখানে ১৪px-এর নিচে ব্যবহার হয়েছে, সেখানে `#6C6C70` করুন।
গ্লোবাল টোকেন বদলাবেন না, কারণ বড় লেখায় `#8E8E93` ঠিকই দেখায়।

```css
/* src/app/globals.css */
:root {
  --label-3: #6c6c70;        /* আগে ছিল #8e8e93 */
  --label-3-soft: #8e8e93;   /* বড় লেখার জন্য পুরোনোটা */
}
```

### বাকি ২: ট্যাপ টার্গেট ৪৪px

`GetButton`-এ `size` বদলান:

```tsx
const size = large ? "h-11 min-w-[96px] px-6 text-[16px]"
                   : "h-9 min-w-[76px] px-4 text-[15px]";   // h-8 -> h-9
```

পুরো সারি তো ইতিমধ্যেই বড় hit area, তাই `h-9` (৩৬px) যথেষ্ট। আর ছোট করবেন না।

### বাকি ৩: ট্যাব লেবেল

`TabBar.tsx`-এ `text-[10px]` আছে। `text-[11px]` করলে পড়তে সহজ হবে,
তবে ৩৯০px-এ ছয়টা আইটেমে জায়গা কম, তাই আগে ডিভাইসে দেখে নিন।

### বাকি ৪: বড় রিপো লিস্ট

`CategoryView`-এ সব রিপো একসাথে রেন্ডার হলে virtualization বা pagination দরকার।
৫০ সারির বেশি হলে `content-visibility: auto` দিয়ে শুরু করুন।

---

## ভাগ ৫. লেআউট রুলবুক

1. **implicit গ্রিড কলামের উপর ভরসা করবেন না।** `md:grid-cols-*` থাকলে
   মোবাইলের কলামও (`grid-cols-1` বা `grid-cols-2`) লিখতেই হবে।
2. যেকোনো flex/grid child-এ `truncate`, `line-clamp`, input, বা horizontal রেল
   থাকলে `min-w-0` দিতেই হবে। ডিফল্ট `min-width: auto`-ই কনটেইনার ফাটায়।
3. horizontal রেলে `-mx-4 px-4 md:-mx-8 md:px-8` রাখুন, যাতে প্রথম কার্ড
   পেজের গাটারের সাথে লাইন করে থাকে।
4. `overflow-hidden` শেলের ভেতরে চওড়া কিছু দিলে সেটা কেটে যাবে, স্ক্রল হবে না।
   তাই মাপা ছাড়া কোনো লিস্ট লেআউট শেষ করবেন না।

### যাচাই করার নিয়ম (প্রতিবার)

৩৯০x৮৪৪-এ পেজ খুলে কনসোলে চালান:

```js
[...document.querySelectorAll('[role="button"]')].forEach(el => {
  const r = el.getBoundingClientRect();
  if (r.right > innerWidth + 1) console.warn("বাইরে", r.width, el.textContent.slice(0, 30));
});
```

`document.documentElement.scrollWidth` আর `innerWidth` সমান, অথচ ভেতরের
এলিমেন্ট চওড়া, মানে কনটেন্ট **কাটা পড়ছে**।

---

## ভাগ ৬. মোশন রুলবুক

1. **ফোল্ডের উপরে** থাকলে `animate`। হিরো কার্ড, টপ বার, ট্যাব বার।
2. **ফোল্ডের নিচে** থাকলে `whileInView` + `viewport={{ once: true, margin: "-40px" }}`।
   এটাই এই অ্যাপে সবচেয়ে বড় মোশন পরিবর্তন।
3. স্ট্যাগার সবসময় সীমিত রাখুন: `delay: Math.min(index * 0.03, 0.18)`।
4. ডিউরেশন ০.৩ সেকেন্ডের বেশি নয়, `ease: "easeOut"`। `src/lib/motion.ts`-এর
   `t`, `tFast`, `tMax`, `fadeUp` ব্যবহার করুন, নিজের ইচ্ছায় ডিউরেশন লিখবেন না।
5. প্রতিটি ট্যাপেবল জিনিসে `whileTap` (`0.97` থেকে `0.99`)। এটাই নেটিভ অনুভূতি দেয়।
6. `hover:` শুধু ডেস্কটপে কাজ করে। মোবাইলে hover অ্যানিমেশন গোনায় আসে না।
7. `prefers-reduced-motion` সম্মান করুন, `globals.css`-এ গ্লোবালি হ্যান্ডেল করা আছে।
8. `top`, `left`, `width`, `height` ক্রমাগত অ্যানিমেট করবেন না। `transform` ও `opacity` ব্যবহার করুন।

---

## ভাগ ৭. পারফরম্যান্স বাজেট

| জিনিস | সীমা |
| --- | --- |
| Discover পেজে DOM নোড | ১,৫০০-এর নিচে |
| horizontal রেলে কার্ড | ১২টা পর্যন্ত, তারপর "+N more" টাইল |
| লিস্ট ভিউতে সারি | ৫০-এর বেশি হলে paginate বা virtualize |
| নতুন অ্যানিমেশন লাইব্রেরি | `framer-motion` ছাড়া কিছু নয় |

---

## ভাগ ৮. গিট ওয়ার্কফ্লো (ধাপে ধাপে)

1. **ব্র্যাঞ্চ:** `main` থেকে নাম দিন, যেমন `fix/mobile-layout-and-motion`।
   `main`-এ সরাসরি কাজ করবেন না।
2. **কাজ:** ছোট ছোট কমিট, প্রতিটা কমিট এক কাজ।
3. **স্থানীয় যাচাই:**
   ```bash
   npx tsc --noEmit
   DATABASE_URL="postgres://u:p@127.0.0.1:5432/n" npx next build
   ```
4. **মোবাইল যাচাই:** বিল্ড লোকালে সার্ভ করে ৩৯০ এবং ৩২০px-এ মাপুন।
5. **PR:** কী সমস্যা, কেন হয়েছিল, কী বদলেছে, কীভাবে যাচাই করেছেন, এই চারটা লিখুন।
6. **রিভিউ + মার্জ:** `main`-এ মার্জ হলেই Vercel অটো ডিপ্লয় করবে।
7. **প্রোডাকশন যাচাই:** ডিপ্লয়ের ২ মিনিট পর আসল সাইটে আবার ৩৯০px-এ মাপুন।
   লোকাল বিল্ড ঠিক থাকলেও ডিপ্লয় ভিন্ন হতে পারে, তাই এই ধাপ বাদ দেবেন না।

### বর্তমান অবস্থা

- ব্র্যাঞ্চ: `fix/mobile-layout-and-motion` (ফর্ক `Nasim8499/nspace365`)
- PR: https://github.com/snbwallet365-ops/nspace365/pull/1
- কমিট: ২টা (মোবাইল + মোশন + পারফরম্যান্স, তারপর PWA আইকন)

**পারমিশন নোট:** সংযুক্ত GitHub অ্যাকাউন্টের এই রিপোতে শুধু pull আছে, push নেই।
তাই ফর্ক করে কাজ করে cross-fork PR দেওয়া হয়েছে। রিপোতে সরাসরি কমিট করতে
হলে অ্যাকাউন্টটিকে collaborator হিসেবে write অ্যাক্সেস দিন, অথবা webhook
দরকার হলে admin অ্যাক্সেস দিন।

---

## ভাগ ৯. প্রি-মার্জ চেকলিস্ট

কোনো ভিউ ছোঁয়া PR দেওয়ার আগে:

- [ ] `npx tsc --noEmit` পাস
- [ ] `npx next build` পাস
- [ ] ৩৯০x৮৪৪: কোনো এলিমেন্ট `innerWidth` ছাড়ায় না, ডান দিক কাটা পড়ে না
- [ ] ৩২০x৬৪০: এখনো কোনো ওভারফ্লো নেই
- [ ] প্রতিটি লিস্ট সারির মূল বাটন পুরো দেখা যাচ্ছে এবং ট্যাপ করা যাচ্ছে
- [ ] ফোল্ডের নিচের সেকশনে `whileInView`, `animate` নয়
- [ ] কনসোলে কোনো error বা hydration warning নেই
- [ ] Discover-এ DOM নোড ১,৫০০-এর নিচে
- [ ] নিচে safe-area padding অটুট আছে

---

## ভাগ ১০. ভেরিফিকেশন স্ক্রিপ্ট (কপি করে চালান)

```bash
npm i puppeteer-core@23
```

```js
// verify.mjs
import puppeteer from "puppeteer-core";

const browser = await puppeteer.launch({
  executablePath: "/usr/bin/google-chrome",
  headless: "new",
  args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
});

for (const [w, h] of [[390, 844], [320, 640]]) {
  const page = await browser.newPage();
  await page.setViewport({ width: w, height: h, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await page.setUserAgent("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1");
  await page.goto("https://iosliquid365.vercel.app/", { waitUntil: "networkidle2", timeout: 60000 });
  await new Promise((r) => setTimeout(r, 2500));
  await page.evaluate(() => {
    const b = [...document.querySelectorAll("button,a,[role=button]")]
      .find((e) => /continue without/i.test(e.textContent || ""));
    if (b) b.click();
  });
  await new Promise((r) => setTimeout(r, 4000));

  const out = await page.evaluate(() => {
    const rows = [...document.querySelectorAll('[role="button"]')]
      .filter((d) => /rounded-2xl py-2\.5/.test((d.className || "").toString()));
    const rails = [...document.querySelectorAll("div")]
      .filter((d) => /no-scrollbar/.test((d.className || "").toString()));
    return {
      vw: innerWidth,
      overflow: document.documentElement.scrollWidth - innerWidth,
      rows: rows.map((r) => {
        const rr = r.getBoundingClientRect();
        const btn = [...r.querySelectorAll("button")].pop();
        const br = btn ? btn.getBoundingClientRect() : null;
        return { w: Math.round(rr.width), btnRight: br ? Math.round(br.right) : null, ok: br ? br.right <= innerWidth : null };
      }),
      railCards: rails.map((r) => r.children.length),
      domNodes: document.querySelectorAll("*").length,
    };
  });
  console.log(w + "x" + h, JSON.stringify(out));
  await page.close();
}
await browser.close();
```

প্রত্যাশিত ফল:
- ৩৯০px: সারি ~৩৫৮px, প্রতিটা `ok: true`, `overflow: 0`
- ৩২০px: সারি ~২৮৮px, প্রতিটা `ok: true`
- `railCards`: ১১-এর বেশি নয়

---

## ভাগ ১১. ফাইল ম্যাপ

| কাজ | ফাইল |
| --- | --- |
| গ্রিড ও লিস্ট সারি | `TodayView.tsx`, `CategoryView.tsx`, `SearchView.tsx`, `GitHubView.tsx`, `ui/AppRow.tsx` |
| মোশন টোকেন | `src/lib/motion.ts` |
| গ্লোবাল CSS, keyframes, reduced motion | `src/app/globals.css` |
| ভিউপোর্ট ও zoom lock | `src/app/layout.tsx`, `shell/ViewportLock.tsx` |
| ট্যাব বার ও safe area | `src/components/shell/TabBar.tsx` |
| PWA ম্যানিফেস্ট ও আইকন | `public/manifest.webmanifest`, `src/app/layout.tsx`, `public/*.png` |
| অ্যাপ শেল ও ভিউ ট্রানজিশন | `src/components/AppShell.tsx` |
