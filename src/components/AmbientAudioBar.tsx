import React, { useState, useEffect } from 'react';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  CloudRain,
  Wind,
  Moon,
  Sun,
  Music,
  Radio,
} from 'lucide-react';
import { ambientSound, SoundscapeType } from '../utils/ambientAudio';

interface AmbientAudioBarProps {
  currentWeatherCode: number;
  isDay: boolean;
}

export const AmbientAudioBar: React.FC<AmbientAudioBarProps> = ({
  currentWeatherCode,
  isDay,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedType, setSelectedType] = useState<SoundscapeType>('sunny');
  const [volume, setVolume] = useState(50);

  // Derive atmospheric sound recommended for current weather
  const getAutoSound = (): SoundscapeType => {
    if (!isDay) return 'night';
    if (
      (currentWeatherCode >= 51 && currentWeatherCode <= 67) ||
      (currentWeatherCode >= 80 && currentWeatherCode <= 99)
    ) {
      return 'rain';
    }
    if (currentWeatherCode >= 45 && currentWeatherCode <= 48) {
      return 'wind';
    }
    return 'sunny';
  };

  useEffect(() => {
    setSelectedType(getAutoSound());
  }, [currentWeatherCode, isDay]);

  const togglePlay = () => {
    if (isPlaying) {
      ambientSound.stop();
      setIsPlaying(false);
    } else {
      ambientSound.setVolume(volume / 100);
      ambientSound.play(selectedType);
      setIsPlaying(true);
    }
  };

  const handleSelectType = (type: SoundscapeType) => {
    setSelectedType(type);
    if (isPlaying) {
      ambientSound.play(type);
    }
  };

  const handleVolumeChange = (newVal: number) => {
    setVolume(newVal);
    ambientSound.setVolume(newVal / 100);
  };

  const soundscapes = [
    {
      type: 'rain' as SoundscapeType,
      label: 'Gentle Rain',
      emoji: '🌧️',
      desc: 'Real rain drops & water flow acoustics',
      icon: CloudRain,
      activeColor: 'bg-sky-500 text-slate-950 border-sky-400 font-bold',
    },
    {
      type: 'wind' as SoundscapeType,
      label: 'Soft Breeze',
      emoji: '🍃',
      desc: 'Relaxing high-altitude wind gusts',
      icon: Wind,
      activeColor: 'bg-teal-500 text-slate-950 border-teal-400 font-bold',
    },
    {
      type: 'night' as SoundscapeType,
      label: 'Astral Night',
      emoji: '🌙',
      desc: 'Deep starlight pads & cricket ambient',
      icon: Moon,
      activeColor: 'bg-indigo-500 text-slate-950 border-indigo-400 font-bold',
    },
    {
      type: 'sunny' as SoundscapeType,
      label: 'Warm Horizon',
      emoji: '☀️',
      desc: 'Solar drone & soothing chime touches',
      icon: Sun,
      activeColor: 'bg-amber-500 text-slate-950 border-amber-400 font-bold',
    },
  ];

  const currentMeta = soundscapes.find((s) => s.type === selectedType) || soundscapes[3];

  return (
    <div
      id="ambient-soundscape-widget"
      className={`rounded-2xl border p-4 shadow-2xl backdrop-blur-xl transition-all duration-500 mb-6 relative overflow-hidden ${
        isPlaying
          ? 'bg-slate-900/95 border-sky-500/60 ring-2 ring-sky-500/20'
          : 'bg-slate-900/80 border-slate-700/80 hover:border-slate-600'
      }`}
    >
      {/* Background ambient gradient glow */}
      {isPlaying && (
        <div className="absolute top-0 right-1/4 w-72 h-32 bg-sky-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
      )}

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Play Button & Label */}
        <div className="flex items-center gap-3.5">
          <button
            id="btn-toggle-ambient-audio"
            onClick={togglePlay}
            className={`group relative flex items-center justify-center p-3.5 sm:p-4 rounded-2xl transition-all duration-300 shadow-xl cursor-pointer ${
              isPlaying
                ? 'bg-gradient-to-tr from-sky-400 to-cyan-300 text-slate-950 ring-4 ring-sky-400/30 scale-105'
                : 'bg-sky-500 hover:bg-sky-400 text-slate-950 hover:scale-105 ring-2 ring-white/20'
            }`}
            title={isPlaying ? 'Pause Audio' : 'Click to Play Weather Music'}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 fill-slate-950 stroke-slate-950" />
            ) : (
              <Play className="w-6 h-6 fill-slate-950 stroke-slate-950 ml-0.5" />
            )}
          </button>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-extrabold text-sm sm:text-base text-white flex items-center gap-2">
                <Music className="w-4 h-4 text-sky-400" />
                <span>Atmospheric Weather Music</span>
              </span>

              {isPlaying ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 text-[11px] font-mono font-bold animate-pulse">
                  <Radio className="w-3 h-3 text-emerald-400 animate-spin" />
                  PLAYING LIVE
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-semibold">
                  Click ▶ Play to Listen
                </span>
              )}
            </div>

            <p className="text-xs text-slate-300 mt-1 flex items-center gap-1.5">
              <span>Selected Sound:</span>
              <span className="text-sky-300 font-bold">
                {currentMeta.emoji} {currentMeta.label}
              </span>
              <span className="text-slate-500 hidden sm:inline">•</span>
              <span className="text-slate-400 hidden sm:inline">{currentMeta.desc}</span>
            </p>
          </div>
        </div>

        {/* Sound Selection Chips & Volume */}
        <div className="flex items-center justify-between md:justify-end gap-3 flex-wrap">
          {/* 4 Soundscape Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {soundscapes.map((s) => {
              const isSelected = selectedType === s.type;
              return (
                <button
                  key={s.type}
                  id={`soundscape-btn-${s.type}`}
                  onClick={() => handleSelectType(s.type)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs transition border whitespace-nowrap ${
                    isSelected
                      ? s.activeColor
                      : 'bg-slate-800/90 text-slate-300 border-slate-700 hover:bg-slate-750 hover:text-white'
                  }`}
                  title={s.desc}
                >
                  <span>{s.emoji}</span>
                  <span className="font-semibold">{s.label}</span>
                </button>
              );
            })}
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-2 bg-slate-800/90 px-3 py-1.5 rounded-xl border border-slate-700/80">
            <button
              onClick={() => handleVolumeChange(volume === 0 ? 50 : 0)}
              className="text-slate-400 hover:text-white transition"
              title="Toggle Mute"
            >
              {volume === 0 ? (
                <VolumeX className="w-4 h-4 text-rose-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-sky-400" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => handleVolumeChange(Number(e.target.value))}
              className="w-16 sm:w-20 accent-sky-400 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
              title={`Volume: ${volume}%`}
            />
            <span className="text-[11px] font-mono text-slate-300 w-7 text-right">
              {volume}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
