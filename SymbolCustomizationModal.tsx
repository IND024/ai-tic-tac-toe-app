
import React, { useState, useEffect, useRef } from 'react';
import type { FC } from 'react';
import type { PlayerSymbols } from '../types';
import { playSound } from '../services/soundService';

interface SymbolCustomizationModalProps {
  onClose: () => void;
}

const DEFAULT_PLAYER_SYMBOLS: PlayerSymbols = { 
    P1: { type: 'text', value: 'X' }, 
    P2: { type: 'text', value: 'O' } 
};

const SymbolCustomizationModal: FC<SymbolCustomizationModalProps> = ({ onClose }) => {
  const [playerSymbols, setPlayerSymbols] = useState<PlayerSymbols>(DEFAULT_PLAYER_SYMBOLS);
  const [areSymbolsLocked, setAreSymbolsLocked] = useState(false);
  const [symbolError, setSymbolError] = useState('');
  const p1ImageInputRef = useRef<HTMLInputElement | null>(null);
  const p2ImageInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    let loadedSymbols: PlayerSymbols | null = null;
    try {
        const symbolsLocked = localStorage.getItem('ticTacToeSymbolsLocked') === 'true';
        setAreSymbolsLocked(symbolsLocked);
        
        // Priority 1: Player's own customized symbols
        const playerSymbolsJSON = localStorage.getItem('ticTacToePlayerSymbols');
        if (playerSymbolsJSON) {
            const parsed = JSON.parse(playerSymbolsJSON);
            if (parsed.P1 && parsed.P2) loadedSymbols = parsed;
        }

        // Priority 2: Admin-defined global symbols (if no player symbols)
        if (!loadedSymbols) {
            const adminSymbolsJSON = localStorage.getItem('ticTacToeAdminSymbols');
            if (adminSymbolsJSON) {
                const parsed = JSON.parse(adminSymbolsJSON);
                if (parsed.P1 && parsed.P2) loadedSymbols = parsed;
            }
        }
        
        if (loadedSymbols) {
            setPlayerSymbols(loadedSymbols);
        } else {
            // Priority 3: Fallback to default
            setPlayerSymbols(DEFAULT_PLAYER_SYMBOLS);
        }

    } catch (error) {
        console.error("Failed to read symbol settings from localStorage", error);
        setPlayerSymbols(DEFAULT_PLAYER_SYMBOLS);
    }
  }, []);

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
    if (p1.type === 'text' && p2.type === 'text' && p1.value.trim().toUpperCase() === p2.value.trim().toUpperCase()) {
        setSymbolError("Player text symbols must be different.");
        playSound('lose');
        return;
    }

    try {
        // Player settings only save to the player-specific key
        localStorage.setItem('ticTacToePlayerSymbols', JSON.stringify(playerSymbols));
        window.dispatchEvent(new Event('symbolsChanged'));
        setSymbolError('');
        playSound('win');
    } catch(e) {
        console.error("Failed to save symbols to localStorage", e);
        setSymbolError("Could not save symbols.");
        playSound('lose');
    }
  };

  const handleResetSymbols = () => {
    // Reset only removes the player's override, reverting to admin/default
    try {
        localStorage.removeItem('ticTacToePlayerSymbols');
        window.dispatchEvent(new Event('symbolsChanged'));
        setSymbolError('');
        playSound('button');
        // The useEffect will re-run on next open and load admin/default symbols
        onClose(); // Close the modal to show the effect
    } catch(e) {
        console.error("Failed to remove symbols from localStorage", e);
        playSound('lose');
    }
  };

  const handleToggleSymbolsLock = () => {
    const newLockState = !areSymbolsLocked;
    setAreSymbolsLocked(newLockState);
    try {
        localStorage.setItem('ticTacToeSymbolsLocked', String(newLockState));
        playSound('button');
    } catch (error) {
        console.error("Failed to save symbol lock state to localStorage", error);
        playSound('lose');
    }
  };
  
  const SymbolInput: FC<{ player: 'P1' | 'P2' }> = ({ player }) => {
      const symbol = playerSymbols[player];
      const colorClass = player === 'P1' ? 'cyan' : 'amber';
      const inputRef = player === 'P1' ? p1ImageInputRef : p2ImageInputRef;
      
      return (
        <div className="bg-gray-900/70 p-4 rounded-lg">
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

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <style>{'.animate-fade-in { animation: fadeIn 0.3s ease-in-out; } @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }'}</style>
      <div
        className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 w-full max-w-lg p-6 text-white transform transition-all"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-black text-amber-400">Player Symbol Customization</h2>
          <button
            onClick={() => {
                playSound('button');
                onClose();
            }}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Close symbol settings"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            {symbolError && <p className="text-red-500 bg-red-900/50 p-3 rounded-md mb-4">{symbolError}</p>}
            {areSymbolsLocked && <p className="text-yellow-400 bg-yellow-900/50 p-3 rounded-md mb-4 text-center">Your symbol settings are locked. Unlock them to make changes.</p>}
            
            <div className="space-y-4">
                <SymbolInput player="P1" />
                <SymbolInput player="P2" />
            </div>

            <div className="mt-6 border-t border-gray-700/50 pt-4 flex flex-wrap gap-4 justify-end">
                <button onClick={handleResetSymbols} disabled={areSymbolsLocked} className="px-4 py-2 bg-yellow-600 text-white font-semibold rounded-lg shadow-md hover:bg-yellow-500 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed">Reset to Default</button>
                <button onClick={handleSaveSymbols} disabled={areSymbolsLocked} className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-500 transition-colors focus:outline-none focus:ring-2 focus:ring-green-400 disabled:opacity-50 disabled:cursor-not-allowed">Save My Symbols</button>
            </div>

            <div className="mt-6 border-t border-gray-700 pt-4">
                <button
                    onClick={handleToggleSymbolsLock}
                    className={`w-full px-6 py-3 text-white font-semibold rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-opacity-75 transition-colors duration-200 flex items-center justify-center gap-3 ${
                        areSymbolsLocked 
                            ? 'bg-red-600 hover:bg-red-500 focus:ring-red-400' 
                            : 'bg-indigo-600 hover:bg-indigo-500 focus:ring-indigo-400'
                    }`}
                    aria-label={areSymbolsLocked ? "Unlock your symbol settings to make changes" : "Lock your current symbol settings to prevent changes"}
                >
                    {areSymbolsLocked ? "Unlock My Settings" : "Lock My Settings"}
                </button>
                <p className="text-center text-gray-500 text-sm mt-2">
                    {areSymbolsLocked ? "Unlock to edit your symbols." : "Locking prevents you from accidentally changing your symbols."}
                </p>
            </div>
        </div>
        
        <p className="text-center text-gray-500 mt-6 text-sm">Your custom symbols are saved in your browser and will override the admin's default settings.</p>
      </div>
    </div>
  );
};

export default SymbolCustomizationModal;
