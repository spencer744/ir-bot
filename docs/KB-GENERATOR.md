# Deal Room KB Generator
_How to generate AI knowledge base files for a new deal._

---

## Overview

The AI chat in the deal room draws from 8 deal-specific markdown files. For each new deal, these files need to be generated and loaded into the admin panel. This document explains what source materials you need and how to generate the files.

---

## What You Need (Source Materials)

Gather these before starting. The more complete the source materials, the better the AI answers will be.

| Document | Required? | What We Extract |
|---|---|---|
| **IC Memo or Investment Memo** | ✅ Required | Investment thesis, target returns, key assumptions, business plan summary |
| **Deal Terms Sheet** | ✅ Required | Preferred return, promote, GP co-invest, hold period, minimum investment, waterfall |
| **Rent Comps Report** | ✅ Required | Submarket rents, vacancy, comparable properties, rent premium evidence |
| **T-12 or NOI Summary** | ✅ Required | Current income/expenses, occupancy, net operating income |
| **Property Details / OM Excerpt** | ✅ Required | Unit mix, amenities, year built, condition, square footage, location description |
| **Market Analysis or Submarket Report** | ✅ Required | Employment base, supply pipeline, demographics, market trends |
| **Cost Seg Study or Estimate** | ⚠️ Helpful | Bonus depreciation, Year 1 tax deduction estimates, 5-7-15-39 year asset breakdown |
| **Financing Term Sheet** | ⚠️ Helpful | Loan amount, interest rate, term, IO period, LTV, DSCR, lender |
| **Renovation Scope / Budget** | ⚠️ Helpful | Per-unit budget, scope (kitchen/bath/flooring/fixtures), expected rent premium, phasing |

**Missing something?** Nix can fill in gaps using market data (FRED, Rentcast, CoStar benchmarks) and Gray Capital's standard assumptions. Flag what's missing and we'll document assumptions clearly in the KB files.

---

## Option A: Claude Project (Recommended)

This is the fastest approach and produces the best results.

### Step 1: Create a Claude Project

1. Go to [claude.ai](https://claude.ai) → **Projects** → **New Project**
2. Name it: `[Deal Name] Deal Room KB — [Month Year]`
3. Upload source documents directly to the project (PDF, DOCX, XLSX all work)

### Step 2: Use This Prompt

Copy and paste this prompt (fill in `[DEAL NAME]`):

```
You are generating knowledge base files for the Gray Capital Interactive Deal Room — an investor-facing web app where prospective LPs explore real estate deals via AI chat and financial tools.

I've attached the source materials for [DEAL NAME]. Your job is to generate all 8 knowledge base markdown files that the AI chat will use to answer investor questions.

The files must be:
- Written for a sophisticated but non-technical investor audience
- Specific (use actual numbers, not ranges or placeholders)
- Honest about risks and downside scenarios — the AI is instructed to never dodge hard questions
- Consistent with each other (same numbers everywhere)
- Between 80-120 lines each

Generate all 8 files in sequence. For each file, output the full markdown content between triple backticks.

FILES TO GENERATE:

1. deal-overview.md — Investment thesis (3-4 paragraphs), key highlights (8-10 bullets), scenario returns table (4 scenarios: conservative/base/upside/strategic with rent growth, exit cap, occupancy, IRR, equity multiple, avg CoC)

2. financial-summary.md — Sources & Uses table, debt terms table (lender type, amount, rate, term, IO period, LTV, DSCR), projected annual cash flow summary, waterfall distribution mechanics with example calculation

3. business-plan.md — Value-add thesis, renovation scope and per-unit budget, rent premium evidence, renovation phasing (units per month), management transition plan, 5-year NOI growth bridge, exit strategy

4. market-analysis.md — MSA overview (population, employment, income, cost of living), submarket vacancy and rent trends, supply pipeline (units under construction, deliveries expected), demand drivers, competitive set analysis, why this submarket

5. property-details.md — Physical description, location and access, unit mix table (floorplans × count × avg size × current rent × market rent), amenities list, recent capex and deferred maintenance, current occupancy and lease expiration profile

6. terms-and-fees.md — Investment terms summary table, fee schedule (all fees with calculation basis), waterfall mechanics in plain English, distribution schedule, subscription process, minimum investment, how to invest

7. sensitivity-context.md — Key assumptions ranked by impact on IRR, what changes the verdict (the 3-4 variables that matter most), downside scenario description, breakeven occupancy, what happens if rates stay high, how Gray Capital has navigated prior downturns

8. cost-seg-tax.md — Cost segregation overview, estimated Year 1 bonus depreciation at property level, example at $100K/$250K/$500K investment amounts across three tax brackets (32%/35%/37%), passive loss utilization guidance, what to tell your tax advisor

Use the attached source materials as your primary source. Where information is missing, note it with [VERIFY] and use Gray Capital's standard assumptions (8% preferred return, 70/30 LP/GP split, no GP catch-up, 5-year hold unless stated otherwise).
```

### Step 3: Review and Edit

Claude will generate all 8 files. Review each for:
- [ ] Numbers match across files (same IRR in overview and financial summary)
- [ ] No [VERIFY] placeholders left unfilled
- [ ] Risk language is honest and accurate
- [ ] Fee schedule is complete and matches the offering
- [ ] Waterfall example calculation is correct

Typical review time: 15-20 minutes.

### Step 4: Upload to Admin Panel

1. Go to `/admin` → **Deals** → select your deal → **KB Manager**
2. Create a new folder: `deal/[deal-slug]/`
3. Upload each file with the exact filename (e.g., `deal-overview.md`)
4. Test the chat — ask 10 questions, verify answers are accurate

---

## Option B: Paste Into Webchat

If you don't have Claude Projects access, paste the source documents and prompt directly into a Claude conversation. Works the same way — slightly more manual to organize the output.

---

## Option C: Nix Generates It

Send Nix the source materials (or confirm they're in SharePoint) and say "generate the KB files for [deal name]." Nix will:
1. Pull from SharePoint if available
2. Cross-reference with Rentcast/FRED for market data
3. Generate all 8 files
4. Flag anything that needs Griffin's input before finalizing

This is the lowest-effort option and produces the most complete files.

---

## After Each Deal Closes

Update these firm-level KB files with new performance data:
- `firm/track-record-full.md` — add the closed deal with final IRR and equity multiple
- `firm/track-record-case-studies.md` — add a case study if the deal had interesting lessons
- `firm/lp-testimonials.md` — add any testimonials from the deal's investors (with permission)

These files are shared across all deals, so updating them improves the AI across all active deal rooms simultaneously.

---

## Checklist: New Deal KB Launch

- [ ] All 8 deal-specific KB files generated and reviewed
- [ ] Numbers consistent across all 8 files
- [ ] No [VERIFY] placeholders remaining
- [ ] Files uploaded to admin panel
- [ ] AI chat tested with 10 standard questions
- [ ] HubSpot properties confirmed working (test investor registration)
- [ ] Deal data in Supabase (price, units, terms, target returns)
- [ ] Documents uploaded (PPM, one-pager, operating agreement)
- [ ] Firm-level KB files current (track record, team bios, testimonials)
