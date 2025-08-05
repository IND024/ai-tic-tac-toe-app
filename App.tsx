
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BoardState, Player, Winner, Difficulty, Scores, PlayerSymbols, Statistics, Achievement } from './types';
import { getAIMove, getHint } from './services/geminiService';
import { playSound, getMuteState, toggleMuteState } from './services/soundService';
import * as statisticsService from './services/statisticsService';
import * as achievementsService from './services/achievementsService';

import Board from './components/Board';
import GameStatus from './components/GameStatus';
import LevelSelection from './components/LevelSelection';
import SplashScreen from './components/SplashScreen';
import DifficultySelection from './components/DifficultySelection';
import Ad from './components/Ad';
import AdOverlay from './components/AdOverlay';
import RewardedAdOverlay from './components/RewardedAdOverlay';
import Scoreboard from './components/Scoreboard';
import MuteButton from './components/MuteButton';
import AdminLoginModal from './components/AdminLoginModal';
import AdminPanelModal from './components/AdminPanelModal';
import ProgressSaveIndicator from './components/ProgressSaveIndicator';
import SettingsIcon from './components/SettingsIcon';
import SettingsModal from './components/SettingsModal';
import GameModeSelection from './components/GameModeSelection';
import ProfileView from './components/ProfileView';
import AchievementToast from './components/AchievementToast';


const INITIAL_BOARD: BoardState = Array(9).fill(null);
const MAX_LEVELS = 5001;
const INITIAL_SCORES: Scores = { wins: 0, losses: 0, draws: 0 };
const DEFAULT_PLAYER_SYMBOLS: PlayerSymbols = { 
    P1: { type: 'text', value: 'X' }, 
    P2: { type: 'text', value: 'O' } 
};

type GameMode = 'ai' | 'twoPlayer';
type GameViewState = 'loading' | 'modeSelection' | 'difficultySelection' | 'levelSelection' | 'playing' | 'profile';

