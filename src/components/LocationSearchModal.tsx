import React, { useState, useEffect } from 'react';
import {
  Search,
  MapPin,
  Compass,
  X,
  Star,
  Clock,
  Loader2,
  Check,
} from 'lucide-react';
import { WeatherLocation } from '../types/weather';
import { searchLocations } from '../services/weatherApi';
import { DEFAULT_LOCATIONS } from '../services/storageService';
import { WEATHER_SCENES } from '../utils/weatherImages';

interface LocationSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation: (loc: WeatherLocation) => void;
  currentLocation: WeatherLocation;
  favorites: WeatherLocation[];
  onToggleFavorite: (loc: WeatherLocation) => void;
}

export const LocationSearchModal: React.FC<LocationSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectLocation,
  currentLocation,
  favorites,
  onToggleFavorite,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<WeatherLocation[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [geoLocating, setGeoLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const res = await searchLocations(query);
      setResults(res);
      setIsSearching(false);
    }, 350);

    return () => clearTimeout(timer);
  }, [query]);

  const handleUseGeolocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }

    setGeoLocating(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          // Attempt reverse geocoding via Open-Meteo or create coordinate location
          const res = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${latitude.toFixed(
              2
            )},${longitude.toFixed(2)}&count=1&language=en&format=json`
          );
          let locName = 'Current Location';
          let country = '';
          if (res.ok) {
            const data = await res.json();
            if (data.results && data.results[0]) {
              locName = data.results[0].name;
              country = data.results[0].country || '';
            }
          }

          const newLoc: WeatherLocation = {
            id: `geo_${latitude.toFixed(2)}_${longitude.toFixed(2)}`,
            name: locName,
            country: country,
            latitude,
            longitude,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'auto',
          };

          onSelectLocation(newLoc);
          onClose();
        } catch {
          const fallbackLoc: WeatherLocation = {
            id: `geo_${latitude.toFixed(2)}_${longitude.toFixed(2)}`,
            name: 'Local Station',
            country: 'GPS Position',
            latitude,
            longitude,
            timezone: 'auto',
          };
          onSelectLocation(fallbackLoc);
          onClose();
        } finally {
          setGeoLocating(false);
        }
      },
      (err) => {
        console.warn('Geolocation error', err);
        setGeoError('Could not retrieve your GPS location. Please check browser permissions.');
        setGeoLocating(false);
      },
      { timeout: 8000 }
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/80 backdrop-blur-sm p-4 pt-16 sm:pt-24 animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700 p-5 sm:p-6 shadow-2xl text-slate-100 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Select Location</h3>
              <p className="text-xs text-slate-400">Search world cities or use your device GPS</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input bar */}
        <div className="relative my-4">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="input-city-search"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search city, e.g. London, Tokyo, Chicago..."
            autoFocus
            className="w-full pl-10 pr-10 py-3 rounded-2xl bg-slate-800/80 border border-slate-700 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* GPS Button */}
        <button
          id="btn-use-gps-location"
          onClick={handleUseGeolocation}
          disabled={geoLocating}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/30 font-semibold text-xs transition mb-4 disabled:opacity-60"
        >
          {geoLocating ? (
            <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
          ) : (
            <Compass className="w-4 h-4 text-sky-400" />
          )}
          <span>{geoLocating ? 'Detecting Location...' : 'Use Current Device Location'}</span>
        </button>

        {geoError && (
          <div className="mb-4 text-xs text-rose-300 bg-rose-950/60 p-2.5 rounded-xl border border-rose-500/30">
            {geoError}
          </div>
        )}

        {/* Results / Favorites list */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
          {isSearching ? (
            <div className="flex items-center justify-center py-8 text-xs text-slate-400 gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
              <span>Searching meteorological stations...</span>
            </div>
          ) : results.length > 0 ? (
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-1">
                Search Results ({results.length})
              </span>
              <div className="mt-2 space-y-1.5">
                {results.map((loc) => {
                  const isCurrent = currentLocation.id === loc.id;
                  const isFav = favorites.some((f) => f.id === loc.id);

                  return (
                    <div
                      key={loc.id}
                      className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 hover:bg-slate-800 transition"
                    >
                      <button
                        onClick={() => {
                          onSelectLocation(loc);
                          onClose();
                        }}
                        className="flex-1 text-left flex items-center gap-3"
                      >
                        <MapPin className="w-4 h-4 text-sky-400 flex-shrink-0" />
                        <div>
                          <div className="font-semibold text-sm text-white flex items-center gap-1.5">
                            <span>{loc.name}</span>
                            {isCurrent && (
                              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded font-medium">
                                Active
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-400">
                            {[loc.admin1, loc.country].filter(Boolean).join(', ')}
                          </div>
                        </div>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(loc);
                        }}
                        className="p-2 text-slate-400 hover:text-amber-400"
                        title="Add to favorites"
                      >
                        <Star
                          className={`w-4 h-4 ${isFav ? 'text-amber-400 fill-amber-400' : ''}`}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <>
              {/* Favorites / Saved Cities */}
              {favorites.length > 0 && (
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-1">
                    Favorite Cities
                  </span>
                  <div className="mt-2 space-y-1.5">
                    {favorites.map((loc) => {
                      const isCurrent = currentLocation.id === loc.id;
                      return (
                        <div
                          key={loc.id}
                          className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/40 border border-slate-700/50 hover:bg-slate-800 transition"
                        >
                          <button
                            onClick={() => {
                              onSelectLocation(loc);
                              onClose();
                            }}
                            className="flex-1 text-left flex items-center gap-3"
                          >
                            <MapPin className="w-4 h-4 text-amber-400 flex-shrink-0" />
                            <div>
                              <div className="font-semibold text-sm text-white flex items-center gap-1.5">
                                <span>{loc.name}</span>
                                {isCurrent && (
                                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded font-medium">
                                    Active
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-slate-400">
                                {[loc.admin1, loc.country].filter(Boolean).join(', ')}
                              </div>
                            </div>
                          </button>

                          <button
                            onClick={() => onToggleFavorite(loc)}
                            className="p-2 text-amber-400"
                            title="Remove from favorites"
                          >
                            <Star className="w-4 h-4 fill-amber-400" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Popular Reference Global Cities */}
              <div className="mt-4">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-1">
                  Popular Meteorological Hubs
                </span>
                <div className="grid grid-cols-2 gap-2.5 mt-2">
                  {DEFAULT_LOCATIONS.map((loc, idx) => {
                    const isCurrent = currentLocation.name === loc.name;
                    const sceneKeys: Array<keyof typeof WEATHER_SCENES> = ['sunny', 'rainy', 'dusk', 'night', 'sunny', 'dusk'];
                    const scene = WEATHER_SCENES[sceneKeys[idx % sceneKeys.length]];

                    return (
                      <button
                        key={loc.id}
                        onClick={() => {
                          onSelectLocation(loc);
                          onClose();
                        }}
                        className={`relative overflow-hidden p-2.5 rounded-2xl border text-left flex items-center gap-2.5 transition group ${
                          isCurrent
                            ? 'bg-sky-500/20 border-sky-400/50 text-sky-200 ring-1 ring-sky-400/30'
                            : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                        }`}
                      >
                        <img
                          src={scene.image}
                          alt={loc.name}
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 rounded-xl object-cover border border-white/20 flex-shrink-0 group-hover:scale-105 transition-transform"
                        />
                        <div className="min-w-0 flex-1">
                          <span className="font-bold text-xs text-white block truncate">{loc.name}</span>
                          <span className="text-[10px] text-slate-400 block truncate">{loc.country}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
