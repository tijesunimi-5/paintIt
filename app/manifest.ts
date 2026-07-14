// app/manifest.ts
import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PaintIt Studio OS",
    short_name: "PaintIt",
    description: "Premium 3D Interior Design Playground",
    start_url: "/playground",
    display: "standalone", // 🔑 THIS forces the browser bar to disappear on mobile!
    background_color: "#0a0a0a",
    theme_color: "#0a0a0a",
    orientation: "any",
    // icons: [
    //   {
    //     src: "/icon-192.png",
    //     sizes: "192x192",
    //     type: "image/png",
    //   },
    //   {
    //     src: "/icon-512.png",
    //     sizes: "512x512",
    //     type: "image/png",
    //   },
    // ],
  };
}
