import { BlockData, Difficulty, MetaGridData, Puzzle } from '../types/game';

interface GeneratorConfig {
  metaMin: number;
  metaMax: number;
  blockMin: number;
  blockMax: number;
}

const DIFFICULTY_CONFIGS: Record<Difficulty, GeneratorConfig> = {
  gentle: {
    metaMin: 10,
    metaMax: 26,
    blockMin: 1,
    blockMax: 30,
  },
  standard: {
    metaMin: 14,
    metaMax: 36,
    blockMin: 1,
    blockMax: 42,
  },
  expert: {
    metaMin: 18,
    metaMax: 48,
    blockMin: 2,
    blockMax: 56,
  },
};

/**
 * Checks if a set S has strictly one pair {x, y} whose sum is in S,
 * and that this sum matches the expected target.
 */
function verifySingleSumProperty(S: number[], expectedTarget: number): { isValid: boolean; addendA: number; addendB: number } {
  let pairCount = 0;
  let a = 0;
  let b = 0;
  const n = S.length;

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const sum = S[i] + S[j];
      if (S.includes(sum)) {
        pairCount++;
        a = Math.min(S[i], S[j]);
        b = Math.max(S[i], S[j]);
        if (sum !== expectedTarget) {
          return { isValid: false, addendA: 0, addendB: 0 };
        }
      }
    }
  }

  return {
    isValid: pairCount === 1,
    addendA: a,
    addendB: b,
  };
}

/**
 * Generates the 3x3 Meta Grid: 9 numbers where exactly one pair adds up to a 3rd number.
 */
function generateMetaGrid(config: GeneratorConfig): { numbers: number[]; A: number; B: number; C: number } | null {
  const { metaMin, metaMax } = config;

  for (let attempt = 0; attempt < 1000; attempt++) {
    // Pick target C
    const C = Math.floor(Math.random() * (metaMax - metaMin - 4)) + metaMin + 5;

    // Pick pairs A, B such that A + B = C
    const validPairs: [number, number][] = [];
    for (let a = metaMin; a <= Math.floor((C - 1) / 2); a++) {
      const b = C - a;
      if (a !== b && b <= metaMax) {
        validPairs.push([a, b]);
      }
    }
    if (validPairs.length === 0) continue;

    const [A, B] = validPairs[Math.floor(Math.random() * validPairs.length)];

    // Pool of remaining distinct numbers
    const pool: number[] = [];
    for (let x = metaMin; x <= metaMax; x++) {
      if (x !== A && x !== B && x !== C) pool.push(x);
    }
    pool.sort(() => Math.random() - 0.5);

    const R: number[] = [A, B, C];
    for (const cand of pool) {
      if (R.length === 9) break;

      // Ensure adding cand doesn't create any extra sum
      let ok = true;
      for (const r of R) {
        if (R.includes(cand + r) || (cand - r > 0 && R.includes(cand - r)) || (r - cand > 0 && R.includes(r - cand))) {
          ok = false;
          break;
        }
      }
      if (ok) R.push(cand);
    }

    if (R.length === 9) {
      const check = verifySingleSumProperty(R, C);
      if (check.isValid && (check.addendA === Math.min(A, B)) && (check.addendB === Math.max(A, B))) {
        // Randomly shuffle the 9 numbers so the solution isn't at index 0,1,2
        const shuffled = [...R].sort(() => Math.random() - 0.5);
        return {
          numbers: shuffled,
          A: Math.min(A, B),
          B: Math.max(A, B),
          C,
        };
      }
    }
  }

  return null;
}

/**
 * Generates a single 3x3 block of 9 numbers whose target sum is predetermined (target = C_block).
 */
function generateBlockNumbers(target: number, config: GeneratorConfig): { numbers: number[]; a: number; b: number } | null {
  const { blockMin, blockMax } = config;

  for (let attempt = 0; attempt < 300; attempt++) {
    // Find all valid pairs a + b = target (a < b)
    const pairs: [number, number][] = [];
    for (let a = blockMin; a <= Math.floor((target - 1) / 2); a++) {
      const b = target - a;
      if (a !== b && b <= blockMax && b >= blockMin && a !== target && b !== target) {
        pairs.push([a, b]);
      }
    }
    if (pairs.length === 0) continue;

    const [a, b] = pairs[Math.floor(Math.random() * pairs.length)];

    const pool: number[] = [];
    for (let x = blockMin; x <= blockMax; x++) {
      if (x !== a && x !== b && x !== target) pool.push(x);
    }
    pool.sort(() => Math.random() - 0.5);

    const S: number[] = [a, b, target];
    for (const cand of pool) {
      if (S.length === 9) break;
      let ok = true;
      for (const s of S) {
        if (S.includes(cand + s) || (cand - s > 0 && S.includes(cand - s)) || (s - cand > 0 && S.includes(s - cand))) {
          ok = false;
          break;
        }
      }
      if (ok) S.push(cand);
    }

    if (S.length === 9) {
      const check = verifySingleSumProperty(S, target);
      if (check.isValid && check.addendA === Math.min(a, b) && check.addendB === Math.max(a, b)) {
        // Shuffle the 9 positions within this 3x3 block
        const shuffled = [...S].sort(() => Math.random() - 0.5);
        return {
          numbers: shuffled,
          a: Math.min(a, b),
          b: Math.max(a, b),
        };
      }
    }
  }

  return null;
}

/**
 * Generates the full 2-tier puzzle inversely:
 * First the 9 meta results, then for each result, the corresponding 3x3 block!
 */
export function generatePuzzle(difficulty: Difficulty = 'standard'): Puzzle {
  const config = DIFFICULTY_CONFIGS[difficulty];

  // Try generating with retries
  for (let outerTry = 0; outerTry < 50; outerTry++) {
    const meta = generateMetaGrid(config);
    if (!meta) continue;

    const blocks: BlockData[] = [];
    let allBlocksSucceeded = true;

    for (let i = 0; i < 9; i++) {
      const target = meta.numbers[i];
      const blockGen = generateBlockNumbers(target, config);
      if (!blockGen) {
        allBlocksSucceeded = false;
        break;
      }

      blocks.push({
        id: i,
        row: Math.floor(i / 3),
        col: i % 3,
        numbers: blockGen.numbers,
        addendA: blockGen.a,
        addendB: blockGen.b,
        sumTarget: target,
        isCollapsed: false,
      });
    }

    if (allBlocksSucceeded && blocks.length === 9) {
      const metaGrid: MetaGridData = {
        numbers: meta.numbers,
        metaAddendA: meta.A,
        metaAddendB: meta.B,
        metaSumTarget: meta.C,
        isSolved: false,
      };

      return {
        id: `puzzle-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        seed: Math.floor(Math.random() * 1000000),
        difficulty,
        blocks,
        meta: metaGrid,
        createdAt: Date.now(),
      };
    }
  }

  // Fallback to standard config if expert had trouble
  if (difficulty !== 'gentle') {
    return generatePuzzle('gentle');
  }

  throw new Error('Failed to generate puzzle');
}
