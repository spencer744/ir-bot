/**
 * Engagement Scoring Service
 *
 * Calculates investor engagement scores based on session activity.
 *
 * Formula:
 *   score = (sections_viewed × 10)
 *         + (minutes_spent × 2)
 *         + (chat_messages × 5)
 *         + (video_watched_pct × 0.5)
 *         + (financial_explorer_used × 15)
 *
 * Thresholds:
 *   > 50: Notify IR team
 *   > 80: Auto-create HubSpot task
 */

const SCORE_THRESHOLDS = {
  LOW: 0,
  MODERATE: 25,
  HIGH: 50,
  VERY_HIGH: 80,
};

function calculateEngagementScore({
  sectionsViewed = [],
  minutesSpent = 0,
  chatMessages = 0,
  videoWatchedPct = 0,
  financialExplorerUsed = false,
}) {
  const score =
    (sectionsViewed.length * 10) +
    (minutesSpent * 2) +
    (chatMessages * 5) +
    (videoWatchedPct * 0.5) +
    (financialExplorerUsed ? 15 : 0);

  return Math.round(score * 100) / 100;
}

function getEngagementTier(score) {
  if (score >= SCORE_THRESHOLDS.VERY_HIGH) return 'very_high';
  if (score >= SCORE_THRESHOLDS.HIGH) return 'high';
  if (score >= SCORE_THRESHOLDS.MODERATE) return 'moderate';
  return 'low';
}

module.exports = { calculateEngagementScore, getEngagementTier, SCORE_THRESHOLDS };
