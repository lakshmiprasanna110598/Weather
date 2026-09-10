import React, { useState, useEffect, useCallback } from 'react';
import {
  MapPin,
  RefreshCw,
  Search,
  Sparkles,
  Smartphone,
  Sliders,
  AlertCircle,
  CloudSun,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';
import { WeatherData, WeatherLocation, TempUnit } from './types/weather';
import { fetchWeatherData } from './services/weatherApi';
import {
  getSavedLocation,
  saveLocation,
  getSavedFavorites,
  saveFavorites,
  getSavedUnit,
  saveUnit,
  getCachedWeather,
} from './services/storageService';
import { CurrentWeatherCard } from './components/CurrentWeatherCard';
import { FiveDayHourlyForecast } from './components/FiveDayHourlyForecast';
import { WeatherAlertsBanner } from './components/WeatherAlertsBanner';
import { WeatherWidget } from './components/WeatherWidget';
import { LocationSearchModal } from './components/LocationSearchModal';
import { StandaloneWidgetModal } from './components/StandaloneWidgetModal';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';
import { AmbientAudioBar } from './components/AmbientAudioBar';
import { Music } from 'lucide-react';

export default function App() {
  const [location, setLocation] = useState<WeatherLocation>(getSavedLocation);
  const [favorites, setFavorites] = useState<WeatherLocation[]>(getSavedFavorites);
  const [unit, setUnit] = useState<TempUnit>(getSavedUnit);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(() =>
    getCachedWeather(location.latitude, location.longitude)
  );
  const [isLoading, setIsLoading] = useState<boolean>(!weatherData);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isStandaloneWidgetOpen, setIsStandaloneWidgetOpen] = useState(false);

  const loadWeather = useCallback(async (loc: WeatherLocation, isManualRefresh = false) => {
    if (isManualRefresh) setIsRefreshing(true);
    else setIsLoading(true);
    setErrorMsg(null);

    try {
      const data = await fetchWeatherData(loc);
      setWeatherData(data);
    } catch (err) {
      console.warn('Weather fetch caught error', err);
      setErrorMsg('Unable to retrieve latest weather. Offline cached data is displayed.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadWeather(location);
  }, [location, loadWeather]);

  const handleSelectLocation = (newLoc: WeatherLocation) => {
    setLocation(newLoc);
    saveLocation(newLoc);
  };

  const handleToggleUnit = () => {
    const nextUnit: TempUnit = unit === 'C' ? 'F' : 'C';
    setUnit(nextUnit);
    saveUnit(nextUnit);
  };

  const handleToggleFavorite = (loc: WeatherLocation) => {
    let nextFavs: WeatherLocation[];
    if (favorites.some((f) => f.id === loc.id)) {
      nextFavs = favorites.filter((f) => f.id !== loc.id);
    } else {
      nextFavs = [...favorites, loc];
    }
    setFavorites(nextFavs);
    saveFavorites(nextFavs);
  };

  const handleTriggerTestAlert = () => {
    if (!weatherData) return;
    const testAlert = {
      id: `sim_alert_${Date.now()}`,
      event: 'Severe Flash Flood & Gale Advisory',
      severity: 'extreme' as const,
      headline: 'Rapid localized runoff with gale force wind gusts exceeding 65 km/h',
      description: 'A line of intense convective precipitation is impacting low-lying terrain with dangerous road pooling and high probability of falling tree branches.',
      instruction: 'Avoid non-essential transit through flooded intersections. Seek sturdy indoor shelter immediately.',
      effective: 'Immediate',
      expires: 'Next 3 Hours',
      sender: 'National Severe Hazards Operations Desk',
      isSimulated: true,
    };

    setWeatherData({
      ...weatherData,
      alerts: [testAlert, ...weatherData.alerts.filter((a) => !a.isSimulated)],
    });

    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('🚨 Weather Alert: Severe Flash Flood Warning', {
        body: 'Rapid localized runoff and gale gusts detected. Seek indoor shelter.',
        icon: '/icon.svg',
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-sky-500 selection:text-slate-950 pb-20">
      {/* Top Navigation Header */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-6 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          {/* Logo & Brand */}
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-gradient-to-tr from-sky-600 to-cyan-400 text-slate-950 shadow-md">
              <CloudSun className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
                <span>Weather</span>
                <span className="hidden xs:inline-block text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-400 border border-sky-500/30">
                  5-Day Pro
                </span>
              </span>
              <p className="text-[10px] text-slate-400 hidden sm:block">
                Real-Time Alerts • Hourly Forecasts • Home Screen Widget
              </p>
            </div>
          </div>

          {/* Location Selector Button */}
          <button
            id="btn-open-location-search"
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-900 border border-slate-700/80 hover:border-slate-600 text-slate-200 text-xs font-semibold shadow-sm transition max-w-[200px] sm:max-w-xs"
          >
            <MapPin className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
            <span className="truncate">{location.name}</span>
            <ChevronDown className="w-3 h-3 text-slate-400 flex-shrink-0" />
          </button>

          {/* Action Tools: Unit Switcher, Widget Mode, PWA Install, Refresh */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* C / F Unit Toggle */}
            <button
              id="btn-toggle-temp-unit"
              onClick={handleToggleUnit}
              className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-mono font-bold transition"
              title="Toggle Celsius / Fahrenheit"
            >
              °{unit}
            </button>

            {/* Standalone Widget Mode Toggle */}
            <button
              id="btn-open-standalone-widget"
              onClick={() => setIsStandaloneWidgetOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-sky-300 border border-sky-500/30 text-xs font-medium transition shadow-sm"
              title="Open Fullscreen Widget Screen for Home Stand viewing"
            >
              <Smartphone className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden md:inline">Widget Mode</span>
            </button>

            {/* Weather Music Quick Header Button */}
            <button
              id="btn-nav-music"
              onClick={() => {
                const el = document.getElementById('ambient-soundscape-widget');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border border-sky-400/40 text-xs font-semibold transition shadow-sm"
              title="Scroll to Weather Music Soundscapes"
            >
              <Music className="w-3.5 h-3.5 text-sky-400" />
              <span>Music</span>
            </button>

            {/* In-App PWA Install Button */}
            <PWAInstallButton variant="button" />

            {/* Manual Refresh */}
            <button
              id="btn-refresh-weather"
              onClick={() => loadWeather(location, true)}
              disabled={isRefreshing}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition disabled:opacity-50"
              title="Refresh Forecast Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-sky-400' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
        {/* PWA Home Screen Banner (for mobile & desktop) */}
        <PWAInstallButton variant="banner" />

        {/* Error / Offline Notification if any */}
        {errorMsg && (
          <div className="mb-6 p-3 rounded-2xl bg-amber-950/80 border border-amber-500/40 text-amber-200 text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button
              onClick={() => setErrorMsg(null)}
              className="text-amber-400 hover:text-white text-xs underline font-medium"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Loading state skeleton if initial load with no cached data */}
        {isLoading && !weatherData ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 text-sky-400">
              <RefreshCw className="w-8 h-8 animate-spin" />
            </div>
            <h3 className="font-semibold text-base text-slate-200">
              Fetching High-Precision Meteorological Data...
            </h3>
            <p className="text-xs text-slate-400">
              Analyzing radar, hourly arrays, and severe advisory channels for {location.name}
            </p>
          </div>
        ) : weatherData ? (
          <div className="space-y-6">
            {/* Atmospheric Ambient Soundscape Player */}
            <AmbientAudioBar
              currentWeatherCode={weatherData.current.weatherCode}
              isDay={weatherData.current.isDay}
            />

            {/* Real-time Severe Weather Alerts Section */}
            <WeatherAlertsBanner
              alerts={weatherData.alerts}
              onTriggerTestAlert={handleTriggerTestAlert}
            />

            {/* Current Conditions Card */}
            <CurrentWeatherCard
              data={weatherData}
              unit={unit}
              onOpenWidgetMode={() => setIsStandaloneWidgetOpen(true)}
            />

            {/* Accurate 5-Day Hourly Forecast Deck */}
            <FiveDayHourlyForecast
              daily={weatherData.daily}
              allHourly={weatherData.allHourly}
              unit={unit}
            />

            {/* Home Screen Widget Studio & Live View */}
            <WeatherWidget data={weatherData} unit={unit} />
          </div>
        ) : null}
      </main>

      {/* Floating Offline Sync Indicator */}
      <OfflineIndicator
        cachedAt={weatherData?.cachedAt}
        isOfflineData={weatherData?.current.isOfflineCached}
        onRefresh={() => loadWeather(location, true)}
        isRefreshing={isRefreshing}
      />

      {/* Location Search & Selection Modal */}
      <LocationSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectLocation={handleSelectLocation}
        currentLocation={location}
        favorites={favorites}
        onToggleFavorite={handleToggleFavorite}
      />

      {/* Standalone Fullscreen Home Screen Widget Modal */}
      {weatherData && (
        <StandaloneWidgetModal
          isOpen={isStandaloneWidgetOpen}
          onClose={() => setIsStandaloneWidgetOpen(false)}
          data={weatherData}
          unit={unit}
        />
      )}
    </div>
  );
}
