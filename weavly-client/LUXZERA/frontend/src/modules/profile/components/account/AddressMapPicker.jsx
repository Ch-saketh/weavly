"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { MapPin, Navigation, Search, Check, AlertCircle, RefreshCw, X, Crosshair } from "lucide-react";
import "leaflet/dist/leaflet.css";

// CartoDB Voyager tiles offer a sleek, high-fashion aesthetic
const TILE_URL = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
const TILE_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

export default function AddressMapPicker({
  initialAddress = "",
  initialCoords = null,
  onLocationSelect,
  onClose
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const abortControllerRef = useRef(null);

  const [coords, setCoords] = useState(initialCoords || { lat: 17.3850, lng: 78.4867 }); // Default: Hyderabad / India
  const [resolvedAddress, setResolvedAddress] = useState(null);
  const [isResolving, setIsResolving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [statusError, setStatusError] = useState("");

  // Reverse geocoding via OpenStreetMap Nominatim with debounced abort
  const reverseGeocode = useCallback(async (lat, lng) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsResolving(true);
    setStatusError("");
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&addressdetails=1`,
        {
          signal: abortControllerRef.current.signal,
          headers: {
            "Accept-Language": "en"
          }
        }
      );

      if (!response.ok) throw new Error("Could not reverse geocode coordinates");
      const data = await response.json();

      if (data && data.address) {
        const addr = data.address;
        const streetParts = [
          addr.house_number,
          addr.road || addr.street,
          addr.neighbourhood || addr.suburb || addr.residential
        ].filter(Boolean);

        const street = streetParts.join(", ") || data.name || "Selected Location";
        const city = addr.city || addr.town || addr.village || addr.county || addr.state_district || "";
        const state = addr.state || "";
        const zip = addr.postcode || "";
        const country = addr.country || "India";

        setResolvedAddress({
          displayName: data.display_name,
          street,
          city,
          state,
          zip,
          country,
          lat,
          lng
        });
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        console.warn("Geocoding notice:", err);
        setStatusError("Unable to auto-resolve street name. You can still confirm coordinates.");
      }
    } finally {
      setIsResolving(false);
    }
  }, []);

  // Initialize Leaflet Map
  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;

    let L;
    let isMounted = true;

    import("leaflet").then((leafletModule) => {
      if (!isMounted || !mapContainerRef.current) return;
      L = leafletModule.default || leafletModule;

      // Create Custom Luxury Navy Marker Icon
      const customPin = L.divIcon({
        className: "weavly-map-pin",
        html: `
          <div style="
            position: relative;
            width: 34px;
            height: 34px;
            background: #183B56;
            border: 2px solid #FFFFFF;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            box-shadow: 0 4px 14px rgba(24, 59, 86, 0.45);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: grab;
          ">
            <div style="
              width: 10px;
              height: 10px;
              background: #FFFFFF;
              border-radius: 50%;
              transform: rotate(45deg);
            "></div>
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 34],
        popupAnchor: [0, -34]
      });

      // Avoid double initializing
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }

      const map = L.map(mapContainerRef.current, {
        center: [coords.lat, coords.lng],
        zoom: 15,
        zoomControl: false
      });
      mapInstanceRef.current = map;

      // Add Zoom Control at bottom right
      L.control.zoom({ position: "bottomright" }).addTo(map);

      // Add High-Quality Tiles
      L.tileLayer(TILE_URL, {
        attribution: TILE_ATTRIBUTION,
        maxZoom: 19,
        subdomains: "abcd"
      }).addTo(map);

      // Add Draggable Marker
      const marker = L.marker([coords.lat, coords.lng], {
        icon: customPin,
        draggable: true,
        autoPan: true
      }).addTo(map);
      markerRef.current = marker;

      // Drag End Event
      marker.on("dragend", () => {
        const pos = marker.getLatLng();
        setCoords({ lat: pos.lat, lng: pos.lng });
        reverseGeocode(pos.lat, pos.lng);
      });

      // Map Click Event to drop/move pin
      map.on("click", (e) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        setCoords({ lat, lng });
        reverseGeocode(lat, lng);
      });

      // Initial Reverse Geocode
      reverseGeocode(coords.lat, coords.lng);

      // Invalidate size after layout renders
      setTimeout(() => {
        map.invalidateSize();
      }, 250);
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update pin position and pan map
  const moveToLocation = (lat, lng, zoomLevel = 16) => {
    setCoords({ lat, lng });
    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.setView([lat, lng], zoomLevel, { animate: true });
      markerRef.current.setLatLng([lat, lng]);
    }
    reverseGeocode(lat, lng);
  };

  // GPS Geolocation Handler
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setStatusError("Geolocation is not supported by your browser.");
      return;
    }

    setGpsLoading(true);
    setStatusError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGpsLoading(false);
        const { latitude, longitude } = position.coords;
        moveToLocation(latitude, longitude, 17);
      },
      (err) => {
        setGpsLoading(false);
        console.warn("GPS Geolocation error:", err);
        setStatusError("Permission denied or unable to acquire GPS location.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  };

  // Search Address / Place Query
  const handleSearchSubmit = async (e) => {
    e?.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setStatusError("");
    setSearchResults([]);

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5&addressdetails=1`
      );
      if (!res.ok) throw new Error("Search failed");
      const results = await res.json();
      if (Array.isArray(results) && results.length > 0) {
        setSearchResults(results);
      } else {
        setStatusError("No locations found matching your search.");
      }
    } catch (err) {
      console.warn("Search error:", err);
      setStatusError("Failed to search location. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSearchResult = (result) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    setSearchResults([]);
    setSearchQuery(result.display_name.split(",").slice(0, 3).join(","));
    moveToLocation(lat, lng, 16);
  };

  const handleConfirmLocation = () => {
    if (resolvedAddress) {
      onLocationSelect?.(resolvedAddress);
    } else {
      onLocationSelect?.({
        street: "",
        city: "",
        state: "",
        zip: "",
        country: "India",
        lat: coords.lat,
        lng: coords.lng
      });
    }
    onClose?.();
  };

  return (
    <div className="border border-[#183B56] bg-white shadow-md overflow-hidden relative font-sans text-[#183B56]">
      {/* ── Top Bar with Search & Quick Actions ── */}
      <div className="p-4 sm:p-5 bg-[#F5EFEB] border-b border-[#183B56] space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#183B56] text-white flex items-center justify-center">
              <MapPin size={16} />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#183B56]">
                Interactive Precision Pin Drop
              </h3>
              <p className="text-[10px] text-[#5A7184] font-medium">
                Click map or drag the Navy pin to pinpoint your delivery entrance
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={gpsLoading}
              className="px-3.5 py-2 bg-white hover:bg-[#183B56] hover:text-white text-[#183B56] border border-[#183B56] text-[11px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs shrink-0"
              title="Locate via GPS"
            >
              {gpsLoading ? (
                <RefreshCw size={13} className="animate-spin text-[#183B56]" />
              ) : (
                <Navigation size={13} />
              )}
              <span className="hidden sm:inline">Use GPS</span>
            </button>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 bg-white hover:bg-red-50 text-[#5A7184] hover:text-red-700 border border-[#183B56] flex items-center justify-center cursor-pointer transition-colors"
              >
                <X size={15} />
              </button>
            )}
          </div>
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search apartment, landmark, street, city or PIN code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-4 bg-white border border-[#183B56] text-xs font-semibold text-[#183B56] placeholder-[#5A7184]/60 outline-none focus:ring-1 focus:ring-[#183B56]"
            />
            <Search size={14} className="absolute left-3 top-3 text-[#5A7184]" />
          </div>

          <button
            type="submit"
            disabled={isSearching}
            className="h-10 px-5 bg-[#183B56] hover:bg-[#102A43] text-white border border-[#183B56] text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            {isSearching ? <RefreshCw size={13} className="animate-spin" /> : <span>Search</span>}
          </button>

          {/* Search Autocomplete Suggestions Dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute left-0 right-0 top-11 z-50 bg-white border border-[#183B56] shadow-lg max-h-56 overflow-y-auto divide-y divide-[#183B56]/15">
              {searchResults.map((res, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelectSearchResult(res)}
                  className="w-full text-left p-2.5 hover:bg-[#F5EFEB] text-xs transition-colors flex items-start gap-2 cursor-pointer bg-transparent border-none text-[#183B56]"
                >
                  <MapPin size={13} className="mt-0.5 text-[#183B56] shrink-0" />
                  <span className="truncate">{res.display_name}</span>
                </button>
              ))}
            </div>
          )}
        </form>

        {statusError && (
          <div className="p-2 bg-red-50 border border-red-300 text-[11px] font-bold text-red-700 flex items-center gap-1.5">
            <AlertCircle size={13} />
            <span>{statusError}</span>
          </div>
        )}
      </div>

      {/* ── Leaflet Interactive Map Container ── */}
      <div className="relative h-[320px] sm:h-[380px] w-full bg-[#DFE7ED]">
        <div ref={mapContainerRef} className="w-full h-full z-10" />

        {/* HUD Overlay Badge */}
        <div className="absolute top-3 left-3 z-20 bg-white/95 backdrop-blur-xs border border-[#183B56] px-3 py-1.5 shadow-xs flex items-center gap-2">
          <Crosshair size={13} className="text-[#183B56]" />
          <span className="text-[10px] font-mono font-bold text-[#183B56]">
            {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
          </span>
          {isResolving && (
            <RefreshCw size={11} className="animate-spin text-[#5A7184]" />
          )}
        </div>
      </div>

      {/* ── Bottom Resolved Address & Apply Action Bar ── */}
      <div className="p-4 sm:p-5 bg-white border-t border-[#183B56] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="min-w-0 space-y-1">
          <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#5A7184] block">
            Pinpoint Location Detected
          </span>

          {isResolving ? (
            <div className="flex items-center gap-2 text-xs text-[#5A7184] font-medium">
              <RefreshCw size={13} className="animate-spin text-[#183B56]" />
              <span>Resolving street &amp; postal details...</span>
            </div>
          ) : resolvedAddress ? (
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-[#183B56] truncate">
                {resolvedAddress.street}
              </p>
              <p className="text-[11px] text-[#5A7184] font-mono">
                {[resolvedAddress.city, resolvedAddress.state, resolvedAddress.zip, resolvedAddress.country]
                  .filter(Boolean)
                  .join(", ")}
              </p>
            </div>
          ) : (
            <p className="text-xs font-medium text-[#5A7184]">
              Drag the pin or click on the map to pinpoint your location.
            </p>
          )}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-[#F5EFEB] hover:bg-white text-[#183B56] border border-[#183B56] text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
            >
              Cancel
            </button>
          )}

          <button
            type="button"
            onClick={handleConfirmLocation}
            className="px-6 py-2.5 bg-[#183B56] hover:bg-[#102A43] text-white border border-[#183B56] text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <Check size={14} />
            <span>Confirm &amp; Fill Address</span>
          </button>
        </div>
      </div>
    </div>
  );
}
