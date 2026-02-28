import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import eslintPluginAstro from "eslint-plugin-astro";
import css from "@eslint/css";
import tailwindcss from "@poupe/eslint-plugin-tailwindcss";

const JS_FILES = ["**/*.{js,mjs,cjs,ts}"];

export default [
  {
    ignores: ["dist/", ".astro/", ".vercel/", "tmp/"],
  },
  {
    files: JS_FILES,
    ...js.configs.recommended,
  },
  ...tseslint.configs.recommended.map((config) => ({
    ...config,
    files: config.files ?? JS_FILES,
  })),
  ...eslintPluginAstro.configs.recommended,
  ...eslintPluginAstro.configs["jsx-a11y-recommended"],
  {
    files: [...JS_FILES, "**/*.astro"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2025,
        Astro: "readonly",
      },
    },
  },
  {
    files: ["**/*.css"],
    language: "css/css",
    plugins: {
      css,
      tailwindcss,
    },
    rules: {
      ...tailwindcss.configs.recommended.rules,
      "tailwindcss/no-invalid-properties": "off",
    },
  },
];
