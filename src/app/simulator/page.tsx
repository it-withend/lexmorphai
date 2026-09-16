'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import HearingSimulator from '@/components/HearingSimulator';
import Link from 'next/link';
import { ArrowLeft, Landmark } from 'lucide-react';

export default function SimulatorPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-cyan-500/20 selection:text-cyan-300">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <Link
            href="/studio"
            className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Defense Studio
          </Link>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Landmark className="w-3.5 h-3.5 text-cyan-400" />
            Pick a scenario · rehearse · get scored coaching
          </div>
        </div>

        <HearingSimulator />
      </main>
    </div>
  );
}
