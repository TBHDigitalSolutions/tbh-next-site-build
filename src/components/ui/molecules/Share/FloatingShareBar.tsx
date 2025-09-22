"use client";

import React from "react";
import Link from "next/link";
import {
  FacebookIcon,
  TwitterIcon,
  LinkedinIcon,
  MailIcon,
} from "lucide-react";
import clsx from "clsx";
import "./FloatingShareBar.css";

interface SharePlatform {
  id: "twitter" | "linkedin" | "facebook" | "email";
  icon: React.ReactNode;
  label: string;
  url: string;
}

interface FloatingShareBarProps {
  url: string;
  title: string;
  className?: string;
  position?: "left" | "right" | "inline";
  platforms?: ("twitter" | "linkedin" | "facebook" | "email")[];
}

export const FloatingShareBar: React.FC<FloatingShareBarProps> = ({
  url,
  title,
  className = "",
  position = "left",
  platforms = ["twitter", "linkedin", "facebook", "email"],
}) => {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const platformMap: Record<string, SharePlatform> = {
    twitter: {
      id: "twitter",
      label: "Share on Twitter",
      icon: <TwitterIcon size={18} />,
      url: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    },
    linkedin: {
      id: "linkedin",
      label: "Share on LinkedIn",
      icon: <LinkedinIcon size={18} />,
      url: `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}`,
    },
    facebook: {
      id: "facebook",
      label: "Share on Facebook",
      icon: <FacebookIcon size={18} />,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    email: {
      id: "email",
      label: "Share via Email",
      icon: <MailIcon size={18} />,
      url: `mailto:?subject=${encodedTitle}&body=${encodedUrl}`,
    },
  };

  const shareItems = platforms.map((key) => platformMap[key]);

  return (
    <div
      className={clsx(
        "floating-share-bar",
        `position-${position}`,
        className
      )}
      aria-label="Share this page"
    >
      {shareItems.map((item) => (
        <a
          key={item.id}
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="floating-share-icon"
          aria-label={item.label}
        >
          {item.icon}
        </a>
      ))}
    </div>
  );
};

export default FloatingShareBar;
