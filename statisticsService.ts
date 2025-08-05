
import { Statistics, Difficulty } from '../types';

const STATS_KEY = 'ticTacToeLifetimeStats';

const INITIAL_STATS: Statistics = {
  totalGamesPlayed: 0,
  totalWins: 0,
  totalLosses: 0,
  totalDraws: 0,
  winsByDifficulty: {
    easy: 0,
    medium: 0,
    hard: 0,
  },
  longestWinStreak: 0,
  currentWinStreak: 0,
  perfectWins: 0,
  hintsUsed: 0,
};

export const loadStatistics = (): Statistics => {
  try {
    const savedStats = localStorage.getItem(STATS_KEY);
    if (savedStats) {
      const parsed = JSON.parse(savedStats);
      // Ensure all keys from INITIAL_STATS are present to handle data structure changes
      return { ...INITIAL_STATS, ...parsed };
    }
  } catch (error) {
    console.error('Failed to load statistics from localStorage:', error);
  }
  return INITIAL_STATS;
};

export const saveStatistics = (stats: Statistics): void => {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch (error) {
    console.error('Failed to save statistics to localStorage:', error);
  }
};

export const updateStatsOnGameEnd = (
  currentStats: Statistics,
  result: 'win' | 'loss' | 'draw',
  difficulty: Difficulty,
  playerTurnCount: number // How many moves P1 made
): Statistics => {
  const newStats = { ...currentStats };

  newStats.totalGamesPlayed += 1;

  if (result === 'win') {
    newStats.totalWins += 1;
    newStats.winsByDifficulty[difficulty] += 1;
    newStats.currentWinStreak += 1;
    if (newStats.currentWinStreak > newStats.longestWinStreak) {
      newStats.longestWinStreak = newStats.currentWinStreak;
    }
    // A "perfect" win is defined as winning on the 5th turn (3 moves by player 1)
    if (playerTurnCount === 3) {
      newStats.perfectWins += 1;
    }
  } else if (result === 'loss') {
    newStats.totalLosses += 1;
    newStats.currentWinStreak = 0;
  } else { // draw
    newStats.totalDraws += 1;
    newStats.currentWinStreak = 0;
  }
  
  return newStats;
};

export const updateStatsOnHint = (currentStats: Statistics): Statistics => {
  const newStats = { ...currentStats };
  newStats.hintsUsed += 1;
  return newStats;
};
