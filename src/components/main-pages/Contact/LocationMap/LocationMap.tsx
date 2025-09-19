"use client";

import React, { useEffect, useMemo, useState } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import "./LocationMap.css";

/** Map container takes the size from the CSS wrapper */
const MAP_CONTAINER_STYLE: google.maps.MapElementStyles["container"] = {
  width: "100%",
  height: "100%",
};

const MAP_OPTIONS: google.maps.MapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
};

export interface LocationMapProps {
  sectionTitle?: string;
  latitude: number;
  longitude: number;
  googleMapsApiKey?: string;
  className?: string;
}

const LocationMap: React.FC<LocationMapProps> = ({
  sectionTitle = "",
  latitude = 38.627, // St. Louis, MO (fallback)
  longitude = -90.1994,
  googleMapsApiKey,
  className,
}) => {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Detect system theme and react to changes
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => setTheme(mq.matches ? "dark" : "light");
    apply();
    mq.addEventListener?.("change", apply);
    return () => mq.removeEventListener?.("change", apply);
  }, []);

  // Memoized Google Maps style by theme (no invalid hook usage)
  const mapStyles = useMemo<google.maps.MapTypeStyle[] | undefined>(() => {
    if (theme !== "dark") return undefined;
    return [
      { elementType: "geometry", stylers: [{ color: "#212121" }] },
      { elementType: "labels.text.stroke", stylers: [{ color: "#212121" }] },
      { elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
      { featureType: "poi", elementType: "geometry", stylers: [{ color: "#2e2e2e" }] },
    ];
  }, [theme]);

  const options = useMemo(
    () => ({ ...MAP_OPTIONS, styles: mapStyles }),
    [mapStyles]
  );

  const center = useMemo(() => ({ lat: latitude, lng: longitude }), [latitude, longitude]);

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
          {googleMapsApiKey ? (
            <LoadScript googleMapsApiKey={googleMapsApiKey}>
              <GoogleMap
                mapContainerStyle={MAP_CONTAINER_STYLE}
                center={center}
                zoom={12}
                options={options}
              >
                <Marker position={center} />
              </GoogleMap>
            </LoadScript>
          ) : (
            <img
              className="locationmap-fallback"
              src={`https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=12&size=800x500&markers=color:blue%7C${latitude},${longitude}`}
              alt={`Map showing location at ${latitude.toFixed(3)}, ${longitude.toFixed(3)}`}
              loading="lazy"
              decoding="async"
            />
          )}
        </div>
      </div>
    </section>
  );
};

export default LocationMap;
