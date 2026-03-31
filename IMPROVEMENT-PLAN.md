# IR Deal Room — Improvement Plan
_Based on focus group findings. For Spencer + Nix review._
_March 31, 2026_

---

## Priority Tiers

### 🔴 TIER 1 — Ship Before First Real Investor
These are blockers. Don't send to real investors until these are done.

---

#### T1-A: Returning Investor Fast-Pass
**Problem:** Every repeat investor (David persona, existing GC LPs) must go through the full Gate → Intake → Hub flow as if it's their first visit. For someone who's invested $500K with you 3x, this is insulting.

**Fix:**
- On Gate page: check if email exists in Supabase `investors` table
- If yes: skip Gate form, show "Welcome back, [Name] — Click to access [Deal Name]" one-click entry
- Issue a new JWT with `is_returning: true` and `prior_investment_count` populated
- Skip Intake quiz entirely for returning investors
- AI greeting acknowledges their history: "Welcome back David. You've invested in 3 prior Gray Capital deals. Here's what's different about this one."

**Effort:** ~4 hours  
**Files:** `client/src/components/gate/Gate.tsx`, `server/src/routes/auth.js`, `server/src/services/systemPrompt.js`

---

#### T1-B: Auto-Fill Modals from Gate Data
**Problem:** Investors enter name/email up to 3 times in one session — Gate, Indicate Interest modal, PPM Request. Redundant and friction-y.

**Fix:**
- After Gate registration, store `{name, email, phone, investment_range}` in DealContext
- Indicate Interest modal: pre-fill name, email, pre-select amount range from intake answer
- PPM Request modal: pre-fill name, email, skip accredited checkbox (already verified at Gate)
- Schedule Call modal: pre-fill name, email

**Effort:** ~2 hours  
**Files:** `client/src/context/DealContext.tsx`, `client/src/components/hub/IndicateInterestModal.tsx`, any PPM/Schedule modals

---

#### T1-C: Consolidated Risks & Considerations Section
**Problem:** Excellent risk content exists but it's scattered — chat KB, Market spoke's MarketRisks component, Financial Explorer disclaimers, fine print. Jennifer persona has to piece it together. This is also a real compliance consideration.

**Fix:**
- Add a dedicated "Risks & Considerations" card to the Hub (either as a 7th spoke or as a section between the hub hero and the spoke grid)
- Pull from existing content — no new writing needed:
  - Illiquidity disclosure (front and center): "Your capital is committed for 5-7 years with no secondary market"
  - Key risks with mitigation (from `faq-risk-downside.md`)
  - Conservative scenario summary (from Financial Explorer)
  - Monte Carlo loss probability (what % of simulations show <1x equity multiple?)
  - Fee summary calculator: "At your investment amount of $X, total estimated fees are approximately $Y over the hold period"
- This section is readable in 3 minutes and answers Jennifer's hard questions before she has to ask

**Effort:** ~6 hours  
**Files:** New `client/src/components/hub/RisksSection.tsx`, `client/src/pages/DealRoom.tsx`

---

#### T1-D: Fee Calculator (Dollars, Not Percentages)
**Problem:** Fees disclosed as "1.5% acquisition fee on purchase price" etc. — investors can't quickly calculate total fee impact on their investment. Jennifer persona specifically called this out as a red flag trigger.

**Fix:**
- Add to Financial Explorer (or Risks section): "Total Fee Impact for Your Investment"
- Based on slider amount, calculate and display:
  - Acquisition fee: $X
  - Asset management fee: $X/year × hold period = $X total
  - Disposition fee: $X (estimated)
  - Construction management fee: $X (estimated, if applicable)
  - **Total fees: $X**
  - **Net to investor if base case hits: $X**
- This turns a potential objection into a transparency win

**Effort:** ~3 hours  
**Files:** `client/src/components/FinancialSpoke.tsx` or new component in Risks section

---

