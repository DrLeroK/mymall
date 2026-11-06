'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';
import { MapPin, Search, X, Check, Crosshair, Loader2, Layers, Compass, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface MapPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation: (location: { lat: number; lng: number; address: string }) => void;
  initialCoords?: { lat: number; lng: number } | null;
  initialAddress?: string;
}

// Popular Ethiopian landmarks with accurate coordinates
const POPULAR_LOCATIONS = [
  { name: 'Bole Medhanealem, Addis Ababa', lat: 8.9956, lng: 38.7885 },
  { name: 'Bole Atlas, Addis Ababa', lat: 9.0062, lng: 38.7758 },
  { name: 'Kazanchis (ECA), Addis Ababa', lat: 9.0185, lng: 38.7668 },
  { name: 'Mexico Square, Addis Ababa', lat: 9.0108, lng: 38.7444 },
  { name: 'Piassa / Arada, Addis Ababa', lat: 9.0345, lng: 38.7523 },
  { name: 'Megenagna Square, Addis Ababa', lat: 9.0203, lng: 38.8021 },
  { name: 'Gerji (Imperial), Addis Ababa', lat: 9.0012, lng: 38.8045 },
  { name: 'Sarbet / AU, Addis Ababa', lat: 9.0001, lng: 38.7369 },
  { name: 'Summit / CMC, Addis Ababa', lat: 9.0289, lng: 38.8475 },
  { name: 'Ayat Zone 2, Addis Ababa', lat: 9.0412, lng: 38.8689 },
  { name: 'Lebu Varnero, Addis Ababa', lat: 8.9621, lng: 38.7214 },
  { name: 'Gotera Condominium, Addis Ababa', lat: 8.9887, lng: 38.7548 },
  { name: 'Adama City Center, Oromia', lat: 8.5412, lng: 39.2689 },
  { name: 'Hawassa Lake Side, Sidama', lat: 7.0621, lng: 38.4764 },
];

const MAPBOX_TOKEN =
  process.env.MAPBOX_TOKEN ||
  process.env.NEXT_PUBLIC_MAPBOX_TOKEN ||
  '';

const MAPBOX_GEOCODING_URL =
  process.env.MAPBOX_GEOCODING_URL ||
  process.env.NEXT_PUBLIC_MAPBOX_GEOCODING_URL ||
  'https://api.mapbox.com/geocoding/v5/mapbox.places';

declare global {
  interface Window {
    mapboxgl: any;
  }
}

