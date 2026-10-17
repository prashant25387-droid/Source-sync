import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { readDb, writeDb, resetDb } from './db.js';
import { calculatePassportScore } from '../src/logic/scoring.js';
import { rankCrops, optimizeWaterBudget, calculateStressTest } from '../src/logic/optimizer.js';
import { adjustWaterForRain } from '../src/logic/waterConverter.js';
import { parseVoiceLog } from '../src/logic/voiceParser.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// In-memory OTP storage for rapid demonstration (persists during server life)
const otpStore = new Map();

// Coordinates mapping for prominent agricultural districts in India
const DISTRICT_COORDS = {
  'Nashik': { lat: 19.9975, lon: 73.7898 },
  'Indore': { lat: 22.7196, lon: 75.8577 },
  'Karnal': { lat: 29.6857, lon: 76.9905 },
  'Jaipur': { lat: 26.9124, lon: 75.7873 },
  'Varanasi': { lat: 25.3176, lon: 82.9739 },
  'Pune': { lat: 18.5204, lon: 73.8567 },
  'Ludhiana': { lat: 30.9010, lon: 75.8573 }
};

// -------------------------------------------------------------
// 1. AUTHENTICATION & PROFILES (Phone + OTP)
// -------------------------------------------------------------
app.post('/api/auth/send-otp', (req, res) => {
  const { phone, role = 'farmer' } = req.body;
  if (!phone || phone.length < 10) {
    return res.status(400).json({ error: 'Valid 10-digit phone number is required' });
  }

  // Realistic mock OTP for instant demo testing
  const otp = '1234';
  otpStore.set(phone, { otp, expiresAt: Date.now() + 5 * 60 * 1000, role });

  return res.json({
    success: true,
    message: `OTP sent to ${phone}. For instant testing, use OTP: ${otp}`,
    mockOtp: otp
  });
});

app.post('/api/auth/verify-otp', (req, res) => {
  const { phone, otp, name, village, district, language = 'hi', landAcres = 5, waterSource = 'Tube-well' } = req.body;
  
  // Accept '1234' or matched OTP
  const record = otpStore.get(phone);
  if (otp !== '1234' && (!record || record.otp !== otp)) {
    return res.status(400).json({ error: 'Invalid or expired OTP. Use 1234 for testing.' });
  }

  const db = readDb();
  let farmer = db.farmers.find(f => f.phone === phone);

  if (!farmer) {
    farmer = {
      id: `farmer_${Date.now()}`,
      phone,
      name: name || `Farmer ${phone.slice(-4)}`,
      village: village || 'Village Kendra',
      district: district || 'Nashik',
      state: 'Maharashtra',
      landAcres: Number(landAcres) || 5,
      waterSource: waterSource || 'Tube-well',
      preferredLanguage: language,
      createdAt: new Date().toISOString()
    };
    db.farmers.push(farmer);
    writeDb(db);
  }

  return res.json({
    success: true,
    farmer,
    token: `token_${farmer.id}`
  });
});

app.get('/api/farmers', (req, res) => {
  const db = readDb();
  res.json(db.farmers);
});

app.put('/api/farmers/:id', (req, res) => {
  const db = readDb();
  const index = db.farmers.findIndex(f => f.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Farmer not found' });

  db.farmers[index] = { ...db.farmers[index], ...req.body };
  writeDb(db);
  res.json(db.farmers[index]);
});

// -------------------------------------------------------------
// 2. CROPS REFERENCE & MANDI PRICES
// -------------------------------------------------------------
app.get('/api/crops', (req, res) => {
  const db = readDb();
  const ranked = rankCrops(db.cropsReference);
  res.json(ranked);
});

app.get('/api/crops/:id/stress-test', (req, res) => {
  const db = readDb();
  const crop = db.cropsReference.find(c => c.id === req.params.id);
  if (!crop) return res.status(404).json({ error: 'Crop not found' });

  const dropPct = Number(req.query.dropPct) || 20;
  const result = calculateStressTest(crop, dropPct);
  res.json(result);
});

// -------------------------------------------------------------
// 3. WEATHER RAINFALL FORECAST (Open-Meteo Integration)
// -------------------------------------------------------------
app.get('/api/weather', async (req, res) => {
  const district = req.query.district || 'Nashik';
  const coords = DISTRICT_COORDS[district] || DISTRICT_COORDS['Nashik'];

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&daily=precipitation_sum,rain_sum&timezone=auto&forecast_days=14`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Weather fetch failed: ${response.statusText}`);
    const data = await response.json();

    const dailyRain = data.daily?.precipitation_sum || [];
    const totalRainMM = Math.round(dailyRain.reduce((a, b) => a + (b || 0), 0) * 10) / 10;

    const acres = Number(req.query.acres) || 5;
    const baseWaterKL = Number(req.query.waterKL) || 6000;
    const adjusted = adjustWaterForRain(baseWaterKL, totalRainMM, acres);

    res.json({
      district,
      latitude: coords.lat,
      longitude: coords.lon,
      forecastDays: 14,
      totalRainMM,
      dailyRain: data.daily?.time?.map((date, idx) => ({
        date,
        rainMM: dailyRain[idx] || 0
      })) || [],
      rainAdjustment: adjusted,
      source: 'Open-Meteo Global Forecasting Model',
      lastUpdated: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    });
  } catch (err) {
    // Graceful fallback with typical seasonal rainfall
    const fallbackRainMM = 25.0; // mm
    const acres = Number(req.query.acres) || 5;
    const baseWaterKL = Number(req.query.waterKL) || 6000;
    const adjusted = adjustWaterForRain(baseWaterKL, fallbackRainMM, acres);

    res.json({
      district,
      forecastDays: 14,
      totalRainMM: fallbackRainMM,
      rainAdjustment: adjusted,
      source: 'IMD / Agrometeorological Advisory (Cached Fallback)',
      lastUpdated: '18 Oct 2026, 06:00 AM',
      isFallback: true
    });
  }
});

