export interface WeatherCodeInfo {
  label: string;
  icon: string; // Lucide icon identifier
  conditionGroup: 'clear' | 'cloudy' | 'rain' | 'snow' | 'thunder' | 'fog';
}

export function getWeatherCodeInfo(code: number, isDay: boolean = true): WeatherCodeInfo {
  switch (code) {
    case 0:
      return {
        label: isDay ? 'Clear Sky' : 'Clear Night',
        icon: isDay ? 'Sun' : 'Moon',
        conditionGroup: 'clear',
      };
    case 1:
      return {
        label: isDay ? 'Mainly Clear' : 'Mostly Clear',
        icon: isDay ? 'SunMedium' : 'MoonStar',
        conditionGroup: 'clear',
      };
    case 2:
      return {
        label: isDay ? 'Partly Cloudy' : 'Partly Cloudy',
        icon: isDay ? 'CloudSun' : 'CloudMoon',
        conditionGroup: 'cloudy',
      };
    case 3:
      return {
        label: 'Overcast',
        icon: 'Cloud',
        conditionGroup: 'cloudy',
      };
    case 45:
      return {
        label: 'Foggy',
        icon: 'CloudFog',
        conditionGroup: 'fog',
      };
    case 48:
      return {
        label: 'Depositing Rime Fog',
        icon: 'CloudFog',
        conditionGroup: 'fog',
      };
    case 51:
    case 53:
    case 55:
      return {
        label: 'Drizzle',
        icon: 'CloudDrizzle',
        conditionGroup: 'rain',
      };
    case 56:
    case 57:
      return {
        label: 'Freezing Drizzle',
        icon: 'CloudHail',
        conditionGroup: 'snow',
      };
    case 61:
      return {
        label: 'Light Rain',
        icon: 'CloudRain',
        conditionGroup: 'rain',
      };
    case 63:
      return {
        label: 'Moderate Rain',
        icon: 'CloudRain',
        conditionGroup: 'rain',
      };
    case 65:
      return {
        label: 'Heavy Rain',
        icon: 'CloudRain',
        conditionGroup: 'rain',
      };
    case 66:
    case 67:
      return {
        label: 'Freezing Rain',
        icon: 'CloudHail',
        conditionGroup: 'snow',
      };
    case 71:
    case 73:
    case 75:
      return {
        label: 'Snowfall',
        icon: 'CloudSnow',
        conditionGroup: 'snow',
      };
    case 77:
      return {
        label: 'Snow Grains',
        icon: 'Snowflake',
        conditionGroup: 'snow',
      };
    case 80:
    case 81:
    case 82:
      return {
        label: 'Rain Showers',
        icon: 'CloudRain',
        conditionGroup: 'rain',
      };
    case 85:
    case 86:
      return {
        label: 'Snow Showers',
        icon: 'CloudSnow',
        conditionGroup: 'snow',
      };
    case 95:
      return {
        label: 'Thunderstorm',
        icon: 'CloudLightning',
        conditionGroup: 'thunder',
      };
    case 96:
    case 99:
      return {
        label: 'Severe Hail Thunderstorm',
        icon: 'CloudLightning',
        conditionGroup: 'thunder',
      };
    default:
      return {
        label: 'Scattered Clouds',
        icon: 'Cloud',
        conditionGroup: 'cloudy',
      };
  }
}

export function formatTemp(tempC: number, unit: 'C' | 'F'): string {
  if (unit === 'F') {
    const f = Math.round((tempC * 9) / 5 + 32);
    return `${f}°`;
  }
  return `${Math.round(tempC)}°`;
}

export function getWindDirection(deg: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round((deg % 360) / 22.5) % 16;
  return directions[index];
}

export function getUVLevel(uv: number): { label: string; color: string } {
  if (uv <= 2) return { label: 'Low', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
  if (uv <= 5) return { label: 'Moderate', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
  if (uv <= 7) return { label: 'High', color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' };
  if (uv <= 10) return { label: 'Very High', color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' };
  return { label: 'Extreme', color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' };
}
