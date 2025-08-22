/**
 * localStorage operations with error handling and cross-tab synchronization
 */

import { getLocalStorageKey, safeJsonParse, safeJsonStringify } from "./utils";

/**
 * Storage operations wrapper with comprehensive error handling
 */
export const storage = {
    /**
     * Get value from localStorage with error handling
     */
    get: (key: string): unknown => {
        try {
            const storageKey = getLocalStorageKey(key);
            const stored = localStorage.getItem(storageKey);
            return stored ? safeJsonParse(stored) : undefined;
        } catch {
            return undefined;
        }
    },

    /**
     * Set value in localStorage with cross-tab synchronization
     */
    set: (key: string, value: unknown): void => {
        try {
            const storageKey = getLocalStorageKey(key);
            const serialized = safeJsonStringify(value);
            localStorage.setItem(storageKey, serialized);

            // Notify other tabs
            window.dispatchEvent(
                new StorageEvent("storage", {
                    key: storageKey,
                    newValue: serialized,
                    storageArea: localStorage,
                })
            );
        } catch (error) {
            console.warn(`Failed to persist value for key "${key}":`, error);
        }
    },

    /**
     * Remove value from localStorage with error handling
     */
    remove: (key: string): void => {
        try {
            const storageKey = getLocalStorageKey(key);
            localStorage.removeItem(storageKey);
        } catch {
            // Ignore removal errors
        }
    },
};
