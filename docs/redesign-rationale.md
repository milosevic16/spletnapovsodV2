# Redesign rationale — REZ 1 : 1

August 2026. The ground-up redesign of spletnapovsod.si away from the "Pod površino"
system. This document records what was explored, how the winner was chosen, and which
conditions the implementation must honor. The full concept documents live beside this
file (`concept-rez.md`, `concept-svetloba.md`, `concept-dvojnik.md`).

## Process

1. **Audit** — four parallel audits (infrastructure, visual system, content, build
   pipeline) mapped what survives any redesign (SSG pipeline, guards, typed content,
   `fx` tracker, form engineering, netlify.toml) and what dies with the skin.
2. **Reference study** — first-hand DOM/computed-style study of ref.digital (45%
   weight), kononenkogroup.com (35%), noartmusic.com (20%) at 1440px and 375px.
   Screenshots were unavailable (browser pane not displayed), so observations are
   measured styles + structure, not pixels. Key findings: all three are light worlds
   that spend darkness deliberately; mono + grotesk is the shared professional
   register; ref.digital's sticky-stacked scenes deliver full-page environmental
   transitions with zero scroll hijack and survive unchanged on phones; noartmusic
   decorates with live, checkable readouts (LAT/LON/local time) — the
   fabrication-free way to ornament.
3. **Concepts** — four metaphor families were seeded: the cut (slicing), depth
   (descent), light (inspection), the twin (parallel worlds). Three were developed in
   full; the depth seed (`globina`) failed twice on infrastructure errors (a session
   limit, then a dropped connection) and was not developed. Its core mechanism — the
   page as a descent — is present in the winner regardless, absorbed via the
   sticky-stack storeys and the below-grade finale.
4. **Judging** — three independent judges (creative-direction lens, skeptical-buyer
   lens, engineering lens) scored all developed concepts against the brief's weights:
   25% originality/brand specificity, 20% immersion, 15% commercial clarity, 15%
   strength of the visible/invisible concept, 10% mobile, 10% feasibility, 5% a11y.

## Scores

| Concept | Judge 1 (creative) | Judge 2 (buyer) | Judge 3 (engineer) |
|---|---|---|---|
| **rez** | **87.7** | **89** | **87.5** |
| svetloba | 82.5 | 79 | 83.5 |
| dvojnik | 81.9 | 88 | 83.9 |

Unanimous winner: **REZ 1 : 1**. The creative owner concurs.

## Why REZ won

- **The metaphor generates everything.** The veil cuts instead of fading, navigation
  is a level datum, the portfolio is drawing plates with title blocks, the WordPress
  argument is two construction drawings, the contact form is a title block below
  grade, and the centerpiece is the page cutting itself open. Nothing is decorated;
  everything is derived.
- **The honesty device is structural.** Every fact below the cut is bytes the
  visitor already downloaded (head, robots.txt, netlify.toml headers, form
  defences), single-sourced from `machine-facts.ts` and asserted by the build guard.
  Transplant another company's content and the scene would expose *their* bytes —
  un-templatable by construction.
- **The engineering is the cleanest of the set.** No WebGL, no GSAP, no Lenis: CSS
  sticky + clip-path + SVG + one rAF + WAAPI one-shots through the existing `fx`
  tracker. The signature rides native scroll plus a real `<input type="range">`, so
  it prerenders complete, carries zero touch listeners, and is touch-native by
  construction. The reduced/JS-off state is a finished section drawing, not a paused
  animation.
- **The buyer reads it natively.** Every Slovenian SMB owner has held a gradbeni
  prerez; "above the cut is what you see, below it is what it stands on" sells
  foundations, not decoration.

## Why the others lost

- **Proti svetlobi** (light-table inspection): the typographic honesty contract and
  the watermark were the sharpest single ideas on the panel, but its most visible
  moment — a pointer-following flashlight reveal — is the most recycled device in
  awwwards-land, its mobile signature demoted the visitor from holding the lamp to
  watching a bar, and the metaphor examines documents while the company sells
  construction.
