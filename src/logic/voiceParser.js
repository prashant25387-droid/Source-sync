/**
 * FasalSetu - Voice Log Parser
 * Parses Hindi, Hinglish, and English spoken phrases into structured farm log entries:
 * Examples:
 * - "सिंचाई 500" -> { type: 'irrigation', waterKL: 500, condition: 'healthy', resolved: true }
 * - "paani 2 hazar" -> { type: 'irrigation', waterKL: 2000, condition: 'healthy', resolved: true }
 * - "keeda laga, neem spray kiya" -> { type: 'crop_check', waterKL: 0, condition: 'problem', resolved: true, note: 'Neem spray applied' }
 * - "फसल में कीड़ा दिखा, दवाई का छिड़काव किया" -> { type: 'crop_check', waterKL: 0, condition: 'problem', resolved: true }
 * - "फसल पूरी तरह स्वस्थ है" -> { type: 'crop_check', waterKL: 0, condition: 'healthy', resolved: true }
 */

const HINDI_NUMBER_WORDS = [
  { words: ['एक हजार', 'ek hazar', 'ek hazaar', 'one thousand'], value: 1000 },
  { words: ['दो हजार', 'do hazar', 'do hazaar', 'two thousand'], value: 2000 },
  { words: ['तीन हजार', 'teen hazar', 'teen hazaar', 'three thousand'], value: 3000 },
  { words: ['चार हजार', 'chaar hazar', 'chaar hazaar', 'four thousand'], value: 4000 },
  { words: ['पाँच हजार', 'पांच हजार', 'paanch hazar', 'five thousand'], value: 5000 },
  { words: ['छह हजार', 'chhe hazar', 'six thousand'], value: 6000 },
  { words: ['सात हजार', 'saat hazar', 'seven thousand'], value: 7000 },
  { words: ['आठ हजार', 'aath hazar', 'eight thousand'], value: 8000 },
  { words: ['नौ हजार', 'nau hazar', 'nine thousand'], value: 9000 },
  { words: ['दस हजार', 'das hazar', 'ten thousand'], value: 10000 },
  { words: ['नौ सौ', 'nau sau', 'nine hundred'], value: 9000 },
  { words: ['आठ सौ', 'aath sau', 'eight hundred'], value: 800 },
  { words: ['सात सौ', 'saat sau', 'seven hundred'], value: 700 },
  { words: ['छह सौ', 'chhe sau', 'six hundred'], value: 600 },
  { words: ['पाँच सौ', 'पांच सौ', 'paanch sau', 'panch sau', 'five hundred'], value: 500 },
  { words: ['चार सौ', 'chaar sau', 'four hundred'], value: 400 },
  { words: ['तीन सौ', 'teen sau', 'three hundred'], value: 300 },
  { words: ['दो सौ', 'do sau', 'two hundred'], value: 200 },
  { words: ['एक सौ', 'ek sau', 'one hundred'], value: 100 },
  { words: ['हजार', 'hazar', 'hazaar', 'thousand'], value: 1000 },
  { words: ['सौ', 'sau', 'hundred'], value: 100 },
  { words: ['पचास', 'pachaas', 'fifty'], value: 50 },
  { words: ['बीस', 'bees', 'twenty'], value: 20 },
  { words: ['दस', 'das', 'ten'], value: 10 },
  { words: ['पांच', 'पाँच', 'paanch', 'five'], value: 5 }
];

export function extractWaterNumber(text = '') {
  const lower = text.toLowerCase().trim();

  // 1. Check for standard digits (e.g. 500, 2000, 1500)
  const digitMatch = lower.match(/\b\d+(\.\d+)?\b/);
  if (digitMatch) {
    const num = parseFloat(digitMatch[0]);
    // Check if followed by "hazar" e.g. "2 hazar"
    if (/(\d+)\s*(hazar|hazaar|हजार|thousand)/i.test(lower)) {
      return num * 1000;
    }
    // Check if followed by "sau" e.g. "5 sau"
    if (/(\d+)\s*(sau|सौ|hundred)/i.test(lower)) {
      return num * 100;
    }
    return num;
  }

  // 2. Check for Hindi / Hinglish spoken number words
  for (const item of HINDI_NUMBER_WORDS) {
    for (const phrase of item.words) {
      if (lower.includes(phrase)) {
        return item.value;
      }
    }
  }

  return 0;
}

export function parseVoiceLog(transcript = '') {
  if (!transcript || typeof transcript !== 'string') {
    return null;
  }

  const raw = transcript.trim();
  const lower = raw.toLowerCase();

  // Detect Log Type
  let type = 'crop_check'; // default
  if (/सिंचाई|पानी|water|irrigation|sinchai|paani|borewell|motor/i.test(lower)) {
    type = 'irrigation';
  } else if (/बुवाई|बोया|sowing|sowed|buwai|seed|beej/i.test(lower)) {
    type = 'sowing';
  } else if (/स्प्रे|spray|दवाई|neem|कीड़ा|pest|रोग|disease|जांच|check/i.test(lower)) {
    type = 'crop_check';
  }

  // Extract water amount if irrigation
  let waterKL = 0;
  if (type === 'irrigation') {
    waterKL = extractWaterNumber(lower);
    if (waterKL === 0) {
      // Default sensible irrigation if number missing
      waterKL = 500;
    }
  }

  // Detect Condition (healthy vs problem)
  let condition = 'healthy';
  const hasProblemKeyword = /कीड़ा|रोग|समस्या|पीला|सूख|pest|disease|problem|keeda|bimari|sukh|fungus|damage/i.test(lower);
  if (hasProblemKeyword) {
    condition = 'problem';
  }

  // Detect Resolution
  let resolved = condition === 'healthy';
  let note = raw;

  if (condition === 'problem') {
    const hasResolutionKeyword = /स्प्रे|दवाई|नीम|छिड़काव|हल|ठीक|spray|neem|medicine|resolved|theek|treated/i.test(lower);
    if (hasResolutionKeyword) {
      resolved = true;
      if (/neem|नीम/i.test(lower)) {
        note = 'कीट दिखा, नीम का तेल स्प्रे किया (Neem spray applied)';
      } else {
        note = 'रोग/कीट उपचार किया गया (Treated/Spray applied)';
      }
    } else {
      resolved = false;
      note = 'कीड़ा/रोग देखा गया (Pest/Issue observed - pending action)';
    }
  } else if (type === 'irrigation') {
    note = `${waterKL} KL सिंचाई की गई (${waterKL} KL irrigation completed)`;
  } else if (type === 'sowing') {
    note = 'सफल बुवाई पूर्ण (Sowing completed)';
  }

  return {
    type,
    waterKL,
    condition,
    resolved,
    note,
    originalSpeech: raw,
    date: new Date().toISOString().split('T')[0]
  };
}
