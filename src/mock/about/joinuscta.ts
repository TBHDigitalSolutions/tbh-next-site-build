// website/src/mock/about/joinuscta.ts

export interface JoinUsCTA {
  title: string;
  description: string;
  cta: {
    text: string;
    link: string;
  };
}

export const joinUsCTAData: JoinUsCTA = {
  title: "Ready to Join Us?",
  description: "Explore our career opportunities and become part of our innovative team.",
  cta: {
    text: "View Open Positions →",
    link: "/careers",
  },
};
