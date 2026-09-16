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
  const [viewMode, setViewMode] = useState<'split' | 'editor' | 'scan'>('split');
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  const handleZoom = (delta: number) => {
    setZoomLevel((prev) => Math.min(200, Math.max(60, prev + delta)));
  };

  const handleResetZoom = () => {
    setZoomLevel(100);
  };

  return (
    <div className="w-full h-full flex flex-col space-y-3">
      {/* Top View Selector Bar */}
      <div className="flex items-center justify-between px-2">
        {/* Mode Toggles */}
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 gap-1">
          <button
            onClick={() => setViewMode('split')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === 'split'
                ? 'bg-slate-800 text-emerald-400 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Dual Split View</span>
          </button>

          <button
            onClick={() => setViewMode('editor')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === 'editor'
                ? 'bg-slate-800 text-emerald-400 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Living Document</span>
          </button>

          <button
            onClick={() => setViewMode('scan')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === 'scan'
                ? 'bg-slate-800 text-emerald-400 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Original Scan</span>
          </button>
        </div>

        {/* Scan Zoom Controls */}
        {(viewMode === 'split' || viewMode === 'scan') && (
          <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-900 border border-slate-800 px-2 py-1 rounded-xl">
            <span className="text-[11px] font-mono mr-1">Scan Zoom:</span>
            <button
              onClick={() => handleZoom(-15)}
              className="p-1 hover:text-white hover:bg-slate-800 rounded"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-white text-[11px] min-w-8 text-center">
              {zoomLevel}%
            </span>
            <button
              onClick={() => handleZoom(15)}
              className="p-1 hover:text-white hover:bg-slate-800 rounded"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleResetZoom}
              className="p-1 hover:text-white hover:bg-slate-800 rounded ml-1 text-slate-500 hover:text-slate-300"
              title="Reset Zoom"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* Workspace Area */}
      <div className="flex-1 min-h-[720px] grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Pane: Original Document Photo / Scan */}
        {(viewMode === 'split' || viewMode === 'scan') && (
          <div
            className={`${
              viewMode === 'split' ? 'lg:col-span-5' : 'lg:col-span-12'
            } h-full min-h-[600px] flex flex-col bg-slate-950 rounded-2xl border border-slate-800/90 overflow-hidden shadow-2xl relative`}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 text-xs text-slate-400">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                Original Ingested Scan / Photo
              </span>
              <span className="text-[11px] font-mono text-slate-500">Photometric Source</span>
            </div>

            {/* Image Viewport with Pan / Zoom */}
            <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-slate-950/80">
              <div
                style={{
                  transform: `scale(${zoomLevel / 100})`,
                  transformOrigin: 'top center',
                  transition: 'transform 0.15s ease-out',
                }}
                className="w-full max-w-[620px] shadow-2xl rounded border border-slate-800 relative bg-[#fcfbf7]"
              >
                {ast.originalImageUrl ? (
                  <div className="relative w-full aspect-[8/11]">
                    <Image
                      src={ast.originalImageUrl}
                      alt="Original legal notice scan"
                      fill
                      className="object-contain"
                      priority
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="p-12 text-center text-slate-500 font-mono text-xs">
                    Uploaded Document Image Source
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Right Pane: Living Reconstructed Document Editor */}
        {(viewMode === 'split' || viewMode === 'editor') && (
          <div
            className={`${
              viewMode === 'split' ? 'lg:col-span-7' : 'lg:col-span-12'
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
