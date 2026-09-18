// @ts-check
import { defineConfig, envField } from "astro/config";
import vercel from "@astrojs/vercel";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";

import mdx from "@astrojs/mdx";

// https://astro.build/config
export default defineConfig({
  site: "https://garrettladley.com",
  output: "static",
  adapter: vercel(),
  trailingSlash: "never",
  integrations: [
    sitemap({
      serialize(item) {
        const url = new URL(item.url);
        if (url.pathname !== "/") {
          url.pathname = url.pathname.replace(/\/+$/, "");
        }
        return { ...item, url: url.href };
      },
    }),
    mdx(),
  ],
  env: {
    schema: {
      PUBLIC_POSTHOG_PROJECT_TOKEN: envField.string({
        context: "client",
        access: "public",
        optional: true,
      }),
      PUBLIC_POSTHOG_HOST: envField.string({
        context: "client",
        access: "public",
        optional: true,
      }),
    },
  },
  markdown: {
    shikiConfig: {
      // Light-only site: github-light colors on our own surface panel.
      // defaultColor:false emits the color as a CSS var so our surface bg wins.
      themes: {
        light: "github-light",
        dark: "github-light",
      },
      defaultColor: false,
      wrap: true,
    },
  },
  prefetch: {
    prefetchAll: true,
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
