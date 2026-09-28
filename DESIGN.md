---
name: "From Molecule to Machine"
description: "A scientific atlas of readable technical lessons, cobalt concept plates, and clearly bounded learning models."
colors:
  page: "#ffffff"
  ground: "#f5f7fb"
  rail: "#f0f3f8"
  ink: "#142b43"
  muted: "#4e6074"
  accent: "#2457c5"
  accent-hover: "#19439f"
  tint: "#e7eefc"
  line: "#cbd5e2"
  secondary: "#8d4672"
  good: "#1e684a"
  good-ground: "#edf7f1"
  warning: "#8a451b"
  warning-ground: "#fff3e7"
  focus: "#a4480d"
  dark-page: "#12202e"
  dark-ground: "#192b3c"
  dark-rail: "#162737"
  dark-ink: "#e4ebf4"
  dark-muted: "#b4c3d4"
  dark-accent: "#9ab9ff"
  dark-accent-hover: "#c2d5ff"
  dark-tint: "#233b5f"
  dark-line: "#3c536b"
  dark-secondary: "#e5a5d0"
  dark-good: "#a0ddbc"
  dark-good-ground: "#1a382d"
  dark-warning: "#f1c493"
  dark-warning-ground: "#392b20"
  dark-focus: "#f5c279"
typography:
  display:
    fontFamily: "'Source Sans 3 Variable', 'Segoe UI', sans-serif"
    fontSize: "2.65rem"
    fontWeight: 650
    lineHeight: 1.2
    letterSpacing: "-.025em"
  headline:
    fontFamily: "'Source Sans 3 Variable', 'Segoe UI', sans-serif"
    fontSize: "1.65rem"
    fontWeight: 650
    lineHeight: 1.2
    letterSpacing: "-.012em"
  title:
    fontFamily: "'Source Sans 3 Variable', 'Segoe UI', sans-serif"
    fontSize: "1.3rem"
    fontWeight: 650
    lineHeight: 1.2
  ui:
    fontFamily: "'Source Sans 3 Variable', 'Segoe UI', sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  body:
    fontFamily: "'Source Serif 4 Variable', Georgia, serif"
    fontSize: "1.12rem"
    fontWeight: 400
    lineHeight: 1.78
  label:
    fontFamily: "'Source Sans 3 Variable', 'Segoe UI', sans-serif"
    fontSize: ".83rem"
    fontWeight: 400
    lineHeight: 1.5
  button:
    fontFamily: "'Source Sans 3 Variable', 'Segoe UI', sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.2
  curriculum:
    fontFamily: "'Source Sans 3 Variable', 'Segoe UI', sans-serif"
    fontSize: ".87rem"
    fontWeight: 400
    lineHeight: 1.32
  code:
    fontFamily: "ui-monospace, 'Cascadia Code', 'SFMono-Regular', Consolas, monospace"
    fontSize: ".76rem"
    fontWeight: 400
rounded:
  inline: "3px"
  control: "4px"
  dialog: "6px"
spacing:
  compact: ".5rem"
  related: "1rem"
  panel: "1.25rem"
  group: "1.5rem"
  section: "2rem"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.page}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: ".65rem 1.15rem"
  button-primary-hover:
    backgroundColor: "{colors.accent-hover}"
    textColor: "{colors.page}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.accent}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: ".65rem 1.15rem"
  button-secondary-hover:
    backgroundColor: "{colors.tint}"
    textColor: "{colors.accent}"
  button-pressed:
    backgroundColor: "{colors.good-ground}"
    textColor: "{colors.good}"
  button-text:
    backgroundColor: "transparent"
    textColor: "{colors.accent}"
    padding: ".5rem 0"
  button-icon:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    width: "44px"
  input:
    backgroundColor: "{colors.page}"
    textColor: "{colors.ink}"
    typography: "{typography.ui}"
    rounded: "{rounded.control}"
    padding: ".5rem .65rem"
  curriculum-link:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.curriculum}"
    rounded: "{rounded.inline}"
    padding: ".5rem .45rem"
  curriculum-link-current:
    backgroundColor: "{colors.tint}"
    textColor: "{colors.accent}"
  concept-plate:
    backgroundColor: "{colors.ground}"
    padding: "1.25rem 1.25rem 1.1rem"
  mini-lab:
    backgroundColor: "{colors.ground}"
    padding: "{spacing.group}"
  answer-option:
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: ".8rem .9rem"
  answer-option-selected:
    backgroundColor: "{colors.tint}"
  dialog:
    backgroundColor: "{colors.page}"
    textColor: "{colors.ink}"
    rounded: "{rounded.dialog}"
    padding: "{spacing.group}"
---

# Design System: From Molecule to Machine

## Overview

**Creative North Star: "The Scientific Atlas"**

