import { ActivityType } from '../types';

export interface ParsedFarmLogResult {
  isValid: boolean;
  activityType: ActivityType;
  rawTranscript: string;
  language: 'hi' | 'en';
  numericValue?: number;
  waterVolumeKL?: number;
  pumpHours?: number;
  waterUnit?: 'KL' | 'Litres' | 'Hours' | 'Irrigations' | 'unknown';
  isWaterAmbiguous?: boolean;
  condition?: string;
  description: string;
  notes?: string;
  resolved?: boolean;
  clarificationNeeded?: {
    type: 'water_unit';
    numericValue: number;
    prompt: string;
    options: {
      unit: 'KL' | 'Litres' | 'Hours' | 'Irrigations';
      label: string;
      labelHi: string;
      conversionFactor?: number; // multiply by numericValue to get KL
    }[];
  };
}

/**
 * Hindi and Hinglish numeric words dictionary
 */
const HINDI_NUMERAL_WORDS: Record<string, number> = {
  // Pure Hindi
  'एक': 1,
  'दो': 2,
  'तीन': 3,
  'चार': 4,
  'पांच': 5,
  'पाँच': 5,
  'छह': 6,
  'सात': 7,
  'आठ': 8,
  'नौ': 9,
  'दस': 10,
  'सौ': 100,
  'डेढ़ सौ': 150,
  'दो सौ': 200,
  'ढाई सौ': 250,
  'तीन सौ': 300,
  'चार सौ': 400,
  'पांच सौ': 500,
  'पाँच सौ': 500,
  'हजार': 1000,
  'हज़ार': 1000,
  'एक हजार': 1000,
  'एक हज़ार': 1000,
  'डेढ़ हजार': 1500,
  'डेढ़ हज़ार': 1500,
  'दो हजार': 2000,
  'दो हज़ार': 2000,
  'ढाई हजार': 2500,
  'ढाई हज़ार': 2500,
  'तीन हजार': 3000,
  'तीन हज़ार': 3000,
  'चार हजार': 4000,
  'चार हज़ार': 4000,
  'पांच हजार': 5000,
  'पाँच हजार': 5000,
  'दस हजार': 10000,
  'दस हज़ार': 10000,

  // Hinglish
  'ek': 1,
  'do': 2,
  'teen': 3,
  'char': 4,
  'chaar': 4,
  'paanch': 5,
  'panch': 5,
  'chhah': 6,
  'saat': 7,
  'aath': 8,
  'nau': 9,
  'das': 10,
  'sau': 100,
  'so': 100,
  'paanch sau': 500,
  'paanch so': 500,
  'panch sau': 500,
  'panch so': 500,
  'hazar': 1000,
  'hazaar': 1000,
  'ek hazar': 1000,
  'ek hazaar': 1000,
  'dedh hazar': 1500,
  'do hazar': 2000,
  'do hazaar': 2000,
  'dhai hazar': 2500,
  'dhai hazaar': 2500,
  'teen hazar': 3000,
  'char hazar': 4000,
  'paanch hazar': 5000,
  'das hazar': 10000,
};

/**
 * Extracts numbers from text, prioritizing multi-word expressions like "दो हजार" or "paanch sau"
 * and digit + multiplier phrases like "2 hazar" or "5 sau"
 */
