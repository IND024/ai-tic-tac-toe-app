
import React, { useState } from 'react';
import { playSound } from '../services/soundService';
import SymbolCustomizationModal from './SymbolCustomizationModal';

interface SettingsModalProps {
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const [activeView, setActiveView] = useState<'main' | 'symbols'>('main');

  // If the user clicks to customize symbols, show that specific modal.
  // When that modal is closed, the main `onClose` is called, closing the entire settings flow.
  if (activeView === 'symbols') {
    return <SymbolCustomizationModal onClose={onClose} />;
  }

  // Otherwise, show the main settings menu.
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
    >
      <style>{'.animate-fade-in { animation: fadeIn 0.3s ease-in-out; } @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }'}</style>
      <div
        className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 w-full max-w-md p-6 text-white transform transition-all"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 id="settings-title" className="text-3xl font-black text-indigo-400">Settings</h2>
          <button
            onClick={() => {
                playSound('button');
                onClose();
            }}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Close settings"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="space-y-4">
          <button
            onClick={() => {
              playSound('button');
              setActiveView('symbols');
            }}
            className="w-full p-6 bg-gray-900/70 rounded-lg text-left hover:bg-gray-900 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
            aria-label="Open Player Symbol Customization"
          >
            <h3 className="text-2xl font-bold text-amber-400">Player Symbol Customization</h3>
            <p className="text-gray-300 mt-1">Change the look of 'X' and 'O' with text or images.</p>
          </button>
        </div>

        <p className="text-center text-gray-500 mt-6 text-sm">Sound settings can be changed via the Admin Panel.</p>
        
      </div>
    </div>
  );
};

export default SettingsModal;
