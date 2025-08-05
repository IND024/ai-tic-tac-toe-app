
import React from 'react';
import { Player, PlayerSymbol } from '../types';

interface SquareProps {
  player: Player | null;
  symbol: PlayerSymbol | null;
  onClick: () => void;
  isWinning: boolean;
  disabled: boolean;
  isHint: boolean;
}

const Square: React.FC<SquareProps> = ({ player, symbol, onClick, isWinning, disabled, isHint }) => {
  const baseStyle = "flex items-center justify-center w-24 h-24 md:w-32 md:h-32 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105";
  const bgStyle = isWinning ? "bg-green-500" : "bg-gray-800 hover:bg-gray-700";
  
  const textStyle = player === 'P1' ? 'text-cyan-400' : 'text-amber-400';
  const hintStyle = isHint ? 'animate-pulse-hint border-2 border-cyan-400' : 'border-2 border-transparent';
  
  return (
    <button
      className={`${baseStyle} ${bgStyle} ${hintStyle}`}
      onClick={onClick}
      disabled={disabled || !!player}
      aria-label={player ? `Square occupied by Player ${player === 'P1' ? 1 : 2}` : 'Empty square'}
    >
      <div className={symbol ? 'animate-place-symbol' : 'transform scale-0'}>
        {symbol && (
          symbol.type === 'image' ? (
            <img 
              src={symbol.value} 
              alt={`Player ${player} symbol`} 
              // Increased size to make the symbol more prominent within the square.
              className="w-[92px] h-[92px] md:w-[124px] md:h-[124px] object-contain"
            />
          ) : (
            // Increased size to match the image symbol's visual weight.
            <span className={`text-[80px] md:text-[110px] font-black ${textStyle}`}>
              {symbol.value}
            </span>
          )
        )}
      </div>
    </button>
  );
};

export default Square;