# Handoff: SYSTEM ☐ — physical-synthesis instrument workshop

## Overview

A long-form marketing + commerce site for **SYSTEM ☐** (Russian audience may also see the brand without the redacted word — the workshop builds 9 module Eurorack instruments under a poetic linear narrative *"I show you light · body blood and salt · all bones dust · be careful · fuck abandoned sleep · is my last day · and my last night"*).

The site has two distinct page types:
1. **Homepage** (`index.html`) — single long scrolling document: hero · counter strip · signal chain · catalogue · Last Night flagship block · patches atlas · lexicon of methods · manifesto · footer.
2. **Module product page** (`module.html?m=<slug>`) — one route, slug-driven. Two product detail pages are fully written (`is-my`, `and-my`); the other seven render a **CLASSIFIED / embargoed** layout (cards still link, but the body is replaced with redaction bars).

## About the design files

The files in this bundle are **design references created in HTML + JSX + CSS** — prototypes showing intended look and behavior, **not production code to copy directly**.

The task is to **recreate these designs in the target codebase's existing environment** (React + Next.js, Astro, Svelte, etc.) using its established patterns, design system, and libraries. The prototype uses React via `<script type="text/babel">` (Babel-in-browser) with global window-scoped components — that's a hack for fast iteration, not the recommended production approach. In a real project, use ES modules and a real build pipeline.

The HTML files **do** work standalone — open `index.html` in a browser to see the design.

## Fidelity

**High-fidelity.** All colors, typography, spacing, animations, and interactions are final. Recreate pixel-perfectly using the target codebase's libraries.

---

## Visual identity

### Brand vocabulary

The brand name contains the word "suicide", which is **deliberately replaced everywhere** with a visual analog:

- **Hero centerpiece**: an SVG **razor blade in the style of an AmEx Black centurion card** — black/steel rounded rectangle with 4 corner tabs, twin dumbbell-slot cutouts, embossed top wordmark, central round medallion, embossed bottom "card number"
- **Topbar brand**: `SYSTEM` + tiny inline razor scratch glyph
- **Footer brand block**: `SYSTEM` + medium razor-slash motif + `/ 9 MODULES`
- Any inline copy that would say "system suicide" uses the same scratch glyph

