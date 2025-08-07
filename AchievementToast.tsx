
import React, { useEffect } from 'react';
import type { FC } from 'react';
import type { Achievement } from '../types';

interface AchievementToastProps {
  achievement: Achievement;
  onComplete: () => void;
}

const AchievementToast: FC<AchievementToastProps> = ({ achievement, onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 4000); // Show for 4 seconds

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      role="alert"
      className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 text-white px-6 py-4 rounded-xl shadow-2xl border-2 border-yellow-400/50 flex items-center z-50 animate-slide-up-fade-out"
    >
      <style>
        {`
          @keyframes slide-up-fade-out {
            0% { transform: translate(-50%, 100px); opacity: 0; }
            15% { transform: translate(-50%, 0); opacity: 1; }
            85% { transform: translate(-50%, 0); opacity: 1; }
            100% { transform: translate(-50%, 100px); opacity: 0; }
          }
          .animate-slide-up-fade-out {
            animation: slide-up-fade-out 4s ease-in-out forwards;
          }
        `}
      </style>
      <div className="w-16 h-16 mr-4 flex-shrink-0">
        {achievement.icon(true)}
      </div>
      <div>
        <p className="font-bold text-yellow-400">Achievement Unlocked!</p>
        <p className="font-semibold text-lg">{achievement.name}</p>
      </div>
    </div>
  );
};

export default AchievementToast;
