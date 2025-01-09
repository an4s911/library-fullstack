import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), "");

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
        server: {
            proxy: {
                "/api": {
                    target: env.VITE_API_URL,
                    changeOrigin: true,
                },
            },
        },
    };
});
