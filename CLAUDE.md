# CLAUDE.md — Gray Capital Interactive Deal Room

## Project Overview

This is an interactive investor deal room for Gray Capital, a private equity real estate firm focused on Midwest multifamily. Prospective LPs explore deals through a hub-and-spoke interface with six content sections, an interactive Financial Explorer, and an AI-powered chatbot advisor. Every interaction generates CRM intelligence via HubSpot.

**Live deal:** Parkview Commons — 312-unit multifamily, Indianapolis, IN.

---

## Tech Stack

| Layer | Stack |
|-------|-------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS 4 (`@tailwindcss/vite`), Framer Motion, Recharts, Lucide React |
| Backend | Node.js, Express 5, CommonJS (.js files) |
| AI | Anthropic Claude Sonnet 4 (`claude-sonnet-4-20250514`) with streaming SSE |
| Database | Supabase (PostgreSQL) — optional, falls back to demo mode |
| CRM | HubSpot — optional, falls back to logging |
| Auth | JWT (24h expiry), localStorage session |

---

## Project Structure

```
IR bot/
├── client/                          # React frontend (port 5173)
│   ├── src/
│   │   ├── components/
│   │   │   ├── chat/                # ChatWidget, ChatMessage, ChatInput, etc.
│   │   │   ├── hub/                 # Hub, SpokeCard, StickyBar
│   │   │   ├── spokes/             # PropertySpoke, MarketSpoke, etc. (6 spokes)
│   │   │   ├── financial/          # ScenarioViewer, BenchmarkComparison, etc.
│   │   │   └── shared/             # Reusable components
│   │   ├── contexts/               # DealContext.tsx (global state)
│   │   ├── hooks/                  # useChat.ts, useAnalytics.ts, etc.
│   │   ├── types/                  # deal.ts, investor.ts
│   │   └── utils/                  # formatters, chartTheme, etc.
│   └── package.json
│
├── server/                          # Express backend (port 3001)
│   ├── kb/                          # Knowledge base (34 markdown files)
│   │   ├── system-prompt.md         # Layer 1: always-loaded system prompt
│   │   ├── firm/                    # 12 files: company, team, track record
│   │   ├── faq/                     # 7 files: returns, tax, risk, fees, etc.
│   │   ├── reference/              # 7 files: educational content
│   │   └── deal/parkview-commons/  # 8 files: deal-specific content
│   ├── migrations/                  # SQL schema files (001-005)
│   ├── src/
│   │   ├── routes/                  # auth.js, chat.js, deals.js, team.js, analytics.js
│   │   ├── services/               # kbSelector.js, hubspot.js, analytics.js, engagement.js, workflows.js, demoData.js
│   │   ├── middleware/             # auth.js
│   │   └── config/                # supabase.js
│   └── package.json
│
├── scripts/                         # Utility scripts
│   ├── verify-kb-tokens.js
│   └── setup-hubspot-properties.js
│
└── docs/                            # Build prompts (chunk files)
```

---

## Architecture Patterns

### Hub & Spokes
Central hub at `/deal/:slug` with 6 spoke modules: Property, Market, Business Plan, Team, Financial Explorer, Documents. Each spoke is a self-contained component that fetches its own data.

### Three-Layer Chat System
1. **Layer 1 (system-prompt.md):** Always loaded — role, personality, Gray Capital DNA, compliance rules, HubSpot extraction instructions, navigation commands
2. **Layer 2 (KB modules):** Conditionally loaded based on investor's question — `kbSelector.js` uses regex topic matching to select relevant .md files (budget: 15K tokens)
3. **Layer 3 (session context):** Dynamic — investor profile, current section, sections visited, chat history

### Structured AI Commands
The chatbot uses `:::` fenced blocks for machine-readable commands embedded in responses:
- `:::hubspot` — extract investor data for CRM sync
- `:::navigate` — trigger spoke navigation
- `:::data_request` — request interpolated sensitivity data

Backend `parseResponseCommands()` strips these before displaying to investor.

### Graceful Degradation
Every external service is independently optional:
- No `ANTHROPIC_API_KEY` → chatbot returns canned demo responses
- No `SUPABASE_URL` → all data served from `demoData.js` (in-memory)
- No `HUBSPOT_API_KEY` → HubSpot functions log and skip

### Global State
`DealContext.tsx` manages deal data, investor auth, session tracking, and chat state. All components consume via context hooks.

---

## What's Built (Current Status)

| # | Module | Status |
|---|--------|--------|
| 1 | Project Scaffolding | ✅ Functional |
| 2 | Database Schema & Seed Data | ✅ Functional (5 migrations, demoData.js) |
| 3 | Auth Gate / Intake | ✅ Functional (Gate.tsx, Intake.tsx, JWT) |
| 4 | Hub Layout + Spoke Nav | ✅ Functional (Hub.tsx, 6 spoke cards) |
| 5 | Property Deep Dive | ✅ Functional (6 sub-components) |
| 6 | Market Analysis | ✅ Functional (13 sub-components, Recharts) |
| 7 | Business Plan | ✅ Functional (9 sub-components) |
| 8 | Team & Track Record | ✅ Functional (13 sub-components, 6 API routes) |
| 9 | Documents | ✅ Functional (PPM request, interest indication) |
| 10 | Financial Explorer | ✅ Functional (4 sub-components, sensitivity data) |
| 15 | Knowledge Base Infrastructure | ✅ Functional (34 .md files, kbSelector.js) |
| 16 | Chatbot UI + API | ✅ Functional (streaming SSE, 3-layer prompt) |
| 22-24 | HubSpot + Analytics + Engagement | ✅ Functional (hubspot.js, analytics.js, engagement.js, workflows.js, useAnalytics.ts) |
| 25-29 | Admin Interface | ✅ Functional (dashboard, deal CRUD, 6 editor tabs, KB manager, investor list/detail) |
| 30-32 | Polish (mobile, animations, QA) | 🔲 Not started |