### 🟡 TIER 2 — Ship Before Launch Campaign
These significantly improve the experience but aren't blockers.

---

#### T2-A: Inline Jargon Tooltips
**Problem:** "Class B Value-Add," "cost segregation," "preferred return," "GP promote," "DSCR," "506(c)" all appear without explanation. Robert and Jennifer personas stumble on these.

**Fix:**
- Create a `GlossaryTooltip` component: wraps a term, shows tooltip on hover/tap
- Add to 15-20 key terms across the product: hub, financial explorer, documents, team
- Content is short — 1-2 sentences max per term
- Optionally: add a floating "Glossary" button that opens a full glossary modal

**Effort:** ~4 hours  
**Files:** New `client/src/components/GlossaryTooltip.tsx`, then add throughout

---

#### T2-B: Post-Intake Personalized Recommendation
**Problem:** After completing 6 intake questions, investors just land on the hub. No acknowledgment of their answers, no suggested starting point. Robert persona specifically asked for this.

**Fix:**
- After intake submission, show a brief "Based on your profile" card before entering hub:
  - "You're focused on diversification with a 5-year hold — here's what we suggest exploring first."
  - "Since you're new to real estate, the AI chat is a great starting point. Ask 'How does this deal make money?'"
  - "Your biggest concern is liquidity — start with the Financial Explorer to see projected cash flows."
- 3-4 variant messages based on their answers (not a complex algorithm, just conditionals)

**Effort:** ~3 hours  
**Files:** `client/src/components/gate/Intake.tsx`, `client/src/pages/DealRoom.tsx`

---

#### T2-C: Sources & Uses Table
**Problem:** Margaret persona (institutional) and sophisticated investors expect a standard S&U table: where does every dollar come from and where does it go. Currently buried in documents or absent from Financial Explorer.

**Fix:**
- Add a "Sources & Uses" card to the Financial Explorer or deal overview
- Rows: Purchase Price, Closing Costs, Renovation Budget, Reserves, Working Capital → Total Uses
- Sources: Senior Debt, Equity Raise, GP Co-Invest → Total Sources
- These numbers should come from deal data in Supabase, not hardcoded

**Effort:** ~3 hours  
**Files:** `client/src/components/FinancialSpoke.tsx`, `server/src` (add fields to deal schema if needed)

---

#### T2-D: Debt Detail Card
**Problem:** Loan terms are referenced in KB files but not surfaced in the Financial Explorer UI. Margaret and Jennifer both want to see: loan amount, rate, term, IO period, maturity, LTV, DSCR.

**Fix:**
- Add a "Debt Structure" card to the Financial Explorer
- Shows: lender type (agency/bridge/CMBS), loan amount, interest rate, loan term, IO period, LTV, DSCR at stabilization
- These numbers should come from deal data in Supabase

**Effort:** ~2 hours  
**Files:** `client/src/components/FinancialSpoke.tsx`

---

#### T2-E: AI Chat Source Citations
**Problem:** The AI answers questions from the KB but doesn't tell investors which document the information comes from. Margaret persona wants to verify sources. Jennifer wants to know if it's the legal disclosure vs. marketing copy.

**Fix:**
- After each AI response, show "Sources used in this response: [Deal Overview] [Risk FAQ] [Team Bio]" as small gray pills
- These come from the `kbSelector.js` output — it already knows which files were selected for each query
- Expose the selected KB module names in the chat response metadata

**Effort:** ~3 hours  
**Files:** `server/src/routes/chat.js`, `server/src/services/kbSelector.js`, `client/src/components/ChatMessage.tsx`

---

### 🟢 TIER 3 — Nice to Have / Post-Launch
These improve the product but can wait until after first investor campaign.

---

#### T3-A: Deal Comparison (This Deal vs. Prior GC Deals)
David persona's most requested feature — he wants to quickly see how this deal compares to the ones he already invested in. Show a "How this compares to our previous deals" table in Team or Financial spoke.

