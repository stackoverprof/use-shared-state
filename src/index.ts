import useSWR from "swr";
import { useEffect } from "react";

// Global state storage
const sharedState = new Map<string, unknown>();

// Type definitions
type StateUpdater<T> = T | ((prev: T | undefined) => T);
type SetState<T> = (value: StateUpdater<T>) => void;
type UseSharedStateReturn<T> = [T | undefined, SetState<T>];

// Constants
const PERSISTENT_KEY_PREFIX = "@" as const;
const LOCALSTORAGE_PREFIX = "shared@" as const;

// Pure utility functions
const isPersistentKey = (key: string): boolean =>
    key.startsWith(PERSISTENT_KEY_PREFIX);

const getLocalStorageKey = (key: string): string =>
    isPersistentKey(key) ? `${LOCALSTORAGE_PREFIX}${key.slice(1)}` : key;

const safeJsonParse = (value: string): unknown => {
    try {
        return JSON.parse(value);
    } catch {
        return undefined;
    }
};

const safeJsonStringify = (value: unknown): string => {
    try {
        return JSON.stringify(value);
    } catch {
        return "null";
    }
};

// Storage operations with error handling
const storage = {
    get: (key: string): unknown => {
        try {
            const storageKey = getLocalStorageKey(key);
            const stored = localStorage.getItem(storageKey);
            return stored ? safeJsonParse(stored) : undefined;
        } catch {
            return undefined;
        }
    },

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

    remove: (key: string): void => {
        try {
            const storageKey = getLocalStorageKey(key);
            localStorage.removeItem(storageKey);
        } catch {
            // Ignore removal errors
        }
    },
};

// State management functions
const getFromMemoryOrStorage = (
    key: string,
    initialValue?: unknown
): unknown => {
    // Fast path: check memory first
    if (sharedState.has(key)) {
        return sharedState.get(key);
    }

    // Persistent keys: try localStorage
    if (isPersistentKey(key)) {
        const persisted = storage.get(key);
        if (persisted !== undefined) {
            sharedState.set(key, persisted);
            return persisted;
        }
    }

    // Initialize with default value
    if (initialValue !== undefined) {
        sharedState.set(key, initialValue);
        if (isPersistentKey(key)) {
            storage.set(key, initialValue);
        }
        return initialValue;
    }

    return undefined;
};

const updateValue = <T>(
    key: string,
    value: StateUpdater<T>,
    currentValue: T | undefined,
    mutate: (data: unknown) => void
): void => {
    const newValue =
        typeof value === "function"
            ? (value as (prev: T | undefined) => T)(currentValue)
            : value;

    // Always update memory
    sharedState.set(key, newValue);

    // Persist if needed
    if (isPersistentKey(key)) {
        storage.set(key, newValue);
    }

    // Sync across components
    mutate(newValue);
};

// Main hook
export const useSharedState = <T>(
    key: string,
    initialValue?: T
): UseSharedStateReturn<T> => {
    const persistent = isPersistentKey(key);

    // SWR fetcher
    const fetcher = (key: string) => getFromMemoryOrStorage(key, initialValue);

    const { data: state, mutate } = useSWR(key, fetcher);

    // Cross-tab sync for persistent keys
    useEffect(() => {
        if (!persistent) return;

        const handleStorageChange = (event: StorageEvent) => {
            const expectedStorageKey = getLocalStorageKey(key);
            if (event.key === expectedStorageKey && event.newValue) {
                const newValue = safeJsonParse(event.newValue);
                if (newValue !== undefined) {
                    sharedState.set(key, newValue);
                    mutate(newValue);
                }
            }
        };

        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange);
    }, [key, persistent, mutate]);

    // State setter
    const setState: SetState<T> = (value) => {
        const currentValue = (sharedState.get(key) ?? initialValue) as
            | T
            | undefined;
        updateValue(key, value, currentValue, mutate);
    };

    return [(state ?? initialValue) as T | undefined, setState];
};

// Helper function for getting persistent keys
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

// Utility functions for debugging and testing
export const sharedStateUtils = {
    // Get current state map (for debugging)
    getState: () => sharedState,

    // Get all current keys
    getKeys: () => Array.from(sharedState.keys()),

    // Get state size
    getSize: () => sharedState.size,

    // Clear all state
    clear: (includePersistent = false) => {
        if (includePersistent) {
            getPersistentKeysFromStorage().forEach(storage.remove);
        }
        sharedState.clear();
    },

    // Delete specific key
    delete: (key: string) => {
        sharedState.delete(key);
        if (isPersistentKey(key)) {
            storage.remove(key);
        }
    },

    // Get all persistent keys from localStorage
    getPersistentKeys: () => getPersistentKeysFromStorage(),
};

// Backward compatibility exports (deprecated)
export const getSharedState = sharedStateUtils.getState;
export const clearSharedState = sharedStateUtils.clear;
export const deleteSharedStateKey = sharedStateUtils.delete;
export const getSharedStateKeys = sharedStateUtils.getKeys;
export const getSharedStateSize = sharedStateUtils.getSize;
export const getAllPersistentKeys = sharedStateUtils.getPersistentKeys;
