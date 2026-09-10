import React, { useState, useEffect } from 'react';
import {
  X,
  Smartphone,
  Minimize2,
  Maximize2,
  AlertTriangle,
  Wind,
  Droplets,
  Sun,
  Clock,
  WifiOff,
} from 'lucide-react';
import { WeatherData, TempUnit } from '../types/weather';
import { formatTemp, getWindDirection } from '../utils/weatherCodes';
import { WeatherIcon } from './WeatherIcon';
import { getAutoAtmosphere } from '../utils/weatherImages';

interface StandaloneWidgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: WeatherData;
  unit: TempUnit;
}

export const StandaloneWidgetModal: React.FC<StandaloneWidgetModalProps> = ({
  isOpen,
  onClose,
  data,
  unit,
}) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    if (!isOpen) return;
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const { location, current, daily, allHourly, alerts } = data;
  const activeAlert = alerts[0];
  const nextHours = allHourly.slice(0, 6);
  const atmosphere = getAutoAtmosphere(current.weatherCode, current.isDay);

  return (
    <div
      id="modal-standalone-widget"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-2xl p-4 sm:p-6 animate-in fade-in duration-300"
    >
      <div className="w-full max-w-3xl rounded-3xl border border-slate-700/80 p-6 sm:p-10 shadow-2xl relative text-white flex flex-col justify-between min-h-[520px] overflow-hidden">
        {/* Photorealistic Atmospheric Scenery Backdrop */}
        <img
          src={atmosphere.image}
          alt={atmosphere.name}
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
        />
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm pointer-events-none" />

        {/* Top Control Bar */}
        <div className="relative z-10 flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-widest text-sky-400">
              Home Screen Standby • {atmosphere.badge}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {current.isOfflineCached && (
              <span className="flex items-center gap-1 text-xs text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">
                <WifiOff className="w-3 h-3" />
                Offline
              </span>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition border border-white/10"
              title="Exit Widget View"
            >
              <Minimize2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Real-time Severe Alert Strip if Active */}
        {activeAlert && (
          <div className="relative z-10 my-4 p-3 rounded-2xl bg-rose-950/80 border border-rose-500/60 flex items-center gap-3 text-rose-200 backdrop-blur-md">
            <AlertTriangle className="w-5 h-5 text-rose-400 animate-pulse flex-shrink-0" />
            <div className="text-xs min-w-0">
              <span className="font-bold text-rose-300 uppercase mr-2">{activeAlert.event}:</span>
              <span className="truncate">{activeAlert.headline}</span>
            </div>
          </div>
        )}

        {/* Main Display: Time & Weather */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 my-auto py-6 items-center">
          {/* Time & Location */}
          <div>
            <div className="text-5xl sm:text-6xl font-black font-mono tracking-tight text-white drop-shadow-lg">
              {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              <span className="text-sm font-normal text-slate-300 ml-2">
                {time.toLocaleTimeString([], { second: '2-digit' })}
              </span>
            </div>
            <div className="text-sm font-medium text-slate-300 mt-1">
              {time.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
            </div>
            <div className="text-xl font-bold text-sky-300 mt-4 flex items-center gap-2">
              <span>{location.name}</span>
              <span className="text-xs text-slate-300 font-normal">({location.country})</span>
            </div>
          </div>

          {/* Temperature & Big Icon */}
          <div className="flex items-center justify-start md:justify-end gap-6">
            <div className="p-4 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-md shadow-xl">
              <WeatherIcon iconName={current.iconName} className="w-20 h-20 sm:w-24 sm:h-24" />
            </div>

            <div>
              <div className="text-6xl sm:text-7xl font-black font-mono tracking-tighter text-white drop-shadow-md">
                {formatTemp(current.temp, unit)}
              </div>
              <div className="text-base font-semibold text-slate-200">{current.weatherLabel}</div>
              <div className="text-xs text-slate-300 font-mono mt-1">
                H: {formatTemp(current.highTemp, unit)} • L: {formatTemp(current.lowTemp, unit)}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom 6-Hour Forecast Strip */}
        <div className="relative z-10 pt-4 border-t border-white/10 grid grid-cols-6 gap-2">
          {nextHours.map((h, i) => (
            <div
              key={h.time}
              className="p-2.5 rounded-2xl bg-slate-900/70 border border-white/10 text-center flex flex-col items-center justify-between backdrop-blur-md"
            >
              <span className="text-[11px] font-semibold text-slate-300">
                {i === 0 ? 'Now' : h.hourLabel}
              </span>
              <WeatherIcon iconName={h.iconName} className="w-6 h-6 my-1" />
              <span className="text-xs font-bold font-mono text-white">
                {formatTemp(h.temp, unit)}
              </span>
              <div className="text-[10px] text-sky-400 flex items-center gap-0.5 mt-0.5">
                <Droplets className="w-2.5 h-2.5" />
                <span>{h.precipProbability}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