**Effort:** ~5 hours | **Priority:** High for repeat investor segment

---

#### T3-B: "Share with Spouse / Advisor" Feature
Robert and Jennifer personas represent a household decision. A "Share this deal room with [email]" feature that sends a co-branded link (with the investor already registered, spouse gets read-only access) would reduce the "my spouse needs to review it" drop-off.

**Effort:** ~4 hours | **Priority:** Medium

---

#### T3-C: Institutional Fast Track
Margaret persona immediately sees this is designed for retail. A prominent "Are you an institutional investor or family office?" path that skips the intake quiz and routes directly to Financial Explorer + Team + Documents would serve her better.

**Effort:** ~3 hours | **Priority:** Medium (only matters if you're actively targeting institutional capital in this product)

---

#### T3-D: Loss Scenario Visualization in Monte Carlo
Jennifer wants to see "what's the probability I lose money?" The Monte Carlo histogram exists but doesn't explicitly show the capital loss probability. Add a red line at 1.0x equity multiple and a callout: "X% of scenarios returned less than invested capital."

**Effort:** ~2 hours | **Priority:** Medium (trust builder for cautious investors)

---

#### T3-E: LP Reference Program
Both Margaret and Jennifer asked for the ability to talk to existing investors. A "Request an LP Reference" CTA (→ form → reviewed by Griffin → connects qualified prospects with willing existing LPs) would be a powerful trust signal.

**Effort:** ~2 hours (just the form + HubSpot workflow) | **Priority:** Medium

---

#### T3-F: URL-Based Deep Links to Spokes
David wants to bookmark the Financial Explorer. Currently URL doesn't change when navigating spokes — you can't deep-link to a specific section. Add route params or hash routing so `/deals/fairmont#financial` goes straight to the Financial Explorer.

**Effort:** ~2 hours | **Priority:** Low (developer convenience more than investor need)

---

## Recommended Sprint Plan

### Sprint 1 (before first investor — ~15 hours)
T1-A: Returning investor fast-pass  
T1-B: Auto-fill modals  
T1-C: Risks & Considerations section  
T1-D: Fee calculator  

### Sprint 2 (before launch campaign — ~15 hours)
T2-A: Inline glossary tooltips  
T2-B: Post-intake personalized recommendation  
T2-C: Sources & Uses table  
T2-D: Debt detail card  
T2-E: AI chat source citations  

### Sprint 3 (post-launch polish — ~16 hours)
T3-A through T3-F as prioritized by real investor feedback

---

## Questions for Spencer to Decide

1. **Institutional tier (T3-C):** Are you actively marketing this to family offices / institutional allocators in this cycle? If yes, T3-C moves to Tier 1. If this is primarily a retail HNW product, leave it as Tier 3.

2. **Orlando's role:** Some of these (especially T1-C fee calculator, intake field alignment) overlap with things Orlando flagged. Does he want to build any of these? Or is this Nix + agents?

3. **Parkview Commons vs. Fairmont/Century:** The app is demoing with "Parkview Commons" which appears to be a test deal. Before sending to real investors, you'll need to load Fairmont or Century deal data into Supabase (or demo data). Is the deal data ready, or does Griffin need to compile it?

4. **506(b) vs. 506(c):** The accredited investor checkbox is self-certification only. If you're running a 506(c) offering (which allows general solicitation), you need to collect actual verification documents (brokerage statement, CPA letter, etc.). If this is 506(b), the checkbox is fine since it's a private offering to pre-existing relationships. Worth confirming with counsel before launch.

5. **AI chat knowledge base for Fairmont/Century:** The KB currently covers Parkview Commons. Before deploying for a real deal, Griffin or the team needs to write the deal-specific KB files (20-30 markdown files). I can template these based on the Parkview structure.

---

_Ready to build Sprint 1 on your go-ahead._