export function extractSpokenNumber(text: string): { value: number; matchStr: string } | null {
  const normalized = text.toLowerCase().trim();

  // 1. Try digit + word multiplier first (e.g. "2 hazar", "2 हजार", "5 sau", "5 सौ")
  const digitMultiplierMatch = normalized.match(/\b(\d+(?:\.\d+)?)\s*(hazar|hazaar|हजार|हज़ार|sau|so|सौ|k)?\b/i);
  if (digitMultiplierMatch) {
    const rawNum = parseFloat(digitMultiplierMatch[1]);
    const multiplierWord = (digitMultiplierMatch[2] || '').toLowerCase();

    if (!isNaN(rawNum)) {
      if (['hazar', 'hazaar', 'हजार', 'हज़ार', 'k'].includes(multiplierWord)) {
        return { value: rawNum * 1000, matchStr: digitMultiplierMatch[0] };
      }
      if (['sau', 'so', 'सौ'].includes(multiplierWord)) {
        return { value: rawNum * 100, matchStr: digitMultiplierMatch[0] };
      }
      // If it's just a raw number, but followed by another word, hold on if another rule matches,
      // but if no multiplier, we only return if there are no Hindi compound words
    }
  }

  // 2. Try compound multi-word Hindi/Hinglish numbers sorted by length descending
  const sortedWords = Object.keys(HINDI_NUMERAL_WORDS).sort((a, b) => b.length - a.length);
  for (const word of sortedWords) {
    const regex = new RegExp(`(^|\\s)${word}(\\s|$)`, 'i');
    if (regex.test(normalized)) {
      return { value: HINDI_NUMERAL_WORDS[word], matchStr: word };
    }
  }

  // 3. Fallback: Raw single digits without multiplier (e.g. "500", "2.5")
  if (digitMultiplierMatch) {
    const rawNum = parseFloat(digitMultiplierMatch[1]);
    if (!isNaN(rawNum)) {
      return { value: rawNum, matchStr: digitMultiplierMatch[1] };
    }
  }

  return null;
}

/**
 * Convert user-clarified water quantity into Kilolitres (1 KL = 1,000 Litres)
 */
export function convertToKL(
  value: number,
  unit: 'KL' | 'Litres' | 'Hours' | 'Irrigations',
  customPumpFlowKLPerHour: number = 30 // standard 5 HP farm pump flow ~30 KL/hr
): number {
  switch (unit) {
    case 'KL':
      return Math.round(value * 10) / 10;
    case 'Litres':
      return Math.round((value / 1000) * 10) / 10;
    case 'Hours':
      // Hours * pump flow rate in KL/hr
      return Math.round(value * customPumpFlowKLPerHour);
    case 'Irrigations':
      // 1 standard irrigation for 1 acre drip is ~70-80 KL
      return Math.round(value * 75);
    default:
      return value;
  }
}

/**
 * Pure speech parsing function for farm logs
 * Evaluates spoken Hindi, English, and Hinglish farming transcripts
 */
