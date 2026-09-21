'use client';

import Link from 'next/link';
import { AlertTriangle, ExternalLink, Lock, Scale } from 'lucide-react';

/** Shared trust / ethics strip for LexHack judges and real users. */
export default function TrustStrip({ compact = false }: { compact?: boolean }) {
  return (
    <aside
      className={`rounded-2xl border border-amber-500/25 bg-amber-500/5 ${
        compact ? 'p-3 space-y-2' : 'p-4 sm:p-5 space-y-3'
      }`}
    >
      <p className="text-xs sm:text-sm font-semibold text-amber-100 flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
        Not a lawyer. Not legal advice. Educational prototype only.
      </p>
      {!compact && (
        <p className="text-[11px] sm:text-xs text-slate-400 leading-relaxed">
          LexMorph helps you spot issues and practice — it does <strong className="text-slate-300">not</strong>{' '}
          replace a lawyer, legal aid clinic, or the court. Draft Answers are templates for learning; formats
          and outcomes vary by court. Never skip a hearing based on this app or a chatbot.
        </p>
      )}
      <div className="flex flex-wrap gap-2 text-[11px]">
        <a
          href="https://www.lawhelpny.org/"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-950/70 border border-slate-700 text-slate-300 hover:text-white"
        >
          <Scale className="w-3 h-3 text-emerald-400" />
          LawHelpNY
          <ExternalLink className="w-3 h-3 opacity-50" />
        </a>
        <a
          href="https://legalaidnyc.org/"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-950/70 border border-slate-700 text-slate-300 hover:text-white"
        >
          Legal Aid NYC
          <ExternalLink className="w-3 h-3 opacity-50" />
        </a>
        <a
          href="https://selfhelp.courts.ca.gov/"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-950/70 border border-slate-700 text-slate-300 hover:text-white"
        >
          CA Courts Self-Help
          <ExternalLink className="w-3 h-3 opacity-50" />
        </a>
        <Link
          href="/auditor"
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-violet-500/10 border border-violet-500/25 text-violet-200 hover:text-white"
        >
          Audit chatbot advice
        </Link>
      </div>
      <p className="text-[10px] text-slate-500 leading-relaxed flex items-start gap-1.5">
        <Lock className="w-3 h-3 mt-0.5 shrink-0" />
        Privacy: practice examples stay on your device. If you paste or photograph a notice, the text goes to
        our server. When our AI is on, that text may be sent to the AI provider. Do not paste Social Security
        numbers or bank details.
      </p>
    </aside>
  );
}
