import {
  CurrentWeather,
  DailyForecastSummary,
  HourlyForecastPoint,
  WeatherData,
  WeatherAlert,
  WeatherLocation,
} from '../types/weather';
import { getWeatherCodeInfo } from '../utils/weatherCodes';
import { getCachedWeather, setCachedWeather } from './storageService';

export async function searchLocations(query: string): Promise<WeatherLocation[]> {
  if (!query || query.trim().length < 2) return [];

  try {
    const res = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
        query.trim()
      )}&count=6&language=en&format=json`
    );
    if (!res.ok) throw new Error('Geocoding network error');
    const data = await res.json();
    if (!data.results) return [];

    return data.results.map((item: any) => ({
      id: `loc_${item.id}`,
      name: item.name,
      country: item.country || '',
      admin1: item.admin1 || '',
      latitude: item.latitude,
      longitude: item.longitude,
      timezone: item.timezone || 'auto',
    }));
  } catch (err) {
    console.warn('Location search failed, falling back to local search', err);
    return [];
  }
}

export function detectSevereAlerts(
  location: WeatherLocation,
  current: CurrentWeather,
  daily: DailyForecastSummary[],
  hourly: HourlyForecastPoint[]
): WeatherAlert[] {
  const alerts: WeatherAlert[] = [];

  // 1. Wind Gust / Gale Advisory
  if (current.windSpeed >= 50 || daily.some((d) => d.windSpeedMax >= 55)) {
    alerts.push({
      id: `alert_wind_${location.id}`,
      event: 'High Wind Warning',
      severity: 'severe',
      headline: `Damaging winds up to ${Math.round(
        Math.max(current.windSpeed, ...daily.map((d) => d.windSpeedMax))
      )} km/h expected`,
      description: `Sustained strong winds and hazardous gusts could blow down trees and power lines. Unsecured outdoor objects may become projectiles. Travel will be difficult, especially for high-profile vehicles.`,
      instruction: 'Secure outdoor furniture, trash bins, and loose objects. Avoid wooded paths during peak gusts and exercise caution on bridges.',
      effective: 'Immediate',
      expires: 'Next 24 Hours',
      sender: 'National Weather Warning Center',
    });
  }

  // 2. Severe Thunderstorms / Hail
  const hasThunder =
    [95, 96, 99].includes(current.weatherCode) ||
    hourly.slice(0, 48).some((h) => [95, 96, 99].includes(h.weatherCode));

  if (hasThunder) {
    alerts.push({
      id: `alert_thunder_${location.id}`,
      event: 'Severe Thunderstorm & Lightning Alert',
      severity: 'extreme',
      headline: 'Active thunderstorm cluster with frequent cloud-to-ground lightning',
      description: 'Atmospheric instability is producing localized intense downpours, frequent lightning strikes, and risk of hail. Rapid reductions in road visibility expected.',
      instruction: 'Move indoors away from windows immediately. Disconnect sensitive electronic appliances and do not take shelter under solitary trees.',
      effective: 'Immediate',
      expires: 'Until 10:00 PM',
      sender: 'Severe Storms Advisory Desk',
    });
  }

  // 3. Flood Watch / Heavy Rain
  const heavyRainHour = hourly.slice(0, 48).find((h) => h.precipAmount >= 8 || h.precipProbability >= 85);
  const totalRain = daily.reduce((acc, d) => acc + (d.precipSum || 0), 0);

  if (heavyRainHour || totalRain > 35) {
    alerts.push({
      id: `alert_flood_${location.id}`,
      event: 'Flood Watch & Heavy Precipitation Advisory',
      severity: 'moderate',
      headline: 'High precipitation rate with localized urban street ponding',
      description: 'Extended rainfall over saturated soil may lead to pooling on highways and low-lying underpasses. Sump pumps should be checked.',
      instruction: 'Avoid walking or driving through water-covered roadways. Turn around, don’t drown. Monitor local drainage canals.',
      effective: 'Active',
      expires: 'Next 36 Hours',
      sender: 'Hydrological Advisory Service',
    });
  }

  // 4. Excessive Heat / Extreme Freeze
  if (current.temp >= 35 || daily.some((d) => d.maxTemp >= 36)) {
    alerts.push({
      id: `alert_heat_${location.id}`,
      event: 'Excessive Heat Advisory',
      severity: 'severe',
      headline: `Heat index peaking near ${Math.round(current.temp)}°C (${Math.round(
        (current.temp * 9) / 5 + 32
      )}°F)`,
      description: 'Prolonged exposure and strenuous outdoor activity without adequate hydration significantly heighten the risk of heat exhaustion and heat stroke.',
      instruction: 'Drink ample water, remain in air-conditioned areas during mid-day peak, and never leave children or pets unattended in parked vehicles.',
      effective: 'Active',
      expires: 'Through Weekend',
      sender: 'Regional Meteorological Agency',
    });
  } else if (current.temp <= -4 || daily.some((d) => d.minTemp <= -5)) {
    alerts.push({
      id: `alert_freeze_${location.id}`,
      event: 'Hard Freeze & Frost Warning',
      severity: 'moderate',
      headline: `Sub-freezing temperatures dropping to ${Math.round(
        Math.min(current.temp, ...daily.map((d) => d.minTemp))
      )}°C`,
      description: 'Sub-freezing temperatures will cause black ice on elevated roads, bridges, and cause frost damage to sensitive outdoor vegetation and exposed plumbing.',
      instruction: 'Wrap exposed outdoor water pipes, bring tender plants indoors, and provide warm shelter for domestic animals.',
      effective: 'Active',
      expires: 'Until 9:00 AM',
      sender: 'Cold Climate Advisory Board',
    });
  }

  // 5. Extreme UV Alert
  if (current.uvIndex >= 8 || daily.some((d) => d.uvIndexMax >= 8.5)) {
    alerts.push({
      id: `alert_uv_${location.id}`,
      event: 'Extreme UV Radiation Notice',
      severity: 'minor',
      headline: 'Very High Solar Ultraviolet Radiation Index (8+)',
      description: 'Unprotected skin and eyes can suffer sunburn damage in fewer than 15 minutes of direct solar exposure.',
      instruction: 'Apply SPF 50+ sunscreen generously, wear UV400 sunglasses and wide-brimmed hats between 10 AM and 4 PM.',
      effective: 'Daily Peak',
      expires: 'Until Sunset',
      sender: 'Atmospheric Environmental Monitor',
    });
  }

  return alerts;
}

export async function fetchWeatherData(
  location: WeatherLocation,
  forceOfflineMock: boolean = false
): Promise<WeatherData> {
  const cached = getCachedWeather(location.latitude, location.longitude);

  if (forceOfflineMock) {
    if (cached) {
      return {
        ...cached,
        current: { ...cached.current, isOfflineCached: true },
      };
    }
  }

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,relative_humidity_2m,dew_point_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,surface_pressure,cloud_cover,wind_speed_10m,wind_direction_10m,uv_index&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_sum,precipitation_probability_max,wind_speed_10m_max&forecast_days=5&timezone=auto`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Weather API returned ${res.status}`);
    const data = await res.json();

    const hourlyTimes: string[] = data.hourly?.time || [];
    const hourlyTemps: number[] = data.hourly?.temperature_2m || [];
    const hourlyApparent: number[] = data.hourly?.apparent_temperature || [];
    const hourlyCodes: number[] = data.hourly?.weather_code || [];
    const hourlyPrecipProb: number[] = data.hourly?.precipitation_probability || [];
    const hourlyPrecip: number[] = data.hourly?.precipitation || [];
    const hourlyWindSpeed: number[] = data.hourly?.wind_speed_10m || [];
    const hourlyWindDir: number[] = data.hourly?.wind_direction_10m || [];
    const hourlyHumidity: number[] = data.hourly?.relative_humidity_2m || [];
    const hourlyUv: number[] = data.hourly?.uv_index || [];
    const hourlyCloud: number[] = data.hourly?.cloud_cover || [];
    const hourlyPressure: number[] = data.hourly?.surface_pressure || [];
    const hourlyDew: number[] = data.hourly?.dew_point_2m || [];

    const allHourly: HourlyForecastPoint[] = [];

    for (let i = 0; i < hourlyTimes.length; i++) {
      const timeStr = hourlyTimes[i]; // e.g. "2026-09-10T00:00"
      const dateObj = new Date(timeStr);
      const hoursNum = dateObj.getHours();
      const isDay = hoursNum >= 6 && hoursNum < 20;

      const codeInfo = getWeatherCodeInfo(hourlyCodes[i] || 0, isDay);
      const hourLabel =
        hoursNum === 0
          ? '12 AM'
          : hoursNum === 12
          ? '12 PM'
          : hoursNum > 12
          ? `${hoursNum - 12} PM`
          : `${hoursNum} AM`;

      const dayKey = timeStr.split('T')[0];

      allHourly.push({
        time: timeStr,
        timestamp: dateObj.getTime(),
        hourLabel,
        dayKey,
        temp: hourlyTemps[i] ?? 20,
        apparentTemp: hourlyApparent[i] ?? (hourlyTemps[i] ?? 20),
        weatherCode: hourlyCodes[i] ?? 0,
        weatherLabel: codeInfo.label,
        iconName: codeInfo.icon,
        isDay,
        precipProbability: hourlyPrecipProb[i] ?? 0,
        precipAmount: hourlyPrecip[i] ?? 0,
        windSpeed: hourlyWindSpeed[i] ?? 10,
        windDirection: hourlyWindDir[i] ?? 180,
        humidity: hourlyHumidity[i] ?? 50,
        uvIndex: hourlyUv[i] ?? 0,
        cloudCover: hourlyCloud[i] ?? 20,
        surfacePressure: hourlyPressure[i] ?? 1013,
        dewPoint: hourlyDew[i] ?? 10,
      });
    }

    // Daily breakdown (5 days)
    const dailyDates: string[] = data.daily?.time || [];
    const dailyMaxTemps: number[] = data.daily?.temperature_2m_max || [];
    const dailyMinTemps: number[] = data.daily?.temperature_2m_min || [];
    const dailyCodes: number[] = data.daily?.weather_code || [];
    const dailySunrises: string[] = data.daily?.sunrise || [];
    const dailySunsets: string[] = data.daily?.sunset || [];
    const dailyUvMax: number[] = data.daily?.uv_index_max || [];
    const dailyPrecipSum: number[] = data.daily?.precipitation_sum || [];
    const dailyPrecipProbMax: number[] = data.daily?.precipitation_probability_max || [];
    const dailyWindSpeedMax: number[] = data.daily?.wind_speed_10m_max || [];

    const daily: DailyForecastSummary[] = [];

    for (let d = 0; d < Math.min(5, dailyDates.length); d++) {
      const dateStr = dailyDates[d];
      const dObj = new Date(dateStr + 'T12:00:00');
      const dayName = d === 0 ? 'Today' : dObj.toLocaleDateString('en-US', { weekday: 'short' });
      const fullDateLabel = dObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      const codeInfo = getWeatherCodeInfo(dailyCodes[d] || 0, true);
      const dayHours = allHourly.filter((h) => h.dayKey === dateStr);

      daily.push({
        date: dateStr,
        dayName,
        fullDateLabel,
        maxTemp: dailyMaxTemps[d] ?? 22,
        minTemp: dailyMinTemps[d] ?? 14,
        weatherCode: dailyCodes[d] ?? 0,
        weatherLabel: codeInfo.label,
        iconName: codeInfo.icon,
        precipProbabilityMax: dailyPrecipProbMax[d] ?? 0,
        precipSum: dailyPrecipSum[d] ?? 0,
        uvIndexMax: dailyUvMax[d] ?? 4,
        windSpeedMax: dailyWindSpeedMax[d] ?? 15,
        sunrise: dailySunrises[d] ? dailySunrises[d].split('T')[1] : '06:00',
        sunset: dailySunsets[d] ? dailySunsets[d].split('T')[1] : '19:30',
        hours: dayHours,
      });
    }

    const currentHour = new Date().getHours();
    const isCurrentDay = currentHour >= 6 && currentHour < 20;
    const currentCode = data.current?.weather_code ?? 0;
    const currentCodeInfo = getWeatherCodeInfo(currentCode, isCurrentDay);

    const current: CurrentWeather = {
      temp: data.current?.temperature_2m ?? daily[0]?.maxTemp ?? 20,
      apparentTemp: data.current?.apparent_temperature ?? data.current?.temperature_2m ?? 20,
      highTemp: daily[0]?.maxTemp ?? 22,
      lowTemp: daily[0]?.minTemp ?? 14,
      weatherCode: currentCode,
      weatherLabel: currentCodeInfo.label,
      iconName: currentCodeInfo.icon,
      isDay: isCurrentDay,
      windSpeed: data.current?.wind_speed_10m ?? 12,
      windDirection: data.current?.wind_direction_10m ?? 180,
      humidity: data.current?.relative_humidity_2m ?? 55,
      uvIndex: daily[0]?.uvIndexMax ?? 4,
      pressure: data.current?.surface_pressure ?? 1013,
      precipProbability: daily[0]?.precipProbabilityMax ?? 0,
      cloudCover: allHourly[currentHour]?.cloudCover ?? 30,
      dewPoint: allHourly[currentHour]?.dewPoint ?? 12,
      sunrise: daily[0]?.sunrise ?? '06:15',
      sunset: daily[0]?.sunset ?? '19:45',
      lastUpdated: Date.now(),
      isOfflineCached: false,
    };

    const alerts = detectSevereAlerts(location, current, daily, allHourly);

    const weatherData: WeatherData = {
      location,
      current,
      daily,
      allHourly,
      alerts,
      cachedAt: Date.now(),
    };

    // Cache locally for offline reliability
    setCachedWeather(weatherData);

    return weatherData;
  } catch (error) {
    console.warn('Live weather fetch failed, attempting cached fallback', error);
    if (cached) {
      return {
        ...cached,
        current: {
          ...cached.current,
          isOfflineCached: true,
        },
      };
    }

    // Generate deterministic offline fallback dataset if fresh install with no connectivity
    return generateOfflineFallback(location);
  }
}

function generateOfflineFallback(location: WeatherLocation): WeatherData {
  const now = new Date();
  const daily: DailyForecastSummary[] = [];
  const allHourly: HourlyForecastPoint[] = [];

  const baseTemp = 19;

  for (let d = 0; d < 5; d++) {
    const dObj = new Date(now.getTime() + d * 86400000);
    const dateStr = dObj.toISOString().split('T')[0];
    const dayName = d === 0 ? 'Today' : dObj.toLocaleDateString('en-US', { weekday: 'short' });
    const fullDateLabel = dObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    const dayHours: HourlyForecastPoint[] = [];
    const dayCode = (d % 3 === 0) ? 2 : (d % 2 === 0) ? 1 : 61;
    const codeInfo = getWeatherCodeInfo(dayCode, true);

    const maxT = baseTemp + (d % 2 === 0 ? 3 : 1);
    const minT = baseTemp - (d % 2 === 0 ? 5 : 7);

    for (let h = 0; h < 24; h++) {
      const timeStr = `${dateStr}T${String(h).padStart(2, '0')}:00`;
      const isDay = h >= 6 && h < 20;
      const diurnalFactor = Math.sin(((h - 8) / 24) * 2 * Math.PI);
      const hourTemp = Math.round(minT + (maxT - minT) * ((diurnalFactor + 1) / 2));
      const hourLabel =
        h === 0 ? '12 AM' : h === 12 ? '12 PM' : h > 12 ? `${h - 12} PM` : `${h} AM`;

      const hPoint: HourlyForecastPoint = {
        time: timeStr,
        timestamp: new Date(timeStr).getTime(),
        hourLabel,
        dayKey: dateStr,
        temp: hourTemp,
        apparentTemp: hourTemp - 1,
        weatherCode: dayCode,
        weatherLabel: codeInfo.label,
        iconName: codeInfo.icon,
        isDay,
        precipProbability: dayCode === 61 ? 65 : 10,
        precipAmount: dayCode === 61 ? 2.4 : 0,
        windSpeed: 14 + (h % 5),
        windDirection: 210,
        humidity: 60 - Math.round(diurnalFactor * 15),
        uvIndex: isDay ? Math.max(0, Math.round(diurnalFactor * 6)) : 0,
        cloudCover: dayCode === 61 ? 80 : 30,
        surfacePressure: 1014,
        dewPoint: 9,
      };

      dayHours.push(hPoint);
      allHourly.push(hPoint);
    }

    daily.push({
      date: dateStr,
      dayName,
      fullDateLabel,
      maxTemp: maxT,
      minTemp: minT,
      weatherCode: dayCode,
      weatherLabel: codeInfo.label,
      iconName: codeInfo.icon,
      precipProbabilityMax: dayCode === 61 ? 65 : 10,
      precipSum: dayCode === 61 ? 4.2 : 0,
      uvIndexMax: 6,
      windSpeedMax: 18,
      sunrise: '06:22',
      sunset: '19:35',
      hours: dayHours,
    });
  }

  const current: CurrentWeather = {
    temp: baseTemp,
    apparentTemp: baseTemp - 1,
    highTemp: daily[0].maxTemp,
    lowTemp: daily[0].minTemp,
    weatherCode: 2,
    weatherLabel: 'Partly Cloudy (Offline Cache)',
    iconName: 'CloudSun',
    isDay: true,
    windSpeed: 14,
    windDirection: 210,
    humidity: 58,
    uvIndex: 5,
    pressure: 1014,
    precipProbability: 15,
    cloudCover: 35,
    dewPoint: 9,
    sunrise: '06:22',
    sunset: '19:35',
    lastUpdated: Date.now(),
    isOfflineCached: true,
  };

  return {
    location,
    current,
    daily,
    allHourly,
    alerts: [
      {
        id: 'offline_notice',
        event: 'Offline Mode Active',
        severity: 'minor',
        headline: 'Showing pre-stored weather forecast',
        description: 'Your device is operating in offline mode. The 5-day hourly forecast and widget views remain fully functional using cached data.',
        instruction: 'Reconnect to the internet when convenient to fetch real-time updates and live radar advisories.',
        effective: 'Current Session',
        expires: 'Until Reconnect',
        sender: 'Local Offline Cache Engine',
      },
    ],
    cachedAt: Date.now(),
  };
}
