// src/data/page/main-pages/contact/contact-options.ts
// “Ways to reach us” cards shown as options (email / phone / location / etc.)

import type { ContactOption } from "@/data/page/main-pages/contact/types";

export const contactOptions: ContactOption[] = [
  {
    id: "location",
    title: "Our Location",
    description: "Proudly based out of St. Louis, MO",
    icon: "FaMapMarkerAlt",
    href: "https://goo.gl/maps/example",
    ctaLabel: "Get Directions",
  },
  {
    id: "phone",
    title: "Phone Number",
    description: "Call us for inquiries — +1 (555) 123-4567",
    icon: "FaPhoneAlt",
    href: "tel:+15551234567",
    ctaLabel: "Call Now",
  },
  {
    id: "email",
    title: "Email Us",
    description: "Drop us a message — info@tbhdigitalsolutions.com",
    icon: "FaEnvelope",
    href: "mailto:info@tbhdigitalsolutions.com",
    ctaLabel: "Send Email",
  },
  {
    id: "store",
    title: "Online Store",
    description: "Browse and purchase services directly",
    icon: "FaShoppingCart",
    href: "/shop",
    ctaLabel: "Shop Now",
  },
] satisfies ContactOption[];

export default contactOptions;
