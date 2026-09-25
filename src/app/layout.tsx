import type { Metadata } from 'next';
import { Geist, Geist_Mono, Source_Serif_4 } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const sourceSerif = Source_Serif_4({
  variable: '--font-docket',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'LexMorph Defense Studio — LexHack 2026',
  description:
    'Spot problems in housing notices, draft Answer templates, practice court, and audit unsafe ChatGPT legal advice. Access to Justice + AI Safety. Educational only — not legal advice.',
  keywords: [
    'LexHack 2026',
    'Access to Justice',
    'AI Safety',
    'Tenant rights',
    'Housing Court',
    'Advice Auditor',
    'Defense Studio',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${sourceSerif.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100">{children}</body>
    </html>
  );
}
