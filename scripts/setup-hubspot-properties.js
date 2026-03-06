// Run: HUBSPOT_ACCESS_TOKEN=your_token node scripts/setup-hubspot-properties.js
// Creates custom Gray Capital contact properties in HubSpot.

const hubspot = require('@hubspot/api-client');

const token = process.env.HUBSPOT_ACCESS_TOKEN || process.env.HUBSPOT_API_KEY;
if (!token) {
  console.error('Missing HUBSPOT_ACCESS_TOKEN or HUBSPOT_API_KEY env var.');
  process.exit(1);
}

const client = new hubspot.Client({ accessToken: token });

// Format option labels: replace underscores with spaces, title-case each word
function formatLabel(value) {
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function buildOptions(values) {
  return values.map((value, i) => ({
    label: formatLabel(value),
    value,
    displayOrder: i,
    hidden: false,
  }));
}

const properties = [
  {
    name: 'gc_current_deal',
    label: 'Current Deal',
    type: 'string',
    fieldType: 'text',
  },
  {
    name: 'gc_investment_goal',
    label: 'Investment Goal',
    type: 'enumeration',
    fieldType: 'select',
    options: buildOptions(['cash_flow', 'appreciation', 'tax_benefits', 'diversification']),
  },
  {
    name: 'gc_syndication_experience',
    label: 'Syndication Experience',
    type: 'enumeration',
    fieldType: 'select',
    options: buildOptions(['first_time', '1_to_3', '4_plus']),
  },
  {
    name: 'gc_target_range',
    label: 'Target Investment Range',
    type: 'enumeration',
    fieldType: 'select',
    options: buildOptions(['100k_250k', '250k_500k', '500k_1m', '1m_plus']),
  },
  {
    name: 'gc_lead_source',
    label: 'Lead Source',
    type: 'string',
    fieldType: 'text',
  },
  {
    name: 'gc_target_hold_period',
    label: 'Target Hold Period',
    type: 'string',
    fieldType: 'text',
  },
  {
    name: 'gc_tax_bracket',
    label: 'Tax Bracket Indicated',
    type: 'string',
    fieldType: 'text',
  },
  {
    name: 'gc_key_concerns',
    label: 'Key Concerns',
    type: 'string',
    fieldType: 'text',
  },
  {
    name: 'gc_deal_room_time_spent',
    label: 'Deal Room Time (seconds)',
    type: 'number',
    fieldType: 'number',
  },
  {
    name: 'gc_deal_room_sections_viewed',
    label: 'Deal Room Sections Viewed',
    type: 'string',
    fieldType: 'text',
  },
  {
    name: 'gc_deal_room_chat_messages',
    label: 'Deal Room Chat Messages',
    type: 'number',
    fieldType: 'number',
  },
  {
    name: 'gc_deal_room_engagement_score',
    label: 'Deal Room Engagement Score',
    type: 'number',
    fieldType: 'number',
  },
  {
    name: 'gc_deal_room_last_visit',
    label: 'Deal Room Last Visit',
    type: 'date',
    fieldType: 'date',
  },
  {
    name: 'gc_deal_room_video_watched_pct',
    label: 'Deal Video Watched %',
    type: 'number',
    fieldType: 'number',
  },
  {
    name: 'gc_ppm_requested',
    label: 'PPM Requested',
    type: 'enumeration',
    fieldType: 'booleancheckbox',
  },
  {
    name: 'gc_interest_indicated',
    label: 'Interest Indicated',
    type: 'enumeration',
    fieldType: 'booleancheckbox',
  },
  {
    name: 'gc_indicated_amount_range',
    label: 'Indicated Amount Range',
    type: 'string',
    fieldType: 'text',
  },
  {
    name: 'gc_chatbot_notes',
    label: 'Chatbot Notes',
    type: 'string',
    fieldType: 'textarea',
  },
];

async function main() {
  console.log(`\nCreating ${properties.length} custom contact properties in HubSpot...\n`);

  for (const prop of properties) {
    const propertyDef = {
      name: prop.name,
      label: prop.label,
      type: prop.type,
      fieldType: prop.fieldType,
      groupName: 'contactinformation',
    };

    if (prop.options) {
      propertyDef.options = prop.options;
    }

    try {
      await client.crm.properties.coreApi.create('contacts', propertyDef);
      console.log(`Created: ${prop.name}`);
    } catch (err) {
      if (err.code === 409 || (err.body && err.body.category === 'CONFLICT')) {
        console.log(`Exists:  ${prop.name}`);
      } else {
        const msg = err.body?.message || err.message || String(err);
        console.error(`Failed:  ${prop.name} — ${msg}`);
      }
    }
  }

  console.log('\nDone.');
}

main();