The current AmEx razor reads `YOUR CARD` top, `AX` center medallion, `0021 150992 25445` bottom (the lot number is the brand's catalog identifier). Colors are **steel** (cool grey-blue hues, not pure black) — see token table below.

### Lexicon of methods (10 metaphor icons)

A second, internal-reference visual library. Ten small SVG icons each map a **self-harm method** to a **music-gear term** with the same word:

| #   | Icon       | Term     | Subtitle                                |
|-----|------------|----------|-----------------------------------------|
| 01  | Razor      | CUT      | splicing tape, opening a vein           |
| 02  | Shotgun    | TRIGGER  | envelope trigger, point blank           |
| 03  | Capsule    | DOSE     | the amount, swallowed whole             |
| 04  | Noose      | SUSPEND  | a held chord, a held breath             |
| 05  | Tablets    | DECAY    | release time, slow release              |
| 06  | Match      | IGNITE   | ignite the signal, ignite the body      |
| 07  | Knife      | SPLICE   | razor-blade edit, the sharper cut       |
| 08  | Bottle     | FILL     | fill the buffer, fill the glass         |
| 09  | Cassette   | WIND     | wind the tape, wind the watch           |
| 10  | Hourglass  | DRAIN    | drain the signal, drain the hour        |

Each has both **static** and **animated** SVG implementations. The Lexicon section renders the animated set. Animations are CSS-driven and loop infinitely (no JS).

### Edge rails

Fixed-position decorative rails on both sides of the viewport (visible only above 980px wide):
- **Left rail (default)**: vertical `SYSTEM` word, written top-to-bottom using `writing-mode: vertical-rl`
- **Right rail (default)**: animated rope dangling from the top with a hangman's knot. The rope extends far below the visible viewport and the loop is positioned at SVG y=2050 of a 2200px-tall SVG so it's **always clipped** — only the rope and the knot are ever visible, the loop is never seen even when the user scrolls.

Both rails are swappable via Tweaks panel to: `system`, `rope-anim`, `razor` (hairline ticks), `rope` (red wiggle), `x` (red Xs), `barbed` (twisted barbed wire), `tally` (prison-style tally marks).

---

## Design tokens

### Colors (CSS custom properties on `:root`)

```css
--bg:        oklch(0.10 0.005 30);   /* page background — warm-toned near-black */
--bg-2:      oklch(0.13 0.005 30);   /* card hover, mid-tone surface */
--bg-3:      oklch(0.16 0.005 30);   /* slightly lighter surface */
--fg:        oklch(0.93 0.005 60);   /* primary text — off-white warm */
--fg-2:      oklch(0.72 0.005 60);   /* secondary text */
--fg-3:      oklch(0.46 0.005 60);   /* tertiary / muted text */
--line:      oklch(0.26 0.005 60);   /* divider lines, borders */
--accent:    oklch(0.55 0.18 25);    /* blood red — also user-tweakable */
--accent-dim:oklch(0.40 0.14 25);    /* darker accent for dim states */
```

Single accent. Three neutrals (bg / mid / line / fg). All defined in oklch for perceptual consistency.

### Steel palette (used inside the AmEx razor blade only)

```
body gradient:  oklch(0.42 0.012 230) → oklch(0.18 0.010 230) → oklch(0.38 0.012 230)
edge stroke:    oklch(0.72 0.012 230)
slot outline:   oklch(0.78 0.012 230)
text highlight: oklch(0.90 0.012 230)
outer sticker:  oklch(0.66 0.012 230)
```

Cool grey-blue tints throughout to read as "stainless steel" against the warm dark page.

### Typography

Loaded from Google Fonts:
- **Archivo Black** — `--f-display` — huge display headings, brand mark, big titles
- **Archivo Narrow** (400/500/700) — `--f-narrow` — module names, condensed sans for compact labels
- **JetBrains Mono** (300/400/500/700) — `--f-mono` — body text, technical labels, eyebrows, all caps tracking labels, signal-chain ASCII

System fallback for the AmEx medallion serif: Georgia → Cormorant Garamond → Times New Roman → serif.

#### Type styles

```
.t-display      Archivo Black, weight 900, letter-spacing -0.01em, line-height 0.88, uppercase
.t-narrow       Archivo Narrow, weight 700, letter-spacing 0.01em, line-height 1.0, uppercase
.t-mono         JetBrains Mono, default weight 400
.t-mono-up      JetBrains Mono, uppercase, letter-spacing 0.12em
.t-eyebrow      JetBrains Mono, uppercase, letter-spacing 0.18em, 11px, fg-3
```

Hero title (`SYSTEM`): clamp(80px, 14vw, 220px) with line-height 0.85.
Section h2 headings: clamp(36–40px, 5–6vw, 64–84px) with line-height 0.9.

### Spacing

CSS custom property `--gutter: clamp(20px, 4vw, 56px)` is used for horizontal page padding. Shell max-width is 1480px.

Section vertical padding is typically `80px` top + `80px` bottom; the long-form hero is `64px top / 80px bottom`. Cards in catalog use `24px / 22px / 28px` padding.

### Iconography

All icons are inline SVG (no icon font, no external sprite). The AmEx razor blade and the 10 metaphor icons are all hand-coded SVG with no external dependencies.

---

## Pages

### 1. `/` (index.html) — homepage

A single long scroll. **Order of sections** (top → bottom):

#### 1.1. TopBar (sticky)
- Height 56px, sticky top, full-width black with bottom 1px line
- Grid: `auto 1fr auto` columns
- Left: brand `SYSTEM` + inline razor scratch + small red dot before
- Center: nav links — Signal chain · Modules · Last Night · Patches · Manifesto · Contact
- Right: **EN · RU language toggle** · "Workshop · open" (pulsing red dot) · "EUR" · "Cart [0]"

#### 1.2. Hero
- Eyebrow strip at top: 4-col grid — `LOT №0021·150992·25445` (red lot) · `Physical synthesis · since 2024` · `9 modules` · `Eurorack · 3U`
- Hero title row: **SYSTEM** big display word (left) + **AmEx-style razor blade** (right, rotated -7°) sit side-by-side on the same baseline
- Below the row: full-width **red horizontal bar** (height clamp(12px, 1.8vw, 32px), accent color) — this is the "redaction" mark
- 3-column row below: poem (left, **all module names are anchors to product pages**) · prose blurb (middle) · CTA stack (right, three buttons)

The poem:
```
I SHOW YOU LIGHT
BODY BLOOD AND SALT
ALL BONES DUST
— BE CAREFUL —
FUCK ABANDONED SLEEP
IS MY LAST DAY        ← red
AND MY LAST NIGHT     ← red
```
Each module name is wrapped in `<a className="mlink" href="module.html?m=<slug>">` and gets a thin red underline on hover.

#### 1.3. Counter strip
- Single row, full width, divider lines top + bottom
- Left: `Days since the system / 47 prototypes burned / next batch ships` (the middle phrase in red)
- Right: SVG tally counter (`<TallyCounter count={47} />`) — 9 groups of 4 vertical bars crossed by a red diagonal, plus 2 leftover bars

#### 1.4. Signal chain
- Tag-rule pinch at top: small red dot · `Signal chain · left to right · burns to the end` · `Fig. 01 / 09`
- Display h2: `The voice / passes through / nine bodies.` (third line in accent)
- 9-column grid of signal nodes, connected by a red horizontal line at pin level. Each node = number · pin (open circle, filled if flagship) · module name · function label. Each node is a link to its module page.
- Foot strip: `IN · ±5V` · ASCII signal flow arrow · `OUT · stereo`

#### 1.5. Catalogue
- Heading "CATALOGUE / 2024 — 2026" + meta block right-aligned (9 modules · 124 HP, etc.)
- 3×3 grid of module cards. Each card:
  - Top row: `M·XX` (red) · phase status (centered, red if "SHIP — PHASE 1") · `XX HP` (bordered pill)
  - Big module name in display font
  - Function label `— OPTICAL CROSSFADER` etc.
  - Bottom: "Physical core" key + body text (visible **only** for `is-my` and `and-my`)
  - For the other 7 modules: `Physical core · CLASSIFIED` + redaction bars (see Redaction component below)
  - The whole card is an `<a>` linking to `module.html?m=<slug>`

#### 1.6. Last Night flagship block
- 2-column layout
- Left: red eyebrow `M·09 / Flagship / In stock` · huge "Last / Night." title · accent-line quote · prose body · 8-row spec table · two CTA buttons
- Right: tag-rule + 2×4 grid of cartridge cards. Each cartridge: 80px material swatch (CSS gradients/repeating patterns mimicking the material — oak grain, marble veining, brass gradient, glass tint, etc.), name, RT60, character description

#### 1.7. Patches
- Heading: "Six ways / to be heard." + subtitle
- 2-col grid of 6 patch entries
- Each row: `X` mark icon (red) · patch name + signal-chain shorthand · duration

#### 1.8. Lexicon of methods
- Heading: "Lexicon / of methods." + meta (10 metaphors, etc.)
- 5×2 grid of method cells. Each cell: `M·XX` code (red, top-left) · animated SVG icon (110px tall) · term (display font) · subtitle (mono, 22ch)
- The icons are the **animated** versions from `anim-metaphors.jsx`

#### 1.9. Manifesto
- 2-col layout
- Left: eyebrow + huge h2 `Electronics / serve the physics, / not the opposite.`
- Right: 3 paragraphs (3rd has a red final sentence) · sig row (workshop · location)

#### 1.10. Footer
- Barbed-wire SVG divider strip at top (twisted red lines with X-mark barbs)
- 4-col link grid: huge brand block (`SYSTEM` + razor slash + `/ 9 MODULES`) · Catalogue links · Workshop links · Contact links
- Bottom-bottom: copyright + razor scratch + motto + version

---

### 2. `module.html?m=<slug>` — module product page

URL slug routing. The page reads `?m=<slug>` from the URL and looks the module up in `MODULES`. If the slug exists in `PRODUCT_PAGES`, it renders the full detail view. Otherwise it renders a CLASSIFIED placeholder.

Slugs available: `i-show-you-light`, `body-blood-and-salt`, `all-bones-dust`, `be-careful`, `fuck-abandoned-sleep`, `is-my`, `last-day`, `and-my`, `last-night`. Only `is-my` and `and-my` are fully revealed; the rest render the CLASSIFIED layout.

#### Layout (both modes)
1. Same TopBar
2. Breadcrumb row: `← System catalogue / M·XX · <name>`
3. Product header:
   - Eyebrow row: `M·XX` · `— FUNCTION` · `XX HP` · phase
   - Big display title (the module name)
   - Full-width red line below

#### Revealed body (`is-my`, `and-my`)
4. Quote row: 2-col — pulled quote (accent-line left border, display font) | intro prose
5. 2-col block: Specs table | Physical core paragraphs
6. Signal chain ASCII (full-width `<pre>` with bg-2 background and border)
7. Controls table: 3 columns (`Control · Function · CV`)
8. (and-my only) Pilot remote block: prose + ASCII layout diagram
9. Uses list — `<XMark>` bullets
10. CTA row: red `Pre-order — write to workshop` mailto + `Back to catalogue` outline button
11. Prev/Next module navigation (2-col, links to neighbour slugs)

#### Classified body (other 7 slugs)
4. Red CLASSIFIED stamp (rotated -1.2°, red 2px border)
5. Embargo prose paragraph with link to workshop email
6. Four "section" blocks (Physical core · Signal chain · Controls · Connection to the system), each shows the section heading and a stack of redaction bars

---

## Components

### `<RedactionBars lines={N}>`
Renders N rows of horizontal redaction segments (2–4 segments per row, varying widths 12–82% of row, mix of dark grey and red blocks). Uses a deterministic sine-based pseudo-random function so output is stable across renders.

### `<AmexRazorBlade>`
The hero centerpiece. SVG with `viewBox="0 0 1400 500"` (aspect ~2.8:1). Layers (back to front):

1. **Outer sticker outline** — light steel grey shape, 22 units bigger than body on all sides
2. **Body** — gradient-filled rounded rectangle with 4 corner tabs (small rectangular protrusions at the four short-edge corners), masked by twin dumbbell slot cutouts (left and right of center, each = thin rect + two circles at the ends, circles bigger than rect height)
3. **Edge highlight + shadow lines** (top white, bottom black, plus a thinner inner reflection)
4. **Inner card-style double frame** (silver 1px + black 0.6px offset 6 units in)
5. **Slot outlines** — silver strokes around each circle + the slot's two horizontal edges
6. **Top wordmark** — `YOUR CARD` in Archivo Narrow with 28px letter-spacing, 56px size, embossed via 3-text-layer offset trick (white top highlight + black bottom shadow + main fill)
7. **Centerpiece medallion** — concentric ellipses with a guilloché dotted ring, perimeter micro-text `· PHYSICAL · SYNTHESIS ·` along an arc, faint Roman helmet silhouette behind, `AX` in Georgia serif at 64px embossed with the same 3-layer trick, accent red razor scratch underline
8. **Bottom embossed lot number** `0021 150992 25445` in JetBrains Mono 42px with 9px letter-spacing, embossed

Rendered with a -7° rotation and a 14px / 26px black drop-shadow on the wrapper.

### Animated metaphor icons (`anim-metaphors.jsx`)
Ten components — `AnimRazor`, `AnimShotgun`, `AnimCapsule`, `AnimNoose`, `AnimTablets`, `AnimMatch`, `AnimKnife`, `AnimBottle`, `AnimCassette`, `AnimHourglass`. Each is self-contained SVG with CSS keyframe animations applied via class names. All animations loop infinitely. Cycle times range 2.6s–8s. `@media (prefers-reduced-motion: reduce)` disables all animations.

Each animation event:
- **CUT**: razor slides L→R, leaves red line trail behind, both reset
- **TRIGGER**: shotgun recoils 22px right, muzzle flash bursts at left, smoke puff drifts up-left
- **DOSE**: capsule halves separate ±12px horizontally, particles spill from the gap, halves close
- **SUSPEND**: rope + knot + loop swings ±3.2°
- **DECAY**: 3 tablets fade and shrink in sequence, staggered 2s apart over 6s
- **IGNITE**: flame flickers (scale jitter at 0.42s) + occasional spark
- **SPLICE**: knife slides L→R, leaves trail (shorter than razor)
- **FILL**: red liquid level rises in bottle outline, holds, resets
- **WIND**: cassette reels rotate continuously at 4.5s/rev
- **DRAIN**: hourglass top sand decreases, bottom sand grows, then frame rotates 180° to restart

### Rails (left + right viewport edge)
Fixed `inset: 56px 0 0 0`, 80px wide each side. Container `overflow: hidden` clips content. The rope-anim's SVG is 80×2200 with the noose loop at y=2050 so it's always clipped past viewport bottom.

### Tweaks panel
Floating bottom-right panel (custom component) controlled by the toolbar's "Tweaks" toggle. Persists state via `__edit_mode_set_keys` message to host; defaults JSON marked with `/*EDITMODE-BEGIN*/.../*EDITMODE-END*/` comments. Default values:
- `heroIcon: "amex"` (other options: none / razor / shotgun / capsule / noose / tablets / match / knife / bottle / cassette / hourglass)
- `leftRail: "system"`, `rightRail: "rope-anim"`, `rails: true`
- `accent: "#c63a2a"` (also: off-white #e8e6df, darker reds, deep orange)

In a production codebase, replace with a settings menu or remove entirely.

---

## i18n

Russian/English toggle in the topbar. Implementation in `i18n.jsx`:
- `LangProvider` wraps the whole React tree, holds `lang` state, persists to `localStorage["ss_lang"]`
- `useT()` hook returns a translator function — `t("nav_signal_chain")` → "Signal chain" or "Сигнальная цепь"
- `<LanguageToggle>` renders two `<button>`s with active state
- Translations cover topbar nav, hero eyebrow + blurb + CTAs, counter strip, signal chain headings + foot text, catalog headings + redaction label, Last Night flagship spec labels + quote + description, patches title, lexicon meta, manifesto, footer link labels, product page chrome
- **Not translated** (intentionally English): module names ("I Show You Light", "Last Night", etc.) — they are brand IP; lexicon terms (CUT, TRIGGER, DOSE…) — same reason; ASCII signal chain diagrams; product slugs

To extend: add more keys to the `en` and `ru` dictionaries in `i18n.jsx`, then use `const t = useT()` in any component.

---

## Interactions & behavior

### Hover states
- Module cards lighten background `bg → bg-2` over 0.2s
- Hero poem links underline (red, 0.7 opacity) over 0.2s + text turns red
- Signal-chain nodes: pin fills red, name turns red
- Nav links turn red on hover
- CTA buttons swap to white-on-black with white border (primary buttons go from red to white on hover)
- Cartridge cards & lexicon cells: subtle bg-2 hover

### Click behavior
- All module references (catalog cards, signal nodes, hero poem phrases, "Pre-order" button on Last Night, breadcrumb back link) navigate to `module.html?m=<slug>`
- Language toggle clicks update `lang` state, re-render entire app with new dictionary, and persist to localStorage
- Tweaks panel: all controls live-update via `useTweaks` hook + `__edit_mode_set_keys` postMessage

### Animations
- All metaphor icons loop infinitely (see above)
- Right-rail rope: `rope-swing` keyframe rotates ±2.4° around (40px, 2px) over 7s
- Topbar "Workshop · open" red dot: `pulse` keyframe over 1.6s
- All transitions use 0.18–0.2s ease

### Responsive
- Single breakpoint at **980px** — above: full desktop layout. Below: rails hidden, hero columns stack, catalog → 2-col, patches → 1-col, manifesto → 1-col, footer grid → 2-col, lexicon → 3-col
- Second breakpoint at **720px** — catalog → 1-col, cartridges → 1-col, signal-chain → 3-col rows (no horizontal line connector), footer → 1-col, lexicon → 2-col

---

## Data structures

### `MODULES` (array of 9)
Each module:
```ts
{
  idx: "01",                           // 01..09
  slug: "i-show-you-light",            // URL slug
  name: "I Show You Light",            // display name (English, brand IP)
  fn: "Oscillator",                    // function category
  hp: 16,                              // Eurorack HP width
  phase: "PHASE 3",                    // ship status: "PHASE 1/2/3/5" or "SHIP — PHASE 1"
  redacted: true,                      // hide details on homepage card + product page body
  core: "...",                         // short description (used when not redacted)
  flagship?: true,                     // for last-night, highlights the card
}
```

### `PRODUCT_PAGES` (object keyed by slug)
Only `is-my` and `and-my` exist. Each:
```ts
{
  quote: string,                        // pull quote for the pp-quote-row
  intro: string,                        // intro paragraph
  stats: [{ k, v }],                    // 7–8 spec rows
  physical: string[],                   // 2–3 paragraphs for "Physical core"
  sigchain: string[],                   // ASCII art lines
  controls: [{ ctrl, fn, cv }],         // controls table rows; cv: boolean
  remote?: { blurb, layout[] },         // optional — and-my has this for the pilot remote
  uses: string[],                       // 3 use-case sentences
}
```

### `CARTRIDGES` (array of 8, for Last Night flagship block only)
```ts
{ sw: "sw-oak", nm: "Oak / raw", rt: "0.1–0.3 s", ch: "Warm, soft, perc..." }
```
`sw` matches a CSS class that paints the material swatch via gradients/patterns (`sw-oak`, `sw-maple`, `sw-marble`, `sw-brass`, `sw-steel`, `sw-bone`, `sw-glass`, `sw-nephrite`).

### `PATCHES` (array of 6, for the patches section)
```ts
{ nm: "Drone Cathedral", sub: "01 → 04 → 09", dur: "Q∞ / freeze" }
```

---

## Files

### Required for the homepage
- `index.html` — entry document, font and script imports, single `<div id="root">`
- `styles.css` — all styles (tokens, layout, sections, animations)
- `tweaks-panel.jsx` — Tweaks shell (3rd-party scaffolding, optional in production)
- `i18n.jsx` — translation dictionary + provider + hook + LanguageToggle component
- `motifs.jsx` — rails, AmEx razor blade, static hero icons (razor/shotgun/etc), tally counter, barbed-wire divider, razor scratch glyph
- `anim-metaphors.jsx` — 10 animated method icons
- `data.jsx` — `MODULES`, `CARTRIDGES`, `PATCHES`, `PRODUCT_PAGES`
- `sections.jsx` — all homepage sections as React components
- `app.jsx` — root App, mounts everything, owns Tweaks state

### Required for the product page
- `module.html` — entry document mirroring index.html
- `module-page.jsx` — `<ProductPage>` component + sub-components (`ProductHeader`, `ClassifiedBody`, `RevealedBody`, `StatsTable`, `ControlsTable`, `SigChain`, `NeighbourNav`)
- `module-app.jsx` — root `<PPApp>` for product pages
- All shared files above (styles, motifs, data, tweaks, i18n) are reused

---

## Notes for the developer

1. **Don't ship the AmEx razor blade in production** if the brand collides with American Express trademark. The current design is an homage with original brand strings ("YOUR CARD", "AX", own lot number). The visual language (rounded body + corner tabs + dumbbell slot cutouts + medallion) is a generic razor blade trope. If legal is concerned, the dumbbell slots and the embossed wordmark/number layout are the parts that read as AmEx-specific — those can be modified without losing the razor identity.

2. **The rope animation is fixed-position**. Make sure your framework's hydration doesn't break the swing animation. CSS-only animations should survive any SSR setup.

3. **The redaction component uses `Math.sin(i*91.3 + j*17.7)` for deterministic pseudo-random.** If you re-implement it, keep the deterministic part — otherwise hydration mismatch errors in SSR frameworks.

4. **The hero's grid layout depends on intrinsic SVG sizing**. The AmEx blade SVG has no fixed width — it's bounded by `.hero-razor-corner { max-width: 500px }` and grows to fill. If your SSR renderer evaluates SVG dimensions differently, verify width matches.

5. **All module names are English even in Russian mode** — intentional. The poetic phrase is the brand. Russian users see localized chrome but English module names.

6. **The Tweaks panel is a development helper** — in production, either remove it entirely or repurpose as a single "Settings" button (accent color picker + reduced-motion preference).

7. **Animations honour `prefers-reduced-motion`**: the `@media (prefers-reduced-motion: reduce)` block in `styles.css` disables all 10 metaphor animations + the rope swing + the topbar pulse.

8. **For the Last Night flagship block, the material swatches are CSS gradients/patterns**, not real photographs. Replace with high-quality product photos when those are available.

9. **No tracking, no analytics, no fonts beyond Google Fonts** — keep it that way unless explicitly requested. The brand is anti-corporate by design.

10. **Crisis lines link** in the footer goes to "Crisis lines · global" — currently a placeholder `#`. In a production deploy this MUST point to a real crisis-resource page (e.g. findahelpline.com). Given the brand's edgy positioning, this is non-negotiable.

---

## Asset inventory

All graphics are inline SVG. No external images. No icon font. No third-party SVG library.

Fonts: 3 families from Google Fonts (Archivo Black, Archivo Narrow, JetBrains Mono). System fallback for the serif used inside the AmEx medallion.
