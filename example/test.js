import { useSharedState, sharedStateUtils } from "../src/index.js";
import React from "react";

// Example usage
function ExampleComponent() {
    const [count, setCount] = useSharedState("counter", 0);
    const [user, setUser] = useSharedState("@user", { name: "John" });

    return React.createElement(
        "div",
        null,
        React.createElement("h1", null, "useSharedState Library Test"),
        React.createElement("p", null, `Count: ${count}`),
        React.createElement(
            "button",
            {
                onClick: () => setCount(count + 1),
            },
            "Increment"
        ),
        React.createElement("p", null, `User: ${user.name}`),
        React.createElement(
            "button",
            {
                onClick: () => setUser({ name: "Jane" }),
            },
            "Change User"
        )
    );
}

console.log("Library loaded successfully!");
console.log("Available utilities:", Object.keys(sharedStateUtils));

export { ExampleComponent };