Cool paper, cobalt linework, and ink-blue type give technical material a calm, precise setting. Locally packaged sans and serif families distinguish orientation from sustained reading. Numbered vector plates explain relationships; native controls invite inspection without competing with the lesson.

Thin rules and restrained tonal differences organize the interface instead of stacks of elevated cards. Original source text and supplementary learning have visible labels and separate typographic treatments. This records the implemented, user-approved world, not a proposed redesign.

**Key Characteristics:**
- Cool paper surfaces with role-specific light and dark palettes.
- Sans-serif orientation around a generous serif reading column.
- Numbered vector plates with captions, keys, and contained horizontal scrolling.
- Flat, ruled panels and native controls with explicit states.
- Persistent wide-screen navigation that becomes dialogs on narrower screens.

Evidence: `src\styles\site.css`, locally packaged font imports in `src\layouts\SiteLayout.astro`, `src\components\ConceptPlate.astro`, `src\components\MiniLab.astro`, `src\pages\index.astro`, and `src\pages\lessons\[number]\index.astro`. `PRODUCT.md` supplies confirmed brand constraints; surface-specific intent remains in `.impeccable\surfaces\src-pages-index-astro.md`.

## Colors

The palette pairs cool paper and blue-black ink with cobalt structure, a plum comparison color, and separate semantic feedback pairs.

### Primary

- **Cobalt index ink** (`accent`) identifies links, primary actions, chapter numbers, progress, and explanatory strokes.
- **Deep cobalt** (`accent-hover`) makes hover states explicit without introducing another accent.
- **Cobalt wash** (`tint`) identifies current navigation, selected answers, and tinted diagram regions.

### Secondary

- **Comparison plum** (`secondary`) distinguishes alternative curves, secondary diagram marks, and dashed comparison boundaries. It is not the error or success color.

### Neutral

- **White paper** (`page`) is the reading surface and the fill of controls and diagram boxes.
- **Cool working paper** (`ground`) groups plates, models, code, and alternate table rows.
- **Index paper** (`rail`) distinguishes the curriculum and table headings.
- **Ink blue** (`ink`) carries primary text and diagram labels.
- **Slate annotation** (`muted`) carries metadata, captions, and supporting labels.
- **Blue-gray rule** (`line`) divides surfaces and outlines controls.

### Status and focus

- **Confirmation green** (`good`, `good-ground`) marks read/pressed states and correct-answer feedback.
- **Revisit amber** (`warning`, `warning-ground`) marks model errors, answers to revisit, and local-storage notices.
- **Keyboard copper** (`focus`) identifies keyboard position independently of selection or correctness.

The frontmatter keeps the stylesheet's role names. Each `dark-` entry is the exact dark-theme replacement for the corresponding unsuffixed role, not an additional accent to mix into the light theme. Explicit light/dark selection takes precedence over system preference; system dark uses the same dark values. Component references describe light defaults, while the source custom properties change together at runtime.

Sidecar tonal ramps are generated preview aids, not additional implemented palette tokens. The source defines role colors rather than an eight-step color scale.

**The Color Carries a Role Rule.** Keep navigation and explanatory structure in the accent family; reserve good and warning pairs for labeled states, and focus for keyboard position.

## Typography

**Display and UI Font:** Source Sans 3 Variable, with Segoe UI and sans-serif fallbacks.

**Body Font:** Source Serif 4 Variable, with Georgia and serif fallbacks.

**Code Font:** The system monospace stack recorded in the frontmatter; no additional code font is downloaded.

Both Source families are imported from local font packages by the shared layout. The root size is (17px); the UI and reading hierarchy use rem values. The ramp is role-based rather than a uniform mathematical ratio: compact metadata, ordinary controls, comfortable prose, and progressively stronger headings.

### Hierarchy

| Role | Application |
| --- | --- |
| Display | Default page and lesson h1; moderately tightened tracking and balanced wrapping. The course opener has a local treatment, not a second global heading scale. |
| Headline | General h2. Original-lesson h2 uses a close reading-specific setting (1.64rem, line-height 1.3); its h3 also uses line-height (1.3). |
| Title | General h3. General h4 is the smaller heading tier (1.1rem). Headings use weight (650). |
| UI | Navigation surroundings, supplemental explanations, and native fields. Action labels are stronger (600). |
| Body | Original lesson prose. Its maximum measure (72ch) sits within a comfortable 65-75ch reading range, subject to the column's available width. |
| Label | Recurring metadata and quiet section navigation; not an all-caps display style. |
| Curriculum | Compact multi-line lesson links; current-page text becomes stronger (650). |
| Code | Preformatted code; preserve whitespace and use the enclosing code surface's line-height (1.65). Inline code scales with surrounding prose instead. |

