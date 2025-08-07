
import React from 'react';
import type { FC } from 'react';
import type { Achievement, Statistics, Difficulty } from '../types';

const UNLOCKED_ACHIEVEMENTS_KEY = 'unlockedTicTacToeAchievements';

// Helper for icon styling
const IconWrapper: FC<{ isUnlocked: boolean, children: React.ReactNode, className?: string }> = ({ isUnlocked, children, className }) => (
    React.createElement("div", {
        className: `w-full h-full rounded-full flex items-center justify-center transition-all duration-300 ${isUnlocked ? 'bg-yellow-400 text-gray-900' : 'bg-gray-700 text-gray-500'} ${className || ''}`
    }, children)
);

// --- Icon Definitions ---

const TrophyIcon = (isUnlocked: boolean) => React.createElement(IconWrapper, { isUnlocked, children: 
    React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-10 w-10", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2 },
        React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M9 11l3-3m0 0l3 3m-3-3v8m0-13a9 9 0 110 18 9 9 0 010-18z" })
    )
});

const ChartBarIcon = (isUnlocked: boolean) => React.createElement(IconWrapper, { isUnlocked, children: 
    React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-10 w-10", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2 },
        React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" })
    )
});

const FireIcon = (isUnlocked: boolean) => React.createElement(IconWrapper, { isUnlocked, className: "bg-gradient-to-br from-red-500 to-yellow-500", children:
    React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-10 w-10 text-white", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2 },
        React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.657 7.343A8 8 0 0118 15c0 3-1.833 4.74-2.986 6.344-1.333 1.833-2.986 2.986-2.986 2.986s-1.667-1.153-2.986-2.986C8.833 19.74 7 18 7 15a8 8 0 0110.657-6.343" })
    )
});

const SparklesIcon = (isUnlocked: boolean) => React.createElement(IconWrapper, { isUnlocked, className: "bg-cyan-500", children: 
    React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-10 w-10 text-white", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2 },
        React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" })
    )
});

const LightBulbIcon = (isUnlocked: boolean) => React.createElement(IconWrapper, { isUnlocked, children:
    React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-10 w-10", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2 },
        React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 017.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" })
    )
});

const LevelUpIcon = (difficulty: Difficulty) => (isUnlocked: boolean) => {
    const colorClass = isUnlocked 
        ? (difficulty === 'easy' ? 'bg-green-500' : difficulty === 'medium' ? 'bg-yellow-500' : 'bg-red-500')
        : '';
    return React.createElement(IconWrapper, { isUnlocked, className: colorClass, children:
        React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-10 w-10 text-white", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2 },
            React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M5 11l7-7 7 7M5 19l7-7 7 7" })
        )
    });
};


// --- Generator Functions ---

const generateAchievements = (
    tiers: number[],
    idPrefix: string,
    nameTemplate: (tier: number) => string,
    descriptionTemplate: (tier: number) => string,
    condition: (stats: Statistics, levels: Record<Difficulty, number>, tier: number) => boolean,
    icon: (isUnlocked: boolean) => React.ReactNode
): Achievement[] => {
    return tiers.map(tier => ({
        id: `${idPrefix}_${tier}`,
        name: nameTemplate(tier),
        description: descriptionTemplate(tier),
        icon,
        condition: (stats, levels) => condition(stats, levels, tier)
    }));
};

const getWinTitle = (tier: number): string => {
    if (tier < 50) return 'Contender';
    if (tier < 250) return 'Champion';
    if (tier < 500) return 'Master';
    if (tier < 1000) return 'Grandmaster';
    if (tier < 2500) return 'Legend';
    return 'Mythic Legend';
}

const getLevelTitle = (tier: number): string => {
    if (tier < 100) return 'Explorer';
    if (tier < 500) return 'Adventurer';
    if (tier < 1000) return 'Conqueror';
    if (tier < 2500) return 'Vanquisher';
    if (tier < 5000) return 'Dominator';
    return 'Legend';
}

// -- Category Generators --

const getTotalWinsAchievements = (): Achievement[] => generateAchievements(
    [1, 5, 10, 25, 50, ...Array.from({ length: 100 }, (_, i) => (i + 1) * 50)],
    'total_wins',
    tier => `${getWinTitle(tier)} I`,
    tier => `Win ${tier} total games against the AI.`,
    (stats, _, tier) => stats.totalWins >= tier,
    TrophyIcon
);

