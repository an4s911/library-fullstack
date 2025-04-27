// main.tsx

// Add this at the top of your entry point (before React renders)
const originalFetch = window.fetch;
window.fetch = async (input, init) => {
    if (typeof input === "string" && input.startsWith("/api")) {
        const baseUrl = import.meta.env.VITE_API_URL;
        input = baseUrl + input;
        init = {
            ...init,
            credentials: "include",
        };
    }
    return originalFetch(input, init);
};

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <App />
    </StrictMode>,
);
