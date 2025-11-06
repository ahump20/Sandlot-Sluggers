import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BlazeSportsIntel",
  description: "High-velocity sports intelligence built for Cloudflare.",
  metadataBase: new URL("https://www.blazesportsintel.com")
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="bg-slate-950 text-slate-50">
      <body className={`${inter.className} min-h-screen antialiased`}>{children}</body>
    </html>
  );
}
