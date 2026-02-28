import type { Config } from "tailwindcss";

const config = {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      colors: {
        background: "var(--color-bg)",
        foreground: "var(--color-text)",
        "foreground-muted": "var(--color-text-soft)",
        "foreground-dim": "var(--color-text-dim)",
        accent: "var(--color-accent)",
        border: "var(--color-border)",
      },
      borderColor: {
        DEFAULT: "var(--color-border)",
      },
      fontFamily: {
        mono: ["var(--font-mono)"],
      },
      maxWidth: {
        page: "var(--page-width)",
      },
      spacing: {
        "page-x": "var(--page-padding-inline)",
        "page-y": "var(--page-padding-block)",
      },
    },
  },
} satisfies Config;

export default config;
