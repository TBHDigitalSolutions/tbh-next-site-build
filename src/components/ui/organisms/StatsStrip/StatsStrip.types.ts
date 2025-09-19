// src/components/ui/organisms/StatsStrip/StatsStrip.types.ts

export interface StatItem {
  id: string;
  value: string | number;
  label: string;
  description?: string;
  icon?: string;
  color?: "primary" | "secondary" | "success" | "warning" | "danger" | "info";
  prefix?: string;
  suffix?: string;
  animate?: boolean;
  href?: string; // Optional link for clickable stats
  target?: "_blank" | "_self"; // Link target
}

export interface StatsStripProps {
  /** Array of stat items to display */
  stats: StatItem[];
  
  /** Visual variant of the stats strip */
  variant?: "default" | "minimal" | "cards" | "certifications" | "metrics" | "achievements";
  
  /** Layout arrangement of stats */
  layout?: "horizontal" | "grid" | "carousel";
  
  /** Enable scroll-triggered animations */
  animated?: boolean;
  
  /** Show icons if provided */
  showIcons?: boolean;
  
  /** Show descriptions if provided */
  showDescriptions?: boolean;
  
  /** Custom background color */
  backgroundColor?: string;
  
  /** Custom text color */
  textColor?: string;
  
  /** Spacing between items */
  spacing?: "compact" | "normal" | "spacious";
  
  /** Text and container alignment */
  alignment?: "left" | "center" | "right";
  
  /** Additional CSS classes */
  className?: string;
  
  /** Custom styles object */
  style?: React.CSSProperties;
  
  /** Click handler for stat items */
  onStatClick?: (stat: StatItem) => void;
  
  /** Loading state */
  loading?: boolean;
  
  /** Error state */
  error?: string;
  
  /** Maximum number of items to show */
  maxItems?: number;
  
  /** Enable carousel controls */
  showCarouselControls?: boolean;
  
  /** Auto-play carousel */
  autoPlay?: boolean;
  
  /** Auto-play interval in milliseconds */
  autoPlayInterval?: number;
}