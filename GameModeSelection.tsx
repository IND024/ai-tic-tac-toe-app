
import React from 'react';

interface GameModeSelectionProps {
  onSelectMode: (mode: 'ai' | 'twoPlayer') => void;
  onShowProfile: () => void;
}

const GameModeSelection: React.FC<GameModeSelectionProps> = ({ onSelectMode, onShowProfile }) => {
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4 selection:bg-cyan-400/20">
      <header className="text-center mb-12 animate-fade-in">
        <h1 className="text-5xl md:text-6xl font-black tracking-tighter">
          Select Game Mode
        </h1>
      </header>
      <main className="flex flex-col md:flex-row items-center gap-8">
        <button
          onClick={() => onSelectMode('ai')}
          className="w-80 h-96 flex flex-col justify-between p-8 rounded-2xl shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-2 focus:outline-none focus:ring-4 focus:ring-opacity-75 bg-indigo-600 hover:bg-indigo-500 focus:ring-indigo-400 animate-slide-up-delay-1"
        >
          <div className="text-left">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 text-cyan-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 3H5a2 2 0 00-2 2v4m5-6h6m-6 0V1m6 2v2m0 0h4a2 2 0 012 2v4m-6 0v6m0-6H9m6 0h2M9 21v-6m0 6H5a2 2 0 01-2-2v-4m5 6h6m-6 0V15m6 6v-2m0 0h4a2 2 0 002-2v-4m-6 0V9m0 6h-2" />
            </svg>
            <h2 className="text-4xl font-black capitalize tracking-tight">Play with AI</h2>
            <p className="mt-4 text-white/80 text-lg">Challenge our advanced AI opponent. Choose from multiple difficulty levels and climb the ranks.</p>
          </div>
          <div className="text-right text-white/90 font-bold text-xl">
            Select &rarr;
          </div>
        </button>
        <button
          onClick={() => onSelectMode('twoPlayer')}
          className="w-80 h-96 flex flex-col justify-between p-8 rounded-2xl shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-2 focus:outline-none focus:ring-4 focus:ring-opacity-75 bg-purple-600 hover:bg-purple-500 focus:ring-purple-400 animate-slide-up-delay-2"
        >
          <div className="text-left">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197m0 0A6.995 6.995 0 0012 12.75a6.995 6.995 0 00-3-5.197M15 21a9 9 0 00-9-9" />
            </svg>
            <h2 className="text-4xl font-black capitalize tracking-tight">Two Player</h2>
            <p className="mt-4 text-white/80 text-lg">Play against a friend on the same device in a classic head-to-head match.</p>
          </div>
          <div className="text-right text-white/90 font-bold text-xl">
            Select &rarr;
          </div>
        </button>
      </main>
      <div className="mt-10 animate-slide-up-delay-3">
          <button
              onClick={onShowProfile}
              className="px-8 py-4 bg-gray-700 text-white font-semibold rounded-lg shadow-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-75 transition-all duration-300 transform hover:scale-105 flex items-center gap-3"
          >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Profile & Stats</span>
          </button>
      </div>
       <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          .animate-fade-in {
            animation: fadeIn 1s ease-in-out forwards;
          }
          .animate-slide-up-delay-1 {
            animation: slideUp 0.8s ease-in-out 0.3s forwards;
            opacity: 0;
          }
          .animate-slide-up-delay-2 {
            animation: slideUp 0.8s ease-in-out 0.6s forwards;
            opacity: 0;
          }
          .animate-slide-up-delay-3 {
            animation: slideUp 0.8s ease-in-out 0.9s forwards;
            opacity: 0;
          }
        `}
      </style>
    </div>
  );
};

export default GameModeSelection;
