import type { APIRoute } from "astro";
import { projects } from "../data/projects";
import { library } from "../data/library";
import { experience } from "../data/experience";
import { SITE_URL as SITE, SOCIAL_PROFILES } from "../consts";
import { getBlogPosts, type BlogPost } from "../data/blog";
import { withOutboundTracking } from "../utils/outbound-url";

function generateLlmsTxt(posts: BlogPost[]): string {
  const projectLines = projects
    .map((p) => {
      const prefix = p.href
        ? `[${p.name}](${withOutboundTracking(p.href, "llms")})`
        : `${p.name} (private)`;
      return `- ${prefix}: ${p.description} (${p.tools.join(", ")})`;
    })
    .join("\n");

  const bookLines = library
    .map((year) => `- ${year.year}:\n${year.books.map((b) => `  - ${b.title}`).join("\n")}`)
    .join("\n");

  const experienceLines = experience
    .map((entry) => {
      const location = entry.location ? `; ${entry.location}` : "";
      const noteLink = entry.note ? withOutboundTracking(entry.note.href, "llms") : "";
      const note = entry.note ? `: ${entry.note.text} [${entry.note.linkLabel}](${noteLink})` : "";
      return `- ${entry.role} at ${entry.company} (${entry.period}${location})${note}`;
    })
    .join("\n");

  const writingSection =
    posts.length > 0
      ? `## Writing\n\n${posts
          .map(
            (post) => `- [${post.data.title}](${SITE}/blog/${post.id}): ${post.data.description}`,
          )
          .join("\n")}\n\n`
      : "";

  const writingPageLine =
    posts.length > 0 ? `- [Writing](${SITE}/blog): Writing by Garrett Ladley` : "";

  const pageLines = [
    `- [Home](${SITE}/): Overview with role, location, and focus areas`,
    `- [Experience](${SITE}/experience): Professional history with roles, dates, locations, and career notes`,
    writingPageLine,
    `- [Projects](${SITE}/projects): Open-source and personal software projects`,
    `- [Library](${SITE}/library): Books read by year`,
    `- [RSS](${SITE}/rss.xml): Feed for new writing`,
  ]
    .filter(Boolean)
    .join("\n");

  return `# Garrett Ladley

> Personal website of Garrett Ladley, Software Engineer at Klaviyo, based in Boston, MA.

## About

Garrett Ladley is a software engineer specializing in Go and Rust. He currently works as a Software Engineer at Klaviyo. He is based in Boston, MA.

## Links

- Website: ${SITE}
- GitHub: ${withOutboundTracking(SOCIAL_PROFILES.github.url, "llms")}
- LinkedIn: ${withOutboundTracking(SOCIAL_PROFILES.linkedin.url, "llms")}
- X: ${withOutboundTracking(SOCIAL_PROFILES.x.url, "llms")}

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

export const GET: APIRoute = async () => {
  const posts = await getBlogPosts();

  return new Response(generateLlmsTxt(posts), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
