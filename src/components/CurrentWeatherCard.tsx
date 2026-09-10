import React, { useState } from 'react';
import {
  Wind,
  Droplets,
  Sun,
  Sunrise,
  Sunset,
  Gauge,
  Thermometer,
  CloudRain,
  Compass,
  MapPin,
  Clock,
  Database,
  Eye,
  Camera,
  Sparkles,
} from 'lucide-react';
import { WeatherData, TempUnit } from '../types/weather';
import { formatTemp, getWindDirection, getUVLevel } from '../utils/weatherCodes';
import { WeatherIcon } from './WeatherIcon';
import { getAutoAtmosphere, WEATHER_SCENES, WeatherAtmosphere } from '../utils/weatherImages';

interface CurrentWeatherCardProps {
  data: WeatherData;
  unit: TempUnit;
  onOpenWidgetMode?: () => void;
}

export const CurrentWeatherCard: React.FC<CurrentWeatherCardProps> = ({
  data,
  unit,
  onOpenWidgetMode,
}) => {
  const { location, current, daily } = data;
  const today = daily[0];

  const [selectedScene, setSelectedScene] = useState<'auto' | 'sunny' | 'rainy' | 'night' | 'dusk'>('auto');

  const uvLevel = getUVLevel(current.uvIndex);

  const activeAtmosphere: WeatherAtmosphere =
    selectedScene === 'auto'
      ? getAutoAtmosphere(current.weatherCode, current.isDay)
      : WEATHER_SCENES[selectedScene] || getAutoAtmosphere(current.weatherCode, current.isDay);

  return (
    <div
      id="current-weather-card"
      className="relative overflow-hidden rounded-3xl border border-slate-700/60 p-6 sm:p-8 shadow-2xl backdrop-blur-md mb-6 transition-all duration-500 min-h-[460px] flex flex-col justify-between"
    >
      {/* Photorealistic Atmospheric Scenery Backdrop */}
      <img
        src={activeAtmosphere.image}
        alt={activeAtmosphere.name}
        referrerPolicy="no-referrer"
        className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none transition-transform duration-1000 scale-100 hover:scale-105"
      />

      {/* Cinematic Dual-Tone Dark Gradient Overlay for Maximum Legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/85 to-slate-950/65 pointer-events-none" />
      <div className="absolute inset-0 bg-radial-at-c from-transparent via-slate-950/30 to-slate-950/80 pointer-events-none" />

      {/* Top Bar: Location, Country, Cache Status, and Atmosphere Badge */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-sky-400 flex-shrink-0" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight drop-shadow-md">
              {location.name}
            </h1>
            {location.country && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800/80 text-slate-200 border border-white/10 backdrop-blur-md">
                {location.country}
              </span>
            )}
            <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30 backdrop-blur-sm">
              <Sparkles className="w-3 h-3 text-sky-300" />
              {activeAtmosphere.badge}
            </span>
          </div>
          {location.admin1 && (
            <p className="text-xs text-slate-300 mt-1 pl-7 drop-shadow-sm">{location.admin1}</p>
          )}
        </div>

        <div className="flex items-center gap-3">
          {current.isOfflineCached && (
            <span
              id="badge-offline-cache"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-medium backdrop-blur-md"
            >
              <Database className="w-3.5 h-3.5" />
              <span>Offline Cache</span>
            </span>
          )}

          <div className="text-right text-xs text-slate-300 flex items-center gap-1.5 backdrop-blur-md bg-black/30 px-2.5 py-1 rounded-xl border border-white/10">
            <Clock className="w-3.5 h-3.5 text-sky-400" />
            <span>Updated {new Date(current.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
      </div>

      {/* Hero Temperature & Condition */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6 py-6 items-center">
        <div className="flex items-center gap-6">
          <div className="p-4 rounded-3xl bg-slate-800/60 border border-slate-700/60 shadow-inner">
            <WeatherIcon iconName={current.iconName} className="w-16 h-16 sm:w-20 sm:h-20" />
          </div>

          <div>
            <div className="text-6xl sm:text-7xl font-black font-mono tracking-tighter text-white">
              {formatTemp(current.temp, unit)}
            </div>
            <div className="text-lg font-semibold text-slate-200 mt-1">
              {current.weatherLabel}
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 font-mono">
              <span>Feels like {formatTemp(current.apparentTemp, unit)}</span>
              <span>•</span>
              <span>H: {formatTemp(current.highTemp, unit)}</span>
              <span>L: {formatTemp(current.lowTemp, unit)}</span>
            </div>
          </div>
        </div>

        {/* Sunrise & Sunset arc mini-card */}
        {today && (
          <div className="flex items-center justify-around p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Sunrise className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">Sunrise</span>
                <span className="text-sm font-bold text-slate-200 font-mono">
                  {today.sunrise}
                </span>
              </div>
            </div>

            <div className="h-8 w-px bg-slate-800" />

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Sunset className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">Sunset</span>
                <span className="text-sm font-bold text-slate-200 font-mono">
                  {today.sunset}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Primary Atmospheric Matrix (4 Metrics) */}
      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800/80">
        <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="flex items-center gap-1.5">
              <Wind className="w-4 h-4 text-teal-400" />
              <span>Wind</span>
            </span>
            <span className="text-teal-400 font-medium font-mono text-[11px]">
              {getWindDirection(current.windDirection)}
            </span>
          </div>
          <div className="mt-2 text-xl font-bold font-mono text-white">
            {Math.round(current.windSpeed)} <span className="text-xs font-normal text-slate-400">km/h</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Direction {current.windDirection}°
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="flex items-center gap-1.5">
              <Droplets className="w-4 h-4 text-sky-400" />
              <span>Humidity</span>
            </span>
            <span className="text-sky-400 font-mono text-[11px]">
              Dew {formatTemp(current.dewPoint, unit)}
            </span>
          </div>
          <div className="mt-2 text-xl font-bold font-mono text-white">
            {current.humidity}%
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {current.humidity > 70 ? 'Humid air mass' : 'Comfortable levels'}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="flex items-center gap-1.5">
              <Sun className="w-4 h-4 text-amber-400" />
              <span>UV Index</span>
            </span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold border ${uvLevel.color}`}>
              {uvLevel.label}
            </span>
          </div>
          <div className="mt-2 text-xl font-bold font-mono text-white">
            {current.uvIndex} <span className="text-xs font-normal text-slate-400">/ 11</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {current.uvIndex >= 6 ? 'Sun protection advised' : 'Safe exposure'}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="flex items-center gap-1.5">
              <Gauge className="w-4 h-4 text-indigo-400" />
              <span>Pressure</span>
            </span>
            <span className="text-indigo-400 font-mono text-[11px]">Surface</span>
          </div>
          <div className="mt-2 text-xl font-bold font-mono text-white">
            {Math.round(current.pressure)} <span className="text-xs font-normal text-slate-400">hPa</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {current.pressure > 1013 ? 'High pressure ridge' : 'Low pressure trough'}
          </div>
        </div>
      </div>

      {/* Interactive Atmospheric Scenery Switcher Bar */}
      <div className="relative z-10 mt-5 pt-3.5 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 text-xs text-slate-300 font-medium">
          <Camera className="w-3.5 h-3.5 text-sky-400" />
          <span>Atmospheric Scene:</span>
          <span className="text-sky-300 font-semibold">{activeAtmosphere.name}</span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            id="scene-btn-auto"
            onClick={() => setSelectedScene('auto')}
            className={`px-2.5 py-1 rounded-xl text-xs font-medium transition whitespace-nowrap border ${
              selectedScene === 'auto'
                ? 'bg-sky-500 text-slate-950 border-sky-400 font-bold shadow-md shadow-sky-500/20'
                : 'bg-black/40 text-slate-300 border-white/10 hover:bg-black/60'
            }`}
          >
            Auto Live
          </button>

          {(Object.keys(WEATHER_SCENES) as Array<keyof typeof WEATHER_SCENES>).map((key) => {
            const sc = WEATHER_SCENES[key];
            const isSelected = selectedScene === key;
            return (
              <button
                key={key}
                id={`scene-btn-${key}`}
                onClick={() => setSelectedScene(key as any)}
                className={`group flex items-center gap-1.5 px-2 py-1 rounded-xl text-xs font-medium transition whitespace-nowrap border ${
                  isSelected
                    ? 'bg-sky-500 text-slate-950 border-sky-400 font-bold shadow-md'
                    : 'bg-black/40 text-slate-300 border-white/10 hover:bg-black/60'
                }`}
                title={sc.description}
              >
                <img
                  src={sc.image}
                  alt={sc.name}
                  referrerPolicy="no-referrer"
                  className="w-4 h-4 rounded-full object-cover border border-white/30"
                />
                <span className="capitalize">{sc.id}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
