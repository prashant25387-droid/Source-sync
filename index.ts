export type UserRole = 'farmer' | 'buyer' | 'admin' | 'public';

export type Language = 'en' | 'hi';

export interface UserProfile {
  id: string;
  role: UserRole;
  fullName: string;
  preferredLanguage: Language;
  publicDisplayName: string;
  email?: string;
  phone?: string;
  location?: {
    state: string;
    district: string;
    locality?: string;
  };
  createdAt: string;
}

export interface Farm {
  id: string;
  farmerId: string;
  name: string;
  state: string;
  district: string;
  locality?: string;
  area: number; // in acres or hectares
  areaUnit: 'acres' | 'hectares';
  soilType: string;
  irrigationMethod: 'Drip' | 'Sprinkler' | 'Canal / Flood' | 'Borewell / Tube' | 'Rainfed';
  waterAvailability: 'High' | 'Medium' | 'Low' | 'Critical / Scanty';
  waterSource?: string;
  waterStorageCapacityKL?: number; // Kilolitres available for season
  createdAt: string;
}

export type GrowthStage = 
  | 'Land Preparation'
  | 'Sowing / Planting'
  | 'Germination & Establishment'
  | 'Vegetative Growth'
  | 'Flowering'
  | 'Fruiting / Grain Formation'
  | 'Maturity'
  | 'Harvested';

export interface CropReference {
  id: string;
  cropName: string;
  nameHi: string;
  category: 'Pulses' | 'Cereals' | 'Oilseeds' | 'Vegetables' | 'Cash Crops';
  suitableSeasons: ('Kharif' | 'Rabi' | 'Zaid')[];
  suitableSoilTypes: string[];
  indicativeWaterReqKLPerAcre: number; // KL per acre (1 acre-inch = ~102.8 KL)
  indicativeYieldPerAcreQuintals: number; // Quintals per acre
  indicativeCostPerAcreRs: number; // Cost of cultivation
  indicativeMarketPricePerQuintalRs: number; // Assumed mandi price
  durationDays: number;
  expectedHarvestWindow: string;
  suitabilityNotes: string;
  risks: string[];
  sourceOrAssumption: string;
}

export interface CropRecord {
  id: string;
  farmerId: string;
  farmId: string;
  farmName?: string;
  cropName: string;
  cropNameHi?: string;
  variety?: string;
  plantingDate: string;
  expectedHarvestDate: string;
  actualHarvestDate?: string;
  cultivatedArea: number;
  cultivatedAreaUnit: 'acres' | 'hectares';
  estimatedQuantity: number;
  quantityUnit: 'Quintals' | 'Tonnes' | 'Kg';
  expectedPricePerUnit: number;
  growthStage: GrowthStage;
  status: 'Active' | 'Harvested' | 'Archived';
  notes?: string;
  publicId: string; // Passport reference ID e.g. FS-8X29KQ
  createdAt: string;
  updatedAt: string;
}

export type ActivityType = 
  | 'Irrigation'
  | 'Fertilizer Application'
  | 'Pest / Disease Observation'
  | 'Pest Control Action'
  | 'Crop Maintenance'
  | 'Growth Observation'
  | 'Weather Event'
  | 'Harvest Activity';

export interface CropLog {
  id: string;
  cropRecordId: string;
  farmerId: string;
  activityType: ActivityType;
  activityDate: string;
  waterVolumeKL?: number;
  description: string;
  notes?: string;
  createdAt: string;
}

export type PhotoCategory = 
  | 'Growth Documentation'
  | 'Crop Identification'
  | 'General Condition'
  | 'Pest / Disease Symptom'
  | 'Flowering / Fruiting Progress'
  | 'Harvest Readiness'
  | 'Harvested Produce'
  | 'Irrigation & Water Check';

export type EvidenceStatus = 
  | 'Uploaded'
  | 'Pending Review'
  | 'Approved as Supporting Evidence'
  | 'Rejected'
  | 'Resubmission Requested';