On small screens at the rail-to-dialog breakpoint, default h1 becomes (2.05rem), original prose becomes (1.06rem) while retaining line-height (1.78), and original-lesson h2 becomes (1.45rem). This reduces display emphasis without compressing narrative leading. Chapter indices and result values use tabular numerals.

**The Two Reading Voices Rule.** Use sans-serif for navigation, headings, labels, and tables; serif for original narrative; monospace for code and symbolic data. Do not style supplemental model text as if it were original source prose.

## Layout

The shared wide-screen shell has a sticky header (76px) and a fixed, independently scrollable curriculum rail (280px). The normal content grid pairs a reading column capped at (770px) with a quiet section index (150-205px), separated by (3rem). Index-style wide pages use a single column capped at (1100px). Reading measure remains constrained within that grid.

The spacing entries in frontmatter are recurring extracted values, not named CSS custom properties or a newly imposed grid. Tight spacing groups related controls; larger spacing separates panels and sections. Original prose uses em-based paragraph rhythm. Thin rules make grouping legible without requiring a separate card around every paragraph.

| Existing max-width breakpoint | Structural change |
| --- | --- |
| 1250px | Rail narrows to (250px); the section index moves to an "On this page" dialog trigger; the normal grid becomes one column capped at (790px). |
| 960px | Header text navigation disappears; course groups stack; the journey map uses three columns rather than six. |
| 760px | Fixed rail disappears in favor of the curriculum dialog; header becomes (68px); page inset becomes (1.1rem); plate keys and model results stack. |
| 390px | Page inset reduces to (.85rem); model controls become a single column; lesson action buttons can flex to fit. |

Curriculum dialogs occupy a full-height, square-edged side sheet (up to 390px or 95vw). Search and section dialogs remain bounded by viewport width and height and scroll internally. Search uses a smaller top offset and larger available viewport height on mobile.

Wide diagrams, code, tables, and displayed equations scroll inside their own labeled, keyboard-focusable regions rather than enlarging the page. The plate retains readable labels and offers a mobile horizontal-scroll hint. Source text, explanatory caption, and model assumptions remain ordinary document content, independent of interactive enhancement.

Print styling removes navigation and action chrome, sets prose to (11pt) with line-height (1.6), allows code wrapping, and exposes source notes. Print sizes are output-specific, not an alternate screen type ramp.

## Elevation & Depth

Reading surfaces, plates, models, lists, and controls are flat. Paper tones, border rules (1px), and stronger section accents (2px) establish separation. Shadows belong to floating utility surfaces, not content cards.

### Shadow Vocabulary

- **Dialog lift** (`0 18px 65px rgb(12 26 47 / 22%)`) separates modal utilities from the underlying page. Their backdrop uses (`rgb(9 23 41 / 48%)`).
- **Storage notice lift** (`0 7px 25px rgb(12 26 47 / 10%)`) supports a status notice that is fixed on wide screens and returns to normal flow on mobile.

**The Flat Reading, Floating Utilities Rule.** Keep lesson content, plates, and models flat and ruled. Use the existing shadow vocabulary for dialogs and storage notices, not for hover-lifting reading surfaces.

## Shapes

Content panels are square-edged rectangles. Small rounding distinguishes inline code and curriculum items from controls; modal utilities use the slightly softer dialog radius. The full-height curriculum sheet stays square. Frontmatter records the recurring corner sizes rather than turning individual SVG geometry into a component scale.

Vector diagrams use circles, ellipses, ruled paths, arrows, and restrained boxes to express scientific relationships. Cobalt and plum strokes, dashes, labels, captions, and numbered keys work together; these geometries are explanatory rather than decorative badges.

## Components

### Buttons

Compact, explicit actions rather than promotional blocks. Primary buttons use accent fill and page-colored text; secondary buttons are transparent with an accent label and a neutral border. Both share the control radius and padding recorded in frontmatter. The button minimum height is (45px); native button, input, and select defaults have a minimum height of (44px), with smaller checkbox/radio inputs inside their labels.

Primary hover deepens the accent; secondary hover adds tint and an accent border. Text actions remain underlined and unfilled; icon actions have a transparent default surface and tinted hover. Pressed reading/save controls use confirmation colors and expose `aria-pressed`. Disabled buttons use a not-allowed cursor and opacity (.65); enhancement-dependent actions start disabled in static markup.

Button background changes use a short transition (150ms ease-out), not movement or scale. Reduced-motion styling reduces transition and animation duration to (.01ms) and restores automatic scrolling.

### Inputs / Fields

Native controls use page fill, ink text, a thin neutral border, and the control radius. Labels stay visible; placeholders use the muted text color. Number fields, text fields, ranges, checkboxes, radio buttons, and selects keep their native affordances. Ranges and choice controls take their accent from the same color role as navigation.

