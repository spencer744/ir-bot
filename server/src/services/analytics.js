const { supabase } = require('../config/supabase');

const EVENT_TYPES = {
  // Page/section
  PAGE_VIEW: 'page_view',
  SECTION_VIEW: 'section_view',
  SECTION_EXIT: 'section_exit',

  // Interaction
  FINANCIAL_EXPLORER_USED: 'financial_explorer_used',
  SCENARIO_CHANGED: 'scenario_changed',
  INVESTMENT_SLIDER_ADJUSTED: 'investment_slider_adjusted',
  SENSITIVITY_SLIDER_ADJUSTED: 'sensitivity_slider_adjusted',
  VIDEO_PLAY: 'video_play',
  VIDEO_PROGRESS: 'video_progress',
  DOCUMENT_DOWNLOAD: 'document_download',

  // Conversion
  PPM_REQUESTED: 'ppm_requested',
  INTEREST_INDICATED: 'interest_indicated',
  SCHEDULE_CALL_CLICKED: 'schedule_call_clicked',
  EMAIL_CONTACT_CLICKED: 'email_contact_clicked',
  PHONE_CONTACT_CLICKED: 'phone_contact_clicked',

  // Chat
  CHAT_OPENED: 'chat_opened',
  CHAT_MESSAGE_SENT: 'chat_message_sent',
  CHAT_QUICK_ACTION_CLICKED: 'chat_quick_action_clicked',

  // Session
  SESSION_START: 'session_start',
  SESSION_HEARTBEAT: 'session_heartbeat',
  SESSION_END: 'session_end',
};

const demoEventStore = [];

async function trackEvent(event) {
  try {
    const {
      investorId,
      sessionId,
      dealSlug,
      eventType,
      eventData = {},
      section,
    } = event;

    if (supabase) {
      const { error } = await supabase.from('analytics_events').insert({
        investor_id: investorId,
        session_id: sessionId,
        deal_slug: dealSlug,
        event_type: eventType,
        event_data: eventData,
        section,
      });

      if (error) {
        console.error('[Analytics] Failed to insert event:', error.message);
      }
    } else {
      demoEventStore.push({
        investor_id: investorId,
        session_id: sessionId,
        deal_slug: dealSlug,
        event_type: eventType,
        event_data: eventData,
        section,
        created_at: new Date().toISOString(),
      });
    }
  } catch (err) {
    console.error('[Analytics] Error tracking event:', err.message);
  }
}

function getDemoEvents() {
  return demoEventStore;
}

module.exports = { EVENT_TYPES, trackEvent, getDemoEvents };
