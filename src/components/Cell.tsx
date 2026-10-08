import React from 'react';

interface CellProps {
  value: number;
  isSelected?: boolean;
  isTargetHint?: boolean;
  isAddendHint?: boolean;
  isWrongShake?: boolean;
  isEquationHighlight?: boolean;
  onClick: () => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const Cell: React.FC<CellProps> = ({
  value,
  isSelected = false,
  isTargetHint = false,
  isAddendHint = false,
  isWrongShake = false,
  isEquationHighlight = false,
  onClick,
  disabled = false,
  size = 'md',
}) => {
  // Determine styles based on states
  let stateClasses = 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-100 border-slate-700/60';

  if (isEquationHighlight) {
    stateClasses = 'bg-emerald-500/30 text-emerald-200 border-emerald-400 font-extrabold shadow-[0_0_12px_rgba(16,185,129,0.5)] scale-105';
  } else if (isSelected) {
    stateClasses = 'bg-amber-500/25 text-amber-200 border-amber-400 font-bold shadow-[0_0_10px_rgba(245,158,11,0.4)] scale-105 ring-2 ring-amber-400/50';
  } else if (isTargetHint) {
    stateClasses = 'bg-purple-500/25 text-purple-200 border-purple-400 font-bold animate-pulse ring-2 ring-purple-400/60';
  } else if (isAddendHint) {
    stateClasses = 'bg-cyan-500/25 text-cyan-200 border-cyan-400 font-bold animate-pulse ring-2 ring-cyan-400/60';
  }

  const shakeClass = isWrongShake ? 'animate-shake border-red-500 bg-red-950/50 text-red-300' : '';

  const sizeClasses = {
    sm: 'w-7 h-7 sm:w-8 sm:h-8 text-xs sm:text-sm',
    md: 'w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 text-sm sm:text-base md:text-lg',
    lg: 'w-11 h-11 sm:w-14 sm:h-14 md:w-16 md:h-16 text-lg sm:text-xl md:text-2xl',
  }[size];

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`
        ${sizeClasses}
        font-num font-semibold
        flex items-center justify-center
        rounded-lg border
        transition-all duration-150
        select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400
        active:scale-95
        ${stateClasses}
        ${shakeClass}
        ${disabled ? 'cursor-default opacity-90' : 'cursor-pointer'}
      `}
      aria-label={`Number ${value}`}
    >
      {value}
    </button>
  );
};