export interface CropEvidence {
  id: string;
  cropRecordId: string;
  farmerId: string;
  cropName?: string;
  storagePath: string; // url or data url
  category: PhotoCategory;
  description: string;
  captureDate?: string;
  uploadDate: string;
  growthStage: GrowthStage;
  reviewStatus: EvidenceStatus;
  reviewerId?: string;
  reviewerName?: string;
  reviewedAt?: string;
  reviewNote?: string;
  publicSharingEnabled: boolean;
  notes?: string;
  createdAt: string;
}

export interface PassportScoreBreakdown {
  waterManagementScore: number; // max 40
  logConsistencyScore: number;  // max 30
  cropCareScore: number;        // max 20
  planAdherenceScore: number;   // max 10
  totalScore: number;           // max 100
  scoreGrade: 'Limited Records' | 'Developing Records' | 'Well-Documented Records' | 'Comprehensive Records';
  gradeBadge: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  suggestions: string[];
  calculatedAt: string;
  scoringVersion: string;
}

export interface PassportRecord {
  id: string;
  cropRecordId: string;
  farmerId: string;
  publicId: string; // e.g., FS-8X29KQ
  publicSharingEnabled: boolean;
  score: number;
  scoreBreakdown: PassportScoreBreakdown;
  scoreMethodVersion: string;
  scoreCalculatedAt: string;
  qrCodeUrl?: string;
  viewCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CropListing {
  id: string;
  farmerId: string;
  farmerName: string;
  publicDisplayName: string;
  cropRecordId: string;
  passportRecordId: string;
  publicPassportId: string;
  cropName: string;
  cropNameHi?: string;
  variety?: string;
  quantityAvailable: number;
  quantityUnit: 'Quintals' | 'Tonnes' | 'Kg';
  expectedPrice: number;
  expectedHarvestDate: string;
  generalLocation: string; // district, state
  publicDescription: string;
  passportScore: number;
  evidenceSummary: {
    photoCount: number;
    approvedEvidenceCount: number;
    hasRecentLog: boolean;
    evidenceStatus: EvidenceStatus;
  };
  sampleImageUrl?: string;
  status: 'Available' | 'Partially Booked' | 'Fully Booked' | 'Closed';
  createdAt: string;
  updatedAt: string;
}

export interface BuyerRequirement {
  id: string;
  buyerId: string;
  buyerName: string;
  cropName: string;
  quantity: number;
  quantityUnit: 'Quintals' | 'Tonnes' | 'Kg';
  targetPrice: number;
  requiredDate: string;
  location: string;
  minPassportScore?: number;
  requirements?: string;
  status: 'Open' | 'Matched' | 'Fulfilled' | 'Closed';
  createdAt: string;
}

export type BookingStatus = 
  | 'Submitted'
  | 'Under Discussion'
  | 'Accepted'
  | 'Rejected'
  | 'Cancelled'
  | 'Fulfilled';

export interface BookingRequest {
  id: string;
  buyerId: string;
  buyerName: string;
  farmerId: string;
  listingId?: string;
  cropRecordId?: string;
  publicPassportId?: string;
  cropName: string;
  requestedQuantity: number;
  quantityUnit: 'Quintals' | 'Tonnes' | 'Kg';
  proposedPrice: number;
  deliveryDate: string;
  deliveryLocation: string;
  minPassportScore?: number;
  desiredMonth?: string;
  message?: string;
  status: BookingStatus;
  statusNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookingEvent {
  id: string;
  bookingRequestId: string;
  actorId: string;
  actorRole: UserRole;
  previousStatus: BookingStatus;
  newStatus: BookingStatus;
  eventNote: string;
  createdAt: string;
}

export interface WeatherData {
  location: string;
  temperature: number;
  humidity: number;
  weatherCondition: string;
  rainfallForecast24hMm: number;
  precipitationProbability: number;
  windSpeedKmh: number;
  forecast: {
    date: string;
    tempMax: number;
    tempMin: number;
    rainProb: number;
    condition: string;
  }[];
  irrigationAdvisory: {
    recommendation: string;
    reason: string;
    soilCheckReminder: string;
    confidence: 'High' | 'Medium' | 'Low';
  };
  lastUpdated: string;
  source: string;
}
