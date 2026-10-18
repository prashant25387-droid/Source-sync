import { describe, it, expect } from 'vitest';
import {
  parseSpokenFarmLog,
  extractSpokenNumber,
  convertToKL,
} from './speechParserService';

describe('Speech Parser Service - parseSpokenFarmLog', () => {
  // Case 1: "सिंचाई 500"
  it('parses Case 1: "सिंचाई 500" as Irrigation with ambiguous 500 quantity', () => {
    const result = parseSpokenFarmLog('सिंचाई 500', 'hi');
    expect(result.isValid).toBe(true);
    expect(result.activityType).toBe('Irrigation');
    expect(result.numericValue).toBe(500);
    expect(result.isWaterAmbiguous).toBe(true);
    expect(result.clarificationNeeded).toBeDefined();
    expect(result.clarificationNeeded?.numericValue).toBe(500);
  });

  // Case 2: "paani 2 hazar"
  it('parses Case 2: "paani 2 hazar" as water-related with recognized value 2000', () => {
    const result = parseSpokenFarmLog('paani 2 hazar', 'hi');
    expect(result.isValid).toBe(true);
    expect(result.activityType).toBe('Irrigation');
    expect(result.numericValue).toBe(2000);
    expect(result.isWaterAmbiguous).toBe(true);
    expect(result.clarificationNeeded?.numericValue).toBe(2000);
  });

  // Case 3: "keeda laga, neem spray kiya"
  it('parses Case 3: "keeda laga, neem spray kiya" as Pest Control Action with unconfirmed resolution', () => {
    const result = parseSpokenFarmLog('keeda laga, neem spray kiya', 'en');
    expect(result.isValid).toBe(true);
    expect(result.activityType).toBe('Pest Control Action');
    expect(result.condition).toBe('Problem observed');
    expect(result.description.toLowerCase()).toContain('neem');
    expect(result.resolved).toBe(false);
  });

  // Case 4: "कीड़े लगे थे, नीम का स्प्रे किया और समस्या ठीक हो गई"
  it('parses Case 4: "कीड़े लगे थे, नीम का स्प्रे किया और समस्या ठीक हो गई" as Pest Control Action with resolved=true', () => {
    const result = parseSpokenFarmLog('कीड़े लगे थे, नीम का स्प्रे किया और समस्या ठीक हो गई', 'hi');
    expect(result.isValid).toBe(true);
    expect(result.activityType).toBe('Pest Control Action');
    expect(result.condition).toBe('Problem observed');
    expect(result.resolved).toBe(true);
  });

  // Case 5: "I irrigated for 2 hours"
  it('parses Case 5: "I irrigated for 2 hours" as Irrigation with pump duration of 2 hours', () => {
    const result = parseSpokenFarmLog('I irrigated for 2 hours', 'en');
    expect(result.isValid).toBe(true);
    expect(result.activityType).toBe('Irrigation');
    expect(result.pumpHours).toBe(2);
    expect(result.waterVolumeKL).toBeUndefined(); // volume not yet known without pump capacity
    expect(result.isWaterAmbiguous).toBe(true);
  });

  // Case 6: "बारिश हुई"
  it('parses Case 6: "बारिश हुई" as Weather Observation with rainfall reported', () => {
    const result = parseSpokenFarmLog('बारिश हुई', 'hi');
    expect(result.isValid).toBe(true);
    expect(result.condition).toBe('Rainfall reported');
    expect(result.waterVolumeKL).toBeUndefined();
  });

  // Case 7: Ambiguous numbers & Hindi/Hinglish numeric numerals
  it('parses Case 7: Hindi and Hinglish numeric numeral expressions correctly', () => {
    expect(extractSpokenNumber('खेत में सौ पौधे')?.value).toBe(100);
    expect(extractSpokenNumber('पाँच सौ लीटर')?.value).toBe(500);
    expect(extractSpokenNumber('पांच सौ')?.value).toBe(500);
    expect(extractSpokenNumber('एक हजार लीटर')?.value).toBe(1000);
    expect(extractSpokenNumber('दो हजार')?.value).toBe(2000);
    expect(extractSpokenNumber('ढाई हजार')?.value).toBe(2500);
    expect(extractSpokenNumber('paanch sau')?.value).toBe(500);
    expect(extractSpokenNumber('paanch so')?.value).toBe(500);
    expect(extractSpokenNumber('ek hazar')?.value).toBe(1000);
    expect(extractSpokenNumber('do hazar')?.value).toBe(2000);
    expect(extractSpokenNumber('dhai hazar')?.value).toBe(2500);
  });

  // Case 8: Unsupported or empty transcript
  it('parses Case 8: Empty or invalid transcript gracefully without crashing', () => {
    const emptyResult = parseSpokenFarmLog('', 'hi');
    expect(emptyResult.isValid).toBe(false);

    const whitespaceResult = parseSpokenFarmLog('   ', 'en');
    expect(whitespaceResult.isValid).toBe(false);

    const gibberishResult = parseSpokenFarmLog('zzqqwwpp', 'en');
    expect(gibberishResult.isValid).toBe(false);
  });

  // Case 9: Water unit conversions to KL
  it('converts units to Kilolitres accurately according to 1 KL = 1,000 Litres', () => {
    // 1 KL = 1 KL
    expect(convertToKL(500, 'KL')).toBe(500);
    // 500,000 Litres = 500 KL
    expect(convertToKL(500000, 'Litres')).toBe(500);
    expect(convertToKL(2500, 'Litres')).toBe(2.5);
    // 2 pump hours at 30 KL/hr = 60 KL
    expect(convertToKL(2, 'Hours', 30)).toBe(60);
    // 2 irrigations = 150 KL
    expect(convertToKL(2, 'Irrigations')).toBe(150);
  });
});

