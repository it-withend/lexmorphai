'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Scale,
  Send,
  Award,
  Sparkles,
  RefreshCw,
  User,
  Landmark,
  Gavel,
  AlertTriangle,
} from 'lucide-react';
import { HEARING_SCENARIOS, getScenario, HearingScenario } from '@/lib/hearing-scenarios';
import { getActiveCaseContext, getStudioCaseTitle } from '@/lib/case-context';

interface Turn {
  id: string;
  speaker: 'judge' | 'user';
  text: string;
  score?: number;
  praise?: string;
  criticism?: string;
  suggestedLegalRefinement?: string;
}

function pickInitialScenarioId(): string {
  if (typeof window === 'undefined') return 'nyc-notice';
  const ctx =
    sessionStorage.getItem('lexmorph_studio_case_context') ||
    sessionStorage.getItem('lexmorph_case_context') ||
    '';
  if (/california|1950\.5|deposit/i.test(ctx)) return 'ca-deposit';
  if (/habitability|heat|hot water|235-b/i.test(ctx) && !/3-day|711/i.test(ctx)) {
    return 'nyc-habitability';
  }
  return 'nyc-notice';
}

export default function HearingSimulator() {
  const [scenarioId, setScenarioId] = useState('nyc-notice');
  const scenario = useMemo(() => getScenario(scenarioId), [scenarioId]);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [overallScore, setOverallScore] = useState<number | null>(null);
  const [aiEngine, setAiEngine] = useState<'unknown' | 'ai' | 'heuristic'>('unknown');
  const [aiModel, setAiModel] = useState<string>('');
  const [studioTitle, setStudioTitle] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const requestGen = useRef(0);

  useEffect(() => {
    const id = pickInitialScenarioId();
    setScenarioId(id);
    setStudioTitle(getStudioCaseTitle());
  }, []);

  useEffect(() => {
    startScenario(scenario);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenarioId]);

  useEffect(() => {
    const el = transcriptRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [turns, isSubmitting]);

  const startScenario = (s: HearingScenario) => {
    requestGen.current += 1; // invalidate in-flight answers
    setTurns([
      {
        id: 'turn-1',
        speaker: 'judge',
        text: s.judgeOpening,
      },
    ]);
    setOverallScore(null);
    setUserInput('');
    setError(null);
    setAiEngine('unknown');
    setAiModel('');
    setIsSubmitting(false);
    setStudioTitle(getStudioCaseTitle());
    try {
      const merged = getActiveCaseContext(s.caseContext);
      sessionStorage.setItem('lexmorph_case_context', merged);
    } catch {
      /* ignore */
    }
  };

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || userInput;
    if (!text.trim() || isSubmitting) return;

    const gen = requestGen.current;
    const userTurnId = `turn-${Date.now()}`;
    const newTurn: Turn = { id: userTurnId, speaker: 'user', text };
    const updatedHistory = [...turns, newTurn];
    setTurns(updatedHistory);
    setUserInput('');
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history: updatedHistory.map((t) => ({ speaker: t.speaker, text: t.text })),
          userResponse: text,
          caseContext: getActiveCaseContext(scenario.caseContext),
          scenarioId,
        }),
      });

      const data = await res.json();
      if (gen !== requestGen.current) return; // scenario changed mid-flight

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Coach could not score that answer. Try again.');
      }

      setAiEngine(data.source === 'ai' ? 'ai' : 'heuristic');
      if (data.model) setAiModel(data.model);

      setTurns((prev) =>
        prev.map((t) =>
          t.id === userTurnId
            ? {
                ...t,
                score: data.score,
                praise: data.praise,
                criticism: data.criticism,
                suggestedLegalRefinement: data.suggestedLegalRefinement,
              }
            : t
        )
      );

      if (typeof data.score === 'number') {
        setOverallScore((prev) =>
          prev == null ? data.score : Math.round((prev + data.score) / 2)
        );
      }

      if (data.judgeReply) {
        setTimeout(() => {
          if (gen !== requestGen.current) return;
          setTurns((prev) => [
            ...prev,
            { id: `judge-${Date.now()}`, speaker: 'judge', text: data.judgeReply },
          ]);
        }, 350);
      }
    } catch (e) {
      if (gen !== requestGen.current) return;
      console.error('Simulation turn error:', e);
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.');
      // Keep the user's text visible; mark turn without score
    } finally {
      if (gen === requestGen.current) setIsSubmitting(false);
    }
  };

  const qualityLabel =
    overallScore == null
      ? 'Waiting for your first answer'
      : overallScore >= 85
        ? 'Strong rehearsal'
        : overallScore >= 70
          ? 'Solid practice'
          : overallScore >= 50
            ? 'Keep practicing'
            : 'Needs work';

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <div className="space-y-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Gavel className="w-3.5 h-3.5 text-cyan-400" />
          Choose hearing scenario
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {HEARING_SCENARIOS.map((s) => {
            const active = s.id === scenarioId;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setScenarioId(s.id)}
                className={`p-3 rounded-2xl border-2 text-left transition-all ${
                  active
                    ? 'bg-cyan-500/10 border-cyan-400/60 text-white'
                    : `bg-slate-900 border-slate-800 text-slate-300 ${s.accent}`
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <s.Icon className={`w-4 h-4 ${active ? 'text-cyan-300' : 'text-slate-400'}`} />
                  <span className="text-xs font-bold">{s.shortLabel}</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">{s.title}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-slate-800 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Landmark className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex flex-wrap items-center gap-2">
              Hearing Coach
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-semibold">
                {scenario.jurisdiction}
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">{scenario.title}</p>
            {studioTitle && (
              <p className="text-[11px] text-emerald-300/90 mt-1">
                Using your Studio case: <span className="font-semibold">{studioTitle}</span>
              </p>
            )}
            {aiEngine !== 'unknown' && (
              <p className="text-[11px] mt-1 flex items-center gap-1.5">
                {aiEngine === 'ai' ? (
                  <span className="text-emerald-400 font-semibold">
                    Coach feedback with AI{aiModel ? ` · ${aiModel}` : ''}
                  </span>
                ) : (
                  <span className="text-amber-400 font-semibold">
                    Built-in coaching tips (server AI offline)
                  </span>
                )}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 bg-slate-950/80 px-4 py-2.5 rounded-2xl border border-slate-800 self-stretch md:self-auto justify-between">
          <div>
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">
              Practice quality
            </span>
            <span className="text-sm font-bold text-white">{qualityLabel}</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              Coach feedback — not a win prediction
            </span>
          </div>
          <button
            type="button"
            onClick={() => startScenario(scenario)}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800"
            title="Restart hearing"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-200 text-sm">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="flex-1">{error}</div>
          <button type="button" className="text-xs underline" onClick={() => setError(null)}>
            Dismiss
          </button>
        </div>
      )}

      <div
        ref={transcriptRef}
        className="min-h-[480px] max-h-[600px] overflow-y-auto rounded-3xl border border-[#3d3226] bg-[#16110d] space-y-6"
      >
        <div className="sticky top-0 z-10 px-4 sm:px-6 py-3 bg-[#2a2118] border-b border-[#4a3c2c] flex items-center justify-between gap-3">
          <p className="font-docket text-[11px] uppercase tracking-[0.16em] text-[#e8d7b8]">
            {scenario.jurisdiction} · practice calendar
          </p>
          <p className="text-[10px] font-mono text-amber-200/80">Not a real courtroom</p>
        </div>
        <div className="px-4 sm:px-6 pb-6 space-y-6">
        {turns.map((turn) => {
          const isJudge = turn.speaker === 'judge';
          return (
            <div key={turn.id} className={`flex flex-col ${isJudge ? 'items-start' : 'items-end'} space-y-2`}>
              <div className="flex items-center gap-2 text-xs font-semibold px-1">
                {isJudge ? (
                  <>
                    <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                      <Scale className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-amber-200">Practice judge</span>
                  </>
                ) : (
                  <>
                    <span className="text-emerald-400">You (without a lawyer)</span>
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  </>
                )}
              </div>

              <div
                className={`max-w-2xl p-4 sm:p-5 rounded-2xl text-sm leading-relaxed ${
                  isJudge
                    ? 'bg-[#f3ead8] text-[#1c1610] border border-[#d9c9a8] font-docket'
                    : 'bg-emerald-950/70 border border-emerald-500/40 text-emerald-50'
                }`}
              >
                {turn.text}
              </div>

              {!isJudge && turn.score != null && (
                <div className="w-full max-w-2xl p-3.5 rounded-xl bg-slate-900/90 border border-cyan-500/30 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-cyan-300 flex items-center gap-1">
                      <Award className="w-3.5 h-3.5" />
                      Delivery feedback (practice score {turn.score}/100 — not a case outcome)
                    </span>
                  </div>
                  {turn.praise && (
                    <div className="text-slate-200">
                      <strong className="text-emerald-400">Strong:</strong> {turn.praise}
                    </div>
                  )}
                  {turn.criticism && (
                    <div className="text-slate-300">
                      <strong className="text-amber-400">Improve:</strong> {turn.criticism}
                    </div>
                  )}
                  {turn.suggestedLegalRefinement && (
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                      <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider block mb-0.5">
                        Better phrasing
                      </span>
                      <em className="text-cyan-200">&quot;{turn.suggestedLegalRefinement}&quot;</em>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {isSubmitting && (
          <div className="flex items-center gap-2 text-xs text-amber-200/80 pl-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            Coach is reviewing your argument…
          </div>
        )}
        </div>
      </div>

      <div className="space-y-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          Try a recommended line — then add your own
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {scenario.quickAnswers.map((sampleText, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(sampleText)}
                disabled={isSubmitting}
                title={sampleText}
                className="p-3 text-left rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 disabled:opacity-50"
              >
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300">
                  {scenario.quickLabels[idx] || `Argument ${idx + 1}`}
                </span>
                <p className="text-xs text-slate-300 leading-snug mt-1 line-clamp-3">{sampleText}</p>
              </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 bg-slate-900 p-2 rounded-2xl border border-slate-800">
        <input
          type="text"
          placeholder="Type your answer to the judge…"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSend();
          }}
          disabled={isSubmitting}
          className="flex-1 px-4 py-2.5 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
        />
        <button
          type="button"
          onClick={() => handleSend()}
          disabled={isSubmitting || !userInput.trim()}
          className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-teal-500 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5"
        >
          <Send className="w-3.5 h-3.5" />
          Answer Judge
        </button>
      </div>

      <div className="p-5 rounded-3xl bg-slate-900/50 border border-slate-800 text-xs space-y-3">
        <h4 className="text-sm font-bold text-white">Coaching tips · {scenario.shortLabel}</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-slate-400">
          {scenario.tips.map((tip) => (
            <div key={tip.title} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80">
              <strong className="text-white block mb-1">{tip.title}</strong>
              {tip.body}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
