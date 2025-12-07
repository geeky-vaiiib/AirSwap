/**
 * Location Search Map Client Component
 *
 * The client-side implementation of the LocationSearchMap component using react-leaflet.
 * Includes search functionality via leaflet-control-geocoder and drawing capabilities with leaflet-draw.
 */

import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-control-geocoder/dist/Control.Geocoder.css';
import 'leaflet-draw/dist/leaflet.draw.css';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/leaflet/marker-icon-2x.png',
  iconUrl: '/leaflet/marker-icon.png',
  shadowUrl: '/leaflet/marker-shadow.png',
});

// Extend leaflet types for geocoder
declare module 'leaflet' {
  namespace Control {
    class Geocoder extends L.Control {
      constructor(options?: any);
      addTo(map: L.Map): this;
    }
  }
}

interface LocationSearchMapClientProps {
  onLocationSelect?: (latlng: [number, number]) => void;
  onPolygonComplete?: (geoJson: any) => void;
}

// Search Control Component
function SearchControl({ onLocationSelect }: { onLocationSelect?: (latlng: [number, number]) => void }) {
  const map = useMap();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Import leaflet-control-geocoder dynamically
      import('leaflet-control-geocoder').then((GeocoderModule) => {
        const Geocoder = GeocoderModule.default || GeocoderModule;

        const geocoder = new Geocoder({
          collapsed: false,
          position: 'topleft',
          placeholder: 'Search for a location...',
          defaultMarkGeocode: false,
        });

        geocoder.on('markgeocode', (e: any) => {
          const bbox = e.geocode.bbox;
          const center = e.geocode.center;
          const latlng = [center.lat, center.lng] as [number, number];

          // Zoom to the result
          map.fitBounds(bbox);

          // Add a marker
          const marker = L.marker(latlng).addTo(map);
          marker.bindPopup(e.geocode.name).openPopup();

          // Notify parent component
          onLocationSelect?.(latlng);
        });

        map.addControl(geocoder);
      });
    }

    return () => {
      // Cleanup will be handled by React
    };
  }, [map, onLocationSelect]);

  return null;
}

// Draw Control Component
function DrawControl({ onPolygonComplete }: { onPolygonComplete?: (geoJson: any) => void }) {
  const map = useMap();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Import leaflet-draw dynamically
      import('leaflet-draw').then(() => {
        // Initialize the FeatureGroup to store editable layers
        const drawnItems = new L.FeatureGroup();
        map.addLayer(drawnItems);

        // Initialize the draw control and pass it the FeatureGroup of editable layers
        const drawControl = new L.Control.Draw({
          edit: {
            featureGroup: drawnItems,
          },
          draw: {
            polygon: {
              shapeOptions: {
                color: '#3b82f6',
                weight: 2,
                opacity: 0.8,
                fillColor: '#3b82f6',
                fillOpacity: 0.2,
              },
              showArea: true,
              showLength: true,
              allowIntersection: false,
              drawError: {
                color: '#e11d48',
                timeout: 1000,
              },
            },
            polyline: false,
            rectangle: false,
            circle: false,
            circlemarker: false,
            marker: false,
          },
        });
        map.addControl(drawControl);

        // Handle draw created events
        map.on(L.Draw.Event.CREATED, (event: any) => {
          const layer = event.layer;
          drawnItems.addLayer(layer);

          // Convert layer to GeoJSON
          const geoJson = layer.toGeoJSON();
          onPolygonComplete?.(geoJson);

          // Add popup with area info
          if (event.layerType === 'polygon') {
            const area = (L.GeometryUtil as any).geodesicArea(layer.getLatLngs()[0]);
            layer.bindPopup(`Area: ${(area / 1000000).toFixed(2)} km²`).openPopup();
          }
        });
      });
    }
  }, [map, onPolygonComplete]);

  return null;
}

export default function LocationSearchMapClient({
  onLocationSelect,
  onPolygonComplete
}: LocationSearchMapClientProps) {
  const mapRef = useRef<L.Map>(null);

  return (
    <MapContainer
      center={[20, 78]} // Center on India
      zoom={5}
      style={{ height: '100%', width: '100%' }}
      ref={mapRef}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <SearchControl onLocationSelect={onLocationSelect} />
      <DrawControl onPolygonComplete={onPolygonComplete} />
    </MapContainer>
  );
}
