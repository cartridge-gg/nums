import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";

const rootDir = fileURLToPath(new URL(".", import.meta.url));
const resolveFromRoot = (path: string) => resolve(rootDir, path);

export default defineConfig({
  plugins: [wasm(), topLevelAwait()],
  test: {
    environment: "jsdom",
    globals: true,
    coverage: {
      reporter: ["text", "json", "html"],
      provider: "v8",
    },
    include: [
      "src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}",
      "tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}",
    ],
    exclude: ["node_modules", "dist", "www"],
    deps: {
      optimizer: {
        web: {
          include: ["@dojoengine/torii-client"],
        },
      },
    },
    setupFiles: [resolveFromRoot("tests/setup/test-setup.ts")],
  },
  resolve: {
    alias: [
      {
        find: "@cartridge/ui/utils/api/cartridge",
        replacement: resolveFromRoot(
          "tests/mocks/cartridge-ui-api-cartridge.ts",
        ),
      },
      {
        find: "@cartridge/ui/utils/api/indexer",
        replacement: resolveFromRoot(
          "tests/mocks/cartridge-ui-api-indexer.ts",
        ),
      },
      {
        find: "@cartridge/ui/utils",
        replacement: resolveFromRoot("tests/mocks/cartridge-ui-utils.ts"),
      },
      {
        find: /^@dojoengine\/torii-wasm\/pkg\/web\/dojo_c\.js$/,
        replacement: resolveFromRoot("tests/mocks/torii-wasm-pkg.ts"),
      },
      {
        find: /^@dojoengine\/torii-wasm\/pkg\/web\/dojo_c_bg\.js$/,
        replacement: resolveFromRoot("tests/mocks/torii-wasm-pkg.ts"),
      },
      {
        find: /^@dojoengine\/torii-wasm\/pkg\/web\/dojo_c_bg\.wasm$/,
        replacement: resolveFromRoot("tests/mocks/torii-wasm-pkg.ts"),
      },
      {
        find: /^@dojoengine\/torii-wasm$/,
        replacement: resolveFromRoot("tests/mocks/torii-wasm.ts"),
      },
      {
        find: "@",
        replacement: resolveFromRoot("src"),
      },
      {
        find: "@cartridge/ui",
        replacement: resolveFromRoot("tests/mocks/cartridge-ui.ts"),
      },
      {
        find: /^@cartridge\/arcade\/marketplace$/,
        replacement: resolveFromRoot(
          "tests/mocks/cartridge-arcade-marketplace.ts",
        ),
      },
      {
        find: /^@cartridge\/arcade$/,
        replacement: resolveFromRoot("tests/mocks/cartridge-arcade.ts"),
      },
    ],
  },
});
