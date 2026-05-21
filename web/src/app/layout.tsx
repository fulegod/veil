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

export const metadata: Metadata = {
  title: "VEIL — TRUSTLESS TIME CAPSULES",
  description:
    "Seal your alpha today. Cryptographic proof you called it first. On-chain, drand-encrypted, verifiable in Braga.",
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
