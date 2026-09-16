'use client';

import React from 'react';
import { SAMPLE_CASES, SampleCase } from '@/lib/samples';
import { AlertCircle, FileText, CheckCircle2, ArrowRight, MapPin, Shield } from 'lucide-react';

interface SamplePickerProps {
  selectedSampleId: string;
  onSelectSample: (sample: SampleCase) => void;
}

export default function SamplePicker({ selectedSampleId, onSelectSample }: SamplePickerProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Real-World Test Fixtures
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
            1-Click Demo Mode
          </span>
        </div>
        <span className="text-xs text-slate-500">Select any sample to load live AST</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {SAMPLE_CASES.map((sample) => {
          const isSelected = sample.id === selectedSampleId;
          const defectCount = sample.ast.defects.length;
          const score = sample.ast.audit.defenseViabilityScore;

          return (
            <div
              key={sample.id}
              onClick={() => onSelectSample(sample)}
              className={`group relative p-4 rounded-2xl border transition-all duration-200 cursor-pointer text-left ${
                isSelected
                  ? 'bg-slate-900/90 border-emerald-500/60 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/30'
                  : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-900/50 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border w-fit ${sample.badgeColor}`}>
                      {sample.category}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {sample.jurisdiction}
                    </span>
                  </div>
                </div>

                {isSelected && (
                  <div className="flex items-center gap-1 text-emerald-400 text-xs font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Active</span>
                  </div>
                )}
              </div>

              <h4 className="text-sm font-semibold text-white group-hover:text-emerald-300 transition-colors line-clamp-1 mb-1">
                {sample.name}
              </h4>

              <p className="text-xs text-slate-400 line-clamp-2 mb-3 leading-relaxed">
                {sample.tagline}
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-red-400 font-medium text-[11px]">
                    <AlertCircle className="w-3 h-3" />
                    {defectCount} Statutory Defects
                  </span>
                  <span className="text-slate-500">•</span>
                  <span className="text-emerald-400 font-medium text-[11px] flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    {score}% Defense Viability
                  </span>
                </div>

                <div className="text-slate-400 group-hover:text-white transition-colors flex items-center gap-0.5 text-xs font-medium">
                  <span>Inspect</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
