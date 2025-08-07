
import type React from 'react';

export type Player = 'P1' | 'P2';
export type SquareValue = Player | null;
export type BoardState = SquareValue[];

export type PlayerSymbol = {
  type: 'text' | 'image';
  value: string; // The character or the base64 data URI
};

export type PlayerSymbols = {
  P1: PlayerSymbol;
  P2: PlayerSymbol;
};

export type Winner = {
  player: Player;
  line: number[];
} | null;

export type Difficulty = 'easy' | 'medium' | 'hard';

export type Scores = {
  wins: number;
  losses: number;
  draws: number;
};

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: (isUnlocked: boolean) => React.ReactNode;
  isSecret?: boolean;
  condition: (stats: Statistics, highestLevelUnlocked: Record<Difficulty, number>) => boolean;
}

export interface Statistics {
  totalGamesPlayed: number;
  totalWins: number;
  totalLosses: number;
  totalDraws: number;
  winsByDifficulty: {
    easy: number;
    medium: number;
    hard: number;
  };
  longestWinStreak: number;
  currentWinStreak: number;
  perfectWins: number; // Player wins in 3 moves (5th turn of the game)
  hintsUsed: number;
}
