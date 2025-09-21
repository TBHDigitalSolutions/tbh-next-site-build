// Shared types for the About page data shape

export type Video = {
  src: string;
  fallbackImage?: string;
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
};

export type HeroData = {
  title: string;
  subtitle?: string;
  background?: {
    type: "image" | "video";
    src: string;
    alt?: string;
  };
  cta?: { label: string; href: string };
};

export type CompanyStory = {
  heading: string;
  subheading?: string;
  video: Video;
  body: Array<
    | { type: "paragraph"; content: string }
    | { type: "list"; items: string[] }
  >;
  highlights?: string[];
};

export type CoreValue = {
  id: string;
  title: string;
  description: string;
  icon?: string; // emoji or icon token
};

export type TeamSection = {
  title: string;
  description?: string;
};

export type TeamMember = {
  id: string;
  name: string;
  role: string;
  photo?: string;
  bio?: string;
  links?: { label: string; url: string }[];
};

export type TestimonialsSection = {
  title: string;
  description?: string;
};

export type Testimonial = {
  id: string;
  quote: string;
  author: string;
  role?: string;
  photo?: string;
  logo?: string;
};

export type JoinUsCTAData = {
  title: string;
  subtitle?: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
};

export type AboutPageData = {
  // kept first-class so the page can destructure
  companyStory: CompanyStory;
  coreValues: CoreValue[];
  teamSection: TeamSection;
  teamMembers: TeamMember[];
  testimonialsSection: TestimonialsSection;
  testimonials: Testimonial[];
  joinUsCTA: JoinUsCTAData;

  // Optional: if a route wants to consume it directly
  hero?: HeroData;
};
