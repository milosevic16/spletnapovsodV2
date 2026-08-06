# REZ 1 : 1 — koncept prenove spletnapovsod.si

## 1. Name + central metaphor

**»REZ 1 : 1«** — the section cut, drawn at full scale. A building looks like its facade until the architect's section drawing cuts through it and shows the structure, the ducts, the foundations it stands on; this page is a building the visitor descends through, and at its centre it cuts itself open at merilo 1 : 1 — the drafting convention for "true size" — exposing its own real, emitted machine layer. The owner's line "Spletna stran ni zgolj tisto, kar vidite…" stops being a quotation and becomes the page's physics: above the cut is what you see, below it is what exists.

## 2. The world

Palette — every token has a job; ratios below are rough sanity, final numbers computed numerically in `tokens.css` per house rule:

| Token | Hex | Job |
|---|---|---|
| `--list` | `#F5F2EB` | drafting-paper page ground (graphite on it ≈14:1) |
| `--list-2` | `#ECE8DE` | alternate storey band for calm passages |
| `--grafit` | `#1A1C1E` | ink: all text, and poché (the solid fill of cut matter) |
| `--grafit-2` | `#50555A` | secondary text (≈5.6:1 on paper) |
| `--mreza` | `#D9D3C6` | sheet frames, drawing hairlines — line duty only, never text |
| `--rez` | `#B03B22` | THE cut: cut plane, cut affordances, primary CTA. ≈5.4:1 on paper (text-safe). Never sprinkled; never a status color |
| `--rez-na-temnem` | `#E4694A` | the cut's voice below grade (≈5.8:1 on `--zemlja`) |
| `--zemlja` | `#14171A` | below-grade world — contact + footer only; paper text ≈13:1 |
| `--zemlja-2` | `#1F242A` | insets on dark go lighter (house rule) |
| `--papir-dim` | `#C6C9C3` | secondary text on dark (≈9:1) |

Materials: paper, graphite line, solid poché, 45° section hatch (an SVG pattern — the literal texture of "cut through"), red pencil. Light: shadowless drafting light — **zero drop shadows on the entire site**; depth is drawn (line weight, hatch density, poché), never simulated. A light world with darkness spent once, at the end (the Kononenko lesson); the old paper-and-underlay instinct survives as ground and earth, but nothing else of the old skin does.

## 3. Typography

- **Display + structural: Archivo Variable** (`@fontsource-variable/archivo`, wght + wdth axes, latin-ext for č š ž). H1 and scene titles set Expanded (~115 wdth) at weight ~275 — light-monumental, the ref.digital lesson: monumentality through size and width, never boldness. The same file at Narrow (~70 wdth), caps, letterspaced, is the datum-label voice on rails and title blocks. One lettering hand for the whole drawing, from monument to margin note — the width axis does honestly what two families usually fake. ("Archivo" — the drawing cabinet — is not an accident.)
- **Text: Source Serif 4 Variable** (`@fontsource-variable/source-serif-4`, opsz, latin-ext) — the human voice. A warm, book-grade serif keeps the page from ever reading tech-demo to an SMB owner; the serif speaks, the grotesque is inscribed.
- **Machine voice: Chivo Mono** (`@fontsource-variable/chivo-mono`, latin-ext) — the instrumentation register validated first-hand on noartmusic; carries only real machine facts, never a paragraph.

Scale philosophy: sizes are named as drawing scales. M 1:1 — h1, `clamp(2.8rem, 1.4rem + 6.5vw, 6.75rem)`, tracking −0.015em. M 1:5 — scene titles. M 1:20 — serif body 1.06–1.19rem, 62–68ch. Fixed instruments — datum and mono labels at 0.72rem, caps, +0.1em, **unscaled at every viewport**, because instruments never scale. The surface/system split is enacted per glyph: what is drawn (Archivo, Chivo) versus who is spoken to (the serif).

## 4. Spatial system

