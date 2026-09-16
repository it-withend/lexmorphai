'use client';

import React, { useState } from 'react';
import { Scale, Send, Award, AlertCircle, Sparkles, RefreshCw, Volume2, User, Landmark } from 'lucide-react';

interface Turn {
  id: string;
  speaker: 'judge' | 'user';
  text: string;
  score?: number;
  praise?: string;
  criticism?: string;
  suggestedLegalRefinement?: string;
}

export default function HearingSimulator() {
  const [turns, setTurns] = useState<Turn[]>([
    {
      id: 'turn-1',
      speaker: 'judge',
      text: 'Good morning. This is Civil Court of the City of New York, Kings County, Housing Part. In the matter of Metropolitan Realty Holdings versus Reynolds, Index No. LT-304928-26. Are the parties present? Respondent-Tenant, please identify yourself and state whether you have an attorney.',
    },
  ]);

  const [userInput, setUserInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [overallScore, setOverallScore] = useState(88);

  const sampleQuickAnswers = [
    'Your Honor, my name is Marcus Reynolds. I appear pro se. I move to dismiss because the landlord only gave me 3 days notice instead of the mandatory 14 days under RPAPL § 711.',
    'Your Honor, I am Marcus Reynolds, pro se. Furthermore, our building has had no hot water for 45 days. I request an official HPD inspection and a rent abatement.',
    'Your Honor, the landlord is attempting to collect late charges and legal fees as rent, which is strictly illegal under NY Real Property Law § 238-a.',
  ];

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || userInput;
    if (!text.trim() || isSubmitting) return;

    const userTurnId = `turn-${Date.now()}`;
    const newTurn: Turn = {
      id: userTurnId,
      speaker: 'user',
      text,
    };

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
          caseContext:
            (typeof window !== 'undefined' && sessionStorage.getItem('lexmorph_case_context')) ||
            undefined,
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
        // Attach feedback to user's turn
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
          setOverallScore(Math.round((overallScore + data.score) / 2));
        }

        // Add judge response
        if (data.judgeReply) {
          setTimeout(() => {
            setTurns((prev) => [
              ...prev,
              {
                id: `judge-${Date.now()}`,
                speaker: 'judge',
                text: data.judgeReply,
              },
            ]);
          }, 400);
        }
      }
    } catch (e) {
      console.error('Simulation turn error:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setTurns([
      {
        id: 'turn-1',
        speaker: 'judge',
        text: 'Good morning. This is Civil Court of the City of New York, Kings County, Housing Part. In the matter of Metropolitan Realty Holdings versus Reynolds, Index No. LT-304928-26. Are the parties present? Respondent-Tenant, please identify yourself and state whether you have an attorney.',
      },
    ]);
    setOverallScore(88);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Simulation Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-slate-800 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-500/10">
            <Landmark className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>Housing Court Pro Se Hearing Simulator</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-semibold">
                AI JUDGE PREP ROOM
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Practice your verbal hearing testimony before Hon. Carolyn Walker-Diallo. Receive instant judicial scoring and statutory coaching.
            </p>
          </div>
        </div>

        {/* Readiness Score */}
        <div className="flex items-center gap-3 bg-slate-950/80 px-4 py-2.5 rounded-2xl border border-slate-800 self-stretch md:self-auto justify-between">
          <div>
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">
              Courtroom Readiness
            </span>
            <span className="text-xl font-mono font-extrabold text-white">
              {overallScore}<span className="text-cyan-400 text-sm">/100</span>
            </span>
          </div>
          <button
            onClick={handleReset}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            title="Restart Hearing"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Hearing Room Dialogue Stream */}
      <div className="min-h-[500px] max-h-[620px] overflow-y-auto p-4 sm:p-6 bg-slate-950/60 rounded-3xl border border-slate-800/80 space-y-6 shadow-inner">
        {turns.map((turn) => {
          const isJudge = turn.speaker === 'judge';

          return (
            <div
              key={turn.id}
              className={`flex flex-col ${isJudge ? 'items-start' : 'items-end'} space-y-2`}
            >
              {/* Speaker Tag */}
              <div className="flex items-center gap-2 text-xs font-semibold px-1">
                {isJudge ? (
                  <>
                    <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 text-[10px]">
                      ⚖️
                    </div>
                    <span className="text-amber-300 font-serif">Hon. Housing Court Judge</span>
                  </>
                ) : (
                  <>
                    <span className="text-emerald-400 font-sans">You (Tenant Pro Se)</span>
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-[10px]">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  </>
                )}
              </div>

              {/* Speech Bubble */}
              <div
                className={`max-w-2xl p-4 sm:p-5 rounded-2xl text-sm leading-relaxed ${
                  isJudge
                    ? 'bg-slate-900 border border-slate-800 text-slate-100 font-serif shadow-md'
                    : 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-100 shadow-md font-sans'
                }`}
              >
                {turn.text}
              </div>

              {/* Turn Legal Feedback (if present on user turn) */}
              {!isJudge && turn.score && (
                <div className="w-full max-w-2xl p-3.5 rounded-xl bg-slate-900/90 border border-cyan-500/30 text-xs space-y-2 font-sans shadow-lg animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-cyan-300 flex items-center gap-1">
                      <Award className="w-3.5 h-3.5" />
                      <span>Legal Delivery Score: {turn.score}/100</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">Judicial Analysis</span>
                  </div>

                  {turn.praise && (
                    <div className="text-slate-200">
                      <strong className="text-emerald-400">✓ Strong Argument:</strong> {turn.praise}
                    </div>
                  )}

                  {turn.suggestedLegalRefinement && (
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                      <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider block mb-0.5">
                        Suggested Legal Phrasing to Win the Judge:
                      </span>
                      <em className="text-cyan-200 font-serif">&quot;{turn.suggestedLegalRefinement}&quot;</em>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {isSubmitting && (
          <div className="flex items-center gap-2 text-xs text-slate-400 pl-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
            <span>Judge is reviewing statutory pleadings and preparing response...</span>
          </div>
        )}
      </div>

      {/* Suggested Quick Answer Pills */}
      <div className="space-y-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Recommended Defense Arguments (Click to Test):</span>
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {sampleQuickAnswers.map((sampleText, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(sampleText)}
              disabled={isSubmitting}
              className="p-3 text-left rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800/80 text-xs text-slate-300 transition-all leading-snug"
            >
              &quot;{sampleText.slice(0, 90)}...&quot;
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <div className="flex items-center gap-2 bg-slate-900 p-2 rounded-2xl border border-slate-800 shadow-xl">
        <input
          type="text"
          placeholder="Speak or type your answer to the judge (e.g. 'Your Honor, I move to dismiss because...')"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSend();
          }}
          disabled={isSubmitting}
          className="flex-1 px-4 py-2.5 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none font-sans"
        />

        <button
          onClick={() => handleSend()}
          disabled={isSubmitting || !userInput.trim()}
          className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-md shadow-cyan-500/20"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Answer Judge</span>
        </button>
      </div>
    </div>
  );
}