// -------------------------------------------------------------
// 4. WATER-BUDGET OPTIMIZER (Linear Program)
// -------------------------------------------------------------
app.post('/api/optimize', (req, res) => {
  const { totalLand = 5, waterBudget = 6000, district = 'Nashik', season = 'Rabi' } = req.body;
  const db = readDb();
  const ranked = rankCrops(db.cropsReference);
  const plan = optimizeWaterBudget(ranked, Number(totalLand), Number(waterBudget));
  res.json(plan);
});

// -------------------------------------------------------------
// 5. CROP PASSPORT & LIVE SCORING
// -------------------------------------------------------------
function computePassportData(passportId) {
  const db = readDb();
  const passport = db.passports.find(p => p.id === passportId) || db.passports[0];
  const logs = db.logs; // All logs for this farm/plan

  const totalUsedWater = logs.reduce((sum, log) => sum + (Number(log.waterKL) || 0), 0);
  const issuesCount = logs.filter(l => l.condition === 'problem').length;
  const resolvedCount = logs.filter(l => l.condition === 'problem' && l.resolved).length;

  const scoreData = calculatePassportScore({
    plannedWater: passport.plannedWaterKL || 4386,
    usedWater: totalUsedWater,
    logsDone: logs.length,
    issuesCount,
    resolvedCount,
    plannedAcres: passport.plannedAcres || 2.50,
    sownAcres: passport.sownAcres || 2.46
  });

  return {
    ...passport,
    score: scoreData.totalScore,
    grade: scoreData.grade,
    breakdown: scoreData.breakdown,
    totalUsedWater,
    logsDone: logs.length,
    issuesCount,
    resolvedCount,
    logs
  };
}

app.get('/api/passports/:id', (req, res) => {
  const data = computePassportData(req.params.id);
  res.json(data);
});

app.put('/api/passports/:id/visibility', (req, res) => {
  const db = readDb();
  const index = db.passports.findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Passport not found' });

  db.passports[index].isPublic = Boolean(req.body.isPublic);
  writeDb(db);
  res.json({ success: true, isPublic: db.passports[index].isPublic });
});

app.post('/api/passports/:id/verify', (req, res) => {
  const { officerName, verifierOrg, notes } = req.body;
  const db = readDb();
  const index = db.passports.findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Passport not found' });

  db.passports[index].verifiedBy = officerName || 'Dr. A. K. Verma (KVK Scientist)';
  db.passports[index].verifiedAt = new Date().toISOString().split('T')[0];
  db.passports[index].verifierOrg = verifierOrg || 'KVK Nashik / Sahyadri FPO';
  db.passports[index].verificationNotes = notes || 'Field inspection confirmed drip layout and pest-free crop.';
  writeDb(db);

  res.json({
    success: true,
    passport: computePassportData(req.params.id)
  });
});

// -------------------------------------------------------------
// 6. LOGS (Manual & Voice Logging)
// -------------------------------------------------------------
app.get('/api/logs', (req, res) => {
  const db = readDb();
  res.json(db.logs);
});

app.post('/api/logs', (req, res) => {
  const { date, type, waterKL = 0, condition = 'healthy', resolved = true, note = '', photoUrl = null } = req.body;
  const db = readDb();

  const newLog = {
    id: `log_${Date.now()}`,
    date: date || new Date().toISOString().split('T')[0],
    type: type || 'irrigation',
    waterKL: Number(waterKL) || 0,
    condition: condition || 'healthy',
    resolved: Boolean(resolved),
    note: note || '',
    photoUrl: photoUrl || null,
    createdAt: new Date().toISOString()
  };

  db.logs.push(newLog);
  writeDb(db);

  // Return updated passport data immediately
  const updatedPassport = computePassportData(req.body.passportId || db.passports[0].id);
  res.json({ success: true, log: newLog, passport: updatedPassport });
});

app.post('/api/logs/parse-voice', (req, res) => {
  const { transcript } = req.body;
  const parsed = parseVoiceLog(transcript);
  res.json(parsed);
});