Keyboard focus is an outline (3px) with an offset (4px), not a shadow or a color-only selection effect. Higher-contrast styling strengthens control borders (2px); forced-color styling supplies system colors for diagram marks and text.

Model validation errors appear in an amber message with `role="alert"`. The model result region is polite and atomic for announcements. Neither treatment turns an error into an apparently successful result.

### Navigation

The curriculum uses numbered, multi-line links with a trailing read state. Hover adds page-colored paper; the current lesson uses a tint fill, accent text, a thin border, and stronger weight. Section links use a quiet left rule that takes the accent on hover or current-section state. Chapter links and previous/next navigation remain direct links.

The wide rail and section index yield to native dialogs at their documented breakpoints. Search, theme choice, skip navigation, and dialog controls keep accessible text labels even when their visible presentation becomes compact.

### Plates / Containers

Concept plates and model panels use ground-colored paper and a neutral outline without elevation. Plate padding and model padding have separate frontmatter values; both tighten on small screens. Source-reference disclosure uses the same restrained rule language with a native summary control.

### Concept Plates

The signature component is a numbered figure: sans heading, quiet plate number, labeled vector diagram, explanatory caption, and a numbered key. The diagram is a named image inside a focusable scroll region, not a clickable drawing disguised as a chart. Scientific comparison uses plum alongside cobalt; labels remain ink-colored. Captions and keys preserve meaning outside the geometry.

### Models and Checks

Model panels visibly identify "Interactive model" and state assumptions before the controls. Their update action is secondary; a ruled results region follows it. Result labels are quiet, values are stronger and use tabular numerals, and results stack on mobile.

Checks use native radio choices in small-round outlined rows. Hover adds ground paper; selection adds cobalt tint and an accent border. Correct feedback uses the green pair; revisit feedback uses the amber pair, with explanatory text. Read completion, selected answers, and answer correctness are distinct states, not interchangeable color decorations.

### Contextual Figures and Quantitative Plots

`InlineFigure.astro` extends the same atlas language inside the original reading
column. Thin horizontal rules, sans-serif captions, and a visible
supplement/provenance label distinguish each addition from the serif source
paragraphs. `inline-figures.ts` maps it to an existing section and paragraph;
new figures do not introduce competing lesson headings or rewrite source text.

Plots keep quantity/unit labels in HTML and use a dedicated responsive SVG
coordinate layout: a wide (640 by 320) viewBox or compact (340 by 270) viewBox
selected by the figure's container width. SVG tick sizes (17 wide / 18 compact
viewBox units) and direct annotations (16 viewBox units) are coordinate-space
values, not additional page typography tokens. The compact layout preserves
readable labels rather than horizontally scrolling a reduced desktop chart.
These values belong to the plotting component, not the global type ramp.

Cobalt solid lines or filled points identify the primary series. Plum
comparison lines are dashed, and comparison points/bars are open rather than
filled. Legends name the series; axes, reference lines, captions, and selected
value tables carry meaning independently of color. Logarithmic axes explicitly
say so. A zero or other relevant reference remains stated instead of letting
an unlabeled truncated axis imply an absolute result.

Model assumptions and a "How to read this" takeaway follow the plot. Analytical,
synthetic, and source teaching values are identified immediately, never
presented as newly computed chemistry or hardware results. Numerical data
disclosures use native `details` and labeled focusable table regions.

Optional separation, shot-count, QPE-grid, and budget controls use the existing
native inputs and visible readouts. They only enhance complete static
SVG/HTML. Error messages remove the current-selection claim while leaving the
underlying labeled model and original lesson accessible. Print retains the
static plot and assumptions but removes its controls.

### Dialogs and Notices

Dialog surfaces use the recorded dialog radius, paper color, border, and lift. Search and section navigation retain their own scrollable content; the curriculum variant is a full-height side sheet. Local-storage notices use amber text, fill, and border with their own smaller shadow. Status messaging never replaces the readable lesson.

## Do's and Don'ts

### Do:

- **Do** use the complete light or dark role palette consistently across text, controls, and diagrams.
- **Do** preserve the serif reading measure and sans-serif orientation hierarchy.
- **Do** keep original lessons, concept explanations, and supplementary models visibly distinguished.
- **Do** keep wide technical artifacts in labeled, keyboard-focusable scroll regions.
- **Do** retain native controls, visible focus, explicit disabled/error states, and textual check feedback.
- **Do** use rules and paper tones for content grouping, reserving shadows for floating utilities.

### Don't:

- **Don't** interchange navigation cobalt, comparison plum, confirmation green, and revisit amber.
- **Don't** turn generated sidecar swatch ramps into new application palette tokens.
- **Don't** make one-off opener widths or SVG coordinates into global spacing or typography rules.
- **Don't** replace captions, source labels, or model assumptions with decorative color alone.
- **Don't** collapse reading completion, answer selection, and correctness into one visual state.
