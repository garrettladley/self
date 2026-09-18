import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { extname, join, relative, resolve } from "node:path";
import process from "node:process";

const outputDirectory = resolve(process.env.SITE_OUTPUT_DIR ?? "dist");
const siteOrigin = new URL(process.env.SITE_URL ?? "https://garrettladley.com");
siteOrigin.pathname = "/";
siteOrigin.search = "";
siteOrigin.hash = "";

const failures = [];

function fail(message) {
  failures.push(message);
}

function readOutputFile(path) {
  try {
    return readFileSync(join(outputDirectory, path), "utf8");
  } catch {
    return undefined;
  }
}

function outputFiles(directory = outputDirectory) {
  if (!existsSync(directory)) return [];

  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? outputFiles(path) : [path];
  });
}

function outputRoute(path) {
  const relativePath = relative(outputDirectory, path).replaceAll("\\", "/");
  if (relativePath === "index.html") return "/";
  if (relativePath === "404.html") return "/404";
  if (relativePath.endsWith("/index.html")) {
    return `/${relativePath.slice(0, -"/index.html".length)}`;
  }
  if (relativePath.endsWith(".html")) {
    return `/${relativePath.slice(0, -".html".length)}`;
  }
  return undefined;
}

function htmlRoutes() {
  return outputFiles()
    .filter((path) => extname(path) === ".html")
    .map((path) => ({ path, route: outputRoute(path) }))
    .filter((entry) => entry.route !== undefined);
}

function decodeXml(value) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&apos;", "'");
}

function xmlValues(xml, tag) {
  const values = [];
  const pattern = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "gi");
  for (const match of xml.matchAll(pattern)) {
    values.push(decodeXml(match[1].trim()));
  }
  return values;
}