**Total codebase:** ~8,000+ lines across 70+ components, 35 KB files, 8 service modules.

---

## Design System

```
Background:        #0A0A0F (near-black)
Surface:           #141419 (dark cards)
Surface Elevated:  #1C1C24 (hover states, modals)
Border:            #2A2A35 (subtle dividers)
Primary Accent:    #3B82F6 (blue)
Text Primary:      #F0F0F5 (near-white)
Text Secondary:    #9595A5
Muted:             #8B8FA3
Success/Positive:  #34D399 (green)
Warning:           #FBBF24 (amber)
Negative:          #F87171 (red)

Scenario Colors:
Conservative:      #FBBF24 (amber)
Base:              #3B82F6 (blue)
Upside:            #34D399 (green)
Strategic:         #A78BFA (purple)
```

Typography: Inter (headings 700-800, body 400-500), JetBrains Mono (data/numbers)
Animations: Framer Motion `whileInView`, staggered children, 0.4-0.6s duration
Theme: Dark, premium, immersive (Apple-inspired)

---

## Environment Variables

```env
# Required for live AI chat (optional — demo mode without it)
ANTHROPIC_API_KEY=sk-ant-...

# Required for database (optional — demo mode without it)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key

# Required for CRM sync (optional — logging mode without it)
HUBSPOT_API_KEY=your-hubspot-private-app-token

# Auth
JWT_SECRET=your-secret-key
```

---

## Running the Project

```bash
# Install dependencies
cd client && npm install
cd ../server && npm install

# Start development (two terminals)
cd server && npm run dev     # Express on port 3001
cd client && npm run dev     # Vite on port 5173

# Open: http://localhost:5173
```

---

## Build Prompt System

This project is built using detailed chunk prompts stored in the outputs folder. Each prompt specifies exact components, data schemas, API endpoints, seed data, and acceptance criteria.

**Completed chunk prompts (already built into the codebase):**
- Chunks 1-10: Scaffolding, database, auth, hub, all 6 spokes, Financial Explorer data layer
- Chunk 11: Financial Explorer scenario viewer + investment slider
- Chunk 15: Knowledge base infrastructure (34 files + selector engine)
- Chunk 16: Chatbot UI + Anthropic API + three-layer prompt assembly
- Chunks 22-24: HubSpot integration + event tracking + engagement scoring + workflow triggers
- Chunks 25-29: Admin interface (dashboard, deal CRUD, 6 editor tabs, KB manager, investor list/detail)

**Next chunks to build:**
- Chunks 30-32: Mobile polish, animation pass, QA + security review

---

## Key Conventions

### Frontend
- Components live in domain folders: `hub/`, `spokes/`, `chat/`, `financial/`, `shared/`
- TypeScript interfaces in `types/` for all data shapes
- Tailwind for all styling (no separate CSS files)
- Framer Motion for all animations
- Recharts for all data visualizations with shared `chartTheme.ts`
- `DealContext.tsx` is the single source of truth for deal + investor state

### Backend
- CommonJS (require/module.exports) — not ESM
- Routes in `routes/`, business logic in `services/`
- All external services (HubSpot, Supabase, Anthropic) wrapped in service modules with graceful fallbacks
- Demo data in `demoData.js` — serves as the fallback when Supabase is unavailable
- KB files are flat .md files in `server/kb/`, loaded from disk at runtime

### API Patterns
- All investor-facing routes under `/api/`
- Admin routes under `/api/admin/`
- Chat endpoint: `POST /api/chat` with streaming SSE support
- Analytics: `POST /api/analytics/event` and `POST /api/analytics/heartbeat`
- Auth: `POST /api/auth/register`, `POST /api/auth/verify`

### Important Rules
- **Never break demo mode.** Every feature must work without external API keys.
- **Financial accuracy matters.** Numbers must match the sensitivity data or they don't ship.
- **Dark theme everywhere.** No white backgrounds, no light mode.
- **Mobile-first.** All components must be responsive. Chat goes full-screen on mobile.
- **Compliance-aware.** Disclaimers on projections, "past performance" caveats on track record, 506(c) language.

---

## Development Workflow

### Chunked Sub-Agent Builds
When building large features with multiple services/modules, always break the work into chunked sub-tasks using Task sub-agents. Never attempt to build more than 2-3 related modules in a single task context.
1. Create a TodoWrite checklist of all modules upfront before writing code
2. Group into chunks of 2-3 related modules
3. Use a separate Task sub-agent for each chunk, running independent chunks in parallel
4. Mark each task complete immediately after finishing — don't batch completions

### Verification
After completing implementation tasks, always verify changes against the running preview server before marking work as done:
1. Check `preview_logs` and `preview_console_logs` for errors
2. Use `preview_snapshot` to confirm page structure and content
3. Use `preview_click` to test interactive elements
4. Only mark the task complete if all checks pass

### Git Discipline
- Only commit when explicitly asked
- Use descriptive commit messages that reflect what changed and why
- Stage specific files, not `git add -A`

---

## Known Issues / Areas to Address Later
1. Backend is plain JS (no TypeScript) — works but less safe
2. Chat history is in-memory (Map in chat.js) — lost on restart
3. No test coverage — critical for a financial product
4. No rate limiting on endpoints
5. No input validation library (Joi/Zod)
6. No error boundary on frontend
7. No CI/CD or Docker config

These are engineering hardening tasks for post-MVP. Don't try to fix them while building features.
