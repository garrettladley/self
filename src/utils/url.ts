import { SITE_URL } from "../consts";

export function canonicalUrl(pathname: string): URL {
  const url = new URL(pathname, SITE_URL);

  if (url.pathname !== "/") {
    url.pathname = url.pathname.replace(/\/+$/, "");
  }

  return url;
}
