import React from 'react';
import {
  Sun,
  SunMedium,
  Moon,
  MoonStar,
  CloudSun,
  CloudMoon,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  CloudSnow,
  CloudHail,
  CloudLightning,
  Snowflake,
  Wind,
} from 'lucide-react';

interface WeatherIconProps {
  iconName: string;
  className?: string;
  size?: number;
}

export const WeatherIcon: React.FC<WeatherIconProps> = ({
  iconName,
  className = 'w-6 h-6',
  size,
}) => {
  const props = {
    className,
    ...(size ? { size } : {}),
  };

  switch (iconName) {
    case 'Sun':
      return <Sun {...props} className={`text-amber-400 ${className}`} />;
    case 'SunMedium':
      return <SunMedium {...props} className={`text-amber-300 ${className}`} />;
    case 'Moon':
      return <Moon {...props} className={`text-sky-200 ${className}`} />;
    case 'MoonStar':
      return <MoonStar {...props} className={`text-sky-200 ${className}`} />;
    case 'CloudSun':
      return <CloudSun {...props} className={`text-amber-300 ${className}`} />;
    case 'CloudMoon':
      return <CloudMoon {...props} className={`text-indigo-300 ${className}`} />;
    case 'Cloud':
      return <Cloud {...props} className={`text-slate-300 ${className}`} />;
    case 'CloudFog':
      return <CloudFog {...props} className={`text-slate-400 ${className}`} />;
    case 'CloudDrizzle':
      return <CloudDrizzle {...props} className={`text-sky-400 ${className}`} />;
    case 'CloudRain':
      return <CloudRain {...props} className={`text-sky-400 ${className}`} />;
    case 'CloudSnow':
      return <CloudSnow {...props} className={`text-blue-200 ${className}`} />;
    case 'CloudHail':
      return <CloudHail {...props} className={`text-sky-300 ${className}`} />;
    case 'CloudLightning':
      return <CloudLightning {...props} className={`text-yellow-400 ${className}`} />;
    case 'Snowflake':
      return <Snowflake {...props} className={`text-sky-100 ${className}`} />;
    case 'Wind':
      return <Wind {...props} className={`text-teal-300 ${className}`} />;
    default:
      return <Cloud {...props} className={`text-slate-300 ${className}`} />;
  }
};
