import React from "react";

// Test both import styles work
import useSharedState from "../src/index"; // ✅ Default import
import {
    useSharedState as namedUseSharedState,
    sharedStateUtils,
} from "../src/index"; // ✅ Named import

export const ImportStyleDemo: React.FC = () => {
    // Both should work identically
    const [count1, setCount1] = useSharedState<number>("count1", 0);
    const [count2, setCount2] = namedUseSharedState<number>("count2", 0);

    return (
        <div>
            <h2>Import Style Demonstration</h2>
            <p>Both import styles work:</p>

            <div>
                <h3>Default Import:</h3>
                <p>Count1: {count1}</p>
                <button onClick={() => setCount1((prev) => prev + 1)}>
                    Increment (Default Import)
                </button>
            </div>

            <div>
                <h3>Named Import:</h3>
                <p>Count2: {count2}</p>
                <button onClick={() => setCount2((prev) => prev + 1)}>
                    Increment (Named Import)
                </button>
            </div>

            <div>
                <h3>Utility Functions:</h3>
                <p>Active keys: {sharedStateUtils.getKeys().join(", ")}</p>
                <button onClick={() => sharedStateUtils.clear()}>
                    Clear All State
                </button>
            </div>
        </div>
    );
};

// Example usage in documentation:
// Default import (shorter, cleaner):
// import useSharedState from '@stackoverprof/use-shared-state';

// Named import (explicit, good for tree shaking):
// import { useSharedState } from '@stackoverprof/use-shared-state';

// Both utilities (if needed):
// import useSharedState, { sharedStateUtils } from '@stackoverprof/use-shared-state';
