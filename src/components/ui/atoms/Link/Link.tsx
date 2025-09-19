// shared-ui/components/content/Link.tsx

"use client";

import NextLink from "next/link";
import React from "react";
import clsx from "clsx";
import "./Link.css";

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: React.ReactNode;
  className?: string;
  underline?: boolean;
  newTab?: boolean;
}

const Link: React.FC<LinkProps> = ({
  href, 
  children, 
  className = "",
  underline = false,
  newTab = false,
  ...props
}) => {
  const isExternal = href.startsWith("http");

  const finalClass = clsx("custom-link", className, {
    underline,
  });

  if (isExternal || newTab) {
    return (
      <a
        href={href}
        className={finalClass}
        target="_blank"
        rel="noopener noreferrer"
        {...props}
      >
        {children}
      </a>
    );
  }

  return (
    <NextLink href={href} className={finalClass} {...props}>
      {children}
    </NextLink>
  );
};

export default Link;
