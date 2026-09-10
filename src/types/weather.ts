export interface WeatherLocation {
  id: string;
  name: string;
  country: string;
  admin1?: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

export interface HourlyForecastPoint {
  time: string;
  timestamp: number;
  hourLabel: string;
  dayKey: string;
  temp: number;
  apparentTemp: number;
  weatherCode: number;
  weatherLabel: string;
  iconName: string;
  isDay: boolean;
  precipProbability: number; // %
  precipAmount: number; // mm
  windSpeed: number; // km/h
  windDirection: number; // degrees
  humidity: number; // %
  uvIndex: number;
  cloudCover: number; // %
  surfacePressure: number; // hPa
  dewPoint: number;
}

export interface DailyForecastSummary {
  date: string;
  dayName: string;
  fullDateLabel: string;
  maxTemp: number;
  minTemp: number;
  weatherCode: number;
  weatherLabel: string;
  iconName: string;
  precipProbabilityMax: number;
  precipSum: number;
  uvIndexMax: number;
  windSpeedMax: number;
  sunrise: string;
  sunset: string;
  hours: HourlyForecastPoint[];
}

export interface WeatherAlert {
  id: string;
  event: string;
  severity: 'extreme' | 'severe' | 'moderate' | 'minor';
  headline: string;
  description: string;
  instruction: string;
  effective: string;
  expires: string;
  sender: string;
  isSimulated?: boolean;
}

export interface CurrentWeather {
  temp: number;
  apparentTemp: number;
  highTemp: number;
  lowTemp: number;
  weatherCode: number;
  weatherLabel: string;
  iconName: string;
  isDay: boolean;
  windSpeed: number;
  windDirection: number;
  humidity: number;
  uvIndex: number;
  pressure: number;
  precipProbability: number;
  cloudCover: number;
  dewPoint: number;
  sunrise: string;
  sunset: string;
  lastUpdated: number;
  isOfflineCached?: boolean;
}

export interface WeatherData {
  location: WeatherLocation;
  current: CurrentWeather;
  daily: DailyForecastSummary[];
  allHourly: HourlyForecastPoint[];
  alerts: WeatherAlert[];
  cachedAt: number;
}

export type TempUnit = 'C' | 'F';
export type WidgetSize = 'compact' | 'wide' | 'glance';
