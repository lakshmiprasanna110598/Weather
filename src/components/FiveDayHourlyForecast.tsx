import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  Droplets,
  Wind,
  Sun,
  Compass,
  CloudRain,
  Eye,
  Gauge,
  Thermometer,
} from 'lucide-react';
import { DailyForecastSummary, HourlyForecastPoint, TempUnit } from '../types/weather';
import { formatTemp, getWindDirection, getUVLevel } from '../utils/weatherCodes';
import { WeatherIcon } from './WeatherIcon';

interface FiveDayHourlyForecastProps {
  daily: DailyForecastSummary[];
  allHourly: HourlyForecastPoint[];
  unit: TempUnit;
}

export const FiveDayHourlyForecast: React.FC<FiveDayHourlyForecastProps> = ({
  daily,
  allHourly,
  unit,
}) => {
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'day' | 'full'>('day');

  const currentDay = daily[selectedDayIndex] || daily[0];

  // Active hours depending on view mode
  const displayedHours = useMemo(() => {
    if (viewMode === 'full') {
      return allHourly;
    }
    return currentDay?.hours || [];
  }, [viewMode, currentDay, allHourly]);

  const [selectedHourIndex, setSelectedHourIndex] = useState(0);
  const activeHour = displayedHours[selectedHourIndex] || displayedHours[0];

  // Compute min and max temp across displayed hours for SVG curve
  const { minTemp, maxTemp } = useMemo(() => {
    if (!displayedHours.length) return { minTemp: 0, maxTemp: 30 };
    const temps = displayedHours.map((h) => h.temp);
    return {
      minTemp: Math.min(...temps) - 2,
      maxTemp: Math.max(...temps) + 2,
    };
  }, [displayedHours]);

  return (
    <div id="five-day-hourly-forecast-card" className="rounded-3xl bg-slate-900/90 border border-slate-800 p-5 sm:p-6 shadow-xl backdrop-blur-md">
      {/* Header with Title and Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white">5-Day Hourly Forecast</h3>
            <p className="text-xs text-slate-400">
              Accurate 120-hour timeline with temperature curves, rain risk, and atmospheric metrics
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="inline-flex p-1 rounded-xl bg-slate-800/90 border border-slate-700 text-xs">
            <button
              id="tab-hourly-by-day"
              onClick={() => {
                setViewMode('day');
                setSelectedHourIndex(0);
              }}
              className={`px-3 py-1 rounded-lg font-medium transition ${
                viewMode === 'day'
                  ? 'bg-sky-500 text-slate-950 shadow-sm font-semibold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Day by Day
            </button>
            <button
              id="tab-hourly-full-timeline"
              onClick={() => {
                setViewMode('full');
                setSelectedHourIndex(0);
              }}
              className={`px-3 py-1 rounded-lg font-medium transition ${
                viewMode === 'full'
                  ? 'bg-sky-500 text-slate-950 shadow-sm font-semibold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Full 120-Hour Strip
            </button>
          </div>
        </div>
      </div>

      {/* 5-Day Day Selector Tabs */}
      {viewMode === 'day' && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 my-4">
          {daily.map((day, idx) => {
            const isSelected = selectedDayIndex === idx;
            return (
              <button
                key={day.date}
                id={`day-tab-${idx}`}
                onClick={() => {
                  setSelectedDayIndex(idx);
                  setSelectedHourIndex(0);
                }}
                className={`relative flex flex-col items-center justify-between p-3 rounded-2xl border transition-all text-left ${
                  isSelected
                    ? 'bg-gradient-to-b from-sky-950/70 to-slate-800/90 border-sky-500/60 shadow-lg ring-1 ring-sky-500/30'
                    : 'bg-slate-800/40 border-slate-800 hover:bg-slate-800/70 hover:border-slate-700'
                }`}
              >
                <div className="w-full flex items-center justify-between">
                  <span
                    className={`font-semibold text-xs ${
                      isSelected ? 'text-sky-300' : 'text-slate-300'
                    }`}
                  >
                    {day.dayName}
                  </span>
                  <span className="text-[10px] text-slate-400">{day.fullDateLabel}</span>
                </div>

                <div className="my-2 flex items-center gap-2">
                  <WeatherIcon iconName={day.iconName} className="w-7 h-7" />
                </div>

                <div className="w-full flex items-center justify-between text-xs mt-1">
                  <span className="font-bold text-slate-100">
                    {formatTemp(day.maxTemp, unit)}
                  </span>
                  <span className="text-slate-400 text-[11px]">
                    {formatTemp(day.minTemp, unit)}
                  </span>
                </div>

                {day.precipProbabilityMax > 0 && (
                  <div className="w-full mt-2 pt-1 border-t border-slate-700/50 flex items-center justify-between text-[10px] text-sky-400">
                    <span className="flex items-center gap-0.5">
                      <Droplets className="w-3 h-3" />
                      {day.precipProbabilityMax}%
                    </span>
                    <span className="text-slate-400 truncate max-w-[60px] text-[9px]">
                      {day.precipSum > 0 ? `${day.precipSum.toFixed(1)}mm` : 'dry'}
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Hourly Trend Chart (SVG Curve) */}
      <div className="mt-4 mb-2 bg-slate-950/40 rounded-2xl border border-slate-800/80 p-3">
        <div className="flex items-center justify-between text-xs text-slate-400 px-2 pb-2">
          <span className="font-medium text-slate-300 flex items-center gap-1.5">
            <Thermometer className="w-3.5 h-3.5 text-sky-400" />
            <span>Temperature & Rain Probability Curve</span>
          </span>
          <span>{displayedHours.length} Forecast Intervals</span>
        </div>

        <div className="w-full overflow-x-auto pb-2 scrollbar-thin">
          <div
            className="h-28 relative flex items-end"
            style={{ minWidth: `${Math.max(displayedHours.length * 52, 600)}px` }}
          >
            {/* SVG Trend Line */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              preserveAspectRatio="none"
              viewBox={`0 0 ${displayedHours.length * 52} 100`}
            >
              <defs>
                <linearGradient id="tempAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#0284c7" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              {/* Rain Bars in Background */}
              {displayedHours.map((h, i) => {
                const x = i * 52 + 26;
                const rainHeight = (h.precipProbability / 100) * 45;
                if (rainHeight <= 0) return null;
                return (
                  <rect
                    key={`rain-${i}`}
                    x={x - 12}
                    y={100 - rainHeight}
                    width={24}
                    height={rainHeight}
                    fill="#38bdf8"
                    opacity={0.15}
                    rx={4}
                  />
                );
              })}

              {/* Area under temperature curve */}
              {displayedHours.length > 1 && (
                <path
                  d={(() => {
                    const points = displayedHours.map((h, i) => {
                      const x = i * 52 + 26;
                      const range = maxTemp - minTemp || 1;
                      const y = 80 - ((h.temp - minTemp) / range) * 60;
                      return `${x},${y}`;
                    });
                    const firstX = 26;
                    const lastX = (displayedHours.length - 1) * 52 + 26;
                    return `M ${firstX},100 L ${points.join(' L ')} L ${lastX},100 Z`;
                  })()}
                  fill="url(#tempAreaGrad)"
                />
              )}

              {/* Smooth Temperature Line */}
              {displayedHours.length > 1 && (
                <path
                  d={(() => {
                    const points = displayedHours.map((h, i) => {
                      const x = i * 52 + 26;
                      const range = maxTemp - minTemp || 1;
                      const y = 80 - ((h.temp - minTemp) / range) * 60;
                      return `${x},${y}`;
                    });
                    return `M ${points.join(' L ')}`;
                  })()}
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              )}

              {/* Data points */}
              {displayedHours.map((h, i) => {
                const x = i * 52 + 26;
                const range = maxTemp - minTemp || 1;
                const y = 80 - ((h.temp - minTemp) / range) * 60;
                const isCurrentActive = selectedHourIndex === i;

                return (
                  <circle
                    key={`circle-${i}`}
                    cx={x}
                    cy={y}
                    r={isCurrentActive ? 5 : 3}
                    fill={isCurrentActive ? '#ffffff' : '#38bdf8'}
                    stroke="#0284c7"
                    strokeWidth={isCurrentActive ? 2.5 : 1.5}
                  />
                );
              })}
            </svg>

            {/* Clickable Overlay nodes */}
            <div className="absolute inset-0 flex">
              {displayedHours.map((h, idx) => {
                const isSelected = selectedHourIndex === idx;
                return (
                  <div
                    key={h.time}
                    id={`hour-scrubber-${idx}`}
                    onClick={() => setSelectedHourIndex(idx)}
                    style={{ width: '52px' }}
                    className={`h-full flex flex-col justify-between items-center py-1 cursor-pointer transition-colors group relative ${
                      isSelected ? 'bg-sky-500/10 rounded-xl' : 'hover:bg-slate-800/40'
                    }`}
                  >
                    <span className="text-[10px] text-slate-400 font-mono mt-1">
                      {h.hourLabel}
                    </span>
                    <span
                      className={`text-xs font-bold font-mono transition-colors ${
                        isSelected ? 'text-white scale-110' : 'text-slate-300'
                      }`}
                    >
                      {formatTemp(h.temp, unit)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Hourly Scroll Cards Strip */}
      <div className="my-4">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <span>Click any hour to inspect detailed environmental readings</span>
          <span className="text-[11px] text-sky-400 font-medium">
            Active: {activeHour ? activeHour.hourLabel : ''} ({activeHour?.weatherLabel})
          </span>
        </div>

        <div className="flex gap-2.5 overflow-x-auto pb-3 pt-1 scrollbar-thin snap-x">
          {displayedHours.map((hour, idx) => {
            const isSelected = selectedHourIndex === idx;
            return (
              <button
                key={hour.time}
                id={`hour-card-${idx}`}
                onClick={() => setSelectedHourIndex(idx)}
                className={`flex-shrink-0 w-20 p-3 rounded-2xl border transition-all text-center flex flex-col items-center justify-between snap-start ${
                  isSelected
                    ? 'bg-sky-500/20 border-sky-400 text-white shadow-md ring-1 ring-sky-400/50'
                    : 'bg-slate-800/60 border-slate-700/70 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                }`}
              >
                <span className="text-[11px] font-semibold text-slate-300">{hour.hourLabel}</span>
                {viewMode === 'full' && (
                  <span className="text-[9px] text-slate-400">
                    {new Date(hour.time).toLocaleDateString('en-US', { weekday: 'narrow' })}
                  </span>
                )}

                <div className="my-1.5">
                  <WeatherIcon iconName={hour.iconName} className="w-6 h-6" />
                </div>

                <span className="font-bold text-sm text-white font-mono">
                  {formatTemp(hour.temp, unit)}
                </span>

                <div className="mt-1 flex items-center justify-center gap-1 text-[10px]">
                  <Droplets
                    className={`w-3 h-3 ${
                      hour.precipProbability > 30 ? 'text-sky-400' : 'text-slate-500'
                    }`}
                  />
                  <span
                    className={`${
                      hour.precipProbability > 30
                        ? 'text-sky-400 font-semibold'
                        : 'text-slate-400'
                    }`}
                  >
                    {hour.precipProbability}%
                  </span>
                </div>

                <div className="mt-1 text-[9px] text-slate-400 flex items-center gap-0.5">
                  <Wind className="w-2.5 h-2.5" />
                  <span>{Math.round(hour.windSpeed)}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Hour Atmospheric Details Panel */}
      {activeHour && (
        <div className="mt-4 p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <WeatherIcon iconName={activeHour.iconName} className="w-5 h-5" />
              <span className="font-bold text-white text-sm">
                {activeHour.hourLabel} — {activeHour.weatherLabel}
              </span>
            </div>
            <div className="flex items-center gap-3 text-slate-400">
              <span>
                Feels like{' '}
                <strong className="text-slate-200">
                  {formatTemp(activeHour.apparentTemp, unit)}
                </strong>
              </span>
              <span>
                Rain Vol:{' '}
                <strong className="text-slate-200">{activeHour.precipAmount} mm</strong>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80">
              <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                <Droplets className="w-3.5 h-3.5 text-sky-400" />
                <span>Precipitation Risk</span>
              </div>
              <div className="mt-1 font-bold text-sm text-sky-300">
                {activeHour.precipProbability}%
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                {activeHour.precipProbability > 60
                  ? 'Heavy Rain Likely'
                  : activeHour.precipProbability > 20
                  ? 'Scattered Showers'
                  : 'Minimal Chance'}
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80">
              <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                <Wind className="w-3.5 h-3.5 text-teal-400" />
                <span>Wind Speed & Heading</span>
              </div>
              <div className="mt-1 font-bold text-sm text-slate-100 flex items-center gap-1.5">
                <span>{Math.round(activeHour.windSpeed)} km/h</span>
                <span className="text-xs text-teal-400 font-normal">
                  {getWindDirection(activeHour.windDirection)}
                </span>
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                Bearing {activeHour.windDirection}°
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80">
              <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span>UV Index</span>
              </div>
              {(() => {
                const uv = getUVLevel(activeHour.uvIndex);
                return (
                  <>
                    <div className="mt-1 font-bold text-sm text-slate-100 flex items-center gap-1.5">
                      <span>{activeHour.uvIndex}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-medium border ${uv.color}`}>
                        {uv.label}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      {activeHour.isDay ? 'Solar peak factor' : 'Night time / 0 UV'}
                    </div>
                  </>
                );
              })()}
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80">
              <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                <Gauge className="w-3.5 h-3.5 text-indigo-400" />
                <span>Humidity & Pressure</span>
              </div>
              <div className="mt-1 font-bold text-sm text-slate-100">
                {activeHour.humidity}% / {Math.round(activeHour.surfacePressure)} hPa
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                Dew point {formatTemp(activeHour.dewPoint, unit)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
