import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig(({}) => {
    return {
        base: "/static/",
        plugins: [react()],
        build: {
            outDir: "dist/frontend",
            emptyOutDir: true,
            rollupOptions: {
                input: {
                    main: "./src/main.tsx",
                    login: "./src/login/main.tsx",
                },
                output: {
                    entryFileNames: "[name].js",
                    chunkFileNames: "chunk-[name][hash].js",
                    assetFileNames: "[name].[ext]",
                },
            },
            minify: "esbuild",
        },
    };
});
