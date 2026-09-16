'use client';

import React, { useState } from 'react';
import { DocumentAST, LegalDefect } from '@/lib/types';
import { printLivingDocument } from '@/lib/print-document';
import {
  ShieldAlert,
  AlertTriangle,
  Download,
  Copy,
  Check,
  Scale,
  Sparkles,
  ChevronRight,
  Printer,
  ListChecks,
  Clock3,
} from 'lucide-react';

interface RedFlagSidebarProps {
  ast: DocumentAST;
  onSelectDefect: (defectId: string) => void;
  onOpenCounterAction: () => void;
  onOpenHearingSimulator?: () => void;
}

export default function RedFlagSidebar({
  ast,
  onSelectDefect,
  onOpenCounterAction,
  onOpenHearingSimulator,
}: RedFlagSidebarProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isExportingDocx, setIsExportingDocx] = useState(false);

  const score = ast.audit.defenseViabilityScore;
  const grade = ast.audit.viabilityGrade;

  const handleCopyDefense = (defect: LegalDefect) => {
    const text = `${defect.recommendedDefense}\nStatutory Basis: ${defect.citation}\n${defect.plainEnglishExplanation}`;
    navigator.clipboard.writeText(text);
    setCopiedId(defect.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleDownloadDocx = async () => {
    try {
      setIsExportingDocx(true);
      const res = await fetch('/api/export-docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'ast',
          data: ast,
          filename: ast.originalImageUrl
            ? 'lexmorph_living_document.docx'
            : 'reconstructed_legal_document.docx',
        }),
      });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = ast.originalImageUrl
        ? 'lexmorph_living_document.docx'
        : 'reconstructed_legal_document.docx';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      console.error('Docx export error:', e);
      alert('Could not generate Word document. Please try again.');
    } finally {
      setIsExportingDocx(false);
    }
  };

  return (
    <aside className="w-full flex flex-col bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 space-y-6 shadow-xl backdrop-blur-sm">
      {/* Score Header */}
      <div className="p-4 rounded-xl bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Legal Defense Viability
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
            Pro Se Advantage
          </span>
        </div>

        <div className="flex items-end gap-3 mb-2">
          <div className="text-4xl font-extrabold text-white tracking-tight font-mono">
            {score}<span className="text-emerald-400 text-2xl">%</span>
          </div>
          <div className="text-xs font-semibold text-emerald-400 pb-1.5 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            {grade}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden mb-3">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
            style={{ width: `${score}%` }}
          ></div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          {ast.audit.summaryHeadline}
        </p>
      </div>

      {/* 1-Click Action CTA */}
      <div className="space-y-2">
        <button
          onClick={onOpenCounterAction}
          className="w-full py-3 px-4 rounded-xl font-semibold text-sm bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all flex items-center justify-center gap-2 group"
        >
          <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
          <span>Generate Official Court Answer</span>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </button>

        {onOpenHearingSimulator && (
          <button
            onClick={onOpenHearingSimulator}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-700/80 text-cyan-300 border border-cyan-500/20 transition-colors flex items-center justify-center gap-2"
          >
            <Scale className="w-3.5 h-3.5 text-cyan-400" />
            <span>Practice in Court Hearing Simulator</span>
          </button>
        )}
      </div>

      {/* Export Reconstructed Document */}
      <div className="pt-2 border-t border-slate-800/60">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
          Export Living Document
        </span>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleDownloadDocx}
            disabled={isExportingDocx}
            className="py-2 px-3 rounded-lg text-xs font-medium bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-200 hover:text-white transition-colors flex items-center justify-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span>{isExportingDocx ? 'Exporting...' : 'Word (.docx)'}</span>
          </button>

          <button
            onClick={() => printLivingDocument(ast)}
            className="py-2 px-3 rounded-lg text-xs font-medium bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-200 hover:text-white transition-colors flex items-center justify-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5 text-emerald-400" />
            <span>Print / Save PDF</span>
          </button>
        </div>
        <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">
          Editable file = Word (.docx). Print opens a clean page with only the letter — use your browser&apos;s &quot;Save as PDF&quot;.
        </p>
      </div>

      {/* Next steps checklist */}
      {ast.audit.actionSteps?.length > 0 && (
        <div className="pt-2 border-t border-slate-800/60 space-y-3">
          <span className="text-xs font-semibold text-white flex items-center gap-1.5">
            <ListChecks className="w-4 h-4 text-emerald-400" />
            What to do next
          </span>
          <div className="space-y-2">
            {ast.audit.actionSteps.map((step) => (
              <div
                key={step.stepNumber}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-slate-100">
                    {step.stepNumber}. {step.title}
                  </span>
                  {step.urgent && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase">
                      Urgent
                    </span>
                  )}
                </div>
                <p className="text-slate-400 leading-relaxed">{step.description}</p>
                {step.deadline && (
                  <p className="text-slate-500 flex items-center gap-1">
                    <Clock3 className="w-3 h-3" />
                    {step.deadline}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detected Statutory Defects List */}
      <div className="space-y-3 pt-2 border-t border-slate-800/60">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-white flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-red-400" />
            <span>Statutory Red Flags ({ast.defects.length})</span>
          </span>
          <span className="text-[10px] text-slate-400 font-mono">Dismissal Triggers</span>
        </div>

        <div className="space-y-3">
          {ast.defects.map((defect) => (
            <div
              key={defect.id}
              className="p-3 rounded-xl bg-slate-950 border border-red-500/30 hover:border-red-400 transition-colors text-xs space-y-2 group"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-semibold text-red-300 leading-snug line-clamp-2">
                  {defect.title}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 shrink-0 uppercase font-mono">
                  {defect.severity}
                </span>
              </div>

              <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                <span>Citation:</span>
                <strong className="text-slate-200">{defect.citation}</strong>
              </div>

              <p className="text-slate-400 text-[11px] line-clamp-3 leading-relaxed">
                {defect.plainEnglishExplanation}
              </p>

              <div className="flex items-center justify-between pt-1 border-t border-slate-900">
                <button
                  onClick={() => onSelectDefect(defect.id)}
                  className="text-[11px] text-emerald-400 hover:text-emerald-300 font-medium"
                >
                  Highlight in Canvas
                </button>

                <button
                  onClick={() => handleCopyDefense(defect)}
                  className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                >
                  {copiedId === defect.id ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy Law</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
