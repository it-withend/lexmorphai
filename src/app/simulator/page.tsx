'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import HearingSimulator from '@/components/HearingSimulator';
import Link from 'next/link';
import { ArrowLeft, Scale, Shield, Users, Landmark } from 'lucide-react';

export default function SimulatorPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-cyan-500/20 selection:text-cyan-300">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Back Link */}
        <div className="flex items-center justify-between">
          <Link
            href="/studio"
            className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Document Studio</span>
          </Link>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Landmark className="w-3.5 h-3.5 text-cyan-400" />
            <span>New York City Housing Court Part • Hon. Carolyn Walker-Diallo</span>
          </div>
        </div>

        {/* Simulator Component */}
        <HearingSimulator />

        {/* Pro Se Defense Tips Callout */}
        <div className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800 text-xs space-y-3">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Key Rules for Appearing Pro Se in Housing Court</span>
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-slate-400 leading-relaxed">
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80">
              <strong className="text-white block mb-1">1. Raise Jurisdictional Defects Early</strong>
              If the landlord failed to provide a valid 14-day statutory demand under RPAPL § 711, raise it immediately upon appearing. This can dismiss the petition before reaching the merits.
            </div>
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80">
              <strong className="text-white block mb-1">2. Request Court-Ordered Inspections</strong>
              If your apartment has heat outages, leaks, or pests, ask the judge for an official HPD inspection. An inspector report is independent judicial evidence for a rent abatement.
            </div>
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80">
              <strong className="text-white block mb-1">3. Deny Non-Rent Surcharges</strong>
              Under NY RPL § 238-a, landlords cannot sue for late charges or attorney fees in a residential non-payment proceeding. Always object to late fees billed as &quot;added rent&quot;.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
