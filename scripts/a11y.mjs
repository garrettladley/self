import { existsSync, readFileSync, readdirSync } from "node:fs";
import { extname, join, relative, resolve } from "node:path";
import process from "node:process";

import AxeBuilder from "@axe-core/playwright";
import { chromium } from "playwright";

const baseURL = process.env.A11Y_BASE_URL ?? "http://localhost:4321";
const outputDirectory = resolve(process.env.SITE_OUTPUT_DIR ?? "dist");

function outputFiles(directory = outputDirectory) {
  if (!existsSync(directory)) return [];

  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? outputFiles(path) : [path];
  });
}

function routeFromHtml(path) {
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

function xmlLocations(xml) {
  return [...xml.matchAll(/<loc>([\s\S]*?)<\/loc>/gi)].map((match) =>
    match[1].trim().replaceAll("&amp;", "&").replaceAll("&lt;", "<").replaceAll("&gt;", ">"),
  );
}

function sitemapRoutes() {
  const indexPath = join(outputDirectory, "sitemap-index.xml");
  if (!existsSync(indexPath)) return [];

  const routes = [];
  for (const sitemapLocation of xmlLocations(readFileSync(indexPath, "utf8"))) {
    let sitemapURL;
    try {
      sitemapURL = new URL(sitemapLocation);
    } catch {
      continue;
    }
    const sitemapPath = join(
      outputDirectory,
      decodeURIComponent(sitemapURL.pathname).replace(/^\/+/, ""),
    );
    if (!existsSync(sitemapPath)) continue;
    for (const pageLocation of xmlLocations(readFileSync(sitemapPath, "utf8"))) {
      try {
        const pageURL = new URL(pageLocation);
        routes.push(pageURL.pathname || "/");
      } catch {
        // A malformed location is reported by the site contract check.
      }
    }
  }
  return routes;
}

function generatedRoutes() {
  const routes = new Set(sitemapRoutes());
  for (const path of outputFiles()) {
    if (extname(path) !== ".html") continue;
    const route = routeFromHtml(path);
    if (route) routes.add(route);
  }
  return [...routes].sort((a, b) => a.localeCompare(b));
}

const routes = generatedRoutes();
if (routes.length === 0) {
  console.error(`no generated routes found in ${outputDirectory}`);
  process.exitCode = 1;
  process.exit();
}

const viewports = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 375, height: 812 },
];
const browser = await chromium.launch({ headless: true });
let failed = false;

try {
  for (const viewport of viewports) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
    });

    try {
      for (const route of routes) {
        const page = await context.newPage();
        const url = new URL(route, baseURL);
        const response = await page.goto(url.href, {
          waitUntil: "networkidle",
        });

        if (!response?.ok()) {
          console.error(
            `${viewport.name} ${route}: returned ${response?.status() ?? "no response"}`,
          );
          failed = true;
          await page.close();
          continue;
        }

        const results = await new AxeBuilder({ page }).analyze();
        if (results.violations.length > 0) {
          console.error(
            `${viewport.name} ${route}: ${results.violations.length} accessibility violations`,
          );
          for (const violation of results.violations) {
            console.error(`  ${violation.id}: ${violation.help}`);
          }
          failed = true;
        } else {
          console.log(`${viewport.name} ${route}: no accessibility violations`);
        }

        await page.close();
      }
    } finally {
      await context.close();
    }
  }
} finally {
  await browser.close();
}

if (failed) process.exitCode = 1;