The page is one vertical section: the visitor descends from facade to foundations. The mechanism is sticky-stacked full-viewport scenes — each `<section>` sticky, `min-height: 100svh`, the next scrolling up to bury the last (ref.digital's proven device: prerenders as plain sections, zero scroll hijack, touch-native by construction).

Grid: a drawing sheet — hairline frame inset from the viewport edges; on desktop a persistent left margin column carries the **level rail**: a vertical datum with ticks and the section labels from the existing `nav` array (anchors `reference` / `paketi` / `razlike` / `kontakt` unchanged), with a red current-level marker — navigation and progress fused into one instrument. Levels carry names, not numerals; no decorative numbering anywhere.

Rhythm map: **1** Vstop (intense, ≤2.4 s) → **2** Fasada/hero (calm, monumental) → **3** three portfolio plates (directed, medium) → **4** THE CUT (peak intensity) → **5** »Dva načina gradnje« (calm-argumentative, still under the surface) → **6** three pillar chapters (calm editorial) → **7** Specifikacije (medium) → **8** ground-line crossing (one beat) → **9** below-grade contact (dark, quiet, final). Shipped content order is preserved — proof before argument, the owner's call.

## 5. Opening

First paint is an inline static veil — HTML + CSS in the shell, system fonts only, no images, per the first-paint contract: a full-bleed sheet of `--list` with the drawn frame and a title block bottom-right reading `SPLETNAPOVSOD · LIST 1 · MERILO 1 : 1 · IZRIS: <build date>` — the build date baked at prerender, a real fact filling the drawing convention honestly.

Sequence: 0–0.6 s sheet and title block hold; 0.6–1.4 s the red cut line draws across the full viewport (`scaleX`, compositor); 1.4–2.1 s the sheet parts along the line — the two halves translate off-screen — revealing the hero already beneath. Done ≤2.2 s, hard cap 2.4 s. **The first thing this brand ever does is cut.** The h1 and lead live in static HTML under the veil; `<noscript>` drops the veil; a pure-CSS failsafe reveals at ~8 s; reduced motion gets no veil at all.

The hero itself: kicker, monumental h1 (existing copy; »Hitre« carried in `--rez` via the derived accent-span pattern), serif lead, both CTAs — the primary a solid red poché block.

## 6. THE SIGNATURE — »Prerezna ravnina«

One sticky full-viewport scene with roughly two viewports of scroll depth. A red cut plane spans the viewport at mid-height, square end ticks biting into the sheet frame. Above the plane: the **facade** — a 1 : 1 fragment of this very page's visible surface, rendered from the same content module as the hero. Below: the **section** — poché and hatch chambers, each labeled in Chivo Mono with a real fact and glossed in plain Slovenian (gloss rule: no fact without its human sentence). The existing strings caption the halves: »Kar vidite« / »Kar vidi Google«, with `machineGloss` as the scene's one italic aside.

What the visitor does: **scrolls.** Scroll drives the plane's bite — two `clip-path: inset()` values interpolate so the facade recedes and the section grows; the page cuts through itself at reading speed. No lock: leaving mid-scene leaves a partial cut, which is itself a correct drawing. A red grip on the plane — a real `<input type="range">`, 44 px, arrow-keys step it, `aria-valuetext` announcing »X % pod površino« — gives direct pointer, touch and keyboard control of the same value.

The chambers and their real facts (each derived, none typed twice):

- **Glava dokumenta** — the emitted `<html lang="sl">`, `<title>`, meta description, canonical, hreflang, Organization/WebSite JSON-LD — verbatim.
- **Instalacije** — robots.txt with its six explicit AI allows (GPTBot, ClaudeBot, anthropic-ai, PerplexityBot, CCBot, Google-Extended) and sitemap.xml: the ducts connecting the building to the street.
- **Ovoj** — the security headers shipped in netlify.toml: HSTS, nosniff, Referrer-Policy, Permissions-Policy, frame-ancestors.
- **Vrata** — the form's real defences: honeypot, sub-2-second reject, degrade-open.
- **Material** — self-hosted font subsets; AVIF/WebP/JPEG srcset variants.
- **Konstrukcija** — izrisano enkrat, ob objavi: no database, no plugins.

Why it is honest: every line below the cut is bytes the visitor has already downloaded or files at public URLs — view-source honesty. **Guard:** one module (`src/lib/machine-facts.ts`) is the single source feeding (a) this scene's markup, (b) robots.txt/sitemap generation, (c) the postbuild guard, which parses `dist/index.html`, extracts the scene's `data-fact` nodes, and asserts string equality against the parsed emitted head, the parsed netlify.toml header set, and the generated robots.txt lines. The existing x-ray honesty guard repoints here in the same commit; drift becomes impossible by construction.

Static rest state (prerendered, JS-off, reduced-motion): the cut frozen at a composed 45/55 — a complete, poster-grade section drawing with every fact visible.

## 7. Portfolio — »Plošče«

Not cards, not a carousel: three full-viewport **drawing plates**, sticky-stacked, each burying the last. Each plate: sheet frame plus an honest title block (`LIST 2/3/4 · project name · live URL`); the real screenshot mounted large as the project's *elevation*; the name monumental in Archivo; sector and description in serif; the `proof` line as the plate's single red annotation; the client's real sampled `inks` drawn as a labeled material legend — honest by definition, these are the palettes the jobs ran in. The stretched-link pattern, visually-hidden URL + new-window note, and the `<picture>`/srcset block carry over from the current build with retuned `sizes`.

Navigation: scroll advances plates natively; PREV/NEXT buttons (noartmusic's directed sequencing) scroll to plate anchors; arrow keys work; on touch, plain scroll — nothing to teach, nothing to trap focus.

## 8. Services, differentiators, comparison

**»Dva načina gradnje«** — the WordPress argument is *drawn*. Two side-by-side SVG section drawings: `Statična stran` as one monolithic poché slab on clean footings; `WordPress predloga` as an assembly — plugin boxes bolted on, a database chamber underneath that everything rests on. Each comparison row renders as a paired annotation to the two drawings (the existing accessible non-table `li` pattern). The drawing depicts only the structural facts already in the copy — the no-fabricated-numbers rule holds absolutely; this diagrams architecture, never benchmarks. The footnote sits as a serif marginal note.

**Pillars** = three structural systems, three editorial chapters with genuinely different compositions: *Unikaten dizajn* — the load-bearing frame (drawing left, points ledger right); *Varnost, hitrost, skladnost* — the envelope (full-width layered wall detail, points as layer callouts); *Google in AI vidnost* — the utilities riser (drawing right, points as duct labels — visibility drawn literally as connection to the outside world). Native `<details>` mechanics and the scroll-drift correction carry over.

**Differentiators** = »Specifikacije«: a boxed spec panel on the sheet — each claim's typed `measure` as the value cell (`100 % po meri` · `Google + ChatGPT` · `3 delovni dnevi` with the PON·TOR·SRE ticks, the one earned sequence · `24 h`), values in Narrow caps, claims in serif, glosses beneath, four deliberately unequal rows that can never read as a 2×2 card grid.

## 9. Contact finale

The last descent crosses a monumental **ground line** — a full-bleed horizontal datum with hatch beneath — and the world inverts to `--zemlja`: below grade, where foundations are. The narrative point lands without a word: everything above rested on this. »Povejte, kaj potrebujete.« in paper-on-dark serif; »Kaj sledi?« as the three numbered phases (the other allowed sequence). The form **is a title block at full scale**: fields as title-block cells (Kaj potrebujete? / Ime / E-naslov / Sporočilo), submit as the red stamp field »Pošljite povpraševanje« — the visitor fills in the title block of their own future sheet. All form engineering carries wholesale: Web3Forms, honeypot + sub-2 s silent fake-success, degrade-open, first-paint live region, error identification, iOS-safe input sizing. The footer shares the dark: the colophon keeps its contract (`statična stran · brez sledilnih piškotkov`) as the drawing's final stamp; footer nav remains the phone's complete nav.

## 10. Desktop behavior

Named sequences: **»Zarez«** (opening cut — inline CSS veil); **»Spust«** (sticky-stacked storeys — pure `position: sticky`, zero JS); **»Prerezna ravnina«** (the signature — one rAF scroll-read interpolating two `clip-path` insets, plus the range-input grip); **»Plošče«** (sticky stacking + anchor-scrolling PREV/NEXT); **»Dva načina gradnje«** (one-shot SVG stroke draw on IO arrival); **»Temeljenje«** (ground-line crossing, one-shot hatch draw). Pointer: default cursor everywhere except the cut scene, where a fine crosshair appears with a live mono readout of the cut's real percentage (»globina«) — the one place the visitor operates an instrument. Technology honesty: **no WebGL, no GSAP, no Lenis, no canvas.** The entire concept is CSS sticky + clip-path + SVG + one rAF interpolation + WAAPI one-shots routed through the existing `fx` tracker. The ambition is spatial and conceptual, not dependency-heavy — that is the feasibility core.

## 11. Mobile (320–430 px)

Independently composed, not shrunk. Level rail retired; a thin top strip carries the wordmark and current-level label (the datum becomes a header instrument); full nav lives in the footer plus a MENU overlay with 44 px targets. Frames tighten to top/bottom hairlines; the h1 recalibrates (min 2.8 rem, wdth eased to ~100 under 400 px so lines break on words). The descent survives untouched — sticky stacking is native scroll. **The signature survives fully:** scroll already drives the cut, so it is touch-native by construction; the range grip fattens to 48 px; safe-area insets pad the frame; the left 24 px stays dead (iOS back-swipe zone). Plates stack vertically, PREV/NEXT hidden, screenshots served at real phone widths from the srcset. `html`/`body` are painted `--list` (iOS samples the page paint for the status strip); the dark finale is an element, so overscroll stays paper at both ends.

## 12. Motion language

Precision-instrument, one-shot doctrine. Draws (cut lines, hatch, SVG strokes): 600–1200 ms, `cubic-bezier(0.22, 1, 0.36, 1)`, IO-armed, unobserved on first fire. Micro-feedback 150–250 ms. The cut plane tracks scroll 1 : 1 with **no easing lag** — an instrument that lags is an instrument that lies. WAAPI with `fill: 'none'`, last keyframe equals stylesheet rest. Loops: **exactly one** — a live clock in the contact title block (real time, updates once a minute, tiny area, visibility-gated; the noartmusic-validated "decoration that is not decoration"). Nothing else ever loops: no shimmer, no gloss sweeps, no ambient drift. The cut grip gets one finite affordance pulse (two sinusoidal swells, ~1.8 s each, midpoint peak, armed after the entrance settles, killed on first interaction). `prefers-reduced-motion` early-returns before anything is hidden; the global CSS kill-switch remains the floor.

## 13. Performance tiers

- **FULL** (modern desktop): everything above.
- **STANDARD** (mid devices / save-data): crosshair and live readout dropped; the cut keeps its range grip but scroll interpolation becomes five IO-thresholded steps with 300 ms transitions; SVG stroke draws become fades.
- **REDUCED** (reduced-motion / no IO): the art-directed static edition — no veil, the cut resting at its composed 45/55, plates as scrolled sheets, all strokes pre-drawn, clock hidden (title block shows the build date). Complete and beautiful because a section drawing *is* a finished artifact, not a paused animation.

## 14. Feasibility & risks

- Sticky-stacked scenes prerender as ordinary sections — SSG-safe; ref.digital ships the identical mechanism to phones.
- Cut scene: both layers complete in static HTML; JS only moves a clip. Clip repaint cost on low-end is the risk — mitigated by `inset()` on composited layers plus the STANDARD stepped fallback. The facade fragment renders from the same content module as the hero, so the content guard stays green (the old x-ray proved the pattern).
- Guard repointing: the postbuild x-ray guard must change in the same commit the scene lands, or builds block — planned, via the single-source `machine-facts.ts`.
- Red discipline: `--rez` must not collide with error semantics; form errors keep icon + text and get a separately tested rust tone — flagged for the token sheet.
- Archivo wght+wdth subset size: measure; worst case ship two static cuts (Expanded 300, Narrow 500).
- iOS `svh`/toolbar drift: scenes tolerate it because content sits inside the frame inset; verify on device.
- Range-input restyling is fiddly but bounded — and it is the accessibility spine of the signature, so it is engineering, not garnish.
- Plates need re-shot screenshots at new sizes → re-run the one-shot script per its ritual (lemur's below-the-rotator crop rule still applies).
- New microcopy (title-block labels, chamber names, »globina«) needs owner sign-off like all copy; machine identifiers (anchors, topic values, the `feedback` key) are untouched.

## 15. Why this cannot be mistaken for a template

Templates decorate surfaces; this page's single subject is the difference between surface and structure, executed as architecture: a veil that cuts instead of fades, navigation as a level datum, a portfolio of plates with honest title blocks, a comparison that draws its argument, a contact form that is literally a title block below grade, and a centerpiece in which the site cuts *itself* open while a build guard proves the wound is real. Every device derives from one metaphor and from this page's own emitted bytes. Remove the logo and the section drawing still names the studio; transplant another company's content and the cut scene would expose *their* head, *their* robots.txt, *their* headers — it cannot be reused, which is the definition of not-a-template.