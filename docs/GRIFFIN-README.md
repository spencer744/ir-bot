# IR Deal Room — Griffin's Guide
_Investor Relations team reference. Last updated: March 31, 2026._

---

## What This Is

The Gray Capital Interactive Deal Room replaces pitch decks for new deal raises. Investors get a deal-specific URL, create an account, and explore the opportunity through a hub-and-spoke interface with an AI advisor. Every investor interaction syncs to HubSpot so you know exactly where each LP is in the funnel.

The live demo uses **Parkview Commons** (test deal). Real deals — Fairmont, Century, and future raises — get their own deal rooms with deal-specific content.

**Live at:** `dealroom.graycapitalllc.com` (once deployed to Railway — see deployment docs)  
**Admin panel:** `/admin` (requires admin credentials)

---

## Your Day-to-Day

### Sending Investors to the Deal Room

Send investors a deal-specific URL: `https://dealroom.graycapitalllc.com/deals/[deal-slug]`

- Fairmont → `/deals/fairmont`
- Century → `/deals/century-purdue`

The investor clicks, enters their email, and the system handles the rest. You'll see them appear in HubSpot automatically.

### Monitoring Engagement in HubSpot

Every investor who enters the deal room creates or updates a HubSpot contact with these properties:

| HubSpot Property | What It Means |
|---|---|
| `gc_current_deal` | Which deal they're looking at |
| `gc_deal_room_engagement_score` | 0-100. Above 60 = warm. Above 80 = hot. |
| `gc_deal_room_sections_viewed` | How many of the 6 spokes they opened |
| `gc_deal_room_time_spent` | Total seconds in the deal room |
| `gc_deal_room_chat_messages` | Number of AI chat messages sent |
| `gc_investor_readiness` | Auto-set: "cold" / "warm" / "hot" |
| `gc_ppm_requested` | true if they clicked the PPM button |
| `gc_interest_indicated` | true if they submitted an Indicate Interest form |
| `Gc_indicated_amount_range` | Their indicated investment amount |
| `gc_deal_room_last_visit` | When they last opened the deal room |

**Hot follow-up trigger:** When `gc_investor_readiness` flips to "hot", reach out within 24 hours. They're engaged.

**Dormancy flow:** Investors with no activity in 14+ days can be pulled via `GET /api/admin/dormant-investors?days=14`. Orlando is wiring a HubSpot re-engagement workflow to this endpoint.

### The Admin Panel

Go to `/admin` → **Investors** tab to see a list of all registered investors, their engagement scores, sections visited, and time spent.

The **Deals** tab is where you manage deal content. You can edit deal terms, upload documents, manage the knowledge base, and view analytics.

**Knowledge Base (KB):** The AI chat draws from markdown files you can edit in the admin panel under the KB Manager. If an investor asks a question the AI is getting wrong, you can update the relevant KB file directly.

---

## Launching a New Deal

### Step 1: Create the Deal in Admin

1. Go to `/admin` → **Deals** → **New Deal**
2. Fill in: deal name, slug (URL-friendly, e.g., `fairmont`), location, units, class, year built
3. Upload deal documents (PPM, one-pager, financials) — PDF only
4. Add financial data (purchase price, equity raise, target IRR, hold years, etc.)

### Step 2: Load the Knowledge Base

The AI chat needs deal-specific knowledge to answer investor questions accurately. This is the most important setup step.

**What you need to provide (send to Nix or use the KB Generator tool):**

| Source Document | What We Extract |
|---|---|
| IC Memo or Investment Memo | Investment thesis, returns, key assumptions |
| Rent Comps / Market Report | Submarket data, vacancy, supply pipeline |
| T-12 or NOI Summary | Current financials, expense breakdown |
| Deal Terms Sheet | Waterfall, fees, preferred return, hold period |
| Property Details / OM Excerpt | Unit mix, amenities, condition, location |
| Cost Seg Study or Estimate | Depreciation schedule, tax benefits |

**The KB Generator (see docs/KB-GENERATOR.md):** Once you have the above materials, paste them into Claude (or use the skill) and it outputs all 8 KB markdown files pre-formatted and ready to upload.

**What gets generated (8 files):**

| File | Content |
|---|---|
| `deal-overview.md` | Thesis, key metrics, scenario returns table |
| `financial-summary.md` | Full waterfall, S&U table, debt terms, distribution schedule |
| `business-plan.md` | Renovation scope, phasing, rent premiums, 5-year timeline |
| `market-analysis.md` | Submarket data, employment, supply/demand, rent comps |
| `property-details.md` | Unit mix, amenities, physical condition, location |
| `terms-and-fees.md` | Fee schedule, waterfall mechanics, subscription minimum |
| `sensitivity-context.md` | Key assumptions, what changes the verdict, risk factors |
| `cost-seg-tax.md` | Depreciation schedule, cost seg estimates, tax benefits |

