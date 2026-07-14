import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { AlertProvider } from "@/context/AlertContext";
import { TrafficTracker } from "@/components/analytics/TrafficTracker";
import { ServiceWorkerRegisterEngine } from "./ServiceWorkerRegisterEngine"; // Rendered below

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta"
});

// ✅ SAFE SERVER-SIDE SEO EXTRACTIONS (No "use client" at the top)
export const metadata: Metadata = {
  title: {
    default: "PaintIt // Interactive 3D Room Studio & Color Customizer",
    template: "%s | PaintIt Studio",
  },
  manifest: "/manifest.json",
  description: "See your colors before the first brush stroke. The premium architectural visualization tool designed for modern interior designers, decorators, and painters to close bids faster.",
  keywords: [
    "3D interior visualization",
    "Paint simulator",
    "Room customizer",
    "Interior design software",
    "Hostel painting portfolio",
    "Architectural paint visualizer"
  ],
  authors: [{ name: "PaintIt Studio Team" }],
  creator: "PaintIt Studio",
  publisher: "PaintIt Studio",

  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://paintit-six.vercel.app",
    title: "See Your Room Colors Instantly in 3D | PaintIt Studio",
    description: "Eradicate paint choice guesswork. Let clients customize walls, view ambient daylight shifts, and finalize space aesthetics interactively before buying paint.",
    siteName: "PaintIt Studio",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "PaintIt Interactive 3D Architecture Canvas Framework Preview",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "PaintIt Studio // Immersive Spatial Finishes Preview Engine",
    description: "Stop carrying paper color swatches to client briefs. Win your project contracts using interactive 3D visualization.",
    images: ["/og-image.png"],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="scroll-smooth"
    >
      <body className={`${jakarta.variable} font-sans bg-neutral-950 text-neutral-100 antialiased overflow-x-hidden`}>
        {/* ✅ Injects browser runtime hooks cleanly on server-side layouts */}
        <ServiceWorkerRegisterEngine />

        <AlertProvider>
          <AuthProvider>
            <TrafficTracker />
            {children}
          </AuthProvider>
        </AlertProvider>
      </body>
    </html>
  );
}