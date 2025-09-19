// src/data/portfolioData.ts

export interface PortfolioItem {
  title: string;
  videoSrc: string;
  fallbackImage: string;
  description: string;
}

export interface PortfolioSection {
  sectionTitle: string;
  sectionDescription: string;
  portfolioItems: PortfolioItem[];
}

const portfolioData: PortfolioSection = {
  sectionTitle: "Our Work",
  sectionDescription: "Explore our recent projects and see how we bring digital visions to life.",
  portfolioItems: [
    {
      title: "Marketing Automation",
      videoSrc: "/videos/Website-Videos/website-marketing-crm-1-1.mp4",
      fallbackImage: "/images/600x400-web site holder.png",
      description: "Automate and optimize your marketing campaigns with CRM integration and AI-powered analytics.",
    },
    {
      title: "Content Creation",
      videoSrc: "/videos/Website-Videos/website-video-and-content-1-1.mp4",
      fallbackImage: "/images/600x400-web site holder.png",
      description: "Engaging video production, graphics, and digital storytelling tailored for your audience.",
    },
    {
      title: "Web Development",
      videoSrc: "/videos/Website-Videos/website-websites-1-1.mp4",
      fallbackImage: "/images/600x400-web site holder.png",
      description: "Custom-built, responsive, and scalable web solutions to drive business growth.",
    },
  ],
};

export default portfolioData;