function attributes(tag) {
  const values = {};
  const pattern = /([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g;
  for (const match of tag.matchAll(pattern)) {
    values[match[1].toLowerCase()] = match[2] ?? match[3] ?? match[4] ?? "";
  }
  return values;
}

function htmlReferences(html) {
  const references = [];
  for (const match of html.matchAll(/<[a-z][^>]*>/gi)) {
    const tagAttributes = attributes(match[0]);
    for (const name of ["href", "src", "action", "cite", "poster", "data"]) {
      if (tagAttributes[name]) references.push(tagAttributes[name]);
    }
  }
  return references;
}

function canonicalLinks(html) {
  const links = [];
  for (const match of html.matchAll(/<link\b[^>]*>/gi)) {
    const attrs = attributes(match[0]);
    if (attrs.rel?.split(/\s+/).includes("canonical") && attrs.href) {
      links.push(attrs.href);
    }
  }
  return links;
}

function routeCandidates(pathname) {
  let path = decodeURIComponent(pathname);
  if (!path.startsWith("/")) path = `/${path}`;
  if (path.includes("\\") || path.split("/").includes("..")) return [];

  const cleanPath = path.replace(/^\/+/, "");
  if (!cleanPath) return [join(outputDirectory, "index.html")];

  const candidates = [join(outputDirectory, cleanPath)];
  if (path.endsWith("/")) {
    candidates.push(join(outputDirectory, cleanPath, "index.html"));
    candidates.push(join(outputDirectory, `${cleanPath.slice(0, -1)}.html`));
  } else if (!extname(cleanPath)) {
    candidates.push(join(outputDirectory, cleanPath, "index.html"));
    candidates.push(join(outputDirectory, `${cleanPath}.html`));
  }
  return candidates;
}

function generatedPath(pathname) {
  return routeCandidates(pathname).find(
    (path) => existsSync(path) && !statSync(path).isDirectory(),
  );
}

function fragmentExists(path, hash) {
  if (!hash || !path || extname(path) !== ".html") return true;
  const fragment = decodeURIComponent(hash.slice(1));
  const html = readFileSync(path, "utf8");
  const escaped = fragment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(?:id|name)=["']${escaped}["']`, "i").test(html);
}

function checkReference(reference, sourceUrl, sourceDescription) {
  const value = reference.trim();
  if (!value || value.startsWith("#")) return;

  let url;
  try {
    url = new URL(value, sourceUrl);
  } catch {
    fail(`${sourceDescription}: invalid URL ${JSON.stringify(value)}`);
    return;
  }

  if (url.protocol === "mailto:" || url.protocol === "tel:") return;
  if (url.protocol !== "http:" && url.protocol !== "https:") return;
  if (url.origin !== siteOrigin.origin) return;

  const target = generatedPath(url.pathname);
  if (!target) {
    fail(`${sourceDescription}: broken internal reference ${url.href}`);
    return;
  }
  if (!fragmentExists(target, url.hash)) {
    fail(`${sourceDescription}: missing fragment ${url.href}`);
  }
  const targetRoute = outputRoute(target);
  if (
    targetRoute &&
    extname(target) === ".html" &&
    targetRoute !== "/" &&
    url.pathname.endsWith("/")
  ) {
    fail(`${sourceDescription}: page reference must be slashless ${url.href}`);
  }
}

function sourceUrlForRoute(route) {
  return new URL(route, siteOrigin);
}

function checkHtmlDocuments(routes) {
  for (const { path, route } of routes) {
    const html = readFileSync(path, "utf8");
    const sourceUrl = sourceUrlForRoute(route);
    const canonical = canonicalLinks(html);

    if (canonical.length !== 1) {
      fail(`${route}: expected exactly one canonical URL, found ${canonical.length}`);
    } else {
      const expected = sourceUrl.href;
      let actual;
      try {
        actual = new URL(canonical[0], sourceUrl).href;
      } catch {
        fail(`${route}: invalid canonical URL ${JSON.stringify(canonical[0])}`);
      }
      if (actual && actual !== expected) {
        fail(`${route}: canonical URL is ${actual}; expected ${expected}`);
      }
      checkReference(canonical[0], sourceUrl, `${route} canonical`);
    }

    for (const reference of htmlReferences(html)) {
      checkReference(reference, sourceUrl, route);
    }
  }
}

function checkSitemap(routes) {
  const indexXml = readOutputFile("sitemap-index.xml");
  if (!indexXml) {
    fail("missing dist/sitemap-index.xml");
    return [];
  }

  const sitemapUrls = xmlValues(indexXml, "loc");
  if (sitemapUrls.length === 0) fail("sitemap-index.xml has no sitemap locations");

  const sitemapRoutes = [];
  for (const sitemapUrl of sitemapUrls) {
    let url;
    try {
      url = new URL(sitemapUrl);
    } catch {
      fail(`sitemap-index.xml: invalid sitemap location ${sitemapUrl}`);
      continue;
    }
    if (url.origin !== siteOrigin.origin) {
      fail(`sitemap-index.xml: external sitemap location ${sitemapUrl}`);
      continue;
    }

    const sitemapPath = generatedPath(url.pathname);
    if (!sitemapPath || extname(sitemapPath) !== ".xml") {
      fail(`sitemap-index.xml: missing sitemap file ${sitemapUrl}`);
      continue;
    }
    const xml = readFileSync(sitemapPath, "utf8");
    for (const pageUrl of xmlValues(xml, "loc")) {
      let page;
      try {
        page = new URL(pageUrl);
      } catch {
        fail(`${relative(outputDirectory, sitemapPath)}: invalid page location ${pageUrl}`);
        continue;
      }
      if (page.origin !== siteOrigin.origin) {
        fail(`${relative(outputDirectory, sitemapPath)}: external page location ${pageUrl}`);
        continue;
      }
      if (page.pathname !== "/" && page.pathname.endsWith("/")) {
        fail(
          `${relative(outputDirectory, sitemapPath)}: page location must be slashless ${pageUrl}`,
        );
      }
      const target = generatedPath(page.pathname);
      if (!target || extname(target) !== ".html") {
        fail(`${relative(outputDirectory, sitemapPath)}: broken page location ${pageUrl}`);
        continue;
      }
      sitemapRoutes.push(page.pathname);
    }
  }

  const uniqueSitemapRoutes = new Set(sitemapRoutes);
  if (uniqueSitemapRoutes.size !== sitemapRoutes.length) {
    fail("sitemap contains duplicate page locations");
  }

  const expectedRoutes = routes.map((entry) => entry.route).filter((route) => route !== "/404");
  const missing = expectedRoutes.filter((route) => !uniqueSitemapRoutes.has(route));
  if (missing.length > 0) {
    fail(`sitemap is missing generated routes: ${missing.join(", ")}`);
  }
  return [...uniqueSitemapRoutes];
}

function checkRobots() {
  const robots = readOutputFile("robots.txt");
  if (!robots) {
    fail("missing dist/robots.txt");
    return;
  }
  const expectedSitemap = new URL("/sitemap-index.xml", siteOrigin).href;
  const sitemapLine = robots.match(/^Sitemap:\s*(\S+)\s*$/im)?.[1];
  if (sitemapLine !== expectedSitemap) {
    fail(`robots.txt: expected Sitemap: ${expectedSitemap}`);
  }
  if (!/^User-agent:\s*\*\s*$/im.test(robots)) {
    fail("robots.txt: missing User-agent: * entry");
  }
  checkReference(sitemapLine ?? "", new URL("/robots.txt", siteOrigin), "robots.txt");
}

function checkRss() {
  const rss = readOutputFile("rss.xml");
  if (!rss) {
    fail("missing dist/rss.xml");
    return;
  }
  if (!/<rss\b[^>]*>[\s\S]*<channel>/i.test(rss)) {
    fail("rss.xml: missing RSS channel");
  }

  const rssUrl = new URL("/rss.xml", siteOrigin).href;
  const selfUrl = rss.match(/<atom:link\b[^>]*\bhref=["']([^"']+)["']/i)?.[1];
  if (selfUrl !== rssUrl) fail(`rss.xml: expected atom self URL ${rssUrl}`);
  const channelLink = xmlValues(rss, "link")[0];
  let channelUrl;
  try {
    channelUrl = new URL(channelLink);
  } catch {
    fail(`rss.xml: invalid channel link ${channelLink}`);
  }
  if (channelUrl && (channelUrl.origin !== siteOrigin.origin || channelUrl.pathname !== "/")) {
    fail(`rss.xml: expected channel link at ${siteOrigin.origin}`);
  }

  for (const link of xmlValues(rss, "link").slice(1)) {
    checkReference(link, new URL("/rss.xml", siteOrigin), "rss.xml item");
  }
  checkReference(selfUrl ?? "", new URL("/rss.xml", siteOrigin), "rss.xml");
}

function checkLlms(hasBlogRoute) {
  const llms = readOutputFile("llms.txt");
  if (!llms) {
    fail("missing dist/llms.txt");
    return;
  }

  const sourceUrl = new URL("/llms.txt", siteOrigin);
  const links = [...llms.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)].map((match) => match[1]);
  for (const link of links) checkReference(link, sourceUrl, "llms.txt");

  if (!hasBlogRoute) {
    const hasWritingLink = links.some((link) => {
      try {
        const url = new URL(link, sourceUrl);
        return url.origin === siteOrigin.origin && url.pathname === "/blog";
      } catch {
        return false;
      }
    });
    if (hasWritingLink) {
      fail("llms.txt advertises /blog even though no blog route was generated");
    }
  }
}

const routes = htmlRoutes();
if (routes.length === 0) {
  fail(`no generated HTML files found in ${outputDirectory}`);
}

checkHtmlDocuments(routes);
const sitemapRoutes = checkSitemap(routes);
checkRobots();
checkRss();
checkLlms(sitemapRoutes.some((route) => route === "/blog" || route.startsWith("/blog/")));

if (failures.length > 0) {
  console.error(`site contract failed with ${failures.length} issue(s):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(
    `site contract passed: ${routes.length} HTML routes, ${sitemapRoutes.length} sitemap routes`,
  );
}
