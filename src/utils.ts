/**
 * Pure utility functions for key manipulation and JSON operations
 */

import { PERSISTENT_KEY_PREFIX, LOCALSTORAGE_PREFIX } from "./types";

/**
 * Check if a key should be persisted to localStorage
 */
export const isPersistentKey = (key: string): boolean =>
    key.startsWith(PERSISTENT_KEY_PREFIX);

/**
 * Generate localStorage key from shared state key
 */
export const getLocalStorageKey = (key: string): string =>
    isPersistentKey(key) ? `${LOCALSTORAGE_PREFIX}${key.slice(1)}` : key;

/**
 * Safely parse JSON string, returns undefined on error
 */
export const safeJsonParse = (value: string): unknown => {
    try {
        return JSON.parse(value);
    } catch {
        return undefined;
    }
};

/**
 * Safely stringify value to JSON, returns "null" on error
 */
export const safeJsonStringify = (value: unknown): string => {
    try {
        return JSON.stringify(value);
    } catch {
        return "null";
    }
};
