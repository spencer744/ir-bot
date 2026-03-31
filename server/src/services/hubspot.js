// HubSpot integration service
// Creates/updates contacts and syncs investor profile data.
// Requires HUBSPOT_API_KEY env var. Gracefully no-ops when missing.

const hubspot = require('@hubspot/api-client');

let client = null;

function getClient() {
  if (client) return client;
  const token = process.env.HUBSPOT_API_KEY;
  if (!token) return null;
  client = new hubspot.Client({ accessToken: token });
  return client;
}

/**
 * Create or update a HubSpot contact on gate registration.
 * Non-blocking — caller should .catch() to avoid breaking auth flow.
 */
async function hubspotCreateOrUpdateContact({ email, first_name, last_name, phone, deal_slug }) {
  const hs = getClient();
  if (!hs) return null;

  const properties = {
    email,
    firstname: first_name,
    lastname: last_name,
  };
  if (phone) properties.phone = phone;
  if (deal_slug) properties.gc_current_deal = deal_slug;

  try {
    // Try to find existing contact by email
    const searchResponse = await hs.crm.contacts.searchApi.doSearch({
      filterGroups: [{
        filters: [{
          propertyName: 'email',
          operator: 'EQ',
          value: email,
        }],
      }],
      properties: ['email', 'firstname', 'lastname'],
      limit: 1,
    });

    if (searchResponse.results && searchResponse.results.length > 0) {
      // Update existing contact
      const contactId = searchResponse.results[0].id;
      await hs.crm.contacts.basicApi.update(contactId, { properties });
      console.log(`[HubSpot] Updated contact ${contactId} (${email})`);
      return contactId;
    } else {
      // Create new contact
      const createResponse = await hs.crm.contacts.basicApi.create({ properties });
      console.log(`[HubSpot] Created contact ${createResponse.id} (${email})`);
      return createResponse.id;
    }
  } catch (err) {
    // If the error is a conflict (contact exists), try update
    if (err.code === 409 || err.statusCode === 409) {
      console.warn('[HubSpot] Conflict on create, attempting upsert by email');
      try {
        const response = await hs.crm.contacts.basicApi.update(email, {
          properties,
          idProperty: 'email',
        });
        return response.id;
      } catch (retryErr) {
        throw retryErr;
      }
    }
    throw err;
  }
}

/**
 * Update HubSpot contact properties from intake answers or chatbot extractions.
 */
async function hubspotUpdateContactProperties(email, properties) {
  const hs = getClient();
  if (!hs) return null;

  // Map our field names to HubSpot property names
  const hsProps = {};
  if (properties.investment_goal) hsProps.gc_investment_goal = properties.investment_goal;
  if (properties.syndication_experience) hsProps.gc_syndication_experience = properties.syndication_experience;
  if (properties.target_range) hsProps.gc_target_range = properties.target_range;
  if (properties.lead_source) hsProps.gc_lead_source = properties.lead_source;
  if (properties.target_hold_period) hsProps.gc_target_hold_period = properties.target_hold_period;
  if (properties.tax_bracket_indicated) hsProps.gc_tax_bracket = properties.tax_bracket_indicated;
  if (properties.key_concerns) hsProps.gc_key_concerns = properties.key_concerns;

  if (Object.keys(hsProps).length === 0) return null;

  try {
    // Search by email to get contact ID
    const searchResponse = await hs.crm.contacts.searchApi.doSearch({
      filterGroups: [{
        filters: [{
          propertyName: 'email',
          operator: 'EQ',
          value: email,
        }],
      }],
      properties: ['email'],
      limit: 1,
    });

    if (searchResponse.results && searchResponse.results.length > 0) {
      const contactId = searchResponse.results[0].id;
      await hs.crm.contacts.basicApi.update(contactId, { properties: hsProps });
      console.log(`[HubSpot] Updated properties for ${email}:`, Object.keys(hsProps));
      return contactId;
    }

    console.warn(`[HubSpot] Contact not found for ${email}, skipping property update`);
    return null;
  } catch (err) {
    throw err;
  }
}

/**
 * Check whether HubSpot integration is configured.
 */
function isEnabled() {
  return !!process.env.HUBSPOT_API_KEY;
}

