import type { Metadata } from "next";
import { JetBrains_Mono, Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Providers } from "./providers";

// Mono is the voice. Inter is only used for the occasional long-form essay.
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const SITE_URL = "https://web-eta-hazel-33.vercel.app";
const TITLE = "VEIL — TRUSTLESS TIME CAPSULES";
const DESCRIPTION =
  "Seal your alpha today. Cryptographic proof you called it first. On-chain, drand-encrypted, verifiable in Braga.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  applicationName: "Veil",
  keywords: [
    "Arkiv",
    "ETHNS",
    "drand",
    "timelock encryption",
    "time capsule",
    "alpha calls",
    "verifiable predictions",
    "on-chain proof",
    "Web3 privacy",
    "decentralized storage",
  ],
  authors: [{ name: "fulegod", url: "https://github.com/fulegod" }],
  creator: "fulegod",
  publisher: "Veil",
  category: "technology",
  // Open Graph & Twitter pull the dynamic image from /opengraph-image.tsx
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "Veil",
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    creator: "@fulegod",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${jetbrainsMono.variable} ${inter.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-white text-black antialiased selection:bg-[#00e676] selection:text-black">
        <Script src="/error-silencer.js" strategy="beforeInteractive" />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
