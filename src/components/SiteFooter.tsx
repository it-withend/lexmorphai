'use client';

import Link from 'next/link';
import { ExternalLink, Code2, Timer, Shield } from 'lucide-react';

export default function SiteFooter() {
  return (
    <footer className="border-t border-brass/15 bg-ink/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-6 md:items-start md:justify-between">
        <div className="space-y-2 max-w-xl">
          <p className="text-sm font-semibold text-white">LexMorph AI · LexHack 2026</p>
          <p className="text-xs text-slate-500 leading-relaxed">
            Educational Access-to-Justice prototype — not a law firm, not legal advice. Tracks: Access to
            Justice & Civic Tech · AI Safety.
          </p>
          <p className="text-[11px] text-slate-600 flex items-start gap-1.5 leading-relaxed">
            <Timer className="w-3.5 h-3.5 mt-0.5 shrink-0 text-brass" />
            Judges: Studio → NYC practice example → Answer draft → Hearing Coach → Auditor skip-court demo.
            Live:{' '}
            <a
              href="https://lexmorphai.vercel.app"
              className="text-brass hover:text-brass-bright underline-offset-2 hover:underline"
            >
              lexmorphai.vercel.app
            </a>
          </p>
        </div>
        <div className="flex flex-wrap gap-3 text-xs">
          <a
            href="https://github.com/it-withend/lexmorphai"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
          >
            <Code2 className="w-3.5 h-3.5" />
            GitHub
            <ExternalLink className="w-3 h-3 opacity-60" />
          </a>
          <Link
            href="/studio"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
          >
            Defense Studio
          </Link>
          <Link
            href="/auditor"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
          >
            <Shield className="w-3.5 h-3.5 text-brass" />
            Advice Auditor
          </Link>
        </div>
      </div>
    </footer>
  );
}
