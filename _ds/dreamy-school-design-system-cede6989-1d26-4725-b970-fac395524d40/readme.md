# Dreamy School — Design System

A calm, joyful, premium-yet-playful brand for an education product serving
**teens (middle/high school), teachers, and parents**. The system is anchored on
the brand cyan **#00A7E1**, a rounded friendly type voice, a cool "dreamy" palette
(sky blue, dream-iris purple, aqua), and **real photography** of students and
classrooms.

> **Primary product:** a **slide-deck template** (see `slides/`). The component
> library and foundations exist to support on-brand decks and any future surfaces.

---

## Sources & provenance
- **Logo:** supplied by the client as a transparent PNG wordmark ("Dreamy School"
  in cyan with a distinctive **Ð** glyph — a "D" crossed by a small plus on the
  ascender). Original preserved at `assets/logo-dreamy-school.png`. Recolored and
  cropped variants generated from it (white, ink, isolated mark).
- **Brand direction:** gathered from the client intake — personality (premium &
  elegant + soft dreamy + playful + friendly), cool color direction, rounded
  friendly type, photography-led imagery.
- No codebase, Figma file, or existing deck was provided. Foundations below are an
  original system built to the stated direction; iterate freely.

---

## ⚠️ Font substitution (needs client confirmation)
The wordmark uses a **custom rounded geometric sans**. Pending the real brand font
files, the system substitutes the closest free Google Fonts:
- **Display / headings → Nunito** (rounded, geometric, weights 400–900)
- **Body → Nunito Sans** (its companion text face)

**Action for the client:** if there is an official brand typeface, send the font
files (woff2/ttf) and we'll swap `tokens/fonts.css` + `--font-display/--font-body`.

---

## CONTENT FUNDAMENTALS
How Dreamy School writes:
- **Voice:** warm, encouraging, plain-spoken. Talks *with* people, not *at* them.
- **Person:** address the reader as **"you"**; speak as **"we"** for the brand
  ("We notice progress out loud"). Avoid corporate "the platform / the user".
- **Tone:** calm and reassuring first, gently playful second. Optimistic, never
  hype-y or pushy. Kindness is a feature ("Practice gently", "feels kinder").
- **Casing:** **Sentence case** for nearly everything — headlines, buttons, labels.
  Reserve ALL-CAPS only for the small tracked **eyebrow/overline** label.
- **Length:** short sentences, short paragraphs. One idea per line. Headlines are
  punchy ("Dream big.", "A classroom that cares").
- **Motifs in copy:** dreaming, wonder, curiosity, calm, growth, together. The
  tagline pattern: *"Learning that feels like dreaming."*
- **Numbers:** friendly and rounded ("12k+ students", "98% feel more confident").
- **Emoji:** **not used** in the brand voice. Warmth comes from words, color, and
  photography — not emoji. (Avoid them in decks and UI.)
- **Examples:**
  - Eyebrow: `FOR TEACHERS · LESSON 3`
  - Headline: `Learning that feels like dreaming.`
  - Body: `A calm, joyful classroom for every student, teacher and family.`
  - CTA: `Start learning` · `For teachers` · `Browse lessons`

---

## VISUAL FOUNDATIONS
- **Color:** cool & dreamy. Brand **Sky #00A7E1** leads; **Iris #6C5CE7**
  (periwinkle) is the secondary; **Aqua #29C3BC** accents. Soft pops (lavender,
  blush, sun, peach) add playful energy sparingly. Cool-tinted **Ink** neutrals
  (navy-leaning, never pure black/gray). Off-white **Cloud** page wash.
- **Gradients:** a signature **Dream** gradient (sky → iris, 135°) powers heroes,
  section dividers, primary buttons and stat numbers. Softer **Haze** and **Dawn**
  washes back lighter surfaces. Used purposefully, not everywhere.
- **Type:** rounded friendly sans (Nunito / Nunito Sans). Display weights 800–900
  with **tight tracking** for big confident headlines; body 400–600, generous
  1.55 line-height for easy reading. Eyebrows are 800, uppercase, wide tracking.