const App: React.FC = () => {
    const [viewState, setViewState] = useState<GameViewState>('loading');
    const [previousViewState, setPreviousViewState] = useState<GameViewState>('loading');
    const [gameMode, setGameMode] = useState<GameMode | null>(null);
    
    const [highestLevelUnlocked, setHighestLevelUnlocked] = useState<Record<Difficulty, number>>({ easy: 1, medium: 1, hard: 1 });
    const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
    const [currentLevel, setCurrentLevel] = useState<number>(1);
    
    const [board, setBoard] = useState<BoardState>(INITIAL_BOARD);
    const [turn, setTurn] = useState<Player>('P1');
    const [winnerInfo, setWinnerInfo] = useState<Winner>(null);
    const [isDraw, setIsDraw] = useState<boolean>(false);
    const [isAiThinking, setIsAiThinking] = useState<boolean>(false);
    const [isOnline, setIsOnline] = useState<boolean>(() => navigator.onLine);
    const [scores, setScores] = useState<Scores>(INITIAL_SCORES);
    const [isMuted, setIsMuted] = useState(getMuteState());
    
    const [playerSymbols, setPlayerSymbols] = useState<PlayerSymbols>(DEFAULT_PLAYER_SYMBOLS);

    const [hintedSquare, setHintedSquare] = useState<number | null>(null);
    const [isHintLoading, setIsHintLoading] = useState<boolean>(false);
    
    const [showFirstTimeLevelAd, setShowFirstTimeLevelAd] = useState<boolean>(false);
    const [showTimedAd, setShowTimedAd] = useState<boolean>(false);
    const [showLevelAd, setShowLevelAd] = useState<boolean>(false);
    const [showRewardedAd, setShowRewardedAd] = useState<boolean>(false);
    const continuousPlayTimer = useRef<number | null>(null);

    const [isAdmin, setIsAdmin] = useState(() => {
        try {
            return sessionStorage.getItem('isAdmin') === 'true';
        } catch {
            return false;
        }
    });
    const [showAdminLogin, setShowAdminLogin] = useState(false);
    const [showAdminPanel, setShowAdminPanel] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    
    const [adminClickCount, setAdminClickCount] = useState(0);
    const adminClickTimer = useRef<number | null>(null);

    const [showSaveIndicator, setShowSaveIndicator] = useState<boolean>(false);
    const saveIndicatorTimeoutRef = useRef<number | null>(null);
    const isInitialMount = useRef(true);

    // --- Statistics & Achievements State ---
    const [lifetimeStats, setLifetimeStats] = useState<Statistics>(statisticsService.loadStatistics());
    const [unlockedAchievements, setUnlockedAchievements] = useState<Set<string>>(achievementsService.loadUnlockedAchievements());
    const [achievementToastQueue, setAchievementToastQueue] = useState<Achievement[]>([]);
    const [currentToast, setCurrentToast] = useState<Achievement | null>(null);

    const loadPlayerSymbols = useCallback(() => {
        try {
            const playerSymbolsJSON = localStorage.getItem('ticTacToePlayerSymbols');
            if (playerSymbolsJSON) {
                const parsed = JSON.parse(playerSymbolsJSON);
                if (parsed.P1 && parsed.P2) {
                    setPlayerSymbols(parsed);
                    return;
                }
            }
            const adminSymbolsJSON = localStorage.getItem('ticTacToeAdminSymbols');
            if (adminSymbolsJSON) {
                const parsed = JSON.parse(adminSymbolsJSON);
                if (parsed.P1 && parsed.P2) {
                    setPlayerSymbols(parsed);
                    return;
                }
            }
            setPlayerSymbols(DEFAULT_PLAYER_SYMBOLS);
        } catch (error) {
            console.error("Failed to load player symbols from localStorage", error);
            setPlayerSymbols(DEFAULT_PLAYER_SYMBOLS);
        }
    }, []);

    useEffect(() => {
        try {
            const savedProgress = localStorage.getItem('ticTacToeProgress');
            if (savedProgress) {
                const parsedProgress = JSON.parse(savedProgress);
                if (parsedProgress.easy && parsedProgress.medium && parsedProgress.hard) {
                    setHighestLevelUnlocked(parsedProgress);
                }
            }
        } catch (error) { console.error("Failed to load progress from localStorage", error); }

        loadPlayerSymbols();
        
        const onlineHandler = () => setIsOnline(true);
        const offlineHandler = () => setIsOnline(false);
        window.addEventListener('online', onlineHandler);
        window.addEventListener('offline', offlineHandler);
        window.addEventListener('symbolsChanged', loadPlayerSymbols);

        const timer = setTimeout(() => setViewState('modeSelection'), 2500);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('online', onlineHandler);
            window.removeEventListener('offline', offlineHandler);
            window.removeEventListener('symbolsChanged', loadPlayerSymbols);
        };
    }, [loadPlayerSymbols]);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
        } else if (gameMode === 'ai' && viewState === 'playing') {
             setShowSaveIndicator(true);
            if (saveIndicatorTimeoutRef.current) clearTimeout(saveIndicatorTimeoutRef.current);
            saveIndicatorTimeoutRef.current = window.setTimeout(() => setShowSaveIndicator(false), 2500);
             try {
                localStorage.setItem('ticTacToeProgress', JSON.stringify(highestLevelUnlocked));
            } catch (error) { console.error("Failed to save progress to localStorage", error); }
        }
        return () => { if (saveIndicatorTimeoutRef.current) clearTimeout(saveIndicatorTimeoutRef.current); };
    }, [highestLevelUnlocked, gameMode, viewState]);
    
    // --- Achievement Unlocking Effect ---
    useEffect(() => {
        // Don't check for achievements on the initial load/splash screen.
        if (viewState === 'loading') {
            return;
        }

        const { newlyUnlocked, updatedUnlocked } = achievementsService.checkAndUnlockAchievements(
            lifetimeStats,
            highestLevelUnlocked,
            unlockedAchievements
        );

        if (newlyUnlocked.length > 0) {
            setUnlockedAchievements(updatedUnlocked);
            achievementsService.saveUnlockedAchievements(updatedUnlocked);
            setAchievementToastQueue(q => [...q, ...newlyUnlocked]);
        }
    }, [lifetimeStats, highestLevelUnlocked, viewState, unlockedAchievements]);


    useEffect(() => {
        if (showFirstTimeLevelAd || showTimedAd || showLevelAd) playSound('notification');
    }, [showFirstTimeLevelAd, showTimedAd, showLevelAd]);
    
    // Process Achievement Toast Queue
    useEffect(() => {
        if (achievementToastQueue.length > 0 && !currentToast) {
            const [nextToast, ...rest] = achievementToastQueue;
            setCurrentToast(nextToast);
            playSound('win');
            setAchievementToastQueue(rest);
        }
    }, [achievementToastQueue, currentToast]);

    useEffect(() => {
        const clearTimer = () => { if (continuousPlayTimer.current) clearInterval(continuousPlayTimer.current); continuousPlayTimer.current = null; };
        if (viewState === 'playing') {
            clearTimer();
            continuousPlayTimer.current = window.setInterval(() => setShowTimedAd(true), 10 * 60 * 1000); // 10 minutes
        } else { clearTimer(); }
        return clearTimer;
    }, [viewState]);

    const handleLoginSuccess = () => {
        try { sessionStorage.setItem('isAdmin', 'true'); } catch (error) { console.error("Failed to save admin state", error); }
        setIsAdmin(true);
        setShowAdminLogin(false);
        setShowAdminPanel(true);
    };

    const handleSecretAdminTrigger = () => {
        const newClickCount = adminClickCount + 1;
        if (newClickCount === 1) {
            setAdminClickCount(1);
            if (adminClickTimer.current) clearTimeout(adminClickTimer.current);
            adminClickTimer.current = window.setTimeout(() => { setAdminClickCount(0); adminClickTimer.current = null; }, 3000);
        } else if (newClickCount < 5) {
            setAdminClickCount(newClickCount);
        } else {
            setAdminClickCount(0);
            if (adminClickTimer.current) { clearTimeout(adminClickTimer.current); adminClickTimer.current = null; }
            playSound('win');
            if (isAdmin) setShowAdminPanel(true);
            else setShowAdminLogin(true);
        }
    };
    
    const checkWinner = useCallback((currentBoard: BoardState): Winner => {
        const lines = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
        for (let i = 0; i < lines.length; i++) {
            const [a, b, c] = lines[i];
            if (currentBoard[a] && currentBoard[a] === currentBoard[b] && currentBoard[a] === currentBoard[c]) {
                return { player: currentBoard[a] as Player, line: lines[i] };
            }
        }
        return null;
    }, []);
    
    const handleGameEnd = useCallback((result: 'win' | 'loss' | 'draw', boardState: BoardState) => {
        if (gameMode !== 'ai' || !difficulty) return;
        
        const playerTurnCount = boardState.filter(p => p === 'P1').length;
        const updatedStats = statisticsService.updateStatsOnGameEnd(lifetimeStats, result, difficulty, playerTurnCount);
        setLifetimeStats(updatedStats);
        statisticsService.saveStatistics(updatedStats);
    }, [gameMode, difficulty, lifetimeStats]);
    
    const resetBoardForNewAttempt = useCallback(() => {
        setBoard(INITIAL_BOARD);
        setTurn('P1');
        setWinnerInfo(null);
        setIsDraw(false);
        setHintedSquare(null);
    }, []);

    const resetGameAndScores = useCallback(() => {
        resetBoardForNewAttempt();
        setScores(INITIAL_SCORES);
    }, [resetBoardForNewAttempt]);

    const handleSquareClick = (index: number) => {
        if (board[index] || winnerInfo || (gameMode === 'ai' && isAiThinking)) return;

        playSound('place');
        const newBoard = [...board];
        newBoard[index] = turn;
        setBoard(newBoard);
        setHintedSquare(null);

        const newWinnerInfo = checkWinner(newBoard);
        if (newWinnerInfo) {
            setWinnerInfo(newWinnerInfo);
            playSound('win');
            if (newWinnerInfo.player === 'P1') {
                setScores(s => ({ ...s, wins: s.wins + 1 }));
                if (gameMode === 'ai' && difficulty) {
                    setHighestLevelUnlocked(prev => ({
                        ...prev,
                        [difficulty]: Math.min(MAX_LEVELS, Math.max(prev[difficulty], currentLevel + 1))
                    }));
                    handleGameEnd('win', newBoard);
                }
            } else {
                setScores(s => ({ ...s, losses: s.losses + 1 }));
                if (gameMode === 'ai') handleGameEnd('loss', newBoard);
            }
        } else if (newBoard.every(square => square !== null)) {
            setIsDraw(true);
            playSound('draw');
            setScores(s => ({ ...s, draws: s.draws + 1 }));
            if (gameMode === 'ai') handleGameEnd('draw', newBoard);
        } else {
            setTurn(t => (t === 'P1' ? 'P2' : 'P1'));
        }
    };

    useEffect(() => {
        if (gameMode === 'ai' && turn === 'P2' && !winnerInfo && !isDraw && difficulty) {
            setIsAiThinking(true);
            const timer = setTimeout(async () => {
                try {
                    const move = await getAIMove(board, difficulty);
                    if (board[move] === null) {
                        playSound('place');
                        const newBoard = [...board];
                        newBoard[move] = 'P2';
                        setBoard(newBoard);
                        
                        const newWinnerInfo = checkWinner(newBoard);
                        if (newWinnerInfo) {
                            setWinnerInfo(newWinnerInfo);
                            playSound('lose');
                            setScores(s => ({ ...s, losses: s.losses + 1 }));
                            handleGameEnd('loss', newBoard);
                        } else if (newBoard.every(square => square !== null)) {
                            setIsDraw(true);
                            playSound('draw');
                            setScores(s => ({ ...s, draws: s.draws + 1 }));
                            handleGameEnd('draw', newBoard);
                        } else {
                            setTurn('P1');
                        }
                    }
                } catch (error) { console.error("Error getting AI move:", error); } 
                finally { setIsAiThinking(false); }
            }, 750);
            return () => clearTimeout(timer);
        }
    }, [gameMode, turn, board, winnerInfo, isDraw, difficulty, checkWinner, handleGameEnd]);
    
    useEffect(() => {
        if (gameMode === 'ai' && winnerInfo?.player === 'P1' && currentLevel > 0 && currentLevel % 5 === 0) {
            setShowLevelAd(true);
        }
    }, [winnerInfo, gameMode, currentLevel]);

    const setViewStateWithHistory = (newViewState: GameViewState) => {
        setPreviousViewState(viewState);
        setViewState(newViewState);
    };

    const handleSelectGameMode = (mode: GameMode) => {
        playSound('button');
        setGameMode(mode);
        if (mode === 'ai') setViewStateWithHistory('difficultySelection');
        else {
            resetGameAndScores();
            setViewStateWithHistory('playing');
        }
    };

    const handleSelectDifficulty = (selectedDifficulty: Difficulty) => {
        playSound('button');
        setDifficulty(selectedDifficulty);
        setViewStateWithHistory('levelSelection');
        try {
            if (!localStorage.getItem(`played_${selectedDifficulty}_before`)) {
                setShowFirstTimeLevelAd(true);
                localStorage.setItem(`played_${selectedDifficulty}_before`, 'true');
            }
        } catch(e) { console.error("Could not access localStorage for ad trigger"); }
    };
    
    const handleSelectLevel = (level: number) => {
        playSound('button');
        setCurrentLevel(level);
        resetGameAndScores();
        setViewStateWithHistory('playing');
    };
    
    const handleNextLevel = () => {
        playSound('button');
        setCurrentLevel(c => Math.min(MAX_LEVELS, c + 1));
        resetBoardForNewAttempt();
    }

    const handleToggleMute = () => {
        const newMuteState = toggleMuteState();
        setIsMuted(newMuteState);
        if (!newMuteState) playSound('button');
    };

    const handleHintRequest = () => {
        setShowRewardedAd(true);
        playSound('button');
    };
    
    const handleHintConfirm = async () => {
        setShowRewardedAd(false);
        setIsHintLoading(true);
        try {
            playSound('hint');
            const hintMove = await getHint(board);
            setHintedSquare(hintMove);
            const updatedStats = statisticsService.updateStatsOnHint(lifetimeStats);
            setLifetimeStats(updatedStats);
            statisticsService.saveStatistics(updatedStats);
        } catch(error) { console.error("Error getting hint:", error); } 
        finally {
            setIsHintLoading(false);
            setTimeout(() => setHintedSquare(null), 3000);
        }
    };
    
    const goBack = () => {
        playSound('button');
        if (viewState === 'profile') {
            setViewState(previousViewState);
        }
        else if (viewState === 'levelSelection') goBackToDifficultySelection();
        else if (viewState === 'difficultySelection') goBackToModeSelection();
        else if (viewState === 'playing' && gameMode === 'ai') goBackToLevelSelection();
        else if (viewState === 'playing' && gameMode === 'twoPlayer') goBackToModeSelection();
    };
    
    const goBackToLevelSelection = () => {
        resetGameAndScores();
        setViewStateWithHistory('levelSelection');
    };
    
    const goBackToDifficultySelection = () => {
        setDifficulty(null);
        resetGameAndScores();
        setViewStateWithHistory('difficultySelection');
    };

    const goBackToModeSelection = () => {
        setGameMode(null);
        setDifficulty(null);
        resetGameAndScores();
        setViewStateWithHistory('modeSelection');
    };

    const renderContent = () => {
        switch (viewState) {
            case 'loading':
                return <SplashScreen />;
            case 'modeSelection':
                return <GameModeSelection onSelectMode={handleSelectGameMode} onShowProfile={() => setViewStateWithHistory('profile')} />;
            case 'difficultySelection':
                return <DifficultySelection onSelectDifficulty={handleSelectDifficulty} onBack={goBackToModeSelection} />;
            case 'levelSelection':
                if (!difficulty) return null;
                return (
                    <LevelSelection
                        highestLevelUnlocked={highestLevelUnlocked[difficulty]}
                        onSelectLevel={handleSelectLevel}
                        totalLevels={MAX_LEVELS}
                        onBack={goBackToDifficultySelection}
                        difficulty={difficulty}
                    />
                );
            case 'profile':
                return <ProfileView stats={lifetimeStats} unlockedAchievements={unlockedAchievements} onBack={goBack} />;
            case 'playing':
                if (gameMode === 'ai' && !difficulty) return null;
                const isGameOver = !!winnerInfo || isDraw;
                const isPlayerWinner = winnerInfo?.player === 'P1';

                return (
                    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative selection:bg-cyan-400/20">
                        <div className="absolute top-4 left-4">
                            <button onClick={goBack} className="px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400">
                                {gameMode === 'ai' ? '← Levels' : '← Menu'}
                            </button>
                        </div>
                        {gameMode === 'ai' && (
                            <div className="absolute top-4 right-4 flex items-center gap-2 text-xl font-bold">
                                <span className="text-gray-400">Level {currentLevel}</span>
                            </div>
                        )}
                        <div className="flex flex-col items-center">
                            <GameStatus winnerInfo={winnerInfo} isDraw={isDraw} turn={turn} isAiThinking={isAiThinking} playerSymbols={playerSymbols} />
                            <Board board={board} onSquareClick={handleSquareClick} winnerInfo={winnerInfo} isAiThinking={isAiThinking} hintedSquare={hintedSquare} playerSymbols={playerSymbols} />
                            <div className="mt-6 flex flex-col items-center gap-4 w-full max-w-sm">
                                <Scoreboard scores={scores} gameMode={gameMode} />
                                <div className="flex gap-4">
                                     <button
                                        onClick={() => {
                                            if (!isGameOver) resetGameAndScores();
                                            else if (gameMode === 'ai') { if (isPlayerWinner) handleNextLevel(); else resetBoardForNewAttempt(); } 
                                            else resetGameAndScores();
                                        }}
                                        disabled={isAiThinking}
                                        className="w-36 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-75 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isGameOver ? (gameMode === 'ai' ? (isPlayerWinner ? 'Next Level' : 'Retry Level') : 'Play Again') : 'Restart'}
                                    </button>
                                     {gameMode === 'ai' && (
                                        <button onClick={handleHintRequest} disabled={isAiThinking || isGameOver || turn === 'P2' || isHintLoading} className="w-36 px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg shadow-lg hover:bg-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-75 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                                            {isHintLoading ? '...' : 'Hint'}
                                        </button>
                                     )}
                                </div>
                            </div>
                        </div>
                        <div className="absolute bottom-4 w-full px-4 max-w-lg">
                            <Ad type="bottom" />
                        </div>
                    </div>
                );
            default: return null;
        }
    };
    
    const openSettings = () => { playSound('button'); setShowSettingsModal(true); };

    return (
        <div className="relative min-h-screen bg-gray-900" onClick={handleSecretAdminTrigger}>
            {renderContent()}
            {showSaveIndicator && <ProgressSaveIndicator />}
            {currentToast && <AchievementToast achievement={currentToast} onComplete={() => setCurrentToast(null)} />}
            
            <div className="fixed bottom-5 right-5 z-20 flex items-center gap-4">
                <SettingsIcon onClick={openSettings} />
                <MuteButton isMuted={isMuted} onToggle={handleToggleMute} />
            </div>

            {showAdminLogin && <AdminLoginModal onClose={() => setShowAdminLogin(false)} onLoginSuccess={handleLoginSuccess} />}
            {showAdminPanel && <AdminPanelModal onClose={() => setShowAdminPanel(false)} />}
            {showSettingsModal && <SettingsModal onClose={() => setShowSettingsModal(false)} />}
            
            {(showFirstTimeLevelAd || showLevelAd || showTimedAd) && (
                <AdOverlay duration={5000} onComplete={() => {
                    setShowFirstTimeLevelAd(false);
                    setShowLevelAd(false);
                    setShowTimedAd(false);
                }} />
            )}
            
            {showRewardedAd && <RewardedAdOverlay onConfirm={handleHintConfirm} onClose={() => setShowRewardedAd(false)} />}
        </div>
    );
};

export default App;