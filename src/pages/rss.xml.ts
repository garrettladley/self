import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import type { APIContext } from "astro";

const SITE = "https://garrettladley.com";
const FEED_PATH = "/rss.xml";

export async function GET(context: APIContext) {
  const posts = (await getCollection("blog", ({ data }) => !data.draft)).sort(
    (a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime(),
  );

  const site = context.site ?? new URL(SITE);
  const feedUrl = new URL(FEED_PATH, site).href;
  const lastBuildDate = posts.reduce<Date | undefined>((latest, post) => {
    const postBuildDate = post.data.updatedDate ?? post.data.pubDate;
    return latest && latest > postBuildDate ? latest : postBuildDate;
  }, undefined);

  const customData = [
    "<language>en-us</language>",
    `<atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />`,
    "<docs>https://www.rssboard.org/rss-specification</docs>",
    "<generator>@astrojs/rss</generator>",
    lastBuildDate && `<lastBuildDate>${lastBuildDate.toUTCString()}</lastBuildDate>`,
  ]
    .filter(Boolean)
    .join("");

  return rss({
    title: "Garrett Ladley",
    description: "Writing by Garrett Ladley.",
    site,
    xmlns: {
      atom: "http://www.w3.org/2005/Atom",
    },
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: `/blog/${post.id}/`,
      categories: post.data.tags,
    })),
    customData,
  });
}
