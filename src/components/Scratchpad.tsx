import React from 'react';
import { CheckCircle2, Sparkles, Lightbulb } from 'lucide-react';
import { EquationHistoryItem } from '../types/game';
import { Language, translations } from '../utils/i18n';

interface ScratchpadProps {
  isMetaStage: boolean;
  equations: EquationHistoryItem[];
  language: Language;
}

export const Scratchpad: React.FC<ScratchpadProps> = ({
  isMetaStage,
  equations,
  language,
}) => {
  const t = translations[language];

  return (
    <div className="w-full max-w-[600px] mx-auto mt-4 p-3.5 bg-slate-900/80 border border-slate-800 rounded-2xl shadow-md">
      {/* Primary gameplay prompt */}
      <div className="flex items-center gap-2 text-xs font-num min-h-[22px]">
        {isMetaStage ? (
          <div className="flex items-center gap-2 text-indigo-300">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="font-medium">{t.board.metaPrompt}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-slate-300">
            <Lightbulb className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{t.board.tapSumPrompt}</span>
          </div>
        )}
      </div>

      {/* Discovered equations badges */}
      {equations.length > 0 && (
        <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto text-[11px] font-num text-slate-400 custom-scrollbar">
          <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider shrink-0">
            {t.board.solvedList}
          </span>
          {equations.map((eq, i) => (
            <span
              key={i}
              className="shrink-0 px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/60 flex items-center gap-1"
            >
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>
                {eq.a} + {eq.b} = <strong className="text-amber-300">{eq.sum}</strong>
              </span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
