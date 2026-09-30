const DEFAULT_SITE_URL = "https://garrettladley.com";

export function resolveSiteOrigin(env) {
  const previewHost = env.VERCEL_BRANCH_URL || env.VERCEL_URL;
  const previewUrl =
    env.VERCEL_ENV === "preview" && previewHost ? `https://${previewHost}` : undefined;
  const productionUrl =
    env.SITE_URL ||
    (env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${env.VERCEL_PROJECT_PRODUCTION_URL}`
      : DEFAULT_SITE_URL);

  return new URL(previewUrl ?? productionUrl).origin;
}
