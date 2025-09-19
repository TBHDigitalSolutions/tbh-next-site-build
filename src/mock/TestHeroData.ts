// website/src/mock/TestHeroData.ts

export interface HeroCTA {
  text: string;
  link: string;
}

export interface TestHeroData {
  title: string;
  highlight: string;
  subtitle: string;
  cta: HeroCTA;
}

const testHeroData: TestHeroData = {
  title: "Welcome to",
  highlight: "TEST PAGE HERO",
  subtitle: "We craft cutting-edge digital experiences that elevate brands.",
  cta: {
    text: "TEST PAGE HERO!",
    link: "/careers",
  },
};

export default testHeroData;
