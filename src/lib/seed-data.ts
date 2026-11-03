import type { apps } from "@/db/schema";

type Seed = typeof apps.$inferInsert;

const base = (s: Partial<Seed> & Pick<Seed, "id" | "name" | "category" | "icon" | "color1" | "color2">, i: number): Seed => ({
  subtitle: "",
  genre: "",
  description: "",
  rating: 4.7,
  ratings: 2400,
  size: "84 MB",
  age: "4+",
  version: "2.1.0",
  developer: "N Space Labs",
  changelog: "Bug fixes and performance improvements.",
  status: "available",
  source: "catalog",
  meta: {},
  sortOrder: i,
  ...s,
});

const list: (Partial<Seed> & Pick<Seed, "id" | "name" | "category" | "icon" | "color1" | "color2">)[] = [
  // ---------- Apps ----------
  {
    id: "lumen", name: "Lumen Camera", subtitle: "Pro photography, effortlessly", category: "apps", genre: "Photo & Video",
    icon: "Aperture", color1: "#FF9F0A", color2: "#FF375F", rating: 4.9, ratings: 182400, size: "212 MB", version: "5.0.0",
    developer: "Lumen Studio", badge: "NOW AVAILABLE", status: "installed",
    description: "Lumen brings studio-grade controls to your pocket. Shoot in RAW, fine-tune depth, and edit with non-destructive filters crafted by professional colorists. Everything syncs instantly across your devices.",
    changelog: "Introducing Lumen 5 — Liquid Glass viewfinder, 48MP RAW capture, and a brand new portrait relight engine.",
  },
  {
    id: "orbit", name: "Orbit Notes", subtitle: "Thoughts that connect", category: "apps", genre: "Productivity",
    icon: "NotebookPen", color1: "#FFD60A", color2: "#FF9F0A", rating: 4.8, ratings: 96120, size: "58 MB", version: "3.4.2",
    developer: "Orbit Inc.", description: "A calm, fast notebook with backlinks, handwriting search, and a graph view that reveals how your ideas relate. Share live pages with a tap.",
    changelog: "Smart folders, faster search, and Pencil palm rejection improvements.",
  },
  {
    id: "pulse", name: "Pulse Fitness", subtitle: "Move. Recover. Repeat.", category: "apps", genre: "Health & Fitness",
    icon: "HeartPulse", color1: "#FF375F", color2: "#FF2D55", rating: 4.8, ratings: 74310, size: "142 MB", version: "7.2.0",
    developer: "Pulse Health", status: "update", badge: "MAJOR UPDATE",
    description: "Guided workouts, adaptive training plans and recovery insights that learn from your heart rate. Close your rings with friends in shared challenges.",
    changelog: "Major update: Adaptive plans 2.0, live heart-rate zones on Lock Screen, and 30 new studio workouts.",
  },
  {
    id: "aurora", name: "Aurora Weather", subtitle: "Forecasts in full colour", category: "apps", genre: "Weather",
    icon: "CloudSun", color1: "#64D2FF", color2: "#0A84FF", rating: 4.7, ratings: 58900, size: "46 MB", version: "4.0.1",
    developer: "Northlight", description: "Hyperlocal minute-by-minute forecasts, animated radar, and gorgeous sky scenes that reflect the real weather outside your window.",
    changelog: "Severe weather alerts are now delivered up to 20 minutes earlier.",
  },
  {
    id: "flux", name: "Flux Music", subtitle: "100 million songs, lossless", category: "apps", genre: "Music",
    icon: "Music2", color1: "#BF5AF2", color2: "#FF2D55", rating: 4.8, ratings: 412000, size: "178 MB", version: "9.1.0",
    developer: "Flux Audio", status: "installed",
    description: "Spatial audio, live lyrics and curated radio from real humans. Download for offline, and hand off playback between devices seamlessly.",
    changelog: "New Mix Together feature lets friends blend playlists live.",
  },
  {
    id: "tide", name: "Tide Focus", subtitle: "Deep work, beautifully timed", category: "apps", genre: "Productivity",
    icon: "Timer", color1: "#30D158", color2: "#00C7BE", rating: 4.6, ratings: 22300, size: "31 MB", version: "2.8.0",
    developer: "Tide Works", description: "A gentle focus timer with ambient soundscapes, streak tracking and Focus mode integration that silences distractions automatically.",
    changelog: "New ambient sounds: Rainforest, Night Train and Cafe Murmur.",
  },
  {
    id: "nimbus", name: "Nimbus Mail", subtitle: "Inbox zero, finally", category: "apps", genre: "Productivity",
    icon: "Mail", color1: "#0A84FF", color2: "#5E5CE6", rating: 4.6, ratings: 31200, size: "92 MB", version: "6.3.0",
    developer: "Nimbus Labs", description: "Smart triage, snooze, undo-send and AI summaries bring your inbox under control. Works with every provider.",
    changelog: "Summaries now support long threads and attachments.",
  },
  {
    id: "canvas", name: "Canvas Studio", subtitle: "Sketch, paint, animate", category: "apps", genre: "Graphics & Design",
    icon: "Palette", color1: "#FF6482", color2: "#BF5AF2", rating: 4.9, ratings: 88400, size: "310 MB", version: "11.0.0",
    developer: "Canvas Co.", badge: "EDITORS' CHOICE",
    description: "A complete illustration studio with 200 hand-tuned brushes, perfect-pressure Pencil support and frame-by-frame animation.",
    changelog: "Brush engine rewritten for 120Hz ProMotion with zero latency.",
  },
  {
    id: "terra", name: "Terra Maps", subtitle: "Explore the planet", category: "apps", genre: "Navigation",
    icon: "Map", color1: "#34C759", color2: "#0A84FF", rating: 4.5, ratings: 120500, size: "164 MB", version: "8.0.4",
    developer: "Terra Nav", description: "Offline maps, 3D city flyovers, and trail-grade hiking routes with elevation profiles.",
    changelog: "Added transit crowding indicators for 40 new cities.",
  },
  {
    id: "wallet", name: "Pocket Ledger", subtitle: "Money, made calm", category: "apps", genre: "Finance",
    icon: "Wallet", color1: "#1C1C1E", color2: "#48484A", rating: 4.7, ratings: 40100, size: "71 MB", version: "3.2.0",
    developer: "Ledger Labs", description: "Automatic budgets, subscription tracking and shared household spaces — all private and on-device.",
    changelog: "New recurring-bill detection with smarter reminders.",
  },
  {
    id: "lingo", name: "Lingua", subtitle: "Learn any language", category: "apps", genre: "Education",
    icon: "Languages", color1: "#FF9F0A", color2: "#30D158", rating: 4.8, ratings: 260300, size: "125 MB", version: "12.4.0",
    developer: "Lingua Ltd.", description: "Bite-sized lessons with real conversations, speech coaching and adaptive review that fits your day.",
    changelog: "Offline lessons are now available for every language pack.",
  },
  {
    id: "zen", name: "Zenith Sleep", subtitle: "Wake up renewed", category: "apps", genre: "Health & Fitness",
    icon: "Moon", color1: "#5E5CE6", color2: "#1C1C3E", rating: 4.7, ratings: 51200, size: "88 MB", version: "2.0.0",
    developer: "Zenith", description: "Sleep stories, smart alarms and nightly insights that help you build a healthier routine.",
    changelog: "Smart alarm now tracks light-sleep windows more accurately.",
  },
  // ---------- Games ----------
  {
    id: "skyforge", name: "Skyforge Legends", subtitle: "Forge your sky-fleet", category: "games", genre: "Action RPG",
    icon: "Swords", color1: "#FF453A", color2: "#FF9F0A", rating: 4.8, ratings: 322000, size: "2.4 GB", age: "12+", version: "3.1.0",
    developer: "Ember Games", badge: "NOW AVAILABLE",
    description: "Command legendary airships in this cinematic action RPG. Craft weapons, recruit heroes and battle across floating kingdoms in stunning 120Hz.",
    changelog: "Season 3: The Storm Citadel — new raid, 12 heroes and cross-play arenas.",
  },
  {
    id: "neondrift", name: "Neon Drift", subtitle: "Race through the night", category: "games", genre: "Racing",
    icon: "Car", color1: "#BF5AF2", color2: "#0A84FF", rating: 4.7, ratings: 190400, size: "1.6 GB", age: "9+", version: "6.0.2",
    developer: "Afterglow", status: "installed", description: "Slide through rain-slicked neon cities in ultra-smooth arcade racing. Tune 80 cars and challenge friends in real time.",
    changelog: "Tokyo Night track pack and ray-traced reflections on supported devices.",
  },
  {
    id: "chrono", name: "Chrono Kingdoms", subtitle: "Rule across the ages", category: "games", genre: "Strategy",
    icon: "Castle", color1: "#30D158", color2: "#FFD60A", rating: 4.6, ratings: 154200, size: "980 MB", age: "9+", version: "4.4.0",
    developer: "Hourglass", description: "Build an empire that evolves from the stone age to the stars. Forge alliances, research tech and defend your timeline.",
    changelog: "Added Alliance Wars and 4 new eras.",
  },
  {
    id: "galaxy", name: "Pocket Galaxy", subtitle: "Your own universe", category: "games", genre: "Simulation",
    icon: "Orbit", color1: "#0A84FF", color2: "#5E5CE6", rating: 4.8, ratings: 110200, size: "720 MB", age: "4+", version: "2.2.0",
    developer: "Stellar", description: "Seed planets, nurture life and watch civilisations rise in a relaxing sandbox universe.",
    changelog: "New biomes: Crystal Deserts and Aurora Oceans.",
  },
  {
    id: "hollow", name: "Hollow Lanterns", subtitle: "Light the way", category: "games", genre: "Adventure",
    icon: "Flame", color1: "#FF9F0A", color2: "#8E3B00", rating: 4.9, ratings: 76500, size: "1.2 GB", age: "9+", version: "1.5.0",
    developer: "Moth & Lamp", badge: "EDITORS' CHOICE", description: "A hand-painted puzzle adventure about a lantern-bearer crossing a forgotten world. Winner of the Design Award.",
    changelog: "Chapter 5 and a gorgeous new soundtrack.",
  },
  {
    id: "summit", name: "Summit Dash", subtitle: "Climb. Leap. Conquer.", category: "games", genre: "Platformer",
    icon: "Mountain", color1: "#64D2FF", color2: "#30D158", rating: 4.6, ratings: 61000, size: "420 MB", age: "4+", version: "1.9.1",
    developer: "Highline", description: "Precision platforming with generous checkpoints and 150 handcrafted peaks.",
    changelog: "Added daily Summit challenges and leaderboards.",
  },
  // ---------- Arcade ----------
  {
    id: "pixelpals", name: "Pixel Pals", subtitle: "Tiny friends, big fun", category: "arcade", genre: "Casual",
    icon: "Smile", color1: "#FFD60A", color2: "#FF375F", rating: 4.8, ratings: 45000, size: "180 MB", version: "1.3.0",
    developer: "N Arcade", badge: "ARCADE", description: "Adopt, dress and play with adorable pixel creatures. No ads. No in-app purchases.",
    changelog: "New seasonal outfits and 4 mini-games.",
  },
  {
    id: "bloom", name: "Block Bloom", subtitle: "Puzzles that blossom", category: "arcade", genre: "Puzzle",
    icon: "Flower2", color1: "#FF6482", color2: "#FF9F0A", rating: 4.7, ratings: 38100, size: "140 MB", version: "2.0.0",
    developer: "N Arcade", description: "A soothing block puzzler where every clear grows a garden. Play offline anywhere.",
    changelog: "200 new levels and a relaxing Zen mode.",
  },
  {
    id: "dojo", name: "Dash Dojo", subtitle: "Slash in perfect rhythm", category: "arcade", genre: "Action",
    icon: "Zap", color1: "#5E5CE6", color2: "#BF5AF2", rating: 4.6, ratings: 29000, size: "260 MB", age: "9+", version: "1.1.0",
    developer: "N Arcade", description: "Swipe to the beat in this rhythm-action game with stylish ink-wash visuals.",
    changelog: "Added Controller support and two new masters.",
  },
  {
    id: "bubble", name: "Bubble Cosmos", subtitle: "Pop your way through space", category: "arcade", genre: "Puzzle",
    icon: "CircleDot", color1: "#0A84FF", color2: "#64D2FF", rating: 4.5, ratings: 21000, size: "112 MB", version: "3.2.0",
    developer: "N Arcade", description: "Aim, bounce and pop colourful bubbles across 400 cosmic levels.",
    changelog: "New nebula levels and power-ups.",
  },
  {
    id: "mochi", name: "Mochi Match", subtitle: "Sweet little matches", category: "arcade", genre: "Casual",
    icon: "Cookie", color1: "#FF9FB2", color2: "#FFD60A", rating: 4.8, ratings: 52000, size: "98 MB", version: "1.7.0",
    developer: "N Arcade", status: "installed", description: "Swap and match delightful mochi treats in cosy, low-stress puzzles.",
    changelog: "Kitchen decor and 60 new recipes.",
  },
  {
    id: "tracks", name: "Tiny Tracks", subtitle: "Build the little railway", category: "arcade", genre: "Simulation",
    icon: "TrainFront", color1: "#30D158", color2: "#0A84FF", rating: 4.7, ratings: 33000, size: "205 MB", version: "2.4.0",
    developer: "N Arcade", description: "Lay tracks, route trains and keep the miniature world running on time.",
    changelog: "Mountain tunnels and snow weather.",
  },
  // ---------- Developer / platform ----------
  {
    id: "nterminal", name: "N Terminal", subtitle: "AI-powered Git workspace", category: "developer", genre: "Developer Tools",
    icon: "TerminalSquare", color1: "#007AFF", color2: "#5AC8FA", rating: 4.9, ratings: 8800, size: "24 MB", version: "1.0.0",
    developer: "N Space", badge: "NEW", status: "installed", url: "#ai",
    description: "Chat with your repositories. Pull, commit, branch, push and review code through natural language — right inside N Space.",
    changelog: "Initial release.",
  },
];

export const seedApps: Seed[] = list.map((a, i) => base(a, i));
