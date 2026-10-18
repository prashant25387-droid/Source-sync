import { CropReference } from '../types';

export const CROP_REFERENCE_DATA: CropReference[] = [
  {
    id: 'chana',
    cropName: 'Chana (Bengal Gram)',
    nameHi: 'चना (देसी / काबुली)',
    category: 'Pulses',
    suitableSeasons: ['Rabi'],
    suitableSoilTypes: ['Black Soil', 'Loamy Soil', 'Sandy Loam', 'Clay Loam'],
    indicativeWaterReqKLPerAcre: 1100, // KL / acre (~25-30 cm)
    indicativeYieldPerAcreQuintals: 8.5,
    indicativeCostPerAcreRs: 14500,
    indicativeMarketPricePerQuintalRs: 5850,
    durationDays: 110,
    expectedHarvestWindow: 'Feb - Mar',
    suitabilityNotes: 'Deep root system, excellent drought tolerance, enriches soil nitrogen.',
    risks: ['Pod borer attack during flowering', 'Frost risk in northern plains'],
    sourceOrAssumption: 'ICAR-IIPR Kanpur Agronomy & Agmarknet Mandi averages (illustrative)',
  },
  {
    id: 'tomato',
    cropName: 'Tomato (Hybrid)',
    nameHi: 'टमाटर',
    category: 'Vegetables',
    suitableSeasons: ['Rabi', 'Zaid', 'Kharif'],
    suitableSoilTypes: ['Loamy Soil', 'Sandy Loam', 'Black Soil'],
    indicativeWaterReqKLPerAcre: 900,
    indicativeYieldPerAcreQuintals: 160,
    indicativeCostPerAcreRs: 38000,
    indicativeMarketPricePerQuintalRs: 1400,
    durationDays: 120,
    expectedHarvestWindow: 'Nov - Jan / Mar - May',
    suitabilityNotes: 'High cash flow, best with drip irrigation and staking.',
    risks: ['Market price volatility', 'Early blight during humid spells'],
    sourceOrAssumption: 'State Horticulture Dept & NHB benchmarks (illustrative)',
  },
  {
    id: 'mustard',
    cropName: 'Mustard (Sarson)',
    nameHi: 'सरसों',
    category: 'Oilseeds',
    suitableSeasons: ['Rabi'],
    suitableSoilTypes: ['Loamy Soil', 'Sandy Loam', 'Alluvial Soil'],
    indicativeWaterReqKLPerAcre: 1000,
    indicativeYieldPerAcreQuintals: 7.5,
    indicativeCostPerAcreRs: 12500,
    indicativeMarketPricePerQuintalRs: 5650,
    durationDays: 115,
    expectedHarvestWindow: 'Feb - Mar',
    suitabilityNotes: 'Moderate water requirement, steady MSP support, excellent for cool climate.',
    risks: ['Aphid infestation during pod filling', 'Sclerotinia stem rot'],
    sourceOrAssumption: 'ICAR-DRMR Bharatpur & MSP Gazette (illustrative)',
  },
  {
    id: 'onion',
    cropName: 'Rabi Onion',
    nameHi: 'प्याज (रबी)',
    category: 'Vegetables',
    suitableSeasons: ['Rabi'],
    suitableSoilTypes: ['Sandy Loam', 'Loamy Soil', 'Red Soil'],
    indicativeWaterReqKLPerAcre: 1300,
    indicativeYieldPerAcreQuintals: 120,
    indicativeCostPerAcreRs: 42000,
    indicativeMarketPricePerQuintalRs: 1800,
    durationDays: 135,
    expectedHarvestWindow: 'Apr - May',
    suitabilityNotes: 'Strong storage potential, good market liquidity, responsive to micro-irrigation.',
    risks: ['Thrips and purple blotch', 'Storage rot if harvested damp'],
    sourceOrAssumption: 'ICAR-DOGR Rajgurunagar (illustrative)',
  },
  {
    id: 'wheat',
    cropName: 'Wheat (Sharbati/HD)',
    nameHi: 'गेहूं',
    category: 'Cereals',
    suitableSeasons: ['Rabi'],
    suitableSoilTypes: ['Clay Loam', 'Alluvial Soil', 'Black Soil', 'Loamy Soil'],
    indicativeWaterReqKLPerAcre: 1750,
    indicativeYieldPerAcreQuintals: 18,
    indicativeCostPerAcreRs: 16500,
    indicativeMarketPricePerQuintalRs: 2425,
    durationDays: 130,
    expectedHarvestWindow: 'Mar - Apr',
    suitabilityNotes: 'Staple grain with guaranteed government procurement, but higher water need.',
    risks: ['Terminal heat stress in March', 'Yellow rust in foothills'],
    sourceOrAssumption: 'ICAR-IIWBR Karnal (illustrative)',
  },
  {
    id: 'moong',
    cropName: 'Moong (Green Gram - Summer)',
    nameHi: 'मूँग (ग्रीष्मकालीन)',
    category: 'Pulses',
    suitableSeasons: ['Zaid', 'Kharif'],
    suitableSoilTypes: ['Loamy Soil', 'Sandy Loam', 'Alluvial Soil'],
    indicativeWaterReqKLPerAcre: 750,
    indicativeYieldPerAcreQuintals: 5.0,
    indicativeCostPerAcreRs: 9500,
    indicativeMarketPricePerQuintalRs: 7800,
    durationDays: 65,
    expectedHarvestWindow: 'May - Jun',
    suitabilityNotes: 'Short duration catch crop, low water need, adds organic nitrogen.',
    risks: ['Yellow mosaic virus', 'Early monsoon showers during pod maturity'],
    sourceOrAssumption: 'State Agricultural University Agronomy Guidelines (illustrative)',
  },
];

