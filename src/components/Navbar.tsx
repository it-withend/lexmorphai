'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Shield, Sparkles, Key, FileText, Scale, ExternalLink, CheckCircle, X } from 'lucide-react';

export default function Navbar() {
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [geminiKey, setGeminiKey] = useState('');
  const [groqKey, setGroqKey] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setGeminiKey(localStorage.getItem('lexmorph_gemini_key') || '');
    setGroqKey(localStorage.getItem('lexmorph_groq_key') || '');
  }, [showKeyModal]);

  const handleSaveKey = () => {
    if (geminiKey.trim()) localStorage.setItem('lexmorph_gemini_key', geminiKey.trim());
    else localStorage.removeItem('lexmorph_gemini_key');

    if (groqKey.trim()) localStorage.setItem('lexmorph_groq_key', groqKey.trim());
    else localStorage.removeItem('lexmorph_groq_key');

    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      setShowKeyModal(false);
    }, 1000);
  };

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

            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Shield className="w-3 h-3" />
              LexHack 2026 · Access to Justice
            </div>
          </div>

          <nav className="flex items-center gap-1 sm:gap-2">
            <Link
              href="/studio"
              className="px-3.5 py-1.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors flex items-center gap-1.5"
            >
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>Studio</span>
            </Link>

            <Link
              href="/simulator"
              className="px-3.5 py-1.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors flex items-center gap-1.5"
            >
              <Scale className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline">Hearing</span>
            </Link>

            <Link
              href="/auditor"
              className="px-3.5 py-1.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors flex items-center gap-1.5"
            >
              <Shield className="w-4 h-4 text-violet-400" />
              <span className="hidden sm:inline">Auditor</span>
            </Link>

            <button
              id="open-api-keys"
              onClick={() => setShowKeyModal(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-slate-800 transition-all flex items-center gap-1.5"
              title="Configure free AI keys"
            >
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">API Keys</span>
            </button>

            <Link
              href="/studio"
              className="ml-2 px-4 py-1.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>Open Studio</span>
            </Link>
          </nav>
        </div>
      </header>

      {showKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <Key className="w-4 h-4" />
                </div>
                <h3 className="text-base font-semibold text-white">AI Keys (optional)</h3>
              </div>
              <button onClick={() => setShowKeyModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-5 leading-relaxed">
              Photo analysis works offline with on-device OCR + statutory rules. A free{' '}
              <strong className="text-emerald-400">Groq</strong> key unlocks stronger AI reconstruction without
              Google billing. Gemini is optional if your Google key already has quota.
            </p>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300">Groq API key (recommended, free)</label>
                  <a
                    href="https://console.groq.com/keys"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                  >
                    Get free key <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <input
                  type="password"
                  placeholder="gsk_..."
                  value={groqKey}
                  onChange={(e) => setGroqKey(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors font-mono"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300">Gemini API key (optional)</label>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-slate-400 hover:text-emerald-400 flex items-center gap-1"
                  >
                    Google AI Studio <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <input
                  type="password"
                  placeholder="AIzaSy..."
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors font-mono"
                />
              </div>

              <div className="flex items-center justify-end pt-1">
                <button
                  onClick={handleSaveKey}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-xl text-xs transition-all flex items-center gap-1.5"
                >
                  {isSaved ? (
                    <>
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Saved</span>
                    </>
                  ) : (
                    <span>Save keys</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
