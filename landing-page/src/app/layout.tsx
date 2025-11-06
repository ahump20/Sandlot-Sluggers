import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Sandlot Sluggers | Backyard Baseball Reimagined',
  description:
    'Experience arcade-style baseball with 100% original characters, physics-driven gameplay, and mobile-first controls. Play Sandlot Sluggers now!',
  keywords: [
    'baseball game',
    'arcade baseball',
    'mobile game',
    'backyard baseball',
    'sports game',
    'browser game',
  ],
  authors: [{ name: 'Blaze Sports Intel' }],
  openGraph: {
    title: 'Sandlot Sluggers | Backyard Baseball Reimagined',
    description:
      'Experience arcade-style baseball with 100% original characters, physics-driven gameplay, and mobile-first controls.',
    type: 'website',
    url: 'https://blazesportsintel.com/sandlot-sluggers',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Sandlot Sluggers Game',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sandlot Sluggers | Backyard Baseball Reimagined',
    description:
      'Experience arcade-style baseball with physics-driven gameplay',
    images: ['/og-image.jpg'],
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="font-body antialiased">{children}</body>
    </html>
  );
}
