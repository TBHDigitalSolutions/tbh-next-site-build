export interface ContactCard {
  id: number;
  title: string;
  description: string;
  details: string;
  link: string;
  icon: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface ContactPageData {
  intro: {
    sectionTitle: string;
    title: string;
    description: string;
    backgroundImage: string;
    theme: "light" | "dark";
  };
  contactInfo: {
    sectionTitle: string;
    cards: ContactCard[];
  };
  location: {
    sectionTitle: string;
    latitude: number;
    longitude: number;
    googleMapsApiKey: string;
  };
  faq: {
    sectionTitle: string;
    questions: FAQItem[];
  };
}

const contactPageData: ContactPageData = {
  intro: {
    sectionTitle: "Get in Touch",
    title: "Contact Us",
    description:
      "Have questions? Need a consultation? Fill out the form, and our team will get back to you as soon as possible.",
    backgroundImage: "/images/CONTACT-HERO-TEMP-1.jpg",
    theme: "light",
  },
  contactInfo: {
    sectionTitle: "Contact Information",
    cards: [
      {
        id: 1,
        title: "Our Location",
        description: "Proudly based out of",
        details: "St. Louis, Mo",
        link: "https://goo.gl/maps/example",
        icon: "FaMapMarkerAlt",
      },
      {
        id: 2,
        title: "Phone Number",
        description: "Call us for inquiries",
        details: "+1 (555) 123-4567",
        link: "tel:+15551234567",
        icon: "FaPhoneAlt",
      },
      {
        id: 3,
        title: "Email Us",
        description: "Drop us a message",
        details: "info@tbhdigitalsolutions.com",
        link: "mailto:info@tbhdigitalsolutions.com",
        icon: "FaEnvelope",
      },
      {
        id: 4,
        title: "Online Store",
        description: "Browse all products",
        details: "Visit the store",
        link: "/shop",
        icon: "FaShoppingCart",
      },
    ],
  },
  location: {
    sectionTitle: "",
    latitude: 38.627,
    longitude: -90.1994,
    googleMapsApiKey: "APIKEY",
  },
  faq: {
    sectionTitle: "Frequently Asked Questions",
    questions: [
      {
        question: "How soon can I expect a response?",
        answer:
          "We typically respond within the same business day, or within 24 hours.",
      },
      {
        question: "Do you offer free consultations?",
        answer:
          "Yes! We're happy to provide advice and tell you what we think you need—even if we’re not the right fit, we’ll point you in the right direction.",
      },
      {
        question: "What’s your pricing?",
        answer:
          "Browse and purchase services at our [e-commerce store](https://shop.company.com), or schedule a consultation for custom pricing.",
      },
    ],
  },
};

export default contactPageData;
