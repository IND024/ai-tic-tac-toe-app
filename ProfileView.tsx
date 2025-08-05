
import React, { useState } from 'react';
import { Statistics, Achievement } from '../types';
import StatisticsView from './StatisticsView';
import AchievementsView from './AchievementsView';
import { ALL_ACHIEVEMENTS } from '../services/achievementsService';

interface ProfileViewProps {
  stats: Statistics;
  unlockedAchievements: Set<string>;
  onBack: () => void;
}

type ActiveTab = 'stats' | 'achievements';

const ProfileView: React.FC<ProfileViewProps> = ({ stats, unlockedAchievements, onBack }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('stats');

  const TabButton: React.FC<{ tabId: ActiveTab; children: React.ReactNode }> = ({ tabId, children }) => (
    <button
      onClick={() => setActiveTab(tabId)}
      className={`px-6 py-3 text-xl font-bold rounded-t-lg transition-colors duration-200 focus:outline-none w-1/2 ${
        activeTab === tabId
          ? 'bg-gray-800 text-cyan-400'
          : 'bg-gray-900/50 text-gray-400 hover:bg-gray-800/70 hover:text-white'
      }`}
      role="tab"
      aria-selected={activeTab === tabId}
    >
      {children}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center p-4 selection:bg-cyan-400/20 animate-fade-in">
       <style>{'.animate-fade-in { animation: fadeIn 0.3s ease-in-out; } @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }'}</style>
      <div className="w-full max-w-4xl">
        <div className="relative flex justify-center items-center mb-6">
           <button onClick={onBack} className="absolute left-0 px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400">
                &larr; Back
            </button>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-center">
                Your Profile
            </h1>
        </div>
        
        <div className="flex border-b-2 border-gray-700" role="tablist" aria-label="Profile Tabs">
          <TabButton tabId="stats">Statistics</TabButton>
          <TabButton tabId="achievements">Achievements</TabButton>
        </div>

        <main className="bg-gray-800 p-4 sm:p-6 rounded-b-lg">
          {activeTab === 'stats' && <StatisticsView stats={stats} />}
          {activeTab === 'achievements' && <AchievementsView allAchievements={ALL_ACHIEVEMENTS} unlockedIds={unlockedAchievements} />}
        </main>
      </div>
    </div>
  );
};

export default ProfileView;
