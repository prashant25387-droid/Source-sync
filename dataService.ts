import {
  UserProfile,
  Farm,
  CropRecord,
  CropLog,
  CropEvidence,
  PassportRecord,
  CropListing,
  BuyerRequirement,
  BookingRequest,
  BookingEvent,
} from '../types';
import { passportScoreService } from './passportScoreService';

// Sample realistic demo data matching FasalSetu pitch deck & requirements
const INITIAL_PROFILES: UserProfile[] = [
  {
    id: 'farmer-1',
    role: 'farmer',
    fullName: 'Ramesh Patel',
    publicDisplayName: 'Ramesh P. (Farmer)',
    preferredLanguage: 'en',
    email: 'ramesh.farmer@fasalsetu.in',
    phone: '+91 98765 43210',
    location: {
      state: 'Maharashtra',
      district: 'Nashik',
      locality: 'Niphad Taluka',
    },
    createdAt: '2026-09-01T08:00:00Z',
  },
  {
    id: 'buyer-1',
    role: 'buyer',
    fullName: 'AgriMart Procurement Ltd',
    publicDisplayName: 'AgriMart Sourcing',
    preferredLanguage: 'en',
    email: 'procurement@agrimart.co.in',
    phone: '+91 98220 11223',
    location: {
      state: 'Maharashtra',
      district: 'Mumbai',
      locality: 'APMC Vashi Hub',
    },
    createdAt: '2026-09-10T10:00:00Z',
  },
  {
    id: 'admin-1',
    role: 'admin',
    fullName: 'Dr. Sunita Deshmukh',
    publicDisplayName: 'KVK Agronomist & Reviewer',
    preferredLanguage: 'en',
    email: 'sunita.reviewer@kvk-agri.org',
    location: {
      state: 'Maharashtra',
      district: 'Nashik',
      locality: 'Krishi Vigyan Kendra',
    },
    createdAt: '2026-08-15T09:00:00Z',
  },
];

const INITIAL_FARMS: Farm[] = [
  {
    id: 'farm-1',
    farmerId: 'farmer-1',
    name: 'Saraswati Agri Farm (5 Acres)',
    state: 'Maharashtra',
    district: 'Nashik',
    locality: 'Niphad Village',
    area: 5,
    areaUnit: 'acres',
    soilType: 'Black Soil',
    irrigationMethod: 'Drip',
    waterAvailability: 'Medium',
    waterSource: 'Farm Pond & Borewell',
    waterStorageCapacityKL: 6000,
    createdAt: '2026-09-05T10:00:00Z',
  },
  {
    id: 'farm-2',
    farmerId: 'farmer-1',
    name: 'Godavari Riverbank Plot',
    state: 'Maharashtra',
    district: 'Nashik',
    locality: 'Panchavati Outskirts',
    area: 2.5,
    areaUnit: 'acres',
    soilType: 'Loamy Soil',
    irrigationMethod: 'Sprinkler',
    waterAvailability: 'High',
    waterSource: 'River Lift Irrigation',
    waterStorageCapacityKL: 3500,
    createdAt: '2026-09-20T11:00:00Z',
  },
];

