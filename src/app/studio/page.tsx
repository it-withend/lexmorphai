'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import TrustStrip from '@/components/TrustStrip';
import SiteFooter from '@/components/SiteFooter';
import DualPaneViewer from '@/components/DualPaneViewer';
import RedFlagSidebar from '@/components/RedFlagSidebar';
import CounterActionModal from '@/components/CounterActionModal';
import { SAMPLE_CASES } from '@/lib/samples';
import { DocumentAST } from '@/lib/types';
import {
  clearStudioCaseLocal,
  loadStudioCaseLocal,
  persistStudioCase,
  saveStudioCaseLocal,
  type SavedStudioCase,
} from '@/lib/case-context';
import { extractTextFromFile } from '@/lib/extract-text';
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
  Camera,
  History,
  Trash2,
} from 'lucide-react';

type Step = 'pick' | 'analyzing' | 'results';

const SAMPLE_META = [
  {
    id: 'nyc-eviction-14day-defect',
    Icon: Building2,
    title: 'NYC eviction notice (example)',
    subtitle: 'Short notice + illegal fees — good for a first walkthrough',
    jurisdiction: 'New York',
    issues: 3,
    band: 'Strong possible defenses',
    color: 'border-amber-500/40 hover:border-amber-400',
    badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    iconWrap: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  },
  {
    id: 'ca-predatory-lease',
    Icon: ScrollText,
    title: 'California lease (example)',
    subtitle: 'Illegal deposit wording — second practice case',
    jurisdiction: 'California',
    issues: 2,
    band: 'Strong possible defenses',
    color: 'border-blue-500/40 hover:border-blue-400',
    badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    iconWrap: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  },
];

const SAMPLE_LOAD_STEPS = [
  'Opening the practice example…',
  'Loading the problems we already marked…',
  'Opening your review screen…',
];

const PASTE_ANALYSIS_STEPS = [
  'Reading your text…',
  'Looking for parties, dates, and fees…',
  'Checking common legal problem patterns…',
  'Summarizing what you may raise…',
  'Opening your review screen…',
];

function sourceLabel(source: string, model: string) {
  if (source === 'sample') return 'Practice example';
  if (source.includes('groq') || source === 'gemini' || source === 'ai') {
    return `Checked with AI${model ? ` · ${model}` : ''}`;
  }
  return 'Checked with built-in rules';
}

