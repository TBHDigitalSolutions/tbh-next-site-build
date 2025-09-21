// Single cohesive object the page consumes
import type { AboutPageData } from "./types";

import hero from "./hero";
import companyStory from "./company-story";
import coreValues from "./core-values";
import { teamSection, teamMembers } from "./team";
import { testimonialsSection, testimonials } from "./testimonials";
import joinUsCTA from "./join-us-cta";

// Minimal dev-time guard (no zod dependency)
function devAssertValid(data: AboutPageData) {
  if (process.env.NODE_ENV === "production") return;
  const problems: string[] = [];
  if (!data.companyStory?.heading) problems.push("companyStory.heading missing");
  if (!Array.isArray(data.coreValues)) problems.push("coreValues must be an array");
  if (!data.teamSection?.title) problems.push("teamSection.title missing");
  if (!Array.isArray(data.teamMembers)) problems.push("teamMembers must be an array");
  if (!data.testimonialsSection?.title) problems.push("testimonialsSection.title missing");
  if (!Array.isArray(data.testimonials)) problems.push("testimonials must be an array");
  if (!data.joinUsCTA?.title || !data.joinUsCTA?.primaryCta?.href)
    problems.push("joinUsCTA requires title and primaryCta.href");
  if (problems.length) {
    // eslint-disable-next-line no-console
    console.warn("[aboutPage] data validation warnings:\n - " + problems.join("\n - "));
  }
}

const aboutPageData: AboutPageData = {
  hero, // optional for routes that consume it
  companyStory,
  coreValues,
  teamSection,
  teamMembers,
  testimonialsSection,
  testimonials,
  joinUsCTA,
} as const;

devAssertValid(aboutPageData);

export default aboutPageData;

// Optional named exports if other pages want to pick specific sections
export {
  hero,
  companyStory,
  coreValues,
  teamSection,
  teamMembers,
  testimonialsSection,
  testimonials,
  joinUsCTA,
};
