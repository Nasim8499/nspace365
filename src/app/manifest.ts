import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "N Space — Liquid Glass App Store & AI Hub",
    short_name: "N Space",
    description: "An iOS-style app store with GitHub sync and an AI Git terminal.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    icons: [
      { src: "/api/icon/N?c1=007AFF&c2=5AC8FA", sizes: "512x512", type: "image/svg+xml", purpose: "any" },
    ],
  };
}
