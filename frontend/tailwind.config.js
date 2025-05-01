/** @type {import('tailwindcss').Config} */
const colors = require("tailwindcss/colors");

export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    darkMode: "selector",
    theme: {
        extend: {
            colors: {
                primary: {
                    50: "#eef2f7",
                    100: "#d7e2ee",
                    200: "#9cb9d5",
                    300: "#709bc1",
                    400: "#4a7dae",
                    DEFAULT: "#3b6fa2",
                    500: "#356494",
                    600: "#2e587f",
                    700: "#224262",
                    800: "#162d45",
                    900: "#0b1828",
                },
                secondary: colors.emerald,
                success: colors.green,
                error: colors.red,
                warning: colors.amber,
                info: colors.sky,
            },
        },
    },
    plugins: [],
};
