import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { translationApi } from "./server/translationApi.js";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: "parlance-translation-api",
      configureServer(server) { server.middlewares.use(translationApi); },
      configurePreviewServer(server) { server.middlewares.use(translationApi); },
    },
  ],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  server: { host: "127.0.0.1", port: Number(process.env.PARLANCE_PORT) || 4173, strictPort: true },
  preview: { host: "127.0.0.1", port: Number(process.env.PARLANCE_PORT) || 4173, strictPort: true },
  worker: { format: "es" },
  build: {
    target: "es2022",
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/three/")) return "three";
          return undefined;
        },
      },
    },
  },
});
