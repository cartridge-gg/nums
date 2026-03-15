import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import mkcert from "vite-plugin-mkcert";
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
