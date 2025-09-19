// website/src/mock/about/companystory.ts

export interface CompanyStoryCTA {
  text: string;
  link: string;
}

export interface CompanyStoryVideo {
  src: string;
  fallbackImage: string;
  alt: string;
}

export interface CompanyStoryData {
  id: string;
  variant: "story" | string;
  title: string;
  description: string;
  highlight?: string;
  cta?: CompanyStoryCTA;
  video?: CompanyStoryVideo;
}

export const companyStoryData: CompanyStoryData = {
  id: "company-story",
  variant: "story",
  title: "Our Story",
  description:
    "Founded in 2018, TBH Digital Solutions set out with a vision to revolutionize digital experiences. Our expertise in innovation, creativity, and technology empowers brands to thrive in the digital landscape.",
  highlight: "Follow the link below to continue reading.",
  cta: {
    text: "Learn More",
    link: "/about",
  },
  video: {
    src: "/videos/Website-Videos/website-marketing-crm-1-1.mp4",
    fallbackImage: "/images/keyboard-temp-2.jpg",
    alt: "Company Introduction Video",
  },
};
