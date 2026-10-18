import { WeatherData } from '../types';

interface DistrictCoord {
  name: string;
  state: string;
  lat: number;
  lon: number;
}

export const DISTRICT_COORDINATES: Record<string, DistrictCoord> = {
  'Nashik': { name: 'Nashik', state: 'Maharashtra', lat: 19.9975, lon: 73.7898 },
  'Pune': { name: 'Pune', state: 'Maharashtra', lat: 18.5204, lon: 73.8567 },
  'Indore': { name: 'Indore', state: 'Madhya Pradesh', lat: 22.7196, lon: 75.8577 },
  'Bhopal': { name: 'Bhopal', state: 'Madhya Pradesh', lat: 23.2599, lon: 77.4126 },
  'Ludhiana': { name: 'Ludhiana', state: 'Punjab', lat: 30.9010, lon: 75.8573 },
  'Jaipur': { name: 'Jaipur', state: 'Rajasthan', lat: 26.9124, lon: 75.7873 },
  'Rajkot': { name: 'Rajkot', state: 'Gujarat', lat: 22.3039, lon: 70.8022 },
  'Varanasi': { name: 'Varanasi', state: 'Uttar Pradesh', lat: 25.3176, lon: 82.9739 },
  'Guntur': { name: 'Guntur', state: 'Andhra Pradesh', lat: 16.3067, lon: 80.4365 },
  'Karnal': { name: 'Karnal', state: 'Haryana', lat: 29.6857, lon: 76.9905 },
};

export class WeatherService {
  public async getDistrictWeather(districtName: string): Promise<WeatherData> {
    const coord = DISTRICT_COORDINATES[districtName] || DISTRICT_COORDINATES['Nashik'];

    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${coord.lat}&longitude=${coord.lon}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max&timezone=auto`,
        { signal: AbortSignal.timeout(6000) }
      );

      if (!response.ok) {
        throw new Error(`Open-Meteo returned status ${response.status}`);
      }

      const data = await response.json();
      const current = data.current;
      const daily = data.daily;

      const rain24h = (daily.precipitation_sum && daily.precipitation_sum[0]) || current.precipitation || 0;
      const rainProb = (daily.precipitation_probability_max && daily.precipitation_probability_max[0]) || 0;

      const forecastList = (daily.time || []).slice(0, 5).map((dateStr: string, idx: number) => ({
        date: dateStr,
        tempMax: daily.temperature_2m_max[idx] ?? 30,
        tempMin: daily.temperature_2m_min[idx] ?? 18,
        rainProb: daily.precipitation_probability_max[idx] ?? 0,
        condition: this.mapWeatherCode(daily.weather_code[idx]),
      }));

      const advisory = this.generateAdvisory(rain24h, rainProb);

      return {
        location: `${coord.name}, ${coord.state}`,
        temperature: Math.round(current.temperature_2m),
        humidity: current.relative_humidity_2m,
        weatherCondition: this.mapWeatherCode(current.weather_code),
        rainfallForecast24hMm: Number(rain24h.toFixed(1)),
        precipitationProbability: rainProb,
        windSpeedKmh: Math.round(current.wind_speed_10m),
        forecast: forecastList,
        irrigationAdvisory: advisory,
        lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'Live Open-Meteo Agrometeorology API',
      };
    } catch (err) {
      console.warn('Weather API fetch failed, using realistic fallback:', err);
      return this.getFallbackWeather(coord.name, coord.state);
    }
  }

  private mapWeatherCode(code: number): string {
    if (code === 0) return 'Clear Sky';
    if (code >= 1 && code <= 3) return 'Partly Cloudy';
    if (code >= 45 && code <= 48) return 'Foggy / Hazy';
    if (code >= 51 && code <= 55) return 'Light Drizzle';
    if (code >= 61 && code <= 65) return 'Rain Showers';
    if (code >= 80 && code <= 82) return 'Scattered Rain';
    if (code >= 95) return 'Thunderstorm';
    return 'Mild Sunny';
  }

  private generateAdvisory(rainMm: number, rainProb: number): WeatherData['irrigationAdvisory'] {
    if (rainMm >= 8 || rainProb >= 60) {
      return {
        recommendation: 'Pause planned irrigation for 24-48 hours.',
        reason: `Substantial rainfall (${rainMm} mm, ${rainProb}% chance) is forecast. Applying water now could lead to waterlogging and nutrient leaching.`,
        soilCheckReminder: 'Perform a root-zone spade test to confirm soil wetness before resuming pumping.',
        confidence: 'High',
      };
    } else if (rainMm >= 2 || rainProb >= 35) {
      return {
        recommendation: 'Reduce irrigation duration by 40% and monitor soil moisture.',
        reason: `Light rain showers (${rainMm} mm) may partially meet crop evapo-transpiration needs.`,
        soilCheckReminder: 'Check top 4 inches of soil. If moist ball forms without crumbling, delay watering.',
        confidence: 'Medium',
      };
    } else {
      return {
        recommendation: 'Proceed with scheduled irrigation cycle.',
        reason: 'Dry conditions forecast with minimal precipitation risk. Maintain optimal root-zone moisture.',
        soilCheckReminder: 'Irrigate during early morning or evening hours to reduce evaporative loss.',
        confidence: 'High',
      };
    }
  }

  public getFallbackWeather(district: string, state: string): WeatherData {
    return {
      location: `${district}, ${state} (Regional Baseline)`,
      temperature: 28,
      humidity: 52,
      weatherCondition: 'Clear & Sunny',
      rainfallForecast24hMm: 0,
      precipitationProbability: 10,
      windSpeedKmh: 12,
      forecast: [
        { date: 'Today', tempMax: 31, tempMin: 18, rainProb: 10, condition: 'Sunny' },
        { date: 'Tomorrow', tempMax: 32, tempMin: 19, rainProb: 15, condition: 'Clear Sky' },
        { date: 'Day 3', tempMax: 30, tempMin: 18, rainProb: 20, condition: 'Partly Cloudy' },
        { date: 'Day 4', tempMax: 29, tempMin: 17, rainProb: 25, condition: 'Partly Cloudy' },
        { date: 'Day 5', tempMax: 30, tempMin: 18, rainProb: 10, condition: 'Clear Sky' },
      ],
      irrigationAdvisory: {
        recommendation: 'Weather data is currently in fallback mode. Inspect soil conditions directly.',
        reason: 'Dry regional pattern typical for current season. Follow established irrigation schedule.',
        soilCheckReminder: 'Always test soil moisture in the root zone before activating borewell or drip lines.',
        confidence: 'Medium',
      },
      lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      source: 'Regional Agricultural Advisory Baseline (Offline/Fallback)',
    };
  }
}

export const weatherService = new WeatherService();