export function parseSpokenFarmLog(
  transcript: string,
  language: 'hi' | 'en' = 'hi'
): ParsedFarmLogResult {
  const clean = (transcript || '').trim();
  const lower = clean.toLowerCase();

  if (!clean || clean.length < 2) {
    return {
      isValid: false,
      activityType: 'Growth Observation',
      rawTranscript: transcript,
      language,
      description: clean || '',
    };
  }

  // 1. Identify Activity Type
  let activityType: ActivityType = 'Growth Observation';
  let isIrrigation = false;
  let isPest = false;
  let isFertilizer = false;
  let isWeather = false;
  let isHarvest = false;
  let isMaintenance = false;

  // Irrigation triggers
  if (
    lower.includes('सिंचाई') ||
    lower.includes('पानी') ||
    lower.includes('paani') ||
    lower.includes('pani') ||
    lower.includes('ड्रिप') ||
    lower.includes('drip') ||
    lower.includes('irrigation') ||
    lower.includes('irrigated') ||
    lower.includes('watered') ||
    lower.includes('sprinkler') ||
    lower.includes('स्प्रिंकलर')
  ) {
    isIrrigation = true;
    activityType = 'Irrigation';
  }

  // Pest / Disease triggers
  if (
    lower.includes('कीड़ा') ||
    lower.includes('कीड़े') ||
    lower.includes('keeda') ||
    lower.includes('kida') ||
    lower.includes('pest') ||
    lower.includes('disease') ||
    lower.includes('रोग') ||
    lower.includes('बीमारी') ||
    lower.includes('स्प्रे') ||
    lower.includes('spray') ||
    lower.includes('नीम') ||
    lower.includes('neem') ||
    lower.includes('दवा') ||
    lower.includes('fungicide') ||
    lower.includes('pesticide')
  ) {
    isPest = true;
    activityType = lower.includes('spray') || lower.includes('स्प्रे') || lower.includes('दवा')
      ? 'Pest Control Action'
      : 'Pest / Disease Observation';
  }

  // Fertilizer triggers
  if (
    lower.includes('खाद') ||
    lower.includes('यूरिया') ||
    lower.includes('urea') ||
    lower.includes('dap') ||
    lower.includes('डीएपी') ||
    lower.includes('fertilizer') ||
    lower.includes('पोषक') ||
    lower.includes('nutrient') ||
    lower.includes('npk')
  ) {
    isFertilizer = true;
    activityType = 'Fertilizer Application';
  }

  // Weather triggers
  if (
    lower.includes('बारिश') ||
    lower.includes('barish') ||
    lower.includes('rain') ||
    lower.includes('ओले') ||
    lower.includes('weather') ||
    lower.includes('धूप') ||
    lower.includes('ठंड')
  ) {
    isWeather = true;
    activityType = 'Growth Observation';
  }

  // Harvest triggers
  if (
    lower.includes('कटाई') ||
    lower.includes('हार्वेस्ट') ||
    lower.includes('harvest') ||
    lower.includes('तुड़ाई') ||
    lower.includes('tudai')
  ) {
    isHarvest = true;
    activityType = 'Harvest Activity';
  }

  // Maintenance triggers
  if (
    lower.includes('निराई') ||
    lower.includes('गुड़ाई') ||
    lower.includes('weeding') ||
    lower.includes('maintenance')
  ) {
    isMaintenance = true;
    activityType = 'Crop Maintenance';
  }

  // 2. Identify Problem & Resolution for Pest/Care
  let condition: string | undefined = undefined;
  let resolved: boolean | undefined = undefined;

  if (isPest) {
    condition = 'Problem observed';
    // Check if resolved: "ठीक हो गई", "समस्या खत्म", "problem resolved", "cured", "fixed"
    if (
      lower.includes('ठीक हो गई') ||
      lower.includes('ठीक हो गया') ||
      lower.includes('समस्या ठीक') ||
      lower.includes('resolved') ||
      lower.includes('cured') ||
      lower.includes('problem fixed') ||
      lower.includes('thik ho gaya') ||
      lower.includes('theek ho gayi')
    ) {
      resolved = true;
    } else {
      resolved = false; // unconfirmed unless explicitly stated
    }
  }

  if (isWeather) {
    condition = 'Rainfall reported';
  }

  // 3. Extract numbers and units
  const extractedNum = extractSpokenNumber(clean);
  let numericValue = extractedNum ? extractedNum.value : undefined;
  let waterUnit: 'KL' | 'Litres' | 'Hours' | 'Irrigations' | 'unknown' = 'unknown';
  let isWaterAmbiguous = false;
  let waterVolumeKL: number | undefined = undefined;
  let pumpHours: number | undefined = undefined;

  // Check for pump duration (e.g. "2 hours", "2 घंटे", "दो घंटे")
  const hourMatch = lower.match(/(\d+|एक|दो|तीन|चार|पाँच|पांच|ek|do|teen|char|paanch)\s*(hour|hours|घंटे|घंटा|ghante|ghanta)/i);
  if (hourMatch) {
    const hrNum = extractSpokenNumber(hourMatch[1])?.value || 1;
    pumpHours = hrNum;
    waterUnit = 'Hours';
    isWaterAmbiguous = true; // water volume not yet known without pump capacity
  }

  // Check explicit water units
  if (lower.includes('किलोलीटर') || lower.includes('kl') || lower.includes('केएल')) {
    waterUnit = 'KL';
    if (numericValue) waterVolumeKL = numericValue;
    isWaterAmbiguous = false;
  } else if (lower.includes('लीटर') || lower.includes('litre') || lower.includes('liter')) {
    waterUnit = 'Litres';
    if (numericValue) waterVolumeKL = Math.round((numericValue / 1000) * 10) / 10;
    isWaterAmbiguous = false;
  }

  // If irrigation was detected and a number was found without explicit unit
  if (isIrrigation && numericValue && waterUnit === 'unknown') {
    isWaterAmbiguous = true;
  }

  // 4. Generate Meaningful Description & Notes
  let description = clean;
  let notes: string | undefined = undefined;

  if (isPest) {
    if (lower.includes('neem') || lower.includes('नीम')) {
      description = language === 'hi'
        ? 'कीट देखा गया; नीम के अर्क का स्प्रे किया गया'
        : 'Pest observed; neem spray applied';
      if (resolved) {
        notes = language === 'hi'
          ? 'किसान द्वारा पुष्टि: कीट समस्या का समाधान हो गया।'
          : 'Farmer confirmed: Pest condition resolved.';
      }
    } else {
      description = language === 'hi' ? 'कीट/रोग नियंत्रण कार्रवाई' : 'Pest and disease control action';
    }
  } else if (isIrrigation) {
    if (pumpHours) {
      description = language === 'hi'
        ? `${pumpHours} घंटे ड्रिप/पंप सिंचाई`
        : `${pumpHours}-hour pump irrigation cycle`;
      notes = language === 'hi'
        ? 'पंप अवधि दर्ज। जल बजट गणना हेतु पंप क्षमता की पुष्टि आवश्यक।'
        : 'Pump hours recorded. Awaiting pump capacity for exact KL water calculation.';
    } else if (numericValue) {
      description = language === 'hi'
        ? `सिंचाई कार्य: ${numericValue} ${waterUnit !== 'unknown' ? waterUnit : 'इकाई'}`
        : `Irrigation: ${numericValue} ${waterUnit !== 'unknown' ? waterUnit : 'units'}`;
    } else {
      description = language === 'hi' ? 'खेत में सिंचाई कार्य' : 'Field irrigation activity';
    }
  } else if (isWeather) {
    description = language === 'hi' ? 'बारिश और मौसम अवलोकन' : 'Rainfall & weather observation';
    notes = language === 'hi' ? 'बारिश दर्ज की गई। मिट्टी में नमी उपलब्ध।' : 'Rainfall reported in field area.';
  }

  // 5. Clarification Needed structure
  let clarificationNeeded: ParsedFarmLogResult['clarificationNeeded'] = undefined;
  if (isIrrigation && isWaterAmbiguous && (numericValue || pumpHours)) {
    const val = numericValue || pumpHours || 1;
    clarificationNeeded = {
      type: 'water_unit',
      numericValue: val,
      prompt: language === 'hi'
        ? `आपने ${val} बताया है। यह कितने पानी की मात्रा है?`
        : `You mentioned ${val}. What is the water unit?`,
      options: [
        {
          unit: 'KL',
          label: 'Kilolitres (KL)',
          labelHi: 'किलोलीटर (KL - 1,000 लीटर)',
          conversionFactor: 1,
        },
        {
          unit: 'Litres',
          label: 'Litres (L)',
          labelHi: 'लीटर (Litres)',
          conversionFactor: 0.001,
        },
        {
          unit: 'Hours',
          label: 'Pump Hours (~30 KL/hr)',
          labelHi: 'पंप के घंटे (~30 KL प्रति घंटा)',
          conversionFactor: 30,
        },
        {
          unit: 'Irrigations',
          label: 'Number of Irrigations (~75 KL/ac)',
          labelHi: 'सिंचाई की संख्या (~75 KL प्रति एकड़)',
          conversionFactor: 75,
        },
      ],
    };
  }

  // If transcript is gibberish or has no farming relevance
  const hasFarmingKeywords =
    isIrrigation || isPest || isFertilizer || isWeather || isHarvest || isMaintenance ||
    lower.includes('फसल') || lower.includes('crop') || lower.includes('khet') || lower.includes('खेत') ||
    numericValue !== undefined;

  return {
    isValid: hasFarmingKeywords,
    activityType,
    rawTranscript: transcript,
    language,
    numericValue,
    waterVolumeKL,
    pumpHours,
    waterUnit,
    isWaterAmbiguous,
    condition,
    description,
    notes,
    resolved,
    clarificationNeeded,
  };
}
