import { SITE_URL } from "../consts";

const SITE_ORIGIN = new URL(SITE_URL).origin;

export function withOutboundTracking(href: string, placement: string): string {
  const url = new URL(href, SITE_URL);

  if ((url.protocol !== "http:" && url.protocol !== "https:") || url.origin === SITE_ORIGIN) {
    return href;
  }

  url.searchParams.set("utm_source", "garrettladley.com");
  url.searchParams.set("utm_medium", "referral");
  url.searchParams.set("utm_campaign", "self-site");
  url.searchParams.set("utm_content", placement);

  return url.toString();
}
