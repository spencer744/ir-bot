# Deployment checklist — MVP to production

Use this list to harden the deal room and deploy to production (e.g. graycapitalllc.com).

---

## Pre-deploy

- [ ] **README & docs** — Root [README.md](../README.md) and [DEAL_ROOM.md](DEAL_ROOM.md) are in place and updated when structure or env changes.
- [ ] **HubSpot env** — Use one env var name everywhere (e.g. `HUBSPOT_API_KEY`). Update `server` code if it still reads `HUBSPOT_ACCESS_TOKEN`. Document in README and `.env.example`.
- [ ] **Input validation** — Add request validation (e.g. Zod or Joi) for auth, chat, and admin routes (body, query, params).
- [ ] **Security pass**
  - [ ] Strong `JWT_SECRET` in production; never commit.
  - [ ] CORS: `CLIENT_URL` set to exact production origin(s); no `*` in production.
  - [ ] Admin: restrict `ADMIN_EMAILS`; strong `ADMIN_PASSWORD`.
  - [ ] Run `npm audit` in `client` and `server`; fix high/critical issues.
  - [ ] No API keys or secrets in client bundle.

---

## Deploy

- [ ] **Host** — Railway. Production URL: **https://dealroom.graycapitalllc.com** (see [HANDOFF.md](HANDOFF.md)).
- [ ] **Supabase** — Production project; run all migrations in `server/migrations/`. Set `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_KEY`.
- [ ] **Build**
  - [ ] Client: `cd client && npm run build`.
  - [ ] Server: runs with `NODE_ENV=production`, `CLIENT_URL=https://<your-domain>`.
- [ ] **DNS** — Point dealroom.graycapitalllc.com to Railway. Enable **SSL** (Railway provides this for custom domains).
- [ ] **Secrets** — Set all env vars on the host (JWT, Supabase, HubSpot, Anthropic, admin, CTA URLs). No `.env` in repo.
- [ ] **Smoke test**
  - [ ] Gate loads; register; reach hub; load deal.
  - [ ] One chat message; one CTA click.
  - [ ] If HubSpot configured: contact created/updated, event visible as desired.

---

## Post-deploy (hardening)

- [ ] **Monitoring** — Use `GET /api/health` for uptime/health checks; add simple alerting if desired.
- [ ] **Chat persistence** — Move chat history from in-memory store to Supabase (or Redis) so it survives restarts and can be audited.
- [ ] **Tests** — Add unit tests for auth and critical services; e2e for gate → hub → one spoke. Prioritize financial copy and numbers.
- [ ] **CI/CD** — On push (e.g. to `main`): install, lint, test, build; deploy to staging then production.

---

## Optional improvements

- **Backend typing** — Migrate server to TypeScript or add JSDoc + strict checks; validate env on startup.
- **Structured logging** — e.g. pino with request id and log levels; no secrets in logs.
- **Rate limits** — Already in place (auth, chat, general); tune if needed for production traffic.
- **File upload** — Already restricted to PDF; consider virus scan for high-security deployments.
