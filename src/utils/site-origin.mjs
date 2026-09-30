const DEFAULT_SITE_URL = "https://garrettladley.com";

export function resolveSiteOrigin(env) {
  const previewUrl =
    env.VERCEL_ENV === "preview" && env.VERCEL_URL ? `https://${env.VERCEL_URL}` : undefined;
  const productionUrl =
    env.SITE_URL ||
    (env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${env.VERCEL_PROJECT_PRODUCTION_URL}`
      : DEFAULT_SITE_URL);

  return new URL(previewUrl ?? productionUrl).origin;
}
