/**
 * Location Search Map Component
 *
 * Interactive map with search functionality using react-leaflet, leaflet-control-geocoder, and leaflet-draw.
 * Allows users to search for locations and draw polygons.
 */

import React from 'react';
import dynamic from 'next/dynamic';

const LocationSearchMapClient = dynamic(
  () =>
    // @ts-ignore - Dynamic import resolution issue with Next.js
    import('./LocationSearchMapClient'),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-sm text-gray-500">Loading location search map...</div>
      </div>
    ),
  }
);

interface LocationSearchMapProps {
  onLocationSelect?: (latlng: [number, number]) => void;
  onPolygonComplete?: (geoJson: any) => void;
  className?: string;
}

export default function LocationSearchMap({
  onLocationSelect,
  onPolygonComplete,
  className
}: LocationSearchMapProps) {
  return (
    <div className={`h-full w-full ${className || ''}`}>
      {/* @ts-ignore - Dynamic component props not inferred by TypeScript */}
      <LocationSearchMapClient
        onLocationSelect={onLocationSelect}
        onPolygonComplete={onPolygonComplete}
      />
    </div>
  );
}
