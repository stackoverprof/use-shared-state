import React from "react";
import useSharedState from "../src/index";

// Demo interfaces
interface User {
    name: string;
    email: string;
    age: number;
}

interface TodoItem {
    id: string;
    text: string;
    completed: boolean;
}

export const TypeSafetyDemo: React.FC = () => {
    // ✅ Now these return guaranteed non-undefined types

    // String with default empty string
    const [message, setMessage] = useSharedState<string>("demo-message", "");

    // Number with default 0
    const [count, setCount] = useSharedState<number>("demo-count", 0);

    // Boolean with default false
    const [isActive, setIsActive] = useSharedState<boolean>(
        "demo-active",
        false
    );

    // Array with default empty array
    const [todos, setTodos] = useSharedState<TodoItem[]>("demo-todos", []);

    // Object with default values
    const [user, setUser] = useSharedState<User>("demo-user", {
        name: "",
        email: "",
        age: 0,
    });

    // ✅ Without initial values - will use safe defaults
    const [unknownString, setUnknownString] =
        useSharedState<string>("unknown-string");
    const [unknownArray, setUnknownArray] =
        useSharedState<string[]>("unknown-array");
    const [unknownObject, setUnknownObject] =
        useSharedState<User>("unknown-object");

    return (
        <div>
            <h2>Type Safety Demo</h2>

            <section>
                <h3>With Initial Values (Guaranteed Types)</h3>
                <p>
                    Message: "{message}" (length: {message.length})
                </p>
                <p>
                    Count: {count} (doubled: {count * 2})
                </p>
                <p>Active: {isActive ? "Yes" : "No"}</p>
                <p>Todos count: {todos.length}</p>
                <p>
                    User: {user.name} ({user.email}), age {user.age}
                </p>
            </section>

            <section>
                <h3>Without Initial Values (Safe Defaults)</h3>
                <p>
                    Unknown string: "{unknownString}" (safe to use .length:{" "}
                    {unknownString?.length || 0})
                </p>
                <p>Unknown array length: {unknownArray?.length || 0}</p>
                <p>Unknown object name: "{unknownObject?.name || "N/A"}"</p>
            </section>

            <section>
                <h3>Actions</h3>
                <button onClick={() => setMessage("Hello, World!")}>
                    Set Message
                </button>
                <button onClick={() => setCount((prev) => prev + 1)}>
                    Increment Count
                </button>
                <button onClick={() => setIsActive((prev) => !prev)}>
                    Toggle Active
                </button>
                <button
                    onClick={() =>
                        setTodos((prev) => [
                            ...prev,
                            {
                                id: Date.now().toString(),
                                text: "New todo",
                                completed: false,
                            },
                        ])
                    }
                >
                    Add Todo
                </button>
                <button
                    onClick={() =>
                        setUser((prev) => ({
                            ...prev,
                            name: "John Doe",
                            email: "john@example.com",
                            age: 30,
                        }))
                    }
                >
                    Set User
                </button>
            </section>
        </div>
    );
};
