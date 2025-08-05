// A simple service to play sounds for different game events.
import { sounds } from './soundData';
import * as db from './dbService';

// --- Mute State Management ---
let isMuted = false;
try {
    // Check localStorage for the user's saved preference.
    isMuted = localStorage.getItem('ticTacToeMuted') === 'true';
} catch (e) {
    console.error("Could not read mute state from localStorage", e);
}

/**
 * Gets the current mute state.
 * @returns {boolean} - True if the sound is muted, false otherwise.
 */
export const getMuteState = (): boolean => {
    return isMuted;
};

/**
 * Toggles the mute state and saves it to localStorage.
 * @returns {boolean} - The new mute state.
 */
export const toggleMuteState = (): boolean => {
    isMuted = !isMuted;
    try {
        localStorage.setItem('ticTacToeMuted', String(isMuted));
    } catch (e) {
        console.error("Could not save mute state to localStorage", e);
    }
    return isMuted;
};

// --- Single Audio Instance for Playback ---
// A single Audio element to prevent sound overlap.
const audio = new Audio();
let currentObjectURL: string | null = null; // To track blob URLs for revocation

/**
 * Plays a sound if audio is not muted, stopping any currently playing sound.
 * It first checks IndexedDB for a custom sound, and falls back to the default if not found.
 * @param {keyof typeof sounds} soundName - The name of the sound to play.
 */
export const playSound = (soundName: keyof typeof sounds) => {
    if (isMuted) {
        return;
    }
    
    // This is a fire-and-forget async function to avoid blocking the UI thread
    (async () => {
        try {
            // Stop any currently playing sound
            if (!audio.paused) {
                audio.pause();
                audio.currentTime = 0;
            }

            // Revoke the previous object URL if it exists to prevent memory leaks
            if (currentObjectURL) {
                URL.revokeObjectURL(currentObjectURL);
                currentObjectURL = null;
            }

            const customSound = await db.getSound(soundName);
            let soundSrc: string;

            if (customSound && customSound.data) {
                const blob = new Blob([customSound.data]);
                soundSrc = URL.createObjectURL(blob);
                currentObjectURL = soundSrc; // Keep track of the new blob URL
            } else {
                soundSrc = sounds[soundName];
            }
            
            audio.src = soundSrc;
            
            await audio.play().catch(e => {
                // This can happen if the user hasn't interacted with the page yet.
                // It's usually safe to ignore these errors.
                console.warn(`Could not play sound '${soundName}':`, e);
            });

        } catch (error) {
            console.error(`Error playing sound '${soundName}'. Falling back to default.`, error);
            // Fallback play logic just in case
            try {
                audio.src = sounds[soundName];
                await audio.play().catch(e => console.warn(`Fallback sound play failed for '${soundName}':`, e));
            } catch (fallbackError) {
                console.error("Critical error in fallback sound play:", fallbackError);
            }
        }
    })();
};
