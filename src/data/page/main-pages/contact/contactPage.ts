// src/data/page/main-pages/contact/contactPage.ts
// Aggregates all Contact page data into a single, typed object.
// Default export: ContactPageData
// Also exports named sections for flexibility.

import type { ContactPageData } from "./types";

import hero from "./hero";
import options from "./contact-options";
import info from "./contact-info";
import faq from "./contactfaq";
import trust from "./trust-signals";
import location from "./location";
import cta from "./cta";

// Minimal dev-time sanity checks (no runtime deps)
function devAssertValid(data: ContactPageData) {
  if (process.env.NODE_ENV === "production") return;

  const problems: string[] = [];

  // Hero
  if (!data.hero?.title) problems.push("hero.title is required");

  // Options
  if (!Array.isArray(data.options) || data.options.length === 0) {
    problems.push("options must be a non-empty array");
  } else {
    data.options.forEach((o) => {
      if (!o.id || !o.title || !o.href) {
        problems.push(`options[${o.id ?? "?"}] missing id/title/href`);
      }
    });
  }

  // Info
  if (!Array.isArray(data.info?.items) || data.info.items.length === 0) {
    problems.push("info.items must be a non-empty array");
  }

  // FAQ
  if (!data.faq?.title) problems.push("faq.title is required");
  if (!Array.isArray(data.faq?.items)) problems.push("faq.items must be an array");

  // Trust (optional title; items required)
  if (!Array.isArray(data.trust?.items) || data.trust.items.length === 0) {
    problems.push("trust.items must be a non-empty array");
  }

  // Location (must have either embed URL or lat/lng + at least one address line)
  const hasEmbed = Boolean(data.location?.mapEmbedUrl);
  const hasLatLng = typeof data.location?.lat === "number" && typeof data.location?.lng === "number";
  if (!data.location?.addressLines?.length) problems.push("location.addressLines must include at least one line");
  if (!hasEmbed && !hasLatLng) problems.push("location requires mapEmbedUrl or lat/lng");

  // CTA
  if (!data.cta?.title || !data.cta?.primaryCta?.href) {
    problems.push("cta.title and cta.primaryCta.href are required");
  }

  if (problems.length) {
    // eslint-disable-next-line no-console
    console.warn(
      "[contactPage] data validation warnings:\n - " + problems.join("\n - ")
    );
  }
}

const contactPageData: ContactPageData = {
  hero,
  options,
  info,
  faq,
  trust,
  location,
  cta,
} as const;

devAssertValid(contactPageData);

export default contactPageData;

// Optional named exports if other pages want to pick specific sections
export { hero, options, info, faq, trust, location, cta };
