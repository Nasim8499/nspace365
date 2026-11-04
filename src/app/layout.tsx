import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import ViewportLock from "@/components/shell/ViewportLock";

export const metadata: Metadata = {
  title: "N Space — Liquid Glass App Store & AI Hub",
  description: "An iOS-style app store with GitHub project sync and an AI Git terminal.",
  applicationName: "N Space",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "N Space", statusBarStyle: "default" },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    // iOS ignores SVG for the home-screen icon; it needs a real PNG.
    apple: [{ url: "/apple-touch-icon-180.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0A84FF",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-dvh overflow-hidden bg-white text-black antialiased">
        <ViewportLock />
        {children}
      </body>
    </html>
  );
}
