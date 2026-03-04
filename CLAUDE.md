# Evermore Permanent Jewelry — Claude Code Instructions

## Project Overview
- **Type**: Static website (GitHub Pages)
- **Live domain**: `https://evermore-permanentjewelry.com/`
- **Branch**: `main`
- **All active development happens in `staging/`** — never edit root-level HTML files directly

## Key Files
- `staging/assets/css/style.css` — Global design system (single source of truth for all styles)
- `staging/assets/js/main.js` — All interactive JS
- `staging/index.html` — Homepage
- `evermore_photos/` — All photo assets (one folder up from staging)

## Workflow Rules
- **Always work in `staging/`** — the root HTML files are the live published version
- **Never auto-commit** — always ask before creating git commits
- **Preserve all content**: copy, pricing, phone numbers, addresses, and booking links must never change unless explicitly requested
- **Staging banner must remain** on every staging page — do not remove it

## Design Reference & Iteration Process

### Reference Screenshot
**File**: `.claude/design-reference.png` (save the provided screenshot here)
**Source**: Dark luxury jewelry e-commerce site (editorial/magazine style)

The reference is the **primary visual direction** for all design decisions. Adapt — do not copy. Translate every pattern into Evermore's brand identity.

---

### What the Screenshot Shows — Precise Visual Specs

#### Navigation
- Pure black background, no border, no shadow
- Logo wordmark left-aligned, very small and clean
- Nav links: lightweight white text, generous spacing, no underlines
- Utility icons (search, cart) right-aligned
- Overall: invisible/minimal — content is the focus

#### Hero Section
- Full-viewport dark photo hero with deep black overlay
- Headline: large serif display font, **mixed weights within same heading** (e.g. light italic + bold upright in one phrase)
- Suggested size: `clamp(3rem, 7vw, 6rem)` — not the largest element on the page
- Two side-by-side CTAs: one filled (solid dark/gold), one outlined with white border
- Small floating stat badge (circular) in corner — e.g. "4.8K" with descriptor text
- Photo tones: warm brown, terracotta, jewelry close-ups

#### Section Headings — The Key Design Pattern
The most distinctive feature: **section headings are ENORMOUS** — spanning 80–100% of viewport width. This is the primary editorial differentiator.

```css
/* Target heading scale for major sections */
font-size: clamp(3.5rem, 9vw, 8rem);   /* large sections */
font-size: clamp(5rem, 14vw, 12rem);   /* hero-scale sections */
font-weight: 700;
letter-spacing: -0.02em;               /* tight tracking at large sizes */
line-height: 0.95;                     /* very tight leading */
```

Section heading examples from the reference (with Evermore equivalents):
| Reference Heading | Scale | Evermore Equivalent |
|---|---|---|
| "Shop Diamond by Shape" | ~8rem, spans full width | "Shop by Style" — Bracelets, Anklets, Necklaces |
| "Category View" | ~10rem, spans full width | "Our Services" or "What We Do" |
| "OUR WORKS" | ~10rem bold all-caps | "OUR WORK" — portfolio/gallery section |
| "NEW COLLECTION" | ~8rem, split layout | "Now Welding" or seasonal feature |
| "Watch on your hands!" | ~6rem with inline icon | "Wear It Every Day" — lifestyle section |
| "Customers Experiences" | ~6rem serif | "Client Stories" — testimonials |

#### "Shop by Shape" / Style Selector Row
- Horizontal scrolling row of icon + label selectors
- Small circular or geometric icons above each label
- Selected item is bold/highlighted, others are dimmer
- Background: dark, no card borders — items float on black
- **Evermore version**: style categories (Bracelets, Anklets, Necklaces, Hand Chains, Ear Piercings)

#### "Category View" Section
- Massive section label spanning full width
- Small gold accent circle/dot embedded in the heading (decorative gem icon)
- Below: lifestyle/editorial photo (warm tones, model wearing jewelry)
- Category tab row beneath photo: pill-style tabs, selected is white/bold
- Item count displayed ("210 items" → use booking count or review count for Evermore)

#### "Our Works" Portfolio Grid
- Card grid with warm-toned jewelry photos
- Cards overlap slightly (negative margin or transform)
- Each card has a product/style name overlay
- Feels like a magazine spread, not an e-commerce grid
- **Evermore version**: use `evermore_photos/` subfolders as the portfolio

#### Editorial Split Layout ("New Collection")
- Large bold typography occupies LEFT half
- High-quality jewelry photo occupies RIGHT half
- Both on same dark background — no box or card container
- Body text at normal scale beneath the massive heading
- **Evermore version**: feature seasonal service, e.g. "Now Adding Ear Piercings"

