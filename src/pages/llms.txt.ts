import type { APIRoute } from "astro";
import { projects } from "../data/projects";
import { library } from "../data/library";
import { experience } from "../data/experience";
import { SOCIAL_PROFILES } from "../consts";
import { getBlogPosts, type BlogPost } from "../data/blog";
import { getSiteUrl } from "../utils/site-url";

function generateLlmsTxt(posts: BlogPost[], site: URL): string {
  const absoluteUrl = (path: string) => new URL(path, site).href;

  const projectLines = projects
    .map((p) => {
      const prefix = p.href ? `[${p.name}](${p.href})` : `${p.name} (private)`;
      return `- ${prefix}: ${p.description} (${p.tools.join(", ")})`;
    })
    .join("\n");

  const bookLines = library
    .map((year) => `- ${year.year}:\n${year.books.map((b) => `  - ${b.title}`).join("\n")}`)
    .join("\n");

  const experienceLines = experience
    .map((entry) => {
      const location = entry.location ? `; ${entry.location}` : "";
      const note = entry.note
        ? `: ${entry.note.text} [${entry.note.linkLabel}](${entry.note.href})`
        : "";
      return `- ${entry.role} at ${entry.company} (${entry.period}${location})${note}`;
    })
    .join("\n");

  const writingSection =
    posts.length > 0
      ? `## Writing\n\n${posts
          .map(
            (post) =>
              `- [${post.data.title}](${absoluteUrl(`/blog/${post.id}`)}): ${post.data.description}`,
          )
          .join("\n")}\n\n`
      : "";

  const writingPageLine =
    posts.length > 0 ? `- [Writing](${absoluteUrl("/blog")}): Writing by Garrett Ladley` : "";

  const pageLines = [
    `- [Home](${absoluteUrl("/")}): Overview with role, location, and focus areas`,
    `- [Experience](${absoluteUrl("/experience")}): Professional history with roles, dates, locations, and career notes`,
    writingPageLine,
    `- [Projects](${absoluteUrl("/projects")}): Open-source and personal software projects`,
    `- [Library](${absoluteUrl("/library")}): Books read by year`,
    `- [RSS](${absoluteUrl("/rss.xml")}): Feed for new writing`,
  ]
    .filter(Boolean)
    .join("\n");

  return `# Garrett Ladley

> Personal website of Garrett Ladley, Software Engineer at Klaviyo, based in Boston, MA.

## About

Garrett Ladley is a software engineer specializing in Go and Rust. He currently works as a Software Engineer at Klaviyo. He is based in Boston, MA.

## Links

- Website: ${site.origin}
- GitHub: ${SOCIAL_PROFILES.github.url}
- LinkedIn: ${SOCIAL_PROFILES.linkedin.url}
- X: ${SOCIAL_PROFILES.x.url}

## Pages

${pageLines}

## Experience

${experienceLines}

${writingSection}## Projects

${projectLines}

## Library

${bookLines}
`;
}

export const GET: APIRoute = async (context) => {
  const posts = await getBlogPosts();

  return new Response(generateLlmsTxt(posts, getSiteUrl(context)), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
