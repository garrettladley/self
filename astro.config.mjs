// @ts-check
import { defineConfig } from "astro/config";
import vercel from "@astrojs/vercel";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  site: "https://garrettladley.com",
  output: "static",
  adapter: vercel(),
  vite: {
    plugins: [tailwindcss()],
  },
});
