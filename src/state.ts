/**
 * In-memory shared state management
 */

import { isPersistentKey } from "./utils";
import { storage } from "./storage";
import { StateUpdater } from "./types";

// Global state storage
export const sharedState = new Map<string, unknown>();

// Track hydration state and callbacks for SSR safety
let isHydrated = false;
const hydrationCallbacks: (() => void)[] = [];

if (typeof window !== "undefined") {
    // Mark as hydrated after initial render
    const markHydrated = () => {
        isHydrated = true;
        // Execute all pending hydration callbacks
        hydrationCallbacks.forEach((callback) => callback());
        hydrationCallbacks.length = 0;
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", markHydrated);
    } else {
        markHydrated();
    }
}

/**
 * Register a callback to be executed after hydration
 */
export const onHydrated = (callback: () => void): void => {
    if (isHydrated) {
        callback();
    } else {
        hydrationCallbacks.push(callback);
    }
};

/**
 * Retrieve value from memory or storage, with initialization and SSR hydration safety
 */
export const getFromMemoryOrStorage = (
    key: string,
    initialValue?: unknown
): unknown => {
    // Fast path: check memory first
    if (sharedState.has(key)) {
        return sharedState.get(key);
    }

    // SSR hydration safety: for persistent keys, only use localStorage after hydration
    if (isPersistentKey(key)) {
        // During SSR or before hydration, use initial value to prevent hydration mismatch
        if (typeof window === "undefined" || !isHydrated) {
            if (initialValue !== undefined) {
                sharedState.set(key, initialValue);
                return initialValue;
            }
            return undefined;
        }

        // After hydration, safe to use localStorage
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
