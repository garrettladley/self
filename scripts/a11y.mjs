import { readdirSync } from "node:fs";
import process from "node:process";

import AxeBuilder from "@axe-core/playwright";
import { chromium } from "playwright";

const baseURL = process.env.A11Y_BASE_URL ?? "http://localhost:4321";
const pageFiles = readdirSync("src/pages", { recursive: true }).filter(
  (file) => file.endsWith(".astro") && !file.includes("["),
);

const routes = pageFiles.map((file) => {
  const pagePath = file.replaceAll("\\", "/").replace(/\.astro$/, "");
  const route = `/${pagePath === "index" ? "" : pagePath.replace(/\/index$/, "")}`;

  return route === "/" ? route : route.replace(/\/$/, "");
});

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();
let failed = false;

try {
  for (const route of routes) {
    const page = await context.newPage();
    const url = new URL(route, baseURL);
    const response = await page.goto(url.href, { waitUntil: "networkidle" });

    if (!response?.ok()) {
      console.error(`${route}: returned ${response?.status() ?? "no response"}`);
      failed = true;
      await page.close();
      continue;
    }

    const results = await new AxeBuilder({ page }).analyze();
    if (results.violations.length > 0) {
      console.error(`${route}: ${results.violations.length} accessibility violations`);
      for (const violation of results.violations) {
        console.error(`  ${violation.id}: ${violation.help}`);
      }
      failed = true;
    } else {
      console.log(`${route}: no accessibility violations`);
    }

    await page.close();
  }
} finally {
  await context.close();
  await browser.close();
}

if (failed) {
  process.exitCode = 1;
}
