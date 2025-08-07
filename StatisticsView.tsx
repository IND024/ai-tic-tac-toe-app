
import React from 'react';
import type { FC } from 'react';
import type { Statistics } from '../types';

interface StatCardProps {
  label: string;
  value: string | number;
  className?: string;
  children?: React.ReactNode;
}

const StatCard: FC<StatCardProps> = ({ label, value, className, children }) => (
  <div className={`bg-gray-900/70 p-6 rounded-xl shadow-lg flex flex-col items-center justify-center text-center ${className}`}>
    <dt className="text-lg font-semibold text-gray-400 order-2">{label}</dt>
    <dd className="text-5xl font-black text-white order-1 mb-1">{value}</dd>
    {children && <div className="order-3 mt-2">{children}</div>}
  </div>
);

const StatisticsView: FC<{ stats: Statistics }> = ({ stats }) => {
  const winRate = stats.totalGamesPlayed > 0 ? ((stats.totalWins / (stats.totalGamesPlayed - stats.totalDraws)) * 100).toFixed(1) : 0;
  
  const difficultyWins = [
      { label: 'Easy', value: stats.winsByDifficulty.easy, color: 'bg-green-500' },
      { label: 'Medium', value: stats.winsByDifficulty.medium, color: 'bg-yellow-500' },
      { label: 'Hard', value: stats.winsByDifficulty.hard, color: 'bg-red-500' },
  ];
  const totalDifficultyWins = difficultyWins.reduce((acc, cur) => acc + cur.value, 0);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 animate-fade-in-slow">
       <style>{'.animate-fade-in-slow { animation: fadeIn 0.5s ease-in-out; } @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }'}</style>
      
      <StatCard label="Total Wins" value={stats.totalWins} className="text-cyan-400" />
      <StatCard label="Total Losses" value={stats.totalLosses} className="text-amber-400" />
      <StatCard label="Total Draws" value={stats.totalDraws} className="text-gray-500" />
      
      <StatCard label="Win Rate" value={`${winRate}%`} className="text-green-400" />
      <StatCard label="Longest Streak" value={stats.longestWinStreak} className="text-purple-400" />
      <StatCard label="Perfect Wins" value={stats.perfectWins} className="text-indigo-400" />

      <div className="bg-gray-900/70 p-6 rounded-xl shadow-lg col-span-2 md:col-span-3">
        <h3 className="text-lg font-semibold text-gray-400 text-center mb-4">Wins by Difficulty</h3>
        <div className="flex w-full h-10 bg-gray-700 rounded-full overflow-hidden">
          {totalDifficultyWins > 0 ? difficultyWins.map(d => (
             <div
                key={d.label}
                className={`${d.color} transition-all duration-500`}
                style={{ width: `${(d.value / totalDifficultyWins) * 100}%` }}
                title={`${d.label}: ${d.value} wins`}
             ></div>
          )) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500">No AI wins yet</div>
          )}
        </div>
        <div className="flex justify-around mt-3 text-sm">
            {difficultyWins.map(d => (
                 <div key={d.label} className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${d.color}`}></span>
                    <span className="text-white font-bold">{d.value}</span>
                    <span className="text-gray-400">{d.label}</span>
                </div>
            ))}
        </div>
      </div>

    </div>
  );
};

export default StatisticsView;