const INITIAL_CROPS: CropRecord[] = [
  {
    id: 'crop-1',
    farmerId: 'farmer-1',
    farmId: 'farm-1',
    farmName: 'Saraswati Agri Farm',
    cropName: 'Chana (Bengal Gram)',
    cropNameHi: 'चना (देसी / JG-11)',
    variety: 'JG-11 Drought Tolerant',
    plantingDate: '2026-10-05',
    expectedHarvestDate: '2027-02-15',
    cultivatedArea: 3,
    cultivatedAreaUnit: 'acres',
    estimatedQuantity: 28,
    quantityUnit: 'Quintals',
    expectedPricePerUnit: 5800,
    growthStage: 'Vegetative Growth',
    status: 'Active',
    notes: 'Planted after Kharif moong. Drip irrigation lines installed.',
    publicId: 'FS-MH742P',
    createdAt: '2026-10-05T09:00:00Z',
    updatedAt: '2026-10-18T00:00:00Z',
  },
  {
    id: 'crop-2',
    farmerId: 'farmer-1',
    farmId: 'farm-1',
    farmName: 'Saraswati Agri Farm',
    cropName: 'Tomato (Hybrid)',
    cropNameHi: 'टमाटर (हाइब्रिड अभिनव)',
    variety: 'Abhinav F1',
    plantingDate: '2026-09-15',
    expectedHarvestDate: '2027-01-10',
    cultivatedArea: 1,
    cultivatedAreaUnit: 'acres',
    estimatedQuantity: 150,
    quantityUnit: 'Quintals',
    expectedPricePerUnit: 1450,
    growthStage: 'Flowering',
    status: 'Active',
    notes: 'Silver-black plastic mulching and drip fertigation system active.',
    publicId: 'FS-8X29KQ',
    createdAt: '2026-09-15T08:30:00Z',
    updatedAt: '2026-10-18T00:00:00Z',
  },
  {
    id: 'crop-3',
    farmerId: 'farmer-1',
    farmId: 'farm-1',
    farmName: 'Saraswati Agri Farm',
    cropName: 'Mustard (Sarson)',
    cropNameHi: 'सरसों (पूसा बोल्ड)',
    variety: 'Pusa Bold',
    plantingDate: '2026-10-12',
    expectedHarvestDate: '2027-02-25',
    cultivatedArea: 1,
    cultivatedAreaUnit: 'acres',
    estimatedQuantity: 8,
    quantityUnit: 'Quintals',
    expectedPricePerUnit: 5600,
    growthStage: 'Germination & Establishment',
    status: 'Active',
    notes: 'Line sowing with 45cm spacing.',
    publicId: 'FS-MU993R',
    createdAt: '2026-10-12T07:00:00Z',
    updatedAt: '2026-10-18T00:00:00Z',
  },
];

const INITIAL_LOGS: CropLog[] = [
  {
    id: 'log-1',
    cropRecordId: 'crop-2',
    farmerId: 'farmer-1',
    activityType: 'Irrigation',
    activityDate: '2026-09-16T07:00:00Z',
    waterVolumeKL: 80,
    description: 'Post-transplanting light drip irrigation cycle (2 hours).',
    notes: 'Moisture reached root zone evenly.',
    createdAt: '2026-09-16T08:00:00Z',
  },
  {
    id: 'log-2',
    cropRecordId: 'crop-2',
    farmerId: 'farmer-1',
    activityType: 'Fertilizer Application',
    activityDate: '2026-09-24T08:30:00Z',
    description: 'Applied 19:19:19 water-soluble NPK via fertigation tank.',
    notes: '5 kg/acre dosed in drip lines.',
    createdAt: '2026-09-24T09:00:00Z',
  },
  {
    id: 'log-3',
    cropRecordId: 'crop-2',
    farmerId: 'farmer-1',
    activityType: 'Irrigation',
    activityDate: '2026-10-02T06:30:00Z',
    waterVolumeKL: 110,
    description: 'Scheduled weekly drip irrigation cycle based on weather forecast.',
    createdAt: '2026-10-02T07:15:00Z',
  },
  {
    id: 'log-4',
    cropRecordId: 'crop-2',
    farmerId: 'farmer-1',
    activityType: 'Pest / Disease Observation',
    activityDate: '2026-10-08T10:00:00Z',
    description: 'Field inspection: light leaf miner activity on lower leaves.',
    notes: 'Below economic injury threshold. Neem oil spray scheduled.',
    createdAt: '2026-10-08T11:00:00Z',
  },
  {
    id: 'log-5',
    cropRecordId: 'crop-2',
    farmerId: 'farmer-1',
    activityType: 'Pest Control Action',
    activityDate: '2026-10-10T16:30:00Z',
    description: 'Applied organic cold-pressed Neem oil (10,000 ppm) at 3ml/L.',
    notes: 'Sprayed in late afternoon to protect pollinator bees.',
    createdAt: '2026-10-10T18:00:00Z',
  },
  {
    id: 'log-6',
    cropRecordId: 'crop-2',
    farmerId: 'farmer-1',
    activityType: 'Irrigation',
    activityDate: '2026-10-15T06:30:00Z',
    waterVolumeKL: 120,
    description: 'Flower-initiation drip cycle. Maintained root zone moisture.',
    createdAt: '2026-10-15T07:30:00Z',
  },
  {
    id: 'log-7',
    cropRecordId: 'crop-1',
    farmerId: 'farmer-1',
    activityType: 'Irrigation',
    activityDate: '2026-10-06T07:00:00Z',
    waterVolumeKL: 140,
    description: 'Pre-sowing rauni irrigation to charge root zone.',
    createdAt: '2026-10-06T08:00:00Z',
  },
  {
    id: 'log-8',
    cropRecordId: 'crop-1',
    farmerId: 'farmer-1',
    activityType: 'Growth Observation',
    activityDate: '2026-10-14T09:00:00Z',
    description: 'Healthy germination count across all 3 acres (over 92% emergence).',
    createdAt: '2026-10-14T10:00:00Z',
  },
];

