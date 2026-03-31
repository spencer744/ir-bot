const express = require('express');
const { supabase } = require('../config/supabase');
const { trackEvent, EVENT_TYPES, getDemoEvents } = require('../services/analytics');
const { calculateEngagementScore, getInvestorReadiness } = require('../services/engagement');
const { syncEngagement } = require('../services/hubspot');
const { evaluateWorkflows, onScheduleCallClicked } = require('../services/workflows');
const { requireAdmin, requireAuth } = require('../middleware/auth');

const router = express.Router();

// POST /api/analytics/event — Track page/section views and interactions
router.post('/event', requireAuth, async (req, res, next) => {
  try {
    const { event, section, metadata, session_id, investorId, dealSlug } = req.body;

    // Track the event via the analytics service
    await trackEvent({
      investorId: investorId || null,
      sessionId: session_id || null,
      dealSlug: dealSlug || null,
      eventType: event,
      eventData: metadata || {},
      section: section || null,
    });

    // Update session data in Supabase if available
    if (supabase && session_id) {
      if (event === 'section_view' && section) {
        const { data: session } = await supabase
          .from('sessions')
          .select('sections_viewed')
          .eq('id', session_id)
          .single();

        if (session) {
          const viewed = session.sections_viewed || [];
          if (!viewed.includes(section)) {
            await supabase
              .from('sessions')
              .update({
                sections_viewed: [...viewed, section],
                last_active_at: new Date().toISOString(),
              })
              .eq('id', session_id);
          }
        }
      }

      if (event === 'financial_slider_adjusted') {
        await supabase
          .from('sessions')
          .update({ financial_explorer_used: true })
          .eq('id', session_id);
      }
    }

    // Fire HubSpot note when investor clicks schedule-a-call CTA
    if (event === 'schedule_call_clicked') {
      if (supabase && session_id) {
        supabase
          .from('sessions')
          .select('investor_id, investors(email, first_name, last_name, hubspot_contact_id)')
          .eq('id', session_id)
          .single()
          .then(({ data }) => {
            if (data?.investors) {
              const inv = data.investors;
              onScheduleCallClicked({
                hubspotContactId: inv.hubspot_contact_id,
                investorName: `${inv.first_name || ''} ${inv.last_name || ''}`.trim(),
                investorEmail: inv.email,
                dealName: metadata?.dealName || dealSlug || '',
              }).catch(() => {});
            }
          })
          .catch(() => {});
      } else {
        // No Supabase — fire with whatever metadata the client sent
        onScheduleCallClicked({
          hubspotContactId: metadata?.hubspotContactId || null,
          investorName: metadata?.investorName || '',
          investorEmail: metadata?.investorEmail || '',
          dealName: metadata?.dealName || dealSlug || '',
        }).catch(() => {});
      }
    }

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// POST /api/analytics/heartbeat — Update session duration + engagement scoring + HubSpot sync
router.post('/heartbeat', requireAuth, async (req, res, next) => {
  try {
    const {
      session_id,
      investorId,
      dealSlug,
      hubspotContactId,
      investorName,
      investorEmail,
      dealName,
    } = req.body;

    if (supabase && session_id) {
      const { data: session } = await supabase
        .from('sessions')
        .select('started_at, total_seconds, sections_viewed, chat_message_count, financial_explorer_used, video_watched_pct, ppm_requested, interest_indicated')
        .eq('id', session_id)
        .single();

      if (session) {
        const elapsed = Math.floor((Date.now() - new Date(session.started_at).getTime()) / 1000);
        const sectionsViewed = session.sections_viewed || [];

        // Calculate engagement score with the new formula
        const engagementScore = calculateEngagementScore({
          sectionsViewed,
          chatMessages: session.chat_message_count || 0,
          timeSeconds: elapsed,
          ppmRequested: !!session.ppm_requested,
          interestIndicated: !!session.interest_indicated,
        });

        // Determine investor readiness tier
        const readiness = getInvestorReadiness({
          score: engagementScore,
          sectionsViewed,
          ppmRequested: !!session.ppm_requested,
        });

        // Update session in Supabase
        await supabase
          .from('sessions')
          .update({
            total_seconds: elapsed,
            engagement_score: engagementScore,
            last_active_at: new Date().toISOString(),
          })
          .eq('id', session_id);

        // Sync engagement metrics to HubSpot
        if (hubspotContactId) {
          syncEngagement(hubspotContactId, {
            totalSeconds: elapsed,
            sectionsViewed,
            chatMessageCount: session.chat_message_count || 0,
            engagementScore,
            readiness,
          }).catch(err => {
            console.warn('[Analytics] HubSpot engagement sync failed:', err.message);
          });
        }

        // Evaluate workflow thresholds (HubSpot actions)
        await evaluateWorkflows({
          investorId: investorId || null,
          hubspotContactId: hubspotContactId || null,
          investorName: investorName || '',
          investorEmail: investorEmail || '',
          engagementScore,
          dealSlug: dealSlug || null,
          dealName: dealName || '',
        });
      }
    }

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// Admin endpoints — require admin authentication
// ---------------------------------------------------------------------------
router.use('/admin', requireAdmin);

// GET /api/analytics/admin/events — List analytics events with optional filters
router.get('/admin/events', async (req, res, next) => {
  try {
    const { dealSlug, investorId, limit = 100 } = req.query;
    const parsedLimit = Math.min(parseInt(limit, 10) || 100, 1000);

    let events = [];

    if (supabase) {
      let query = supabase
        .from('analytics_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(parsedLimit);

      if (dealSlug) query = query.eq('deal_slug', dealSlug);
      if (investorId) query = query.eq('investor_id', investorId);

      const { data, error } = await query;
      if (error) throw error;
      events = data || [];
    } else {
      events = getDemoEvents().filter((e) => {
        if (dealSlug && e.deal_slug !== dealSlug) return false;
        if (investorId && e.investor_id !== investorId) return false;
        return true;
      });
      events = events.slice(-parsedLimit).reverse();
    }

    res.json({ events, total: events.length });
  } catch (err) {
    next(err);
  }
});

// GET /api/analytics/admin/dashboard/:dealSlug — Aggregate analytics for a deal
router.get('/admin/dashboard/:dealSlug', async (req, res, next) => {
  try {
    const { dealSlug } = req.params;
    let events = [];

    if (supabase) {
      const { data, error } = await supabase
        .from('analytics_events')
        .select('*')
        .eq('deal_slug', dealSlug)
        .order('created_at', { ascending: false });

      if (error) throw error;
      events = data || [];
    } else {
      events = getDemoEvents().filter((e) => e.deal_slug === dealSlug);
    }

    // Calculate metrics
    const uniqueInvestors = new Set(events.map((e) => e.investor_id).filter(Boolean));
    const chatMessages = events.filter((e) => e.event_type === EVENT_TYPES.CHAT_MESSAGE_SENT);

    const metrics = {
      unique_visitors: uniqueInvestors.size,
      total_events: events.length,
      chat_messages: chatMessages.length,
      ppm_requests: events.filter((e) => e.event_type === EVENT_TYPES.PPM_REQUESTED).length,
      interest_indications: events.filter((e) => e.event_type === EVENT_TYPES.INTEREST_INDICATED).length,
      document_downloads: events.filter((e) => e.event_type === EVENT_TYPES.DOCUMENT_DOWNLOAD).length,
      schedule_call_clicks: events.filter((e) => e.event_type === EVENT_TYPES.SCHEDULE_CALL_CLICKED).length,
    };

    // Build section heatmap
    const sectionHeatmap = {};
    events.forEach((e) => {
      if (e.section) {
        sectionHeatmap[e.section] = (sectionHeatmap[e.section] || 0) + 1;
      }
    });

    // Top 20 chat questions
    const topQuestions = chatMessages
      .map((e) => {
        const data = e.event_data || {};
        return data.message || data.question || null;
      })
      .filter(Boolean)
      .slice(0, 20);

    res.json({
      deal_slug: dealSlug,
      metrics,
      section_heatmap: sectionHeatmap,
      top_questions: topQuestions,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/analytics/admin/investor/:investorId/timeline — Per-investor event timeline
router.get('/admin/investor/:investorId/timeline', async (req, res, next) => {
  try {
    const { investorId } = req.params;
    let events = [];

    if (supabase) {
      const { data, error } = await supabase
        .from('analytics_events')
        .select('*')
        .eq('investor_id', investorId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      events = data || [];
    } else {
      events = getDemoEvents()
        .filter((e) => e.investor_id === investorId)
        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    }

    const timeline = events.map((e) => ({
      type: e.event_type,
      section: e.section || null,
      data: e.event_data || {},
      timestamp: e.created_at,
    }));

    res.json({
      investor_id: investorId,
      event_count: timeline.length,
      timeline,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
