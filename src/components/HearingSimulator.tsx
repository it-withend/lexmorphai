'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Scale,
  Send,
  Award,
  Sparkles,
  RefreshCw,
  User,
  Landmark,
  Gavel,
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
  const [overallScore, setOverallScore] = useState(70);
  const [aiEngine, setAiEngine] = useState<'unknown' | 'ai' | 'heuristic'>('unknown');
  const [aiModel, setAiModel] = useState<string>('');
  const [studioTitle, setStudioTitle] = useState<string | null>(null);

  useEffect(() => {
    const id = pickInitialScenarioId();
    setScenarioId(id);
    setStudioTitle(getStudioCaseTitle());
  }, []);

  useEffect(() => {
    startScenario(scenario);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenarioId]);

  const startScenario = (s: HearingScenario) => {
    setTurns([
      {
        id: 'turn-1',
        speaker: 'judge',
        text: s.judgeOpening,
      },
    ]);
    setOverallScore(70);
    setUserInput('');
    setStudioTitle(getStudioCaseTitle());
    // Do NOT overwrite studio-carried context — only refresh active merge
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

    const userTurnId = `turn-${Date.now()}`;
    const newTurn: Turn = { id: userTurnId, speaker: 'user', text };
    const updatedHistory = [...turns, newTurn];
    setTurns(updatedHistory);
    setUserInput('');
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history: updatedHistory.map((t) => ({ speaker: t.speaker, text: t.text })),
          userResponse: text,
          caseContext: getActiveCaseContext(scenario.caseContext),
          apiKey:
            (typeof window !== 'undefined' && localStorage.getItem('lexmorph_gemini_key')) ||
            undefined,
          groqApiKey:
            (typeof window !== 'undefined' && localStorage.getItem('lexmorph_groq_key')) ||
            undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
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

        if (data.score) {
          setOverallScore((prev) => Math.round((prev + data.score) / 2));
        }

        if (data.judgeReply) {
          setTimeout(() => {
            setTurns((prev) => [
              ...prev,
              { id: `judge-${Date.now()}`, speaker: 'judge', text: data.judgeReply },
            ]);
          }, 350);
        }
      }
    } catch (e) {
      console.error('Simulation turn error:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Scenario picker */}
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
                Carrying Studio case: <span className="font-semibold">{studioTitle}</span>
              </p>
            )}
            {aiEngine !== 'unknown' && (
              <p className="text-[11px] mt-1 flex items-center gap-1.5">
                {aiEngine === 'ai' ? (
                  <span className="text-emerald-400 font-semibold">
                    Live AI judge{aiModel ? ` · ${aiModel}` : ''}
                  </span>
                ) : (
                  <span className="text-amber-400 font-semibold">
                    Offline coach (heuristic) — check Groq key /api/ai-status
                  </span>
                )}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 bg-slate-950/80 px-4 py-2.5 rounded-2xl border border-slate-800 self-stretch md:self-auto justify-between">
          <div>
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">
              Courtroom readiness
            </span>
            <span className="text-xl font-mono font-extrabold text-white">
              {overallScore}
              <span className="text-cyan-400 text-sm">/100</span>
            </span>
          </div>
          <button
            onClick={() => startScenario(scenario)}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800"
            title="Restart hearing"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="min-h-[480px] max-h-[600px] overflow-y-auto p-4 sm:p-6 bg-slate-950/60 rounded-3xl border border-slate-800/80 space-y-6">
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
                    <span className="text-amber-300">Housing Court Judge</span>
                  </>
                ) : (
                  <>
                    <span className="text-emerald-400">You (pro se)</span>
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  </>
                )}
              </div>

              <div
                className={`max-w-2xl p-4 sm:p-5 rounded-2xl text-sm leading-relaxed ${
                  isJudge
                    ? 'bg-slate-900 border border-slate-800 text-slate-100'
                    : 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-100'
                }`}
              >
                {turn.text}
              </div>

              {!isJudge && turn.score != null && (
                <div className="w-full max-w-2xl p-3.5 rounded-xl bg-slate-900/90 border border-cyan-500/30 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-cyan-300 flex items-center gap-1">
                      <Award className="w-3.5 h-3.5" />
                      Delivery score: {turn.score}/100
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
          <div className="flex items-center gap-2 text-xs text-slate-400 pl-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            Judge is reviewing your argument…
          </div>
        )}
      </div>

      <div className="space-y-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          Recommended arguments for this scenario
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {scenario.quickAnswers.map((sampleText, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(sampleText)}
              disabled={isSubmitting}
              className="p-3 text-left rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 text-xs text-slate-300 leading-snug"
            >
              &quot;{sampleText.slice(0, 100)}…&quot;
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
