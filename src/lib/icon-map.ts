import {
  Aperture, NotebookPen, HeartPulse, CloudSun, Music2, Timer, Mail, Palette, Map, Wallet, Languages, Moon,
  Swords, Car, Castle, Orbit, Flame, Mountain, Smile, Flower2, Zap, CircleDot, Cookie, TrainFront,
  TerminalSquare, GitBranch, Sparkles, type LucideIcon,
} from "lucide-react";

const map: Record<string, LucideIcon> = {
  Aperture, NotebookPen, HeartPulse, CloudSun, Music2, Timer, Mail, Palette, Map, Wallet, Languages, Moon,
  Swords, Car, Castle, Orbit, Flame, Mountain, Smile, Flower2, Zap, CircleDot, Cookie, TrainFront,
  TerminalSquare, GitBranch, Sparkles,
};

export function iconFor(name: string): LucideIcon {
  return map[name] ?? Sparkles;
}
