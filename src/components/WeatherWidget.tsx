import React, { useState } from 'react';
import {
  Maximize2,
  Minimize2,
  Layers,
  Sparkles,
  Smartphone,
  Droplets,
  Wind,
  AlertTriangle,
  Compass,
  Check,
  Share2,
} from 'lucide-react';
import { WeatherData, TempUnit, WidgetSize } from '../types/weather';
import { formatTemp } from '../utils/weatherCodes';
import { WeatherIcon } from './WeatherIcon';
import { WEATHER_SCENES } from '../utils/weatherImages';

interface WeatherWidgetProps {
  data: WeatherData;
  unit: TempUnit;
  standaloneModal?: boolean;
  onCloseStandalone?: () => void;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({
  data,
  unit,
  standaloneModal = false,
  onCloseStandalone,
}) => {
  const [widgetSize, setWidgetSize] = useState<WidgetSize>('wide');
  const [themeStyle, setThemeStyle] = useState<'glass' | 'midnight' | 'sky'>('glass');
  const [wallpaper, setWallpaper] = useState<'sunny' | 'rainy' | 'night' | 'dusk' | 'clean'>('sunny');
  const [isCopied, setIsCopied] = useState(false);

  const { location, current, daily, allHourly, alerts } = data;
  const activeAlert = alerts[0];

  const next5Hours = allHourly.slice(0, 5);

  const getWidgetThemeClass = () => {
    switch (themeStyle) {
      case 'midnight':
        return 'bg-slate-950 border-slate-800 text-slate-100';
      case 'sky':
        return 'bg-gradient-to-br from-sky-900/90 via-blue-900/80 to-slate-900/90 border-sky-500/40 text-white';
      case 'glass':
      default:
        return 'bg-slate-900/70 border-white/10 text-white backdrop-blur-xl';
    }
  };

  const renderCompactWidget = () => (
    <div
      id="widget-compact-preview"
      className={`w-64 h-64 rounded-3xl p-5 border shadow-2xl flex flex-col justify-between transition-all duration-300 relative overflow-hidden ${getWidgetThemeClass()}`}
    >
      {/* Background glow */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-bold text-base tracking-tight truncate max-w-[140px] text-white">
            {location.name}
          </h4>
          <span className="text-[11px] text-slate-400">
            {current.isOfflineCached ? 'Cached' : 'Live'}
          </span>
        </div>
        <WeatherIcon iconName={current.iconName} className="w-10 h-10" />
      </div>

      {activeAlert && (
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-medium">
          <AlertTriangle className="w-3 h-3 text-amber-400 animate-pulse flex-shrink-0" />
          <span className="truncate">{activeAlert.event}</span>
        </div>
      )}

      <div>
        <div className="text-4xl font-extrabold font-mono tracking-tighter text-white">
          {formatTemp(current.temp, unit)}
        </div>
        <p className="text-xs text-slate-300 font-medium mt-0.5 truncate">
          {current.weatherLabel}
        </p>
        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1 font-mono">
          <span>H: {formatTemp(current.highTemp, unit)}</span>
          <span>L: {formatTemp(current.lowTemp, unit)}</span>
        </div>
      </div>
    </div>
  );

  const renderWideWidget = () => (
    <div
      id="widget-wide-preview"
      className={`w-full max-w-xl h-44 rounded-3xl p-5 border shadow-2xl flex flex-col justify-between transition-all duration-300 relative overflow-hidden ${getWidgetThemeClass()}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <WeatherIcon iconName={current.iconName} className="w-10 h-10" />
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-lg text-white leading-none">{location.name}</h4>
              {activeAlert && (
                <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[9px] font-bold uppercase">
                  <AlertTriangle className="w-2.5 h-2.5 text-rose-400" />
                  Alert
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              {current.weatherLabel} • Feels {formatTemp(current.apparentTemp, unit)}
            </p>
          </div>
        </div>

        <div className="text-right">
          <div className="text-3xl font-extrabold font-mono text-white leading-none">
            {formatTemp(current.temp, unit)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">
            H:{formatTemp(current.highTemp, unit)} L:{formatTemp(current.lowTemp, unit)}
          </div>
        </div>
      </div>

      {/* Hourly Strip inside Wide Widget */}
      <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
        {next5Hours.map((h, i) => (
          <div
            key={h.time}
            className="flex-1 flex flex-col items-center justify-center p-1 rounded-xl bg-white/5 border border-white/5"
          >
            <span className="text-[10px] text-slate-400 font-mono">
              {i === 0 ? 'Now' : h.hourLabel}
            </span>
            <WeatherIcon iconName={h.iconName} className="w-4 h-4 my-0.5" />
            <span className="text-xs font-bold font-mono text-white">
              {formatTemp(h.temp, unit)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderGlanceWidget = () => (
    <div
      id="widget-glance-preview"
      className={`w-full max-w-xl rounded-3xl p-5 border shadow-2xl space-y-4 transition-all duration-300 ${getWidgetThemeClass()}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-xl text-white">{location.name}</h4>
            <span className="text-xs text-slate-400">{location.country}</span>
          </div>
          <p className="text-xs text-slate-300 mt-0.5">{current.weatherLabel}</p>
        </div>

        <div className="text-right">
          <div className="text-4xl font-extrabold font-mono text-white">
            {formatTemp(current.temp, unit)}
          </div>
          <div className="text-xs text-slate-400 font-mono">
            {formatTemp(current.highTemp, unit)} / {formatTemp(current.lowTemp, unit)}
          </div>
        </div>
      </div>

      {/* 5-day glance mini bar */}
      <div className="grid grid-cols-5 gap-2 pt-2 border-t border-white/10">
        {daily.map((d) => (
          <div
            key={d.date}
            className="p-2 rounded-xl bg-white/5 border border-white/5 text-center flex flex-col items-center"
          >
            <span className="text-[10px] text-slate-300 font-medium">{d.dayName}</span>
            <WeatherIcon iconName={d.iconName} className="w-5 h-5 my-1" />
            <div className="text-[11px] font-bold font-mono text-white">
              {formatTemp(d.maxTemp, unit)}
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              {formatTemp(d.minTemp, unit)}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
        <span className="flex items-center gap-1">
          <Wind className="w-3.5 h-3.5 text-teal-400" />
          {Math.round(current.windSpeed)} km/h
        </span>
        <span className="flex items-center gap-1">
          <Droplets className="w-3.5 h-3.5 text-sky-400" />
          {current.humidity}% Humidity
        </span>
        <span>UV {current.uvIndex}</span>
      </div>
    </div>
  );

  return (
    <div id="home-screen-widget-studio" className="rounded-3xl bg-slate-900/90 border border-slate-800 p-5 sm:p-6 shadow-xl backdrop-blur-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white">Home Screen Widget Studio</h3>
            <p className="text-xs text-slate-400">
              Glanceable widget layouts configured for mobile home screens, lock screens, and desktop stands
            </p>
          </div>
        </div>

        {/* Controls: Size selector & Theme */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex p-1 rounded-xl bg-slate-800/90 border border-slate-700 text-xs">
            <button
              id="widget-size-compact"
              onClick={() => setWidgetSize('compact')}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                widgetSize === 'compact'
                  ? 'bg-sky-500 text-slate-950 font-semibold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              2x2
            </button>
            <button
              id="widget-size-wide"
              onClick={() => setWidgetSize('wide')}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                widgetSize === 'wide'
                  ? 'bg-sky-500 text-slate-950 font-semibold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              4x2
            </button>
            <button
              id="widget-size-glance"
              onClick={() => setWidgetSize('glance')}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                widgetSize === 'glance'
                  ? 'bg-sky-500 text-slate-950 font-semibold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              4x4
            </button>
          </div>

          <div className="inline-flex p-1 rounded-xl bg-slate-800/90 border border-slate-700 text-xs">
            <button
              onClick={() => setThemeStyle('glass')}
              className={`px-2 py-1 rounded-lg transition ${
                themeStyle === 'glass' ? 'bg-slate-700 text-white font-semibold' : 'text-slate-400'
              }`}
            >
              Glass
            </button>
            <button
              onClick={() => setThemeStyle('midnight')}
              className={`px-2 py-1 rounded-lg transition ${
                themeStyle === 'midnight' ? 'bg-slate-700 text-white font-semibold' : 'text-slate-400'
              }`}
            >
              OLED
            </button>
            <button
              onClick={() => setThemeStyle('sky')}
              className={`px-2 py-1 rounded-lg transition ${
                themeStyle === 'sky' ? 'bg-slate-700 text-white font-semibold' : 'text-slate-400'
              }`}
            >
              Sky
            </button>
          </div>

          {/* Wallpaper Scenery Simulator */}
          <div className="inline-flex p-1 rounded-xl bg-slate-800/90 border border-slate-700 text-xs items-center gap-1">
            <span className="text-[10px] text-slate-400 px-1 font-medium hidden sm:inline">Wallpaper:</span>
            {(['sunny', 'rainy', 'night', 'dusk'] as const).map((scKey) => {
              const sc = WEATHER_SCENES[scKey];
              return (
                <button
                  key={scKey}
                  onClick={() => setWallpaper(scKey)}
                  className={`relative p-0.5 rounded-lg border transition ${
                    wallpaper === scKey ? 'border-sky-400 ring-2 ring-sky-500/30' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                  title={`Test on ${sc.name} wallpaper`}
                >
                  <img
                    src={sc.image}
                    alt={sc.name}
                    referrerPolicy="no-referrer"
                    className="w-5 h-5 rounded object-cover"
                  />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Widget Showcase Viewport with Realistic Scenery Wallpaper */}
      <div className="my-6 relative overflow-hidden rounded-2xl border border-slate-700/70 min-h-[240px] flex flex-col items-center justify-center p-6 shadow-inner">
        {wallpaper !== 'clean' && WEATHER_SCENES[wallpaper] && (
          <img
            src={WEATHER_SCENES[wallpaper].image}
            alt="Home screen wallpaper preview"
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none transition-all duration-700"
          />
        )}
        <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] pointer-events-none" />

        <div className="relative z-10 w-full flex items-center justify-center">
          {widgetSize === 'compact' && renderCompactWidget()}
          {widgetSize === 'wide' && renderWideWidget()}
          {widgetSize === 'glance' && renderGlanceWidget()}
        </div>
      </div>

      {/* Widget Integration Note */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-400 pt-2 border-t border-slate-800/80">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-sky-400 flex-shrink-0" />
          <span>
            Pinning this app to your Home Screen uses this widget view when installed as a PWA.
          </span>
        </div>

        <button
          onClick={() => {
            navigator.clipboard?.writeText?.(window.location.href);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2500);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
        >
          {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
          <span>{isCopied ? 'Link Copied' : 'Share / Pin Widget'}</span>
        </button>
      </div>
    </div>
  );
};