export default function StudioPage() {
  const [step, setStep] = useState<Step>('pick');
  const [currentAST, setCurrentAST] = useState<DocumentAST>(SAMPLE_CASES[0].ast);
  const [activeDefectId, setActiveDefectId] = useState<string | undefined>();
  const [isCounterActionOpen, setIsCounterActionOpen] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [analysisSteps, setAnalysisSteps] = useState<string[]>(PASTE_ANALYSIS_STEPS);
  const [pasteText, setPasteText] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [analysisSource, setAnalysisSource] = useState('sample');
  const [analysisModel, setAnalysisModel] = useState('');
  const [caseKind, setCaseKind] = useState<'practice' | 'own'>('practice');
  const [extractNote, setExtractNote] = useState<string | null>(null);
  const [savedCase, setSavedCase] = useState<SavedStudioCase | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = loadStudioCaseLocal();
    if (saved) setSavedCase(saved);
  }, []);

  const persistFull = useCallback(
    (ast: DocumentAST, opts: { kind: 'practice' | 'own'; source: string; model?: string; paste?: string }) => {
      persistStudioCase(ast);
      saveStudioCaseLocal({
        ast,
        pasteText: opts.paste,
        analysisSource: opts.source,
        analysisModel: opts.model,
        kind: opts.kind,
      });
      setSavedCase({
        ast,
        pasteText: opts.paste,
        analysisSource: opts.source,
        analysisModel: opts.model,
        kind: opts.kind,
        savedAt: Date.now(),
      });
    },
    []
  );

  const resumeSaved = () => {
    const saved = loadStudioCaseLocal();
    if (!saved) return;
    setCurrentAST(saved.ast);
    setPasteText(saved.pasteText || '');
    setAnalysisSource(saved.analysisSource);
    setAnalysisModel(saved.analysisModel || '');
    setCaseKind(saved.kind);
    persistStudioCase(saved.ast);
    setStep('results');
  };

  const discardSaved = () => {
    clearStudioCaseLocal();
    setSavedCase(null);
  };

  const runAnalysis = useCallback(
    async (opts: { sampleId?: string; rawText?: string }) => {
      const steps = opts.sampleId ? SAMPLE_LOAD_STEPS : PASTE_ANALYSIS_STEPS;
      setAnalysisSteps(steps);
      setStep('analyzing');
      setAnalysisStep(0);
      setUploadError(null);

      const interval = setInterval(() => {
        setAnalysisStep((prev) => {
          if (prev >= steps.length - 1) {
            clearInterval(interval);
            return prev;
          }
          return prev + 1;
        });
      }, opts.sampleId ? 350 : 550);

      try {
        if (opts.sampleId) {
          await new Promise((r) => setTimeout(r, steps.length * 320 + 100));
          const sample = SAMPLE_CASES.find((s) => s.id === opts.sampleId);
          if (!sample) throw new Error('Unknown practice case');
          setCurrentAST(sample.ast);
          setAnalysisSource('sample');
          setAnalysisModel('');
          setCaseKind('practice');
          persistFull(sample.ast, { kind: 'practice', source: 'sample' });
        } else if (opts.rawText) {
          // Server uses Vercel GROQ_API_KEY — visitors do not send keys
          const res = await fetch('/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rawText: opts.rawText }),
          });
          const data = await res.json();
          if (!res.ok || !data.success || !data.ast) {
            throw new Error(data.error || 'Could not check this document');
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
          setCaseKind('own');
          persistFull(ast, {
            kind: 'own',
            source: data.source || 'text_audit',
            model: data.model,
            paste: opts.rawText,
          });
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Could not check this document';
        setUploadError(message);
        setStep('pick');
        clearInterval(interval);
        return;
      } finally {
        clearInterval(interval);
        setAnalysisStep(steps.length - 1);
        await new Promise((r) => setTimeout(r, 200));
      }

      setStep('results');
      setActiveDefectId(undefined);
    },
    [persistFull]
  );

  const handleUploadFile = async (file: File) => {
    setUploadError(null);
    setExtractNote(null);
    try {
      const result = await extractTextFromFile(file);
      if (result.method === 'unsupported' || !result.text.trim()) {
        setUploadError(result.note || 'Could not read that file.');
        return;
      }
      if (result.text.trim().length < 40) {
        setUploadError('We need more text. Try a clearer photo or paste the notice.');
        return;
      }
      if (result.note) setExtractNote(result.note);
      setPasteText(result.text);
      runAnalysis({ rawText: result.text });
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : 'Could not read file');
    }
  };

  const onUpdateAST = (ast: DocumentAST) => {
    setCurrentAST(ast);
    persistFull(ast, {
      kind: caseKind,
      source: analysisSource,
      model: analysisModel,
      paste: pasteText || undefined,
    });
  };

  if (step === 'pick') {
    return (
      <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
        <Navbar />
        <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-10 sm:py-14 space-y-8">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Scale className="w-3.5 h-3.5" />
              No API key needed · works in your browser
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Got a notice? Let&apos;s look at it together
            </h1>
            <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
              Pick a ready-made practice example, or paste your own notice. We highlight common problems in
              plain English and help you draft a response to practice with — this is a learning tool, not a
              lawyer.
            </p>
          </div>

          <TrustStrip />

          {savedCase && (
            <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
              <div className="flex items-start gap-3">
                <History className="w-5 h-5 text-cyan-300 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-white">Continue where you left off</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {savedCase.kind === 'own' ? 'Your document' : 'Practice example'} · {savedCase.ast.title}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={resumeSaved}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-400 text-slate-950"
                >
                  Open saved case
                </button>
                <button
                  onClick={discardSaved}
                  className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 border border-slate-700 text-slate-300 flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear
                </button>
              </div>
            </div>
          )}

          {uploadError && (
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-200">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="flex-1 text-sm">{uploadError}</div>
              <button onClick={() => setUploadError(null)}>
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* A — Practice examples */}
          <section className="space-y-4">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-amber-300/90">Option A</p>
                <h2 className="text-xl font-bold text-white mt-0.5">Try a practice example</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Ready-made cases. Best for demos and first-time visitors. No upload needed.
                </p>
              </div>
              <BookOpen className="w-5 h-5 text-amber-400/80 shrink-0 hidden sm:block" />
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
                    <div className="flex flex-col items-end gap-1">
                      {s.id === 'nyc-eviction-14day-defect' && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950">
                          Judges start here
                        </span>
                      )}
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${s.badge}`}>
                        {s.issues} issues flagged
                      </span>
                    </div>
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
          </section>

          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-slate-800" />
            <span className="text-slate-500 text-sm font-medium">or</span>
            <div className="flex-1 h-px bg-slate-800" />
          </div>

          {/* B — Own document */}
          <section className="p-5 sm:p-6 rounded-3xl bg-slate-900/40 border border-emerald-500/20 space-y-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-300/90">Option B</p>
              <h2 className="text-xl font-bold text-white mt-0.5 flex items-center gap-2">
                <ClipboardPaste className="w-5 h-5 text-emerald-400" />
                Check my own notice
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Paste text, or upload a photo / Word file. Saved on this device so it survives a refresh.
                No API key required.
              </p>
            </div>
            {extractNote && (
              <p className="text-[11px] text-cyan-300/90 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5" />
                {extractNote}
              </p>
            )}
            <textarea
              id="paste-document"
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              rows={8}
              placeholder="Paste the text of your eviction notice, lease, or demand letter here…"
              className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 leading-relaxed"
            />
            <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    if (pasteText.trim().length < 40) {
                      setUploadError('Paste a bit more text (at least ~40 characters).');
                      return;
                    }
                    runAnalysis({ rawText: pasteText });
                  }}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 flex items-center gap-2"
                >
                  <Wand2 className="w-4 h-4" />
                  Check my document
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-slate-800 border border-slate-700 text-slate-200 flex items-center gap-2"
                >
                  <Camera className="w-4 h-4 text-cyan-400" />
                  Photo / Word / .txt
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.md,.docx,text/plain,image/*,.png,.jpg,.jpeg,.webp"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleUploadFile(e.target.files[0])}
                />
              </div>
              <Link
                href="/auditor"
                className="text-xs text-violet-300 hover:text-violet-200 flex items-center gap-1.5"
              >
                <Shield className="w-3.5 h-3.5" />
                Or check ChatGPT advice instead →
              </Link>
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              Tip: PDF upload is not ready yet — take a photo of the page or paste the text. Your own cases stay
              in this browser&apos;s storage until you clear them.
            </p>
          </section>

          <p className="text-center text-xs text-slate-600 flex items-center justify-center gap-1.5">
            <Info className="w-3.5 h-3.5" />
            Not legal advice. For learning and LexHack demos.
          </p>
        </main>
        <SiteFooter />
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
              <h2 className="text-2xl font-bold text-white">
                {caseKind === 'practice' || analysisSteps[0]?.includes('practice')
                  ? 'Loading practice example…'
                  : 'Checking your document…'}
              </h2>
              <p className="text-slate-400 text-sm mt-1">This only takes a few seconds</p>
            </div>
            <div className="space-y-3 text-left">
              {analysisSteps.map((s, i) => (
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
                  {currentAST.jurisdiction} · {currentAST.defects.length} issues found
                </span>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                    caseKind === 'practice'
                      ? 'bg-amber-500/10 text-amber-200 border-amber-500/25'
                      : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25'
                  }`}
                >
                  {caseKind === 'practice' ? 'Practice example' : 'Your document'}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-slate-800 text-slate-300 border-slate-700">
                  {sourceLabel(analysisSource, analysisModel)}
                </span>
                <span className="text-[10px] text-slate-500">Saved on this device</span>
              </p>
            </div>
          </div>
          <Link
            href="/simulator"
            onClick={() => persistStudioCase(currentAST)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/20 text-xs font-semibold flex items-center gap-1.5"
          >
            <Scale className="w-3.5 h-3.5" />
            Practice what to say in court
          </Link>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
          <div className="xl:col-span-8">
            <DualPaneViewer
              ast={currentAST}
              onUpdateAST={onUpdateAST}
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
                persistStudioCase(currentAST);
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
      <SiteFooter />
    </div>
  );
}