// High quality realistic images for demo crop evidence
const INITIAL_EVIDENCE: CropEvidence[] = [
  {
    id: 'ev-1',
    cropRecordId: 'crop-2',
    farmerId: 'farmer-1',
    cropName: 'Tomato (Hybrid)',
    storagePath: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=800&q=80',
    category: 'Growth Documentation',
    description: 'Tomato crop at 30 days after transplanting with silver mulching and healthy canopy.',
    captureDate: '2026-10-05',
    uploadDate: '2026-10-05T14:30:00Z',
    growthStage: 'Vegetative Growth',
    reviewStatus: 'Approved as Supporting Evidence',
    reviewerId: 'admin-1',
    reviewerName: 'Dr. Sunita Deshmukh (KVK)',
    reviewedAt: '2026-10-07T11:00:00Z',
    reviewNote: 'Clear canopy development. Mulch and drip lateral layout verified consistent with log records.',
    publicSharingEnabled: true,
    notes: 'Photograph captured on mobile camera in bright natural morning sunlight.',
    createdAt: '2026-10-05T14:30:00Z',
  },
  {
    id: 'ev-2',
    cropRecordId: 'crop-2',
    farmerId: 'farmer-1',
    cropName: 'Tomato (Hybrid)',
    storagePath: 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?auto=format&fit=crop&w=800&q=80',
    category: 'Flowering / Fruiting Progress',
    description: 'First flush of bright yellow flowers and early fruit setting on secondary branches.',
    captureDate: '2026-10-16',
    uploadDate: '2026-10-16T12:00:00Z',
    growthStage: 'Flowering',
    reviewStatus: 'Pending Review',
    publicSharingEnabled: true,
    notes: 'Close-up shot of flowering clusters. No blossom end rot observed.',
    createdAt: '2026-10-16T12:00:00Z',
  },
  {
    id: 'ev-3',
    cropRecordId: 'crop-1',
    farmerId: 'farmer-1',
    cropName: 'Chana (Bengal Gram)',
    storagePath: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80',
    category: 'Crop Identification',
    description: 'Chana seedlings establishing well in black cotton soil under drip lines.',
    captureDate: '2026-10-15',
    uploadDate: '2026-10-15T16:00:00Z',
    growthStage: 'Germination & Establishment',
    reviewStatus: 'Approved as Supporting Evidence',
    reviewerId: 'admin-1',
    reviewerName: 'Dr. Sunita Deshmukh (KVK)',
    reviewedAt: '2026-10-16T09:30:00Z',
    reviewNote: 'Germination rate and crop spacing match stated planting plan.',
    publicSharingEnabled: true,
    createdAt: '2026-10-15T16:00:00Z',
  },
];

