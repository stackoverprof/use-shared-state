/**
 * Safe default value generator for type safety
 */

/**
 * Creates a safe default value ensuring type T is always returned (never undefined)
 *
 * @param value - The current value (may be undefined)
 * @param fallbackInitial - Optional initial value to use as fallback
 * @returns A value of type T, never undefined
 */
export const createSafeDefault = <T>(
    value: T | undefined,
    fallbackInitial?: T
): T => {
    // If we have a defined value, return it
    if (value !== undefined) {
        return value;
    }

    // If we have an explicit initial value, return it
    if (fallbackInitial !== undefined) {
        return fallbackInitial;
    }

    // Try to create reasonable defaults for common types
    // Note: This is a runtime approach since we can't detect types at compile time
    const sample = fallbackInitial;

    // If we can detect the type from the sample
    if (sample !== undefined) {
        if (Array.isArray(sample)) {
            return [] as T;
        }
        if (typeof sample === "object" && sample !== null) {
            return {} as T;
        }
        if (typeof sample === "string") {
            return "" as T;
        }
        if (typeof sample === "number") {
            return 0 as T;
        }
        if (typeof sample === "boolean") {
            return false as T;
        }
    }

    // For complex types without samples, we'll need to use type assertion
    // This creates an empty object for most object types
    try {
        // Try to create a safe default
        return {} as T;
    } catch {
        // Final fallback - this should rarely happen
        return null as T;
    }
};
