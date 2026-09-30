import process from "node:process";

interface SiteUrlContext {
  url: URL;
  site?: URL | null;
}

export function getSiteUrl(context: SiteUrlContext): URL {
  if (import.meta.env.DEV) return new URL(context.url.origin);

  return context.site ?? new URL(import.meta.env.SITE ?? context.url.origin);
}

export function isVercelPreview(): boolean {
  return process.env.VERCEL_ENV === "preview";
}
