import type { APIRoute } from "astro";

export const GET: APIRoute = () =>
  new Response("OK", {
    status: 200,
    statusText: "OK",
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