#### Oversized Brand Watermark
- Brand name in enormous low-opacity text (≈8-12% opacity) as page texture
- Color: white or very light — creates depth without distracting
- **Evermore version**: "EVERMORE" in Cormorant Garamond, gold at `opacity: 0.07`
- Positioned absolutely behind content sections

#### Testimonials Section
- Section heading "Customers Experiences" at large editorial scale
- Circular profile photo thumbnails in a horizontal row
- Short quote below each, small name attribution
- Dark background, white text

#### CTA Strip
- Simple dark section, minimal text, single large CTA button
- Button style: outlined white or solid gold
- No card, no background box — text floats on dark

#### Footer Newsletter Bar
- Mixed-weight heading ("GET The Last Information From US") at ~4rem
- Email input inline with submit button
- Pure black, cream/white text

---

### Color Theme
The site uses a **Black, White & Gold** palette. Dark is the dominant background:
- **Black** (`--noir: #0D0D0D`, `--dark: #1A1512`) — primary background for hero, most sections, nav, footer
- **White / Cream** (`--cream: #FAF7F2`) — all body text, headings on dark, and sparingly as section backgrounds for contrast relief
- **Gold** (`--gold: #C9A84C`, `--gold-light: #E2C97E`) — CTAs, hover states, underlines, dividers, accent dots, floating badges
- **Photo tones**: warm terracotta/brown come entirely from photography — do NOT add warm background colors to UI elements
- **Rule**: If more than 30% of the visible page area is cream/light, the design is too light — add a dark section

### Page-by-Page Design Rollout
- **Always start with `staging/index.html`** to establish and validate the design direction before applying changes to other pages
- Do not update other pages until the homepage design has been reviewed and approved
- Once the homepage is approved, use it as the design template for all remaining pages

### Section-by-Section Mapping (Reference → Evermore Homepage)
| Reference Section | Evermore `index.html` Section | Notes |
|---|---|---|
| Dark hero + mixed-weight headline | Hero with weld photo | Increase heading scale |
| Stat badge (4.8K) | Review count or "500+ clients" | Floating badge style |
| "Shop by Shape" selector row | Style selector (Bracelets/Anklets/etc.) | Horizontal icon+label scroll |
| "Category View" | Services (Perm. Jewelry / Piercings / Oyster) | Full-width section heading |
| "Our Works" card grid | Gallery strip from `evermore_photos/` | Overlapping card treatment |
| "New Collection" editorial split | Seasonal or featured service callout | Large type + photo split |
| "Watch on your hands" lifestyle | "Wear It Every Day" wrist/lifestyle shots | Dark + lifestyle photo |
| Oversized watermark | "EVERMORE" at 7% opacity | Absolute position |
| Brand logos bar | Partner or press mentions | Horizontal logo row |
| Testimonials | Review cards | Large section heading |
| "Design For Own" CTA | "Book Your Appointment" → GlossGenius | Single button CTA strip |
| Footer newsletter bar | Location + hours footer | Mixed-weight heading |

### Design Verification Checks
After every significant design implementation, run these checks before considering work done:

1. **Section heading scale** — Are major section headings at least `clamp(3.5rem, 9vw, 8rem)`? Small headings break the editorial feel.
2. **Dark dominance** — Is the page predominantly black/dark? If cream sections outnumber dark sections, add more dark.
3. **Gold discipline** — Is gold only on accents (CTAs, hover states, dividers, badges)? Gold should never be a section background.
4. **Typography contrast** — Are mixed-weight headings used? (light italic paired with bold upright in same heading)
5. **Photo warmth** — Do lifestyle photos carry the warm brown tones? The UI itself should stay cool/neutral (black + cream + gold).
6. **Component scale** — Do buttons, cards, and nav feel appropriately bold vs. the reference? No timid small elements.
7. **Brand integrity** — Does it feel like Evermore (elegant, feminine, permanent jewelry boutique) and not a generic template?
8. **Mobile** — Does it hold at 375px, 768px, 1280px? Large headings must scale down gracefully with `clamp()`.
9. **Similarity score** — Give an estimated percentage match to the reference screenshot and list what's still diverging.

After completing implementation, explicitly state which checks passed and flag areas needing refinement.

## Design System (v2.0)
All styles use CSS custom properties defined in `:root` in `style.css`.

