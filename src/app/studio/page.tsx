'use client';

import React, { useState, useCallback, useRef } from 'react';
import Navbar from '@/components/Navbar';
import { SAMPLE_CASES } from '@/lib/samples';
import { DocumentAST } from '@/lib/types';
import { extractTextFromImage } from '@/lib/ocr-client';
import { prepareImageForEmbed, prepareImageForOcr } from '@/lib/image-prep';
import { buildAstFromOcrText } from '@/lib/ocr-ast';
import DualPaneViewer from '@/components/DualPaneViewer';
import RedFlagSidebar from '@/components/RedFlagSidebar';
import CounterActionModal from '@/components/CounterActionModal';
import Link from 'next/link';
import {
  Upload,
  ArrowRight,
  FileText,
  Scale,
  ChevronLeft,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Camera,
  BookOpen,
  Building2,
  ScrollText,
  ScanText,
  Wand2,
  Info,
  X,
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
    score: 96,
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
    score: 91,
    color: 'border-blue-500/40 hover:border-blue-400',
    badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    iconWrap: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  },
];

const ANALYSIS_STEPS = [
  'Preparing photo for visual twin…',
  'Reading text from your photo (OCR)…',
  'Preserving logo, stamp & signature from scan…',
  'Building editable transcript lines…',
  'Opening Visual Twin canvas…',
];

