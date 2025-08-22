# Architecture Documentation

## File Structure Overview

The codebase has been refactored into focused, single-responsibility modules for better maintainability and code review:

```
src/
├── index.ts          # Main hook implementation and public API
├── types.ts          # Type definitions and constants
├── utils.ts          # Pure utility functions
├── defaults.ts       # Safe default value generation
├── storage.ts        # localStorage operations
├── state.ts          # In-memory state management
└── debug.ts          # Debug utilities and legacy exports
```

## Module Responsibilities

### 🎯 **`types.ts`** - Type Definitions & Constants

-   Core TypeScript interfaces and types
-   Configuration constants (prefixes, keys)
-   **Why separated**: Clear contract definitions, easy to reference

### 🔧 **`utils.ts`** - Pure Utility Functions

-   Key manipulation (persistent key detection, localStorage key generation)
-   JSON serialization/deserialization with error handling
-   **Why separated**: Pure functions, easily testable, no side effects

### 🛡️ **`defaults.ts`** - Type Safety Layer

-   Safe default value generation to eliminate `T | undefined`
-   Handles edge cases for different data types
-   **Why separated**: Complex logic for type safety, focused responsibility

### 💾 **`storage.ts`** - localStorage Operations

-   localStorage read/write with comprehensive error handling
-   Cross-tab synchronization via StorageEvent
-   **Why separated**: External dependency isolation, error boundary

### 🗂️ **`state.ts`** - In-Memory State Management

-   Global Map-based state storage
-   State retrieval and update logic
-   **Why separated**: Core state logic, performance-critical operations

### 🐛 **`debug.ts`** - Development & Legacy Support

-   Debugging utilities and introspection tools
-   Backward compatibility exports (deprecated functions)
-   **Why separated**: Non-core functionality, clean main API

### 📦 **`index.ts`** - Main Hook & Public API

-   Main `useSharedState` hook implementation with SWR integration
-   Cross-tab sync effect management
-   Clean export interface with documentation
-   **Why centralized**: Single entry point, main functionality in one place

## Key Architectural Decisions

### 1. **Separation of Concerns**

Each file has a single, well-defined responsibility making the codebase easier to:

-   **Review**: Each module can be reviewed independently
-   **Test**: Pure functions are easily unit testable
-   **Maintain**: Changes are localized to relevant modules
-   **Debug**: Issues can be traced to specific layers

### 2. **Error Boundary Pattern**

-   `storage.ts` contains all localStorage error handling
-   `utils.ts` handles JSON parsing errors
-   Prevents crashes from propagating to React components

### 3. **Pure Function Design**

-   `utils.ts` contains only pure functions (no side effects)
-   `defaults.ts` provides deterministic type safety
-   Makes testing and reasoning about code much easier

### 4. **Type Safety First**

-   `types.ts` provides strong TypeScript contracts
-   `defaults.ts` eliminates `undefined` returns
-   Better developer experience and fewer runtime errors

### 5. **Performance Optimization**

-   `state.ts` uses Map for O(1) lookups
-   Memory-first strategy with localStorage fallback
-   SWR integration for efficient re-rendering

## Benefits for Code Review

✅ **Focused Reviews**: Each file can be reviewed for its specific purpose  
✅ **Clear Dependencies**: Import statements show module relationships  
✅ **Testability**: Pure functions are easy to unit test  
✅ **Maintainability**: Changes are isolated to relevant modules  
✅ **Documentation**: Each file has clear responsibility docs

## Migration Impact

-   **Zero Breaking Changes**: Public API remains identical
-   **Backward Compatibility**: All existing exports preserved
-   **Build System**: No changes required, same bundle output
-   **Performance**: Same or better (no overhead from separation)

This refactoring makes the code much more professional and enterprise-ready while maintaining all existing functionality.
