import React from 'react';
import { Check, ZoomIn } from 'lucide-react';
import { BlockData } from '../types/game';
import { Cell } from './Cell';
import { Language, translations } from '../utils/i18n';

interface BlockProps {
  block: BlockData;
  wrongCell: number | null;
  hintAddend: number | null;
  hintTarget: boolean;
  isMetaStage: boolean;
  isMetaHighlight: boolean;
  language: Language;
  onCellClick: (num: number, blockId: number) => void;
  onMetaBlockClick?: (blockId: number) => void;
  onFocusBlock?: (blockId: number) => void;
  isZoomedView?: boolean;
}

export const Block: React.FC<BlockProps> = ({
  block,
  wrongCell,
  hintAddend,
  hintTarget,
  isMetaStage,
  isMetaHighlight,
  language,
  onCellClick,
  onMetaBlockClick,
  onFocusBlock,
  isZoomedView = false,
}) => {
  const t = translations[language];

  // If collapsed, display the large unified block
  if (block.isCollapsed) {
    let metaClasses = 'bg-gradient-to-br from-slate-900 to-slate-800 text-slate-100 border-slate-700/80';

    if (isMetaHighlight) {
      metaClasses = 'bg-gradient-to-br from-emerald-900/90 to-teal-800/90 text-emerald-200 border-emerald-400 font-extrabold shadow-[0_0_20px_rgba(16,185,129,0.5)] ring-2 ring-emerald-400';
    } else if (isMetaStage) {
      metaClasses = 'bg-gradient-to-br from-indigo-950/70 via-slate-900 to-slate-900 text-slate-100 border-indigo-500/40 hover:border-indigo-400 hover:scale-[1.02] cursor-pointer shadow-md';
    }

    return (
      <div
        onClick={() => {
          if (isMetaStage && onMetaBlockClick) {
            onMetaBlockClick(block.id);
          }
        }}
        className={`
          relative w-full h-full min-h-[110px] sm:min-h-[140px] md:min-h-[160px]
          flex flex-col items-center justify-center
          rounded-xl border-2 transition-all duration-300
          overflow-hidden select-none group
          ${metaClasses}
        `}
      >
        {/* Subtle background glow */}
        <div className="absolute inset-0 bg-radial-gradient from-white/5 to-transparent pointer-events-none" />

        {/* Checkmark badge */}
        <div className="absolute top-2 right-2 text-emerald-400/80 group-hover:text-emerald-400 transition-colors">
          <Check className="w-4 h-4" />
        </div>

        {/* Block ID index */}
        <div className="absolute top-2 left-2 text-[10px] font-num text-slate-500 font-medium">
          #{block.id + 1}
        </div>

        {/* Giant Number */}
        <span className="font-num font-extrabold text-3xl sm:text-4xl md:text-5xl text-amber-300 drop-shadow-md tracking-tight">
          {block.sumTarget}
        </span>

        {/* Discovered formula label */}
        <span className="text-[11px] sm:text-xs font-num font-medium text-slate-400 mt-1 px-2 py-0.5 rounded bg-slate-950/50 border border-slate-800">
          {block.addendA} + {block.addendB} = {block.sumTarget}
        </span>

        {isMetaStage && (
          <span className="absolute bottom-1.5 text-[10px] text-indigo-300 font-medium opacity-80">
            {t.board.tapToSolveMeta}
          </span>
        )}
      </div>
    );
  }

  // Not collapsed: 3x3 interactive grid
  return (
    <div className="relative w-full h-full p-1.5 sm:p-2 bg-slate-900/90 rounded-xl border-2 border-slate-700/80 shadow-md flex flex-col justify-between">
      {/* Top micro-bar: block index and zoom button */}
      <div className="flex items-center justify-between pb-1 px-0.5 text-[10px] text-slate-400">
        <span className="font-num font-semibold text-slate-400">
          {t.board.blockTitle} #{block.id + 1}
        </span>
        {onFocusBlock && !isZoomedView && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onFocusBlock(block.id);
            }}
            className="p-0.5 text-slate-400 hover:text-amber-300 rounded transition-colors"
            title={t.actions.focusBlock}
            aria-label={`${t.actions.focusBlock} ${block.id + 1}`}
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* 3x3 Cell Grid */}
      <div className="grid grid-cols-3 gap-1 sm:gap-1.5 place-items-center">
        {block.numbers.map((num, idx) => {
          const isWrong = wrongCell === num;
          const isAddend = hintAddend === num;
          const isTarget = hintTarget && num === block.sumTarget;

          return (
            <Cell
              key={`${block.id}-${idx}-${num}`}
              value={num}
              isTargetHint={isTarget}
              isAddendHint={isAddend}
              isWrongShake={isWrong}
              size={isZoomedView ? 'lg' : 'md'}
              onClick={() => onCellClick(num, block.id)}
            />
          );
        })}
      </div>

      {/* Bottom spacer for balance */}
      <div className="h-1" />
    </div>
  );
};
