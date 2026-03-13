# Gray Capital Interactive Deal Room

Interactive investor deal room for Gray Capital, a private equity real estate firm focused on Midwest multifamily. Prospective LPs explore deals through a hub-and-spoke interface, Financial Explorer, and an AI-powered chatbot. Interactions sync to HubSpot for CRM intelligence.

---

## Tech stack

| Layer   | Stack |
|--------|--------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS 4, Framer Motion, Recharts |
| Backend  | Node.js, Express 5 |
| AI       | Anthropic Claude (streaming); optional, demo mode without key |
| Database | Supabase (PostgreSQL); optional, demo data fallback |
| CRM      | HubSpot; optional, logging fallback |
| Auth     | JWT (24h), localStorage |

---

## Prerequisites

- **Node.js** 18+
- **npm**

Optional for full functionality: Supabase project, HubSpot private app token, Anthropic API key. The app runs in demo mode without them.

---

## Quick start

```bash
# Clone and install
git clone <repo-url>
cd "IR Bot"

# Client
cd client && npm install
cd ..

# Server
cd server && npm install
cd ..
```

**Run development (two terminals):**

```bash
# Terminal 1 — API (port 3001)
cd server && node src/index.js

# Terminal 2 — Frontend (port 5173)
cd client && npm run dev
```

Open **http://localhost:5173**. Default route redirects to `/deals/parkview-commons`.

---

## Environment

Copy `server/.env.example` to `server/.env` and set values.

| Variable | Required | Notes |
|----------|----------|--------|
| `JWT_SECRET` | Yes (production) | Strong secret for signing JWTs |
| `SUPABASE_URL`, `SUPABASE_ANON_KEY` | No | Omit for demo data |
| `HUBSPOT_API_KEY` | No | HubSpot private app token; omit for logging-only mode |
| `HUBSPOT_PORTAL_ID` | No | HubSpot portal ID (optional) |
| `HUBSPOT_MEETING_URL` | No | Meeting link for “Schedule a call” CTA |
| `HUBSPOT_INSTITUTIONAL_FORM_URL` | No | HubSpot form URL for $2M+ institutional CTA |
| `ANTHROPIC_API_KEY` | No | Omit for canned chat responses |
| `CLIENT_URL` | Production | e.g. `https://graycapitalllc.com` |

HubSpot env vars are optional; the app runs without them with logging only. See `server/.env.example` for admin access and other optional keys. Full HubSpot integration details: [docs/HUBSPOT.md](docs/HUBSPOT.md).

---

## Project structure

```
IR Bot/
├── client/          React frontend (Vite, port 5173)
├── server/          Express API (port 3001), kb/, migrations/
├── scripts/         Utility scripts (e.g. HubSpot setup)
├── docs/            Product and deployment docs
└── CLAUDE.md        Conventions, architecture, and dev workflow
```

- **Investor app:** `/deals/:slug` — Gate → Intake → Hub + 6 spokes (Property, Market, Business Plan, Team, Financial Explorer, Documents), chat, CTAs.
- **Admin:** `/admin` — Dashboard, deal CRUD, media/KB, investors.

---

## Scripts

| Where   | Command | Description |
|---------|---------|-------------|
| client  | `npm run dev` | Dev server (Vite) |
| client  | `npm run build` | Production build → `dist/` |
| client  | `npm run preview` | Preview production build |
| server  | `node src/index.js` | Run API (add `npm run dev` with nodemon if desired) |

---

## Documentation

- **[CLAUDE.md](CLAUDE.md)** — Architecture, patterns, conventions, design system, and development workflow. Primary reference for contributors.
- **[docs/DEAL_ROOM.md](docs/DEAL_ROOM.md)** — Deal room product description, current structure, integrations, and deployment plan.
- **[docs/DEPLOYMENT_CHECKLIST.md](docs/DEPLOYMENT_CHECKLIST.md)** — Checklist from MVP to production.
- **[docs/HANDOFF.md](docs/HANDOFF.md)** — Handoff for dev: Railway, dealroom.graycapitalllc.com, first tasks, production env.

---

## License

Proprietary — Gray Capital.
