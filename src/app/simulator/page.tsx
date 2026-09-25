'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import SiteFooter from '@/components/SiteFooter';
import TrustStrip from '@/components/TrustStrip';
import HearingSimulator from '@/components/HearingSimulator';
import Link from 'next/link';
import { ArrowLeft, Landmark } from 'lucide-react';

export default function SimulatorPage() {
  return (
    <div className="min-h-screen flex flex-col bg-ink text-cream">
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
            <Landmark className="w-3.5 h-3.5 text-brass" />
            Practice scenarios · coach feedback (not a real judge)
          </div>
        </div>

        <TrustStrip compact />
        <HearingSimulator />
      </main>
      <SiteFooter />
    </div>
  );
}