const SOURCE_LABELS: Record<string, string> = {
  gemini: 'Gemini vision',
  'groq-vision': 'Groq vision (free)',
  'groq-text': 'Groq + OCR (free)',
  'ocr-rules': 'On-device OCR + rules',
  visual_twin: 'Visual Twin (photo 1:1 + OCR)',
  sample: 'Curated demo sample',
};

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
  const [selectedSampleId, setSelectedSampleId] = useState<string>(SAMPLE_CASES[0].id);
  const [activeDefectId, setActiveDefectId] = useState<string | undefined>();
  const [isCounterActionOpen, setIsCounterActionOpen] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [analysisDetail, setAnalysisDetail] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [analysisSource, setAnalysisSource] = useState<string>('sample');
  const [analysisWarning, setAnalysisWarning] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const runAnalysis = useCallback(async (imageBase64?: string, sampleId?: string) => {
    setStep('analyzing');
    setAnalysisStep(0);
    setAnalysisDetail('');
    setUploadError(null);
    setAnalysisWarning(null);

    const interval = setInterval(() => {
      setAnalysisStep((prev) => {
        if (prev >= ANALYSIS_STEPS.length - 1) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 700);

    try {
      if (sampleId) {
        await new Promise((r) => setTimeout(r, ANALYSIS_STEPS.length * 500 + 200));
        const sample = SAMPLE_CASES.find((s) => s.id === sampleId);
        if (sample) {
          setCurrentAST(sample.ast);
          setSelectedSampleId(sampleId);
          setAnalysisSource('sample');
        }
      } else if (imageBase64) {
        // Visual Twin path: keep the photo 1:1 (logo/stamp/signature), OCR only for editable text
        setAnalysisDetail('Preparing photo for visual twin…');
        const prepared = await prepareImageForOcr(imageBase64);
        const embed = await prepareImageForEmbed(imageBase64);

        setAnalysisDetail('Reading text from photo (on-device OCR)…');
        let ocr = { text: '', lines: [] as { text: string; confidence: number }[], meanConfidence: 0 };
        try {
          ocr = await extractTextFromImage(prepared.ocrDataUrl, (status, progress) => {
            setAnalysisDetail(`${status} ${progress}%`);
            if (progress > 20) setAnalysisStep(1);
            if (progress > 60) setAnalysisStep(2);
          });
        } catch (ocrErr) {
          console.warn('OCR failed', ocrErr);
          throw new Error(
            'Could not read text from this photo. Try a flatter, brighter shot without glare.'
          );
        }

        if (!ocr.text || ocr.text.length < 12) {
          throw new Error('Not enough readable text. Retake the photo closer and flatter.');
        }

        setAnalysisDetail('Building visual twin (photo + editable transcript)…');
        setAnalysisStep(4);

        const hasCyrillic = /[\u0400-\u04FF]/.test(ocr.text);
        let ast = buildAstFromOcrText(ocr.text, {
          imageUrl: imageBase64,
          embedImageUrl: embed.dataUrl,
          embedWidth: embed.width,
          embedHeight: embed.height,
          lines: ocr.lines,
          ocrConfidence: ocr.meanConfidence,
        });

        // Optional: US docs can still ask the API to enrich statutory defects
        const keys = getStoredKeys();
        if (!hasCyrillic && (keys.gemini || keys.groq)) {
          try {
            const res = await fetch('/api/analyze', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                imageBase64: prepared.ocrDataUrl,
                rawText: ocr.text,
                apiKey: keys.gemini,
                groqApiKey: keys.groq,
              }),
            });
            const data = await res.json();
            if (data.success && data.ast?.defects?.length) {
              ast = {
                ...ast,
                defects: data.ast.defects,
                audit: { ...ast.audit, ...data.ast.audit, actionSteps: ast.audit.actionSteps },
              };
              if (data.warning) setAnalysisWarning(data.warning);
            }
          } catch {
            /* keep visual twin */
          }
        }

        setCurrentAST(ast);
        setSelectedSampleId('');
        setAnalysisSource('visual_twin');
        setAnalysisWarning(
          `Visual Twin: original photo is preserved 1:1 (logo, stamp, signature). OCR transcript ~${ocr.meanConfidence}% — edit lines that look wrong.`
        );
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
      await new Promise((r) => setTimeout(r, 350));
    }

    setStep('results');
    setActiveDefectId(undefined);
  }, []);

  const handleSampleSelect = (id: string) => {
    runAnalysis(undefined, id);
  };

  const handleFile = (file: File) => {
    if (!file) return;
    if (file.type === 'application/pdf') {
      setUploadError('PDF upload is not supported yet — please photograph or screenshot the page (JPG/PNG).');
      return;
    }
    if (!file.type.startsWith('image/')) {
      setUploadError('Please upload a JPG or PNG photo of your document.');
      return;
    }
    setUploadError(null);
    const reader = new FileReader();
    reader.onload = () => {
      runAnalysis(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, []);

  if (step === 'pick') {
    return (
      <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
        <Navbar />
        <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-10 sm:py-14 space-y-8">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ScanText className="w-3.5 h-3.5" />
              <span>Photo → editable legal document</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Upload a photo of your notice
            </h1>
            <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
              LexMorph reads the page on your device, rebuilds it as an editable document, flags illegal clauses,
              and exports Word (.docx). Works without a paid Google key — free Groq key optional for stronger AI.
            </p>
          </div>

          {/* How it works */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { Icon: Camera, title: '1. Snap or upload', body: 'Phone photo keeps logo, stamp & signature 1:1' },
              { Icon: ScanText, title: '2. Visual Twin', body: 'Exact scan + editable OCR transcript underneath' },
              { Icon: Wand2, title: '3. Export Word', body: 'DOCX page 1 = photo twin; next pages = editable text' },
            ].map(({ Icon, title, body }) => (
              <div key={title} className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400 shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{title}</p>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{body}</p>
                </div>
              </div>
            ))}
          </div>

          {uploadError && (
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-200">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="flex-1 text-sm leading-relaxed">{uploadError}</div>
              <button onClick={() => setUploadError(null)} className="text-red-300 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative cursor-pointer rounded-3xl border-2 border-dashed p-10 sm:p-14 flex flex-col items-center gap-4 text-center transition-all duration-200 group
              ${
                isDragging
                  ? 'border-emerald-400 bg-emerald-500/10 scale-[1.01]'
                  : 'border-slate-700 hover:border-emerald-500/60 hover:bg-slate-900/40 bg-slate-900/20'
              }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all border
              ${
                isDragging
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  : 'bg-slate-800 text-slate-400 border-slate-700 group-hover:bg-emerald-500/10 group-hover:text-emerald-400'
              }`}
            >
              <Camera className="w-7 h-7" />
            </div>
            <div>
              <p className="text-white font-semibold text-lg">
                {isDragging ? 'Drop photo here' : 'Upload a photo of your document'}
              </p>
              <p className="text-slate-400 text-sm mt-1">
                Eviction notice, lease, court summons, debt letter
              </p>
              <p className="text-slate-500 text-xs mt-2">JPG, PNG, WEBP · drag & drop or click · no paid Gemini required</p>
            </div>
            <div className="flex items-center gap-2 mt-1 text-emerald-400 text-sm font-semibold">
              <Upload className="w-4 h-4" />
              <span>Choose photo</span>
            </div>
          </div>

          <div className="flex items-start gap-2 p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400">
            <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <p>
              Tip: for best results, photograph the page flat with good light. Optional free{' '}
              <button
                type="button"
                className="text-cyan-300 underline underline-offset-2"
                onClick={() => document.getElementById('open-api-keys')?.click()}
              >
                Groq API key
              </button>{' '}
              improves AI reconstruction. Demo samples below always work offline.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-slate-800" />
            <span className="text-slate-500 text-sm font-medium px-2">or try a live demo</span>
            <div className="flex-1 h-px bg-slate-800" />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
              <BookOpen className="w-3.5 h-3.5" />
              Pre-loaded real-world cases
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {SAMPLE_META.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleSampleSelect(s.id)}
                  className={`group p-5 rounded-2xl bg-slate-900 border-2 text-left transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5 ${s.color}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className={`w-11 h-11 rounded-xl border flex items-center justify-center ${s.iconWrap}`}>
                      <s.Icon className="w-5 h-5" />
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${s.badge}`}
                    >
                      {s.defects} defects found
                    </span>
                  </div>
                  <div className="mt-3">
                    <p className="font-bold text-white text-base">{s.title}</p>
                    <p className="text-slate-400 text-sm mt-0.5">{s.subtitle}</p>
                    <p className="text-slate-500 text-xs mt-2 flex items-center gap-1">
                      <Scale className="w-3 h-3" />
                      {s.jurisdiction}
                    </p>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-xs text-emerald-400 font-semibold">{s.score}% dismissal chance</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          <p className="text-center text-xs text-slate-600">
            Not legal advice. LexMorph is an educational tool to help you understand your documents.
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
              <div className="relative w-24 h-24 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-2xl shadow-emerald-500/30">
                <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center">
                  <ScanText className="w-10 h-10 text-emerald-400" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">Turning photo into editable document…</h2>
              <p className="text-slate-400 text-sm">
                {analysisDetail || 'Reading statutory rules and flagging defects'}
              </p>
            </div>

            <div className="space-y-3 text-left">
              {ANALYSIS_STEPS.map((s, i) => (
                <div
                  key={s}
                  className={`flex items-center gap-3 text-sm transition-all duration-300 ${
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

            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                style={{ width: `${((analysisStep + 1) / ANALYSIS_STEPS.length) * 100}%` }}
              />
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
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              title="Back to pick"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                {currentAST.title}
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                {currentAST.jurisdiction} ·{' '}
                <span className="text-red-400 font-medium">
                  {currentAST.defects.length} defect{currentAST.defects.length !== 1 ? 's' : ''} detected
                </span>
                {' · '}
                <span className="text-cyan-400/90">{SOURCE_LABELS[analysisSource] || analysisSource}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {currentAST.defects.length > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Statutory issues found</span>
              </div>
            )}
            <Link
              href="/simulator"
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/20 text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <Scale className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Practice in Court</span>
              <span className="sm:hidden">Simulator</span>
            </Link>
          </div>
        </div>

        {analysisWarning && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-100 text-xs">
            <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>{analysisWarning}</span>
          </div>
        )}

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
              onOpenHearingSimulator={() => window.location.assign('/simulator')}
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
