import { PERSON, ROLE_AND_COMPANY, SOCIAL_PROFILES } from "../consts";

export function personId(site: URL): string {
  return new URL("/#person", site).href;
}

export function personSchema(site: URL) {
  return {
    "@type": "Person",
    "@id": personId(site),
    name: PERSON.name,
    url: new URL("/", site).href,
    description: `${PERSON.description} ${ROLE_AND_COMPANY} in ${PERSON.location}.`,
    jobTitle: PERSON.role,
    worksFor: { "@type": "Organization", name: PERSON.company },
    knowsAbout: PERSON.knowsAbout,
    alumniOf: PERSON.alumniOf,
    sameAs: Object.values(SOCIAL_PROFILES).map((profile) => profile.url),
  };
}