/**
 * Update a HubSpot contact by its record ID (not email).
 * @param {string|number} contactId - HubSpot contact record ID
 * @param {Object} properties - plain object of HubSpot property key-values
 */
async function updateContactPropertiesById(contactId, properties) {
  const hs = getClient();
  if (!hs) return null;
  if (!contactId) return null;

  try {
    await hs.crm.contacts.basicApi.update(contactId, { properties });
    console.log(`[HubSpot] Updated properties for contact ${contactId}:`, Object.keys(properties));
  } catch (err) {
    console.error(`[HubSpot] Failed to update contact ${contactId}:`, err.message);
  }
}

/**
 * Sync engagement metrics to a HubSpot contact.
 * @param {string|number} contactId - HubSpot contact record ID
 * @param {Object} engagement - { totalSeconds, sectionsViewed, chatMessageCount, engagementScore, readiness }
 */
async function syncEngagement(contactId, engagement) {
  const hs = getClient();
  if (!hs) return null;
  if (!contactId) return null;

  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  const properties = {
    gc_deal_room_engagement_score: String(engagement.engagementScore || 0),
    gc_deal_room_sections_viewed: Array.isArray(engagement.sectionsViewed)
      ? engagement.sectionsViewed.join(';')
      : String(engagement.sectionsViewed || ''),
    gc_deal_room_time_spent: String(engagement.totalSeconds || 0),
    gc_deal_room_chat_messages: String(engagement.chatMessageCount || 0),
    gc_deal_room_last_visit: today,
  };

  // Set investor readiness tier
  if (engagement.readiness) {
    properties.gc_investor_readiness = engagement.readiness;
  }

  try {
    await updateContactPropertiesById(contactId, properties);
    console.log(`[HubSpot] Synced engagement for contact ${contactId} (score: ${engagement.engagementScore}, readiness: ${engagement.readiness || 'n/a'})`);
  } catch (err) {
    console.error(`[HubSpot] Failed to sync engagement for contact ${contactId}:`, err.message);
  }
}

/**
 * Create a HubSpot task and associate it with a contact.
 * @param {string|number} contactId - HubSpot contact record ID
 * @param {string} subject - task subject line
 * @param {string} body - task body / description
 * @param {string} priority - task priority (HIGH, MEDIUM, LOW)
 */
async function createTask(contactId, subject, body, priority = 'HIGH') {
  const hs = getClient();
  if (!hs) return null;
  if (!contactId) return null;

  try {
    const taskResponse = await hs.crm.objects.basicApi.create('tasks', {
      properties: {
        hs_task_subject: subject,
        hs_task_body: body,
        hs_task_priority: priority,
        hs_task_status: 'NOT_STARTED',
        hs_task_type: 'TODO',
        hs_timestamp: new Date().toISOString(),
      },
    });

    const taskId = taskResponse.id;

    await hs.crm.objects.associationsApi.create('tasks', taskId, 'contacts', contactId, [
      { associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 204 },
    ]);

    console.log(`[HubSpot] Created task ${taskId} ("${subject}") for contact ${contactId}`);
    return taskId;
  } catch (err) {
    console.error(`[HubSpot] Failed to create task for contact ${contactId}:`, err.message);
  }
}

/**
 * Create a HubSpot note and associate it with a contact.
 * @param {string|number} contactId - HubSpot contact record ID
 * @param {string} body - note body / content
 */
async function createNote(contactId, body) {
  const hs = getClient();
  if (!hs) return null;
  if (!contactId) return null;

  try {
    const noteResponse = await hs.crm.objects.basicApi.create('notes', {
      properties: {
        hs_note_body: body,
        hs_timestamp: new Date().toISOString(),
      },
    });

    const noteId = noteResponse.id;

    await hs.crm.objects.associationsApi.create('notes', noteId, 'contacts', contactId, [
      { associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 202 },
    ]);

    console.log(`[HubSpot] Created note ${noteId} for contact ${contactId}`);
    return noteId;
  } catch (err) {
    console.error(`[HubSpot] Failed to create note for contact ${contactId}:`, err.message);
  }
}

module.exports = {
  isEnabled,
  hubspotCreateOrUpdateContact,
  hubspotUpdateContactProperties,
  updateContactPropertiesById,
  syncEngagement,
  createTask,
  createNote,
};
