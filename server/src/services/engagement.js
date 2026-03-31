/**
 * Engagement Scoring Service
 *
 * Formula:
 *   sections_viewed × 8 (max 48)
 * + min(chat_messages × 5, 25)
 * + min(floor(time_seconds / 60) × 2, 15)
 * + ppm_requested ? 20 : 0
 * + interest_indicated ? 25 : 0
 * Capped at 100.
 *
 * Investor Readiness:
 *   score >= 80 OR ppm_requested → "hot"
 *   score >= 60 AND sections >= 4 → "warm"
 *   else → "cold"
 */

const SCORE_THRESHOLDS = {
  LOW: 0,
  MODERATE: 25,
  HIGH: 50,
  VERY_HIGH: 80,
};

function calculateEngagementScore({
  sectionsViewed = [],
  chatMessages = 0,
  timeSeconds = 0,
  ppmRequested = false,
  interestIndicated = false,
}) {
  const sectionScore = Math.min(sectionsViewed.length * 8, 48);
  const chatScore = Math.min(chatMessages * 5, 25);
  const timeScore = Math.min(Math.floor(timeSeconds / 60) * 2, 15);
  const ppmScore = ppmRequested ? 20 : 0;
  const interestScore = interestIndicated ? 25 : 0;

  const raw = sectionScore + chatScore + timeScore + ppmScore + interestScore;
  return Math.min(raw, 100);
}

function getInvestorReadiness({ score = 0, sectionsViewed = [], ppmRequested = false }) {
  if (score >= 80 || ppmRequested) return 'hot';
  if (score >= 60 && sectionsViewed.length >= 4) return 'warm';
  return 'cold';
}

function getEngagementTier(score) {
  if (score >= SCORE_THRESHOLDS.VERY_HIGH) return 'very_high';
  if (score >= SCORE_THRESHOLDS.HIGH) return 'high';
  if (score >= SCORE_THRESHOLDS.MODERATE) return 'moderate';
  return 'low';
}

module.exports = { calculateEngagementScore, getInvestorReadiness, getEngagementTier, SCORE_THRESHOLDS };
