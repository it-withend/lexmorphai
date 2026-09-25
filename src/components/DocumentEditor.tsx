'use client';

import React, { useState } from 'react';
import { DocumentAST, LegalDefect } from '@/lib/types';
import { AlertTriangle, Edit3, Check, Info } from 'lucide-react';

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

  const handleSectionTextChange = (sectionId: string, newContent: string) => {
    onUpdateAST({
      ...ast,
      sections: ast.sections.map((sec) =>
        sec.id === sectionId ? { ...sec, content: newContent } : sec
      ),
    });
  };

  const handleFieldChange = (sectionId: string, fieldId: string, value: string) => {
    onUpdateAST({
      ...ast,
      sections: ast.sections.map((sec) => {
        if (sec.id === sectionId && sec.interactiveFields) {
          return {
            ...sec,
            interactiveFields: sec.interactiveFields.map((f) =>
              f.id === fieldId ? { ...f, value } : f
            ),
          };
        }
        return sec;
      }),
    });
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800/80 bg-slate-950/60">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-brass animate-pulse" />
          <span className="text-xs font-semibold text-white tracking-wide uppercase">
            Document editor
          </span>
          <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
            · click any clause to edit
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>{ast.sections.length} blocks</span>
          {ast.defects.length > 0 && (
            <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 font-medium flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              {ast.defects.length} flags
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center bg-slate-950/80">
        <div
          id="lexmorph-paper"
          className="w-full max-w-3xl min-h-[700px] bg-[#fefdfa] text-[#111827] rounded-lg shadow-2xl border border-[#e5e0d3] p-8 sm:p-12 font-serif text-[15px] leading-relaxed relative"
        >
          <div className="absolute top-4 right-6 text-[10px] font-mono text-slate-400 uppercase tracking-widest pointer-events-none">
            LexMorph · {ast.jurisdiction}
          </div>

          {ast.caption?.courtName?.trim() && ast.caption?.plaintiff?.trim() ? (
            <div className="mb-8 pb-6 border-b-2 border-slate-900">
              <div className="text-center font-bold text-base tracking-wide uppercase mb-1">
                {ast.caption.courtName}
              </div>
              <div className="text-center font-semibold text-sm uppercase mb-6 text-slate-700">
                {ast.caption.countyOrDistrict}
              </div>
              <div className="grid grid-cols-12 border-t border-b border-slate-800 py-3 gap-4">
                <div className="col-span-7 pr-4 border-r border-slate-300">
                  <div className="font-bold text-sm">{ast.caption.plaintiff}</div>
                  <div className="text-xs italic text-slate-600 my-1">-against-</div>
                  <div className="font-bold text-sm">{ast.caption.defendant}</div>
                </div>
                <div className="col-span-5 pl-2 text-xs">
                  <div className="font-bold">Index No. {ast.caption.indexNumber}</div>
                  <div className="text-[11px] text-slate-600 mt-1 uppercase font-semibold">
                    {ast.caption.documentTitle}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center font-bold text-lg tracking-wide mb-6 pb-4 border-b border-slate-300">
              {ast.title}
            </div>
          )}

          <div className="space-y-4">
            {ast.sections.map((section) => {
              const defect = ast.defects.find((d) => d.id === section.redFlagId);
              const isFlagged = Boolean(defect);
              const isDefectActive = isFlagged && activeDefectId === defect?.id;
              const isEditing = editingSectionId === section.id;

              return (
                <div
                  key={section.id}
                  className={`group relative p-3 -mx-3 rounded-lg transition-all ${
                    isFlagged ? 'bg-red-50/70 border-2 border-red-400/80' : 'hover:bg-slate-100/60 border border-transparent'
                  } ${isDefectActive ? 'ring-2 ring-red-500' : ''}`}
                >
                  {isFlagged && defect && (
                    <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-red-200 text-xs font-sans">
                      <button
                        onClick={() => onSelectDefect?.(defect.id)}
                        className="flex items-center gap-1.5 text-red-700 font-bold hover:underline"
                      >
                        <AlertTriangle className="w-4 h-4" />
                        {defect.title}
                      </button>
                      <button
                        onClick={() => setActiveTooltipDefect(defect)}
                        className="px-2 py-0.5 rounded bg-red-600 text-white font-semibold text-[11px] flex items-center gap-1"
                      >
                        <Info className="w-3 h-3" />
                        Why this matters
                      </button>
                    </div>
                  )}

                  {section.title && (
                    <div className="font-bold text-sm uppercase mb-2 text-slate-900">{section.title}</div>
                  )}

                  {section.type === 'table' && section.tableData ? (
                    <div className="overflow-x-auto my-3 font-sans text-xs">
                      <table className="w-full border-collapse border border-slate-300">
                        <thead>
                          <tr className="bg-slate-100">
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
                                <td key={cIdx} className="border border-slate-300 px-3 py-2">
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
                        rows={4}
                        className="w-full p-3 font-serif text-sm border border-brass rounded bg-white focus:outline-none focus:ring-2 focus:ring-brass"
                      />
                      <button
                        onClick={() => setEditingSectionId(null)}
                        className="px-3 py-1 bg-brass text-ink text-xs rounded font-sans flex items-center gap-1 ml-auto"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Done
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => setEditingSectionId(section.id)}
                      className="cursor-text whitespace-pre-line"
                    >
                      {section.content}
                    </div>
                  )}

                  {section.interactiveFields?.map((field) => (
                    <div key={field.id} className="mt-3 flex flex-col sm:flex-row gap-2 font-sans text-xs">
                      <label className="font-semibold text-slate-700 min-w-36">{field.label}:</label>
                      <input
                        type="text"
                        value={field.value}
                        onChange={(e) => handleFieldChange(section.id, field.id, e.target.value)}
                        className="flex-1 px-3 py-1.5 rounded border border-slate-300 bg-white focus:border-brass focus:outline-none"
                      />
                    </div>
                  ))}

                  {!isEditing && section.type !== 'table' && (
                    <button
                      onClick={() => setEditingSectionId(section.id)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 bg-white border border-slate-300 rounded text-slate-600"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {activeTooltipDefect && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-red-500/40 rounded-2xl p-6 space-y-3">
            <h4 className="text-sm font-bold text-white">{activeTooltipDefect.title}</h4>
            <p className="text-xs text-red-400 font-mono">{activeTooltipDefect.citation}</p>
            <p className="text-xs text-slate-200">{activeTooltipDefect.plainEnglishExplanation}</p>
            <p className="text-xs text-brass-bright">{activeTooltipDefect.recommendedDefense}</p>
            <button
              onClick={() => setActiveTooltipDefect(null)}
              className="px-4 py-1.5 bg-brass text-ink rounded-lg text-xs font-semibold"
            >
              Understood
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
