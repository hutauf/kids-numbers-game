import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BlockData, Difficulty, EquationHistoryItem, Puzzle } from './types/game';
import { generatePuzzle } from './utils/puzzleGenerator';
import { sound } from './utils/audio';
import { Language, translations } from './utils/i18n';
import { Header } from './components/Header';
import { SudokuBoard } from './components/SudokuBoard';
import { Scratchpad } from './components/Scratchpad';
import { RulesModal } from './components/RulesModal';
import { VictoryModal } from './components/VictoryModal';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export default function App() {
  // Default language is German as requested, with settings toggle to English
  const [language, setLanguage] = useState<Language>('de');
  const t = translations[language];

  const [difficulty, setDifficulty] = useState<Difficulty>('standard');
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Wrong cell shake tracker
  const [wrongCellByBlock, setWrongCellByBlock] = useState<Record<number, number | null>>({});

  // Progressive hints
  const [hintTargetByBlock, setHintTargetByBlock] = useState<Record<number, boolean>>({});
  const [hintAddendByBlock, setHintAddendByBlock] = useState<Record<number, number | null>>({});

  // Focus / zoom into single block mode
  const [focusedBlockId, setFocusedBlockId] = useState<number | null>(null);

  // Gameplay progress
  const [equations, setEquations] = useState<EquationHistoryItem[]>([]);
  const [hintsCount, setHintsCount] = useState(0);
  const [mistakesCount, setMistakesCount] = useState(0);

  // Notification toast message
  const [bannerMessage, setBannerMessage] = useState<{
    text: string;
    type: 'info' | 'success' | 'error';
  } | null>(null);

  // Modals & settings
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isVictoryOpen, setIsVictoryOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Timer
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const bannerTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showBanner = useCallback((text: string, type: 'info' | 'success' | 'error' = 'info', duration = 3000) => {
    if (bannerTimeoutRef.current) {
      clearTimeout(bannerTimeoutRef.current);
    }
    setBannerMessage({ text, type });
    bannerTimeoutRef.current = setTimeout(() => {
      setBannerMessage(null);
    }, duration);
  }, []);

  // Initialize or start new game
  const startNewGame = useCallback((diff: Difficulty = difficulty) => {
    setIsInitializing(true);
    setBannerMessage(null);
    setWrongCellByBlock({});
    setHintTargetByBlock({});
    setHintAddendByBlock({});
    setFocusedBlockId(null);
    setEquations([]);
    setHintsCount(0);
    setMistakesCount(0);
    setSecondsElapsed(0);
    setIsPaused(false);
    setIsVictoryOpen(false);

    try {
      const newPuzzle = generatePuzzle(diff);
      setPuzzle(newPuzzle);
      setDifficulty(diff);
      const currT = translations[language];
      showBanner(
        currT.feedback.newPuzzleLoaded.replace('{diff}', currT.difficulty[diff]),
        'info',
        3500
      );
    } catch (e) {
      console.error(e);
      showBanner(language === 'de' ? 'Fehler beim Laden. Neuer Versuch...' : 'Error loading puzzle. Retrying...', 'error');
    } finally {
      setIsInitializing(false);
    }
  }, [difficulty, language, showBanner]);

  useEffect(() => {
    startNewGame('standard');
  }, []);

  // Timer tick
  useEffect(() => {
    if (isPaused || isVictoryOpen || isInitializing || !puzzle) return;
    const interval = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isPaused, isVictoryOpen, isInitializing, puzzle]);

  // Audio toggle
  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sound.setEnabled(next);
  };

  // Check if all 9 blocks are collapsed (trigger Meta Stage)
  const isMetaStage = puzzle ? puzzle.blocks.every((b) => b.isCollapsed) && !puzzle.meta.isSolved : false;
  const collapsedCount = puzzle ? puzzle.blocks.filter((b) => b.isCollapsed).length : 0;

  // Handle cell click within an uncollapsed block (Tap Sum to Collapse Mode)
  const handleCellClick = (num: number, blockId: number) => {
    if (!puzzle || isPaused || isVictoryOpen) return;
    const block = puzzle.blocks.find((b) => b.id === blockId);
    if (!block || block.isCollapsed) return;

    sound.playTap();

    // Check if clicked number is the target sum!
    if (num === block.sumTarget) {
      collapseBlock(block, num);
      return;
    }

    // Otherwise it's an incorrect number: shake and notify
    sound.playMistake();
    setMistakesCount((m) => m + 1);
    setWrongCellByBlock((prev) => ({ ...prev, [blockId]: num }));
    setTimeout(() => {
      setWrongCellByBlock((prev) => ({ ...prev, [blockId]: null }));
    }, 500);

    showBanner(
      t.feedback.wrongSum
        .replace('{num}', String(num))
        .replace('{id}', String(blockId + 1)),
      'error',
      2500
    );
  };

  // Collapse a block upon finding its target sum
  const collapseBlock = (block: BlockData, targetSum: number) => {
    if (!puzzle) return;

    sound.playCollapse();

    // Mark block collapsed
    const nextBlocks = puzzle.blocks.map((b) =>
      b.id === block.id ? { ...b, isCollapsed: true, collapsedAt: Date.now() } : b
    );

    const newHistoryItem: EquationHistoryItem = {
      blockId: block.id,
      a: block.addendA,
      b: block.addendB,
      sum: targetSum,
      timestamp: Date.now(),
    };

    setEquations((prev) => [...prev, newHistoryItem]);

    // Clear hints for this block
    setHintTargetByBlock((prev) => ({ ...prev, [block.id]: false }));
    setHintAddendByBlock((prev) => ({ ...prev, [block.id]: null }));

    // Check if all 9 blocks are now collapsed
    const allCollapsed = nextBlocks.every((b) => b.isCollapsed);
    if (allCollapsed) {
      setPuzzle({ ...puzzle, blocks: nextBlocks });
      setFocusedBlockId(null); // Return to 9x9 overview for meta stage
      sound.playMetaUnlocked();
      showBanner(t.feedback.allCollapsedNotice, 'success', 5000);
      return;
    }

    setPuzzle({ ...puzzle, blocks: nextBlocks });
    showBanner(
      t.feedback.blockCollapsed
        .replace('{id}', String(block.id + 1))
        .replace('{a}', String(block.addendA))
        .replace('{b}', String(block.addendB))
        .replace('{sum}', String(targetSum)),
      'success',
      2500
    );

    // Auto-jump to the next to-do block if in zoom / focus mode!
    if (focusedBlockId !== null) {
      // Find the next uncollapsed block in circular order
      let nextTodoId: number | null = null;
      for (let step = 1; step < 9; step++) {
        const candidateId = (block.id + step) % 9;
        if (!nextBlocks[candidateId].isCollapsed) {
          nextTodoId = candidateId;
          break;
        }
      }

      if (nextTodoId !== null) {
        // Smooth brief delay so user perceives the block collapse
        setTimeout(() => {
          setFocusedBlockId(nextTodoId);
        }, 450);
      } else {
        setFocusedBlockId(null);
      }
    }
  };

  // Handle clicking a collapsed block during the Meta Grid Stage
  const handleMetaBlockClick = (blockId: number) => {
    if (!puzzle || !isMetaStage || isVictoryOpen) return;

    const block = puzzle.blocks.find((b) => b.id === blockId);
    if (!block) return;

    sound.playTap();
    const val = block.sumTarget;
    const meta = puzzle.meta;

    // Tapping the meta sum directly solves the entire puzzle!
    if (val === meta.metaSumTarget) {
      solveMetaGrid(meta.metaSumTarget);
      return;
    }

    // If incorrect: shake and notify
    sound.playMistake();
    setMistakesCount((m) => m + 1);
    showBanner(
      t.feedback.wrongMetaSum.replace('{num}', String(val)),
      'error',
      3000
    );
  };

  // Solve the Meta Grid & trigger victory
  const solveMetaGrid = (targetSum: number) => {
    if (!puzzle) return;

    sound.playVictory();

    const nextMeta = { ...puzzle.meta, isSolved: true };
    setPuzzle({ ...puzzle, meta: nextMeta });

    const metaHistoryItem: EquationHistoryItem = {
      blockId: 'meta',
      a: puzzle.meta.metaAddendA,
      b: puzzle.meta.metaAddendB,
      sum: targetSum,
      timestamp: Date.now(),
    };

    setEquations((prev) => [...prev, metaHistoryItem]);
    setIsVictoryOpen(true);
  };

  // Hint button handler (3-tier progressive hint)
  const handleUseHint = () => {
    if (!puzzle || isVictoryOpen) return;
    setHintsCount((h) => h + 1);

    // If in Meta Stage:
    if (isMetaStage) {
      const meta = puzzle.meta;
      const target = meta.metaSumTarget;
      const isEven = target % 2 === 0;
      showBanner(
        t.hints.metaHint
          .replace('{evenOdd}', isEven ? t.hints.even : t.hints.odd)
          .replace('{a}', String(meta.metaAddendA)),
        'info',
        5000
      );
      return;
    }

    // Find the first uncollapsed block
    const uncollapsed = puzzle.blocks.filter((b) => !b.isCollapsed);
    if (uncollapsed.length === 0) return;

    // Pick focused block or first uncollapsed block
    const targetBlock = (focusedBlockId !== null && !puzzle.blocks[focusedBlockId].isCollapsed)
      ? puzzle.blocks[focusedBlockId]
      : uncollapsed[0];

    const currentHintTarget = hintTargetByBlock[targetBlock.id];
    const currentHintAddend = hintAddendByBlock[targetBlock.id];

    if (!currentHintAddend) {
      // Tier 1 Hint: Reveal one addend
      setHintAddendByBlock((prev) => ({ ...prev, [targetBlock.id]: targetBlock.addendA }));
      showBanner(
        t.hints.tier1
          .replace('{id}', String(targetBlock.id + 1))
          .replace('{a}', String(targetBlock.addendA)),
        'info',
        4000
      );
    } else if (!currentHintTarget) {
      // Tier 2 Hint: Reveal the sum
      setHintTargetByBlock((prev) => ({ ...prev, [targetBlock.id]: true }));
      showBanner(
        t.hints.tier2
          .replace('{id}', String(targetBlock.id + 1))
          .replace('{sum}', String(targetBlock.sumTarget)),
        'info',
        4000
      );
    } else {
      // Tier 3 Hint: Full equation
      showBanner(
        t.hints.tier3
          .replace('{id}', String(targetBlock.id + 1))
          .replace('{a}', String(targetBlock.addendA))
          .replace('{b}', String(targetBlock.addendB))
          .replace('{sum}', String(targetBlock.sumTarget)),
        'success',
        4000
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500/30 selection:text-amber-200">
      {/* 3-Zone Top Navigation Contract */}
      <Header
        language={language}
        onSelectLanguage={setLanguage}
        difficulty={difficulty}
        onSelectDifficulty={(d) => startNewGame(d)}
        secondsElapsed={secondsElapsed}
        isPaused={isPaused}
        onTogglePause={() => setIsPaused(!isPaused)}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onOpenRules={() => setIsRulesOpen(true)}
        onUseHint={handleUseHint}
        onNewGame={() => startNewGame(difficulty)}
        collapsedCount={collapsedCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-4 sm:py-6 flex flex-col items-center justify-start">
        {/* Banner notification toast */}
        {bannerMessage && (
          <div
            className={`
              w-full max-w-[600px] mb-3 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium flex items-center justify-between gap-3 shadow-lg transition-all animate-fade-in
              ${
                bannerMessage.type === 'success'
                  ? 'bg-emerald-950/90 text-emerald-200 border border-emerald-500/40'
                  : bannerMessage.type === 'error'
                  ? 'bg-rose-950/90 text-rose-200 border border-rose-500/40'
                  : 'bg-slate-900/95 text-slate-200 border border-slate-700/80'
              }
            `}
          >
            <div className="flex items-center gap-2">
              {bannerMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
              {bannerMessage.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
              {bannerMessage.type === 'info' && <Info className="w-4 h-4 text-amber-400 shrink-0" />}
              <span>{bannerMessage.text}</span>
            </div>
            <button
              onClick={() => setBannerMessage(null)}
              className="text-slate-400 hover:text-white text-xs px-1"
            >
              ✕
            </button>
          </div>
        )}

        {/* Sudoku Board */}
        {puzzle && (
          <SudokuBoard
            blocks={puzzle.blocks}
            meta={puzzle.meta}
            isMetaStage={isMetaStage}
            wrongCellByBlock={wrongCellByBlock}
            hintTargetByBlock={hintTargetByBlock}
            hintAddendByBlock={hintAddendByBlock}
            focusedBlockId={focusedBlockId}
            language={language}
            onCellClick={handleCellClick}
            onMetaBlockClick={handleMetaBlockClick}
            onSetFocusedBlock={setFocusedBlockId}
          />
        )}

        {/* Status Prompt & Discovered Equations */}
        <Scratchpad
          isMetaStage={isMetaStage}
          equations={equations}
          language={language}
        />
      </main>

      {/* Rules Modal */}
      <RulesModal
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
        language={language}
      />

      {/* Victory Modal */}
      {puzzle && (
        <VictoryModal
          isOpen={isVictoryOpen}
          stats={{
            secondsElapsed,
            hintsUsed: hintsCount,
            incorrectAttempts: mistakesCount,
            equationsFound: equations.length,
          }}
          equations={equations.filter((e) => typeof e.blockId === 'number')}
          metaEquation={{
            a: puzzle.meta.metaAddendA,
            b: puzzle.meta.metaAddendB,
            sum: puzzle.meta.metaSumTarget,
          }}
          difficulty={difficulty}
          language={language}
          onPlayAgain={(diff) => startNewGame(diff || difficulty)}
        />
      )}
    </div>
  );
}