const INITIAL_LISTINGS: CropListing[] = [
  {
    id: 'list-1',
    farmerId: 'farmer-1',
    farmerName: 'Ramesh Patel',
    publicDisplayName: 'Ramesh P. (Niphad, Nashik)',
    cropRecordId: 'crop-2',
    passportRecordId: 'pass-2',
    publicPassportId: 'FS-8X29KQ',
    cropName: 'Tomato (Hybrid)',
    cropNameHi: 'टमाटर',
    variety: 'Abhinav F1',
    quantityAvailable: 150,
    quantityUnit: 'Quintals',
    expectedPrice: 1450,
    expectedHarvestDate: '2027-01-10',
    generalLocation: 'Nashik, Maharashtra',
    publicDescription: 'Drip-irrigated premium hybrid table tomatoes. Documented organic neem spray and soil mulching. Verified growth photos available on Crop Passport.',
    passportScore: 83,
    evidenceSummary: {
      photoCount: 2,
      approvedEvidenceCount: 1,
      hasRecentLog: true,
      evidenceStatus: 'Approved as Supporting Evidence',
    },
    sampleImageUrl: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=600&q=80',
    status: 'Available',
    createdAt: '2026-10-10T10:00:00Z',
    updatedAt: '2026-10-18T00:00:00Z',
  },
  {
    id: 'list-2',
    farmerId: 'farmer-1',
    farmerName: 'Ramesh Patel',
    publicDisplayName: 'Ramesh P. (Niphad, Nashik)',
    cropRecordId: 'crop-1',
    passportRecordId: 'pass-1',
    publicPassportId: 'FS-MH742P',
    cropName: 'Chana (Bengal Gram)',
    cropNameHi: 'चना',
    variety: 'JG-11 Desi',
    quantityAvailable: 28,
    quantityUnit: 'Quintals',
    expectedPrice: 5800,
    expectedHarvestDate: '2027-02-15',
    generalLocation: 'Nashik, Maharashtra',
    publicDescription: 'High-protein JG-11 Chana grown with strict water budget tracking. Clean seed source and photo-documented field emergence.',
    passportScore: 78,
    evidenceSummary: {
      photoCount: 1,
      approvedEvidenceCount: 1,
      hasRecentLog: true,
      evidenceStatus: 'Approved as Supporting Evidence',
    },
    sampleImageUrl: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=600&q=80',
    status: 'Available',
    createdAt: '2026-10-15T11:00:00Z',
    updatedAt: '2026-10-18T00:00:00Z',
  },
];

const INITIAL_BUYER_REQUIREMENTS: BuyerRequirement[] = [
  {
    id: 'req-1',
    buyerId: 'buyer-1',
    buyerName: 'AgriMart Procurement Ltd',
    cropName: 'Tomato (Hybrid)',
    quantity: 100,
    quantityUnit: 'Quintals',
    targetPrice: 1500,
    requiredDate: '2027-01-15',
    location: 'Nashik, Maharashtra',
    minPassportScore: 70,
    requirements: 'Grade-A firmness, minimum 70 Passport Score with verified irrigation logs.',
    status: 'Open',
    createdAt: '2026-10-12T09:00:00Z',
  },
  {
    id: 'req-2',
    buyerId: 'buyer-1',
    buyerName: 'AgriMart Procurement Ltd',
    cropName: 'Chana (Bengal Gram)',
    quantity: 50,
    quantityUnit: 'Quintals',
    targetPrice: 5900,
    requiredDate: '2027-02-20',
    location: 'Nashik, Maharashtra',
    minPassportScore: 65,
    requirements: 'Well-dried Desi Chana with documented harvest date.',
    status: 'Open',
    createdAt: '2026-10-14T14:00:00Z',
  },
];

