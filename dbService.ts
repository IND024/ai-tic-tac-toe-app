
import { openDB } from 'idb';
import type { IDBPDatabase } from 'idb';

const DB_NAME = 'ai-tic-tac-toe-sounds';
const DB_VERSION = 1;
const STORE_NAME = 'customSounds';

export interface CustomSound {
    name: string;
    filename: string;
    data: ArrayBuffer;
}

/**
 * services/dbService.ts
 *
 * This service manages the IndexedDB storage for custom sounds.
 *
 * It is designed for resilience:
 * 1. No Singleton Connection: It does not use a single, shared database connection
 *    promise. Instead, `getDB()` is called for each operation. This prevents a
 *    single transient connection failure from making the database inaccessible for
 *    the entire session. The `idb` library efficiently manages underlying connections.
 * 2. Safe Upgrades: The `upgrade` callback in `getDB` is written defensively.
 *    It only creates the object store if it doesn't already exist, ensuring that
 *    future database version bumps won't accidentally delete user data.
 * 3. Data Persistence: IndexedDB is a persistent client-side storage. Data saved
 *    here by the admin will survive browser restarts, system updates, and updates
 *    to the application's cached files (via the service worker). It is only
 *    cleared if the user manually clears their site data.
 */

/**
 * Initializes and opens a connection to the IndexedDB database.
 * @returns {Promise<IDBPDatabase>} A promise that resolves to the database instance.
 */
const getDB = (): Promise<IDBPDatabase> => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'name' });
      }
    },
  });
};

export const saveSound = async (sound: CustomSound): Promise<void> => {
  const db = await getDB();
  await db.put(STORE_NAME, sound);
};

export const getSound = async (name: string): Promise<CustomSound | undefined> => {
  const db = await getDB();
  return db.get(STORE_NAME, name);
};

export const getAllSounds = async (): Promise<CustomSound[]> => {
    const db = await getDB();
    return db.getAll(STORE_NAME);
}

export const deleteSound = async (name: string): Promise<void> => {
  const db = await getDB();
  await db.delete(STORE_NAME, name);
};

export const clearAllSounds = async (): Promise<void> => {
    const db = await getDB();
    await db.clear(STORE_NAME);
};
