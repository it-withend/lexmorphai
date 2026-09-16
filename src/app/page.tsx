'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
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
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-emerald-500/20 selection:text-emerald-300">
      <Navbar />

      <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-emerald-500/15 via-teal-500/10 to-cyan-500/10 blur-[120px] pointer-events-none -z-10 rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            LexHack 2026 · Access to Justice + AI Safety
          </div>

          <div className="space-y-4 max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1]">
              LexMorph{' '}
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                Defense Studio
              </span>
            </h1>
            <p className="text-base sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Audit a notice or lease, draft a court-ready Answer, rehearse Housing Court — and stress-test
              dangerous ChatGPT “legal advice” before anyone acts on it.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <Link
              href="/studio"
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 group"
            >
              <Sparkles className="w-4 h-4" />
              Open Defense Studio
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/simulator"
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl font-semibold text-sm bg-slate-900 border border-slate-700 text-slate-200 flex items-center justify-center gap-2"
            >
              <Gavel className="w-4 h-4 text-cyan-400" />
              Hearing Coach
            </Link>
            <Link
              href="/auditor"
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl font-semibold text-sm bg-slate-900 border border-violet-500/30 text-violet-200 flex items-center justify-center gap-2"
            >
              <Shield className="w-4 h-4 text-violet-400" />
              Advice Auditor
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8 border-t border-slate-800/80 text-left">
            {[
              ['1-Click', 'Verified Answer'],
              ['Live', 'Hearing coach'],
              ['Safety', 'AI advice audit'],
              ['.docx', 'Court export'],
            ].map(([k, v]) => (
              <div key={v} className="p-3 rounded-2xl bg-slate-900/40 border border-slate-800/60">
                <span className="text-2xl font-extrabold text-white font-mono block">{k}</span>
                <span className="text-xs text-slate-400">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 bg-slate-900/30 border-y border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Three tools. One defense loop.</h2>
            <p className="text-sm text-slate-400">
              Built for tenants and pro se litigants who face landlords and chatbots alone.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <FileCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Defense Studio</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Paste a notice/lease or open a curated NY/CA case. Flag illegal clauses in plain English, edit the
                living document, generate a Verified Answer, export Word.
              </p>
              <div className="text-[11px] text-emerald-300/90 space-y-1">
                <p className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Statutory red-flag audit
                </p>
                <p className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Counter-pleading generator
                </p>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Scale className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Hearing Coach</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Rehearse Housing Court. Get scored feedback and statute-aware phrasing before you speak to a real
                judge.
              </p>
              <div className="text-[11px] text-cyan-300/90 space-y-1">
                <p className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Oral argument practice
                </p>
                <p className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Case context from Studio
                </p>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="w-10 h-10 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Advice Auditor</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Chatbots tell people to skip court or invent statutes. Audit that advice for dangerous actions,
                overconfidence, and fake citations — then get a safer rewrite.
              </p>
              <div className="text-[11px] text-violet-300/90 space-y-1">
                <p className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Deterministic safety rules
                </p>
                <p className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> AI Safety track fit
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-emerald-500/30 relative overflow-hidden">
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
    </div>
  );
}
