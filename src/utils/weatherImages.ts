import sunnyImg from '../assets/images/weather_sunny_sky_1789015757836.jpg';
import rainyImg from '../assets/images/weather_rainy_sky_1789015775114.jpg';
import nightImg from '../assets/images/weather_night_sky_1789015787003.jpg';
import duskImg from '../assets/images/weather_cloudy_dusk_1789015799077.jpg';

export interface WeatherAtmosphere {
  id: 'sunny' | 'rainy' | 'night' | 'dusk';
  name: string;
  image: string;
  description: string;
  badge: string;
}

export const WEATHER_SCENES: Record<string, WeatherAtmosphere> = {
  sunny: {
    id: 'sunny',
    name: 'Clear Sunlight & Golden Hour',
    image: sunnyImg,
    description: 'Crisp sunlight illuminating clear horizons',
    badge: 'Solar Clear',
  },
  rainy: {
    id: 'rainy',
    name: 'Atmospheric Rain & Storm',
    image: rainyImg,
    description: 'Moody precipitation with glistening rain reflections',
    badge: 'Rain Front',
  },
  night: {
    id: 'night',
    name: 'Starry Starlight & Midnight Sky',
    image: nightImg,
    description: 'Deep cosmic night with sparkling starry canopy',
    badge: 'Night Astral',
  },
  dusk: {
    id: 'dusk',
    name: 'Dramatic Sunset & Cloud Twilight',
    image: duskImg,
    description: 'Luminous crimson clouds over mountain ridges',
    badge: 'Twilight Dusk',
  },
};

/**
 * Automatically determine the best realistic meteorological backdrop image
 * based on the WMO weather code and whether it is daytime.
 */
export function getAutoAtmosphere(weatherCode: number, isDay: boolean): WeatherAtmosphere {
  if (!isDay) {
    return WEATHER_SCENES.night;
  }

  // Rain, drizzle, thunderstorm, snow, shower
  if (
    (weatherCode >= 51 && weatherCode <= 67) ||
    (weatherCode >= 80 && weatherCode <= 82) ||
    (weatherCode >= 95 && weatherCode <= 99)
  ) {
    return WEATHER_SCENES.rainy;
  }

  // Overcast, fog, clouds
  if (weatherCode === 2 || weatherCode === 3 || weatherCode === 45 || weatherCode === 48) {
    return WEATHER_SCENES.dusk;
  }

  // Clear / mainly clear day
  return WEATHER_SCENES.sunny;
}
