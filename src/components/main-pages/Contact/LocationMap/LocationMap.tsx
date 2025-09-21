// src/components/main-pages/Contact/LocationMap/LocationMap.tsx
"use client";

import React from "react";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import "./LocationMap.css";

export type LocationMapProps = {
  sectionTitle?: string;
  latitude: number;
  longitude: number;
  /** Pass this from the page: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY */
  googleMapsApiKey?: string;
  className?: string;
  /** Optional map zoom (default 12) */
  zoom?: number;
  /** Optional label for the marker (accessibility) */
  markerLabel?: string;
  /** Optional mapId if you use Google Cloud Map Styles */
  mapId?: string;
};

/** The map element inherits size from the CSS wrapper (.locationmap-frame) */
const MAP_CONTAINER_STYLE: React.CSSProperties = { width: "100%", height: "100%" };

/** Base options (kept minimal; UI buttons trimmed) */
const BASE_OPTIONS = {
  disableDefaultUI: true,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
} as const;

/** Dark mode styles (small, legible set) */
const DARK_STYLES = [
  { elementType: "geometry", stylers: [{ color: "#212121" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#212121" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#2e2e2e" }] },
] as const;

export default function LocationMap({
  sectionTitle = "",
  latitude = 38.627, // St. Louis, MO (fallback)
  longitude = -90.1994,
  googleMapsApiKey,
  className,
  zoom = 12,
  markerLabel = "Company location",
  mapId,
}: LocationMapProps) {
  // Detect system color scheme for map styling
  const [theme, setTheme] = React.useState<"light" | "dark">("light");
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => setTheme(mq.matches ? "dark" : "light");
    apply();
    mq.addEventListener?.("change", apply);
    return () => mq.removeEventListener?.("change", apply);
  }, []);

  const center = React.useMemo(
    () => ({ lat: Number(latitude) || 0, lng: Number(longitude) || 0 }),
    [latitude, longitude]
  );

  const mapOptions = React.useMemo(
    () => ({
      ...BASE_OPTIONS,
      styles: theme === "dark" ? (DARK_STYLES as any) : undefined,
      ...(mapId ? { mapId } : {}),
    }),
    [theme, mapId]
  );

  // Load the Maps SDK only if a key is provided; otherwise use a static fallback image.
  const shouldLoadJsApi = Boolean(googleMapsApiKey);
  const { isLoaded, loadError } = useLoadScript(
    shouldLoadJsApi
      ? {
          googleMapsApiKey: googleMapsApiKey as string,
          // libraries: [], // add if you need places, geometry, etc.
        }
      : // If no key, skip loader entirely
        // @ts-expect-error - we intentionally don't pass config when no key
        {}
  );

  // Helper for the static fallback image URL (no key used here)
  const staticMapUrl = React.useMemo(() => {
    const base = "https://maps.googleapis.com/maps/api/staticmap";
    const params = new URLSearchParams({
      center: `${latitude},${longitude}`,
      zoom: String(zoom),
      size: "800x500",
      markers: `color:blue|${latitude},${longitude}`,
      // Intentionally omitting key here; this is a lightweight dev fallback.
    });
    return `${base}?${params.toString()}`;
  }, [latitude, longitude, zoom]);

  return (
    <section
      className={`locationmap-section ${className ?? ""}`}
      aria-labelledby={sectionTitle ? "location-map-title" : undefined}
    >
      <div className="locationmap-container">
        {sectionTitle && (
          <>
            <h2 id="location-map-title" className="locationmap-title">
              {sectionTitle}
            </h2>
            <div className="locationmap-divider" aria-hidden="true" />
          </>
        )}

        <div className="locationmap-frame" role="region" aria-label="Company location map">
          {/* If no key → show static fallback */}
          {!shouldLoadJsApi ? (
            <img
              className="locationmap-fallback"
              src={staticMapUrl}
              alt={`Map showing location at ${latitude.toFixed(3)}, ${longitude.toFixed(3)}`}
              loading="lazy"
              decoding="async"
            />
          ) : loadError ? (
            // If script fails → graceful message (you can swap to staticMapUrl too)
            <div
              role="alert"
              aria-live="polite"
              className="locationmap-fallback"
              style={{
                display: "grid",
                placeItems: "center",
                background: "var(--bg-surface)",
                color: "var(--text-primary)",
              }}
            >
              Map failed to load. Please try again later.
            </div>
          ) : !isLoaded ? (
            // Loading state
            <div
              role="status"
              aria-live="polite"
              className="locationmap-fallback"
              style={{
                display: "grid",
                placeItems: "center",
                background: "var(--bg-skeleton, #f3f4f6)",
                color: "var(--text-muted, #6b7280)",
              }}
            >
              Loading map…
            </div>
          ) : (
            // Render the live map
            <GoogleMap
              center={center}
              zoom={zoom}
              options={mapOptions as google.maps.MapOptions}
              mapContainerStyle={MAP_CONTAINER_STYLE}
            >
              <Marker position={center} label={markerLabel} />
            </GoogleMap>
          )}
        </div>
      </div>
    </section>
  );
}
