'use client';

import React, { useState } from 'react';
import { DocumentAST, LegalDefect } from '@/lib/types';
import { AlertTriangle, Edit3, Check, Info, Camera, Type } from 'lucide-react';

interface DocumentEditorProps {
  ast: DocumentAST;
  onUpdateAST: (updated: DocumentAST) => void;
  activeDefectId?: string;
  onSelectDefect?: (defectId: string) => void;
}

export default function DocumentEditor({
  ast,
  onUpdateAST,
  activeDefectId,
  onSelectDefect,
}: DocumentEditorProps) {
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [activeTooltipDefect, setActiveTooltipDefect] = useState<LegalDefect | null>(null);
  const [showTranscript, setShowTranscript] = useState(true);

  const isVisualTwin = Boolean(ast.originalImageUrl);

  const handleSectionTextChange = (sectionId: string, newContent: string) => {
    const updatedSections = ast.sections.map((sec) =>
      sec.id === sectionId ? { ...sec, content: newContent } : sec
    );
    onUpdateAST({ ...ast, sections: updatedSections });
  };

  const handleFieldChange = (sectionId: string, fieldId: string, value: string) => {
    const updatedSections = ast.sections.map((sec) => {
      if (sec.id === sectionId && sec.interactiveFields) {
        return {
          ...sec,
          interactiveFields: sec.interactiveFields.map((f) =>
            f.id === fieldId ? { ...f, value } : f
          ),
        };
      }
      return sec;
    });
    onUpdateAST({ ...ast, sections: updatedSections });
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-sm print:hidden">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-semibold text-white tracking-wide uppercase">
            {isVisualTwin ? 'Visual Twin Canvas' : 'Living Document Canvas'}
          </span>
          <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
            {isVisualTwin
              ? '· Photo 1:1 (logo / stamp / signature preserved)'
              : '· In-place editable'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isVisualTwin && (
            <button
              onClick={() => setShowTranscript((v) => !v)}
              className="text-[11px] px-2 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white flex items-center gap-1"
            >
              <Type className="w-3 h-3" />
              {showTranscript ? 'Hide transcript' : 'Show transcript'}
            </button>
          )}
          <span className="text-xs text-slate-400 font-medium">{ast.sections.length} text lines</span>
          {ast.defects.length > 0 && (
            <>
              <div className="h-4 w-px bg-slate-800" />
              <span className="text-xs px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 font-medium flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                {ast.defects.length} Defect Flags
              </span>
            </>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center bg-slate-950/80">
        <div
          id="lexmorph-paper"
          className="w-full max-w-3xl min-h-[400px] bg-[#fefdfa] text-[#111827] rounded-lg shadow-2xl border border-[#e5e0d3] p-5 sm:p-8 font-serif text-[15px] leading-relaxed relative selection:bg-emerald-100 selection:text-emerald-950"
        >
          {isVisualTwin && ast.originalImageUrl && (
            <div className="mb-6 space-y-3">
              <div className="flex items-center gap-2 text-[11px] font-sans font-semibold uppercase tracking-wide text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 print:hidden">
                <Camera className="w-3.5 h-3.5 shrink-0" />
                Exact photo twin — logo, stamp, handwriting &amp; seal preserved
                {typeof ast.ocrConfidence === 'number' && (
                  <span className="ml-auto text-emerald-700/80 normal-case tracking-normal font-medium">
                    OCR ~{ast.ocrConfidence}%
                  </span>
                )}
              </div>
              <div className="relative w-full overflow-hidden rounded-md border border-slate-300 bg-white shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={ast.originalImageUrl}
                  alt="Original scanned document — visual twin"
                  className="w-full h-auto block"
                />
              </div>
              <p className="text-[11px] font-sans text-slate-500 leading-relaxed print:hidden">
                Word export embeds this exact image first, then the transcript for search/edit. Free OCR cannot
                redraw a seal perfectly — the photo is the 1:1 layer.
              </p>
            </div>
          )}

          {(!isVisualTwin || showTranscript) && (
            <>
              {isVisualTwin && (
                <div className="mb-4 pb-3 border-b border-slate-300 flex items-center gap-2 font-sans">
                  <Type className="w-4 h-4 text-slate-600" />
                  <span className="text-xs font-bold uppercase tracking-wide text-slate-700">
                    Editable transcript (click a line to fix OCR)
                  </span>
                </div>
              )}

              {ast.caption?.courtName?.trim() && ast.caption?.plaintiff?.trim() ? (
                <div className="mb-8 pb-6 border-b-2 border-slate-900">
                  <div className="text-center font-bold text-base tracking-wide uppercase mb-1">
                    {ast.caption.courtName}
                  </div>
                  <div className="text-center font-semibold text-sm tracking-wider uppercase mb-6 text-slate-700">
                    {ast.caption.countyOrDistrict}
                  </div>
                  <div className="grid grid-cols-12 border-t border-b border-slate-800 py-3 gap-4">
                    <div className="col-span-7 pr-4 border-r border-slate-300">
                      <div className="font-bold text-sm">{ast.caption.plaintiff}</div>
                      <div className="text-xs italic text-slate-600 my-1">-against-</div>
                      <div className="font-bold text-sm">{ast.caption.defendant}</div>
                    </div>
                    <div className="col-span-5 pl-2 flex flex-col justify-center text-xs">
                      <div className="font-bold text-slate-900">Index No. {ast.caption.indexNumber}</div>
                      <div className="text-[11px] text-slate-600 mt-1 uppercase font-semibold">
                        {ast.caption.documentTitle}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                !isVisualTwin && (
                  <div className="text-center font-bold text-lg tracking-wide mb-6 pb-4 border-b border-slate-300">
                    {ast.title}
                  </div>
                )
              )}

              <div className="space-y-3">
                {ast.sections.map((section) => {
                  const defect = ast.defects.find((d) => d.id === section.redFlagId);
                  const isFlagged = Boolean(defect);
                  const isDefectActive = isFlagged && activeDefectId === defect?.id;
                  const isEditing = editingSectionId === section.id;

                  return (
                    <div
                      key={section.id}
                      className={`group relative p-2.5 -mx-2 rounded-lg transition-all duration-200 ${
                        isFlagged
                          ? 'bg-red-50/70 border-2 border-red-400/80 shadow-sm'
                          : 'hover:bg-slate-100/60 border border-transparent'
                      } ${isDefectActive ? 'ring-2 ring-red-500 bg-red-100/60' : ''}`}
                    >
                      {isFlagged && defect && (
                        <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-red-200 text-xs font-sans">
                          <div
                            onClick={() => onSelectDefect?.(defect.id)}
                            className="flex items-center gap-1.5 text-red-700 font-bold cursor-pointer hover:underline"
                          >
                            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                            <span>{defect.title}</span>
                          </div>
                          <button
                            onClick={() => setActiveTooltipDefect(defect)}
                            className="px-2 py-0.5 rounded bg-red-600 text-white font-semibold text-[11px] hover:bg-red-700 flex items-center gap-1"
                          >
                            <Info className="w-3 h-3" />
                            Why this matters
                          </button>
                        </div>
                      )}

                      {section.title && (
                        <div className="font-bold text-sm tracking-wide uppercase mb-2 text-slate-900">
                          {section.title}
                        </div>
                      )}

                      {section.type === 'table' && section.tableData ? (
                        <div className="overflow-x-auto my-3 font-sans text-xs">
                          <table className="w-full border-collapse border border-slate-300">
                            <thead>
                              <tr className="bg-slate-100 text-slate-800">
                                {section.tableData.headers.map((h, i) => (
                                  <th key={i} className="border border-slate-300 px-3 py-2 text-left font-bold">
                                    {h}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {section.tableData.rows.map((row, rIdx) => (
                                <tr key={rIdx}>
                                  {row.map((cell, cIdx) => (
                                    <td key={cIdx} className="border border-slate-300 px-3 py-2 text-slate-700">
                                      {cell}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : isEditing ? (
                        <div className="space-y-2">
                          <textarea
                            value={section.content}
                            onChange={(e) => handleSectionTextChange(section.id, e.target.value)}
                            rows={3}
                            className="w-full p-3 font-serif text-sm border border-emerald-500 rounded bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                          />
                          <div className="flex justify-end">
                            <button
                              onClick={() => setEditingSectionId(null)}
                              className="px-3 py-1 bg-emerald-600 text-white text-xs rounded font-sans font-medium hover:bg-emerald-700 flex items-center gap-1"
                            >
                              <Check className="w-3.5 h-3.5" />
                              Done
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div
                          onClick={() => setEditingSectionId(section.id)}
                          className="cursor-text whitespace-pre-line text-[14px]"
                          title="Click to edit this line"
                        >
                          {section.content}
                        </div>
                      )}

                      {section.interactiveFields?.map((field) => (
                        <div key={field.id} className="mt-3 flex flex-col sm:flex-row sm:items-center gap-2 font-sans text-xs">
                          <label className="font-semibold text-slate-700 min-w-36">{field.label}:</label>
                          <input
                            type="text"
                            value={field.value}
                            onChange={(e) => handleFieldChange(section.id, field.id, e.target.value)}
                            className="flex-1 px-3 py-1.5 rounded border border-slate-300 bg-white text-slate-900 focus:border-emerald-500 focus:outline-none"
                          />
                        </div>
                      ))}

                      {!isEditing && section.type !== 'table' && (
                        <button
                          onClick={() => setEditingSectionId(section.id)}
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-white/90 border border-slate-300 rounded text-slate-600 hover:text-emerald-600 print:hidden"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {activeTooltipDefect && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-red-500/40 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <h4 className="text-sm font-bold text-white">{activeTooltipDefect.title}</h4>
                <span className="text-xs text-red-400 font-mono">{activeTooltipDefect.citation}</span>
              </div>
              <button onClick={() => setActiveTooltipDefect(null)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-200 mb-3">{activeTooltipDefect.plainEnglishExplanation}</p>
            <p className="text-xs text-emerald-200 mb-4">{activeTooltipDefect.recommendedDefense}</p>
            <button
              onClick={() => setActiveTooltipDefect(null)}
              className="px-4 py-1.5 bg-emerald-500 text-slate-950 rounded-lg text-xs font-semibold"
            >
              Understood
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
