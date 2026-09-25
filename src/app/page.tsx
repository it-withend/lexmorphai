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
  CheckCircle2,
  Users,
  Shield,
  Gavel,
  FileText,
  Mic2,
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
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-emerald-500/20 selection:text-emerald-300">
      <Navbar />

      <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-emerald-500/15 via-teal-500/10 to-cyan-500/10 blur-[120px] pointer-events-none -z-10 rounded-full" />
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
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <BadgeCheck className="w-3.5 h-3.5" />
                LexHack 2026 · Access to Justice + AI Safety
              </div>

              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl xl:text-6xl font-extrabold text-white tracking-tight leading-[1.08]">
                  A 3-day rent demand
                  <span className="block font-docket font-semibold italic text-emerald-300/95 mt-1">
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
                  className="px-6 py-3.5 rounded-2xl font-semibold text-sm bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Open NYC demo
                </Link>
                <Link
                  href="/auditor"
                  className="px-6 py-3.5 rounded-2xl font-bold text-sm bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-xl shadow-violet-500/15 flex items-center justify-center gap-2 group"
                >
                  <ShieldAlert className="w-4 h-4" />
                  Audit ChatGPT advice
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/simulator"
                  className="px-6 py-3.5 rounded-2xl font-semibold text-sm bg-slate-900 border border-slate-700 text-slate-200 flex items-center justify-center gap-2"
                >
                  <Gavel className="w-4 h-4 text-cyan-400" />
                  Hearing practice
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="relative">
                <div className="absolute -inset-3 rounded-[28px] bg-emerald-500/10 blur-2xl pointer-events-none" />
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
                className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-emerald-500/30 transition-colors text-left"
              >
                <span className="font-mono text-[11px] text-emerald-400/90">{step.n}</span>
                <p className="text-sm font-bold text-white mt-1">{step.title}</p>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{step.detail}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 bg-slate-900/30 border-y border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-docket">
              Three tools. One defense loop.
            </h2>
            <p className="text-sm text-slate-400">
              Built for tenants who face landlords — and chatbots — without a lawyer.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-slate-950 border border-violet-500/30 space-y-4 md:order-first">
              <div className="w-10 h-10 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Advice Auditor · AI Safety</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Chatbots sometimes tell people to skip court or invent laws. Paste that advice here — we flag
                dangerous tips and suggest a safer rewrite. No API key needed.
              </p>
              <div className="text-[11px] text-violet-300/90 space-y-1">
                <p className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Catches “skip court” / suspicious-format cites
                </p>
                <p className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Honest about pattern limits
                </p>
              </div>
              <Link
                href="/auditor"
                className="inline-flex items-center gap-1 text-xs font-semibold text-violet-400 hover:text-violet-300"
              >
                <Shield className="w-3.5 h-3.5" /> Open Auditor <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <FileCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Defense Studio</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Practice cases or your own notice (paste / photo / Word). Flag common problems in plain English,
                draft an Answer template, export Word. Not a guarantee the court will accept it.
              </p>
              <div className="text-[11px] text-emerald-300/90 space-y-1">
                <p className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Plain-English issue flags
                </p>
                <p className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Answer draft (.docx)
                </p>
              </div>
              <Link
                href="/studio"
                className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300"
              >
                <FileText className="w-3.5 h-3.5" /> Open Studio <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Scale className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Hearing Coach</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Practice speaking in Housing Court. Get feedback on what to say before you face a real judge —
                coaching only, not a prediction of who wins.
              </p>
              <div className="text-[11px] text-cyan-300/90 space-y-1">
                <p className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Oral argument practice
                </p>
                <p className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Case context from Studio
                </p>
              </div>
              <Link
                href="/simulator"
                className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300"
              >
                <Mic2 className="w-3.5 h-3.5" /> Open Coach <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
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
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-emerald-500/30 relative overflow-hidden">
            <div className="absolute right-8 top-8 opacity-10 pointer-events-none">
              <Scale className="w-40 h-40 text-emerald-300" />
            </div>
            <div className="max-w-2xl space-y-4 relative z-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
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
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-emerald-500 text-slate-950"
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
