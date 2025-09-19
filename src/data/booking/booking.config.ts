export type MeetingType = {
  id: string;
  label: string;
  durationMin: number;
  description?: string;
  vendor: "calcom" | "calendly" | "custom";
  url: string;
  defaultParams?: Record<string, string>;
};

export type BookingConfig = {
  hero: { title: string; subtitle?: string; blurb?: string };
  meetingTypes: MeetingType[];
  faq?: { q: string; a: string }[];
  seo?: { title?: string; description?: string };
};

export const bookingConfig: BookingConfig = {
  hero: {
    title: "Book a Discovery Call",
    subtitle: "Pick a time that works. We’ll tailor the session to your goals.",
    blurb: "No pressure. 20–30 minutes to understand your needs and outline next steps.",
  },
  meetingTypes: [
    {
      id: "discovery-30",
      label: "Discovery Call (30m)",
      durationMin: 30,
      vendor: "calcom",
      url: "https://cal.com/your-team/discovery-30",
      description: "Quick intro to map goals, scope, and fit.",
    },
    {
      id: "strategy-60",
      label: "Strategy Session (60m)",
      durationMin: 60,
      vendor: "calcom",
      url: "https://cal.com/your-team/strategy-60",
      description: "Deeper session to outline approach, milestones, and resourcing.",
    },
  ],
  faq: [
    { q: "What should I prepare?", a: "Links to your site, key goals, timelines, and any constraints." },
    { q: "Who should attend?", a: "Anyone involved in scope, budget, or outcomes." },
  ],
  seo: { title: "Book a Call", description: "Schedule a discovery or strategy call with our team." },
};
