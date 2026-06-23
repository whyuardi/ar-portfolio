import type { Metadata } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["300", "400", "500"],
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Ardhiansyah — Creative Developer",
  description:
    "Mobile developer, Web3 builder, and full-stack engineer. Building digital experiences from Yogyakarta.",
  authors: [{ name: "Ardhiansyah Wahyu Setyadi" }],
  keywords: [
    "Ardhiansyah",
    "Mobile Developer",
    "Web3",
    "Portfolio",
    "Full-stack",
    "IT Support",
  ],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Ardhiansyah — Creative Developer",
    description:
      "Mobile developer, Web3 builder, and full-stack engineer. Building digital experiences from Yogyakarta.",
    siteName: "Ardhiansyah",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${cormorant.variable} dark`}
      style={{ backgroundColor: "#08080A" }}
    >
      <body className="antialiased" style={{ backgroundColor: "#08080A", color: "#F8F7F2" }}>
        {children}
      </body>
    </html>
  );
}
