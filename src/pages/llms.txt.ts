import type { APIRoute } from "astro";
import { projects } from "../data/projects";
import { library } from "../data/library";
import { SITE_URL as SITE, SOCIAL_PROFILES } from "../consts";
import { getBlogPosts, type BlogPost } from "../data/blog";

function generateLlmsTxt(posts: BlogPost[]): string {
  const projectLines = projects
    .map((p) => {
      const prefix = p.href ? `[${p.name}](${p.href})` : `${p.name} (private)`;
      return `- ${prefix}: ${p.description} (${p.tools.join(", ")})`;
    })
    .join("\n");

  const bookLines = library
    .map((year) => `- ${year.year}:\n${year.books.map((b) => `  - ${b.title}`).join("\n")}`)
    .join("\n");

  const postLines =
    posts.length > 0
      ? posts
          .map(
            (post) => `- [${post.data.title}](${SITE}/blog/${post.id}/): ${post.data.description}`,
          )
          .join("\n")
      : "- No published posts yet";

  return `# Garrett Ladley

> Personal website of Garrett Ladley, Member of Technical Staff at Agency AI, based in New York City.

## About

Garrett Ladley is a software engineer specializing in Go and Rust. He currently works as a Member of Technical Staff at Agency AI. He is based in New York City.

## Links

- Website: ${SITE}
- GitHub: ${SOCIAL_PROFILES.github.url}
- LinkedIn: ${SOCIAL_PROFILES.linkedin.url}
- X: ${SOCIAL_PROFILES.x.url}

## Pages

- [Home](${SITE}/): Overview with role, location, and focus areas
- [Writing](${SITE}/blog): Writing by Garrett Ladley
- [Projects](${SITE}/projects): Open-source and personal software projects
- [Library](${SITE}/library): Books read by year
- [RSS](${SITE}/rss.xml): Feed for new writing

## Writing

${postLines}

## Projects

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
