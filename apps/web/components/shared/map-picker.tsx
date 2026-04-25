"use client";

import { useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { Search } from "lucide-react";
import type { Map as LeafletMap } from "leaflet";

type MapPickerProps = {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number, addressDetails?: any) => void;
  isArabic: boolean;
};

// This internal component will be dynamically imported
const MapInternal = dynamic(
  async () => {
    const { MapContainer, TileLayer, Marker, useMapEvents } = await import("react-leaflet");
    const L = await import("leaflet");

    const customIcon = L.icon({
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
    });

    return function MapComponent({ lat, lng, onSelect }: { lat: number; lng: number; onSelect: (lat: number, lng: number) => void }) {
      const Events = () => {
        useMapEvents({
          click(e) {
            onSelect(e.latlng.lat, e.latlng.lng);
          },
        });
        return null;
      };

      return (
        <MapContainer
          center={[lat, lng]}
          zoom={13}
          style={{ height: "300px", width: "100%" }}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[lat, lng]} icon={customIcon} />
          <Events />
        </MapContainer>
      );
    };
  },
  { 
    ssr: false,
    loading: () => <div className="h-[300px] w-full animate-pulse rounded-[1.5rem] bg-dark-100" />
  }
);

export function MapPicker({ lat, lng, onChange, isArabic }: MapPickerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`);
      const data = await res.json();
      if (data.length > 0) {
        const { lat: newLat, lon: newLng, address } = data[0];
        onChange(parseFloat(newLat), parseFloat(newLng), address);
      }
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const reverseGeocode = async (newLat: number, newLng: number) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${newLat}&lon=${newLng}&accept-language=${isArabic ? "ar" : "en"}`);
      const data = await res.json();
      if (data.address) {
        onChange(newLat, newLng, data.address);
      } else {
        onChange(newLat, newLng);
      }
    } catch (err) {
      console.error("Reverse geocode error:", err);
      onChange(newLat, newLng);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder={isArabic ? "ابحث عن مكان..." : "Search for a place..."}
          className="h-12 w-full rounded-[1.2rem] border border-onyx-700 bg-onyx-800/50 pl-12 pr-4 text-sm shadow-soft focus:border-primary-400 focus:ring-2 focus:ring-primary-500/30"
        />
        <button
          onClick={(e) => {
            e.preventDefault();
            void handleSearch();
          }}
          disabled={isSearching}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-onyx-500 hover:text-primary-600"
        >
          <Search className="h-5 w-5" />
        </button>
      </div>

      <div className="overflow-hidden rounded-[1.8rem] border border-onyx-700 shadow-panel">
        <MapInternal lat={lat} lng={lng} onSelect={reverseGeocode} />
      </div>
      
      <p className="text-center text-xs text-onyx-500">
        {isArabic ? "اضغط على الخريطة لتحديد موقعك أو ابحث في الأعلى" : "Click the map to set your location or search above"}
      </p>
    </div>
  );
}
