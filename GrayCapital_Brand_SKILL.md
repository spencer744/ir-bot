---
name: gray-capital-brand
description: Use this skill whenever creating any content, design, presentation, document, artifact, or written communication for Gray Capital LLC or Gray Residential. Triggers include any mention of 'Gray Capital', 'Gray Residential', 'GrayCap', investor materials, deal memos, property reports, brand assets, or any work product that will carry the Gray Capital name. Covers visual standards (colors, typography, logo usage) and brand voice/tone for all outputs. Always read this skill before producing Gray Capital branded work.
---

# Gray Capital Brand Skill

This skill contains the official brand standards and voice guidelines for Gray Capital LLC. **Always apply these standards when creating any Gray Capital branded output** — presentations, documents, HTML/React artifacts, emails, investor communications, marketing materials, reports, or any other deliverable.

---

## 1. VISUAL STANDARDS

### 1.1 Color Palette

#### Primary Colors (use as dominant colors in all branded materials)

| Name       | Hex       | RGB            | Use Case                                      |
|------------|-----------|----------------|-----------------------------------------------|
| Dark Teal  | `#003437` | 0, 52, 55      | Primary brand color. Backgrounds, headers, accents |
| White      | `#FFFFFF` | 255, 255, 255  | Text on dark backgrounds, clean backgrounds    |

#### Secondary Colors (use for variety and supporting elements)

| Name         | Hex       | RGB             | Use Case                                    |
|--------------|-----------|-----------------|---------------------------------------------|
| Blue         | `#00344E` | 0, 52, 78       | Alternate dark backgrounds, section variety |
| Dark Purple  | `#390427` | 57, 4, 39       | Accent backgrounds, special sections        |
| Rich Red     | `#4D0805` | 77, 8, 5        | Accent backgrounds, alerts, emphasis        |
| Quick Silver | `#A9A09D` | 169, 160, 157   | Muted text, secondary labels, borders       |
| Light Grey   | `#DADBDC` | 218, 219, 220   | Light backgrounds, dividers, table borders  |
| Soft Blue    | `#D6E2E9` | 214, 226, 233   | Light backgrounds, gradient endpoints       |

#### Gradient Treatments

Use subtle gradients to add depth. Keep them understated — never flashy.

- **Teal gradient**: `#03454A` (0%) → `#003437` (40%), angle 30°
- **Blue gradient**: `#004669` (0%) → `#00344E` (40%), angle 30°
- **Light gradient**: `#D6E2E9` (0%) → `#FFFFFF` (85%), angle 0° (for light page backgrounds)
- **Purple gradient**: `#4F193B` (0%) → `#390427` (40%), angle 30°
- **Red gradient**: `#571411` (0%) → `#4D0805` (40%), angle 30°

#### Color Rules

- Dark Teal + White is the default pairing for all primary branded content.
- On dark backgrounds, always use white text.
- On light/white backgrounds, use Dark Teal for text and headings.
- Never use bright, saturated, or neon colors. The palette is intentionally deep and muted.
- When building charts/data visualizations, use this order: Dark Teal, Blue, Quick Silver, Soft Blue, Dark Purple, Rich Red.

### 1.2 Typography

#### Primary Font: Brother 1816

| Level      | Weight  | Size  | Use                        |
|------------|---------|-------|----------------------------|
| Headline 1 | Thin    | 50pt  | Hero headlines, title slides |
| Headline 2 | Bold    | 29pt  | Section headers             |
| Headline 3 | Light   | 25pt  | Sub-section headers         |
| Sub-Head   | Medium  | 13pt  | Labels, callouts            |
| Body Copy  | Book    | 13pt  | Paragraph text              |

#### Fallback Fonts (in order of preference)

1. **Khula** (Google Font) — Light, Regular, SemiBold, Bold
2. **Century Gothic** — Regular, Bold
3. For web/code artifacts where neither is available: use a clean geometric sans-serif like `'Inter', 'Outfit', 'Plus Jakarta Sans', sans-serif`

