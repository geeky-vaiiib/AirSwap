import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, FeatureGroup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface LeafletMapProps {
  onPolygonComplete: (coordinates: [number, number][]) => void;
  drawEnabled: boolean;
}

// Fix for default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const DrawControl = ({ onPolygonComplete, drawEnabled }: LeafletMapProps) => {
  const map = useMap();
  const [drawing, setDrawing] = useState(false);
  const pointsRef = useRef<L.LatLng[]>([]);
  const polylineRef = useRef<L.Polyline | null>(null);
  const markersRef = useRef<L.CircleMarker[]>([]);

  useEffect(() => {
    if (!drawEnabled) {
      // Clean up
      if (polylineRef.current) {
        map.removeLayer(polylineRef.current);
        polylineRef.current = null;
      }
      markersRef.current.forEach(m => map.removeLayer(m));
      markersRef.current = [];
      pointsRef.current = [];
      setDrawing(false);
      return;
    }

    const handleClick = (e: L.LeafletMouseEvent) => {
      if (!drawEnabled) return;

      const latlng = e.latlng;
      pointsRef.current.push(latlng);

      // Add marker
      const marker = L.circleMarker(latlng, {
        radius: 6,
        fillColor: "#3EF0C2",
        fillOpacity: 1,
        color: "#0F5A3C",
        weight: 2,
      }).addTo(map);
      markersRef.current.push(marker);

      // Update polyline
      if (polylineRef.current) {
        polylineRef.current.setLatLngs(pointsRef.current);
      } else {
        polylineRef.current = L.polyline(pointsRef.current, {
          color: "#3EF0C2",
          weight: 3,
          dashArray: "5, 10",
        }).addTo(map);
      }

      setDrawing(true);
    };

    const handleDblClick = (e: L.LeafletMouseEvent) => {
      if (!drawEnabled || pointsRef.current.length < 3) return;

      e.originalEvent.preventDefault();
      e.originalEvent.stopPropagation();

      // Create polygon
      const coordinates: [number, number][] = pointsRef.current.map((p) => [
        p.lat,
        p.lng,
      ]);
      
      // Clean up drawing elements
      if (polylineRef.current) {
        map.removeLayer(polylineRef.current);
        polylineRef.current = null;
      }
      markersRef.current.forEach(m => map.removeLayer(m));
      markersRef.current = [];

      // Add final polygon
      const polygon = L.polygon(coordinates, {
        color: "#0F5A3C",
        fillColor: "#3EF0C2",
        fillOpacity: 0.3,
        weight: 2,
      }).addTo(map);

      onPolygonComplete(coordinates);
      pointsRef.current = [];
      setDrawing(false);
    };

    map.on("click", handleClick);
    map.on("dblclick", handleDblClick);

    return () => {
      map.off("click", handleClick);
      map.off("dblclick", handleDblClick);
    };
  }, [map, drawEnabled, onPolygonComplete]);

  return null;
};

const LeafletMap = ({ onPolygonComplete, drawEnabled }: LeafletMapProps) => {
  return (
    <MapContainer
      center={[-3.4653, -62.2159]}
      zoom={10}
      className="h-full w-full rounded-2xl"
      doubleClickZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <TileLayer
        url="https://tiles.stadiamaps.com/tiles/stamen_terrain/{z}/{x}/{y}{r}.png"
        opacity={0.3}
      />
      <DrawControl onPolygonComplete={onPolygonComplete} drawEnabled={drawEnabled} />
    </MapContainer>
  );
};

export default LeafletMap;
