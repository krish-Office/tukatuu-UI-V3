"use client";

import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Search } from "lucide-react";

// Fix Leaflet's default icon issue with webpack/Next.js
delete (L.Icon.Default.prototype as L.Icon.Default & { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapPickerProps {
  onLocationSelect: (lat: number, lng: number) => void;
  onAddressExtracted: (address: { city: string; street: string }) => void;
  initialPosition?: LatLng;
}

interface LatLng {
  lat: number;
  lng: number;
}

interface LocationMarkerProps {
  position: LatLng | null;
  setPosition: (position: LatLng) => void;
  onLocationSelect: (lat: number, lng: number) => void;
  onAddressExtracted: (address: { city: string; street: string }) => void;
}

const reverseGeocode = async (
  lat: number,
  lng: number,
  callback: (address: { city: string; street: string }) => void,
) => {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
    const data = await response.json();
    if (data && data.address) {
      const city = data.address.city || data.address.town || data.address.village || data.address.county || "";
      const street = data.address.road || data.address.suburb || data.address.neighbourhood || data.display_name.split(",")[0] || "";
      callback({ city, street });
    }
  } catch (err) {
    console.error("Reverse geocoding failed", err);
  }
};

function LocationMarker({ position, setPosition, onLocationSelect, onAddressExtracted }: LocationMarkerProps) {
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
      onLocationSelect(e.latlng.lat, e.latlng.lng);
      reverseGeocode(e.latlng.lat, e.latlng.lng, onAddressExtracted);
    },
  });

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
}

function ResizeMap() {
  const map = useMap();

  useEffect(() => {
    const timeout = window.setTimeout(() => map.invalidateSize(), 100);
    return () => window.clearTimeout(timeout);
  }, [map]);

  return null;
}

function UpdateMapCenter({ position }: { position: LatLng }) {
  const map = useMap();

  useEffect(() => {
    map.flyTo([position.lat, position.lng], 16);
  }, [map, position.lat, position.lng]);

  return null;
}

function BoundsTracker({ onBoundsChange }: { onBoundsChange: (bounds: string) => void }) {
  const map = useMapEvents({
    moveend() {
      const b = map.getBounds();
      const viewboxStr = `${b.getWest()},${b.getNorth()},${b.getEast()},${b.getSouth()}`;
      onBoundsChange(viewboxStr);
    }
  });

  useEffect(() => {
    const b = map.getBounds();
    const viewboxStr = `${b.getWest()},${b.getNorth()},${b.getEast()},${b.getSouth()}`;
    onBoundsChange(viewboxStr);
  }, [map, onBoundsChange]);

  return null;
}

