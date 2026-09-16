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
  Download,
  Eye,
  Camera,
  Layers,
  Users,
  Award,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-emerald-500/20 selection:text-emerald-300">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-28">
        {/* Background Glow Accents */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-emerald-500/15 via-teal-500/10 to-cyan-500/10 blur-[120px] pointer-events-none -z-10 rounded-full"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          {/* Hackathon Track Tag */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm animate-in fade-in slide-in-from-bottom-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>LexHack 2026 Candidate • Access to Justice &amp; Civic Tech Track</span>
          </div>

          {/* Main Title */}
          <div className="space-y-4 max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1]">
              From Crumpled Paper to{' '}
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                Living Legal Document.
              </span>
            </h1>
            <p className="text-base sm:text-xl text-slate-300 max-w-3xl mx-auto font-normal leading-relaxed">
              Snap a phone photo of an eviction notice, predatory lease, or court summons. LexMorph reconstructs it into an{' '}
              <strong className="text-white font-semibold">in-place editable living document</strong>, audits statutory defects, and exports a court-ready Word file (.docx) in 1 click.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <Link
              href="/studio"
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all flex items-center justify-center gap-2 group"
            >
              <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              <span>Launch Studio (Interactive Demo)</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/simulator"
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl font-semibold text-sm bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-600 text-slate-200 hover:text-white transition-all flex items-center justify-center gap-2"
            >
              <Scale className="w-4 h-4 text-cyan-400" />
              <span>Try Hearing Simulator</span>
            </Link>
          </div>

          {/* Quick Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8 border-t border-slate-800/80 text-left">
            <div className="p-3 rounded-2xl bg-slate-900/40 border border-slate-800/60">
              <span className="text-2xl font-extrabold text-white font-mono block">100%</span>
              <span className="text-xs text-slate-400">In-Place Editable Canvas</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-900/40 border border-slate-800/60">
              <span className="text-2xl font-extrabold text-emerald-400 font-mono block">&lt; 3s</span>
              <span className="text-xs text-slate-400">Vision AST Extraction</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-900/40 border border-slate-800/60">
              <span className="text-2xl font-extrabold text-amber-400 font-mono block">1-Click</span>
              <span className="text-xs text-slate-400">Verified Answer Generator</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-900/40 border border-slate-800/60">
              <span className="text-2xl font-extrabold text-cyan-400 font-mono block">.docx</span>
              <span className="text-xs text-slate-400">Native Word Export</span>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Transformation Visual Showcase */}
      <section className="py-12 bg-slate-900/30 border-y border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              The Living Legal Document Transformation
            </h2>
            <p className="text-sm text-slate-400">
              Traditional phone scanners just take flat pictures. LexMorph breathes life into every clause, table, and caption.
            </p>
          </div>

          {/* 3 Step Visual Flow */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all space-y-4 shadow-xl">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-bold">
                1
              </div>
              <h3 className="text-base font-bold text-white">Photometric Ingestion</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Upload a crumpled smartphone photo or skewed scan. On-device OCR plus optional free Groq vision rebuilds captions, clauses, and tables into a clean editable document AST.
              </p>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-amber-300/90 space-y-1.5">
                <p className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> No paid Google billing required</p>
                <p className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> Preserves court captions &amp; clauses</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all space-y-4 shadow-xl">
              <div className="w-10 h-10 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 font-bold">
                2
              </div>
              <h3 className="text-base font-bold text-white">Statutory Defect Audit</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Cross-references clauses against statutory law (NY RPAPL § 711 14-day notice requirement, CA Civil Code § 1950.5 deposit caps). Flags void terms and translates legalese to plain English.
              </p>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-red-300/90 space-y-1.5">
                <p className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> 96% Dismissal Grounds detected</p>
                <p className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> Plain-English explanations</p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all space-y-4 shadow-xl">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
                3
              </div>
              <h3 className="text-base font-bold text-white">1-Click Pro Se Action</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Generates a formal, court-formatted Verified Answer with affirmative defenses and rent abatement counterclaims. Export directly to native Microsoft Word (.docx) and print from your browser when needed.
              </p>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-emerald-300/90 space-y-1.5">
                <p className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> Court-ready pleading format</p>
                <p className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> Native .docx Word generation</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Access to Justice & Social Impact */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-emerald-500/30 shadow-2xl relative overflow-hidden">
            <div className="max-w-2xl space-y-4 relative z-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Users className="w-3.5 h-3.5" />
                <span>The Access to Justice Representation Gap</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Empowering the 90% who navigate court alone.
              </h2>

              <p className="text-sm text-slate-300 leading-relaxed">
                In New York Housing Court and civil courts across the nation, over 90% of tenants and consumer defendants face landlords and corporate attorneys without legal representation. Most lose not on the merits, but because they missed strict procedural filing deadlines or couldn&apos;t format an official legal Answer.
              </p>

              <p className="text-sm text-slate-300 leading-relaxed">
                LexMorph democratizes legal defense by turning any crumpled letter into structured legal power — helping pro se litigants assert their statutory rights and appear with dignity.
              </p>

              <div className="pt-3">
                <Link
                  href="/studio"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-lg shadow-emerald-500/20"
                >
                  <span>Experience LexMorph Studio</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 border-t border-slate-900 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-slate-400">LexMorph AI</span>
            <span>•</span>
            <span>LexHack 2026 Student Hackathon Submission</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <Link href="/studio" className="hover:text-emerald-400 transition-colors">
              Studio
            </Link>
            <Link href="/simulator" className="hover:text-emerald-400 transition-colors">
              Hearing Simulator
            </Link>
            <a
              href="https://lexhack-2026.devpost.com/"
              target="_blank"
              rel="noreferrer"
              className="hover:text-emerald-400 transition-colors"
            >
              Devpost
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
