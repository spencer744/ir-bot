/**
 * Workflow Automation Service
 *
 * Checks engagement scores and fires HubSpot actions when thresholds are
 * crossed.  Uses Supabase (investors.workflow_triggers JSONB) as the durable
 * dedup layer, with an in-memory Map as a fast secondary layer for the
 * lifetime of the current process.  Falls back to in-memory-only when
 * Supabase is unavailable.
 */

const hubspot = require('./hubspot');
const { supabase } = require('../config/supabase');
const { getEngagementTier, SCORE_THRESHOLDS } = require('./engagement');

// investorId -> Set of triggered tier names (in-process dedup layer)
const triggeredThresholds = new Map();

// ---------------------------------------------------------------------------
// Durable threshold helpers
// ---------------------------------------------------------------------------

/**
 * Check whether a threshold has already been fired for this investor.
 * Queries Supabase first; falls back to the in-memory map on error.
 */
async function hasThresholdTriggered(investorId, thresholdName) {
  // Fast path: already tracked in this process
  if (triggeredThresholds.get(investorId)?.has(thresholdName)) return true;

  if (!supabase || !investorId) return false;

  try {
    const { data } = await supabase
      .from('investors')
      .select('workflow_triggers')
      .eq('id', investorId)
      .single();

    const triggers = data?.workflow_triggers;
    if (Array.isArray(triggers) && triggers.includes(thresholdName)) {
      // Sync back into in-memory map so subsequent calls are instant
      if (!triggeredThresholds.has(investorId)) {
        triggeredThresholds.set(investorId, new Set());
      }
      triggeredThresholds.get(investorId).add(thresholdName);
      return true;
    }
    return false;
  } catch (err) {
    console.warn('[Workflows] Supabase threshold check failed, falling back to in-memory:', err.message);
    return false;
  }
}

/**
 * Persist a fired threshold to Supabase and update the in-memory map.
 */
async function recordThresholdTriggered(investorId, thresholdName) {
  // Update in-memory map
  if (!triggeredThresholds.has(investorId)) {
    triggeredThresholds.set(investorId, new Set());
  }
  triggeredThresholds.get(investorId).add(thresholdName);

  if (!supabase || !investorId) return;

  try {
    const { data } = await supabase
      .from('investors')
      .select('workflow_triggers')
      .eq('id', investorId)
      .single();

    const existing = Array.isArray(data?.workflow_triggers) ? data.workflow_triggers : [];
    if (!existing.includes(thresholdName)) {
      await supabase
        .from('investors')
        .update({ workflow_triggers: [...existing, thresholdName] })
        .eq('id', investorId);
    }
  } catch (err) {
    console.warn('[Workflows] Supabase threshold persist failed, using in-memory only:', err.message);
  }
}

// ---------------------------------------------------------------------------
// Core workflow evaluation
// ---------------------------------------------------------------------------

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

  // --- HIGH threshold (score > 50) ---
  if (engagementScore > SCORE_THRESHOLDS.HIGH) {
    const alreadyFired = await hasThresholdTriggered(investorId, 'high');
    if (!alreadyFired) {
      await recordThresholdTriggered(investorId, 'high');

      await hubspot.createNote(
        hubspotContactId,
        `Engaged Investor Alert: ${investorName} (${investorEmail}) has reached an engagement score of ${engagementScore} on ${dealName}. Consider prioritising outreach.`
      );

      console.log(
        `[Workflows] HIGH threshold triggered for investor ${investorId} (${investorName}) — score ${engagementScore}`
      );
    }
  }

  // --- VERY HIGH threshold (score > 80) ---
  if (engagementScore > SCORE_THRESHOLDS.VERY_HIGH) {
    const alreadyFired = await hasThresholdTriggered(investorId, 'very_high');
    if (!alreadyFired) {
      await recordThresholdTriggered(investorId, 'very_high');

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
  }
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
