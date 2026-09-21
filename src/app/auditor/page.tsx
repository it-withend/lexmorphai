'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import TrustStrip from '@/components/TrustStrip';
import SiteFooter from '@/components/SiteFooter';
import { AdviceAuditResult } from '@/lib/types';
import { SAMPLE_BAD_ADVICE_PACKS } from '@/lib/advice-audit';
import Link from 'next/link';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Sparkles,
  Copy,
  Check,
  Shield,
  Scale,
  FileText,
  Info,
} from 'lucide-react';

function getStoredKeys() {
  if (typeof window === 'undefined') return { gemini: undefined, groq: undefined };
  return {
    gemini: localStorage.getItem('lexmorph_gemini_key') || undefined,
    groq: localStorage.getItem('lexmorph_groq_key') || undefined,
  };
}

const RISK_STYLES: Record<string, string> = {
  critical: 'text-red-400 bg-red-500/10 border-red-500/30',
  high: 'text-orange-300 bg-orange-500/10 border-orange-500/30',
  moderate: 'text-amber-300 bg-amber-500/10 border-amber-500/30',
  low: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30',
  unknown: 'text-slate-300 bg-slate-500/10 border-slate-500/30',
};

export default function AdviceAuditorPage() {
  const [situation, setSituation] = useState('');
  const [adviceText, setAdviceText] = useState('');
  const [jurisdiction, setJurisdiction] = useState('New York');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AdviceAuditResult | null>(null);
  const [source, setSource] = useState<string>('');
  const [model, setModel] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const runAudit = async (sampleId?: string) => {
    setLoading(true);
    setError(null);
    try {
      const keys = getStoredKeys();
      if (sampleId) {
        const pack = SAMPLE_BAD_ADVICE_PACKS.find((p) => p.id === sampleId) || SAMPLE_BAD_ADVICE_PACKS[0];
        setSituation(pack.situation);
        setAdviceText(pack.adviceText);
        setJurisdiction(pack.jurisdiction);
      }
      const res = await fetch('/api/audit-advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sampleId,
          adviceText: sampleId ? undefined : adviceText,
          situation: sampleId ? undefined : situation,
          jurisdiction,
          apiKey: keys.gemini,
          groqApiKey: keys.groq,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Audit failed');
      setResult(data.result);
      setSource(data.source || '');
      setModel(data.model || '');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Audit failed');
    } finally {
      setLoading(false);
    }
  };

  const copyRewrite = async () => {
    if (!result?.saferRewrite) return;
    await navigator.clipboard.writeText(result.saferRewrite);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-10 space-y-8">
        <div className="space-y-3 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-violet-500/10 text-violet-300 border border-violet-500/20">
            <Shield className="w-3.5 h-3.5" />
            AI Safety · Ethics &amp; Governance track
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            AI Legal Advice Safety Auditor
          </h1>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Paste advice from ChatGPT / Gemini / Copilot about eviction, debt, or court. LexMorph
            stress-tests it for dangerous actions, suspicious-looking citations, overconfidence, and missing
            disclaimers — then offers a safer educational rewrite.
          </p>
        </div>

        <TrustStrip />

        <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 text-[11px] text-slate-400 leading-relaxed flex gap-2">
          <Info className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
          <p>
            <strong className="text-slate-300">How citation checks work:</strong> a small known-good registry
            labels cites as <em>verified</em> / <em>unknown</em> / <em>suspicious format</em> — we never
            auto-call something “fake.” Danger phrases (e.g. “skip the hearing”) are separate deterministic
            rules. Empty matches → risk level <code className="text-slate-300">unknown</code>, not “low.”
            Safer rewrites may be AI-generated and are always unverified. Always check LawHelp / legislature
            / LII.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4 p-5 rounded-3xl bg-slate-900/50 border border-slate-800">
            <label className="block space-y-1.5">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wide">Your situation</span>
              <textarea
                value={situation}
                onChange={(e) => setSituation(e.target.value)}
                rows={3}
                placeholder="e.g. Brooklyn 3-day rent demand, no heat…"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-violet-500"
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wide">Jurisdiction hint</span>
              <input
                value={jurisdiction}
                onChange={(e) => setJurisdiction(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-violet-500"
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
                Paste the AI advice to audit
              </span>
              <textarea
                value={adviceText}
                onChange={(e) => setAdviceText(e.target.value)}
                rows={12}
                placeholder="Paste ChatGPT / other model output here…"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-violet-500 font-mono leading-relaxed"
              />
            </label>

            {error && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-200 text-sm">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <button
                onClick={() => runAudit()}
                disabled={loading}
                className="w-full py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-400 hover:to-fuchsia-400 text-white disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldAlert className="w-4 h-4" />}
                Audit this advice
              </button>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SAMPLE_BAD_ADVICE_PACKS.map((pack) => (
                  <button
                    key={pack.id}
                    onClick={() => runAudit(pack.id)}
                    disabled={loading}
                    className="px-3 py-2.5 rounded-xl font-semibold text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 disabled:opacity-50 flex items-center justify-center gap-2 text-center"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                    {pack.label}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-[11px] text-slate-500 flex items-start gap-1.5">
              <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              Works offline with deterministic safety rules. Optional free Groq/Gemini key deepens the rewrite.
            </p>
          </div>

          <div className="space-y-4">
            {!result && !loading && (
              <div className="h-full min-h-[320px] rounded-3xl border border-dashed border-slate-800 bg-slate-900/30 flex flex-col items-center justify-center text-center p-8 text-slate-500 text-sm gap-3">
                <Shield className="w-10 h-10 text-violet-400/50" />
                <p>Results appear here — risk score, flags, safer rewrite, verification checklist.</p>
              </div>
            )}

            {loading && (
              <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-10 flex flex-col items-center gap-3 text-slate-300">
                <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
                <p className="text-sm">Scanning for dangerous patterns &amp; overconfidence…</p>
              </div>
            )}

            {result && !loading && (
              <div className="space-y-4">
                <div className={`p-5 rounded-3xl border ${RISK_STYLES[result.riskLevel]}`}>
                  <div className="flex items-end justify-between gap-3 mb-2">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider opacity-80">
                        Overall advice risk
                      </p>
                      <p className="text-4xl font-extrabold font-mono">
                        {result.overallRisk}
                        <span className="text-lg">/100</span>
                      </p>
                    </div>
                    <span className="text-xs font-bold uppercase px-2.5 py-1 rounded-full border border-current/30">
                      {result.riskLevel}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed opacity-95">{result.summary}</p>
                  {source && (
                    <p className="text-[10px] mt-2 opacity-70 font-mono flex items-center gap-1.5">
                      <Shield className="w-3 h-3" />
                      {source === 'ai' || source === 'gemini' || source?.startsWith('groq')
                        ? `Live AI · ${model || source}`
                        : `Rules engine · ${source}${model ? ` · ${model}` : ''}`}
                    </p>
                  )}
                </div>

                <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
                  <h2 className="text-sm font-bold text-white flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    Safety flags ({result.flags.length})
                  </h2>
                  {result.flags.length === 0 ? (
                    <p className="text-xs text-slate-400">
                      No known patterns matched — that does <strong className="text-slate-300">not</strong>{' '}
                      mean the advice is safe. Verify every citation and next step yourself.
                    </p>
                  ) : (
                    result.flags.map((f) => (
                      <div key={f.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-semibold text-slate-100">{f.title}</span>
                          <span className="uppercase text-[10px] font-mono text-red-300">{f.severity}</span>
                        </div>
                        <p className="text-slate-500 font-mono text-[11px]">“{f.excerpt}”</p>
                        <p className="text-slate-400 leading-relaxed">{f.explanation}</p>
                        <p className="text-emerald-300/90 leading-relaxed">
                          <strong className="text-emerald-400">Safer:</strong> {f.saferAlternative}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-sm font-bold text-white">Safer educational rewrite</h2>
                    <button
                      onClick={copyRewrite}
                      className="text-[11px] px-2 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 flex items-center gap-1"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <p className="text-[10px] uppercase tracking-wide text-amber-300/90 font-mono">
                    AI-generated · unverified · not legal advice
                  </p>
                  <pre className="whitespace-pre-wrap text-xs text-slate-300 leading-relaxed font-sans">
                    {result.saferRewrite ||
                      'No rewrite returned — still treat chatbot advice as unverified. Prefer legal-aid / court self-help materials for your jurisdiction.'}
                  </pre>
                </div>

                <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <h2 className="text-sm font-bold text-white flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Verification checklist
                  </h2>
                  <ul className="space-y-1.5 text-xs text-slate-400">
                    {(result.checklist?.length
                      ? result.checklist
                      : [
                          'Verify every statute citation on a primary source before repeating it.',
                          'Do not skip a hearing date based on chatbot advice.',
                          'Contact a legal aid clinic if you have a court date.',
                        ]
                    ).map((c) => (
                      <li key={c} className="flex gap-2">
                        <span className="text-emerald-500">•</span>
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Link
                    href="/studio"
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 flex items-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Open Defense Studio
                  </Link>
                  <Link
                    href="/simulator"
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-500/15 text-cyan-300 border border-cyan-500/25 flex items-center gap-1.5"
                  >
                    <Scale className="w-3.5 h-3.5" />
                    Practice Hearing
                  </Link>
                </div>

                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {result.disclaimers.join(' ')}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
