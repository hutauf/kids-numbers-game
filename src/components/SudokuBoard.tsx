import React from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { BlockData, MetaGridData } from '../types/game';
import { Block } from './Block';
import { Language, translations } from '../utils/i18n';

interface SudokuBoardProps {
  blocks: BlockData[];
  meta: MetaGridData;
  isMetaStage: boolean;
  wrongCellByBlock: Record<number, number | null>;
  hintTargetByBlock: Record<number, boolean>;
  hintAddendByBlock: Record<number, number | null>;
  focusedBlockId: number | null;
  language: Language;
  onCellClick: (num: number, blockId: number) => void;
  onMetaBlockClick: (blockId: number) => void;
  onSetFocusedBlock: (blockId: number | null) => void;
}

export const SudokuBoard: React.FC<SudokuBoardProps> = ({
  blocks,
  meta,
  isMetaStage,
  wrongCellByBlock,
  hintTargetByBlock,
  hintAddendByBlock,
  focusedBlockId,
  language,
  onCellClick,
  onMetaBlockClick,
  onSetFocusedBlock,
}) => {
  const t = translations[language];

  // If a single block is focused (zoomed in)
  if (focusedBlockId !== null) {
    const focusedBlock = blocks.find((b) => b.id === focusedBlockId) || blocks[0];
    const prevBlockId = (focusedBlockId + 8) % 9;
    const nextBlockId = (focusedBlockId + 1) % 9;

    return (
      <div className="w-full max-w-md mx-auto flex flex-col items-center animate-fade-in">
        {/* Zoom navigation bar */}
        <div className="w-full flex items-center justify-between mb-3 px-1">
          <button
            onClick={() => onSetFocusedBlock(null)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> {t.actions.backToGrid}
          </button>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onSetFocusedBlock(prevBlockId)}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors"
              title={t.actions.prevBlock}
              aria-label={t.actions.prevBlock}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-num text-xs font-semibold text-slate-300 px-2">
              {t.board.focusHeader.replace('{current}', String(focusedBlockId + 1))}
            </span>
            <button
              onClick={() => onSetFocusedBlock(nextBlockId)}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors"
              title={t.actions.nextBlock}
              aria-label={t.actions.nextBlock}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Zoomed Block container */}
        <div className="w-full aspect-square max-w-[360px] p-4 bg-slate-900 border-2 border-amber-500/40 rounded-2xl shadow-2xl">
          <Block
            block={focusedBlock}
            wrongCell={wrongCellByBlock[focusedBlock.id] || null}
            hintTarget={hintTargetByBlock[focusedBlock.id] || false}
            hintAddend={hintAddendByBlock[focusedBlock.id] || null}
            isMetaStage={isMetaStage}
            isMetaHighlight={false}
            language={language}
            onCellClick={onCellClick}
            onMetaBlockClick={onMetaBlockClick}
            isZoomedView={true}
          />
        </div>
      </div>
    );
  }

  // Full 9x9 Sudoku Board view (3x3 grid of 3x3 blocks)
  return (
    <div className="w-full max-w-[620px] mx-auto flex flex-col items-center">
      {/* Meta Stage Banner */}
      {isMetaStage && (
        <div className="w-full mb-3 p-3 rounded-2xl bg-gradient-to-r from-indigo-950/80 via-purple-950/80 to-slate-900 border border-indigo-400/50 shadow-lg text-center animate-pulse">
          <div className="flex items-center justify-center gap-2 text-amber-300 font-bold text-sm">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{t.board.metaStageActive}</span>
          </div>
          <p className="text-xs text-indigo-200 mt-1">
            {t.board.metaStageDesc}
          </p>
        </div>
      )}

      {/* Main 9x9 Board with thick Sudoku border dividers */}
      <div className="relative w-full aspect-square max-w-[600px] p-2 sm:p-3 bg-slate-950/90 rounded-2xl border-4 border-slate-700/90 shadow-2xl">
        <div className="grid grid-cols-3 grid-rows-3 gap-2 sm:gap-2.5 w-full h-full">
          {blocks.map((block) => (
            <div key={block.id} className="w-full h-full">
              <Block
                block={block}
                wrongCell={wrongCellByBlock[block.id] || null}
                hintTarget={hintTargetByBlock[block.id] || false}
                hintAddend={hintAddendByBlock[block.id] || null}
                isMetaStage={isMetaStage}
                isMetaHighlight={false}
                language={language}
                onCellClick={onCellClick}
                onMetaBlockClick={onMetaBlockClick}
                onFocusBlock={onSetFocusedBlock}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
