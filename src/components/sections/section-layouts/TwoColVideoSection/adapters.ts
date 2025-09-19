// Optional: page-local adapter example if your page data differs

import type {
  TwoColVideoSectionData,
} from "./TwoColVideoSection.types";

// Example of accepting a looser page block and normalizing it
export type AnyTwoColVideoBlock = {
  id?: string;
  title?: string;
  description?: string;
  cta?: { label: string; href: string; ariaLabel?: string };
  video?: { src: string; poster?: string; autoPlay?: boolean; loop?: boolean; muted?: boolean };
};

export function toTwoColVideoData(block: AnyTwoColVideoBlock): TwoColVideoSectionData {
  if (!block?.video?.src) {
    throw new Error("TwoColVideoSection: video.src is required");
  }

  return {
    id: block.id ?? "two-col-video",
    title: block.title ?? "Untitled",
    description: block.description,
    cta: block.cta,
    video: {
      src: block.video.src,
      poster: block.video.poster,
      autoPlay: block.video.autoPlay,
      loop: block.video.loop ?? true,
      muted: block.video.muted ?? true,
    },
  };
}
