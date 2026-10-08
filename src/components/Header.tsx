import React from 'react';
import { Volume2, VolumeX, HelpCircle, Lightbulb, RefreshCw, Pause, Play, Globe } from 'lucide-react';
import { Difficulty } from '../types/game';
import { Language, translations } from '../utils/i18n';

interface HeaderProps {
  language: Language;
  onSelectLanguage: (lang: Language) => void;
  difficulty: Difficulty;
  onSelectDifficulty: (d: Difficulty) => void;
  secondsElapsed: number;
  isPaused: boolean;
  onTogglePause: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenRules: () => void;
  onUseHint: () => void;
  onNewGame: () => void;
  collapsedCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  onSelectLanguage,
  difficulty,
  onSelectDifficulty,
  secondsElapsed,
  isPaused,
  onTogglePause,
  soundEnabled,
  onToggleSound,
  onOpenRules,
  onUseHint,
  onNewGame,
  collapsedCount,
}) => {
  const t = translations[language];

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <header className="w-full border-b border-slate-800 bg-slate-950/85 backdrop-blur sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Zone 1: Single text element wordmark with icon */}
        <div className="flex items-center gap-3">
          <a href="/" className="font-display font-extrabold text-xl sm:text-2xl tracking-tight text-white flex items-center gap-1.5 group">
            <span className="text-amber-400 group-hover:rotate-12 transition-transform">∑</span>
            <span>{t.appTitle}</span>
          </a>

          {/* Quick progress indicator */}
          <div className="hidden sm:flex items-center gap-1 text-xs font-num text-slate-400 pl-2 border-l border-slate-800">
            <span>{t.blocksCount}</span>
            <span className="font-bold text-amber-300">{collapsedCount}/9</span>
          </div>
        </div>

        {/* Zone 2: Navigation controls (Language, Difficulty, Timer, Hint, Rules) */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
          {/* Language Switcher (DE default / EN) */}
          <div className="flex items-center p-0.5 bg-slate-900 rounded-lg border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => onSelectLanguage('de')}
              className={`px-2 py-0.5 rounded font-semibold transition-all ${
                language === 'de'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Deutsch"
            >
              DE
            </button>
            <button
              type="button"
              onClick={() => onSelectLanguage('en')}
              className={`px-2 py-0.5 rounded font-semibold transition-all ${
                language === 'en'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="English"
            >
              EN
            </button>
          </div>

          {/* Difficulty Segmented Control */}
          <div className="flex items-center p-0.5 bg-slate-900 rounded-lg border border-slate-800 text-xs">
            {(['gentle', 'standard', 'expert'] as Difficulty[]).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => onSelectDifficulty(d)}
                className={`px-2.5 py-1 rounded-md font-medium transition-all whitespace-nowrap ${
                  difficulty === d
                    ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t.difficulty[d]}
              </button>
            ))}
          </div>

          {/* Timer Display */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900/90 rounded-lg border border-slate-800 text-xs font-num text-slate-200">
            <button
              onClick={onTogglePause}
              className="text-slate-400 hover:text-amber-300 transition-colors"
              title={isPaused ? t.actions.resume : t.actions.pause}
              aria-label={isPaused ? t.actions.resume : t.actions.pause}
            >
              {isPaused ? <Play className="w-3.5 h-3.5 text-amber-400" /> : <Pause className="w-3.5 h-3.5" />}
            </button>
            <span>{formatTime(secondsElapsed)}</span>
          </div>

          {/* Hint Button */}
          <button
            type="button"
            onClick={onUseHint}
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-300 rounded-lg border border-slate-800 text-xs font-medium transition-colors"
            title={t.actions.hint}
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">{t.actions.hint}</span>
          </button>

          {/* How to Play Rules */}
          <button
            type="button"
            onClick={onOpenRules}
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-300 rounded-lg border border-slate-800 text-xs font-medium transition-colors"
            title={t.actions.rules}
          >
            <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden md:inline">{t.actions.rules}</span>
          </button>
        </div>

        {/* Zone 3: Primary Actions (Sound Mute + New Game) */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleSound}
            className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-lg border border-slate-800 transition-colors"
            title={soundEnabled ? t.actions.mute : t.actions.unmute}
            aria-label={soundEnabled ? t.actions.mute : t.actions.unmute}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          <button
            type="button"
            onClick={onNewGame}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-lg transition-all shadow-md active:scale-95 whitespace-nowrap"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{t.actions.newGame}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
