// shared-ui/components/social/ShareButtons.tsx
"use client";

import React, { useState } from "react";
import {
  TwitterIcon,
  LinkedinIcon,
  FacebookIcon,
  LinkIcon,
  CheckIcon,
  InstagramIcon,
  MailIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import { generateShareLinks } from "../../utils/socialShareLinks";
import clsx from "clsx";
import "./ShareButtons.css";

interface ShareButtonsProps {
  url: string;
  title: string;
  hashtags?: string[];
  className?: string;
}

export const ShareButtons: React.FC<ShareButtonsProps> = ({
  url,
  title,
  hashtags = [],
  className = "",
}) => {
  const [copied, setCopied] = useState(false);

  const { twitter, linkedin, facebook, instagram, email } = generateShareLinks({
    url,
    title,
    hashtags,
  });

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      // Track share event (example)
      // trackEvent("share", { platform: "copy", url });
    });
  };

  const handleShare = (platform: string) => {
    // Track share event
    // trackEvent("share", { platform, url });
  };

  return (
    <div className={clsx("share-buttons", className)} aria-label="Share this page">
      <span className="share-label">Share:</span>

      <motion.a
        href={twitter}
        target="_blank"
        rel="noopener noreferrer"
        className="share-button twitter"
        aria-label="Share on Twitter"
        onClick={() => handleShare("twitter")}
        whileHover={{ scale: 1.1 }}
      >
        <TwitterIcon size={16} /> Twitter
      </motion.a>

      <motion.a
        href={linkedin}
        target="_blank"
        rel="noopener noreferrer"
        className="share-button linkedin"
        aria-label="Share on LinkedIn"
        onClick={() => handleShare("linkedin")}
        whileHover={{ scale: 1.1 }}
      >
        <LinkedinIcon size={16} /> LinkedIn
      </motion.a>

      <motion.a
        href={facebook}
        target="_blank"
        rel="noopener noreferrer"
        className="share-button facebook"
        aria-label="Share on Facebook"
        onClick={() => handleShare("facebook")}
        whileHover={{ scale: 1.1 }}
      >
        <FacebookIcon size={16} /> Facebook
      </motion.a>

      <motion.a
        href={instagram}
        target="_blank"
        rel="noopener noreferrer"
        className="share-button instagram"
        aria-label="Share on Instagram"
        onClick={() => handleShare("instagram")}
        whileHover={{ scale: 1.1 }}
      >
        <InstagramIcon size={16} /> Instagram
      </motion.a>

      <motion.a
        href={email}
        className="share-button email"
        aria-label="Share via Email"
        onClick={() => handleShare("email")}
        whileHover={{ scale: 1.1 }}
      >
        <MailIcon size={16} /> Email
      </motion.a>

      <motion.button
        onClick={copyToClipboard}
        className="share-button copy"
        aria-label="Copy link to clipboard"
        title={copied ? "Copied to clipboard!" : "Copy to clipboard"}
        whileHover={{ scale: 1.1 }}
      >
        {copied ? (
          <>
            <CheckIcon size={16} /> Copied!
          </>
        ) : (
          <>
            <LinkIcon size={16} /> Copy Link
          </>
        )}
      </motion.button>
    </div>
  );
};

export default ShareButtons;