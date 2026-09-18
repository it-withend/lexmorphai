'use client';

import React, { useState, useCallback, useRef } from 'react';
import Navbar from '@/components/Navbar';
import { SAMPLE_CASES } from '@/lib/samples';
import { DocumentAST } from '@/lib/types';
import DualPaneViewer from '@/components/DualPaneViewer';
import RedFlagSidebar from '@/components/RedFlagSidebar';
import CounterActionModal from '@/components/CounterActionModal';
import Link from 'next/link';
import {
  ArrowRight,
  FileText,
  Scale,
  ChevronLeft,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  BookOpen,
  Building2,
  ScrollText,
  Wand2,
  Info,
  X,
  ClipboardPaste,
  Shield,
} from 'lucide-react';

type Step = 'pick' | 'analyzing' | 'results';

const SAMPLE_META = [
  {
    id: 'nyc-eviction-14day-defect',
    Icon: Building2,
    title: 'NYC Eviction Notice',
    subtitle: 'Defective 3-day notice, illegal fees',
    jurisdiction: 'New York (Kings County)',
    defects: 3,
    band: 'Strong possible defenses',
    color: 'border-amber-500/40 hover:border-amber-400',
    badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    iconWrap: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  },
  {
    id: 'ca-predatory-lease',
    Icon: ScrollText,
    title: 'CA Predatory Lease',
    subtitle: 'Illegal deposit, void jury waiver',
    jurisdiction: 'California (Los Angeles)',
    defects: 2,
    band: 'Strong possible defenses',
    color: 'border-blue-500/40 hover:border-blue-400',
    badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    iconWrap: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  },
];

const ANALYSIS_STEPS = [
  'Reading document text…',
  'Mapping parties, deadlines & clauses…',
  'Cross-checking statutory rules…',
  'Building defense viability score…',
  'Opening living editor + counter-attack tools…',
];

function getStoredKeys() {
  if (typeof window === 'undefined') return { gemini: undefined, groq: undefined };
  return {
    gemini: localStorage.getItem('lexmorph_gemini_key') || undefined,
    groq: localStorage.getItem('lexmorph_groq_key') || undefined,
  };
}

