export function canonicalUrl(pathname: string, site: URL): URL {
  const url = new URL(pathname, site);

  if (url.pathname !== "/") {
    url.pathname = url.pathname.replace(/\/+$/, "");
  }

  return url;
}
