
import React, { useState, useEffect, useRef } from 'react';
import * as db from '../services/dbService';
import { sounds as defaultSounds } from '../services/soundData';
import { playSound } from '../services/soundService';

interface SoundCustomizationModalProps {
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

const SoundCustomizationModal: React.FC<SoundCustomizationModalProps> = ({ onClose }) => {
  const [soundSettings, setSoundSettings] = useState<SoundInfo[]>([]);
  const [areSoundsLocked, setAreSoundsLocked] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const soundToChangeRef = useRef<keyof typeof defaultSounds | null>(null);

  useEffect(() => {
    try {
        const soundsLocked = localStorage.getItem('ticTacToeSoundsLocked') === 'true';
        setAreSoundsLocked(soundsLocked);
    } catch (error) {
        console.error("Failed to read sound lock state from localStorage", error);
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

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    const soundName = soundToChangeRef.current;

    if (!file || !soundName || areSoundsLocked) return;

    try {
        const arrayBuffer = await file.arrayBuffer();
        const customSound: db.CustomSound = {
          name: soundName,
          filename: file.name,
          data: arrayBuffer,
        };
        await db.saveSound(customSound);

        // Update UI
        setSoundSettings(prevSettings =>
          prevSettings.map(s =>
            s.name === soundName ? { ...s, currentFile: file.name, isCustom: true } : s
          )
        );
    } catch (error) {
        console.error("Failed to save custom sound", error);
    }


    // Reset the input so the same file can be selected again
    if(event.target) event.target.value = '';
    soundToChangeRef.current = null;
  };

  const handleChangeClick = (soundName: keyof typeof defaultSounds) => {
    if (areSoundsLocked) return;
    soundToChangeRef.current = soundName;
    fileInputRef.current?.click();
  };

  const handleResetClick = async (soundName: keyof typeof defaultSounds) => {
    if (areSoundsLocked) return;
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
          <h2 className="text-3xl font-black text-cyan-400">Customize Sounds</h2>
          <button
            onClick={() => {
                playSound('button');
                onClose();
            }}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Close sound settings"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <input
          type="file"
          accept="audio/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          disabled={areSoundsLocked}
        />

        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          {areSoundsLocked && <p className="text-yellow-400 bg-yellow-900/50 p-3 rounded-md mb-4 text-center">Sound settings are locked by an admin.</p>}
          {soundSettings.map(sound => (
            <div key={sound.name} className="bg-gray-900/50 p-4 rounded-lg flex items-center justify-between">
              <div>
                <p className="font-bold text-lg">{sound.displayName}</p>
                <p className="text-gray-400 text-sm truncate max-w-[150px] sm:max-w-[200px]">{sound.currentFile}</p>
              </div>
              <div className="flex items-center gap-2">
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
                  onClick={() => handleChangeClick(sound.name)}
                  className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-500 transition-colors focus:outline-none focus:ring-2 focus:ring-green-400 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label={`Change ${sound.displayName} sound`}
                  disabled={areSoundsLocked}
                >
                  Change
                </button>
                {sound.isCustom && (
                  <button
                    onClick={() => handleResetClick(sound.name)}
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

        <p className="text-center text-gray-500 mt-6 text-sm">Your custom sounds are saved in your browser and will be used automatically.</p>
      </div>
    </div>
  );
};

export default SoundCustomizationModal;
