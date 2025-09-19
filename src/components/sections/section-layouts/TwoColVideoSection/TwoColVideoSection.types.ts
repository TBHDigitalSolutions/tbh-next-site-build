// Production contract for TwoColVideoSection

export type TwoColVideoCTA = {
  label: string;
  href: string;
  ariaLabel?: string;
};

export type TwoColVideoMedia = {
  src: string;
  poster?: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean; // default true for hero/section videos
};

export interface TwoColVideoSectionData {
  id: string;
  title: string;
  description?: string;
  cta?: TwoColVideoCTA;
  video: TwoColVideoMedia;
}

export interface TwoColVideoSectionProps {
  data: TwoColVideoSectionData;
  className?: string;
  containerSize?: "narrow" | "normal" | "wide" | "full";
  tone?: "gradient" | "primary" | "surface" | "transparent";
  showDivider?: boolean;       // bottom band divider
  dividerVariant?: "constrained" | "full";
  dividerTone?: "default" | "subtle" | "strong" | string;
}
