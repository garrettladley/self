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
      fontSize: {
        chrome: "10px",
        meta: "13px",
        body: "15px",
        heading: "17px",
        "error-body": "clamp(0.95rem, 2.2vw, 1.08rem)",
        "error-heading": "clamp(1rem, 2.6vw, 1.35rem)",
        hero: "clamp(2.5rem, 5vw, 5rem)",
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
