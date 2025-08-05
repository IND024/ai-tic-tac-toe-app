
import React, { useState } from 'react';
import { Difficulty } from '../types';
import Ad from './Ad';
import { playSound } from '../services/soundService';

interface LevelSelectionProps {
  highestLevelUnlocked: number;
  onSelectLevel: (level: number) => void;
  totalLevels: number;
  onBack: () => void;
  difficulty: Difficulty;
}

const LEVELS_PER_PAGE = 30;

const LevelSelection: React.FC<LevelSelectionProps> = ({ highestLevelUnlocked, onSelectLevel, totalLevels, onBack, difficulty }) => {
  const totalPages = Math.ceil(totalLevels / LEVELS_PER_PAGE);
  const initialPage = Math.floor((highestLevelUnlocked - 1) / LEVELS_PER_PAGE) + 1;
  const [currentPage, setCurrentPage] = useState(initialPage);

  const startIndex = (currentPage - 1) * LEVELS_PER_PAGE;
  const levelsToDisplay = Array.from({ length: Math.min(LEVELS_PER_PAGE, totalLevels - startIndex) }, (_, i) => startIndex + i + 1);
  
  const buttonStyle = "px-6 py-3 font-semibold rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-opacity-75 transition-all duration-300 transform disabled:cursor-not-allowed disabled:opacity-50";
  const enabledButtonStyle = "bg-indigo-600 text-white hover:bg-indigo-500 focus:ring-indigo-400 hover:scale-105";
  const disabledButtonStyle = "bg-gray-700 text-gray-400";
  const backButtonStyle = "bg-gray-600 text-white hover:bg-gray-500 focus:ring-gray-400 hover:scale-105";

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center p-4 selection:bg-cyan-400/20">
      <div className="flex flex-grow w-full max-w-screen-2xl">
        <aside className="w-48 hidden lg:flex justify-center items-center p-4">
            <Ad type="sidebar" />
        </aside>

        <div className="flex-grow flex flex-col items-center justify-center">
            <header className="text-center mb-10">
              <h1 className="text-5xl md:text-6xl font-black tracking-tighter">
                  Select a Level
              </h1>
              <p className="text-gray-400 mt-2 text-xl">
                Difficulty: <span className="font-bold capitalize">{difficulty}</span>
              </p>
            </header>

            <main className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 max-w-2xl min-h-[42rem]">
              {levelsToDisplay.map((level) => {
                const isCrossed = level < highestLevelUnlocked;
                const isPlayable = level <= highestLevelUnlocked;

                const baseStyle = "w-24 h-24 flex items-center justify-center text-4xl font-bold rounded-lg transition-all duration-300 transform focus:outline-none focus:ring-2 focus:ring-opacity-75";
                
                const colorStyle = isCrossed 
                  ? 'bg-green-600 text-white focus:ring-green-400'
                  : 'bg-gray-800 text-gray-400 focus:ring-indigo-400';

                const interactiveStyle = isPlayable
                  ? 'hover:scale-110 hover:shadow-lg hover:shadow-indigo-500/20 cursor-pointer'
                  : 'opacity-50 cursor-not-allowed';

                return (
                  <button
                    key={level}
                    onClick={() => {
                        if (isPlayable) {
                            playSound('button');
                            onSelectLevel(level)
                        }
                    }}
                    disabled={!isPlayable}
                    className={`${baseStyle} ${colorStyle} ${interactiveStyle}`}
                    aria-label={`Level ${level} ${isPlayable ? isCrossed ? 'Completed' : 'Unlocked' : 'Locked'}`}
                  >
                    {isPlayable ? (
                      level
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-10 w-10"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M16.5 10.5V6.75a4.5 4.5 0 00-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                        />
                      </svg>
                    )}
                  </button>
                );
              })}
            </main>

            <div className="flex justify-between items-center w-full max-w-2xl mt-8">
              <button
                onClick={() => {
                    playSound('button');
                    setCurrentPage(p => Math.max(1, p - 1));
                }}
                disabled={currentPage === 1}
                className={`${buttonStyle} ${currentPage === 1 ? disabledButtonStyle : enabledButtonStyle}`}
                aria-label="Previous page of levels"
              >
                Previous
              </button>
              <button
                  onClick={() => {
                      playSound('button');
                      onBack();
                  }}
                  className={`${buttonStyle} ${backButtonStyle}`}
                  aria-label="Change difficulty"
              >
                  Change Difficulty
              </button>
              <button
                onClick={() => {
                    playSound('button');
                    setCurrentPage(p => Math.min(totalPages, p + 1));
                }}
                disabled={currentPage === totalPages}
                className={`${buttonStyle} ${currentPage === totalPages ? disabledButtonStyle : enabledButtonStyle}`}
                aria-label="Next page of levels"
              >
                Next
              </button>
            </div>
            <div className="text-center w-full max-w-2xl mt-4">
              <span className="text-lg font-medium text-gray-300" aria-live="polite">
                Page {currentPage} of {totalPages}
              </span>
            </div>
        </div>

        <aside className="w-48 hidden lg:flex justify-center items-center p-4">
            <Ad type="sidebar" />
        </aside>
      </div>
    </div>
  );
};

export default LevelSelection;
