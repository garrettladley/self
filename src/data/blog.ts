import { getCollection, type CollectionEntry } from "astro:content";

export type BlogPost = CollectionEntry<"blog">;

export async function getBlogPosts(): Promise<BlogPost[]> {
  const posts = await getCollection("blog");

  return posts
    .filter((post) => import.meta.env.DEV || !post.data.draft)
    .sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());
}
