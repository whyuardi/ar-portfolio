import type { Metadata } from "next";
import localFont from "next/font/local";
import WebGLBackgroundWrapper from "@/components/WebGLBackgroundWrapper";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff2",
  variable: "--font-geist-sans",
  display: "swap",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff2",
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ar | Portfolio",
  description: "Web3 builder, automation engineer, and full-stack developer based in Yogyakarta.",
  authors: [{ name: "Ar" }],
  keywords: ["Ardhiansyah Wahyu Setyadi", "Mobile Developer", "IT Support", "Portfolio", "Web3"],
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "Ar | Web3 Builder",
    description: "Building the decentralized future, one protocol at a time.",
    images: [
      {
        url: "https://ar-portfolio-dusky.vercel.app/og.png",
        width: 1200,
        height: 630,
      },
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} dark`}>
      <body className="antialiased bg-bg text-text">
        <WebGLBackgroundWrapper />
        <div style={{ position: "relative", zIndex: 1 }}>
          {children}
        </div>
      </body>
    </html>
  );
}
