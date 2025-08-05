
import React from 'react';
import { Scores } from '../types';

interface ScoreboardProps {
    scores: Scores;
    gameMode: 'ai' | 'twoPlayer' | null;
}

const Scoreboard: React.FC<ScoreboardProps> = ({ scores, gameMode }) => {
    const p1Label = gameMode === 'twoPlayer' ? 'P1 Wins' : 'Wins';
    const p2Label = gameMode === 'twoPlayer' ? 'P2 Wins' : 'Losses';
    
    return (
        <div 
            className="flex justify-center items-center gap-6 md:gap-8 px-6 py-2 bg-gray-800/50 rounded-lg shadow-md mb-2"
            aria-label="Current session scores"
        >
            <div className="text-center">
                <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">{p1Label}</p>
                <p className="text-2xl font-bold text-cyan-400" aria-live="polite">{scores.wins}</p>
            </div>
            <div className="text-center">
                <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">{p2Label}</p>
                <p className="text-2xl font-bold text-amber-400" aria-live="polite">{scores.losses}</p>
            </div>
            <div className="text-center">
                <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">Draws</p>
                <p className="text-2xl font-bold text-gray-500" aria-live="polite">{scores.draws}</p>
            </div>
        </div>
    );
};

export default Scoreboard;
