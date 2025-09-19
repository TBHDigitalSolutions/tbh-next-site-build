// shared-ui/header/ClientHeader.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import useDeviceType from '../hooks/core/useDeviceType';
import { NavLink } from '../../types/navLinks';

interface ClientHeaderProps {
  navLinks: NavLink[];
}

const ClientHeader: React.FC<ClientHeaderProps> = ({ navLinks }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { isMobile } = useDeviceType();

  useEffect(() => {
    const handleScroll = () => {
      requestAnimationFrame(() => {
        setIsScrolled(window.scrollY > 50);
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={`client-header ${isScrolled ? 'scrolled' : ''}`}>
      {!isMobile && <Navbar navLinks={navLinks} />}
    </div>
  );
};

export default ClientHeader;