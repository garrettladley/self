export function withOutboundTracking(href: string, placement: string, site: URL): string {
  const url = new URL(href, site);

  if ((url.protocol !== "http:" && url.protocol !== "https:") || url.origin === site.origin) {
    return href;
  }

  url.searchParams.set("utm_source", site.hostname);
  url.searchParams.set("utm_medium", "referral");
  url.searchParams.set("utm_campaign", "self-site");
  url.searchParams.set("utm_content", placement);

  return url.toString();
}
