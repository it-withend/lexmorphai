import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'LexMorph AI — Defense Studio for LexHack 2026',
  description:
    'Audit notices & leases, draft court Answers, rehearse hearings, and stress-test unsafe ChatGPT legal advice. Access to Justice + AI Safety.',
  keywords: [
    'Legal Tech',
    'LexHack 2026',
    'Access to Justice',
    'Civic Tech',
    'AI Safety',
    'Eviction Defense',
    'Pro Se Litigant',
    'Advice Auditor',
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100">{children}</body>
    </html>
  );
}
