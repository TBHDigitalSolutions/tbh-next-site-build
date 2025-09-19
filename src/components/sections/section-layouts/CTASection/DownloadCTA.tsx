// src/components/sections/templates/CTASection/DownloadCTA.tsx
"use client";

import React from "react";
import { Download } from "lucide-react";
import clsx from "clsx";
import "./DownloadCTA.css";

interface DownloadCTAProps {
  fileUrl: string;
  label: string;
  fileName?: string;
  className?: string;
  iconPosition?: "left" | "right";
  showFileType?: boolean;
  tooltip?: string;
}

const getFileExtension = (url: string): string | null => {
  const match = url.match(/\.\w+$/);
  return match ? match[0].toUpperCase().replace(".", "") : null;
};

const DownloadCTA: React.FC<DownloadCTAProps> = ({
  fileUrl,
  label,
  fileName,
  className = "",
  iconPosition = "left",
  showFileType = false,
  tooltip,
}) => {
  const isExternal = !fileUrl.startsWith("/") && !fileUrl.includes(window?.location?.hostname);
  const fileType = getFileExtension(fileUrl);

  const content = (
    <>
      {iconPosition === "left" && <Download size={18} className="download-icon" />}
      <span className="download-label">
        {label}
        {showFileType && fileType && <span className="download-filetype"> ({fileType})</span>}
      </span>
      {iconPosition === "right" && <Download size={18} className="download-icon" />}
    </>
  );

  return (
    <a
      href={fileUrl}
      className={clsx("download-cta", className)}
      {...(fileName ? { download: fileName } : {})}
      {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      aria-label={`Download: ${label}${fileType ? ` (${fileType})` : ""}`}
      title={tooltip ?? label}
    >
      {content}
    </a>
  );
};

export default DownloadCTA;