- **Druga stran** (A-stran/B-stran parallel worlds): the *stran* = page/side pun is
  the most brand-specific move possible in Slovenian, but the global flip demands
  promoting static HTML into a scroll-mapped fixed overlay — precisely the iOS
  scroll-lock minefield the house rules document — its honest degrade path deflates
  the signature to an anchor link, and every future content change would be designed
  twice. Also: in record culture the B-stran is the *lesser* side — an awkward frame
  for the layer this brand argues matters most.

## Grafts adopted from the losing concepts

1. **The typographic honesty contract** (from svetloba): Chivo Mono may appear ONLY
   on genuine machine emissions — head lines, robots lines, header names, URLs, file
   names. Human-side instrument labels use Archivo Narrow caps instead. "If it is
   mono, it is checkable" becomes a brand law; the guard verifies the fact nodes.
2. **Vodni znak** (from svetloba): the page's real `<title>` printed as a faint
   aria-hidden watermark in the hero margin — plants the invisible-layer thesis
   before the cut scene arrives, derived from the same constant the guard asserts.
3. **Per-pillar artifact strips** (from svetloba's evidence idea): each pillar
   chapter closes with its own checkable proof — font subsets + srcset variants
   (design), shipped header names (security), robots allows + sitemap + JSON-LD
   (visibility) — evidentiary variation across the calm chapters.
4. **Client-ink grounding of plates** (from dvojnik): each portfolio plate's
   material legend and title-block accents derive from that client's real sampled
   `inks`, so the three plates feel like three different sheets — "vsaka stran je
   oblikovana posebej" demonstrated, not asserted. Ink tints never sit under body
   text; every pairing gets a computed contrast check.
5. **The 45/55 composed cut as the share image**: og.jpg, the reduced-motion
   edition, and the centerpiece become one drawing — the signature motif reused
   everywhere, per house rules.
6. **Bidirectional guard**: a fact present in the emitted artifact but missing from
   the displayed scene fails the build too, over the enumerated fact set.

## Engineering conditions from review (must-do during build)

- The cut scene's facade fragment renders its headline as a **non-heading element**
  (the single-h1 guard stays green) sourced from the same content string.
- Buried sticky scenes get **`inert`** toggled by an IntersectionObserver when fully
  covered, so keyboard focus never lands under a later sheet. JS-only enhancement.
- The veil is capped nearer **1.6–1.8 s**, not 2.4 s — it spends the buyer's
  attention budget. Pure-CSS timed sequence (cannot hang by construction),
  `<noscript>` drop, reduced-motion drop.
- The cut is worded and engineered as **scroll-proportional**, not "lag-free" — iOS
  async compositor scrolling guarantees a one-frame lag on rAF-driven clip updates.
- The **tier gate is concrete**: FULL = fine pointer + no save-data + reduced-motion
  off (+ deviceMemory ≥ 4 where available); STANDARD otherwise (stepped cut,
  five IO thresholds, no crosshair); REDUCED = prefers-reduced-motion or no IO
  (static 45/55 composed drawing, no veil, everything pre-drawn).
- A compact **plate index** (LIST 2/3/4 · name · live URL) heads the portfolio so a
  hurried owner can survey references without three full-viewport scrolls.
- **Red discipline**: `--rez` is the cut and the CTA, never a status color. Form
  errors keep icon + text and use a separately measured tone.
- Chambers lead with the **human gloss first**, machine bytes second.

## Copy note

All new visible strings introduced by the redesign (title-block labels, chamber
names and glosses, plate navigation labels) live in the typed content module, are
marked DRAFT, and join the owner sign-off checklist. Machine identifiers (anchor
ids, topic values, the `feedback` key) are untouched. Substantive existing copy is
preserved; where a string retires with its motif (e.g. the hero fold gloss), that is
recorded in CLAUDE.md.
