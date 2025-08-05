

import React from 'react';
import { Player, Winner, PlayerSymbols, PlayerSymbol } from '../types';

interface GameStatusProps {
    winnerInfo: Winner;
    isDraw: boolean;
    turn: Player;
    isAiThinking: boolean;
    playerSymbols: PlayerSymbols;
}

const SymbolDisplay: React.FC<{ player: Player; symbol: PlayerSymbol; large?: boolean }> = ({ player, symbol, large = false }) => {
  const colorClass = player === 'P1' ? 'text-cyan-400' : 'text-amber-400';
  // Increased size for image symbols to make them more visible.
  const sizeClass = large ? 'w-16 h-16' : 'w-12 h-12';

  if (symbol.type === 'image') {
    return <img src={symbol.value} alt={`${player} symbol`} className={`${sizeClass} inline-block mx-2 object-contain`} />;
  }
  // Increased size for text symbols and made them bold for consistency.
  return <span className={`${colorClass} font-bold ${large ? 'text-6xl' : 'text-4xl'} mx-1`}>{symbol.value}</span>;
};

const GameStatus: React.FC<GameStatusProps> = ({ winnerInfo, isDraw, turn, isAiThinking, playerSymbols }) => {
    let message;
    if (winnerInfo) {
        const winnerSymbol = playerSymbols[winnerInfo.player];
        message = (
          <span className="text-4xl font-bold flex items-center justify-center">
            Winner: <SymbolDisplay player={winnerInfo.player} symbol={winnerSymbol} large />
          </span>
        );
    } else if (isDraw) {
        message = <span className="text-4xl font-bold text-gray-400">It's a Draw!</span>;
    } else if (isAiThinking) {
        message = (
            <div className="flex items-center space-x-3">
                 <svg className="animate-spin h-8 w-8 text-amber-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-2xl font-medium text-gray-300">AI is thinking...</span>
            </div>
        );
    } else {
        const currentSymbol = playerSymbols[turn];
        message = (
            // Increased text size for better readability and consistency with the larger symbol.
            <span className="text-3xl font-medium text-gray-300 flex items-center justify-center">
                Next Player: <SymbolDisplay player={turn} symbol={currentSymbol} />
            </span>
        );
    }

    return (
        <div className="h-16 flex items-center justify-center text-center transition-all duration-300">
            {message}
        </div>
    );
};

export default GameStatus;
