// src/components/features/home/Hero/index.ts

// ✅ TBH Hero Components Barrel Exports
export { default as Hero } from './Hero';
export { default as HeroSectionWrapper } from './HeroSectionWrapper';
export { default as HeroSelector } from './HeroSelector';

// ✅ Named exports for better tree-shaking
export { default } from './Hero';

// ✅ Type exports (if you add interfaces later)
// export type { HeroProps } from './Hero';
// export type { HeroSectionWrapperProps } from './HeroSectionWrapper';