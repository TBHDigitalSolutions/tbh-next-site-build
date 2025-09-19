// ===================================================================
// /src/components/portfolio/mediaViewers/registry.ts
// ===================================================================
import type { ComponentType } from "react";
import type { ViewerProps, MediaType } from "./types";
import { ImageViewer } from "./ImageViewer";
import { VideoViewer } from "./VideoViewer";
import { InteractiveViewer } from "./InteractiveViewer";
import { PDFViewer } from "./PDFViewer";

export const mediaViewerRegistry: Record<MediaType, ComponentType<ViewerProps>> = {
  image: ImageViewer,
  video: VideoViewer,
  interactive: InteractiveViewer,
  pdf: PDFViewer,
};

export const getMediaViewer = (mediaType: MediaType): ComponentType<ViewerProps> =>
  mediaViewerRegistry[mediaType] ?? ImageViewer;