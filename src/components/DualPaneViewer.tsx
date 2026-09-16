'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { DocumentAST } from '@/lib/types';
import DocumentEditor from './DocumentEditor';
import { Columns, Eye, FileText, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface DualPaneViewerProps {
  ast: DocumentAST;
  onUpdateAST: (updated: DocumentAST) => void;
  activeDefectId?: string;
  onSelectDefect?: (defectId: string) => void;
}

export default function DualPaneViewer({
  ast,
  onUpdateAST,
  activeDefectId,
  onSelectDefect,
}: DualPaneViewerProps) {
  const hasSource = Boolean(ast.originalImageUrl || ast.sourceText);
  const [viewMode, setViewMode] = useState<'split' | 'editor' | 'scan'>(hasSource ? 'split' : 'editor');
  const [zoomLevel, setZoomLevel] = useState(100);

  const handleZoom = (delta: number) => {
    setZoomLevel((prev) => Math.min(200, Math.max(60, prev + delta)));
  };

  return (
    <div className="w-full h-full flex flex-col space-y-3">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 gap-1">
          {hasSource && (
            <button
              onClick={() => setViewMode('split')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'split' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              Dual view
            </button>
          )}
          <button
            onClick={() => setViewMode('editor')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === 'editor' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Living document
          </button>
          {hasSource && (
            <button
              onClick={() => setViewMode('scan')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'scan' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              Source
            </button>
          )}
        </div>

        {(viewMode === 'split' || viewMode === 'scan') && ast.originalImageUrl && (
          <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-900 border border-slate-800 px-2 py-1 rounded-xl">
            <button onClick={() => handleZoom(-15)} className="p-1 hover:text-white hover:bg-slate-800 rounded">
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-white text-[11px] min-w-8 text-center">{zoomLevel}%</span>
            <button onClick={() => handleZoom(15)} className="p-1 hover:text-white hover:bg-slate-800 rounded">
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel(100)}
              className="p-1 hover:text-white hover:bg-slate-800 rounded ml-1 text-slate-500"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 min-h-[720px] grid grid-cols-1 lg:grid-cols-12 gap-4">
        {(viewMode === 'split' || viewMode === 'scan') && hasSource && (
          <div
            className={`${
              viewMode === 'split' ? 'lg:col-span-5' : 'lg:col-span-12'
            } h-full min-h-[600px] flex flex-col bg-slate-950 rounded-2xl border border-slate-800/90 overflow-hidden`}
          >
            <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 text-xs text-slate-400">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                {ast.originalImageUrl ? 'Sample scan' : 'Source text you pasted'}
              </span>
            </div>

            <div className="flex-1 overflow-auto p-4 bg-slate-950/80">
              {ast.originalImageUrl ? (
                <div
                  style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
                  className="w-full max-w-[620px] mx-auto relative aspect-[8/11] bg-[#fcfbf7] rounded border border-slate-800"
                >
                  <Image
                    src={ast.originalImageUrl}
                    alt="Sample legal notice"
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
              ) : (
                <pre className="whitespace-pre-wrap text-xs text-slate-300 font-mono leading-relaxed bg-slate-900/80 border border-slate-800 rounded-xl p-4 max-h-[680px] overflow-auto">
                  {ast.sourceText}
                </pre>
              )}
            </div>
          </div>
        )}

        {(viewMode === 'split' || viewMode === 'editor') && (
          <div
            className={`${
              viewMode === 'split' && hasSource ? 'lg:col-span-7' : 'lg:col-span-12'
            } h-full min-h-[600px] flex flex-col`}
          >
            <DocumentEditor
              ast={ast}
              onUpdateAST={onUpdateAST}
              activeDefectId={activeDefectId}
              onSelectDefect={onSelectDefect}
            />
          </div>
        )}
      </div>
    </div>
  );
}
