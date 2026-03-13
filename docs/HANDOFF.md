# Handoff — Deal Room to Dev

Use this doc to onboard the developer and finish deployment to production.

---

## Hosting & URL (decided)

| Item | Value |
|------|--------|
| **Host** | Railway |
| **Production URL** | **https://dealroom.graycapitalllc.com** |

- **CLIENT_URL** in production must be set to: `https://dealroom.graycapitalllc.com`
- DNS: point `dealroom.graycapitalllc.com` to the Railway service. Railway can provide the target (e.g. CNAME or A record); use Railway’s SSL (automatic with their custom domain).

---

## First code fix: HubSpot env var

- **Issue:** `server/src/services/hubspot.js` reads `process.env.HUBSPOT_ACCESS_TOKEN`, but `server/.env.example` (and deployment) use **`HUBSPOT_API_KEY`**.
- **Task:** In `hubspot.js`, use `HUBSPOT_API_KEY` (e.g. `process.env.HUBSPOT_API_KEY`) so one env var is used everywhere. Update the comment at the top of the file to say `HUBSPOT_API_KEY`.
- Then ensure HubSpot contact ID is stored and returned so workflows and engagement scoring work (see [docs/HUBSPOT.md](HUBSPOT.md)).

---

## First tasks for dev (in order)

1. **HubSpot env** — Change `hubspot.js` to use `HUBSPOT_API_KEY` (see above).
2. **Persist and return hubspot_contact_id** — From register and verify (see [docs/HUBSPOT.md](HUBSPOT.md)).
3. **Input validation** — Add request validation (Zod or Joi) for auth, chat, and admin routes (body, query, params).
4. **npm audit** — Run `npm audit` in `client` and `server`; fix high/critical vulnerabilities.
5. **Deploy to Railway** — Use [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md). Set production env vars on Railway; `CLIENT_URL=https://dealroom.graycapitalllc.com`.
6. **Supabase** — Production project; run migrations `001` → `006` in `server/migrations/` in order.
7. **Smoke test** — Gate, register, hub, one chat, one CTA; confirm HubSpot if configured.

---

## Production env checklist (what to set on Railway)

Set these in Railway’s environment (no secrets in repo):

| Variable | Example / notes |
|----------|------------------|
| `NODE_ENV` | `production` |
| `PORT` | Railway often sets this; keep default if so |
| `JWT_SECRET` | Strong random secret (generate new for prod) |
| `CLIENT_URL` | `https://dealroom.graycapitalllc.com` |
| `SUPABASE_URL` | Production Supabase project URL |
| `SUPABASE_ANON_KEY` | Production anon key |
| `SUPABASE_SERVICE_KEY` | Production service role key (for admin/upload) |
| `ANTHROPIC_API_KEY` | For live chat (optional; demo mode without it) |
| `HUBSPOT_API_KEY` | HubSpot private app token (optional; logging without it) |
| `HUBSPOT_MEETING_URL` | e.g. `https://meetings.hubspot.com/gray-capital` |
| `HUBSPOT_INSTITUTIONAL_FORM_URL` | HubSpot form URL for $2M+ institutional (when created) |
| `INVESTMENT_PORTAL_URL` | e.g. `https://investors.appfolioim.com/graycapitalllc` |
| `ADMIN_EMAILS` | Comma-separated admin emails |
| `ADMIN_PASSWORD` | Strong password; never commit |

---

## HubSpot setup (optional before deploy)

- **Custom properties:** Run once with a HubSpot token:  
  `cd server && HUBSPOT_API_KEY=your_token node ../scripts/setup-hubspot-properties.js`  
  (Script accepts either `HUBSPOT_API_KEY` or `HUBSPOT_ACCESS_TOKEN`.)
- **Institutional form:** Create the $2M+ form in HubSpot, get the form URL, set `HUBSPOT_INSTITUTIONAL_FORM_URL` on Railway.

---

## Docs reference

- **[README.md](../README.md)** — Quick start, env, structure.
- **[CLAUDE.md](../CLAUDE.md)** — Architecture, conventions, dev workflow.
- **[DEAL_ROOM.md](DEAL_ROOM.md)** — Product, integrations, deployment options.
- **[DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)** — Full pre-deploy, deploy, post-deploy checklist.
