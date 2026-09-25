'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Shield,
  Sparkles,
  FileText,
  Scale,
  X,
  Activity,
  Settings2,
} from 'lucide-react';

type AiStatus = {
  groq?: { configured?: boolean; live?: boolean; model?: string; error?: string };
  tip?: string;
};

export default function Navbar() {
  const pathname = usePathname();
  const [showDev, setShowDev] = useState(false);
  const [aiStatus, setAiStatus] = useState<AiStatus | null>(null);

  useEffect(() => {
    fetch('/api/ai-status')
      .then((r) => r.json())
      .then((d) => setAiStatus(d))
      .catch(() => setAiStatus(null));
  }, []);

  const groqLive = aiStatus?.groq?.live;
  const groqConfigured = aiStatus?.groq?.configured;

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 p-0.5 shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-all duration-300">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Scale className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg tracking-tight text-white flex items-center gap-1.5">
                  LexMorph <span className="text-emerald-400">AI</span>
                </span>
                <span className="text-[10px] font-medium tracking-wide uppercase text-slate-400 -mt-1">
                  Defense Studio
                </span>
              </div>
            </Link>

            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Shield className="w-3 h-3" />
              Free demo · no signup
            </div>

            {aiStatus && (
              <div
                className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${
                  groqLive
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                    : groqConfigured
                      ? 'bg-amber-500/10 text-amber-300 border-amber-500/25'
                      : 'bg-slate-800/80 text-slate-400 border-slate-700'
                }`}
                title="AI runs on our server — you do not need an API key"
              >
                <Activity className="w-3 h-3" />
                {groqLive ? 'AI ready' : groqConfigured ? 'AI warming up' : 'Basic mode'}
              </div>
            )}
          </div>

          <nav className="flex items-center gap-1 sm:gap-2">
            {[
              { href: '/studio', label: 'Studio', Icon: FileText, color: 'text-emerald-400' },
              { href: '/simulator', label: 'Hearing', Icon: Scale, color: 'text-cyan-400' },
              { href: '/auditor', label: 'Auditor', Icon: Shield, color: 'text-violet-400' },
            ].map(({ href, label, Icon, color }) => {
              const active = pathname === href || pathname.startsWith(`${href}/`);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    active
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${color}`} />
                  <span className="hidden sm:inline">{label}</span>
                </Link>
              );
            })}

            <button
              onClick={() => setShowDev(true)}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800/40 transition-all"
              title="About AI (for developers)"
              aria-label="About AI"
            >
              <Settings2 className="w-4 h-4" />
            </button>

            <Link
              href="/studio"
              className="ml-1 px-4 py-1.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">Open Studio</span>
            </Link>
          </nav>
        </div>
      </header>

      {showDev && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-white">You do not need an API key</h3>
              <button onClick={() => setShowDev(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              LexMorph uses the project&apos;s server AI when it is turned on. Visitors can paste a notice,
              audit chatbot advice, and practice court without signing up or pasting keys.
            </p>
            <p className="text-xs text-slate-500 leading-relaxed">
              Practice examples always work. If the badge says &quot;Basic mode,&quot; we still run the built-in
              safety rules — just without live AI rewrite.
            </p>
            {aiStatus?.tip && (
              <p className="text-[11px] text-slate-400 p-3 rounded-xl bg-slate-950 border border-slate-800">
                {aiStatus.tip}
              </p>
            )}
            <button
              onClick={() => setShowDev(false)}
              className="w-full px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-bold"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
