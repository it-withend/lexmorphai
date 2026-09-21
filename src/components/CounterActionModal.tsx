'use client';

import React, { useState, useEffect } from 'react';
import { DocumentAST, CounterPleading } from '@/lib/types';
import confetti from 'canvas-confetti';
import {
  Scale,
  CheckSquare,
  Square,
  Download,
  Printer,
  Sparkles,
  CheckCircle2,
  X,
  FileCheck,
  Gavel,
} from 'lucide-react';
import Link from 'next/link';
import { persistStudioCase } from '@/lib/case-context';

interface CounterActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  ast: DocumentAST;
}

export default function CounterActionModal({ isOpen, onClose, ast }: CounterActionModalProps) {
  const [pleading, setPleading] = useState<CounterPleading | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [tenantName, setTenantName] = useState<string>('MARCUS A. REYNOLDS');
  const [isSigned, setIsSigned] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exported, setExported] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setExported(false);
    persistStudioCase(ast);

    const fetchPleading = async () => {
      try {
        setIsLoading(true);
        const res = await fetch('/api/response', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ast, tenantName }),
        });
        const data = await res.json();
        if (data.success) {
          setPleading(data.pleading);
          persistStudioCase(ast, data.pleading);
        }
      } catch (err) {
        console.error('Failed to fetch pleading:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPleading();
  }, [isOpen, ast, tenantName]);

  const toggleDefense = (defId: string) => {
    if (!pleading) return;
    const updated = pleading.affirmativeDefenses.map((d) =>
      d.id === defId ? { ...d, selected: !d.selected } : d
    );
    const next = { ...pleading, affirmativeDefenses: updated };
    setPleading(next);
    persistStudioCase(ast, next);
  };

  const handleSignPleading = () => {
    setIsSigned(true);
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#10b981', '#06b6d4', '#f59e0b'],
    });
  };

  const handleExportDocx = async () => {
    if (!pleading) return;
    try {
      setIsExporting(true);
      persistStudioCase(ast, pleading);
      const res = await fetch('/api/export-docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'pleading',
          data: pleading,
          filename: 'LexMorph_Court_Answer.docx',
        }),
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'LexMorph_Court_Answer.docx';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setExported(true);
    } catch (err) {
      console.error('Failed to download Word pleading:', err);
    } finally {
      setIsExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-md shadow-emerald-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Scale className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Court Answer draft</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-mono">
                  DRAFT · CHECK EVERY FACT BEFORE SIGNING
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                  EDUCATIONAL · NOT LEGAL ADVICE
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                A practice Answer you can edit — check every fact before using anything in a real court.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-950/40">
          {isLoading ? (
            <div className="p-16 text-center space-y-3">
              <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto"></div>
              <p className="text-sm font-medium text-slate-300">
                Building your Answer draft from the issues we found…
              </p>
            </div>
          ) : pleading ? (
            <div className="space-y-6">
              {/* Court Caption Review */}
              <div className="p-5 rounded-2xl bg-[#fdfcf7] text-[#111827] font-serif border border-slate-300 shadow-md">
                <div className="text-center font-bold text-sm uppercase tracking-wider mb-1">
                  {pleading.caption.courtName}
                </div>
                <div className="text-center font-semibold text-xs text-slate-600 uppercase mb-4">
                  {pleading.caption.countyOrDistrict}
                </div>

                <div className="grid grid-cols-12 border-t border-b border-slate-400 py-3 text-xs">
                  <div className="col-span-7 pr-3 border-r border-slate-300 font-sans">
                    <div className="font-bold text-slate-900">{pleading.caption.plaintiff}</div>
                    <div className="italic text-slate-500 my-1">-against-</div>
                    <div className="font-bold text-emerald-950 bg-emerald-100/60 p-1 rounded">
                      {pleading.caption.defendant}
                    </div>
                  </div>
                  <div className="col-span-5 pl-3 flex flex-col justify-center font-sans text-xs">
                    <div className="font-bold text-slate-900">Index No. {pleading.caption.indexNumber}</div>
                    <div className="text-emerald-800 font-semibold mt-1 uppercase text-[11px]">
                      {pleading.title}
                    </div>
                  </div>
                </div>

                {/* General Denial */}
                <div className="mt-4 pt-3 text-xs leading-relaxed text-slate-800">
                  <strong className="font-sans text-[11px] uppercase tracking-wider block text-slate-900 mb-1">
                    General Denial:
                  </strong>
                  {pleading.generalDenial}
                </div>
              </div>

              {/* Affirmative Defenses Toggles */}
              <div className="space-y-3">
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-emerald-400" />
                  <span>Affirmative Defenses Asserted ({pleading.affirmativeDefenses.filter((d) => d.selected).length})</span>
                </span>

                <div className="space-y-2">
                  {pleading.affirmativeDefenses.map((def) => (
                    <div
                      key={def.id}
                      onClick={() => toggleDefense(def.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer text-xs ${
                        def.selected
                          ? 'bg-slate-900 border-emerald-500/50 shadow-sm'
                          : 'bg-slate-950/40 border-slate-800 text-slate-500'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 text-emerald-400">
                          {def.selected ? (
                            <CheckSquare className="w-4 h-4" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-600" />
                          )}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white">{def.defenseName}</span>
                            <span className="font-mono text-[10px] text-emerald-400">
                              [{def.statutoryBasis}]
                            </span>
                          </div>
                          <p className="text-slate-300 leading-relaxed">{def.statement}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Statutory Relief Demand */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-2">
                <span className="font-semibold text-white uppercase text-[11px] tracking-wider block">
                  Demanded Relief:
                </span>
                <ul className="list-disc list-inside space-y-1 text-slate-300">
                  {pleading.demandForRelief.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* Draft verification — educational demo only */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-slate-950 to-slate-900 border border-amber-500/20 space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-xs font-semibold text-amber-200 uppercase tracking-wider">
                    DRAFT verification block (demo) — check every fact before any real signature
                  </span>
                  {isSigned && (
                    <span className="text-xs font-medium text-amber-300 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      Draft marked reviewed
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-amber-200/80 leading-relaxed">
                  Real court Answers may include a penalty-of-perjury clause. LexMorph never verifies facts —
                  do not treat this as a signed filing.
                </p>

                <p className="text-xs text-slate-400 italic">
                  &quot;{pleading.verificationBlock.penaltyOfPerjuryClause}&quot;
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <div className="text-xs text-slate-400">
                    Declarant:{' '}
                    <strong className="text-white">{pleading.verificationBlock.declarantName}</strong>
                    <span className="text-slate-500 ml-2">
                      ({pleading.verificationBlock.date}, {pleading.verificationBlock.county})
                    </span>
                  </div>

                  {!isSigned ? (
                    <button
                      onClick={handleSignPleading}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Mark draft reviewed (demo only)</span>
                    </button>
                  ) : (
                    <span className="px-3 py-1 bg-amber-950/60 border border-amber-500/30 text-amber-200 text-xs font-mono rounded-lg">
                      DRAFT MARKED — still verify before any real filing
                      <CheckCircle2 className="w-3.5 h-3.5 inline ml-1" />
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-slate-400 text-sm">Failed to load pleading.</div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-6 py-4 border-t border-slate-800 bg-slate-950">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition-colors text-left"
          >
            Close
          </button>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 justify-end">
            {exported && (
              <Link
                href="/simulator"
                onClick={() => persistStudioCase(ast, pleading)}
                className="px-4 py-2 bg-cyan-500/15 border border-cyan-500/30 text-cyan-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 hover:bg-cyan-500/25"
              >
                <Gavel className="w-3.5 h-3.5" />
                Practice this Answer in Hearing Coach
              </Link>
            )}

            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print draft</span>
            </button>

            <button
              onClick={handleExportDocx}
              disabled={isExporting}
              className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? 'Generating Word…' : '1. Download Answer (.docx)'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
