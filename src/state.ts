/**
 * In-memory shared state management
 */

import { isPersistentKey } from "./utils";
import { storage } from "./storage";
import { StateUpdater } from "./types";

// Global state storage
export const sharedState = new Map<string, unknown>();

/**
 * Retrieve value from memory or storage, with initialization
 */
export const getFromMemoryOrStorage = (
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

/**
 * Update shared state value with persistence and synchronization
 */
export const updateValue = <T>(
    key: string,
    value: StateUpdater<T>,
    currentValue: T,
    mutate: (data: unknown) => void
): void => {
    const newValue =
        typeof value === "function"
            ? (value as (prev: T) => T)(currentValue)
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
