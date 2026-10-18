import { CropRecord, CropLog, CropEvidence, PassportScoreBreakdown } from '../types';

export interface ScoringWeights {
  waterManagementMax: number; // default 40
  logConsistencyMax: number;  // default 30
  cropCareMax: number;        // default 20
  planAdherenceMax: number;   // default 10
}

export const DEFAULT_WEIGHTS: ScoringWeights = {
  waterManagementMax: 40,
  logConsistencyMax: 30,
  cropCareMax: 20,
  planAdherenceMax: 10,
};

export class PassportScoreService {
  private weights: ScoringWeights;
  public readonly version = '1.2.0-transparent';

  constructor(weights: ScoringWeights = DEFAULT_WEIGHTS) {
    this.weights = weights;
  }

  public calculateScore(
    crop: CropRecord,
    logs: CropLog[],
    evidenceList: CropEvidence[]
  ): PassportScoreBreakdown {
    const suggestions: string[] = [];

    // Filter valid logs for this crop
    const cropLogs = logs.filter(l => l.cropRecordId === crop.id);

    // Filter duplicate logs on same date with same activity to prevent score inflation
    const uniqueLogs = this.deduplicateLogs(cropLogs);

    // 1. Water Management Records (Max 40)
    const waterLogs = uniqueLogs.filter(l => l.activityType === 'Irrigation');
    let waterScore = 0;

    // Base documentation: irrigation method defined in farm or crop notes
    if (waterLogs.length > 0) {
      waterScore += 10; // Recorded at least one irrigation event
      // Points for regular volume logs
      const logsWithVolume = waterLogs.filter(l => l.waterVolumeKL !== undefined && l.waterVolumeKL > 0);
      const volumeCoverageRatio = Math.min(1, logsWithVolume.length / Math.max(1, waterLogs.length));
      waterScore += Math.round(volumeCoverageRatio * 15); // up to 15 for volume tracking

      // Frequency score: 3 or more spaced irrigation logs
      const freqScore = Math.min(15, waterLogs.length * 5);
      waterScore += freqScore;
    } else {
      suggestions.push('Add missing irrigation logs with estimated water volumes.');
    }
    waterScore = Math.min(this.weights.waterManagementMax, Math.max(0, waterScore));

    // 2. Consistency of Crop Logs (Max 30)
    let consistencyScore = 0;
    if (uniqueLogs.length === 0) {
      suggestions.push('Begin recording regular farming observations throughout the season.');
    } else {
      // Points based on total unique activity logs (up to 15 pts)
      const countPoints = Math.min(15, uniqueLogs.length * 3);
      consistencyScore += countPoints;

      // Temporal spread across days/weeks (up to 15 pts)
      const uniqueDates = new Set(uniqueLogs.map(l => l.activityDate.slice(0, 10)));
      const dateSpreadPoints = Math.min(15, uniqueDates.size * 3);
      consistencyScore += dateSpreadPoints;

      if (uniqueDates.size < 3) {
        suggestions.push('Log farm observations across multiple weeks to demonstrate regular field visits.');
      }
    }
    consistencyScore = Math.min(this.weights.logConsistencyMax, Math.max(0, consistencyScore));

    // 3. Crop Care Records (Max 20)
    const careLogs = uniqueLogs.filter(l => 
      l.activityType === 'Fertilizer Application' ||
      l.activityType === 'Pest / Disease Observation' ||
      l.activityType === 'Pest Control Action' ||
      l.activityType === 'Crop Maintenance'
    );
    let careScore = 0;
    if (careLogs.length > 0) {
      // 7 points per care activity up to max
      careScore = Math.min(this.weights.cropCareMax, careLogs.length * 7);
      if (careScore < this.weights.cropCareMax) {
        suggestions.push('Record any nutrient applications, weeding, or pest-prevention measures.');
      }
    } else {
      suggestions.push('Document your crop care practices (nutrition, weeding, pest inspection).');
    }
    careScore = Math.min(this.weights.cropCareMax, Math.max(0, careScore));

    // 4. Plan Adherence (Max 10)
    let adherenceScore = 0;
    // Planting date declared
    if (crop.plantingDate) adherenceScore += 3;
    // Expected harvest date declared
    if (crop.expectedHarvestDate) adherenceScore += 3;
    // Cultivated area and expected quantity declared
    if (crop.cultivatedArea > 0 && crop.estimatedQuantity > 0) adherenceScore += 4;

    if (adherenceScore < this.weights.planAdherenceMax) {
      suggestions.push('Ensure complete crop plan baseline (sowing date, harvest target, expected yield).');
    }
    adherenceScore = Math.min(this.weights.planAdherenceMax, Math.max(0, adherenceScore));

    // Total Score
    const totalScore = waterScore + consistencyScore + careScore + adherenceScore;

    // Determine Grade & Badge
    let scoreGrade: PassportScoreBreakdown['scoreGrade'] = 'Limited Records';
    let gradeBadge: PassportScoreBreakdown['gradeBadge'] = 'Bronze';

    if (totalScore >= 80) {
      scoreGrade = 'Comprehensive Records';
      gradeBadge = 'Platinum';
    } else if (totalScore >= 60) {
      scoreGrade = 'Well-Documented Records';
      gradeBadge = 'Gold';
    } else if (totalScore >= 40) {
      scoreGrade = 'Developing Records';
      gradeBadge = 'Silver';
    } else {
      scoreGrade = 'Limited Records';
      gradeBadge = 'Bronze';
    }

    // Photo check (reported transparently as advice, not auto points)
    const cropPhotos = evidenceList.filter(e => e.cropRecordId === crop.id);
    if (cropPhotos.length === 0) {
      suggestions.push('Upload a clear crop photograph to attach visible supporting evidence to your Passport.');
    }

    return {
      waterManagementScore: waterScore,
      logConsistencyScore: consistencyScore,
      cropCareScore: careScore,
      planAdherenceScore: adherenceScore,
      totalScore,
      scoreGrade,
      gradeBadge,
      suggestions,
      calculatedAt: new Date().toISOString(),
      scoringVersion: this.version,
    };
  }

  private deduplicateLogs(logs: CropLog[]): CropLog[] {
    const seen = new Set<string>();
    return logs.filter(log => {
      const key = `${log.activityType}_${log.activityDate.slice(0, 10)}_${log.description.trim().toLowerCase()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
}

export const passportScoreService = new PassportScoreService();
