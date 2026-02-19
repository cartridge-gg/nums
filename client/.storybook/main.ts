// This file has been automatically migrated to valid ESM format by Storybook.

import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { StorybookConfig } from "@storybook/react-vite";
import { mergeConfig } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const config: StorybookConfig = {
  stories: [
    "../src/components/scenes/**/*.stories.@(js|jsx|mjs|ts|tsx)",
    "../src/components/containers/**/*.stories.@(js|jsx|mjs|ts|tsx)",
    "../src/components/elements/**/*.stories.@(js|jsx|mjs|ts|tsx)",
    "../src/components/ui/**/*.stories.@(js|jsx|mjs|ts|tsx)",
    "../src/components/icons/**/*.stories.@(js|jsx|mjs|ts|tsx)",
    "../src/components/animations/**/*.stories.@(js|jsx|mjs|ts|tsx)",
    "../src/components/covers/**/*.stories.@(js|jsx|mjs|ts|tsx)",
    "../src/themes/*.stories.@(js|jsx|mjs|ts|tsx)",
  ],

  addons: [
    getAbsolutePath("@storybook/addon-links"),
    getAbsolutePath("@storybook/addon-docs"),
  ],

  framework: {
    name: getAbsolutePath("@storybook/react-vite"),
    options: {},
  },

  async viteFinal(config) {
    if (Array.isArray(config.plugins)) {
      config.plugins = config.plugins.filter(
        (plugin) =>
          plugin &&
          typeof plugin === "object" &&
          "name" in plugin &&
          plugin.name !== "vite-plugin-pwa",
      );
    }
    
    return mergeConfig(config, {
      resolve: {
        alias: {
          "@": path.resolve(__dirname, "../src"),
        },
      },
      // Ensure assets are accessible
      publicDir: path.resolve(__dirname, "../public"),
    });
  },
};

export default config;

function getAbsolutePath(value: string): string {
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)));
}
