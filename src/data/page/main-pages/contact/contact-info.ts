// src/data/page/main-pages/contact/contact-info.ts
// A succinct list of key contact details for quick reference (email/phone/address)

import type { ContactInfoItem } from "@/data/page/main-pages/contact/types";

export const contactInfo: ContactInfoItem[] = [
  {
    id: "address",
    label: "Address",
    value: "St. Louis, MO",
    href: "https://goo.gl/maps/example",
    icon: "FaMapMarkerAlt",
  },
  {
    id: "phone",
    label: "Phone",
    value: "+1 (555) 123-4567",
    href: "tel:+15551234567",
    icon: "FaPhoneAlt",
  },
  {
    id: "email",
    label: "Email",
    value: "info@tbhdigitalsolutions.com",
    href: "mailto:info@tbhdigitalsolutions.com",
    icon: "FaEnvelope",
  },
] satisfies ContactInfoItem[];

export default contactInfo;
