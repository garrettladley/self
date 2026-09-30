import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { getBlogPosts } from "../data/blog";
import { getSiteUrl } from "../utils/site-url";

const FEED_PATH = "/rss.xml";

export async function GET(context: APIContext) {
  const posts = await getBlogPosts();

  const site = getSiteUrl(context);
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
    trailingSlash: false,
    xmlns: {
      atom: "http://www.w3.org/2005/Atom",
    },
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: `/blog/${post.id}`,
      categories: post.data.tags,
    })),
    customData,
  });
}
