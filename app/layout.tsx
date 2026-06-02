import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 1. ADVANCED METADATA MATRIX CONFIGURATION
export const metadata: Metadata = {
  title: {
    default: "PaintIt // Interactive 3D Room Studio & Color Customizer",
    template: "%s | PaintIt Studio",
  },
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

  // OpenGraph metrics control how your link expands visually on WhatsApp, iMessage, and LinkedIn
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://paintit-six.vercel.app", // Ensure this matches your production domain
    title: "See Your Room Colors Instantly in 3D | PaintIt Studio",
    description: "Eradicate paint choice guesswork. Let clients customize walls, view ambient daylight shifts, and finalize space aesthetics interactively before buying paint.",
    siteName: "PaintIt Studio",
    images: [
      {
        url: "/og-image.png", // Drop a 1200x630 dark minimal screenshot here later
        width: 1200,
        height: 630,
        alt: "PaintIt Interactive 3D Architecture Canvas Framework Preview",
      },
    ],
  },

  // Twitter visual micro-cards layout configurations
  twitter: {
    card: "summary_large_image",
    title: "PaintIt Studio // Immersive Spatial Finishes Preview Engine",
    description: "Stop carrying paper color swatches to client briefs. Win your project contracts using interactive 3D visualization.",
    images: ["/og-image.png"],
  },

  // Tells search engine spiders how to catalog the index priority pathways
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

// 2. VIEWPORT MATRIX OVERRIDES (Recommended Next.js 14/15 practice to split from metadata)
export const viewport: Viewport = {
  themeColor: "#09090b", // Dark mode charcoal trim matching your dashboard background
  width: "device-width",
  initialScale: 1,
  maximumScale: 1, // Fixes canvas scale bouncing shifts on mobile devices
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#09090b] text-white">
        {children}
      </body>
    </html>
  );
}