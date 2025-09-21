import type { CompanyStory } from "./types";

const companyStory: CompanyStory = {
  heading: "Our Story",
  subheading: "From scrappy beginnings to measurable outcomes at scale",
  video: {
    src: "/videos/about/company-story.mp4",
    fallbackImage: "/images/about/company-story-fallback.jpg",
    controls: true,
    autoplay: false,
    loop: false,
    muted: false,
  },
  body: [
    {
      type: "paragraph",
      content:
        "We started with a simple idea: combine craftsmanship with performance. Today, we partner with teams to ship work that compounds over time.",
    },
    {
      type: "list",
      items: [
        "Pragmatic strategy, not fluff",
        "Systems that scale with your goals",
        "Visibility, speed, and clear KPIs",
      ],
    },
  ],
  highlights: ["100+ projects delivered", "Avg. 35% lift in key KPIs", "Multi-disciplinary team"],
};

export default companyStory;
