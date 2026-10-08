import React, { useEffect, useRef } from 'react';
import { Trophy, Clock, Lightbulb, RefreshCw, Sparkles, Check } from 'lucide-react';
import { Difficulty, EquationHistoryItem, GameStats } from '../types/game';
import { launchConfetti } from '../utils/confetti';
import { Language, translations } from '../utils/i18n';

interface VictoryModalProps {
  isOpen: boolean;
  stats: GameStats;
  equations: EquationHistoryItem[];
  metaEquation: { a: number; b: number; sum: number };
  difficulty: Difficulty;
  language: Language;
  onPlayAgain: (newDifficulty?: Difficulty) => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  isOpen,
  stats,
  equations,
  metaEquation,
  difficulty,
  language,
  onPlayAgain,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const t = translations[language];

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      launchConfetti(canvasRef.current, 4000);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-50 w-full h-full"
      />

      <div
        className="relative z-10 bg-slate-900 border border-amber-500/30 rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="victory-title"
      >
        {/* Glow backdrop */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 mb-3 animate-bounce">
            <Trophy className="w-8 h-8" />
          </div>
          <h2 id="victory-title" className="text-2xl md:text-3xl font-extrabold font-display text-white">
            {t.victory.title}
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            {t.victory.desc}
          </p>
        </div>

        {/* Stats card */}
        <div className="grid grid-cols-3 gap-3 mb-6 font-num">
          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50 text-center">
            <div className="flex items-center justify-center gap-1 text-xs text-slate-400 mb-1">
              <Clock className="w-3.5 h-3.5 text-blue-400" /> {t.victory.time}
            </div>
            <div className="text-lg font-bold text-white">{formatTime(stats.secondsElapsed)}</div>
          </div>
          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50 text-center">
            <div className="flex items-center justify-center gap-1 text-xs text-slate-400 mb-1">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" /> {t.victory.hints}
            </div>
            <div className="text-lg font-bold text-white">{stats.hintsUsed}</div>
          </div>
          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50 text-center">
            <div className="flex items-center justify-center gap-1 text-xs text-slate-400 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> {t.victory.diff}
            </div>
            <div className="text-xs font-semibold uppercase tracking-wider text-emerald-300 mt-1">
              {t.difficulty[difficulty]}
            </div>
          </div>
        </div>

        {/* Meta equation showcase */}
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-teal-950/60 border border-emerald-500/30">
          <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> {t.victory.metaEquation}
          </div>
          <div className="text-xl md:text-2xl font-bold font-num text-white flex items-center justify-center gap-2 py-1">
            <span>{metaEquation.a}</span>
            <span className="text-emerald-400">+</span>
            <span>{metaEquation.b}</span>
            <span className="text-emerald-400">=</span>
            <span className="text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-lg border border-amber-500/40">
              {metaEquation.sum}
            </span>
          </div>
        </div>

        {/* Equation list review */}
        <div className="mb-6">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            {t.victory.allEquations}
          </div>
          <div className="max-h-36 overflow-y-auto pr-1 space-y-1.5 custom-scrollbar font-num text-xs">
            {equations.map((eq, i) => (
              <div
                key={i}
                className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-800/40 border border-slate-700/30 text-slate-300"
              >
                <span className="text-slate-500">
                  {typeof eq.blockId === 'number' ? `Block #${eq.blockId + 1}` : 'Meta'}
                </span>
                <span className="font-medium text-slate-200">
                  {eq.a} + {eq.b} = <strong className="text-amber-400">{eq.sum}</strong>
                </span>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              </div>
            ))}
          </div>
        </div>

        {/* Action button */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <button
            onClick={() => onPlayAgain(difficulty)}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95"
          >
            <RefreshCw className="w-4 h-4" /> {t.actions.playAgain}
          </button>
        </div>
      </div>
    </div>
  );
};
