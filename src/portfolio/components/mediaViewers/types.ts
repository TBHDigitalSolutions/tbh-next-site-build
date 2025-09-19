// ===================================================================
// /src/components/portfolio/mediaViewers/types.ts
// Local, minimal viewer types (no imports from /src/data)
// ===================================================================

export type MediaType = "image" | "video" | "interactive" | "pdf";

export interface ViewerMedia {
  type: MediaType;
  src: string;
  poster?: string;   // video poster
  alt?: string;      // image alt
  title?: string;    // iframe title fallback
}

export interface ViewerProject {
  id?: string;
  title: string;
  href?: string;      // used by InteractiveViewer "open in new tab"
  media: ViewerMedia;
}

export interface ViewerProps {
  project: ViewerProject;
  onLoad?: () => void;
  onError?: (error: string) => void;

  /** For InteractiveViewer: how long to wait before assuming the iframe is blocked. */
  blockDetectMs?: number;
}