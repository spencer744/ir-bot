# HubSpot Integration

## Overview

HubSpot integration is **server-side only**; there is no client token. The backend creates/updates contacts and properties, and triggers workflows via the HubSpot API. Sync happens at:

- **Register (gate)** — Create or update contact; persist `hubspot_contact_id`.
- **Chat** — When the AI emits a `:::hubspot` block, the server updates the contact by email (or by stored contact ID when available).
- **PPM request** — Create/update contact, set PPM-related properties, then workflows (task, note, properties).
- **Indicate interest** — Create/update contact, set interest properties, then workflows.
- **Analytics heartbeat** — When `hubspotContactId` is present, evaluate engagement thresholds and update score/note/task as configured.

---

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `HUBSPOT_API_KEY` | No | Single private app token for all HubSpot API calls. If unset, HubSpot calls are skipped and logged only. |
| `HUBSPOT_PORTAL_ID` | No | HubSpot portal (account) ID; used if needed for URLs or reporting. |
| `HUBSPOT_MEETING_URL` | No | Meeting link for “Schedule a call” CTA (e.g. `https://meetings.hubspot.com/gray-capital`). Returned by `GET /api/config`. |
| `HUBSPOT_INSTITUTIONAL_FORM_URL` | No | HubSpot form URL for $2M+ institutional investors. Returned by `GET /api/config` for the institutional CTA. |

All are optional; the app runs without them with logging-only behavior for HubSpot.

---

## Custom properties

Custom contact properties are created by **`scripts/setup-hubspot-properties.js`**. Run once with a HubSpot token:

```bash
cd server && HUBSPOT_API_KEY=your_token node ../scripts/setup-hubspot-properties.js
```

The script creates the following `gc_*` contact properties. Where each is set:

| Property | Set in |
|----------|--------|
| `gc_current_deal` | Gate (registration) |
| `gc_lead_source` | Gate / intake |
| `gc_investment_goal` | Intake / chat (`:::hubspot`) |
| `gc_syndication_experience` | Intake / chat |
| `gc_target_range` | Intake / chat |
| `gc_target_hold_period` | Intake / chat |
| `gc_tax_bracket` | Intake / chat |
| `gc_key_concerns` | Intake / chat |
| `gc_chatbot_notes` | Chat (`:::hubspot`) |
| `gc_ppm_requested` | PPM request |
| `gc_interest_indicated` | Indicate interest |
| `gc_indicated_amount_range` | Indicate interest |
| `gc_deal_room_time_spent` | Engagement / heartbeat |
| `gc_deal_room_sections_viewed` | Engagement / heartbeat |
| `gc_deal_room_chat_messages` | Engagement / heartbeat |
| `gc_deal_room_engagement_score` | Engagement / heartbeat |
| `gc_deal_room_last_visit` | Engagement / heartbeat |
| `gc_deal_room_video_watched_pct` | Engagement |

---

## Flows

### Gate (register)

- Create or update HubSpot contact by email (and optional name, phone).
- Set `gc_current_deal` (and any gate-level fields).
- **Persist `hubspot_contact_id`** on the investor/session so later syncs and heartbeats use the same contact.

### Chat

- When the AI response contains a `:::hubspot` block, the server parses extracted fields and **updates the contact by email** (or by stored `hubspot_contact_id` when available).
- Properties such as `gc_investment_goal`, `gc_target_range`, `gc_chatbot_notes`, etc. are updated from extracted values.

### PPM request / Indicate interest

- Create or update contact (by email or stored ID).
- Set PPM-related properties (`gc_ppm_requested`) or interest properties (`gc_interest_indicated`, `gc_indicated_amount_range`).
- Trigger HubSpot workflows (e.g. create task, add note, update lifecycle or other properties).

### Heartbeat (analytics)

- When the request includes **`hubspotContactId`** (because it was stored at register and returned to the client), the server evaluates engagement thresholds and can:
  - Update engagement properties (`gc_deal_room_*`).
  - Create a note or task in HubSpot when thresholds are met.

If `hubspot_contact_id` is not persisted and returned, heartbeat cannot associate activity with a HubSpot contact and engagement scoring/workflows will not run for that user.

---

## Rate limits

HubSpot private apps are subject to **per-portal rate limits**. See [HubSpot API rate limits](https://developers.hubspot.com/docs/api/usage-details#rate-limits). Deal room usage is low (registration, chat extractions, PPM/interest, and periodic heartbeats), so typical traffic stays well within limits. If you add heavy server-side sync (e.g. bulk backfills), consider batching and backoff.

---

## Dormancy Data Feed

The API exposes a dormant investors endpoint for use as a HubSpot workflow data feed:

```
GET /api/analytics/admin/dormant-investors?days=14
```

**Auth:** Requires admin JWT (`requireAdmin`).

**Query params:**
- `days` (optional, default: 14) — Investors with no heartbeat in this many days.

**Response:**
```json
{
  "dormant_investors": [
    {
      "investor_id": "uuid",
      "email": "investor@example.com",
      "name": "John Smith",
      "last_seen": "2026-03-15T14:30:00Z",
      "deal_slug": "parkview-commons",
      "engagement_score": 42
    }
  ],
  "count": 3,
  "days": 14,
  "cutoff": "2026-03-17T03:25:00Z"
}
```

**HubSpot workflow integration:**
- Set up a scheduled workflow or Zap to call this endpoint daily
- For each dormant investor, trigger a re-engagement email sequence
- Use `engagement_score` to prioritize: high-score dormant investors are most valuable
- Use `deal_slug` to personalize the re-engagement content

---

## Investor Readiness

The engagement scoring system classifies investors into readiness tiers, synced to HubSpot via the `gc_investor_readiness` contact property:

| Tier | Criteria | HubSpot Action |
|------|----------|----------------|
| **hot** | Score ≥ 80 OR PPM requested | High-priority IR outreach |
| **warm** | Score ≥ 60 AND sections ≥ 4 | Standard follow-up sequence |
| **cold** | Everything else | Nurture sequence |

The scoring formula:
- `sections_viewed × 8` (max 48)
- `+ min(chat_messages × 5, 25)`
- `+ min(floor(time_seconds/60) × 2, 15)`
- `+ ppm_requested ? 20 : 0`
- `+ interest_indicated ? 25 : 0`
- Capped at 100

Properties synced per heartbeat: `gc_deal_room_engagement_score`, `gc_deal_room_sections_viewed`, `gc_deal_room_time_spent`, `gc_deal_room_chat_messages`, `gc_deal_room_last_visit`, `gc_investor_readiness`.

---

## Optional / future

- **Manual “Sync to HubSpot” button** — Only add if product requests it; not in current scope.
- **MCP or other external tools** — Out of scope for this integration doc.
- **Lifecycle / deals** — Mapping deal room visitors or “PPM requested” to HubSpot lifecycle stages or deal pipeline is phase 2.
