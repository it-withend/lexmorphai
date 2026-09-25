'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import TrustStrip from '@/components/TrustStrip';
import SiteFooter from '@/components/SiteFooter';
import {
  Scale,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  FileCheck,
  Users,
  Gavel,
  BadgeCheck,
  AlertTriangle,
  Info,
} from 'lucide-react';

const LOOP = [
  { n: '01', href: '/studio', title: 'Read the notice', detail: 'Flag 3-day demands, illegal fees, void clauses.' },
  { n: '02', href: '/simulator', title: 'Say it in court', detail: 'Rehearse the 14-day rule before a practice judge.' },
  { n: '03', href: '/auditor', title: 'Catch bad AI', detail: 'Stop “skip court” chatbot advice before anyone acts.' },
] as const;

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-ink text-cream">
      <Navbar />

      <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-brass/15 blur-[120px] pointer-events-none -z-10 rounded-full" />
        <div
          className="absolute inset-0 pointer-events-none -z-10 opacity-[0.04]"
          style={{
            backgroundImage:
              'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%2394a3b8\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            <div className="lg:col-span-7 space-y-7">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-brass/10 text-brass border border-brass/25">
                <BadgeCheck className="w-3.5 h-3.5" />
                LexHack 2026 · Access to Justice + AI Safety
              </div>

              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl xl:text-6xl font-extrabold text-white tracking-tight leading-[1.08]">
                  A 3-day rent demand
                  <span className="block font-docket font-semibold italic text-brass-bright mt-1">
                    is often not enough.
                  </span>
                </h1>
                <p className="text-base sm:text-lg text-slate-300 max-w-xl leading-relaxed">
                  Spot problems in a housing notice, practice what to say in court, and catch dangerous
                  ChatGPT “legal advice” before anyone acts on it. Educational — not a lawyer.
                </p>
              </div>

              <TrustStrip compact />

              <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3">
                <Link
                  href="/studio"
                  className="px-6 py-3.5 rounded-2xl font-semibold text-sm bg-brass hover:bg-brass-bright text-ink flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Open NYC demo
                </Link>
                <Link
                  href="/auditor"
                  className="px-6 py-3.5 rounded-2xl font-bold text-sm bg-ink-2 border border-brass/40 text-brass-bright flex items-center justify-center gap-2 group"
                >
                  <ShieldAlert className="w-4 h-4" />
                  Audit ChatGPT advice
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/simulator"
                  className="px-6 py-3.5 rounded-2xl font-semibold text-sm bg-slate-900 border border-slate-700 text-slate-200 flex items-center justify-center gap-2"
                >
                  <Gavel className="w-4 h-4 text-brass" />
                  Hearing practice
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="relative">
                <div className="absolute -inset-3 rounded-[28px] bg-brass/10 blur-2xl pointer-events-none" />
                <div className="relative rounded-[22px] bg-[#f4efe4] text-[#1c1917] shadow-2xl shadow-black/40 border border-[#e2d6c2] overflow-hidden rotate-[1.2deg] hover:rotate-0 transition-transform duration-500">
                  <div className="px-5 py-3 bg-[#2a2118] text-[#f4efe4] flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-[0.18em]">Kings County · Housing Part</span>
                    <span className="text-[10px] font-mono text-amber-200">LT-304928-26</span>
                  </div>
                  <div className="px-6 py-5 space-y-3">
                    <p className="font-docket text-[11px] uppercase tracking-[0.2em] text-[#7c6a4f]">
                      Notice to tenant
                    </p>
                    <h2 className="font-docket text-xl leading-snug font-semibold">
                      Demand for rent — pay within{' '}
                      <span className="line-through decoration-red-600 decoration-2 text-red-800/80">three (3) days</span>
                    </h2>
                    <p className="text-xs text-[#5c5346] leading-relaxed">
                      Metropolitan Realty Holdings · 418 Atlantic Avenue, Apt 4B · Brooklyn
                    </p>
                    <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200">
                      <AlertTriangle className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
                      <p className="text-xs text-red-900 leading-relaxed">
                        <strong>Flagged:</strong> NY nonpayment usually needs a written{' '}
                        <span className="font-docket italic">fourteen-day</span> demand — RPAPL § 711(2).
                      </p>
                    </div>
                    <p className="text-[10px] text-[#8a7d68]">
                      Practice example · educational only · not a court filing
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-4xl mt-12">
            {LOOP.map((step) => (
              <Link
                key={step.n}
                href={step.href}
                className="p-4 rounded-2xl bg-ink-2 border border-brass/15 hover:border-brass/40 transition-colors text-left"
              >
                <span className="font-mono text-[11px] text-brass">{step.n}</span>
                <p className="text-sm font-bold text-white mt-1">{step.title}</p>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{step.detail}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 bg-[#0e0d0b] border-y border-[#2a261c]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#f3ead8] font-docket">
              One file. Three rooms.
            </h2>
            <p className="text-sm text-[#b7ae9c]">
              Clerk&apos;s desk, courtroom calendar, then a second look at the chatbot — in that order.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-0 md:divide-x md:divide-[#2a261c]">
            {[
              {
                n: '01',
                href: '/studio',
                Icon: FileCheck,
                title: 'Defense Studio',
                body: 'Read a notice like a clerk would — 3-day demands, illegal fees, void clauses — then draft an Answer you can edit.',
                cta: 'Open the NYC file',
              },
              {
                n: '02',
                href: '/simulator',
                Icon: Scale,
                title: 'Hearing Coach',
                body: 'Say it out loud to a practice judge who answers this turn — not a canned script. Coaching only, not a win prediction.',
                cta: 'Step up to the calendar',
              },
              {
                n: '03',
                href: '/auditor',
                Icon: ShieldAlert,
                title: 'Advice Auditor',
                body: 'Paste what ChatGPT told you. We mark skip-court and overconfident lines, then put a safer rewrite beside them.',
                cta: 'Audit skip-court advice',
              },
            ].map((card) => (
              <Link
                key={card.n}
                href={card.href}
                className="group p-6 md:px-7 bg-[#12110e] first:rounded-l-3xl last:rounded-r-3xl border border-[#2a261c] md:border-y md:border-x-0 first:md:border-l last:md:border-r hover:bg-[#18160f] transition-colors"
              >
                <div className="flex items-center justify-between mb-5">
                  <span className="font-docket text-[#c4a46a] text-2xl">{card.n}</span>
                  <card.Icon className="w-5 h-5 text-[#c4a46a]/80" />
                </div>
                <h3 className="text-lg font-docket text-[#f3ead8]">{card.title}</h3>
                <p className="text-sm text-[#b7ae9c] leading-relaxed mt-2 min-h-[4.5rem]">{card.body}</p>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#e8d7b8] mt-4 group-hover:gap-2.5 transition-all">
                  {card.cta} <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 border-t border-slate-800/60">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Info className="w-4 h-4 text-slate-400" />
            Limitations (honest)
          </h2>
          <ul className="text-xs text-slate-400 space-y-2 leading-relaxed list-disc pl-5">
            <li>
              <strong className="text-slate-300">PDF upload</strong> is not supported yet — use paste, a photo of
              the page (on-device OCR), or Word (.docx).
            </li>
            <li>
              <strong className="text-slate-300">Practice examples</strong> are ready-made so demos always work.
              Your own paste/photo uses built-in checks plus our server AI when it is turned on — you never need
              your own API key.
            </li>
            <li>
              <strong className="text-slate-300">Answer drafts</strong> are educational templates — not guaranteed
              “court-ready” filings. Formats differ by court; get help from Legal Aid / LawHelp when you can.
            </li>
            <li>
              <strong className="text-slate-300">Defense bands</strong> are qualitative teaching signals — not win
              probabilities.
            </li>
          </ul>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-12 rounded-3xl bg-ink-2 border border-brass/25 relative overflow-hidden">
            <div className="absolute right-8 top-8 opacity-10 pointer-events-none">
              <Scale className="w-40 h-40 text-brass" />
            </div>
            <div className="max-w-2xl space-y-4 relative z-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brass/10 text-brass border border-brass/25">
                <Users className="w-3.5 h-3.5" />
                Access to Justice gap
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Most tenants lose on procedure — not on the merits.
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                LexMorph helps people spot defective notices, draft defenses, rehearse hearings, and reject unsafe
                chatbot advice. Educational prototype — not a substitute for a lawyer.
              </p>
              <Link
                href="/studio"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-brass text-ink"
              >
                Try the NYC eviction demo
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
