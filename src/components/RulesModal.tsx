import React from 'react';
import { X, ArrowRight, Sparkles } from 'lucide-react';
import { Language, translations } from '../utils/i18n';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose, language }) => {
  if (!isOpen) return null;
  const t = translations[language];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="rules-title"
      >
        {/* Subtle accent glow */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-emerald-500 to-indigo-500" />
        
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h2 id="rules-title" className="text-xl font-bold font-display text-white">
              {t.rules.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Close rules"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-4 text-sm text-slate-300">
          {/* Step 1 */}
          <div className="flex gap-3 items-start p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold flex items-center justify-center border border-amber-500/30">
              1
            </span>
            <div>
              <p className="font-semibold text-white">{t.rules.step1Title}</p>
              <p className="text-slate-400 mt-1">
                {t.rules.step1Desc}
              </p>
            </div>
          </div>

          {/* Interactive visual example */}
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center justify-center gap-4 text-xs font-num">
            <div className="grid grid-cols-3 gap-1 p-1.5 bg-slate-800/80 rounded-lg">
              <span className="w-7 h-7 flex items-center justify-center rounded bg-slate-700 text-slate-400">7</span>
              <span className="w-7 h-7 flex items-center justify-center rounded bg-amber-500/20 text-amber-300 border border-amber-500/50 font-bold">5</span>
              <span className="w-7 h-7 flex items-center justify-center rounded bg-slate-700 text-slate-400">19</span>
              <span className="w-7 h-7 flex items-center justify-center rounded bg-amber-500/20 text-amber-300 border border-amber-500/50 font-bold">10</span>
              <span className="w-7 h-7 flex items-center justify-center rounded bg-emerald-500/30 text-emerald-300 border border-emerald-500/60 font-extrabold animate-pulse">15</span>
              <span className="w-7 h-7 flex items-center justify-center rounded bg-slate-700 text-slate-400">22</span>
              <span className="w-7 h-7 flex items-center justify-center rounded bg-slate-700 text-slate-400">31</span>
              <span className="w-7 h-7 flex items-center justify-center rounded bg-slate-700 text-slate-400">14</span>
              <span className="w-7 h-7 flex items-center justify-center rounded bg-slate-700 text-slate-400">28</span>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-500 flex-shrink-0" />
            <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 flex flex-col items-center justify-center shadow-lg border border-emerald-400/40">
              <span className="text-2xl font-bold font-num text-white">15</span>
              <span className="text-[10px] text-emerald-200 mt-1">5 + 10 = 15</span>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex gap-3 items-start p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold flex items-center justify-center border border-emerald-500/30">
              2
            </span>
            <div>
              <p className="font-semibold text-white">{t.rules.step2Title}</p>
              <p className="text-slate-400 mt-1">
                {t.rules.step2Desc}
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex gap-3 items-start p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold flex items-center justify-center border border-indigo-500/30">
              3
            </span>
            <div>
              <p className="font-semibold text-white">{t.rules.step3Title}</p>
              <p className="text-slate-400 mt-1">
                {t.rules.step3Desc}
              </p>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-semibold text-sm rounded-xl transition-all shadow-md active:scale-95"
          >
            {t.actions.gotIt}
          </button>
        </div>
      </div>
    </div>
  );
};
