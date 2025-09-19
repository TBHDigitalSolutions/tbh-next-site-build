// src/mock/headerData.ts

export interface NavLink {
  label: string;
  to: string;
  external?: boolean;
  special?: boolean;
}

export interface HeaderData {
  navLinks: NavLink[];
  companyName: string;
  companyTagline?: string;
  logo?: {
    src: string;
    alt: string;
    width: number;
    height: number;
  };
}

export const headerData: HeaderData = {
  companyName: "TBH Digital Solutions",
  companyTagline: "Content. Strategy. Growth.",
  logo: {
    src: "/logos/tbh-logo-primary.svg",
    alt: "TBH Digital Solutions Logo", 
    width: 220,
    height: 60
  },
  navLinks: [
    { 
      label: "Home", 
      to: "/" 
    },
    { 
      label: "About", 
      to: "/about" 
    },
    { 
      label: "Products & Services", 
      to: "/products-services", 
      special: true 
    },
    { 
      label: "Contact", 
      to: "/contact" 
    },
    { 
      label: "Articles", 
      to: "https://articles.tbhdigitalsolutions.com", 
      external: true 
    },
  ],
};

// ✅ Export individual pieces for easier imports
export const { navLinks, companyName, companyTagline, logo } = headerData;