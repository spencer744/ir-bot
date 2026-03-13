# Deal Room — Product, Structure & Deployment

## Overview

The Gray Capital Interactive Deal Room is a web application for prospective LPs to explore a single deal (e.g. Parkview Commons) in a structured way. It combines marketing-style entry (gate + intake) with deep content (hub and spokes), an AI chat advisor, and clear CTAs (schedule meeting, make a commitment, institutional). All key actions are designed to feed HubSpot for CRM and follow-up.

---

## Current structure

### User flows

1. **Investors**
   - Land on `/deals/:slug` (e.g. `/deals/parkview-commons`).
   - **Gate:** Enter email (and optional name/phone) to “enter” the deal room; backend creates/updates HubSpot contact and issues JWT.
   - **Intake:** Short questionnaire (investment goals, experience, target range, etc.); answers can sync to HubSpot.
   - **Hub:** Central view with deal summary, key metrics, deal terms & fees, and six spoke cards.
   - **Spokes:** Property, Market, Business Plan, Team, Financial Explorer, Documents. Each is a self-contained view with charts, tables, and copy.
   - **Chat:** Floating widget; AI answers questions using a three-layer prompt (system + KB + session). Responses can include navigation and HubSpot extraction commands.
   - **CTAs:** Sticky bar and Documents/Team areas: Schedule meeting (HubSpot), Make a commitment (investment portal), institutional $2M+ (HubSpot form).

2. **Admins**
   - **Login:** `/admin/login` (email/password from `ADMIN_EMAILS` / `ADMIN_PASSWORD`).
   - **Dashboard:** Overview; links to deals, KB, investors.
   - **Deals:** List and full editor (overview, media with PDF upload/document roles, financials, etc.).
   - **KB:** Manage knowledge-base markdown files used by the chatbot.
   - **Investors:** List and detail view (from Supabase/demo).

### Data flow

- **Deal + media:** Loaded by slug from Supabase or `demoData.js`. Includes deal terms, waterfall, fees, and media (documents with roles: deck, one-pager, operating agreement, other).
- **Config:** `GET /api/config` returns public CTA URLs (meetings, investment portal, institutional form). No auth.
- **Team/company:** From `server` team routes and demo company data (e.g. operations, track record).
- **Chat:** Messages sent to Express `POST /api/chat`; streaming SSE; optional Anthropic backend. Chat history is in-memory (per session) today.
- **Analytics:** Events and heartbeat sent to `POST /api/analytics/event` and `POST /api/analytics/heartbeat`; server can forward to HubSpot for engagement scoring and workflows.

### Key API surface

| Area | Endpoints | Auth |
|------|-----------|------|
| Public | `GET /api/config`, `GET /api/health` | None |
| Auth | `POST /api/auth/register`, `POST /api/auth/verify` | None / Bearer |
| Deal | `GET /api/deal/:slug` (deal + media) | Optional (investor token for full data) |
| Team | `GET /api/team/company`, etc. | None |
| Chat | `POST /api/chat` | Bearer (investor) |
| Analytics | `POST /api/analytics/event`, `POST /api/analytics/heartbeat` | Bearer (investor) |
| Admin | `/api/admin/*` (deals, media upload, KB, investors) | Bearer (admin) |

---

## Current integrations

### HubSpot

- Contact ID is persisted and returned so engagement workflows and heartbeat scoring work; see [docs/HUBSPOT.md](HUBSPOT.md) for details.
- **Contact create/update** on gate registration (email, name, phone, current deal).
- **Property updates** from intake and from chatbot `:::hubspot` extractions (e.g. investment goal, target range).
- **Events** from analytics (section views, PPM requested, schedule call, etc.) and **heartbeats** for engagement; used by engagement scoring and workflows (e.g. PPM requested → notify team).
- **Config-driven links:** Meeting URL, investment portal URL, institutional form URL (no keys in client).
- **Note:** Server code may reference `HUBSPOT_ACCESS_TOKEN` in some places; env is documented as `HUBSPOT_API_KEY` in `.env.example`. Align to a single name (e.g. `HUBSPOT_API_KEY`) for clarity.

### Supabase

- **Deals,** **deal_media,** **investors,** and related tables. Migrations in `server/migrations/`.
- **Optional:** If `SUPABASE_URL` is unset, server uses `demoData.js` for deals and media so the app still runs.

### Anthropic

- **Chat:** Streaming responses with three-layer prompt (system, KB, session). If `ANTHROPIC_API_KEY` is unset, chat returns canned demo responses.

---

## Future HubSpot integration

- **Forms:** Institutional $2M+ and any other HubSpot forms are linked from the app; submission and tagging are handled in HubSpot. Optional: server-side webhook to receive form posts and update internal state or trigger workflows.
- **Meetings:** Schedule-a-call uses `HUBSPOT_MEETING_URL`; no change needed beyond config.
- **Lifecycle / deals:** Later phase could map “deal room visitors” or “PPM requested” to HubSpot lifecycle stages or deal pipeline; keep as phase 2.

---

## API integration (future)

- **Public API:** If you expose a small read-only API (e.g. deal summary, health), add API keys or scoped tokens and rate limits; document here and in README.
- **Internal:** Keep `/api` as the single backend; document any new routes and whether they are public, investor, or admin.

---

## Deployment plan

### Hosting

- **Chosen:** **Railway** at **https://dealroom.graycapitalllc.com** (see [HANDOFF.md](HANDOFF.md)).
- Alternatives for reference: single host (Express serving `dist/`), static + API split, or other PaaS (Render, Fly).

### DNS & SSL

- Point **dealroom.graycapitalllc.com** to the Railway service (CNAME or A record per Railway's instructions).
- **TLS:** Use platform-managed SSL or Let’s Encrypt; enforce HTTPS.

### Build & run

- **Client:** `cd client && npm run build` → output in `client/dist/`.
- **Server:** `NODE_ENV=production`, `CLIENT_URL=https://dealroom.graycapitalllc.com`. Run with `node src/index.js` (or `npm start` if added). On Railway, serve static from `dist/` or use Railway's build/serve setup.
- **Secrets:** All configuration via environment variables; no `.env` in repo. Use platform secrets or a vault.

### Database

- Use a **production Supabase** project (or prod DB). Run migrations from `server/migrations/`. Set `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_KEY` (for admin/upload paths that need elevated access).

### Post-deploy

- **Smoke test:** Load gate → register → open hub → load deal → send chat message; confirm HubSpot (if configured).
- **Monitoring:** Use `GET /api/health` for uptime checks; add alerting as needed.

---

## Public availability

- **Public:** The **gate** (landing for a deal) is public: anyone can open the URL and see the deal name, hero, and “Enter deal room” (email). No confidential data.
- **Gated:** The **hub and spokes** require registration (JWT). So “available to the public” = anyone can discover and reach the gate; only registered users get into the deal room.
- Optional later: invite-only links (e.g. token in URL) for specific campaigns.

---

## Security, code quality, and hardening

See **docs/DEPLOYMENT_CHECKLIST.md** for a concise list of security recommendations, code improvements (validation, typing, chat persistence, tests), and the ordered path from MVP to fully deployed production.
