import type { Metadata } from "next";
import { GeistSans, GeistMono } from "geist/font";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ar | Portfolio",
  description: "Web3 builder, automation engineer, and full-stack developer based in Yogyakarta.",
  authors: [{ name: "Ar" }],
  keywords: ["Ardhiansyah", "Mobile Developer", "IT Support", "Portfolio"],
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
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable} dark`}>
      <body className="antialiased bg-bg text-text">
        {children}
      </body>
    </html>
  );
}
