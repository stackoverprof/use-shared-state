import useSWR from "swr";
import { useEffect } from "react";
import { UseSharedStateReturn, SetState } from "./types";
import { isPersistentKey, getLocalStorageKey, safeJsonParse } from "./utils";
import { getFromMemoryOrStorage, updateValue, sharedState } from "./state";
import { createSafeDefault } from "./defaults";

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

    const { data: state, mutate } = useSWR(key, fetcher);

    // Create safe value that's never undefined
    const safeState = createSafeDefault<T>(
        state as T | undefined,
        initialValue
    );

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