// -------------------------------------------------------------
// 7. BUYERS & DEMAND BOARD
// -------------------------------------------------------------
app.get('/api/buyers', (req, res) => {
  const db = readDb();
  res.json(db.buyers);
});

app.get('/api/demands', (req, res) => {
  const db = readDb();
  // Compute eligibility at current passport score
  const passport = computePassportData(db.passports[0].id);
  const currentScore = passport.score;

  const demands = db.buyers.map(b => ({
    ...b,
    isEligible: currentScore >= b.minScore
  }));

  // Tomato Pre-booked percentage: sum(qty of eligible tomato buyers) / expected_yield (240 Qtl)
  const expectedYield = passport.expectedYieldQtl || 240;
  const eligibleTomato = demands.filter(d => d.cropId === 'tomato' && d.isEligible);
  const eligibleQty = eligibleTomato.reduce((sum, d) => sum + d.qtyQtl, 0);
  const prebookedPct = Math.min(100, Math.round((eligibleQty / expectedYield) * 1000) / 10);

  res.json({
    demands,
    currentScore,
    currentGrade: passport.grade,
    expectedYield,
    prebookedPct,
    interests: db.interests
  });
});

app.post('/api/demands', (req, res) => {
  const { name, crop, cropId, qtyQtl, month, floorPrice, minScore, organization, type } = req.body;
  const db = readDb();

  const newDemand = {
    id: `buyer_${Date.now()}`,
    name: name || 'Institutional Buyer',
    organization: organization || name,
    crop: crop || 'Tomato',
    cropId: cropId || 'tomato',
    qtyQtl: Number(qtyQtl) || 50,
    month: month || 'Nov 2026',
    floorPrice: Number(floorPrice) || 1400,
    minScore: Number(minScore) || 70,
    type: type || 'Buyer'
  };

  db.buyers.push(newDemand);
  writeDb(db);

  res.json({ success: true, demand: newDemand });
});

// -------------------------------------------------------------
// 8. BUYER QR LINK INTERESTS
// -------------------------------------------------------------
app.get('/api/interests', (req, res) => {
  const db = readDb();
  res.json(db.interests);
});

app.post('/api/interests', (req, res) => {
  const { passportId, buyerName, qtyQtl, offerPrice, month, minScore } = req.body;
  const db = readDb();

  const newInterest = {
    id: `interest_${Date.now()}`,
    passportId: passportId || db.passports[0].id,
    buyerName: buyerName || 'Direct QR Buyer',
    qtyQtl: Number(qtyQtl) || 30,
    offerPrice: Number(offerPrice) || 1450,
    month: month || 'Nov 2026',
    minScore: Number(minScore) || 70,
    time: new Date().toLocaleString('en-IN', { hour12: false })
  };

  db.interests.push(newInterest);
  writeDb(db);

  res.json({ success: true, interest: newInterest });
});

// -------------------------------------------------------------
// 9. REMINDERS & NUDGES (Hindi & English)
// -------------------------------------------------------------
app.get('/api/reminders', (req, res) => {
  const db = readDb();
  const passport = computePassportData(db.passports[0].id);

  const reminders = [
    {
      id: 'rem_01',
      type: 'irrigation',
      urgency: 'high',
      titleHi: 'सिंचाई अलर्ट (Irrigation Nudge)',
      titleEn: 'Irrigation Nudge',
      bodyHi: 'अगले 3 दिनों में बारिश नहीं है। फसल में संतुलित नमी बनाए रखने के लिए 500 KL सिंचाई का समय है।',
      bodyEn: 'No rain forecast in next 3 days. Time to apply 500 KL irrigation to maintain optimal soil moisture.',
      action: 'Log Irrigation'
    },
    {
      id: 'rem_02',
      type: 'passport_score',
      urgency: 'medium',
      titleHi: 'पासपोर्ट स्कोर Nudge',
      titleEn: 'Passport Score Nudge',
      bodyHi: `आपका पासपोर्ट स्कोर ${passport.score} (${passport.grade}) है। स्वर्ण श्रेणी बनाए रखने के लिए 7 दिन में एक फोटो अपलोड करें।`,
      bodyEn: `Your passport score is ${passport.score} (${passport.grade}). Upload a farm photo within 7 days to maintain Gold grade.`,
      action: 'Take Photo'
    }
  ];

  res.json(reminders);
});

// -------------------------------------------------------------
// 10. SYSTEM RESET (For demo repeatability)
// -------------------------------------------------------------
app.post('/api/db/reset', (req, res) => {
  const initial = resetDb();
  res.json({ success: true, message: 'Database reset to seed demo state', data: initial });
});

// Serve frontend static files if built
const distDir = path.join(__dirname, '..', 'dist');
app.use(express.static(distDir));

app.use((req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  const indexPath = path.join(distDir, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(200).send('FasalSetu API Server is running. Run `npm run dev` to launch Vite.');
    }
  });
});

app.listen(PORT, () => {
  console.log(`🌾 FasalSetu server running at http://localhost:${PORT}`);
});
