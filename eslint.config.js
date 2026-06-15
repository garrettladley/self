import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import eslintPluginAstro from "eslint-plugin-astro";
import * as mdx from "eslint-plugin-mdx";
import css from "@eslint/css";
import betterTailwindcss from "eslint-plugin-better-tailwindcss";

const JS_FILES = ["**/*.{js,mjs,cjs,ts}"];

export default [
  {
    ignores: ["dist/", ".astro/", ".claude/", ".vercel/", "tmp/"],
  },
  {
    files: JS_FILES,
    ...js.configs.recommended,
  },
  ...tseslint.configs.recommended.map((config) => ({
    ...config,
    files: config.files ?? JS_FILES,
  })),
  {
    ...mdx.flat,
    processor: mdx.createRemarkProcessor({
      lintCodeBlocks: true,
    }),
  },
  mdx.flatCodeBlocks,
  ...eslintPluginAstro.configs.recommended,
  ...eslintPluginAstro.configs["jsx-a11y-recommended"],
  {
    files: ["**/*.astro"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2025,
        Astro: "readonly",
      },
      parserOptions: {
        parser: tseslint.parser,
      },
    },
  },
  {
    files: JS_FILES,
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2025,
      },
    },
  },
  {
    files: ["**/*.{astro,js,jsx,mdx,ts,tsx}"],
    plugins: {
      "better-tailwindcss": betterTailwindcss,
    },
    settings: {
      "better-tailwindcss": {
        entryPoint: "src/styles/global.css",
      },
    },
    rules: {
      "better-tailwindcss/enforce-canonical-classes": "error",
      "better-tailwindcss/no-unnecessary-whitespace": "error",
    },
  },
  {
    files: ["**/*.css"],
    language: "css/css",
    plugins: {
      css,
    },
    rules: {
      ...css.configs.recommended.rules,
      "css/no-invalid-at-rules": "off",
      "css/no-invalid-at-rule-placement": "off",
      "css/no-invalid-properties": "off",
      "css/use-baseline": "off",
    },
  },
];
