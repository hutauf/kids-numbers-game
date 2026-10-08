export type Difficulty = 'gentle' | 'standard' | 'expert';

export interface BlockData {
  id: number; // 0 to 8 (row * 3 + col)
  row: number; // 0 to 2
  col: number; // 0 to 2
  numbers: number[]; // 9 distinct numbers in this 3x3 block
  addendA: number;
  addendB: number;
  sumTarget: number; // The unique sum in this block (a + b = sumTarget)
  isCollapsed: boolean;
  collapsedAt?: number;
}

export interface MetaGridData {
  numbers: number[]; // 9 numbers (one per block id: 0..8)
  metaAddendA: number;
  metaAddendB: number;
  metaSumTarget: number; // Unique meta sum (A + B = C)
  isSolved: boolean;
}

export interface Puzzle {
  id: string;
  seed: number;
  difficulty: Difficulty;
  blocks: BlockData[];
  meta: MetaGridData;
  createdAt: number;
}

export interface EquationHistoryItem {
  blockId: number | 'meta';
  a: number;
  b: number;
  sum: number;
  timestamp: number;
}

export interface GameStats {
  secondsElapsed: number;
  hintsUsed: number;
  incorrectAttempts: number;
  equationsFound: number;
}
