# use-shared-state

[![npm version](https://badge.fury.io/js/%40stackoverprof%2Fuse-shared-state.svg)](https://badge.fury.io/js/%40stackoverprof%2Fuse-shared-state)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

A lightweight React hook for sharing state across components with optional localStorage persistence and cross-tab synchronization.

## 🚀 Live Demo

**[Try it live →](https://use-shared-state-demo.vercel.app/)**

See real-time state sharing, persistence, and cross-tab synchronization in action!

## Features

-   🚀 **Simple API** - Drop-in replacement for `useState` with cross-component sharing
-   💾 **Optional Persistence** - Use `@` prefix for localStorage persistence
-   🔄 **Cross-tab Sync** - Automatic synchronization across browser tabs
-   ⚡ **High Performance** - Optimized with minimal overhead using Map storage
-   🛡️ **Type Safe** - Full TypeScript support with generics
-   🎯 **Lite SWR** - Built with custom lightweight SWR implementation (~100 lines)
-   🧪 **Zero Dependencies** - No external dependencies except React

## Installation

```bash
# Install the library
npm install @stackoverprof/use-shared-state
```

> **Note:** React >=16.8.0 is required (peer dependency)

## Quick Start

```tsx
import useSharedState from "@stackoverprof/use-shared-state";

// Basic shared state (memory only)
const [count, setCount] = useSharedState("counter", 0);

// Persistent shared state (localStorage + cross-tab sync)
const [user, setUser] = useSharedState("@user", { name: "John" });
// ↳ Saved in localStorage as "shared@user"
```

## API Reference

### `useSharedState<T>(key: string, initialValue?: T)`

Returns a tuple `[state, setState]` similar to React's `useState`.

#### Parameters

-   `key` - Unique identifier for the shared state
    -   Regular keys: Memory-only storage
    -   Keys with `@` prefix: Persistent localStorage + cross-tab sync
-   `initialValue` - Default value when state is undefined

#### Returns

-   `state` - Current state value (T | undefined)
-   `setState` - Function to update state, supports value or updater function

## Performance

-   **Memory-only keys**: ~0.1ms overhead
-   **Persistent keys**: ~2-3ms overhead (includes localStorage operations)
-   **Cross-tab sync**: Automatic with StorageEvent API
-   **Memory usage**: Efficient Map-based storage with automatic cleanup
-   **Re-renders**: Only components using the changed state key re-render

## Re-rendering Behavior

**Important:** Only components that actively use a shared state key will re-render when that state changes.

✅ **Precise targeting**: Only components using the changed key re-render  
✅ **Parent isolation**: Parent won't re-render unless it uses shared state  
✅ **Sibling isolation**: Unrelated siblings won't re-render  
✅ **Performance**: Better than Context (which can cause cascade re-renders)

## Comparison with Alternatives

| Feature              | use-shared-state | Redux  | Context | localStorage |
| -------------------- | ---------------- | ------ | ------- | ------------ |
| Setup complexity     | Minimal          | High   | Medium  | Manual       |
| TypeScript support   | Full             | Good   | Good    | Manual       |
| Cross-component sync | ✅               | ✅     | ✅      | ❌           |
| Persistence          | Optional         | Manual | ❌      | Manual       |
| Cross-tab sync       | ✅               | Manual | ❌      | Manual       |
| Performance          | High             | Medium | Low\*   | High         |
| Bundle size          | Small            | Large  | None    | None         |

\*Context can cause unnecessary re-renders

## Best Practices

1. **Use regular keys for temporary state**

    ```tsx
    const [loading, setLoading] = useSharedState("loading", false);
    ```

2. **Use @ prefix for data that should persist**

    ```tsx
    const [settings, setSettings] = useSharedState("@user-settings", {});
    ```

3. **Provide default values for better TypeScript inference**

    ```tsx
    const [items, setItems] = useSharedState<Item[]>("items", []);
    ```

4. **Use updater functions for complex state changes**
    ```tsx
    setCart((prev) => ({ ...prev, total: calculateTotal(prev.items) }));
    ```

## Cleanup & Memory Management

### **Automatic Cleanup**

-   ✅ **Lite SWR reference counting** - Cleans up when ALL components using a key unmount
-   ✅ **Event listeners removed** - Cross-tab sync listeners auto-cleanup
-   ✅ **Memory efficient** - Map-based storage with garbage collection

### **What Gets Cleaned Up**

| Type           | Lite SWR Cleanup      | localStorage Cleanup         |
| -------------- | --------------------- | ---------------------------- |
| `"user-data"`  | ✅ Auto (memory only) | ❌ N/A                       |
| `"@user-data"` | ✅ Memory cache only  | ❌ Stays until manual delete |

### **Manual Cleanup**

```tsx
import { sharedStateUtils } from "@stackoverprof/use-shared-state";

// Clear specific keys
sharedStateUtils.delete("temp-data"); // Memory only
sharedStateUtils.delete("@user-session"); // Memory + localStorage

// Clear all (with/without persistent)
sharedStateUtils.clear(false); // Memory only
sharedStateUtils.clear(true); // Memory + localStorage

// Route cleanup
useEffect(
    () => () => {
        sharedStateUtils.delete("dashboard-filters");
    },
    []
);
```

## Utility Functions

The library provides debugging utilities via `sharedStateUtils`:

```tsx
import { sharedStateUtils } from "@stackoverprof/use-shared-state";

// Get all current keys
console.log(sharedStateUtils.getKeys());

// Get current state size
console.log(sharedStateUtils.getSize());

// Clear all state (optionally including persistent)
sharedStateUtils.clear(true);

// Delete specific key
sharedStateUtils.delete("some-key");

// Get all persistent keys
console.log(sharedStateUtils.getPersistentKeys());
```

## Requirements

-   React >= 16.8.0

## Examples

### Basic Counter

```tsx
import useSharedState from "@stackoverprof/use-shared-state";

function Counter() {
    const [count, setCount] = useSharedState("counter", 0);

    return (
        <div>
            <p>Count: {count}</p>
            <button onClick={() => setCount(count + 1)}>Increment</button>
        </div>
    );
}
```

### Shopping Cart with Persistence

```tsx
interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
}

function ProductList() {
    const [cartItems, setCartItems] = useSharedState<CartItem[]>(
        "@cart-items",
        []
    );

    const addToCart = (product: CartItem) => {
        setCartItems((prev) => {
            const existing = prev?.find((item) => item.id === product.id);
            if (existing) {
                return (
                    prev?.map((item) =>
                        item.id === product.id
                            ? { ...item, quantity: item.quantity + 1 }
                            : item
                    ) || []
                );
            }
            return [...(prev || []), { ...product, quantity: 1 }];
        });
    };

    return <div>{/* Product list */}</div>;
}

function CartSummary() {
    const [cartItems] = useSharedState<CartItem[]>("@cart-items", []);

    const total =
        cartItems?.reduce((sum, item) => sum + item.price * item.quantity, 0) ||
        0;

    return (
        <div>
            <h3>Cart ({cartItems?.length || 0} items)</h3>
            <p>Total: ${total.toFixed(2)}</p>
        </div>
    );
}
```

### Cross-Component Form State

```tsx
interface FormData {
    name: string;
    email: string;
    preferences: string[];
}

function Step1() {
    const [formData, setFormData] = useSharedState<FormData>("@form-data", {
        name: "",
        email: "",
        preferences: [],
    });

    return (
        <div>
            <input
                value={formData?.name || ""}
                onChange={(e) =>
                    setFormData((prev) => ({
                        ...prev!,
                        name: e.target.value,
                    }))
                }
                placeholder="Name"
            />
        </div>
    );
}

function Step2() {
    const [formData, setFormData] = useSharedState<FormData>("@form-data");

    return (
        <div>
            <p>Hello, {formData?.name}!</p>
            <input
                value={formData?.email || ""}
                onChange={(e) =>
                    setFormData((prev) => ({
                        ...prev!,
                        email: e.target.value,
                    }))
                }
                placeholder="Email"
            />
        </div>
    );
}
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
