export const includes = [
  {
    title: "Strategy & Planning",
    items: [
      { label: "Topic & format selection", note: "Agenda, speakers, value proposition" },
      { label: "Run-of-show", note: "Detailed timeline incl. Q&A and handoffs" },
    ],
  },
  {
    title: "Setup",
    items: [
      { label: "Platform configuration", note: "Zoom/WebinarJam/Livestorm or similar" },
      { label: "Registration page", note: "Conversion-optimized form & confirmation" },
      { label: "Email promo sequence", note: "Invite, reminder, last-call, and thank-you" },
      { label: "Dry run", note: "Presenter tech check and timing rehearsal" },
    ],
  },
  {
    title: "Delivery & Post-Event",
    items: [
      { label: "Live event moderation", note: "Host intro, Q&A triage, recording" },
      { label: "Replay setup", note: "On-demand page and follow-up email" },
      { label: "Performance report", note: "Registrations, show-up, engagement, next steps" },
    ],
  },
] as const;
