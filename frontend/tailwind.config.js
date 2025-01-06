/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    darkMode: "selector",
    theme: {
        extend: {
            colors: {
                primary: {
                    50: "#f1f6f7",
                    100: "#e2ecee",
                    200: "#9dc0c5",
                    300: "#75a6ad",
                    400: "#4e8d96",
                    DEFAULT: "#3a808a",
                    500: "#34737c",
                    600: "#2e666e",
                    700: "#234d53",
                    800: "#173337",
                    900: "#0c1a1c",
                },
            },
        },
    },
    plugins: [],
};
