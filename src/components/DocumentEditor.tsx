'use client';

import React, { useState } from 'react';
import { DocumentAST, DocumentSection, LegalDefect } from '@/lib/types';
import { AlertTriangle, Edit3, HelpCircle, Check, Info } from 'lucide-react';

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
      {/* Editor Toolbar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
          <span className="text-xs font-semibold text-white tracking-wide uppercase">
            Living Document Canvas
          </span>
          <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
            (100% In-Place Editable • Legal Typographic Standards)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">
            {ast.sections.length} Reconstructed Blocks
          </span>
          <div className="h-4 w-px bg-slate-800"></div>
          <span className="text-xs px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 font-medium flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            {ast.defects.length} Defect Flags
          </span>
        </div>
      </div>

      {/* Main Document Paper Container */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center bg-slate-950/80">
        <div className="w-full max-w-3xl min-h-[900px] bg-[#fefdfa] text-[#111827] rounded-lg shadow-2xl border border-[#e5e0d3] p-8 sm:p-12 font-serif text-[15px] leading-relaxed relative selection:bg-emerald-100 selection:text-emerald-950">
          {/* Subtle Document Header Stamp */}
          <div className="absolute top-4 right-6 text-[10px] font-mono text-slate-400 uppercase tracking-widest pointer-events-none">
            LexMorph Living Schema • {ast.jurisdiction}
          </div>

          {/* Court Caption Block (if present) */}
          {ast.caption && (
            <div className="mb-8 pb-6 border-b-2 border-slate-900">
              <div className="text-center font-bold text-base tracking-wide uppercase mb-1">
                {ast.caption.courtName}
              </div>
              <div className="text-center font-semibold text-sm tracking-wider uppercase mb-6 text-slate-700">
                {ast.caption.countyOrDistrict}
              </div>

              <div className="grid grid-cols-12 border-t border-b border-slate-800 py-3 gap-4">
                {/* Left side: Parties */}
                <div className="col-span-7 pr-4 border-r border-slate-300">
                  <div className="font-bold text-sm">{ast.caption.plaintiff}</div>
                  <div className="text-xs italic text-slate-600 my-1">-against-</div>
                  <div className="font-bold text-sm">{ast.caption.defendant}</div>
                </div>

                {/* Right side: Index & Caption */}
                <div className="col-span-5 pl-2 flex flex-col justify-center text-xs">
                  <div className="font-bold text-slate-900">Index No. {ast.caption.indexNumber}</div>
                  <div className="text-[11px] text-slate-600 mt-1 uppercase font-semibold">
                    {ast.caption.documentTitle}
                  </div>
                  {ast.metadata.propertyAddress && (
                    <div className="text-[11px] text-slate-500 mt-1">
                      Premises: {ast.metadata.propertyAddress}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Standard Document Title if no formal caption */}
          {!ast.caption && (
            <div className="text-center font-bold text-lg uppercase tracking-wide mb-6 pb-4 border-b border-slate-300">
              {ast.title}
            </div>
          )}

          {/* Document Sections */}
          <div className="space-y-6">
            {ast.sections.map((section, idx) => {
              const defect = ast.defects.find((d) => d.id === section.redFlagId);
              const isFlagged = Boolean(defect);
              const isDefectActive = isFlagged && activeDefectId === defect?.id;
              const isEditing = editingSectionId === section.id;

              return (
                <div
                  key={section.id}
                  className={`group relative p-3 -mx-3 rounded-lg transition-all duration-200 ${
                    isFlagged
                      ? 'bg-red-50/70 border-2 border-red-400/80 shadow-sm'
                      : 'hover:bg-slate-100/60 border border-transparent'
                  } ${isDefectActive ? 'ring-2 ring-red-500 bg-red-100/60' : ''}`}
                >
                  {/* Defect Warning Badge */}
                  {isFlagged && defect && (
                    <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-red-200 text-xs font-sans">
                      <div
                        onClick={() => onSelectDefect && onSelectDefect(defect.id)}
                        className="flex items-center gap-1.5 text-red-700 font-bold cursor-pointer hover:underline"
                      >
                        <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                        <span>{defect.title}</span>
                      </div>

                      <button
                        onClick={() => setActiveTooltipDefect(defect)}
                        className="px-2 py-0.5 rounded bg-red-600 text-white font-semibold text-[11px] hover:bg-red-700 transition-colors flex items-center gap-1"
                      >
                        <Info className="w-3 h-3" />
                        <span>Why this is void</span>
                      </button>
                    </div>
                  )}

                  {/* Section Title */}
                  {section.title && (
                    <div className="font-bold text-sm tracking-wide uppercase mb-2 text-slate-900">
                      {section.title}
                    </div>
                  )}

                  {/* Section Table Rendering */}
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
                            <tr key={rIdx} className="hover:bg-slate-50">
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
                    /* In-place Editable Textarea */
                    <div className="space-y-2">
                      <textarea
                        value={section.content}
                        onChange={(e) => handleSectionTextChange(section.id, e.target.value)}
                        rows={4}
                        className="w-full p-3 font-serif text-sm border border-emerald-500 rounded bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                      />
                      <div className="flex justify-end">
                        <button
                          onClick={() => setEditingSectionId(null)}
                          className="px-3 py-1 bg-emerald-600 text-white text-xs rounded font-sans font-medium hover:bg-emerald-700 flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Done Editing</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Static Text with Click-to-Edit Hover Hint */
                    <div
                      onClick={() => setEditingSectionId(section.id)}
                      className="cursor-text group-hover:text-black whitespace-pre-line"
                      title="Click anywhere to edit text"
                    >
                      {section.content}
                    </div>
                  )}

                  {/* Interactive Fields (e.g. Signature, dates, inputs) */}
                  {section.interactiveFields && section.interactiveFields.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-200 font-sans text-xs space-y-3">
                      {section.interactiveFields.map((field) => (
                        <div key={field.id} className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <label className="font-semibold text-slate-700 min-w-36">
                            {field.label}:
                          </label>
                          <input
                            type="text"
                            placeholder={field.placeholder || 'Type here...'}
                            value={field.value}
                            onChange={(e) => handleFieldChange(section.id, field.id, e.target.value)}
                            className="flex-1 px-3 py-1.5 rounded border border-slate-300 bg-white text-slate-900 font-sans text-xs focus:border-emerald-500 focus:outline-none"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Floating Edit Icon */}
                  {!isEditing && section.type !== 'table' && (
                    <button
                      onClick={() => setEditingSectionId(section.id)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-white/90 border border-slate-300 rounded text-slate-600 hover:text-emerald-600 text-xs shadow-sm"
                      title="Edit this clause"
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

      {/* Plain English Tooltip Modal */}
      {activeTooltipDefect && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-red-500/40 rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{activeTooltipDefect.title}</h4>
                  <span className="text-xs text-red-400 font-mono">{activeTooltipDefect.citation}</span>
                </div>
              </div>
              <button
                onClick={() => setActiveTooltipDefect(null)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs font-sans leading-relaxed">
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-slate-400 font-semibold uppercase text-[10px] block mb-1">
                  Plain English Meaning (What this means for you):
                </span>
                <p className="text-slate-200">{activeTooltipDefect.plainEnglishExplanation}</p>
              </div>

              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30">
                <span className="text-emerald-400 font-semibold uppercase text-[10px] block mb-1">
                  Your Recommended Legal Defense:
                </span>
                <p className="text-emerald-200">{activeTooltipDefect.recommendedDefense}</p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <span className="text-slate-400">
                  Court Dismissal Probability Impact:{' '}
                  <strong className="text-emerald-400">+{activeTooltipDefect.dismissalImpactPercentage}%</strong>
                </span>
                <button
                  onClick={() => setActiveTooltipDefect(null)}
                  className="px-4 py-1.5 bg-emerald-500 text-slate-950 rounded-lg font-semibold hover:bg-emerald-400 transition-colors"
                >
                  Understood
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
