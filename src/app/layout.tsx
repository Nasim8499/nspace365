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
  icons: { icon: "/api/icon/N?c1=007AFF&c2=5AC8FA", apple: "/api/icon/N?c1=007AFF&c2=5AC8FA" },
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
