import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import mkcert from "vite-plugin-mkcert";
import { VitePWA } from "vite-plugin-pwa";
import topLevelAwait from "vite-plugin-top-level-await";
import wasm from "vite-plugin-wasm";
import vercel from "vite-plugin-vercel";
import tsconfigPaths from "vite-tsconfig-paths";

const COMMIT_SHA = process.env.VERCEL_GIT_COMMIT_SHA || "dev";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    minify: "esbuild",
    chunkSizeWarningLimit: 1000,
    // Ensure assets are hashed for cache busting
    rollupOptions: {
      output: {
        // Ensure consistent hashing for cache busting
        entryFileNames: "assets/[name].[hash].js",
        chunkFileNames: "assets/[name].[hash].js",
        assetFileNames: "assets/[name].[hash].[ext]",
      },
    },
  },
  plugins: [
    react(),
    wasm(),
    topLevelAwait(),
    tsconfigPaths(),
    mkcert(),
    vercel(),
    VitePWA({
      registerType: "autoUpdate",
      // Specify service worker filename explicitly
      filename: "service-worker.js",
      // Force immediate update check
      devOptions: {
        enabled: false,
      },
      // Check for updates more frequently
      includeAssets: ["favicon.ico", "apple-touch-icon.png", "favicon.svg"],
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
      workbox: {
        maximumFileSizeToCacheInBytes: 4000000, // 4 MB
        // Skip waiting and claim clients immediately for faster updates
        skipWaiting: true,
        clientsClaim: true,
        // Don't cache index.html - always fetch from network
        navigateFallback: null,
        // Use network-first strategy for HTML to always get latest version
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.html$/,
            handler: "NetworkFirst",
            options: {
              cacheName: "html-cache",
              expiration: {
                maxEntries: 1,
                maxAgeSeconds: 0, // Always check network first
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
  ],
  define: {
    __COMMIT_SHA__: JSON.stringify(COMMIT_SHA),
  },
  server: {
    port: process.env.NODE_ENV === "development" ? 3003 : undefined,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  root: "./",
  publicDir: "public",
  // SSR Configuration
  ssr: {
    noExternal: [
      "@cartridge/arcade",
      "@cartridge/connector",
      "@cartridge/controller",
      "@cartridge/penpal",
      "@cartridge/presets",
      "@dojoengine/sdk",
      "@dojoengine/torii-wasm",
      "@starknet-react/chains",
      "@starknet-react/core",
    ],
    external: ["@cartridge/ui", "posthog-js"],
  },
});
