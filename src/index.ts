import { useEffect } from "react";
import { UseSharedStateReturn, SetState } from "./types";
import { isPersistentKey, getLocalStorageKey, safeJsonParse } from "./utils";
import {
    getFromMemoryOrStorage,
    updateValue,
    sharedState,
    onHydrated,
} from "./state";
import { createSafeDefault } from "./defaults";
import { useLiteSWR } from "./lite-swr";

/**
 * React hook for sharing state across components with optional persistence
 *
 * @param key - Unique identifier for the shared state (use @ prefix for persistence)
 * @param initialValue - Default value when state is undefined
 * @returns Tuple of [state, setState] similar to React's useState
 */
export const useSharedState = <T>(
    key: string,
    initialValue?: T
): UseSharedStateReturn<T> => {
    const persistent = isPersistentKey(key);

    // SWR fetcher
    const fetcher = (key: string) => getFromMemoryOrStorage(key, initialValue);

    const { data: state, mutate } = useLiteSWR(key, fetcher);

    // Create safe value that's never undefined
    const safeState = createSafeDefault<T>(
        state as T | undefined,
        initialValue
    );

    // SSR hydration safety: re-fetch persistent data after hydration
    useEffect(() => {
        if (!persistent) return;

        onHydrated(() => {
            // After hydration, check if localStorage has different data
            const persistedValue = getFromMemoryOrStorage(key, initialValue);
            const currentValue = sharedState.get(key);

            // Only mutate if localStorage has different data than current state
            if (
                persistedValue !== currentValue &&
                persistedValue !== undefined
            ) {
                mutate(persistedValue);
            }
        });
    }, [key, persistent, initialValue, mutate]);

    // Cross-tab sync for persistent keys (SSR safe)
    useEffect(() => {
        if (!persistent || typeof window === "undefined") return;

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
        const currentValue = createSafeDefault<T>(
            sharedState.get(key) as T | undefined,
            initialValue
        );
        updateValue(key, value, currentValue, mutate);
    };

    return [safeState, setState];
};

// Utility functions
export { sharedStateUtils } from "./debug";

// Type exports
export type { StateUpdater, SetState, UseSharedStateReturn } from "./types";

// Default export for convenience
export default useSharedState;