- **Spacing:** 4px base grid. Slides use an 84px outer margin (`--slide-pad`).
- **Backgrounds:** mostly clean white / soft tint surfaces; **photography is the
  hero imagery** (real students & classrooms), often full-bleed with a left-to-right
  ink scrim for legible overlaid text. Decorative soft circular "cloud" blobs (low
  opacity) add dreaminess. No busy patterns or textures.
- **Corner radii:** generous and rounded throughout (cards 24px, tiles 16px,
  buttons & chips fully **pill**). Matches the soft wordmark.
- **Cards:** white (or sky/iris tinted) surfaces, radius-lg, **soft cool-tinted
  cloud shadow** (`--shadow-sm/md`), 1px hairline border. A **glass** variant
  (translucent + blur) floats over photography. No colored-left-border cards.
- **Shadows:** soft, diffuse, low-contrast, tinted with navy (`rgba(14,36,56,…)`),
  never harsh black. Brand surfaces use tinted **sky/iris glows**.
- **Borders:** hairline `--border-soft` (ink-200); brand outlines use sky-300.
- **Animation:** gentle and dreamy — short fades and 2px hover *lifts*, eased with
  `--ease-soft`. A light playful overshoot (`--ease-float`) is available but used
  sparingly. No aggressive bounce, no looping decorative motion.
- **Hover states:** buttons lift 2px + deepen shadow; soft/ghost fills darken one
  tint step; cards lift 3px with a larger shadow.
- **Press states:** slight **scale-down (~0.97)** — a gentle squish, not a jump.
- **Transparency & blur:** reserved for glass cards/controls over imagery
  (`--blur-glass`), and low-opacity decorative blobs. Not used on plain surfaces.
- **Imagery vibe:** bright, warm, optimistic, natural light; real and candid (not
  stocky or staged). Cool brand accents complement warm human tones.
- **Layout rules:** left-aligned headlines; eyebrow → headline → supporting line
  rhythm; consistent slide footer (wordmark + label + index).

---

## ICONOGRAPHY
- No icon assets were provided with the brand. **Status:** the system currently
  uses **minimal iconography** — the brand **Ð mark** (`assets/mark*.png`) as a
  badge/avatar/favicon glyph, small geometric dots and numbered tiles in lists,
  and the "×" affordance on removable tags.
- **No emoji** and **no decorative unicode** as icons in the brand voice.
- **Recommended icon set (substitution — confirm with client):** when a real icon
  family is needed, use **Lucide** (`https://unpkg.com/lucide-static`) — its
  rounded, even **2px stroke** matches the friendly wordmark better than sharp or
  filled sets. Flagged as a substitution until the client specifies otherwise.
- For production, prefer **inline SVG from the chosen set** (recolorable via
  `currentColor`) over PNGs. Keep stroke icons at sky-600 / ink-600.

---

## Index — what's in this system
**Foundations (root):**
- `styles.css` — single entry point; `@import`s everything below.
- `tokens/` — `fonts.css`, `colors.css`, `typography.css`, `spacing.css`, `effects.css`.
- `guidelines/cards/` — foundation specimen cards (Colors, Type, Spacing, Brand).

**Assets (`assets/`):**
- `logo-dreamy-school.png` (primary), `-white.png` (reversed), `-ink.png`.
- `mark.png` / `mark-white.png` — the isolated **Ð** glyph.

**Components (`components/core/`):** `Button`, `Badge`, `Tag`, `Card`, `Avatar`
(each `.jsx` + `.d.ts` + `.prompt.md`); demo in `core.card.html`. Mount via
`window.DreamySchoolDesignSystem_cede69` after loading `_ds_bundle.js`.

**Slides — the product (`slides/`):**
- `index.html` — interactive click-through deck (arrow keys / on-screen nav).
- `SlideKit.jsx` — 8 slide-type components: Title, Section, Content+Photo,
  Full-bleed Photo, Stats, Quote, Comparison, Closing. Photography is represented
  by `<PhotoSlot>` placeholders — **drop in real student/classroom images** for
  production.
- `slide-*.html` — one specimen card per slide type.

**Skill:** `SKILL.md` — makes this usable as a downloadable Agent Skill.
