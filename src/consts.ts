// Single source of truth for site-wide identity. Mirrors `site` in
// astro.config.mjs (which can't be imported from runtime code).
export const SITE_URL = "https://garrettladley.com";
export const AUTHOR = "Garrett Ladley";

export const SOCIAL_PROFILES = {
  github: {
    label: "GitHub",
    url: "https://github.com/garrettladley",
  },
  x: {
    label: "X",
    url: "https://x.com/garrettladley",
    handle: "@garrettladley",
  },
  linkedin: {
    label: "LinkedIn",
    url: "https://linkedin.com/in/garrettladley",
  },
} as const;
