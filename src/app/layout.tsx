import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "N Space — Liquid Glass App Store & AI Hub",
  description: "An iOS-style app store with GitHub project sync and an AI Git terminal.",
  applicationName: "N Space",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "N Space", statusBarStyle: "default" },
  icons: { icon: "/api/icon/N?c1=007AFF&c2=5AC8FA", apple: "/api/icon/N?c1=007AFF&c2=5AC8FA" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-black antialiased">{children}</body>
    </html>
  );
}
