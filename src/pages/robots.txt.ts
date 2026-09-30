import type { APIRoute } from "astro";
import { getSiteUrl } from "../utils/site-url";

export const GET: APIRoute = (context) => {
  const sitemapUrl = new URL("/sitemap-index.xml", getSiteUrl(context));
  const contents = ["User-agent: *", "Allow: /", "", `Sitemap: ${sitemapUrl.href}`, ""].join("\n");

  return new Response(contents, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
