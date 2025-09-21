import type { Testimonial, TestimonialsSection } from "./types";

export const testimonialsSection: TestimonialsSection = {
  title: "What Clients Say",
  description: "Real outcomes, real partnerships.",
};

export const testimonials: Testimonial[] = [
  {
    id: "t1",
    quote:
      "The team moved fast and helped us unlock compounding organic growth in under 90 days.",
    author: "Jordan P.",
    role: "Head of Growth, SaaSCo",
    photo: "/images/testimonials/jordan.jpg",
  },
  {
    id: "t2",
    quote:
      "Clear process, clean handoffs, and results we can measure. This is how work should feel.",
    author: "Avery R.",
    role: "Marketing Director, RetailCo",
    photo: "/images/testimonials/avery.jpg",
  },
  {
    id: "t3",
    quote:
      "They ship. The work is thoughtful, documented, and designed to scale.",
    author: "Sam K.",
    role: "COO, DTC Brand",
    photo: "/images/testimonials/sam.jpg",
  },
];

export default { testimonialsSection, testimonials };
