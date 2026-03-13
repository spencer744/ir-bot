# In-Spoke Navigation — Plan

## Goal
When exploring a deal (Property Deep Dive, Market Analysis, etc.), users can jump to other sections without returning to "Explore the Deal". Navigation should be clean, modern, seamless, and obviously useful.

## Current State
- **Hub** (`Hub.tsx`): Six SpokeCards; clicking sets `currentSection` and scrolls to top.
- **StickyBar** (`StickyBar.tsx`): Shows when `scrollY > 200`. When `currentSection !== 'hub'` it shows: Back (→ hub), deal name, metrics, Indicate Interest. **No links to other spokes.**
- **SpokeLayout**: "Back to Deal Overview" button only; no section-to-section nav.
- **DealContext**: `currentSection`, `setCurrentSection()` drive which view is shown (`DealRoom` renders Hub vs SpokeRouter).

## Design Direction (modern, sleek, on-brand)
- **Pattern**: Fixed top bar when in a spoke, with a **horizontal section nav** (pill-style or compact tabs). Reuse design tokens: `gc-bg`, `gc-surface-elevated`, `gc-border`, `gc-accent`, `gc-text`, `gc-text-secondary`.
- **References**: Linear / Vercel dashboard — compact pills; one active (accent or elevated background); hover states; optional icons for scannability.
- **Responsive**: Desktop — full labels or icon+label; mobile — horizontal scroll strip of pills (no collapse so it stays obvious).

## Implementation Plan

### 1. Shared spokes constant
- **File**: `client/src/constants/spokes.ts` (new).
- Export a single `SPOKES` array: `{ id, title, shortTitle?, icon }` (icon as Lucide component name or reference so both Hub and SectionNav can use it).
- **Hub.tsx**: Import SPOKES from here instead of defining locally (optional refactor to avoid duplication).

### 2. SectionNav component
- **File**: `client/src/components/layout/SectionNav.tsx` (new).
- **Props**: `currentSection`, `onSectionChange(sectionId)`, optional `trackEvent`.
- **UI**: Horizontal row of 6 section buttons. Active: accent or surface-elevated + border; inactive: text-secondary, hover text. Use same icons as Hub (Building2, BarChart3, Calculator, Wrench, Users, FileText).
- **Responsive**: Horizontal scroll on small screens (`overflow-x-auto`, flex, no wrap). Hide or shorten labels on very small if needed; prefer scroll over dropdown so nav stays visible.
- **A11y**: Buttons, aria-current for active.

### 3. StickyBar integration
- **File**: `client/src/components/layout/StickyBar.tsx`.
- **When `currentSection !== 'hub'`**:
  - Show the bar **always** (ignore scroll threshold), so section nav is visible as soon as user enters a spoke.
  - Render SectionNav between the back button/deal name and the metrics/CTA. Layout: `[Back] [Deal name] [SectionNav] [metrics] [Indicate Interest]`.
- **When `currentSection === 'hub'`**: Keep current behavior (show bar only when `scrollY > 200`); do not render SectionNav.
- **Clicks**: SectionNav calls `setCurrentSection(id)` and `trackEvent('spoke_click', { spoke: id })`; scroll to top on section change.

### 4. Polish
- SpokeLayout already has `pt-20`; ensure fixed bar height is consistent (e.g. 3.5rem/14) so content isn’t hidden.
- Ensure no layout shift when switching hub ↔ spoke (bar visibility change).
- Optional: Hub can import SPOKES from `constants/spokes.ts` to avoid maintaining two lists.

## Files to Touch
| File | Action |
|------|--------|
| `client/src/constants/spokes.ts` | Create — SPOKES array |
| `client/src/components/layout/SectionNav.tsx` | Create — section nav UI |
| `client/src/components/layout/StickyBar.tsx` | Modify — show when in spoke, add SectionNav |
| `client/src/components/hub/Hub.tsx` | Optional — import SPOKES from constants |

## Acceptance
- [ ] From any spoke (e.g. Property Deep Dive), user sees a top bar with section nav.
- [ ] Clicking another section (e.g. Market Analysis) switches view without going to hub.
- [ ] "Back to Deal Overview" (or back arrow) still returns to hub.
- [ ] Nav is readable and usable on mobile (scroll or compact).
- [ ] Styling matches design system (dark, accent, no light backgrounds).
