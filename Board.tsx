import React from 'react';
import { BoardState, Winner, PlayerSymbols } from '../types';
import Square from './Square';
import WinningLine from './WinningLine';

interface BoardProps {
  board: BoardState;
  onSquareClick: (index: number) => void;
  winnerInfo: Winner;
  isAiThinking: boolean;
  hintedSquare: number | null;
  playerSymbols: PlayerSymbols;
}

const Board: React.FC<BoardProps> = ({ board, onSquareClick, winnerInfo, isAiThinking, hintedSquare, playerSymbols }) => {
  return (
    <div className="relative grid grid-cols-3 gap-3 p-3 bg-gray-900/50 rounded-xl shadow-2xl">
      {board.map((player, index) => {
        const isWinning = winnerInfo?.line.includes(index) ?? false;
        const isHint = hintedSquare === index;
        const symbol = player ? playerSymbols[player] : null;

        return (
          <Square
            key={index}
            player={player}
            symbol={symbol}
            onClick={() => onSquareClick(index)}
            isWinning={isWinning}
            disabled={isAiThinking || !!winnerInfo}
            isHint={isHint}
          />
        );
      })}
      <WinningLine winnerInfo={winnerInfo} />
    </div>
  );
};

export default Board;