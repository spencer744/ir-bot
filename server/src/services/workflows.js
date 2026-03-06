/**
 * Workflow Automation Service
 *
 * Checks engagement scores and fires HubSpot actions when thresholds are
 * crossed.  Uses an in-memory Map to prevent duplicate alerts per investor.
 */

const hubspot = require('./hubspot');
const { getEngagementTier, SCORE_THRESHOLDS } = require('./engagement');

// investorId -> Set of triggered tier names (e.g. 'high', 'very_high')
const triggeredThresholds = new Map();

/**
 * Evaluate engagement score against thresholds and trigger HubSpot actions.
 */
async function evaluateWorkflows({
  investorId,
  hubspotContactId,
  investorName,
  investorEmail,
  engagementScore,
  dealSlug,
  dealName,
}) {
  if (!hubspot.isEnabled()) return;

  const tier = getEngagementTier(engagementScore);

  if (!triggeredThresholds.has(investorId)) {
    triggeredThresholds.set(investorId, new Set());
  }
  const triggered = triggeredThresholds.get(investorId);

  // --- HIGH threshold (score > 50) ---
  if (engagementScore > SCORE_THRESHOLDS.HIGH && !triggered.has('high')) {
    triggered.add('high');

    await hubspot.createNote(
      hubspotContactId,
      `Engaged Investor Alert: ${investorName} (${investorEmail}) has reached an engagement score of ${engagementScore} on ${dealName}. Consider prioritising outreach.`
    );

    console.log(
      `[Workflows] HIGH threshold triggered for investor ${investorId} (${investorName}) — score ${engagementScore}`
    );
  }

  // --- VERY HIGH threshold (score > 80) ---
  if (engagementScore > SCORE_THRESHOLDS.VERY_HIGH && !triggered.has('very_high')) {
    triggered.add('very_high');

    await hubspot.createTask(
      hubspotContactId,
      `High-Intent Investor: ${investorName}`,
      `${investorName} (${investorEmail}) has reached an engagement score of ${engagementScore} on ${dealName}. Recommend outreach within 24h.`,
      'HIGH'
    );

    await hubspot.updateContactPropertiesById(hubspotContactId, {
      gc_deal_room_engagement_score: String(engagementScore),
    });

    console.log(
      `[Workflows] VERY_HIGH threshold triggered for investor ${investorId} (${investorName}) — score ${engagementScore}`
    );
  }

  triggeredThresholds.set(investorId, triggered);
}

/**
 * Handle PPM (Private Placement Memorandum) request actions.
 */
async function onPPMRequested({ hubspotContactId, investorName, investorEmail, dealName }) {
  if (!hubspot.isEnabled()) return;

  await hubspot.updateContactPropertiesById(hubspotContactId, {
    gc_ppm_requested: 'true',
  });

  await hubspot.createTask(
    hubspotContactId,
    `PPM Requested: ${investorName}`,
    `${investorName} (${investorEmail}) has requested the PPM for ${dealName}. Please follow up to provide the document.`,
    'HIGH'
  );

  await hubspot.createNote(
    hubspotContactId,
    `PPM Request: ${investorName} (${investorEmail}) requested the Private Placement Memorandum for ${dealName}.`
  );

  console.log(`[Workflows] PPM requested by ${investorName} (${investorEmail}) for ${dealName}`);
}

/**
 * Handle investor interest indication.
 */
async function onInterestIndicated({
  hubspotContactId,
  investorName,
  investorEmail,
  dealName,
  amountRange,
  notes,
}) {
  if (!hubspot.isEnabled()) return;

  await hubspot.updateContactPropertiesById(hubspotContactId, {
    gc_interest_indicated: 'true',
    gc_indicated_amount_range: amountRange || '',
  });

  await hubspot.createTask(
    hubspotContactId,
    `Interest Indicated: ${investorName}`,
    `${investorName} (${investorEmail}) has indicated interest in ${dealName}. Amount range: ${amountRange || 'Not specified'}. Notes: ${notes || 'None'}.`,
    'HIGH'
  );

  await hubspot.createNote(
    hubspotContactId,
    `Interest Indicated: ${investorName} (${investorEmail}) indicated interest in ${dealName}. Amount range: ${amountRange || 'Not specified'}. Notes: ${notes || 'None'}.`
  );

  console.log(
    `[Workflows] Interest indicated by ${investorName} (${investorEmail}) for ${dealName} — amount: ${amountRange || 'N/A'}`
  );
}

/**
 * Handle schedule-a-call button click.
 */
async function onScheduleCallClicked({ hubspotContactId, investorName, investorEmail, dealName }) {
  if (!hubspot.isEnabled()) return;

  await hubspot.createNote(
    hubspotContactId,
    `Schedule Call Clicked: ${investorName} (${investorEmail}) clicked the schedule-a-call button for ${dealName}.`
  );

  console.log(
    `[Workflows] Schedule call clicked by ${investorName} (${investorEmail}) for ${dealName}`
  );
}

module.exports = {
  evaluateWorkflows,
  onPPMRequested,
  onInterestIndicated,
  onScheduleCallClicked,
};
