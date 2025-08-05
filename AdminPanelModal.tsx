
import React, { useState, useEffect, useRef } from 'react';
import * as db from '../services/dbService';
import { sounds as defaultSounds } from '../services/soundData';
import { playSound } from '../services/soundService';
import { PlayerSymbols, PlayerSymbol } from '../types';

interface AdminPanelModalProps {
  onClose: () => void;
}

type SoundInfo = {
  name: keyof typeof defaultSounds;
  displayName: string;
  currentFile: string;
  isCustom: boolean;
};

const soundDisplayNames: Record<keyof typeof defaultSounds, string> = {
  button: 'Button Click',
  place: 'Place Piece',
  win: 'Win Game',
  lose: 'Lose Game',
  draw: 'Draw Game',
  notification: 'Notification',
  hint: 'Hint Request',
};

const DEFAULT_PLAYER_SYMBOLS: PlayerSymbols = { 
    P1: { type: 'text', value: 'X' }, 
    P2: { type: 'text', value: 'O' } 
};

const AdminPanelModal: React.FC<AdminPanelModalProps> = ({ onClose }) => {
  const [activeView, setActiveView] = useState<'main' | 'symbols' | 'sounds'>('main');
  const [soundSettings, setSoundSettings] = useState<SoundInfo[]>([]);
  const [areSoundsLocked, setAreSoundsLocked] = useState(false);
  const soundFileInputRef = useRef<HTMLInputElement | null>(null);
  const soundToChangeRef = useRef<keyof typeof defaultSounds | null>(null);

  // State for Player Symbol Customization
  const [playerSymbols, setPlayerSymbols] = useState<PlayerSymbols>(DEFAULT_PLAYER_SYMBOLS);
  const [areSymbolsLocked, setAreSymbolsLocked] = useState(false);
  const [symbolError, setSymbolError] = useState('');
  const p1ImageInputRef = useRef<HTMLInputElement | null>(null);
  const p2ImageInputRef = useRef<HTMLInputElement | null>(null);


  useEffect(() => {
    // Load lock state from localStorage for sounds
    try {
        const soundsLocked = localStorage.getItem('ticTacToeSoundsLocked') === 'true';
        setAreSoundsLocked(soundsLocked);
    } catch (error) {
        console.error("Failed to read sound lock state from localStorage", error);
    }

    // Load lock state and symbols from localStorage for admin symbol settings
    try {
        const symbolsLocked = localStorage.getItem('ticTacToeAdminSymbolsLocked') === 'true';
        setAreSymbolsLocked(symbolsLocked);
        const savedSymbols = localStorage.getItem('ticTacToeAdminSymbols');
        if (savedSymbols) {
            const parsed = JSON.parse(savedSymbols);
            if (parsed.P1 && parsed.P2) {
               setPlayerSymbols(parsed);
            }
        }
    } catch (error) {
        console.error("Failed to read admin symbol settings from localStorage", error);
    }
    
    const loadSounds = async () => {
      try {
        const customSounds = await db.getAllSounds();
        const customSoundsMap = new Map(customSounds.map(s => [s.name, s.filename]));

        const newSettings = (Object.keys(defaultSounds) as Array<keyof typeof defaultSounds>).map(soundName => {
          const customFilename = customSoundsMap.get(soundName);
          return {
            name: soundName,
            displayName: soundDisplayNames[soundName],
            currentFile: customFilename || 'Default',
            isCustom: !!customFilename,
          };
        });
        setSoundSettings(newSettings);
      } catch (error) {
        console.error("Failed to load custom sounds from DB", error);
      }
    };

    loadSounds();
  }, []);

  const handleToggleSoundsLock = () => {
    const newLockState = !areSoundsLocked;
    setAreSoundsLocked(newLockState);
    try {
        localStorage.setItem('ticTacToeSoundsLocked', String(newLockState));
        playSound('button');
    } catch (error) {
        console.error("Failed to save lock state to localStorage", error);
        playSound('lose');
    }
  };


  const handleSoundFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    const soundName = soundToChangeRef.current;

    if (!file || !soundName) return;

    try {
        const arrayBuffer = await file.arrayBuffer();
        const customSound: db.CustomSound = {
          name: soundName,
          filename: file.name,
          data: arrayBuffer,
        };
        await db.saveSound(customSound);
        setSoundSettings(prevSettings =>
          prevSettings.map(s =>
            s.name === soundName ? { ...s, currentFile: file.name, isCustom: true } : s
          )
        );
        playSound('win');
    } catch (error) {
        console.error("Failed to save custom sound", error);
        playSound('lose');
    }

    if(event.target) event.target.value = '';
    soundToChangeRef.current = null;
  };

  const handleChangeSoundClick = (soundName: keyof typeof defaultSounds) => {
    soundToChangeRef.current = soundName;
    soundFileInputRef.current?.click();
  };

  const handleResetSoundClick = async (soundName: keyof typeof defaultSounds) => {
    try {
        await db.deleteSound(soundName);
        setSoundSettings(prevSettings =>
          prevSettings.map(s =>
            s.name === soundName ? { ...s, currentFile: 'Default', isCustom: false } : s
          )
        );
         playSound('button');
    } catch (error) {
        console.error("Failed to reset sound", error);
    }
  };
  
  const handleResetAllSounds = async () => {
    const isConfirmed = window.confirm("Are you sure you want to reset ALL sounds to their default settings? This action cannot be undone.");
    if (isConfirmed) {
        try {
            await db.clearAllSounds();
            setSoundSettings(prevSettings => 
                prevSettings.map(s => ({
                    ...s,
                    currentFile: 'Default',
                    isCustom: false,
                }))
            );
            playSound('win');
        } catch (error) {
            console.error("Failed to reset all sounds", error);
            playSound('lose');
        }
    }
  };

  // --- Handlers for Player Symbol Customization ---

  const handleSymbolTextChange = (player: 'P1' | 'P2', value: string) => {
    setPlayerSymbols(prev => ({
        ...prev,
        [player]: { type: 'text', value: value }
    }));
  };
  
  const handleSymbolImageChange = (event: React.ChangeEvent<HTMLInputElement>, player: 'P1' | 'P2') => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
          const result = e.target?.result;
          if (typeof result === 'string') {
              setPlayerSymbols(prev => ({
                  ...prev,
                  [player]: { type: 'image', value: result }
              }));
          }
      };
      reader.readAsDataURL(file);
      if(event.target) event.target.value = '';
  };

  const handleSaveSymbols = () => {
    const p1 = playerSymbols.P1;
    const p2 = playerSymbols.P2;

    if (!p1.value.trim() || !p2.value.trim()) {
        setSymbolError("Symbols cannot be empty.");
        playSound('lose');
        return;
    }
    if (p1.value === p2.value) {
        setSymbolError("Player symbols must be different.");
        playSound('lose');
        return;
    }

    try {
        localStorage.setItem('ticTacToeAdminSymbols', JSON.stringify(playerSymbols));
        window.dispatchEvent(new Event('symbolsChanged'));
        setSymbolError('');
        playSound('win');
    } catch(e) {
        console.error("Failed to save global symbols to localStorage", e);
        setSymbolError("Could not save global symbols.");
        playSound('lose');
    }
  };

  const handleResetSymbols = () => {
    setPlayerSymbols(DEFAULT_PLAYER_SYMBOLS);
    try {
        localStorage.removeItem('ticTacToeAdminSymbols');
        window.dispatchEvent(new Event('symbolsChanged'));
        setSymbolError('');
        playSound('button');
    } catch(e) {
        console.error("Failed to remove global symbols from localStorage", e);
        playSound('lose');
    }
  };
  
  const handleToggleSymbolsLock = () => {
    const newLockState = !areSymbolsLocked;
    setAreSymbolsLocked(newLockState);
    try {
        localStorage.setItem('ticTacToeAdminSymbolsLocked', String(newLockState));
        playSound('button');
    } catch (error) {
        console.error("Failed to save global symbol lock state to localStorage", error);
        playSound('lose');
    }
  };

  const SymbolInput: React.FC<{ player: 'P1' | 'P2' }> = ({ player }) => {
      const symbol = playerSymbols[player];
      const colorClass = player === 'P1' ? 'cyan' : 'amber';
      const inputRef = player === 'P1' ? p1ImageInputRef : p2ImageInputRef;
      
      return (
        <div className="bg-gray-800 p-4 rounded-lg">
            <label className={`font-bold text-lg text-${colorClass}-400 mb-2 block`}>Player {player === 'P1' ? 1 : 2} {player === 'P2' ? '(AI)' : ''} Symbol</label>
            <div className="flex items-center gap-4">
                <div className={`w-28 h-28 bg-gray-900/50 rounded-lg flex items-center justify-center border-2 border-${colorClass}-400/50`}>
                    {symbol.type === 'image' ? (
                        <img src={symbol.value} alt="Symbol Preview" className="w-full h-full object-contain p-1" />
                    ) : (
                        <span className={`text-7xl font-bold text-${colorClass}-400`}>{symbol.value}</span>
                    )}
                </div>
                <div className="flex-grow space-y-2">
                     <input
                        type="text"
                        value={symbol.type === 'text' ? symbol.value : ''}
                        onChange={(e) => handleSymbolTextChange(player, e.target.value)}
                        maxLength={2}
                        disabled={areSymbolsLocked}
                        placeholder="Type symbol"
                        className={`w-full p-2 bg-gray-700 border-2 border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-${colorClass}-400 disabled:opacity-50 disabled:cursor-not-allowed`}
                    />
                    <input type="file" accept="image/*" ref={inputRef} onChange={(e) => handleSymbolImageChange(e, player)} className="hidden" />
                    <button onClick={() => inputRef.current?.click()} disabled={areSymbolsLocked} className={`w-full px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-${colorClass}-400 disabled:opacity-50 disabled:cursor-not-allowed`}>Upload Image</button>
                </div>
            </div>
        </div>
      );
  };

  const MainView = () => (
      <div className="p-8 space-y-6">
          <p className="text-center text-gray-400">Select a category to customize.</p>
          <button
              onClick={() => { playSound('button'); setActiveView('symbols'); }}
              className="w-full p-6 bg-gray-900/70 rounded-lg text-left hover:bg-gray-900 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
              <h3 className="text-2xl font-bold text-amber-400">Global Symbol Customization</h3>
              <p className="text-gray-300 mt-1">Set the default symbols for all players.</p>
          </button>
          <button
              onClick={() => { playSound('button'); setActiveView('sounds'); }}
              className="w-full p-6 bg-gray-900/70 rounded-lg text-left hover:bg-gray-900 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          >
              <h3 className="text-2xl font-bold text-cyan-400">Global Sound Customization</h3>
              <p className="text-gray-300 mt-1">Upload custom sounds for game events for all players.</p>
          </button>
      </div>
  );

  const DetailViewContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="p-6">
      <button
          onClick={() => { playSound('button'); setActiveView('main'); }}
          className="mb-6 px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 flex items-center gap-2"
          aria-label="Back to Admin Panel"
      >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back to Panel</span>
      </button>
      <div className="max-h-[60vh] overflow-y-auto pr-2">
        {children}
      </div>
    </div>
  );


  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-panel-title"
    >
      <style>{'.animate-fade-in { animation: fadeIn 0.3s ease-in-out; } @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }'}</style>
      <div
        className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 w-full max-w-2xl text-white transform transition-all"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <h2 id="admin-panel-title" className="text-3xl font-black text-indigo-400">
            {activeView === 'main' && 'Admin Panel'}
            {activeView === 'symbols' && 'Global Symbol Customization'}
            {activeView === 'sounds' && 'Global Sound Customization'}
          </h2>
          <button
            onClick={() => {
                playSound('button');
                onClose();
            }}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Close admin panel"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {activeView === 'main' && <MainView />}

        {(activeView === 'symbols' || activeView === 'sounds') && (
            <DetailViewContainer>
                 {activeView === 'symbols' && (
                    <div className="space-y-4">
                        <div className="bg-gray-900/70 p-4 rounded-lg">
                            {symbolError && <p className="text-red-500 bg-red-900/50 p-3 rounded-md mb-4">{symbolError}</p>}
                            <div className="space-y-4">
                               <SymbolInput player="P1" />
                               <SymbolInput player="P2" />
                            </div>
                             <div className="mt-6 border-t border-gray-700/50 pt-4 flex flex-wrap gap-4 justify-end">
                                <button onClick={handleResetSymbols} disabled={areSymbolsLocked} className="px-4 py-2 bg-yellow-600 text-white font-semibold rounded-lg shadow-md hover:bg-yellow-500 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed">Reset Global Symbols</button>
                                <button onClick={handleSaveSymbols} disabled={areSymbolsLocked} className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-500 transition-colors focus:outline-none focus:ring-2 focus:ring-green-400 disabled:opacity-50 disabled:cursor-not-allowed">Save Global Symbols</button>
                            </div>
                             <div className="mt-6 border-t border-gray-700 pt-6">
                                <button
                                    onClick={handleToggleSymbolsLock}
                                    className={`w-full px-6 py-3 text-white font-semibold rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-opacity-75 transition-colors duration-200 flex items-center justify-center gap-3 ${
                                        areSymbolsLocked 
                                            ? 'bg-red-600 hover:bg-red-500 focus:ring-red-400' 
                                            : 'bg-indigo-600 hover:bg-indigo-500 focus:ring-indigo-400'
                                    }`}
                                    aria-label={areSymbolsLocked ? "Unlock global symbol settings for all users" : "Lock global symbol settings for all users"}
                                >
                                    {areSymbolsLocked ? "Unlock Global Settings" : "Lock Global Settings"}
                                </button>
                                <p className="text-center text-gray-500 text-sm mt-2">
                                    When locked, no admin can change the global symbols. Players can still set their own.
                                </p>
                             </div>
                        </div>
                        <p className="text-center text-gray-500 text-sm">Global symbols are the default for all players unless they set their own.</p>
                    </div>
                 )}
                 {activeView === 'sounds' && (
                    <div className="space-y-4">
                        <div className="bg-gray-900/70 p-4 rounded-lg">
                            <input
                                type="file"
                                accept="audio/*"
                                ref={soundFileInputRef}
                                onChange={handleSoundFileChange}
                                className="hidden"
                                disabled={areSoundsLocked}
                            />
                            <div className="space-y-4">
                            {soundSettings.map(sound => (
                                <div key={sound.name} className="bg-gray-800 p-4 rounded-lg flex items-center justify-between flex-wrap gap-3">
                                <div className="flex-shrink-0">
                                    <p className="font-bold text-lg">{sound.displayName}</p>
                                    <p className="text-gray-400 text-sm truncate max-w-[150px] sm:max-w-[200px]">{sound.currentFile}</p>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <button 
                                        onClick={() => playSound(sound.name)} 
                                        className="p-2 rounded-full bg-indigo-600 hover:bg-indigo-500 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                        aria-label={`Play ${sound.displayName} sound`}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => handleChangeSoundClick(sound.name)}
                                        className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-500 transition-colors focus:outline-none focus:ring-2 focus:ring-green-400 disabled:opacity-50 disabled:cursor-not-allowed"
                                        aria-label={`Change ${sound.displayName} sound`}
                                        disabled={areSoundsLocked}
                                    >
                                    Change
                                    </button>
                                    {sound.isCustom && (
                                    <button
                                        onClick={() => handleResetSoundClick(sound.name)}
                                        className="p-2 rounded-full bg-red-600 hover:bg-red-500 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
                                        aria-label={`Reset ${sound.displayName} sound to default`}
                                        disabled={areSoundsLocked}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                    )}
                                </div>
                                </div>
                            ))}
                            </div>
                            <div className="mt-6 border-t border-gray-700 pt-6 space-y-4">
                                <button
                                    onClick={handleToggleSoundsLock}
                                    className={`w-full px-6 py-3 text-white font-semibold rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-opacity-75 transition-colors duration-200 flex items-center justify-center gap-3 ${
                                        areSoundsLocked 
                                            ? 'bg-red-600 hover:bg-red-500 focus:ring-red-400' 
                                            : 'bg-indigo-600 hover:bg-indigo-500 focus:ring-indigo-400'
                                    }`}
                                    aria-label={areSoundsLocked ? "Unlock sound settings to make changes" : "Lock current sound settings"}
                                >
                                    {areSoundsLocked ? (
                                        <>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                            <span>Unlock Sound Settings</span>
                                        </>
                                    ) : (
                                         <>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                                            </svg>
                                            <span>Lock Sound Settings</span>
                                        </>
                                    )}
                                </button>
                                <p className="text-center text-gray-500 text-sm -mt-2">
                                    {areSoundsLocked ? "Settings are protected. Unlock to edit." : "Locking prevents accidental changes or resets."}
                                </p>

                                <button
                                    onClick={handleResetAllSounds}
                                    className="w-full px-6 py-3 bg-red-800 text-white font-semibold rounded-lg shadow-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75 transition-colors duration-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                                    aria-label="Reset all sounds to default"
                                    disabled={areSoundsLocked}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                       <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    <span>Reset All Sounds to Default</span>
                                </button>
                            </div>
                        </div>
                        <p className="text-center text-gray-500 text-sm">Custom sounds are saved in your browser and will be used automatically.</p>
                    </div>
                 )}
            </DetailViewContainer>
        )}
      </div>
    </div>
  );
};

export default AdminPanelModal;
