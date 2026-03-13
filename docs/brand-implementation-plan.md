# Gray Capital Brand Implementation Plan

Reference: `GrayCapital_Brand_SKILL.md` (visual standards, logo usage, typography, voice).

## Current state
- **Logo**: Text-only "GRAY CAPITAL" in Gate, AdminSidebar, AdminLogin; ChatHeader uses "GC" initials.
- **Favicon**: Vite default (`/vite.svg`).
- **Design system** (`index.css`): Dark theme (#0A0A0F, blue accent). Brand skill specifies Dark Teal (#003437) + White; we keep dark deal-room theme and add brand colors/logo.
- **Touchpoints**: Gate, Intake, StickyBar, Hub, ChatHeader, Admin (login + sidebar), App 404, Disclaimer.

## Chunks (sub-agent tasks)

### Chunk 1: Logo asset + shared Logo component ✅
- **Manual step:** Copy the Gray Capital logo PNG to `client/public/logo-graycapital.png` (white on dark for deal room). If the file is missing, the shared `Logo` component falls back to the wordmark (GRAY CAPITAL text).
- `client/src/components/shared/Logo.tsx`: `Logo` (variant, theme, tagline) and `LogoWordmark`; image onError falls back to wordmark.
- Favicon and full logo image both use `/logo-graycapital.png` once the file is in place.

### Chunk 2: Gate + Intake
- Replace text logo in `Gate.tsx` with `<Logo variant="vertical" tagline="Interactive Deal Room" />`.
- In `Intake.tsx` ensure heading/welcome line uses brand voice; add logo if it’s the first screen after gate or keep consistent typography.

### Chunk 3: Deal room chrome
- **StickyBar**: Optionally add small logo or wordmark left side (with deal name); keep existing deal info + nav.
- **Hub**: No logo required in hero (deal-focused); optional small logo in corner if design allows.
- **ChatHeader**: Replace "GC" circle with small logo or approved wordmark; keep "Gray Capital Advisor" text.
- **App.tsx**: On 404/fallback route use `<Logo />` + "Deal Room" in the error message.

### Chunk 4: Admin
- **AdminLogin**: Replace text with `<Logo tagline="Admin Portal" />`.
- **AdminSidebar**: Replace text with `<Logo variant="horizontal" tagline="Admin" />` (compact).

### Chunk 5: Design system
- Add brand color variables to `index.css` (e.g. `--color-gc-brand-teal: #003437`, `--color-gc-brand-white: #FFFFFF`) for optional use; keep existing gc-* for compatibility.
- Add Khula (Google Font) as fallback per skill: `'Khula', 'Inter', ...` for headings.
- **Favicon**: Replace `/vite.svg` with Gray Capital favicon (reticle "G" or small logo); use `client/public/favicon.ico` or `.png` and update `index.html`. *(Done: `index.html` points to `/logo-graycapital.png`; once Chunk 1 adds that asset to `client/public/`, it will serve as the favicon. For a dedicated favicon, add `favicon.ico` or `favicon.png` and switch the link href.)*
- **index.html**: Ensure title/description already say "Gray Capital Deal Room"; add og:image if we have a share image.

### Chunk 6: Footer and remaining touchpoints
- **Disclaimer**: Keep "© YYYY Gray Capital"; optionally add small logo above or inline.
- Any other "Gray Capital" text or headers: ensure consistent styling (no code changes unless replacing with logo where appropriate).

## Execution order
1. Chunk 1 (asset + component) — required for all others.
2. Chunks 2, 3, 4 can run in parallel after Chunk 1.
3. Chunk 5 (design system, favicon) can run in parallel with 2–4.
4. Chunk 6 after 2–5 (quick pass).

## Constraints
- Do not break demo mode or existing behavior.
- Mobile-first: logo scales on small screens (min ~72px width or equivalent for compact variant).
- Use existing `gc-*` Tailwind tokens; add brand tokens only where they improve alignment with brand skill.