export interface CropPlanRecommendation {
  crop: CropReference;
  score: number; // 0 - 100 ranking score
  totalWaterReqKL: number;
  expectedRevenueRs: number;
  expectedCostRs: number;
  expectedNetProfitRs: number;
  waterProductivityQuintalsPerKL: number;
  profitPerKLWaterRs: number;
  isWaterDeficit: boolean;
  waterDeficitKL: number;
  reasonsFor: string[];
  cautions: string[];
}

export interface PlanInputs {
  farmAreaAcres: number;
  availableWaterKL: number;
  soilType: string;
  season: 'Kharif' | 'Rabi' | 'Zaid';
  irrigationMethod: 'Drip' | 'Sprinkler' | 'Canal / Flood' | 'Borewell / Tube' | 'Rainfed';
  objective: 'profit' | 'water' | 'balanced';
  budgetRs?: number;
}

export class CropPlannerService {
  public evaluateCrop(crop: CropReference, inputs: PlanInputs): CropPlanRecommendation {
    const area = Math.max(0.1, inputs.farmAreaAcres);
    
    // Irrigation efficiency multiplier
    let irrigationEfficiency = 0.70; // default flood
    if (inputs.irrigationMethod === 'Drip') irrigationEfficiency = 0.92;
    else if (inputs.irrigationMethod === 'Sprinkler') irrigationEfficiency = 0.82;
    else if (inputs.irrigationMethod === 'Rainfed') irrigationEfficiency = 0.60;

    const waterPerAcreAdjusted = Math.round(crop.indicativeWaterReqKLPerAcre * (0.85 / irrigationEfficiency));
    const totalWaterReqKL = Math.round(waterPerAcreAdjusted * area);

    const totalYieldQuintals = Number((crop.indicativeYieldPerAcreQuintals * area).toFixed(2));
    const expectedRevenueRs = Math.round(totalYieldQuintals * crop.indicativeMarketPricePerQuintalRs);
    const expectedCostRs = Math.round(crop.indicativeCostPerAcreRs * area);
    const expectedNetProfitRs = expectedRevenueRs - expectedCostRs;

    // Zero-safe water productivity
    const waterProductivityQuintalsPerKL = totalWaterReqKL > 0 
      ? Number((totalYieldQuintals / totalWaterReqKL).toFixed(4)) 
      : 0;

    // Zero-safe profit per kilolitre
    const profitPerKLWaterRs = totalWaterReqKL > 0 
      ? Number((expectedNetProfitRs / totalWaterReqKL).toFixed(2)) 
      : 0;

    const isWaterDeficit = totalWaterReqKL > inputs.availableWaterKL;
    const waterDeficitKL = isWaterDeficit ? totalWaterReqKL - inputs.availableWaterKL : 0;

    // Recommendation logic & scoring (0 - 100)
    let score = 50;
    const reasonsFor: string[] = [];
    const cautions: string[] = [];

    // 1. Season match (Hard constraint)
    if (crop.suitableSeasons.includes(inputs.season)) {
      score += 20;
      reasonsFor.push(`Naturally suited for ${inputs.season} cultivation window.`);
    } else {
      score -= 35;
      cautions.push(`Off-season: typically grown in ${crop.suitableSeasons.join(', ')}.`);
    }

    // 2. Soil match
    if (crop.suitableSoilTypes.some(s => s.toLowerCase() === inputs.soilType.toLowerCase())) {
      score += 15;
      reasonsFor.push(`Well adapted to ${inputs.soilType}.`);
    } else {
      score -= 5;
      cautions.push(`Requires soil conditioning; optimal in ${crop.suitableSoilTypes.slice(0, 2).join(' or ')}.`);
    }

    // 3. Water availability check
    if (isWaterDeficit) {
      score -= 30;
      cautions.push(`Water Deficit Warning: Exceeds your available water budget by ${waterDeficitKL.toLocaleString()} KL. Consider reducing acreage or adopting Drip irrigation.`);
    } else {
      const waterBufferPercent = Math.round(((inputs.availableWaterKL - totalWaterReqKL) / inputs.availableWaterKL) * 100);
      score += 15;
      reasonsFor.push(`Safe water margin: uses ${totalWaterReqKL.toLocaleString()} KL (${100 - waterBufferPercent}% of water budget).`);
    }

    // 4. Objective weights
    if (inputs.objective === 'water') {
      if (profitPerKLWaterRs >= 30) {
        score += 20;
        reasonsFor.push(`High water efficiency: generates ₹${profitPerKLWaterRs} profit per 1,000L water.`);
      } else {
        score -= 10;
      }
    } else if (inputs.objective === 'profit') {
      if (expectedNetProfitRs > 40000 * area) {
        score += 20;
        reasonsFor.push(`Strong projected net returns of ₹${expectedNetProfitRs.toLocaleString()} on ${area} acres.`);
      }
    } else {
      // Balanced
      if (profitPerKLWaterRs >= 25 && !isWaterDeficit) {
        score += 15;
        reasonsFor.push('Excellent balance of high water productivity and net margin.');
      }
    }

    // 5. Budget constraint check
    if (inputs.budgetRs && inputs.budgetRs > 0) {
      if (expectedCostRs > inputs.budgetRs) {
        score -= 15;
        cautions.push(`Estimated cost (₹${expectedCostRs.toLocaleString()}) exceeds your cultivation budget (₹${inputs.budgetRs.toLocaleString()}).`);
      } else {
        reasonsFor.push(`Comfortably within budget (₹${expectedCostRs.toLocaleString()} vs ₹${inputs.budgetRs.toLocaleString()} allocated).`);
      }
    }

    const finalScore = Math.max(0, Math.min(100, score));

    return {
      crop,
      score: finalScore,
      totalWaterReqKL,
      expectedRevenueRs,
      expectedCostRs,
      expectedNetProfitRs,
      waterProductivityQuintalsPerKL,
      profitPerKLWaterRs,
      isWaterDeficit,
      waterDeficitKL,
      reasonsFor,
      cautions,
    };
  }

  public getRecommendations(inputs: PlanInputs): CropPlanRecommendation[] {
    const evaluated = CROP_REFERENCE_DATA.map(crop => this.evaluateCrop(crop, inputs));
    // Sort descending by score
    return evaluated.sort((a, b) => b.score - a.score);
  }
}

export const cropPlannerService = new CropPlannerService();
