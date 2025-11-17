import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import mkcert from "vite-plugin-mkcert";
import { VitePWA } from "vite-plugin-pwa";
import { viteStaticCopy } from "vite-plugin-static-copy";
import topLevelAwait from "vite-plugin-top-level-await";
import wasm from "vite-plugin-wasm";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    minify: "esbuild",
    chunkSizeWarningLimit: 1000,
  },
  plugins: [
    react(),
    wasm(),
    topLevelAwait(),
    tsconfigPaths(),
    mkcert(),
    VitePWA({
      registerType: "autoUpdate",
      workbox: {
        maximumFileSizeToCacheInBytes: 4000000, // 4 MB
      },
      manifest: {
        name: "Nums",
        short_name: "Nums",
        icons: [
          {
            src: "/android-chrome-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable",
          },
          {
            src: "/android-chrome-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
          {
            src: "/apple-touch-icon.png",
            sizes: "180x180",
            type: "image/png",
            purpose: "any",
          },
        ],
        theme_color: "#591FFF",
        background_color: "#591FFF",
        display: "standalone",
      },
    }),
    viteStaticCopy({
      targets: [
        {
          src: "src/assets/fonts/*",
          dest: "assets/fonts",
        },
      ],
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
