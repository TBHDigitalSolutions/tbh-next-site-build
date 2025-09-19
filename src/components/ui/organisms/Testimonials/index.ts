// src/components/ui/organisms/Testimonials/index.ts

// Default component export
export { default } from "./Testimonials";

// Named component(s)
export { default as TestimonialSlider } from "./TestimonialSlider";

// Type exports (explicit to maximize TS compatibility across toolchains)
export type {
  Testimonial,
  TestimonialInput,
  TestimonialsProps,
} from "./Testimonials.types";