const INITIAL_BOOKING_REQUESTS: BookingRequest[] = [
  {
    id: 'book-1',
    buyerId: 'buyer-1',
    buyerName: 'AgriMart Procurement Ltd',
    farmerId: 'farmer-1',
    listingId: 'list-1',
    publicPassportId: 'FS-8X29KQ',
    cropName: 'Tomato (Hybrid)',
    requestedQuantity: 50,
    quantityUnit: 'Quintals',
    proposedPrice: 1450,
    deliveryDate: '2027-01-12',
    deliveryLocation: 'APMC Nashik Cold Storage Bay 4',
    minPassportScore: 75,
    message: 'We inspected your Crop Passport (Score 83) and approved growth evidence. We would like to pre-book 50 Quintals at your listed price.',
    status: 'Submitted',
    createdAt: '2026-10-16T15:00:00Z',
    updatedAt: '2026-10-16T15:00:00Z',
  },
  {
    id: 'book-2',
    buyerId: 'buyer-2',
    buyerName: 'Organic Harvest Exporters',
    farmerId: 'farmer-1',
    listingId: 'list-1',
    publicPassportId: 'FS-8X29KQ',
    cropName: 'Tomato (Hybrid)',
    requestedQuantity: 30,
    quantityUnit: 'Quintals',
    proposedPrice: 1550,
    deliveryDate: '2027-01-20',
    deliveryLocation: 'Vashi APMC Terminal 2',
    minPassportScore: 90,
    message: 'Export lot requirement. Requires minimum 90 Passport score with organic certification.',
    status: 'Submitted',
    createdAt: '2026-10-17T11:00:00Z',
    updatedAt: '2026-10-17T11:00:00Z',
  },
];

const DB_KEY = 'fasalsetu_db_v1';

export class DataService {
  private profiles: UserProfile[] = [];
  private farms: Farm[] = [];
  private crops: CropRecord[] = [];
  private logs: CropLog[] = [];
  private evidence: CropEvidence[] = [];
  private passports: PassportRecord[] = [];
  private listings: CropListing[] = [];
  private requirements: BuyerRequirement[] = [];
  private bookings: BookingRequest[] = [];
  private bookingEvents: BookingEvent[] = [];

  constructor() {
    this.load();
  }

  private load() {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      this.resetToDefaults();
      return;
    }
    try {
      const stored = localStorage.getItem(DB_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.profiles = parsed.profiles || INITIAL_PROFILES;
        this.farms = parsed.farms || INITIAL_FARMS;
        this.crops = parsed.crops || INITIAL_CROPS;
        this.logs = parsed.logs || INITIAL_LOGS;
        this.evidence = parsed.evidence || INITIAL_EVIDENCE;
        this.listings = parsed.listings || INITIAL_LISTINGS;
        this.requirements = parsed.requirements || INITIAL_BUYER_REQUIREMENTS;
        this.bookings = parsed.bookings || INITIAL_BOOKING_REQUESTS;
        this.passports = parsed.passports || [];
      } else {
        this.resetToDefaults();
      }
    } catch (e) {
      console.warn('Failed to parse local storage, resetting to defaults:', e);
      this.resetToDefaults();
    }

