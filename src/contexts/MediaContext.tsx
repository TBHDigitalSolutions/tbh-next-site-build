// src/contexts/MediaContext.tsx

"use client";

import {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";

interface MediaContextProps {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

const MediaContext = createContext<MediaContextProps | undefined>(undefined);

export const MediaProvider = ({ children }: { children: ReactNode }) => {
  const [media, setMedia] = useState<MediaContextProps>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
  });

  useEffect(() => {
    const updateMedia = () => {
      const width = window.innerWidth;
      setMedia({
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024,
      });
    };

    updateMedia();
    window.addEventListener("resize", updateMedia);
    return () => window.removeEventListener("resize", updateMedia);
  }, []);

  return (
    <MediaContext.Provider value={media}>
      {children}
    </MediaContext.Provider>
  );
};

export const useMedia = () => {
  const context = useContext(MediaContext);
  if (!context) {
    throw new Error("useMedia must be used within a MediaProvider");
  }
  return context;
};