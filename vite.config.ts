import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// Vite serve SOLO a produrre il bundle statico in ./bundle.
// L'HTML eseguito e' quello statico nella root del repo (index.html), che
// punta a ./bundle/app.js e ./bundle/app.css: nessun dev server.
export default defineConfig(({ mode }) => {
    const production = mode === "production";

    return {
        base: "./",
        plugins: [react()],
        resolve: {
            // CampoInput e le sue dipendenze importano con alias "lib/..."
            alias: {
                lib: path.resolve(import.meta.dirname, "./src/lib")
            },
            extensions: [".tsx", ".ts", ".js"]
        },
        define: {
            DEBUG: JSON.stringify(!production)
        },
        build: {
            outDir: "bundle",
            emptyOutDir: true,
            cssCodeSplit: false,
            rollupOptions: {
                input: path.resolve(import.meta.dirname, "./src/main.tsx"),
                output: {
                    entryFileNames: "app.js",
                    chunkFileNames: "[name].js",
                    assetFileNames: (assetInfo) => {
                        const name = assetInfo.name || "";
                        if (name.endsWith(".css")) return "app.css";
                        if (/\.(woff|woff2|eot|ttf|otf)$/i.test(name)) return "fonts/[name][extname]";
                        return "[name][extname]";
                    }
                }
            }
        }
    };
});
