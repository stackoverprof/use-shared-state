/**
 * Debug and utility functions for shared state management
 */

import { sharedState } from "./state";
import { storage } from "./storage";
import { isPersistentKey } from "./utils";
import { LOCALSTORAGE_PREFIX } from "./types";

/**
 * Get all persistent keys from localStorage
 */
const getPersistentKeysFromStorage = (): string[] => {
    const keys: string[] = [];
    try {
        for (let i = 0; i < localStorage.length; i++) {
            const storageKey = localStorage.key(i);
            if (storageKey?.startsWith(LOCALSTORAGE_PREFIX)) {
                // Convert back to original key format (@key)
                const originalKey = `@${storageKey.slice(
                    LOCALSTORAGE_PREFIX.length
                )}`;
                keys.push(originalKey);
            }
        }
    } catch {
        // Handle localStorage access errors
    }
    return keys;
};

/**
 * Utility functions for debugging and state management
 */
export const sharedStateUtils = {
    /** Get current state map (for debugging) */
    getState: () => sharedState,

    /** Get all current keys */
    getKeys: () => Array.from(sharedState.keys()),

    /** Get state size */
    getSize: () => sharedState.size,

    /** Clear all state */
    clear: (includePersistent = false) => {
        if (includePersistent) {
            getPersistentKeysFromStorage().forEach(storage.remove);
        }
        sharedState.clear();
    },

    /** Delete specific key */
    delete: (key: string) => {
        sharedState.delete(key);
        if (isPersistentKey(key)) {
            storage.remove(key);
        }
    },

    /** Get all persistent keys from localStorage */
    getPersistentKeys: () => getPersistentKeysFromStorage(),
};
