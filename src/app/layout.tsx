import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ar | Portfolio",
  description: "Web3 builder, automation engineer, and full-stack developer based in Yogyakarta.",
  authors: [{ name: "Ar" }],
  openGraph: {
    title: "Ar | Web3 Builder",
    description: "Building the decentralized future, one protocol at a time.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} dark`}>
      <body className="antialiased bg-bg text-text">
        <div className="grain" />
        {children}
      </body>
    </html>
  );
}
