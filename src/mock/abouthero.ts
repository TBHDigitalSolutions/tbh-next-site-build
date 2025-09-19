// website/src/mock/abouthero.ts

export interface AboutHeroData {
  title: string;
  highlight: string;
  subtitle: string;
  cta: {
    text: string;
    link: string;
  };
}

export const aboutHero: AboutHeroData = {
  title: "Welcome to",
  highlight: "TBH Digital Solutions",
  subtitle: "We craft cutting-edge digital experiences that elevate brands.",
  cta: {
    text: "Partner With Us Today!",
    link: "/careers",
  },
};
