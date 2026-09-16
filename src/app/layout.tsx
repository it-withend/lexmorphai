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
  title: 'LexMorph AI — Living Legal Document Engine & Pro Se Justice',
  description:
    'Turn a phone photo of an eviction notice or lease into an editable living document, audit statutory defects, and generate a court-ready Answer as Word (.docx).',
  keywords: [
    'Legal Tech',
    'LexHack 2026',
    'Access to Justice',
    'Civic Tech',
    'Document Reconstruction',
    'Eviction Defense',
    'Pro Se Litigant',
    'DOCX Generator',
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
