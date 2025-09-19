"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import "./Navbar.css";

interface NavLink {
  label: string;
  to: string;
  external?: boolean;
  special?: boolean;
}

interface NavbarProps { navLinks: NavLink[]; }

const Navbar: React.FC<NavbarProps> = ({ navLinks }) => {
  const pathname = usePathname();

  if (!navLinks?.length) return null;

  return (
    <nav className="navbar" role="navigation" aria-label="Primary navigation">
      {navLinks.map((link, index) => {
        if (!link?.to || !link?.label) return null;

        const { to, label, external, special } = link;
        const isActive = !external && (pathname === to || pathname.startsWith(`${to}/`));

        const classNames = [
          "navbar-link",
          special ? "navbar-special" : "",
          isActive ? "active" : "",
        ]
          .filter(Boolean)
          .join(" ");

        const key = `nav-${index}-${to}`;

        return external ? (
          <a
            key={key}
            href={to}
            target="_blank"
            rel="noopener noreferrer"
            className={classNames}
          >
            {label}
          </a>
        ) : (
          <Link key={key} href={to} className={classNames} aria-current={isActive ? "page" : undefined}>
            {label}
          </Link>
        );
      })}
    </nav>
  );
};

export default Navbar;