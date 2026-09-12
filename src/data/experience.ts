export interface ExperienceEntry {
  company: string;
  role: string;
  period: string;
  location?: string;
  note?: {
    text: string;
    href: string;
    linkLabel: string;
  };
}

export const experience: ExperienceEntry[] = [
  {
    company: "Klaviyo",
    role: "Software Engineer",
    period: "2026 – present",
    location: "Boston, MA",
  },
  {
    company: "Agency AI",
    role: "Member of Technical Staff",
    period: "2025 – 2026",
    note: {
      text: "Agency was acquired by Klaviyo in 2026.",
      href: "https://techcrunch.com/2026/08/05/klaviyo-acquires-elias-torres-agency-in-full-circle-reunion-for-tech-founders/",
      linkLabel: "Read the announcement.",
    },
  },
];