| Token | Value | Use |
|-------|-------|-----|
| `--gold` | `#C9A84C` | Primary accent, CTAs, hover states, dividers |
| `--gold-light` | `#E2C97E` | Gold on dark backgrounds, text highlights |
| `--gold-pale` | `#F4EDD6` | Subtle gold tint — use sparingly |
| `--cream` | `#FAF7F2` | Text on dark backgrounds, light section contrast relief |
| `--cream-dark` | `#F0E8DA` | Rare alternate light backgrounds |
| `--noir` | `#0D0D0D` | Primary page background, hero, footer |
| `--dark` | `#1A1512` | Dark section backgrounds |
| `--text` | `#3D3030` | Body text (light sections only) |
| `--text-light` | `#5A4848` | Secondary text (light sections, WCAG AA) |

**Fonts**: Cormorant Garamond (display/headings) · DM Sans (body) · Montserrat (labels/buttons/eyebrows)

## Component Rules
- **Always reuse existing classes before creating new CSS** — check `style.css` for existing components first
- Section classes: `.section`, `.section--dark`, `.section--noir`, `.section--cream`
- Button classes: `.btn`, `.btn-primary`, `.btn-outline`, `.btn-outline-dark`, `.btn-ghost`, `.btn-gold-outline`
- Use `.eyebrow` for small uppercase Montserrat labels above headings
- Use `.reveal` + `.reveal-delay-1/2/3` for scroll-triggered fade-in animations
- If a new component is needed, define it in `style.css` with a comment block — never use one-off `<style>` tags in HTML files

## Image & Performance Rules
- Only use **JPG / JPEG / PNG** — HEIC files do not display in browsers
- Always add `loading="lazy"` to all images below the fold
- Always include descriptive `alt` text on every image (e.g. `alt="Gold permanent bracelet being welded on customer's wrist"`)
- Prefer smaller file sizes — if an image seems large, note it for optimization
- Files with spaces in names must be URL-encoded or quoted carefully:
  - `bracelet_multiple .jpg` (has trailing space)
  - `weld_image .jpg` (has trailing space)
  - `ear_piercing_gulf shores.jpg` (space in middle)
- Photo library subfolders: `bracelets/`, `anklets/`, `necklaces/`, `hand_chains/`, `gulf_shores_ear_piercings/`, `gulf_shores_storefront/`, `west_palm_beach_storefront/`, `parties_events/`, `logos/`

## SEO & Meta Tag Rules
Every page must include in `<head>`:
- Unique, location-aware `<meta name="description">` (mention city/service, ~155 chars)
- `<meta property="og:title">`, `og:description`, `og:image`, `og:url`
- Canonical `<link rel="canonical" href="...">` tag
- LocalBusiness JSON-LD schema block for each relevant location (see template below)

### LocalBusiness JSON-LD Template
```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Evermore Permanent Jewelry",
  "image": "https://evermore-permanentjewelry.com/evermore_photos/logos/[logo-file]",
  "url": "https://evermore-permanentjewelry.com",
  "telephone": "(630) 596-7306",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "2601 S McKenzie St Suite 190",
    "addressLocality": "Foley",
    "addressRegion": "AL",
    "postalCode": "36535",
    "addressCountry": "US"
  },
  "hasMap": "https://maps.google.com/?q=2601+S+McKenzie+St+Suite+190+Foley+AL"
}
```

## Accessibility Rules
- All images must have descriptive `alt` text — never use `alt=""` on meaningful images
- All interactive elements (buttons, links, inputs) must be keyboard accessible and have visible focus states
- Color contrast must meet WCAG AA minimum (4.5:1 for body text, 3:1 for large text)
- Never rely on color alone to convey information
- All `<a>` tags must have descriptive text — never use "click here" or "read more" alone

## Booking Links (do not change)
- **Foley, AL**: `https://laurendoctor.glossgenius.com/services`
- **West Palm Beach, FL**: `https://evermorepermanentjewelrywpb.glossgenius.com/services`

## Location Info
**Foley, AL (Gulf Shores)**
- Address: 2601 S McKenzie St Suite 190, Foley, AL 36535 (Tanger Outlets)
- Phone: (630) 596-7306
- Services: Permanent Jewelry, Ear Piercings, Oyster Shucking

**West Palm Beach, FL**
- Address: 1741 Palm Beach Lakes Blvd E221, West Palm Beach, FL 33401 (Tanger Outlets)
- Phone: (630) 596-7306
- Services: Permanent Jewelry

## Page Structure Pattern
Every staging HTML page includes:
1. Red staging banner at top (`<div class="staging-banner">`)
2. GTM script in `<head>`
3. Google Fonts: Cormorant Garamond + DM Sans + Montserrat
4. Font Awesome 6.4.0 CDN
5. `assets/css/style.css`
6. `assets/js/main.js` before `</body>`
7. Floating book button + back-to-top (injected by JS, no HTML needed)
8. LocalBusiness JSON-LD schema in `<head>`
9. Full Open Graph + canonical meta tags