import { extractPassportIdFromInput } from '../components/buyer/BuyerPassportScannerModal';
import { dataService } from './dataService';

describe('Buyer QR Code & Pre-Booking Eligibility Verification', () => {
  it('extracts valid Passport Public IDs from direct input, URLs, and query strings', () => {
    // Direct ID
    expect(extractPassportIdFromInput('FS-8X29KQ')).toBe('FS-8X29KQ');
    expect(extractPassportIdFromInput('fs-mh742p')).toBe('FS-MH742P');

    // Path URL
    expect(
      extractPassportIdFromInput(
        'https://kansas-displays-export-amplifier.trycloudflare.com/passport/FS-8X29KQ'
      )
    ).toBe('FS-8X29KQ');

    // Query URL
    expect(
      extractPassportIdFromInput(
        'https://kansas-displays-export-amplifier.trycloudflare.com/?passport=FS-8X29KQ'
      )
    ).toBe('FS-8X29KQ');

    // Localhost URL
    expect(
      extractPassportIdFromInput('http://localhost:5173/passport/FS-MH742P?source=qr')
    ).toBe('FS-MH742P');

    // Non-passport input
    expect(extractPassportIdFromInput('hello-world')).toBeNull();
    expect(extractPassportIdFromInput('')).toBeNull();
  });

  it('strictly counts only eligible buyer interests (minScore <= currentScore) toward pre-booked percentage', () => {
    // Tomato passport FS-8X29KQ has score 83 and 150 Quintals total
    const stats = dataService.getPassportPreBookingStats('FS-8X29KQ', 83);

    expect(stats.totalQuantity).toBe(150);
    // book-1 requires minScore 75 (75 <= 83: ELIGIBLE, 50 Qty)
    // book-2 requires minScore 90 (90 > 83: INELIGIBLE, 30 Qty)
    expect(stats.eligibleCount).toBeGreaterThanOrEqual(1);
    expect(stats.eligibleQuantity).toBe(50);
    // Pre-booked percentage should be 50 / 150 = 33%
    expect(stats.preBookedPercentage).toBe(33);

    // If score increases to 95, both interests become eligible
    const statsHighScore = dataService.getPassportPreBookingStats('FS-8X29KQ', 95);
    expect(statsHighScore.eligibleQuantity).toBe(80); // 50 + 30
    expect(statsHighScore.preBookedPercentage).toBe(53); // 80 / 150 = 53%
  });
});

