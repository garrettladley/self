import type { APIRoute } from "astro";
import { projects } from "../data/projects";
import { library } from "../data/library";

const SITE = "https://garrettladley.com";

function generateLlmsTxt(): string {
  const projectLines = projects
    .map((p) => {
      const prefix = p.href ? `[${p.name}](${p.href})` : `${p.name} (private)`;
      return `- ${prefix}: ${p.description} (${p.tools.join(", ")})`;
    })
    .join("\n");

  const bookLines = library
    .map((year) => `- ${year.year}:\n${year.books.map((b) => `  - ${b.title}`).join("\n")}`)
    .join("\n");

  return `# Garrett Ladley

> Personal website of Garrett Ladley, Member of Technical Staff at Agency AI, based in New York City.

## About

Garrett Ladley is a software engineer specializing in Go and Rust. He currently works as a Member of Technical Staff at Agency AI. He is based in New York City.

## Links

- Website: ${SITE}
- GitHub: https://github.com/garrettladley
- LinkedIn: https://linkedin.com/in/garrett-ladley
- X: https://x.com/GarrettLadley

## Pages

- [Home](${SITE}/): Overview with role, location, and focus areas
- [Projects](${SITE}/projects): Open-source and personal software projects
- [Library](${SITE}/library): Books read by year

## Projects

${projectLines}

## Library

${bookLines}
`;
}

export const GET: APIRoute = () => {
  return new Response(generateLlmsTxt(), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
