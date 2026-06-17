import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { projects } from "../data/projects";
import { library } from "../data/library";
import { SITE_URL as SITE } from "../consts";

type PublishedPost = Awaited<ReturnType<typeof getCollection<"blog">>>[number];

function generateLlmsTxt(posts: PublishedPost[]): string {
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
- GitHub: https://github.com/garrettladley
- LinkedIn: https://linkedin.com/in/garrett-ladley
- X: https://x.com/garrettladley

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
  const posts = (await getCollection("blog", ({ data }) => !data.draft)).sort(
    (a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime(),
  );

  return new Response(generateLlmsTxt(posts), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