export function MapPickerModal({
  isOpen,
  onClose,
  onSelectLocation,
  initialCoords,
  initialAddress,
}: MapPickerModalProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const [coords, setCoords] = useState<{ lat: number; lng: number }>(
    initialCoords || { lat: 9.0062, lng: 38.7758 } // default to Bole Atlas
  );
  const [address, setAddress] = useState(initialAddress || 'Bole Atlas, Addis Ababa');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ name: string; lat: number; lng: number }>>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isMapboxLoaded, setIsMapboxLoaded] = useState(false);
  const [mapMode, setMapMode] = useState<'streets' | 'satellite'>('streets');
  const [isLocatingUser, setIsLocatingUser] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerInstanceRef = useRef<any>(null);

  const handleToggleMapMode = () => {
    const nextMode = mapMode === 'streets' ? 'satellite' : 'streets';
    setMapMode(nextMode);
    if (mapInstanceRef.current) {
      const styleUrl =
        nextMode === 'satellite'
          ? 'mapbox://styles/mapbox/satellite-streets-v12'
          : (isDark ? 'mapbox://styles/mapbox/dark-v11' : 'mapbox://styles/mapbox/streets-v12');
      mapInstanceRef.current.setStyle(styleUrl, { diff: false });
    }
  };

  const handleLocateMe = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocatingUser(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(5));
        const lng = Number(pos.coords.longitude.toFixed(5));
        setCoords({ lat, lng });
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo({ center: [lng, lat], zoom: 16, essential: true });
        }
        if (markerInstanceRef.current) {
          markerInstanceRef.current.setLngLat([lng, lat]);
        }
        reverseGeocode(lat, lng);
        setIsLocatingUser(false);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setIsLocatingUser(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Sync initial props
  useEffect(() => {
    if (initialCoords && (initialCoords.lat !== coords.lat || initialCoords.lng !== coords.lng)) {
      setCoords(initialCoords);
    }
    if (initialAddress) {
      setAddress(initialAddress);
    }
  }, [initialCoords, initialAddress]);

  // Dynamically load Mapbox GL JS and CSS
  useEffect(() => {
    if (!isOpen) return;

    if (window.mapboxgl) {
      setIsMapboxLoaded(true);
      return;
    }

    const cssId = 'mapbox-gl-css';
    if (!document.getElementById(cssId)) {
      const link = document.createElement('link');
      link.id = cssId;
      link.rel = 'stylesheet';
      link.href = 'https://api.mapbox.com/mapbox-gl-js/v3.4.0/mapbox-gl.css';
      document.head.appendChild(link);
    }

    const scriptId = 'mapbox-gl-js';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://api.mapbox.com/mapbox-gl-js/v3.4.0/mapbox-gl.js';
      script.async = true;
      script.onload = () => {
        setIsMapboxLoaded(true);
      };
      document.body.appendChild(script);
    } else {
      setIsMapboxLoaded(true);
    }
  }, [isOpen]);

  // Reverse geocoding helper using Mapbox Geocoding API
  const reverseGeocode = async (lat: number, lng: number) => {
    setIsGeocoding(true);
    try {
      const res = await fetch(
        `${MAPBOX_GEOCODING_URL}/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&types=poi,address,neighborhood,locality,place`
      );
      if (res.ok) {
        const data = await res.json();
        if (data.features && data.features.length > 0) {
          const placeName = data.features[0].place_name;
          setAddress(placeName);
          return;
        }
      }
    } catch (err) {
      console.error('Reverse geocode error:', err);
    } finally {
      setIsGeocoding(false);
    }

    // Fallback to closest preset or coordinates
    const matched = POPULAR_LOCATIONS.find(
      (p) => Math.abs(p.lat - lat) < 0.005 && Math.abs(p.lng - lng) < 0.005
    );
    if (matched) {
      setAddress(matched.name);
    } else {
      setAddress(`Delivery Point (${lat.toFixed(5)}, ${lng.toFixed(5)})`);
    }
  };

  // Search places via Mapbox Geocoding API or preset matching
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const debounceTimer = setTimeout(async () => {
      setIsSearching(true);

      // Local preset matches
      const localMatches = POPULAR_LOCATIONS.filter((loc) =>
        loc.name.toLowerCase().includes(searchQuery.toLowerCase())
      );

      try {
        const res = await fetch(
          `${MAPBOX_GEOCODING_URL}/${encodeURIComponent(
            searchQuery
          )}.json?access_token=${MAPBOX_TOKEN}&country=ET&proximity=38.7578,8.9806&limit=5`
        );
        if (res.ok) {
          const data = await res.json();
          const apiMatches = (data.features || []).map((f: any) => ({
            name: f.place_name,
            lat: f.center[1],
            lng: f.center[0],
          }));

          // Merge local and API matches, deduping by coordinates
          const combined = [...localMatches];
          for (const item of apiMatches) {
            if (!combined.some((m) => Math.abs(m.lat - item.lat) < 0.001 && Math.abs(m.lng - item.lng) < 0.001)) {
              combined.push(item);
            }
          }
          setSearchResults(combined.slice(0, 8));
        } else {
          setSearchResults(localMatches);
        }
      } catch (e) {
        setSearchResults(localMatches);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  // Initialize Mapbox map
  useEffect(() => {
    if (!isOpen || !isMapboxLoaded || !mapContainerRef.current || !window.mapboxgl) return;

    const mapboxgl = window.mapboxgl;
    mapboxgl.accessToken = MAPBOX_TOKEN;

    const mapStyle =
      mapMode === 'satellite'
        ? 'mapbox://styles/mapbox/satellite-streets-v12'
        : isDark
        ? 'mapbox://styles/mapbox/dark-v11'
        : 'mapbox://styles/mapbox/streets-v12';

    // Cleanup previous instance
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Initialize Mapbox instance
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: mapStyle,
      center: [coords.lng, coords.lat],
      zoom: 15,
      attributionControl: false,
    });

    mapInstanceRef.current = map;

    // Navigation Controls
    map.addControl(new mapboxgl.NavigationControl({ showCompass: true }), 'top-right');

    // Geolocation Control to pick user GPS directly
    const geolocateControl = new mapboxgl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: false,
    });
    map.addControl(geolocateControl, 'top-right');

    geolocateControl.on('geolocate', (e: any) => {
      const lat = Number(e.coords.latitude.toFixed(5));
      const lng = Number(e.coords.longitude.toFixed(5));
      setCoords({ lat, lng });
      if (markerInstanceRef.current) {
        markerInstanceRef.current.setLngLat([lng, lat]);
      }
      reverseGeocode(lat, lng);
    });

    // Create custom pin element
    const el = document.createElement('div');
    el.className = 'custom-mapbox-pin';
    el.style.cursor = 'grab';
    el.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; transform: translate(0, -50%);">
        <div style="background: #e11d48; color: white; font-size: 11px; font-weight: 800; padding: 2px 8px; border-radius: 9999px; box-shadow: 0 4px 10px rgba(0,0,0,0.35); white-space: nowrap; margin-bottom: 2px; border: 1.5px solid white; letter-spacing: 0.02em;">
          Delivery Spot
        </div>
        <svg width="34" height="34" viewBox="0 0 24 24" fill="#e11d48" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.45));">
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
          <circle cx="12" cy="10" r="3" fill="#ffffff"/>
        </svg>
      </div>
    `;

    // Draggable Marker
    const marker = new mapboxgl.Marker({
      element: el,
      draggable: true,
      anchor: 'bottom',
    })
      .setLngLat([coords.lng, coords.lat])
      .addTo(map);

    markerInstanceRef.current = marker;

    // Handle marker drag end
    marker.on('dragend', () => {
      const lngLat = marker.getLngLat();
      const lat = Number(lngLat.lat.toFixed(5));
      const lng = Number(lngLat.lng.toFixed(5));
      setCoords({ lat, lng });
      reverseGeocode(lat, lng);
    });

    // Handle click anywhere on the map to relocate pin
    map.on('click', (e: any) => {
      const lat = Number(e.lngLat.lat.toFixed(5));
      const lng = Number(e.lngLat.lng.toFixed(5));
      marker.setLngLat([lng, lat]);
      setCoords({ lat, lng });
      reverseGeocode(lat, lng);
    });

    // Invalidate size once map finishes loading
    map.on('load', () => {
      map.resize();
    });

    const resizeTimer = setTimeout(() => {
      map.resize();
    }, 250);

    return () => {
      clearTimeout(resizeTimer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isOpen, isMapboxLoaded, isDark]);

  if (!isOpen) return null;

  const handleSelectPreset = (loc: { name: string; lat: number; lng: number }) => {
    const lat = Number(loc.lat.toFixed(5));
    const lng = Number(loc.lng.toFixed(5));
    setCoords({ lat, lng });
    setAddress(loc.name);
    setSearchQuery('');
    setSearchResults([]);

    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo({
        center: [lng, lat],
        zoom: 16,
        essential: true,
      });
    }
    if (markerInstanceRef.current) {
      markerInstanceRef.current.setLngLat([lng, lat]);
    }
  };

  const handleConfirm = () => {
    onSelectLocation({
      lat: coords.lat,
      lng: coords.lng,
      address: address.trim() || `Delivery Spot (${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)})`,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-rose-500" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Pick Delivery Location</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                  Mapbox
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Click anywhere or drag the pin to set your exact doorstep delivery spot
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Ethiopian location (Bole, Kazanchis, Piassa, CMC, Summit, Sarbet)..."
              className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/30 font-medium"
            />
            {isSearching && (
              <Loader2 className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-rose-500 animate-spin" />
            )}
          </div>

          {/* Quick Select Ethiopian Neighborhood Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {POPULAR_LOCATIONS.slice(0, 8).map((loc) => {
              const isSelected =
                Math.abs(coords.lat - loc.lat) < 0.005 && Math.abs(coords.lng - loc.lng) < 0.005;
              return (
                <button
                  key={loc.name}
                  type="button"
                  onClick={() => handleSelectPreset(loc)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                    isSelected
                      ? 'bg-rose-500 text-white border-rose-500 shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-rose-500/50'
                  }`}
                >
                  {loc.name.split(',')[0]}
                </button>
              );
            })}
          </div>

          {/* Autocomplete / Search Results */}
          {searchQuery.trim().length >= 2 && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
              {searchResults.length > 0 ? (
                searchResults.map((s, idx) => (
                  <button
                    key={`${s.name}-${idx}`}
                    type="button"
                    onClick={() => handleSelectPreset(s)}
                    className="w-full text-left px-4 py-2.5 hover:bg-rose-50/50 dark:hover:bg-slate-800/80 flex items-center justify-between text-xs transition-colors"
                  >
                    <span className="font-bold text-slate-800 dark:text-slate-200 truncate pr-2">
                      {s.name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono shrink-0">
                      {s.lat.toFixed(4)}, {s.lng.toFixed(4)}
                    </span>
                  </button>
                ))
              ) : (
                !isSearching && (
                  <div className="p-3 text-center text-xs text-slate-500">
                    No matching location. You can click anywhere directly on the map.
                  </div>
                )
              )}
            </div>
          )}

          {/* Mapbox Interactive Map Container */}
          <div className="relative rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-slate-700 shadow-inner">
            <div
              ref={mapContainerRef}
              className="h-72 sm:h-80 w-full bg-slate-100 dark:bg-slate-950"
              style={{ minHeight: '300px' }}
            />

            {/* Instruction Badge */}
            <div className="absolute top-2.5 left-2.5 z-10 bg-slate-900/85 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl backdrop-blur-md flex items-center gap-1.5 shadow-lg border border-slate-700/60 pointer-events-none">
              <Crosshair className="w-3.5 h-3.5 text-rose-400 animate-spin" style={{ animationDuration: '6s' }} />
              <span>Click map or drag the pin to set spot</span>
            </div>

            {/* Floating Map Controls (Layer Switcher & GPS Locate) */}
            <div className="absolute top-2.5 right-12 z-10 flex items-center gap-2">
              <button
                type="button"
                onClick={handleToggleMapMode}
                className="px-2.5 py-1.5 rounded-xl bg-slate-900/90 text-white hover:bg-slate-800 text-[11px] font-bold backdrop-blur-md shadow-lg border border-slate-700/60 flex items-center gap-1.5 transition-all"
                title="Toggle Satellite Imagery vs Streets"
              >
                <Layers className="w-3.5 h-3.5 text-rose-400" />
                <span className="capitalize">{mapMode === 'satellite' ? 'Streets' : 'Satellite'}</span>
              </button>
              <button
                type="button"
                onClick={handleLocateMe}
                disabled={isLocatingUser}
                className="px-2.5 py-1.5 rounded-xl bg-slate-900/90 text-white hover:bg-slate-800 text-[11px] font-bold backdrop-blur-md shadow-lg border border-slate-700/60 flex items-center gap-1.5 transition-all disabled:opacity-50"
                title="Find My GPS Location"
              >
                {isLocatingUser ? (
                  <Loader2 className="w-3.5 h-3.5 text-rose-400 animate-spin" />
                ) : (
                  <Navigation className="w-3.5 h-3.5 text-rose-400" />
                )}
                <span>Locate Me</span>
              </button>
            </div>

            {/* Reverse Geocoding Loading Indicator */}
            {isGeocoding && (
              <div className="absolute bottom-2.5 left-2.5 z-10 bg-slate-900/85 text-white text-[11px] font-medium px-3 py-1 rounded-xl backdrop-blur-md flex items-center gap-2 shadow border border-slate-700/60 pointer-events-none">
                <Loader2 className="w-3 h-3 text-rose-400 animate-spin" />
                <span>Locating address...</span>
              </div>
            )}
          </div>

          {/* Selected Coordinates & Address Field */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-300">Selected GPS Coordinates:</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400 font-black bg-emerald-50 dark:bg-emerald-950/70 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                Lat: {coords.lat.toFixed(5)}, Lng: {coords.lng.toFixed(5)}
              </span>
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                Street / Neighborhood Description
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Bole Atlas, Next to Edna Mall, House #42"
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5 bg-slate-50/60 dark:bg-slate-950/40">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleConfirm}
            className="gap-1.5 shadow-md bg-rose-600 hover:bg-rose-700 text-white"
          >
            <Check className="w-4 h-4" />
            <span>Confirm Delivery Location</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