Upload these via Admin → KB Manager → select the deal.

**Firm-level KB files** (team, track record, philosophy, testimonials) are shared across all deals and pre-loaded. Review and update these quarterly or after major milestones (new deal closes, track record update, team changes).

### Step 3: Test the AI Chat

Before going live:
1. Log in as a test investor
2. Ask the AI 10 common investor questions:
   - "What's the minimum investment?"
   - "What's the preferred return?"
   - "What are the fees?"
   - "What happens if the deal underperforms?"
   - "How does the waterfall work?"
   - "What is the business plan?"
   - "How long will my money be locked up?"
   - "What's the market like in [city]?"
   - "What are the risks?"
   - "How do I invest?"
3. If any answer is wrong or incomplete, update the relevant KB file

### Step 4: Test HubSpot Sync

1. Register a test investor with your own email
2. Go through the intake quiz
3. Open all 6 spokes
4. Click "Indicate Interest"
5. Check HubSpot — your contact should show all the gc_* properties populated
6. Confirm `gc_investor_readiness` updated appropriately

### Step 5: Send to Investors

Use the deal-specific URL: `https://dealroom.graycapitalllc.com/deals/[slug]`

**Recommended outreach sequence:**
1. **Day 0:** Send URL with a brief personal note — "I wanted you to be among the first to see this opportunity. The deal room walks you through everything."
2. **Day 3:** Check HubSpot — if `gc_deal_room_sections_viewed` ≥ 3 but no PPM request, follow up personally
3. **Day 7:** If `gc_investor_readiness` = "hot", call directly
4. **Day 14:** If no activity, dormancy workflow kicks in (re-engagement email via HubSpot)

---

## HubSpot Integration Notes (for Orlando)

**Custom properties to verify are created:**
- All `gc_*` properties listed in the table above
- Run `HUBSPOT_API_KEY=your_token node scripts/setup-hubspot-properties.js` to create them

**Workflows to build in HubSpot:**
1. **Hot investor alert** → When `gc_investor_readiness` = "hot" → notify Griffin via email/task
2. **PPM requested** → When `gc_ppm_requested` = true → send PPM download link + create follow-up task
3. **Interest indicated** → When `gc_interest_indicated` = true → notify IR team, start subscription process
4. **Dormancy re-engagement** → Pull from `GET /api/admin/dormant-investors?days=14` → enroll in re-engagement sequence
5. **High engagement** → When `gc_deal_room_engagement_score` ≥ 60 → add to hot follow-up list

**API endpoint for dormancy workflow:**
```
GET https://dealroom.graycapitalllc.com/api/admin/dormant-investors?days=14
Authorization: Bearer [admin_token]

Returns: [{investor_id, email, name, last_seen, deal_slug, engagement_score}]
```

---

## Frequently Asked Questions

**Q: Can an investor revisit the deal room?**  
A: Yes. If they registered with their email, they can click the deal link again and re-enter. The AI will greet them by name and reference what they explored last time.

**Q: Can I see what investors are asking the AI chat?**  
A: Not currently in the admin panel, but chat messages are logged in Supabase. This is on the roadmap.

**Q: What if an investor asks about something the AI gets wrong?**  
A: Update the KB file in Admin → KB Manager. Changes take effect immediately — no redeployment needed.

**Q: Can two investors share the same email?**  
A: No — email is the unique identifier. Each investor needs their own email.

**Q: Can I invite someone to view the deal room without them registering?**  
A: Not currently. Registration (email + accredited checkbox) is required. A "read-only preview" mode is on the roadmap for advisors/attorneys reviewing on behalf of a client.

**Q: What if the AI mentions Parkview Commons for a different deal?**  
A: The AI draws from deal-specific KB files. As long as the correct KB is loaded for the deal, it won't reference other deals. Double-check the KB is loaded correctly via Admin → KB Manager.

---

## Known Gaps (Sprint 2 — Coming Soon)

These are in the improvement plan but not yet built:

- **Returning investor fast-pass** — existing LPs currently have to go through Gate/Intake again. Fix planned.
- **Auto-fill modals** — investors currently have to re-enter name/email in some popups. Fix planned.
- **Consolidated Risk section** — risk content is split across chat and Market spoke. Being consolidated.
- **Fee calculator in dollars** — shows % not dollar amounts. Fix planned.
- **Institutional fast track** — high-value investors can skip retail intake. Planned.

---

## Contacts

| Question | Who to Ask |
|---|---|
| HubSpot workflow / CRM | Orlando (contractor) |
| Code bugs / new features | Nix |
| Deal content / KB files | Griffin (you) + Nix for generation |
| Railway deployment / hosting | Nix |
| Legal / compliance (506(b) vs 506(c)) | SEC counsel |
