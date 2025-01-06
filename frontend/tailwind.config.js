/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    darkMode: "selector",
    theme: {
        extend: {
            colors: {
                primary: {
                    50: "#f4f6fc",
                    100: "#e7ebf8",
                    200: "#c9d1f0",
                    300: "#aab8e7",
                    400: "#96a8de",
                    500: "#7184c0",
                    600: "#5969a0",
                    700: "#434f7a",
                    800: "#2e3654",
                    900: "#1b2132",
                    DEFAULT: "#8d9fd7",
                },
            },
        },
    },
    plugins: [],
};