    // Ensure passports are calculated for all crops
    this.ensurePassports();
  }

  public resetToDefaults() {
    this.profiles = [...INITIAL_PROFILES];
    this.farms = [...INITIAL_FARMS];
    this.crops = [...INITIAL_CROPS];
    this.logs = [...INITIAL_LOGS];
    this.evidence = [...INITIAL_EVIDENCE];
    this.listings = [...INITIAL_LISTINGS];
    this.requirements = [...INITIAL_BUYER_REQUIREMENTS];
    this.bookings = [...INITIAL_BOOKING_REQUESTS];
    this.ensurePassports();
    this.save();
  }

  private save() {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return;
    }
    try {
      const state = {
        profiles: this.profiles,
        farms: this.farms,
        crops: this.crops,
        logs: this.logs,
        evidence: this.evidence,
        passports: this.passports,
        listings: this.listings,
        requirements: this.requirements,
        bookings: this.bookings,
        bookingEvents: this.bookingEvents,
      };
      localStorage.setItem(DB_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Storage quota exceeded or error saving:', e);
    }
  }

  private ensurePassports() {
    this.crops.forEach(crop => {
      let pass = this.passports.find(p => p.cropRecordId === crop.id);
      const breakdown = passportScoreService.calculateScore(crop, this.logs, this.evidence);

      if (!pass) {
        pass = {
          id: `pass-${crop.id}`,
          cropRecordId: crop.id,
          farmerId: crop.farmerId,
          publicId: crop.publicId,
          publicSharingEnabled: true,
          score: breakdown.totalScore,
          scoreBreakdown: breakdown,
          scoreMethodVersion: breakdown.scoringVersion,
          scoreCalculatedAt: breakdown.calculatedAt,
          createdAt: crop.createdAt,
          updatedAt: new Date().toISOString(),
        };
        this.passports.push(pass);
      } else {
        pass.score = breakdown.totalScore;
        pass.scoreBreakdown = breakdown;
        pass.scoreCalculatedAt = breakdown.calculatedAt;
        pass.updatedAt = new Date().toISOString();
      }
    });
  }

  // ---- Query & Mutation Methods ----

  public getProfiles() { return this.profiles; }
  public getFarms(farmerId?: string) {
    return farmerId ? this.farms.filter(f => f.farmerId === farmerId) : this.farms;
  }
  public getFarm(id: string) { return this.farms.find(f => f.id === id); }
  public addFarm(farm: Omit<Farm, 'id' | 'createdAt'>): Farm {
    const newFarm: Farm = {
      ...farm,
      id: `farm-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.farms.unshift(newFarm);
    this.save();
    return newFarm;
  }

  public getCrops(farmerId?: string) {
    return farmerId ? this.crops.filter(c => c.farmerId === farmerId) : this.crops;
  }
  public getCrop(id: string) { return this.crops.find(c => c.id === id); }
  public getCropByPublicId(publicId: string) { return this.crops.find(c => c.publicId === publicId); }

  public addCrop(crop: Omit<CropRecord, 'id' | 'publicId' | 'createdAt' | 'updatedAt'>): CropRecord {
    const publicId = `FS-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const newCrop: CropRecord = {
      ...crop,
      id: `crop-${Date.now()}`,
      publicId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.crops.unshift(newCrop);
    this.ensurePassports();
    this.save();
    return newCrop;
  }

  public updateCrop(id: string, updates: Partial<CropRecord>): CropRecord | null {
    const idx = this.crops.findIndex(c => c.id === id);
    if (idx === -1) return null;
    this.crops[idx] = { ...this.crops[idx], ...updates, updatedAt: new Date().toISOString() };
    this.ensurePassports();
    this.save();
    return this.crops[idx];
  }

  public getLogs(cropId?: string) {
    return cropId ? this.logs.filter(l => l.cropRecordId === cropId) : this.logs;
  }

  public addLog(log: Omit<CropLog, 'id' | 'createdAt'>): CropLog {
    const newLog: CropLog = {
      ...log,
      id: `log-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.logs.unshift(newLog);
    this.ensurePassports();
    this.save();
    return newLog;
  }

  public getEvidence(cropId?: string) {
    return cropId ? this.evidence.filter(e => e.cropRecordId === cropId) : this.evidence;
  }

  public addEvidence(ev: Omit<CropEvidence, 'id' | 'createdAt'>): CropEvidence {
    const newEv: CropEvidence = {
      ...ev,
      id: `ev-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.evidence.unshift(newEv);
    this.ensurePassports();
    this.save();
    return newEv;
  }

  public reviewEvidence(
    id: string,
    reviewerId: string,
    reviewerName: string,
    status: CropEvidence['reviewStatus'],
    note?: string
  ): CropEvidence | null {
    const ev = this.evidence.find(e => e.id === id);
    if (!ev) return null;
    ev.reviewStatus = status;
    ev.reviewerId = reviewerId;
    ev.reviewerName = reviewerName;
    ev.reviewedAt = new Date().toISOString();
    ev.reviewNote = note;
    this.ensurePassports();
    this.save();
    return ev;
  }

  public getPassport(cropRecordId: string): PassportRecord | null {
    this.ensurePassports();
    return this.passports.find(p => p.cropRecordId === cropRecordId) || null;
  }

  public getPassportByPublicId(publicId: string): PassportRecord | null {
    this.ensurePassports();
    return this.passports.find(p => p.publicId === publicId) || null;
  }

  public setPassportPublicSharing(publicId: string, enabled: boolean): boolean {
    const pass = this.passports.find(p => p.publicId === publicId);
    if (!pass) return false;
    pass.publicSharingEnabled = enabled;
    pass.updatedAt = new Date().toISOString();
    this.save();
    return true;
  }

  public getListings(): CropListing[] {
    return this.listings;
  }

  public addListing(listing: Omit<CropListing, 'id' | 'createdAt' | 'updatedAt'>): CropListing {
    const newListing: CropListing = {
      ...listing,
      id: `list-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.listings.unshift(newListing);
    this.save();
    return newListing;
  }

  public getRequirements(): BuyerRequirement[] {
    return this.requirements;
  }

  public addRequirement(req: Omit<BuyerRequirement, 'id' | 'createdAt'>): BuyerRequirement {
    const newReq: BuyerRequirement = {
      ...req,
      id: `req-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.requirements.unshift(newReq);
    this.save();
    return newReq;
  }

  public getBookings(userId?: string, role?: 'farmer' | 'buyer'): BookingRequest[] {
    if (!userId || !role) return this.bookings;
    if (role === 'farmer') return this.bookings.filter(b => b.farmerId === userId);
    return this.bookings.filter(b => b.buyerId === userId);
  }

  public createBooking(booking: Omit<BookingRequest, 'id' | 'status' | 'createdAt' | 'updatedAt'>): { success: boolean; message: string; booking?: BookingRequest } {
    const listing = this.listings.find(l => l.id === booking.listingId);
    if (!listing) {
      return { success: false, message: 'Crop listing not found' };
    }

    if (booking.requestedQuantity <= 0) {
      return { success: false, message: 'Requested quantity must be greater than zero' };
    }

    if (booking.requestedQuantity > listing.quantityAvailable) {
      return {
        success: false,
        message: `Requested quantity (${booking.requestedQuantity} ${listing.quantityUnit}) exceeds available quantity (${listing.quantityAvailable} ${listing.quantityUnit})`,
      };
    }

    const newBooking: BookingRequest = {
      ...booking,
      id: `book-${Date.now()}`,
      status: 'Submitted',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.bookings.unshift(newBooking);
    this.save();
    return { success: true, message: 'Booking request sent successfully!', booking: newBooking };
  }

  public updateBookingStatus(
    bookingId: string,
    newStatus: BookingRequest['status'],
    actorId: string,
    actorRole: 'farmer' | 'buyer' | 'admin',
    note?: string
  ): { success: boolean; message: string } {
    const booking = this.bookings.find(b => b.id === bookingId);
    if (!booking) return { success: false, message: 'Booking not found' };

    const listing = this.listings.find(l => l.id === booking.listingId);

    // Concurrency safe quantity check on Accept
    if (newStatus === 'Accepted' && booking.status !== 'Accepted') {
      if (!listing) return { success: false, message: 'Associated listing not found' };
      if (listing.quantityAvailable < booking.requestedQuantity) {
        return {
          success: false,
          message: `Cannot accept: Remaining available quantity (${listing.quantityAvailable}) is less than requested (${booking.requestedQuantity})`,
        };
      }
      // Deduct available quantity
      listing.quantityAvailable -= booking.requestedQuantity;
      if (listing.quantityAvailable === 0) {
        listing.status = 'Fully Booked';
      } else {
        listing.status = 'Partially Booked';
      }
    }

    // Return quantity if cancelled or rejected after previously accepted
    if (booking.status === 'Accepted' && (newStatus === 'Cancelled' || newStatus === 'Rejected')) {
      if (listing) {
        listing.quantityAvailable += booking.requestedQuantity;
        listing.status = 'Available';
      }
    }

    const prevStatus = booking.status;
    booking.status = newStatus;
    booking.statusNotes = note;
    booking.updatedAt = new Date().toISOString();

    this.bookingEvents.push({
      id: `evt-${Date.now()}`,
      bookingRequestId: booking.id,
      actorId,
      actorRole,
      previousStatus: prevStatus,
      newStatus,
      eventNote: note || `Status updated to ${newStatus}`,
      createdAt: new Date().toISOString(),
    });

    this.save();
    return { success: true, message: `Booking status changed to ${newStatus}` };
  }

  public getPurchaseInterests(publicPassportId: string): BookingRequest[] {
    return this.bookings.filter(b => 
      b.publicPassportId === publicPassportId || 
      (b.listingId && this.listings.find(l => l.id === b.listingId)?.publicPassportId === publicPassportId)
    );
  }

  public getPassportPreBookingStats(publicPassportId: string, currentScore: number) {
    const passport = this.getPassportByPublicId(publicPassportId);
    const crop = passport ? this.getCrop(passport.cropRecordId) : null;
    const totalQuantity = crop?.estimatedQuantity || 100;
    const unit = crop?.quantityUnit || 'Quintals';

    const interests = this.getPurchaseInterests(publicPassportId);

    const eligibleInterests = interests.filter(b => (b.minPassportScore ?? 0) <= currentScore);
    const ineligibleInterests = interests.filter(b => (b.minPassportScore ?? 0) > currentScore);

    const eligibleQuantity = eligibleInterests.reduce((sum, b) => sum + b.requestedQuantity, 0);
    const ineligibleQuantity = ineligibleInterests.reduce((sum, b) => sum + b.requestedQuantity, 0);

    const preBookedPercentage = Math.min(100, Math.round((eligibleQuantity / totalQuantity) * 100));

    return {
      totalQuantity,
      unit,
      preBookedPercentage,
      eligibleQuantity,
      ineligibleQuantity,
      eligibleCount: eligibleInterests.length,
      ineligibleCount: ineligibleInterests.length,
      interests,
      eligibleInterests,
      ineligibleInterests,
    };
  }

  public submitPurchaseInterest(interest: {
    publicPassportId: string;
    buyerName: string;
    buyerId?: string;
    requestedQuantity: number;
    offerPrice: number;
    desiredMonth: string;
    minPassportScore: number;
    message?: string;
  }): { success: boolean; message: string; booking: BookingRequest; isEligible: boolean } {
    const passport = this.getPassportByPublicId(interest.publicPassportId);
    if (!passport) {
      throw new Error('Passport not found');
    }
    const crop = this.getCrop(passport.cropRecordId);
    const listing = this.listings.find(l => l.publicPassportId === interest.publicPassportId);

    const isEligible = interest.minPassportScore <= passport.score;

    const newBooking: BookingRequest = {
      id: `book-${Date.now()}`,
      buyerId: interest.buyerId || 'buyer-guest',
      buyerName: interest.buyerName,
      farmerId: crop ? crop.farmerId : 'farmer-1',
      listingId: listing?.id,
      cropRecordId: crop?.id,
      publicPassportId: interest.publicPassportId,
      cropName: crop ? crop.cropName : 'Produce',
      requestedQuantity: interest.requestedQuantity,
      quantityUnit: (crop?.quantityUnit as any) || 'Quintals',
      proposedPrice: interest.offerPrice,
      deliveryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      deliveryLocation: 'APMC Hub / Direct Farm Gate',
      minPassportScore: interest.minPassportScore,
      desiredMonth: interest.desiredMonth,
      message: interest.message || `Pre-harvest purchase interest: ${interest.requestedQuantity} Quintals at ₹${interest.offerPrice}/Q. Min Score: ${interest.minPassportScore}.`,
      status: 'Submitted',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.bookings.unshift(newBooking);
    this.save();

    return {
      success: true,
      message: isEligible
        ? 'Purchase interest submitted and eligible! Added to pre-booked percentage.'
        : 'Purchase interest submitted. Note: Minimum required score is higher than current Passport score, so it is held as pending eligible verification.',
      booking: newBooking,
      isEligible,
    };
  }
}

export const dataService = new DataService();
