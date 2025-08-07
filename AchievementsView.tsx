
import React from 'react';
import type { FC } from 'react';
import type { Achievement } from '../types';

interface AchievementsViewProps {
  allAchievements: Achievement[];
  unlockedIds: Set<string>;
}

// Sub-component for rendering a single achievement item to reduce repetition.
const AchievementItem: FC<{ achievement: Achievement; isUnlocked: boolean }> = ({ achievement, isUnlocked }) => (
    <div key={achievement.id} className="group relative flex flex-col items-center gap-2">
        <div className={`w-24 h-24 transition-all duration-300 ${!isUnlocked ? 'grayscale opacity-70' : ''}`}>
            {achievement.icon(isUnlocked)}
        </div>
        <span className={`text-sm text-center font-semibold transition-colors ${isUnlocked ? 'text-white' : 'text-gray-500'}`}>
            {achievement.name}
        </span>
        {/* Tooltip */}
        <div className="absolute bottom-full mb-2 w-48 bg-gray-900 text-white text-xs rounded-lg py-2 px-3 text-center z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <p className="font-bold text-base">{achievement.name}</p>
            <p>{achievement.description}</p>
            <svg className="absolute text-gray-900 h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255">
                <polygon className="fill-current" points="0,0 127.5,127.5 255,0"/>
            </svg>
        </div>
    </div>
);


const AchievementsView: FC<AchievementsViewProps> = ({ allAchievements, unlockedIds }) => {
  const unlockedCount = unlockedIds.size;
  const totalCount = allAchievements.length;
  
  const unlockedList = allAchievements.filter(ach => unlockedIds.has(ach.id));
  const lockedList = allAchievements.filter(ach => !unlockedIds.has(ach.id));

  const SectionHeader: FC<{ title: string }> = ({ title }) => (
      <div className="flex justify-between items-center mb-4">
          <h4 className="text-xl font-bold text-gray-300">{title}</h4>
      </div>
  );

  return (
    <div className="animate-fade-in-slow">
       <style>{'.animate-fade-in-slow { animation: fadeIn 0.5s ease-in-out; } @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }'}</style>
      <div className="mb-8 text-center">
        <h3 className="text-2xl font-bold text-white">
          Total Progress: {unlockedCount} / {totalCount} Unlocked
        </h3>
        <div className="w-full bg-gray-700 rounded-full h-2.5 mt-2">
            <div 
                className="bg-green-500 h-2.5 rounded-full transition-all duration-500" 
                style={{width: `${(unlockedCount/totalCount)*100}%`}}>
            </div>
        </div>
      </div>

      {/* Unlocked Achievements Section */}
      <section className="mb-8">
        <SectionHeader title="Unlocked Achievements" />
        {unlockedList.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
            {unlockedList.map(ach => (
              <AchievementItem key={ach.id} achievement={ach} isUnlocked={true} />
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8 bg-gray-900/50 rounded-lg">
            No achievements unlocked yet. Keep playing!
          </div>
        )}
      </section>
      
      {lockedList.length > 0 && <div className="border-t-2 border-gray-700 my-8"></div>}
      
      {/* Locked Achievements Section */}
      {lockedList.length > 0 && (
        <section>
          <SectionHeader title="Locked Achievements" />
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
            {lockedList.map(ach => (
              <AchievementItem key={ach.id} achievement={ach} isUnlocked={false} />
            ))}
          </div>
        </section>
      )}

      {lockedList.length === 0 && (
         <div className="text-center text-green-400 py-8 bg-gray-900/50 rounded-lg">
            Congratulations! You've unlocked all achievements!
        </div>
      )}

    </div>
  );
};

export default AchievementsView;