#### Typography Rules

- Headlines use uppercase sparingly — primarily for Headline 1 and short labels.
- Body copy is always sentence case.
- Letter-spacing should be slightly open on uppercase text (0.05-0.1em).
- Use thin rule lines (0.3px or 1px in web) as dividers between sections.
- Never use decorative, script, or serif fonts for Gray Capital materials.

### 1.3 Logo / Brandmark

The Gray Capital brandmark consists of:
- **Reticle Icon**: The stylized "G" mark (a circle with a geometric descender)
- **Wordmark**: "GRAY" in bold weight + "CAPITAL" in regular weight, all caps, tracked out

#### Usage Rules

- **On dark backgrounds**: Use the white version of the brandmark (preferred).
- **On light backgrounds**: Use the Dark Teal (`#003437`) version.
- **Clear space**: Always maintain minimum clear space equal to the width of the descender of the "G" in the Reticle icon on all sides.
- **Minimum size**: 1 inch / 72 pixels wide.
- **Horizontal layout**: Icon left of wordmark — use when vertical space is limited.
- **Vertical layout** (default): Icon stacked above wordmark.
- The Reticle Icon can be used standalone as a shorthand when the full brandmark has already appeared or space is constrained.
- **Never** alter proportions, colors (outside approved palette), or spacing of the brandmark.

#### Constructing the Wordmark in Code

When the logo SVG is not available, approximate the wordmark in CSS/HTML:
- "GRAY" in bold/700 weight, "CAPITAL" in regular/400 weight
- All uppercase, generous letter-spacing (0.15-0.2em)
- Use the primary brand font or fallback

### 1.4 Photography & Imagery Guidelines

- **Architecture**: Highlight clean, modern, aspirational multifamily properties. Dynamic crops, daytime shots, clear weather. Avoid dated or unkempt buildings.
- **People**: Reflect the "Risers" audience — confident, professional, engaged. Soft natural lighting, bright modern environments. Avoid overly casual or rigid poses.
- **Blueprint Graphic**: A faint geometric overlay of the Reticle icon construction lines. Use at low opacity on dark backgrounds for subtle texture.

### 1.5 Design Principles

Apply these four attributes to all visual output:

1. **Confident** — Clean layouts with intentional hierarchy. No clutter.
2. **Clean** — Signature style that is familiar and inviting, never trendy.
3. **Progressive** — High-impact contrasting colors, dynamic imagery, detailed craftsmanship.
4. **Elevated** — Professional enough to attract serious investors — individuals, family offices, or institutions.

#### Layout Patterns

- Use generous whitespace. Don't crowd elements.
- Prefer asymmetric layouts with clear focal points.
- Dark teal full-bleed sections alternating with light/white sections create the signature Gray Capital rhythm.
- Use thin (0.3px-1px) rule lines as subtle dividers.
- Data and metrics should be presented in large, bold type with supporting labels in smaller muted text.

---

## 2. BRAND VOICE & TONE

### 2.1 Brand Character: "The Change Agent"

Gray Capital's voice is **sharp, genuine, and carries positive energy**. Apply these three pillars:

#### Pillar 1: Smart but Conversational
- Instill confidence in both veteran and new investors by being professional — but keep things approachable.
- Never come off as finance big wigs or wealthy traditionalists.
- Use plain language to explain complex concepts. Avoid unnecessary jargon, but don't oversimplify for sophisticated investors.

#### Pillar 2: Partnership-First
- Treat each investor as if they're the only one. When they succeed, we all succeed.
- Demonstrate leadership without being sales-y, arrogant, or self-centered.
- Use "we" and "together" language. Gray Capital is a collective, not a firm.

#### Pillar 3: Big Picture with Attention to Detail
- See the forest and the trees. Creative problem solvers investing in the bigger picture and investors' long-game interests.
- Have the ambition to achieve, but never come off as sensational or "get rich quick" promoters.
- Lead with data and transparency to drive real outcomes.

