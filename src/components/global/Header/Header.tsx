// src/components/core/navigation/Header/Header.tsx
"use client";

import React, { useState, useEffect } from "react";

import CompanyInfo from "./CompanyInfo";
import ThemeToggle from "./ThemeToggle";
import Login from "./Login";
import Navbar from "@/components/global/Navbar/Navbar";
import MobileMenu from "@/components/global/MobileMenu/MobileMenu";
import useDeviceType from "@/hooks/core/useDeviceType";
import { headerData } from "@/mock/headerData";
import "./Header.css";
 
const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { isMobile } = useDeviceType();

  useEffect(() => {
    const handleScroll = () => {
      requestAnimationFrame(() => setIsScrolled(window.scrollY > 50));
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`header ${isScrolled ? "scrolled" : ""}`} role="banner">
      <div className="header-container" aria-label="Primary site header">
        {/* Left: Brand */}
        <div className="header-left" aria-label="Brand">
          <CompanyInfo
            logo={headerData.logo}
            name={headerData.companyName}          
            tagline={headerData.companyTagline}    
            variant="full"
          />
        </div>

        {/* Center: Navigation (Hidden on Mobile) */}
        <nav className="header-center" aria-label="Primary navigation">
          {!isMobile && <Navbar navLinks={headerData.navLinks} />}
        </nav>

        {/* Right: Controls */}
        <div className="header-right" aria-label="Header controls and actions">
          {/* Mobile menu toggle should be visible on mobile; component handles that */}
          <MobileMenu navLinks={headerData.navLinks} />
          <ThemeToggle />
          <Login />
        </div>
      </div>
    </header>
  );
};

export default Header;