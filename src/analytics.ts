export const ANALYTICS_EVENTS = {
  blogPostViewed: "blog_post_viewed",
  experienceLinkClicked: "experience_link_clicked",
  externalLinkClicked: "external_link_clicked",
  projectLinkClicked: "project_link_clicked",
  rssFeedClicked: "rss_feed_clicked",
} as const;

type AnalyticsEventProperties = {
  [ANALYTICS_EVENTS.blogPostViewed]: {
    title: string;
    tags: string[];
  };
  [ANALYTICS_EVENTS.experienceLinkClicked]: {
    label: string;
    href: string;
  };
  [ANALYTICS_EVENTS.externalLinkClicked]: {
    label: string;
    href: string;
  };
  [ANALYTICS_EVENTS.projectLinkClicked]: {
    project_name: string;
    href: string;
  };
  [ANALYTICS_EVENTS.rssFeedClicked]: undefined;
};

type AnalyticsEvent = keyof AnalyticsEventProperties;
type ClickEvent = Exclude<AnalyticsEvent, "blog_post_viewed">;

declare global {
  interface Window {
    __analytics_initialized?: boolean;
    __posthog_initialized?: boolean;
    posthog?: {
      capture(event: string, properties?: Record<string, unknown>): void;
    };
  }
}

function capture<Event extends AnalyticsEvent>(
  event: Event,
  ...properties: AnalyticsEventProperties[Event] extends undefined
    ? []
    : [AnalyticsEventProperties[Event]]
) {
  window.posthog?.capture(event, properties[0] as Record<string, unknown> | undefined);
}

function isClickEvent(event: string): event is ClickEvent {
  return (
    event === ANALYTICS_EVENTS.experienceLinkClicked ||
    event === ANALYTICS_EVENTS.externalLinkClicked ||
    event === ANALYTICS_EVENTS.projectLinkClicked ||
    event === ANALYTICS_EVENTS.rssFeedClicked
  );
}

function linkProperties(link: HTMLAnchorElement) {
  return {
    label: link.textContent?.trim() ?? "",
    href: link.getAttribute("href") ?? "",
  };
}

function captureTrackedClick(event: MouseEvent) {
  if (!(event.target instanceof Element)) return;

  const link = event.target.closest<HTMLAnchorElement>("a[data-analytics-event]");
  if (!link) return;

  const eventName = link.dataset.analyticsEvent;
  if (!eventName || !isClickEvent(eventName)) return;

  if (eventName === ANALYTICS_EVENTS.rssFeedClicked) {
    capture(eventName);
    return;
  }

  const properties = linkProperties(link);
  if (eventName === ANALYTICS_EVENTS.projectLinkClicked) {
    capture(eventName, {
      project_name: link.dataset.analyticsProjectName ?? properties.label,
      href: properties.href,
    });
    return;
  }

  capture(eventName, properties);
}

function parseTags(value: string | undefined): string[] {
  if (!value) return [];

  try {
    const tags: unknown = JSON.parse(value);
    return Array.isArray(tags) && tags.every((tag) => typeof tag === "string") ? tags : [];
  } catch {
    return [];
  }
}

function captureSemanticPageView() {
  const marker = document.querySelector<HTMLElement>(
    `[data-analytics-page-view="${ANALYTICS_EVENTS.blogPostViewed}"]`,
  );
  if (!marker) return;

  capture(ANALYTICS_EVENTS.blogPostViewed, {
    title: marker.dataset.analyticsTitle ?? "",
    tags: parseTags(marker.dataset.analyticsTags),
  });
}

export function initializeAnalytics() {
  if (window.__analytics_initialized) return;

  window.__analytics_initialized = true;
  document.addEventListener("click", captureTrackedClick);
  document.addEventListener("astro:page-load", captureSemanticPageView);
}
