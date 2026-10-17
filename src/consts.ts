export const PERSON = {
  name: "Garrett Ladley",
  role: "Software Engineer",
  company: "Klaviyo",
  location: "Boston, MA",
  bio: "I work on products and distributed systems.",
  aside: "Massive Gopher.",
  description:
    "Software engineer specializing in Go and Rust, passionate about building products, backend development, and distributed systems.",
  knowsAbout: [
    "Go",
    "Rust",
    "Backend Development",
    "Distributed Systems",
    "AI Agents",
    "Infrastructure",
  ],
  alumniOf: [
    {
      "@type": "CollegeOrUniversity",
      name: "Northeastern University",
    },
    {
      "@type": "HighSchool",
      name: "New Canaan High School",
    },
    {
      "@type": "MiddleSchool",
      name: "Hong Kong International School",
    },
  ],
} as const;

export const AUTHOR = PERSON.name;
export const ROLE_AND_COMPANY = `${PERSON.role} at ${PERSON.company}`;
export const SITE_DESCRIPTION = `${ROLE_AND_COMPANY}, based in ${PERSON.location}. ${PERSON.bio}`;

export const SOCIAL_PROFILES = {
  github: {
    label: "GitHub",
    url: "https://github.com/garrettladley",
  },
  x: {
    label: "X",
    url: "https://x.com/garrettladley",
    handle: "@garrettladley",
  },
  linkedin: {
    label: "LinkedIn",
    url: "https://linkedin.com/in/garrettladley",
  },
} as const;