const getTotalGamesAchievements = (): Achievement[] => generateAchievements(
    [10, 50, 100, 250, 500, 1000, 2500, 5000, 7500, 10000],
    'total_games',
    tier => `Veteran Player (${tier})`,
    tier => `Play ${tier} total games.`,
    (stats, _, tier) => stats.totalGamesPlayed >= tier,
    ChartBarIcon
);

const getWinStreakAchievements = (): Achievement[] => generateAchievements(
    [3, 5, 10, 15, 20, 25, 30, 40, 50, 75, 100],
    'win_streak',
    tier => `On Fire (${tier})`,
    tier => `Achieve a ${tier}-game winning streak.`,
    (stats, _, tier) => stats.longestWinStreak >= tier,
    FireIcon
);

const getPerfectWinAchievements = (): Achievement[] => generateAchievements(
    [1, 5, 10, 25, 50, 100, 250, 500],
    'perfect_wins',
    tier => `Flawless Victory (${tier})`,
    tier => `Win ${tier} games in just 3 moves.`,
    (stats, _, tier) => stats.perfectWins >= tier,
    SparklesIcon
);

const getHintAchievements = (): Achievement[] => generateAchievements(
    [1, 5, 10, 25, 50, 100, 250, 500],
    'hints_used',
    tier => `Strategic Thinker (${tier})`,
    tier => `Use the Hint feature ${tier} times.`,
    (stats, _, tier) => stats.hintsUsed >= tier,
    LightBulbIcon
);

const getDifficultyAndLevelAchievements = (): Achievement[] => {
    const difficulties: Difficulty[] = ['easy', 'medium', 'hard'];
    const winTiers = [1, 5, 10, 25, 50, ...Array.from({ length: 40 }, (_, i) => (i + 1) * 100)];
    const levelTiers = [10, 25, 50, ...Array.from({ length: 100 }, (_, i) => (i + 1) * 50 + 1)];

    let achievements: Achievement[] = [];

    for (const difficulty of difficulties) {
        const capitalized = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
        
        // Difficulty Wins
        achievements = achievements.concat(generateAchievements(
            winTiers,
            `${difficulty}_wins`,
            tier => `${capitalized} ${getWinTitle(tier)}`,
            tier => `Win ${tier} games on ${capitalized} difficulty.`,
            (stats, _, tier) => stats.winsByDifficulty[difficulty] >= tier,
            TrophyIcon
        ));
        
        // Level Progression
        achievements = achievements.concat(generateAchievements(
            levelTiers,
            `${difficulty}_level`,
            tier => `${capitalized} ${getLevelTitle(tier)}`,
            tier => `Reach Level ${tier} on ${capitalized} difficulty.`,
            (_, levels, tier) => levels[difficulty] >= tier,
            LevelUpIcon(difficulty)
        ));
    }
    return achievements;
};

// --- Main Export ---
export const ALL_ACHIEVEMENTS: Achievement[] = [
    ...getTotalWinsAchievements(),
    ...getTotalGamesAchievements(),
    ...getWinStreakAchievements(),
    ...getPerfectWinAchievements(),
    ...getHintAchievements(),
    ...getDifficultyAndLevelAchievements(),
];


export const loadUnlockedAchievements = (): Set<string> => {
    try {
        const saved = localStorage.getItem(UNLOCKED_ACHIEVEMENTS_KEY);
        if (saved) {
            return new Set(JSON.parse(saved));
        }
    } catch (error) {
        console.error("Failed to load unlocked achievements:", error);
    }
    return new Set<string>();
};

export const saveUnlockedAchievements = (unlocked: Set<string>): void => {
    try {
        localStorage.setItem(UNLOCKED_ACHIEVEMENTS_KEY, JSON.stringify(Array.from(unlocked)));
    } catch (error) {
        console.error("Failed to save unlocked achievements:", error);
    }
};

export const checkAndUnlockAchievements = (
    stats: Statistics,
    highestLevelUnlocked: Record<Difficulty, number>,
    currentUnlocked: Set<string>
): { newlyUnlocked: Achievement[]; updatedUnlocked: Set<string> } => {
    const newlyUnlocked: Achievement[] = [];
    const updatedUnlocked = new Set(currentUnlocked);

    for (const achievement of ALL_ACHIEVEMENTS) {
        if (!updatedUnlocked.has(achievement.id)) {
            if (achievement.condition(stats, highestLevelUnlocked)) {
                updatedUnlocked.add(achievement.id);
                newlyUnlocked.push(achievement);
            }
        }
    }

    return { newlyUnlocked, updatedUnlocked };
};
