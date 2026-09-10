import { WeatherData, WeatherLocation } from '../types/weather';

const STORAGE_KEYS = {
  CURRENT_LOCATION: 'weather_current_location',
  FAVORITE_LOCATIONS: 'weather_favorites',
  WEATHER_CACHE_PREFIX: 'weather_cache_',
  ALERT_PREFERENCES: 'weather_alert_prefs',
  UNIT_PREFERENCE: 'weather_temp_unit',
  LAST_FETCH_TIME: 'weather_last_fetch',
};

export const DEFAULT_LOCATIONS: WeatherLocation[] = [
  {
    id: 'loc_ny',
    name: 'New York',
    country: 'United States',
    admin1: 'New York',
    latitude: 40.7128,
    longitude: -74.0060,
    timezone: 'America/New_York',
  },
  {
    id: 'loc_london',
    name: 'London',
    country: 'United Kingdom',
    admin1: 'England',
    latitude: 51.5074,
    longitude: -0.1278,
    timezone: 'Europe/London',
  },
  {
    id: 'loc_tokyo',
    name: 'Tokyo',
    country: 'Japan',
    admin1: 'Tokyo',
    latitude: 35.6762,
    longitude: 139.6503,
    timezone: 'Asia/Tokyo',
  },
  {
    id: 'loc_paris',
    name: 'Paris',
    country: 'France',
    admin1: 'Île-de-France',
    latitude: 48.8566,
    longitude: 2.3522,
    timezone: 'Europe/Paris',
  },
  {
    id: 'loc_sydney',
    name: 'Sydney',
    country: 'Australia',
    admin1: 'New South Wales',
    latitude: -33.8688,
    longitude: 151.2093,
    timezone: 'Australia/Sydney',
  },
];

export function getCachedWeather(latitude: number, longitude: number): WeatherData | null {
  try {
    const key = `${STORAGE_KEYS.WEATHER_CACHE_PREFIX}${latitude.toFixed(2)}_${longitude.toFixed(2)}`;
    const data = localStorage.getItem(key);
    if (!data) return null;
    return JSON.parse(data) as WeatherData;
  } catch (err) {
    console.warn('Failed to read cached weather from localStorage', err);
    return null;
  }
}

export function setCachedWeather(data: WeatherData): void {
  try {
    const key = `${STORAGE_KEYS.WEATHER_CACHE_PREFIX}${data.location.latitude.toFixed(2)}_${data.location.longitude.toFixed(2)}`;
    localStorage.setItem(key, JSON.stringify(data));
    localStorage.setItem(STORAGE_KEYS.LAST_FETCH_TIME, Date.now().toString());
  } catch (err) {
    console.warn('Failed to save cached weather to localStorage', err);
  }
}

export function getSavedLocation(): WeatherLocation {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_LOCATION);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (err) {
    console.warn('Failed to parse saved location', err);
  }
  return DEFAULT_LOCATIONS[0];
}

export function saveLocation(loc: WeatherLocation): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CURRENT_LOCATION, JSON.stringify(loc));
  } catch (err) {
    console.warn('Failed to save location', err);
  }
}

export function getSavedFavorites(): WeatherLocation[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.FAVORITE_LOCATIONS);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (err) {
    console.warn('Failed to parse favorites', err);
  }
  return DEFAULT_LOCATIONS.slice(0, 3);
}

export function saveFavorites(favorites: WeatherLocation[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.FAVORITE_LOCATIONS, JSON.stringify(favorites));
  } catch (err) {
    console.warn('Failed to save favorites', err);
  }
}

export function getSavedUnit(): 'C' | 'F' {
  try {
    const unit = localStorage.getItem(STORAGE_KEYS.UNIT_PREFERENCE);
    if (unit === 'F' || unit === 'C') return unit;
  } catch {
    // fallback
  }
  return 'C';
}

export function saveUnit(unit: 'C' | 'F'): void {
  try {
    localStorage.setItem(STORAGE_KEYS.UNIT_PREFERENCE, unit);
  } catch {
    // ignore
  }
}
