import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  SEED_CROPS,
  SEED_FARMER,
  SEED_PASSPORT_METRICS,
  SEED_LOGS,
  SEED_BUYERS,
  SEED_INTERESTS
} from '../src/data/seedData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'data', 'db.json');

// Ensure data directory exists
const dataDir = path.dirname(DB_FILE);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

function getInitialData() {
  return {
    farmers: [SEED_FARMER],
    plans: [
      {
        id: 'plan_01',
        farmerId: 'farmer_01',
        season: 'Rabi 2026',
        acres: 5,
        waterKL: 6000,
        crops: [
          { cropId: 'chana', plannedAcres: 2.50, plannedKL: 3000 },
          { cropId: 'tomato', plannedAcres: 2.46, plannedKL: 2952 }
        ],
        createdAt: '2026-10-01'
      }
    ],
    logs: [...SEED_LOGS],
    passports: [
      {
        ...SEED_PASSPORT_METRICS,
        isPublic: true,
        verifiedBy: null,
        verifiedAt: null,
        verifierOrg: null
      }
    ],
    buyers: [...SEED_BUYERS],
    demands: [...SEED_BUYERS],
    interests: [...SEED_INTERESTS],
    cropsReference: [...SEED_CROPS],
    weatherCache: {},
    mandiCache: {}
  };
}

export function readDb() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const initial = getInitialData();
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading db.json:', err);
    return getInitialData();
  }
}

export function writeDb(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing db.json:', err);
    return false;
  }
}

export function resetDb() {
  const initial = getInitialData();
  writeDb(initial);
  return initial;
}
