"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { IoMenuOutline, IoCloseOutline } from "react-icons/io5";
import { motion, AnimatePresence } from "framer-motion";
import "./MobileMenu.css";
import { NavLink } from "@/mock/headerData";

interface MobileMenuProps { navLinks: NavLink[]; }

const MobileMenu: React.FC<MobileMenuProps> = ({ navLinks }) => {
  const [isOpen, setIsOpen] = useState(false);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);

  // Prevent background scroll
  useEffect(() => {
    document.body.classList.toggle("no-scroll", isOpen);
    return () => document.body.classList.remove("no-scroll");
  }, [isOpen]);

  // ESC to close + focus
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setIsOpen(false);
    document.addEventListener("keydown", onKey);
    closeBtnRef.current?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen]);

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="mobilemenu-toggle"
        aria-label="Toggle Mobile Menu"
        aria-expanded={isOpen}
        aria-controls="mobilemenu-panel"
      >
        <IoMenuOutline />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="mobilemenu-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.75 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              id="mobilemenu-panel"
              className="mobilemenu"
              role="dialog"
              aria-modal="true"
              aria-label="Site navigation menu"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.28 }}
            >
              <button
                ref={closeBtnRef}
                onClick={() => setIsOpen(false)}
                className="mobilemenu-close"
                aria-label="Close Menu"
              >
                <IoCloseOutline />
              </button>

              <nav className="mobilemenu-nav">
                {navLinks.map(({ to, label, external }) =>
                  external ? (
                    <a
                      key={`m-${to}`}
                      href={to}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mobilemenu-link"
                      onClick={() => setIsOpen(false)}
                    >
                      {label}
                    </a>
                  ) : (
                    <Link
                      key={`m-${to}`}
                      href={to}
                      className="mobilemenu-link"
                      onClick={() => setIsOpen(false)}
                    >
                      {label}
                    </Link>
                  )
                )}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default MobileMenu;