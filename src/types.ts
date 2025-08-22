/**
 * Type definitions for the shared state library
 */

export type StateUpdater<T> = T | ((prev: T) => T);
export type SetState<T> = (value: StateUpdater<T>) => void;
export type UseSharedStateReturn<T> = [T, SetState<T>];

/**
 * Configuration constants
 */
export const PERSISTENT_KEY_PREFIX = "@" as const;
export const LOCALSTORAGE_PREFIX = "shared@" as const;
