/**
 * Lightweight SWR replacement - only the parts we need
 * Replaces the entire SWR dependency with ~100 lines
 */

import { useEffect, useRef, useState } from "react";

// Component subscription tracker
const subscriptions = new Map<string, Set<() => void>>();
const cache = new Map<string, unknown>();

/**
 * Subscribe a component to a key
 */
const subscribe = (key: string, callback: () => void): (() => void) => {
    if (!subscriptions.has(key)) {
        subscriptions.set(key, new Set());
    }

    subscriptions.get(key)!.add(callback);

    // Return unsubscribe function
    return () => {
        const subs = subscriptions.get(key);
        if (subs) {
            subs.delete(callback);
            // Clean up empty subscriptions
            if (subs.size === 0) {
                subscriptions.delete(key);
                cache.delete(key);
            }
        }
    };
};

/**
 * Notify all subscribers of a key
 */
const notify = (key: string): void => {
    const subs = subscriptions.get(key);
    if (subs) {
        subs.forEach((callback) => callback());
    }
};

/**
 * Minimal SWR-like hook with React Strict Mode support
 */
export const useLiteSWR = <T>(
    key: string,
    fetcher: (key: string) => T
): {
    data: T;
    mutate: (data: T) => void;
} => {
    const [, forceRender] = useState({});
    const keyRef = useRef(key);

    // Update key ref when key changes
    keyRef.current = key;

    // Initialize data if not cached (React Strict Mode safe)
    if (!cache.has(key)) {
        cache.set(key, fetcher(key));
    }

    const data = cache.get(key) as T;

    // Subscribe to changes
    useEffect(() => {
        const currentKey = key;
        const rerender = () => forceRender({});
        const unsubscribe = subscribe(currentKey, rerender);

        return unsubscribe;
    }, [key]);

    // Mutate function with current key reference
    const mutate = useRef((newData: T): void => {
        const currentKey = keyRef.current;
        cache.set(currentKey, newData);
        notify(currentKey);
    }).current;

    return { data, mutate };
};

/**
 * Debug utilities
 */
export const liteSWRDebug = {
    getSubscriptions: () => subscriptions,
    getCache: () => cache,
    getSubscriberCount: (key: string) => subscriptions.get(key)?.size || 0,
    getAllKeys: () => Array.from(cache.keys()),
    clear: () => {
        cache.clear();
        subscriptions.clear();
    },
};
