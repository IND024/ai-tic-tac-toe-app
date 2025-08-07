
import React from 'react';
import type { FC } from 'react';
import type { Difficulty } from '../types';
import { playSound } from '../services/soundService';

interface DifficultySelectionProps {
  onSelectDifficulty: (difficulty: Difficulty) => void;
  onBack: () => void;
}

const DifficultySelection: FC<DifficultySelectionProps> = ({ onSelectDifficulty, onBack }) => {
  const difficulties: { name: Difficulty, color: string, description: string }[] = [
    { name: 'easy', color: 'bg-green-600 hover:bg-green-500 focus:ring-green-400', description: 'Beginner AI. Makes random valid moves.' },
    { name: 'medium', color: 'bg-yellow-600 hover:bg-yellow-500 focus:ring-yellow-400', description: 'A balanced AI. It will try to win and block you, making smart but not perfect moves.' },
    { name: 'hard', color: 'bg-red-600 hover:bg-red-500 focus:ring-red-400', description: 'Unbeatable AI. Plays a perfect game using optimal strategy.' },
  ];

  return (
    <>
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4 selection:bg-cyan-400/20 relative">
         <div className="absolute top-4 left-4">
            <button 
              onClick={onBack} 
              className="px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
              aria-label="Go back to game mode selection"
            >
                &larr; Back
            </button>
        </div>
        <header className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter">
            Choose Your Challenge
          </h1>
          <p className="text-gray-400 mt-2 text-lg">Each difficulty has its own progress and 5000+ levels.</p>
        </header>

        <main className="flex flex-col md:flex-row gap-8">
          {difficulties.map(({ name, color, description }) => (
            <button
              key={name}
              onClick={() => onSelectDifficulty(name)}
              className={`w-72 h-80 flex flex-col justify-between p-8 rounded-2xl shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-2 focus:outline-none focus:ring-4 focus:ring-opacity-75 ${color}`}
            >
              <div className="text-left">
                <h2 className="text-4xl font-black capitalize tracking-tight">{name}</h2>
                <p className="mt-4 text-white/80 text-lg">{description}</p>
              </div>
              <div className="text-right text-white/90 font-bold text-xl">
                Select &rarr;
              </div>
            </button>
          ))}
        </main>
      </div>
    </>
  );
};

export default DifficultySelection;
