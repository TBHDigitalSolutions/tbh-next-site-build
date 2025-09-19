// src/components/features/home/Hero/HeroSelector.tsx

"use client";

import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
 
// ✅ Import contact page mock data using correct path
import contactPageData from "@/mock/contactPage";

// ✅ Map routes to their respective Hero components using correct paths
const heroComponents: Record<string, React.ComponentType | React.FC<any>> = {
  // ✅ Home Hero - using correct path from your directory structure
  "/": dynamic(() => import("@/components/main-pages/Home/Hero/Hero")),
  
  // ✅ About Hero - using correct path from your directory structure
  "/about": dynamic(() => import("@/components/main-pages/About/AboutHero/AboutHero")),
  
  // ✅ Products/Services Hero - using correct path from your directory structure
  "/products-services": dynamic(() => import("@/components/main-pages/Products-Services/ProductsHero/ProductsHero")),
};

// ✅ Load ContactHero with no SSR (it needs DOM APIs) - using correct path
const ContactHero = dynamic(
  () => import("@/components/main-pages/Contact/ContactHero/ContactHero"),
  { ssr: false }
);

const HeroSelector: React.FC = () => {
  const pathname = usePathname();

  // ✅ Handle contact page specifically
  if (pathname === "/contact") {
    return (
      <ContactHero
        title={contactPageData.intro.title}
        description={contactPageData.intro.description}
        backgroundImage={contactPageData.intro.backgroundImage}
        theme={contactPageData.intro.theme}
      />
    );
  }

  // ✅ Get the appropriate hero component for the current route
  const HeroComponent = heroComponents[pathname] ?? null;
  
  return HeroComponent ? <HeroComponent /> : null;
};

export default HeroSelector;