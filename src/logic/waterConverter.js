/**
 * FasalSetu - Easy Water Entry & Conversion Logic
 * Helps farmers convert intuitive metrics (pump hours, flood irrigation depth) to KL (Kilo-litres)
 * 1 KL = 1,000 Litres = 1 cubic metre (m³)
 */

// Discharge rate in KL per hour per HP (based on standard Indian agricultural tube-well pumps)
export const DISCHARGE_RATE_PER_HP_KL = 8; // e.g. 5 HP = 40 KL/hour

export function pumpToKL(hp, hours) {
  const pumpHP = Math.max(0, Number(hp) || 0);
  const runHours = Math.max(0, Number(hours) || 0);
  return Math.round(pumpHP * runHours * DISCHARGE_RATE_PER_HP_KL);
}

// 1 acre-inch of irrigation water equals 102.79 KL (approx 100 KL)
export const ACRE_INCH_TO_KL = 102.79;

export function floodIrrigationToKL(irrigations, depthInInches, acres) {
  const count = Math.max(0, Number(irrigations) || 0);
  const depth = Math.max(0, Number(depthInInches) || 0);
  const area = Math.max(0, Number(acres) || 0);
  return Math.round(count * depth * area * ACRE_INCH_TO_KL);
}

// 1 mm of rain over 1 acre equals 4.047 KL of water
export const MM_RAIN_PER_ACRE_TO_KL = 4.047;

export function calculateRainCredit(rainForecastMM, acres) {
  const rain = Math.max(0, Number(rainForecastMM) || 0);
  const area = Math.max(0, Number(acres) || 0);
  const rainWaterKL = Math.round(rain * area * MM_RAIN_PER_ACRE_TO_KL);
  return rainWaterKL;
}

export function adjustWaterForRain(originalBudgetKL, rainForecastMM, acres) {
  const rainCreditKL = calculateRainCredit(rainForecastMM, acres);
  const adjustedBudgetKL = Math.max(0, originalBudgetKL - rainCreditKL);
  return {
    originalBudgetKL,
    rainForecastMM,
    rainCreditKL,
    adjustedBudgetKL
  };
}
