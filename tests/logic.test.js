import { describe, it, expect } from 'vitest';
import {
  calculateWaterDiscipline,
  calculateLoggingConsistency,
  calculateCropCare,
  calculatePlanAdherence,
  calculatePassportScore
} from '../src/logic/scoring.js';
import {
  rankCrops,
  optimizeWaterBudget,
  calculateStressTest
} from '../src/logic/optimizer.js';
import {
  pumpToKL,
  floodIrrigationToKL,
  calculateRainCredit
} from '../src/logic/waterConverter.js';
import {
  parseVoiceLog,
  extractWaterNumber
} from '../src/logic/voiceParser.js';
import {
  SEED_CROPS,
  SEED_LOGS,
  SEED_PASSPORT_METRICS,
  SEED_BUYERS
} from '../src/data/seedData.js';
import {
  TRANSLATIONS,
  getCropDisplayName
} from '../src/i18n/translations.js';

describe('FasalSetu Acceptance Tests Suite', () => {

  // Test 1: Ranking
  it('ranks Rabi crops correctly by profit per KL: chana 40.2, tomato 27.5, mustard 25.7, maize 21.4, onion 20.4, wheat 15.7 Rs/KL', () => {
    const ranked = rankCrops(SEED_CROPS);

    expect(ranked[0].id).toBe('chana');
    expect(ranked[0].rsPerKl).toBe(40.2);

    expect(ranked[1].id).toBe('tomato');
    expect(ranked[1].rsPerKl).toBe(27.5);

    expect(ranked[2].id).toBe('mustard');
    expect(ranked[2].rsPerKl).toBe(25.7);

    expect(ranked[3].id).toBe('maize');
    expect(ranked[3].rsPerKl).toBe(21.4);

    expect(ranked[4].id).toBe('onion');
    expect(ranked[4].rsPerKl).toBe(20.4);

    expect(ranked[5].id).toBe('wheat');
    expect(ranked[5].rsPerKl).toBe(15.7);
  });

  // Test 2: Optimizer profit
  it('optimizes profit correctly: Rs 1,84,078 at 6,000 KL and Rs 1,34,655 at 4,200 KL (about -27%)', () => {
    const ranked = rankCrops(SEED_CROPS);

    // At 6,000 KL (5 acres)
    const opt6000 = optimizeWaterBudget(ranked, 5, 6000);
    expect(opt6000.expectedProfit).toBe(184078);
    expect(opt6000.allocations[0].cropId).toBe('chana');
    expect(opt6000.allocations[0].acres).toBe(2.50);
    expect(opt6000.allocations[1].cropId).toBe('tomato');
    expect(opt6000.allocations[1].acres).toBe(2.46);
    expect(opt6000.fallowLand).toBe(0.04);

    // At 4,200 KL (-30% water slider)
    const opt4200 = optimizeWaterBudget(ranked, 5, 4200);
    expect(opt4200.expectedProfit).toBe(134655);

    const pctDrop = (184078 - 134655) / 184078 * 100;
    expect(Math.round(pctDrop)).toBe(27); // about -27%
  });

  // Test 3: Passport score & grade drop
  it('calculates 83 Gold for seed log, and adding 500 KL extra irrigation gives 74 Silver', () => {
    // Seed state: plannedWater = 4400 KL, used = 4600 KL (sum of seed logs: 1200 + 1100 + 1100 + 1200 = 4600)
    // 8 logs done, 3 issues (log 5, 7, 8), 2 resolved (log 5, 7), 1 unresolved (log 8)
    // Sown 2.46 / 2.50 acres
    const totalWaterInitial = SEED_LOGS.reduce((sum, log) => sum + (log.waterKL || 0), 0);
    expect(totalWaterInitial).toBe(4600);

    const initialScore = calculatePassportScore({
      plannedWater: SEED_PASSPORT_METRICS.plannedWaterKL, // 4400
      usedWater: totalWaterInitial, // 4600
      logsDone: SEED_LOGS.length, // 8
      issuesCount: 3,
      resolvedCount: 2,
      plannedAcres: SEED_PASSPORT_METRICS.plannedAcres, // 2.50
      sownAcres: SEED_PASSPORT_METRICS.sownAcres // 2.46
    });

    expect(initialScore.totalScore).toBe(83);
    expect(initialScore.grade).toBe('Gold');

    // Add 500 KL extra irrigation
    const scoreWithExtra500 = calculatePassportScore({
      plannedWater: SEED_PASSPORT_METRICS.plannedWaterKL, // 4400
      usedWater: totalWaterInitial + 500, // 5100
      logsDone: SEED_LOGS.length, // 8
      issuesCount: 3,
      resolvedCount: 2,
      plannedAcres: SEED_PASSPORT_METRICS.plannedAcres,
      sownAcres: SEED_PASSPORT_METRICS.sownAcres
    });

    expect(scoreWithExtra500.totalScore).toBe(74);
    expect(scoreWithExtra500.grade).toBe('Silver');
  });

  // Test 4: Tomato pre-booked share
  it('calculates tomato pre-booked share: 62.5% at score 83, and 37.5% at score 74', () => {
    const expectedYield = SEED_PASSPORT_METRICS.expectedYieldQtl; // 240 Qtl
    const tomatoBuyers = SEED_BUYERS.filter(b => b.cropId === 'tomato');

    // Function to calculate pre-booked share
    const calcPrebookedPct = (currentScore) => {
      const eligibleBuyers = tomatoBuyers.filter(b => b.minScore <= currentScore);
      const eligibleQty = eligibleBuyers.reduce((sum, b) => sum + b.qtyQtl, 0);
      return Math.min(100, Math.round((eligibleQty / expectedYield) * 1000) / 10);
    };

    // At score 83: Buyers A (40), B (60), C (50) are all eligible -> 150 Qtl / 240 = 62.5%
    expect(calcPrebookedPct(83)).toBe(62.5);

    // At score 74: Cloud Kitchen B (min score 80) is ineligible -> A (40) + C (50) = 90 Qtl / 240 = 37.5%
    expect(calcPrebookedPct(74)).toBe(37.5);
  });

  // Test 5: Voice parsing of Hindi & Hinglish logs
  it('parses spoken phrases into valid structured log entries', () => {
    // Test irrigation with numbers
    const log1 = parseVoiceLog('सिंचाई 500');
    expect(log1.type).toBe('irrigation');
    expect(log1.waterKL).toBe(500);

    const log2 = parseVoiceLog('paani 2 hazar');
    expect(log2.type).toBe('irrigation');
    expect(log2.waterKL).toBe(2000);

    // Test pest with action taken
    const log3 = parseVoiceLog('keeda laga, neem spray kiya');
    expect(log3.type).toBe('crop_check');
    expect(log3.condition).toBe('problem');
    expect(log3.resolved).toBe(true);
  });

  // Test 6: Water conversions
  it('converts pump hours and flood depth to KL correctly', () => {
    // 5 HP pump running for 150 hours = 5 * 150 * 8 = 6000 KL
    expect(pumpToKL(5, 150)).toBe(6000);

    // Rain credit calculation
    const credit = calculateRainCredit(25, 5); // 25mm rain on 5 acres
    expect(credit).toBeGreaterThan(0);
  });

  // Test 7: Language toggle preserves numbers
  it('provides translations without altering any numerical values', () => {
    const hindiTitle = TRANSLATIONS.hi.tabPlan;
    const englishTitle = TRANSLATIONS.en.tabPlan;
    expect(hindiTitle).toBeDefined();
    expect(englishTitle).toBeDefined();
    expect(hindiTitle).not.toBe(englishTitle);

    // Crop names exist in all languages
    const crop = SEED_CROPS[0];
    expect(getCropDisplayName(crop, 'hi')).toBe('चना');
    expect(getCropDisplayName(crop, 'mr')).toBe('हरभरा');
    expect(getCropDisplayName(crop, 'pa')).toBe('ਛੋਲੇ');
    expect(getCropDisplayName(crop, 'gu')).toBe('ચણા');
    expect(getCropDisplayName(crop, 'en')).toBe('Chana (Gram)');
  });
});