### 2.2 Key Messaging Framework

#### Brand Idea
**"Power in Numbers"** — This phrase captures three dimensions:
- **Power** = Financial freedom, being in control of your life
- **In** = Partnership and collective strength
- **Numbers** = Data-driven, transparent, focused on real outcomes

#### Positioning Statement
> For accredited investors who want to participate in real estate syndication, we are a trusted multifamily real estate investment collective led by industry experts that manage partner investments from start-to-finish so investors can maximize their time and investments and turn their ambitions into achievements.

#### Standard Value Props (what investors expect)
- **Combined Capital for Greater Wealth**: Institutional-quality deals with stellar historical performance
- **Strengthened Portfolio with Cash Flow**: Asset diversification + steady rental income distributions
- **Convenience without Compromise**: Full-service from acquisition through property management

#### Differentiating Value Props (why Gray Capital over others)
1. **Multifamily Specialists**: Deep niche expertise with steady specialized content
2. **Local Advantage**: Select Midwest and Southeast regions with market intelligence and local relationships
3. **True Partnership**: Founding team invests their own capital in every deal, always a phone call away
4. **On-Demand Asset Access**: Partners can follow the buying process, check property stats, receive video walkthroughs
5. **Circle of Doers**: Continuous value-add through property improvements and operational efficiency post-close

### 2.3 Writing Style Rules

#### Do:
- Write in active voice
- Lead with outcomes and benefits, then explain how
- Use specific numbers and data points when available
- Keep sentences concise — aim for 15-25 words average
- Use contractions naturally ("we're", "you'll", "it's") — we're conversational
- Reference partnership language: "together", "collective", "partners", "our investors"

#### Don't:
- Use superlatives without evidence ("best", "greatest", "unmatched")
- Use fear-based or urgency-driven sales language ("don't miss out", "limited time", "act now")
- Use excessive exclamation points
- Use overly formal or stiff corporate language ("pursuant to", "aforementioned", "herewith")
- Promise specific returns or guaranteed outcomes (compliance)
- Use "synergy", "leverage" (as verb), "disrupt", or other overused business buzzwords

#### Tone Calibration by Context:

| Context                  | Tone                                        |
|--------------------------|---------------------------------------------|
| Investor updates         | Transparent, data-forward, reassuring       |
| Marketing / website      | Confident, aspirational, approachable       |
| Deal memos               | Analytical, precise, opportunity-focused    |
| Social media / podcast   | Conversational, educational, engaging       |
| Internal communications  | Direct, collaborative, action-oriented      |
| Formal/legal documents   | Professional, clear, compliant              |

### 2.4 Audience Context: "Risers"

When writing for Gray Capital's primary audience, keep in mind:
- **Demographics**: Older Millennials to GenX+, skews male, $200K+ income, often in tech
- **Mindset**: Ambitious, research-driven, early movers among their peers in RE investing
- **Motivations**: Portfolio diversification, passive income, ownership of tangible large-scale assets
- **Fears**: Missing opportunities, not having enough time to achieve goals, being left behind
- **Tone implications**: Respect their intelligence, give them substance not fluff, make them feel like insiders

---

## 3. APPLICATION CHECKLIST

Before delivering any Gray Capital branded output, verify:

- [ ] Primary colors are Dark Teal (`#003437`) and White — no off-brand colors
- [ ] Typography uses approved font stack (Brother 1816 → Khula → Century Gothic → geometric sans-serif)
- [ ] Headlines have appropriate weight contrast (thin for hero, bold for section headers)
- [ ] Adequate whitespace — nothing feels cramped
- [ ] Voice is confident and conversational, not corporate-stiff or sales-y
- [ ] Data and metrics are prominently displayed when relevant
- [ ] "We" / partnership language used instead of "I" / top-down language
- [ ] No guaranteed-return language or compliance red flags
- [ ] Layout follows Confident → Clean → Progressive → Elevated principles
