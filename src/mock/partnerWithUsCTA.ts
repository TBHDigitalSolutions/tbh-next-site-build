// website/src/mock/partnerWithUsCTA.ts

export interface PartnerWithUsCTA {
  title: string;
  description: string;
  highlights: string[];
  cta: {
    text: string;
    link: string;
  };
}

const partnerWithUsCTA: PartnerWithUsCTA = {
  title: "Partner with Us for Growth",
  description:
    "Join forces with our team and expand your business reach through strategic collaborations and partnerships. We offer mutually beneficial opportunities to scale together.",
  highlights: [
    "Access to our extensive network",
    "Exclusive co-marketing opportunities",
    "Shared expertise & innovation",
    "Revenue-sharing potential",
    "Seamless integration with our services",
  ],
  cta: {
    text: "Become a Partner",
    link: "/partnerships",
  },
};

export default partnerWithUsCTA;