export default function MapPicker({ onLocationSelect, onAddressExtracted, initialPosition }: MapPickerProps) {
  const [position, setPosition] = useState(initialPosition ?? { lat: 27.7172, lng: 85.3240 }); // Kathmandu default
  const [isDetecting, setIsDetecting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [mapBounds, setMapBounds] = useState<string>("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounced search query suggestions fetcher for live autocomplete
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        let url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&addressdetails=1&limit=5`;
        if (mapBounds) {
          url += `&viewbox=${mapBounds}&bounded=0`; // Bias results near active map bounds
        }
        const res = await fetch(url);
        const data = await res.json();
        if (data && Array.isArray(data)) {
          setSuggestions(data);
          setShowDropdown(true);
        }
      } catch (err) {
        console.error("Failed to fetch search suggestions:", err);
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [searchQuery, mapBounds]);

  // Click outside listener to close the live suggestions dropdown
  useEffect(() => {
    function clickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", clickOutside);
    return () => document.removeEventListener("mousedown", clickOutside);
  }, []);

  const handleSelectSuggestion = (sug: any) => {
    const lat = parseFloat(sug.lat);
    const lng = parseFloat(sug.lon);
    const newPos = { lat, lng };
    setPosition(newPos);
    onLocationSelect(lat, lng);
    
    // Extract address information from geocoding detail features
    const city = sug.address?.city || sug.address?.town || sug.address?.village || sug.address?.county || "";
    const street = sug.address?.road || sug.address?.suburb || sug.address?.neighbourhood || sug.display_name.split(",")[0] || "";
    
    if (city && street) {
      onAddressExtracted({ city, street });
    } else {
      reverseGeocode(lat, lng, onAddressExtracted);
    }
    
    setSearchQuery(sug.display_name);
    setShowDropdown(false);
  };

  const handleSearchSubmit = async (e?: React.FormEvent | React.KeyboardEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setShowDropdown(false);
    try {
      let url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=5`;
      if (mapBounds) {
        url += `&viewbox=${mapBounds}&bounded=1`;
      }

      const response = await fetch(url);
      let data = await response.json();

      // If bounded search returned no results, fallback to a global search
      if ((!data || data.length === 0) && mapBounds) {
        const fallbackUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1`;
        const fallbackResponse = await fetch(fallbackUrl);
        data = await fallbackResponse.json();
      }

      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        const newPos = { lat, lng };
        setPosition(newPos);
        onLocationSelect(lat, lng);
        reverseGeocode(lat, lng, onAddressExtracted);
      } else {
        alert("Location not found. Please try a different search.");
      }
    } catch (err) {
      console.error("Location search failed", err);
      alert("Something went wrong during search.");
    } finally {
      setIsSearching(false);
    }
  };

  const detectLocation = () => {
    if ("geolocation" in navigator) {
      setIsDetecting(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setPosition({ lat: latitude, lng: longitude });
          onLocationSelect(latitude, longitude);
          reverseGeocode(latitude, longitude, onAddressExtracted);
          setIsDetecting(false);
        },
        (err) => {
          console.error(err);
          alert("Could not fetch location. Please enable location permissions.");
          setIsDetecting(false);
        },
        { enableHighAccuracy: true }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  return (
    <div ref={dropdownRef} className="w-full flex flex-col gap-3 relative">
      
      {/* Premium Dedicated Search Bar (Outside of Map) */}
      <div className="relative w-full flex flex-col gap-1 z-[1000]">
        <div className="flex gap-2">
          <div className="flex-1 bg-white border border-mint-200/80 focus-within:border-mint-500 rounded-xl px-4 py-2 flex items-center gap-2 shadow-sm transition-all">
            <Search size={16} className="text-mint-600/70 shrink-0" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (suggestions.length > 0) {
                  setShowDropdown(true);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSearchSubmit();
                }
              }}
              placeholder="Search delivery location (e.g. Kathmandu, Tinkune)..."
              className="w-full bg-transparent text-sm text-mint-900 placeholder:text-mint-600/50 focus:outline-none"
            />
          </div>
          <button
            type="button"
            onClick={() => handleSearchSubmit()}
            disabled={isSearching}
            className="bg-mint-850 hover:bg-mint-900 active:bg-mint-950 text-white font-semibold text-xs px-5 rounded-xl shadow-md transition-all disabled:opacity-75 disabled:cursor-wait flex items-center justify-center shrink-0"
          >
            {isSearching ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              "Search"
            )}
          </button>
        </div>

        {/* Live Search Suggestions Dropdown */}
        {showDropdown && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white/95 backdrop-blur-md rounded-xl border border-mint-200 shadow-2xl overflow-hidden max-h-[180px] overflow-y-auto custom-scrollbar z-[1050]">
            {suggestions.map((sug, index) => (
              <div
                key={index}
                onClick={() => handleSelectSuggestion(sug)}
                className="px-4 py-2.5 hover:bg-mint-50/80 text-xs text-mint-900 cursor-pointer border-b border-mint-50/50 last:border-0 transition-colors line-clamp-1 flex items-center gap-2"
                title={sug.display_name}
              >
                <span className="text-mint-700 shrink-0">📍</span>
                <span className="truncate">{sug.display_name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Map Container Box */}
      <div className="relative w-full h-[250px] rounded-2xl overflow-hidden shadow-inner border border-mint-200/80 z-10">
        <MapContainer center={position} zoom={13} style={{ height: "100%", width: "100%", zIndex: 10 }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ResizeMap />
          <UpdateMapCenter position={position} />
          <BoundsTracker onBoundsChange={setMapBounds} />
          <LocationMarker position={position} setPosition={setPosition} onLocationSelect={onLocationSelect} onAddressExtracted={onAddressExtracted} />
        </MapContainer>
        
        <div className="absolute bottom-4 left-4 right-4 z-[400] flex justify-between items-center pointer-events-none">
          <div className="bg-[#0f172a]/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-800 shadow-md flex items-center pointer-events-auto">
            <span className="text-[10px] font-mono text-slate-300">
              {position.lat.toFixed(4)}, {position.lng.toFixed(4)}
            </span>
          </div>

          <button 
            type="button"
            onClick={detectLocation}
            disabled={isDetecting}
            className="bg-mint-600 hover:bg-mint-700 active:bg-mint-800 text-white px-4 py-1.5 rounded-full font-bold shadow-lg shadow-mint-500/20 transition-all pointer-events-auto flex items-center gap-1.5 disabled:opacity-70 disabled:cursor-wait text-[11px] cursor-pointer"
          >
            {isDetecting ? "Detecting..." : "📍 Detect Location"}
          </button>
        </div>
      </div>

    </div>
  );
}
