/**
 * FasalSetu - Pure Scoring Logic
 * Implements the Crop Passport scoring formula:
 * - Water discipline (/40) = 40 * max(0, 1 - 2 * over), where over = max(0, (used - planned) / planned)
 * - Logging consistency (/30) = 30 * min(1, logs_done / 10)
 * - Crop care (/20) = 20 if issues === 0 else 20 * (resolved / issues)
 * - Plan adherence (/10) = 10 * min(1, sown_acres / planned_acres)
 * Total Score = sum of components (0 - 100)
 * Grade = Gold (>= 80), Silver (>= 60), Bronze (< 60)
 */

export function calculateWaterDiscipline(plannedWater, usedWater) {
  if (!plannedWater || plannedWater <= 0) return 40;
  const over = Math.max(0, (usedWater - plannedWater) / plannedWater);
  const rawScore = 40 * Math.max(0, 1 - 2 * over);
  return Math.round(rawScore * 10) / 10;
}

export function calculateLoggingConsistency(logsDone) {
  const count = Math.max(0, Number(logsDone) || 0);
  const rawScore = 30 * Math.min(1, count / 10);
  return Math.round(rawScore * 10) / 10;
}

export function calculateCropCare(issuesCount, resolvedCount) {
  const issues = Math.max(0, Number(issuesCount) || 0);
  const resolved = Math.max(0, Number(resolvedCount) || 0);
  if (issues === 0) return 20;
  const rawScore = 20 * Math.min(1, resolved / issues);
  return Math.round(rawScore * 10) / 10;
}

export function calculatePlanAdherence(plannedAcres, sownAcres) {
  if (!plannedAcres || plannedAcres <= 0) return 10;
  const sown = Math.max(0, Number(sownAcres) || 0);
  const rawScore = 10 * Math.min(1, sown / plannedAcres);
  return Math.round(rawScore * 10) / 10;
}

export function calculatePassportGrade(score) {
  if (score >= 80) return 'Gold';
  if (score >= 60) return 'Silver';
  return 'Bronze';
}

export function calculatePassportScore({
  plannedWater,
  usedWater,
  logsDone,
  issuesCount,
  resolvedCount,
  plannedAcres,
  sownAcres
}) {
  const waterDiscipline = calculateWaterDiscipline(plannedWater, usedWater);
  const loggingConsistency = calculateLoggingConsistency(logsDone);
  const cropCare = calculateCropCare(issuesCount, resolvedCount);
  const planAdherence = calculatePlanAdherence(plannedAcres, sownAcres);

  const totalExact = waterDiscipline + loggingConsistency + cropCare + planAdherence;
  const totalScore = Math.min(100, Math.max(0, Math.round(totalExact)));
  const grade = calculatePassportGrade(totalScore);

  return {
    totalScore,
    grade,
    breakdown: {
      waterDiscipline,
      loggingConsistency,
      cropCare,
      planAdherence
    }
  };
}
