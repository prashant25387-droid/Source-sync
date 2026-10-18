import React, { useState, useEffect } from 'react';
import {
  CloudSun,
  Droplets,
  Wind,
  Thermometer,
  ShieldAlert,
  RotateCw,
  Calendar,
  AlertTriangle,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { weatherService, DISTRICT_COORDINATES } from '../../services/weatherService';
import { WeatherData } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { VoiceGuidance } from '../../components/common/VoiceGuidance';

export const WeatherPage: React.FC = () => {
  const { t, language } = useLanguage();
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Nashik');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchWeather = async (district: string) => {
    setLoading(true);
    const data = await weatherService.getDistrictWeather(district);
    setWeather(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchWeather(selectedDistrict);
  }, [selectedDistrict]);

  return (
    <div className="space-y-4 pb-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-800 to-emerald-950 p-4 sm:p-6 rounded-2xl text-white shadow-md">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-700/80 text-emerald-200 text-xs font-bold mb-2">
            <CloudSun className="w-4 h-4 text-sky-300" />
            <span>Agrometeorology Advisory</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            {language === 'hi' ? 'मौसम और सिंचाई सलाह' : 'Weather & Irrigation Advisory'}
          </h1>
          <p className="text-xs sm:text-sm text-emerald-200/90 mt-1.5 leading-relaxed">
            {language === 'hi'
              ? 'स्थान-आधारित मौसम पूर्वानुमान और मिट्टी की नमी संरक्षण के लिए सिंचाई सलाह।'
              : 'Localized agro-weather forecast and water-saving irrigation guidance.'}
          </p>
        </div>
      </div>

      {/* District Selector & Voice Guidance */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-xs font-bold text-slate-700 shrink-0">
            Select District:
          </label>
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-700"
          >
            {Object.keys(DISTRICT_COORDINATES).map((dist) => (
              <option key={dist} value={dist}>
                {dist} ({DISTRICT_COORDINATES[dist].state})
              </option>
            ))}
          </select>
          <button
            onClick={() => fetchWeather(selectedDistrict)}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
            title="Refresh weather"
          >
            <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {weather && (
          <VoiceGuidance
            englishText={`${weather.irrigationAdvisory.recommendation} ${weather.irrigationAdvisory.reason}`}
            hindiText={`सिंचाई सलाह: ${weather.irrigationAdvisory.recommendation} ${weather.irrigationAdvisory.reason}`}
            compact
          />
        )}
      </div>

      {/* Main Weather Card */}
      {weather && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-emerald-900/10 shadow-xs p-4 sm:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
              {/* Current snapshot */}
              <div className="lg:col-span-5 border-b lg:border-b-0 lg:border-r border-slate-100 pb-4 lg:pb-0 lg:pr-6">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Live Agrometeorology • {weather.location}
                </div>
                <div className="mt-3 flex items-baseline gap-4">
                  <span className="text-5xl font-black text-slate-900">
                    {weather.temperature}°C
                  </span>
                  <span className="text-lg font-bold text-emerald-800">
                    {weather.weatherCondition}
                  </span>
                </div>

                <div className="mt-6 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <Droplets className="w-4 h-4 text-cyan-600 mx-auto mb-1" />
                    <span className="text-[10px] text-slate-400 block font-medium">Humidity</span>
                    <span className="font-bold text-slate-800">{weather.humidity}%</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <CloudSun className="w-4 h-4 text-sky-600 mx-auto mb-1" />
                    <span className="text-[10px] text-slate-400 block font-medium">Rain (24h)</span>
                    <span className="font-bold text-slate-800">{weather.rainfallForecast24hMm} mm</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <Wind className="w-4 h-4 text-slate-500 mx-auto mb-1" />
                    <span className="text-[10px] text-slate-400 block font-medium">Wind</span>
                    <span className="font-bold text-slate-800">{weather.windSpeedKmh} km/h</span>
                  </div>
                </div>

                <div className="mt-4 text-[10px] text-slate-400 flex items-center justify-between">
                  <span>Source: {weather.source}</span>
                  <span>Updated: {weather.lastUpdated}</span>
                </div>
              </div>

              {/* Actionable Irrigation Advisory */}
              <div className="lg:col-span-7 space-y-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-100 text-cyan-900 text-xs font-bold">
                  <Droplets className="w-3.5 h-3.5 text-cyan-700" />
                  <span>Irrigation Decision Recommendation</span>
                </div>

                <h3 className="text-xl font-extrabold text-slate-900">
                  {weather.irrigationAdvisory.recommendation}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {weather.irrigationAdvisory.reason}
                </p>

                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 flex items-start gap-2.5">
                  <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Soil Inspection Reminder:</span>
                    <span>{weather.irrigationAdvisory.soilCheckReminder}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 5-Day Agro Forecast */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-700" />
              <span>5-Day Outlook & Rainfall Probability</span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {weather.forecast.map((day, idx) => (
                <div key={idx} className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-center text-xs">
                  <div className="font-bold text-slate-800 mb-1">
                    {day.date.length > 5 ? day.date.slice(5) : day.date}
                  </div>
                  <div className="text-[11px] text-slate-500 mb-2">
                    {day.condition}
                  </div>
                  <div className="text-sm font-extrabold text-slate-900">
                    {day.tempMax}° / <span className="text-xs text-slate-400 font-semibold">{day.tempMin}°</span>
                  </div>
                  <div className="mt-2 text-[10px] font-bold text-cyan-700">
                    🌧 {day.rainProb}% Rain
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