export default function StudioPage() {
  const [step, setStep] = useState<Step>('pick');
  const [currentAST, setCurrentAST] = useState<DocumentAST>(SAMPLE_CASES[0].ast);
  const [activeDefectId, setActiveDefectId] = useState<string | undefined>();
  const [isCounterActionOpen, setIsCounterActionOpen] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [pasteText, setPasteText] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [analysisSource, setAnalysisSource] = useState('sample');
  const [analysisModel, setAnalysisModel] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const persistCaseForSimulator = (ast: DocumentAST) => {
    try {
      const ctx = [
        `Jurisdiction: ${ast.jurisdiction}`,
        `Document: ${ast.title} (${ast.documentType})`,
        `Headline: ${ast.audit.summaryHeadline}`,
        `Key findings: ${ast.audit.keyFindings.join('; ')}`,
        `Top defenses: ${ast.defects
          .slice(0, 3)
          .map((d) => `${d.title} [${d.citation}]`)
          .join('; ')}`,
      ].join('\n');
      sessionStorage.setItem('lexmorph_case_context', ctx);
      sessionStorage.setItem('lexmorph_case_title', ast.title);
    } catch {
      /* ignore */
    }
  };

  const runAnalysis = useCallback(async (opts: { sampleId?: string; rawText?: string }) => {
    setStep('analyzing');
    setAnalysisStep(0);
    setUploadError(null);

    const interval = setInterval(() => {
      setAnalysisStep((prev) => {
        if (prev >= ANALYSIS_STEPS.length - 1) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 550);

    try {
      if (opts.sampleId) {
        await new Promise((r) => setTimeout(r, ANALYSIS_STEPS.length * 450 + 150));
        const sample = SAMPLE_CASES.find((s) => s.id === opts.sampleId);
        if (!sample) throw new Error('Unknown sample');
        setCurrentAST(sample.ast);
        setAnalysisSource('sample');
        setAnalysisModel('');
        persistCaseForSimulator(sample.ast);
      } else if (opts.rawText) {
        const keys = getStoredKeys();
        const res = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            rawText: opts.rawText,
            apiKey: keys.gemini,
            groqApiKey: keys.groq,
          }),
        });
        const data = await res.json();
        if (!res.ok || !data.success || !data.ast) {
          throw new Error(data.error || 'Analysis failed');
        }
        const ast: DocumentAST = {
          ...data.ast,
          sourceText: opts.rawText,
          reconstructionMode: 'text_audit',
          originalImageUrl: undefined,
          embedImageUrl: undefined,
        };
        setCurrentAST(ast);
        setAnalysisSource(data.source || 'text_audit');
        setAnalysisModel(data.model || '');
        persistCaseForSimulator(ast);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Analysis failed';
      setUploadError(message);
      setStep('pick');
      clearInterval(interval);
      return;
    } finally {
      clearInterval(interval);
      setAnalysisStep(ANALYSIS_STEPS.length - 1);
      await new Promise((r) => setTimeout(r, 250));
    }

    setStep('results');
    setActiveDefectId(undefined);
  }, []);

  const handleTextFile = async (file: File) => {
    if (!file.name.match(/\.(txt|md|text)$/i) && file.type && !file.type.startsWith('text/')) {
      setUploadError('Please upload a .txt text file (or paste the document text).');
      return;
    }
    const text = await file.text();
    if (text.trim().length < 40) {
      setUploadError('File is too short to analyze. Paste a fuller notice or lease excerpt.');
      return;
    }
    setPasteText(text);
    runAnalysis({ rawText: text });
  };

  if (step === 'pick') {
    return (
      <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
        <Navbar />
        <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-10 sm:py-14 space-y-8">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Scale className="w-3.5 h-3.5" />
              Defense Studio · Audit → Answer → Hearing
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Build your defense like a guided junior counsel
            </h1>
            <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
              Start from a real demo case or paste a notice/lease. LexMorph flags statutory defects, drafts a
              court Answer, and lets you rehearse the hearing — no photo magic, no brittle OCR.
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-gradient-to-br from-amber-500/10 via-slate-900/80 to-slate-900 border border-amber-500/25 space-y-3">
            <p className="text-sm font-bold text-amber-100 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              I got a notice and I&apos;m scared — start here
            </p>
            <p className="text-xs text-slate-400">
              Three safe paths. No lawyer required to explore. Educational only — not legal advice.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                onClick={() => runAnalysis({ sampleId: 'nyc-eviction-14day-defect' })}
                className="px-4 py-3 rounded-2xl bg-slate-950/80 border border-amber-500/30 text-left hover:border-amber-400/60 transition-colors"
              >
                <p className="text-sm font-semibold text-white">NYC eviction demo</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Defective 3-day notice walkthrough</p>
              </button>
              <button
                onClick={() => {
                  const el = document.getElementById('paste-document');
                  el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  (el as HTMLTextAreaElement | null)?.focus();
                }}
                className="px-4 py-3 rounded-2xl bg-slate-950/80 border border-slate-700 text-left hover:border-emerald-500/50 transition-colors"
              >
                <p className="text-sm font-semibold text-white">Paste my notice</p>
                <p className="text-[11px] text-slate-400 mt-0.5">We flag issues in plain English</p>
              </button>
              <Link
                href="/auditor"
                className="px-4 py-3 rounded-2xl bg-slate-950/80 border border-violet-500/30 text-left hover:border-violet-400/60 transition-colors"
              >
                <p className="text-sm font-semibold text-white">Audit chatbot advice</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Catch &quot;skip court&quot; harm</p>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { Icon: BookOpen, title: '1. Pick or paste', body: 'Curated cases or your document text' },
              { Icon: Wand2, title: '2. AI counter-attack', body: 'Red flags + court Answer .docx' },
              { Icon: Scale, title: '3. Hearing coach', body: 'Practice oral argument with scoring' },
            ].map(({ Icon, title, body }) => (
              <div key={title} className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400 shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{body}</p>
                </div>
              </div>
            ))}
          </div>

          {uploadError && (
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-200">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="flex-1 text-sm">{uploadError}</div>
              <button onClick={() => setUploadError(null)}>
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Paste / text upload */}
          <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/40 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <ClipboardPaste className="w-4 h-4 text-emerald-400" />
              Paste document text (notice, lease, demand)
            </div>
            <textarea
              id="paste-document"
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              rows={8}
              placeholder="Paste the full text of an eviction notice, lease clause set, or demand letter…"
              className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono leading-relaxed"
            />
            <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (pasteText.trim().length < 40) {
                      setUploadError('Paste at least a short document excerpt (40+ characters).');
                      return;
                    }
                    runAnalysis({ rawText: pasteText });
                  }}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 flex items-center gap-2"
                >
                  <Wand2 className="w-4 h-4" />
                  Analyze &amp; open editor
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-slate-800 border border-slate-700 text-slate-200 flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Upload .txt
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.md,text/plain"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleTextFile(e.target.files[0])}
                />
              </div>
              <Link
                href="/auditor"
                className="text-xs text-violet-300 hover:text-violet-200 flex items-center gap-1.5"
              >
                <Shield className="w-3.5 h-3.5" />
                Or audit ChatGPT legal advice instead →
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-slate-800" />
            <span className="text-slate-500 text-sm font-medium">or start with a live demo case</span>
            <div className="flex-1 h-px bg-slate-800" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {SAMPLE_META.map((s) => (
              <button
                key={s.id}
                onClick={() => runAnalysis({ sampleId: s.id })}
                className={`group p-5 rounded-2xl bg-slate-900 border-2 text-left transition-all hover:shadow-xl hover:-translate-y-0.5 ${s.color}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className={`w-11 h-11 rounded-xl border flex items-center justify-center ${s.iconWrap}`}>
                    <s.Icon className="w-5 h-5" />
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${s.badge}`}>
                    {s.defects} defects
                  </span>
                </div>
                <p className="font-bold text-white text-base mt-3">{s.title}</p>
                <p className="text-slate-400 text-sm mt-0.5">{s.subtitle}</p>
                <p className="text-slate-500 text-xs mt-2 flex items-center gap-1">
                  <Scale className="w-3 h-3" />
                  {s.jurisdiction}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-emerald-400 font-semibold">{s.band}</span>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </div>
              </button>
            ))}
          </div>

          <p className="text-center text-xs text-slate-600 flex items-center justify-center gap-1.5">
            <Info className="w-3.5 h-3.5" />
            Not legal advice. Educational tool for LexHack / pro se awareness.
          </p>
        </main>
      </div>
    );
  }

  if (step === 'analyzing') {
    return (
      <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full space-y-8 text-center">
            <div className="relative mx-auto w-24 h-24">
              <div className="absolute inset-0 rounded-full bg-emerald-500/10 animate-ping" />
              <div className="relative w-24 h-24 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5">
                <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center">
                  <Scale className="w-10 h-10 text-emerald-400" />
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Building your defense package…</h2>
              <p className="text-slate-400 text-sm mt-1">Statutory audit + counter-pleading prep</p>
            </div>
            <div className="space-y-3 text-left">
              {ANALYSIS_STEPS.map((s, i) => (
                <div
                  key={s}
                  className={`flex items-center gap-3 text-sm ${
                    i < analysisStep ? 'text-emerald-400' : i === analysisStep ? 'text-white' : 'text-slate-600'
                  }`}
                >
                  {i < analysisStep ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  ) : i === analysisStep ? (
                    <Loader2 className="w-4 h-4 shrink-0 animate-spin" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-700 shrink-0" />
                  )}
                  <span>{s}</span>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setStep('pick')}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                {currentAST.title}
              </h1>
              <p className="text-xs text-slate-400 mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                <span>
                  {currentAST.jurisdiction} · {currentAST.defects.length} defects
                </span>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                    analysisSource === 'sample'
                      ? 'bg-slate-800 text-slate-300 border-slate-700'
                      : analysisSource.includes('groq') || analysisSource === 'gemini'
                        ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25'
                        : 'bg-amber-500/10 text-amber-200 border-amber-500/25'
                  }`}
                >
                  {analysisSource === 'sample'
                    ? 'Curated demo (offline fixtures)'
                    : analysisSource.includes('groq') || analysisSource === 'gemini'
                      ? `Live AI · ${analysisModel || analysisSource}`
                      : `Rules · ${analysisSource}${analysisModel ? ` · ${analysisModel}` : ''}`}
                </span>
              </p>
            </div>
          </div>
          <Link
            href="/simulator"
            onClick={() => persistCaseForSimulator(currentAST)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/20 text-xs font-semibold flex items-center gap-1.5"
          >
            <Scale className="w-3.5 h-3.5" />
            Practice this case in Court
          </Link>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
          <div className="xl:col-span-8">
            <DualPaneViewer
              ast={currentAST}
              onUpdateAST={setCurrentAST}
              activeDefectId={activeDefectId}
              onSelectDefect={setActiveDefectId}
            />
          </div>
          <div className="xl:col-span-4">
            <RedFlagSidebar
              ast={currentAST}
              onSelectDefect={(id) => setActiveDefectId(id)}
              onOpenCounterAction={() => setIsCounterActionOpen(true)}
              onOpenHearingSimulator={() => {
                persistCaseForSimulator(currentAST);
                window.location.assign('/simulator');
              }}
            />
          </div>
        </div>
      </main>

      <CounterActionModal
        isOpen={isCounterActionOpen}
        onClose={() => setIsCounterActionOpen(false)}
        ast={currentAST}
      />
    </div>
  );
}
