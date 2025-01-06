/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    darkMode: "selector",
    theme: {
        extend: {
            colors: {
                body: "#f8f8f8",
                bodyDark: "#1a1a1a",
                primary: {
                    100: "#eaeeff",
                    200: "#c3cbfc",
                    300: "#9da9f8",
                    400: "#7a84f2",
                    500: "#5c5dea",
                    600: "#443cc7",
                    700: "#2e288e",
                    800: "#231e72",
                    900: "#100d3f",
                    DEFAULT: "#4f46e5",
                    dark: "#6366f1",
                },
            },
        },
    },
    plugins: [],
};
