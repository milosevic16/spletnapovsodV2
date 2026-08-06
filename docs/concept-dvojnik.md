# DRUGA STRAN — concept document

## 1. Name + central metaphor

**DRUGA STRAN** — in Slovenian, *stran* means both "page" and "side": every spletna stran has a druga stran. The site is built as two complete parallel renderings of itself — **A-stran**, the warm paper world humans read, and **B-stran**, a typographic blueprint of what machines actually receive — and the defining act of the experience is turning the page over. The brand line becomes literal architecture: *kar vidite* is A-stran; *česar ne* is B-stran, and it is real — derived line by line from the head, robots.txt, headers and structure this very build emits.

## 2. The world

Two worlds, designed as negatives of each other: dark ink on light paper, light line on dark drafting ground. Not Matrix-green; B-stran is a **cyanotype** — the architect's blueprint, the most trusted visual language of "the plan behind the building."

**A-stran (paper):**
- `--paper #F5F2EA` — page ground, warm ivory
- `--ink #20242B` — primary text, cool-black (~13:1 on paper)
- `--ink-2 #575D66` — secondary text (~5.6:1)
- `--hairline #DBD5C7` — rules, borders (line duty only)

**B-stran (blueprint):**
- `--blueprint #0E2233` — deep Prussian ground (deliberately far from the dead system's warm-black `#191d1b`)
- `--draft #D9E6EF` — primary drafting line/text (~12:1 on blueprint)
- `--draft-2 #8FAEC4` — secondary machine text (~5:1)
- `--grid #24405A` — the fine drafting grid, decorative only

**Bridge accent (one hue, two voices):** `--signal #B4512E`, a drafting-pencil sanguine — CTAs, the flip tab, focus rings (~4.6:1 on paper — verify numerically per house rule before shipping); its B-stran voice `--signal-b #E39A6B` (~7:1 on blueprint). One accent, jobs named in tokens.css with computed ratios, measured against the darkest surface each token can sit on — the token *architecture* from the old system survives; every value is new.

**Materials & light:** A-stran is matte paper — flat fills, hairlines, no shadows except one hover lift. B-stran is a lit drafting table — the fine grid, pale rules with square end-marks, dimension callouts. No photography, no texture images; both worlds are pure CSS/SVG.

## 3. Typography

All via fontsource, woff2, latin-ext subsets (č š ž), `font-display: swap` with fontaine metric fallbacks — the existing pipeline, new families:

- **Display: Bricolage Grotesque Variable** (`@fontsource-variable/bricolage-grotesque`, wght + opsz). A grotesque with a genuine point of view — at display optical sizes it turns idiosyncratic and monumental; set **light (≈300)** for the h1, following the REF register: monumental through scale and air, never bold-shouting. Its slight eccentricity keeps "professional" from sliding into "template."
- **Text: Instrument Sans Variable** (`@fontsource-variable/instrument-sans`). Quiet, warm-neutral, excellent at 1rem/1.65; carries every paragraph.
- **Machine voice: Fragment Mono** (`@fontsource/fragment-mono`, 400). A monospaced Helvetica — drafting-room, not terminal. This choice *is* the anti-cliché: B-stran set in Fragment Mono reads as a typographic technical drawing, never as hacker code.

**How type expresses the metaphor:** every element has a twin voice. A heading on A-stran ("Reference") has a B-stran twin (`<section id="reference">` in Fragment Mono). The h1's twin is the literal `<title>`. Mono is exclusively B-stran's voice: kickers, callouts, fact-lines — capped at one line, never a paragraph. Scale: fluid clamp() by role (h1 ≈ `clamp(2.2rem, 1.2rem + 4vw, 4.2rem)`, tracking −0.015em); body 64ch measure; mono fixed at 0.72–0.78rem, uppercase kickers at 0.11em tracking.

## 4. Spatial system

The page is a **stack of environments** (the proven REF mechanism): each major scene is `position: sticky; top: 0; min-height: 100svh`, and the next scrolls up over it, burying it. Pure CSS, prerenders as ordinary sections, zero scroll hijack, identical on touch. Between full-viewport scenes sit calm editorial passages in normal flow — the breath between acts.

**Persistent chrome:** down the right viewport edge runs a 8px sliver of blueprint with a vertical mono tab — **`B-stran`** — the global flip control, present from first paint. It is the constant reminder that this page, like every page, has another side. (Right edge, never left — iOS back-swipe zone.)

**Order (anchors unchanged — `reference`, `paketi`, `razlike`, `kontakt`):**

1. **Hero** — calm, monumental (paper)
2. **Reference** — intense: three stacked full-viewport worlds
3. **Nevidno / THE SIGNATURE** — most intense: the full-page turn
4. **Paketi (pillars)** — calm editorial chapters
5. **Zakaj ne WordPress?** — medium: the twin ledger
6. **Razlike** — calm index
7. **Kontakt** — the finale: the page dwells on B-stran
8. Footer colophon

Intense–calm alternation is strict: no two intense scenes touch.

## 5. Opening

**"Predlist"** (flyleaf). Inline in the HTML shell, static HTML + CSS only, system fonts, no images: the wordmark **SPLETNAPOVSOD** set in ink on paper across the upper half; below a hairline fold, its mirrored twin in pale blue on blueprint — a page and its reflection. Sequence (all time-capped): 0–0.9s hold the twin mark; 0.9–1.6s the blueprint half slides *beneath* the paper half (the machine world tucking under the surface — the whole thesis in one motion); 1.6–2.2s the veil lifts on the hero. Total ≤2.4s including the minimum beat. `<noscript>` drops the veil outright; a pure-CSS ~9s failsafe reveals the page if the app never boots. The h1, lead, and both CTAs (`Naročite izdelek`, `Oglejte si reference`) are complete in static HTML under the veil — the veil covers, never hides.

First viewport: paper, the h1 light and enormous, lead, two CTAs, the B-stran sliver breathing at the edge. One quiet mono line beneath the fold-rule under the lead — the real `<title>` — with its gloss *"Isti naslov vidita obiskovalec in Google."* (existing content, re-homed).

## 6. THE SIGNATURE — "Obrat" (the page turn)

The Nevidno scene, full viewport, sticky. On paper: the owner's founding quote set large, the intro, and at center a **sheet** — a paper card printing this page's own visible surface (the real h1, the real nav labels, rendered small — a self-portrait, nothing mocked). Its bottom-right corner curls slightly: the standing invitation.

**What the visitor does:** presses one explicit control — **`Obrnite stran`** (44px, keyboard-focusable) — or taps the sheet itself. No scroll hijack, no gesture required.

**What they see:** the entire viewport shears and turns — a compositor-only 3D rotateY on the scene container — and lands on B-stran: the same scene as a cyanotype technical drawing. The sheet now shows its back: the page's **real machine text**, grouped under the four existing item labels:

- *Vidnost na Googlu* → the actual `<html lang="sl">`, `<title>`, meta description, canonical, Organization JSON-LD line, sitemap.xml line, and robots.txt with its **six real AI-bot allows** (GPTBot, ClaudeBot, anthropic-ai, PerplexityBot, CCBot, Google-Extended)
- *Delujoči obrazci* → the form's real defenses: honeypot, sub-2s reject, degrade-open captcha policy
- *Piškotki in zasebnost* → the real security headers shipped in netlify.toml (HSTS, nosniff, referrer-policy, permissions-policy)
- *Objava na vaši domeni* → prerender architecture: built once at publish, no database, no plugins; self-hosted font subsets; AVIF/WebP/JPEG variants

Each fact-line carries its one-line human gloss — the "no measurement without its human sentence" rule survives intact. The scene closes with `invisible.outro` and the machineGloss: *"Te nevidne vrstice odločajo, ali vas Google in ChatGPT sploh najdeta."*

**Why it is honest:** every printed line is derived at build from the same modules that emit the real head, robots.txt, and netlify.toml — displayed and actual cannot diverge because they share a source. **Guard:** `postbuild.mjs` repoints the existing x-ray honesty guard — parse `dist/index.html`'s head, `dist/robots.txt`, and `netlify.toml`; assert every fact-line printed in this section **equals** its artifact, bidirectionally (a fact in the artifact missing from the sheet also fails).

After this scene the B-stran tab gains a small signal-colored index mark: the visitor now knows what it does. Flipping anywhere shows the **full blueprint sheet of the whole page** — a continuous typographic drawing, scroll-mapped section to section, itself natively scrollable (never locked). With JS off, that sheet exists as a complete, beautiful printed section — nothing is CSS-hidden.

## 7. Portfolio — three worlds, then their backs

Not cards, not a carousel: **three consecutive full-viewport sticky scenes**, one per reference, each an environment tinted by that client's **real sampled inks** (the existing `inks` data — actual palettes sampled from the live sites): Lemur's scene grounds on its `#D2DDD7`, Peter Merc's on `#ECE9E2`, Bloctopus's on `#1A2B38`. Scrolling through the portfolio means walking through three genuinely different worlds — the "vsaka stran je oblikovana posebej" claim demonstrated, not asserted.

Each scene: the screenshot as a sheet floating at center, name in display type, sector, description, proof line. Mono index `01 / 02 / 03` with PREV/NEXT controls (directed navigation, No Art register) — buttons scroll natively between scenes; plain scroll and swipe work identically. Each sheet has a **back**: press `Obrnite` (or tap the sheet) and it turns in place — the reverse is a mini-blueprint in the client's own inks: live URL as a real link (`lemur.legal` — *odpre se v novem zavihku* preserved for screen readers), the sampled ink swatches labeled with their true hex values, the proof line as the drawing's title block. All facts real; nothing invented. Both faces exist in static HTML; keyboard reaches every control; flip is a `<button aria-pressed>` toggle, 44px.

## 8. Services, differentiators, comparison

**Paketi** — three calm editorial chapters (Kononenko's staged-block rhythm), left-aligned, generous air, native `<details>` disclosure preserved (full content in DOM closed, scroll-drift correction carried). The three chapters **enact the A→B gradient** — meaningful variation, not decoration: *Unikaten dizajn* is pure A-stran (paper, display type, zero mono — the point is visible craft); *Varnost, hitrost, skladnost* carries a narrow blueprint margin column printing its real evidence (the header names, HTTPS); *Google in AI vidnost* is half-turned — its right margin is a blueprint strip with the robots/sitemap/JSON-LD artifacts. Each chapter's `artifact` string becomes its title-block stamp.

**Zakaj ne WordPress?** — the twin framing lands hardest here: **two sheets shown from the back**. Ours is a clean cyanotype; theirs is drawn in flat gray — no fabricated code, no fake dashboards, just the six existing structural rows as a typographic ledger (the accessible non-table pattern carried wholesale). Footnote preserved: positioning, not a verdict.

**Razlike** — a calm index of four entries. Each `measure` annotation becomes a blueprint **dimension callout** in the margin (Fragment Mono, square end-ticks) with its gloss beneath — the annotation+gloss content shape survives verbatim, re-clothed. `PON · TOR · SRE` remains the one earned tick sequence.

All copy stays in `src/content/home.ts`, Slovenian, typed; load-bearing claims (1 delovni dan, 3 delovni dnevi + footnote, 24h, SEO v ceni) untouched.

## 9. Contact finale

The page ends by staying on the other side: from Razlike, the blueprint world scrolls up over the paper and **remains** — the one long dwell on B-stran, the structural echo of Kononenko's dark finale. On the drafting ground sits a single sheet of warm paper: **the form** — *your inquiry is the next page we will draw*. The form itself is the familiar, fully accessible existing implementation carried wholesale (labels, honeypot, sub-2s reject, degrade-open, live region, `feedback` key contract intact). Beside it, `Kaj sledi?` — the three numbered steps as blueprint callouts (the second permitted sequence). Footer: the colophon stamp `statična stran · brez sledilnih piškotkov` set as a drawing's title block with its gloss — *"Tudi ta stran je zgrajena tako, kot gradimo vašo."* The last thing seen is the honest stamp on our own blueprint.

## 10. Desktop behavior

Named sequences: **Predlist** (opening veil — inline CSS animation); **Zlaganje** (sticky-stacked scenes — pure CSS `position: sticky`, zero JS); **Obrat** (global flip — WAAPI, compositor-only `rotateY`/shear + opacity on a viewport container, both worlds in DOM); **List** (per-reference sheet turn — contained 3D turn, two faces as separate elements, no `backface-visibility` reliance); **Kazalka** (pointer: a small ink dot on A-stran that becomes a drafting crosshair on B-stran — transform-only, hover-gated via `matchMedia('(hover:hover)')`).

**Technology, honestly scoped: no WebGL, no GSAP, no smooth-scroll library.** The blueprint grid is CSS gradients/inline SVG; every animation is transform/opacity through WAAPI and the existing `fx.ts` tracker (disposed on unmount); reveals via IntersectionObserver one-shots. The ambition is compositional, not computational — which is also why it will hit CWV thresholds.

## 11. Mobile (320–430px)

Independently designed, not shrunk. **Zlaganje survives untouched** — sticky stacking is scroll-driven and inherently touch-native. The B-stran edge sliver would fight thumbs and the iOS edge zones, so on phones the flip control becomes a **bottom pill** `B-stran` (44px+, `env(safe-area-inset-bottom)` respected, pill radius earned — it genuinely is a pill). **Obrat becomes a vertical turn** — the sheet flips up like a notepad page, matching portrait geometry; it is a plain tap, never a gesture, so nothing competes with scroll and nothing registers touch listeners in the collapsed state. Reference scenes: full-bleed tinted worlds, sheet tap-to-flip, PREV/NEXT as large targets; screenshots serve the existing srcset variants with retuned `sizes`. `html`/`body` painted per current world (`--paper`, flipping to `--blueprint`) so the iOS status-bar strip belongs to whichever world is showing — the sampler follows the paint. The surviving signature: **the full-page Obrat, tap-native, is identical in meaning on a phone** — nothing about the concept's core is desktop-only.

## 12. Motion language

- **One-shot policy, absolute:** every effect fires once on arrival or on request, then rests. Rest states live in the stylesheet; JS hides via inline style only; last keyframe equals resting value, `fill:'none'`.
- **Timings:** page/sheet turns 650ms; reveals 600–900ms; micro-feedback 180ms; ease-out enters (`cubic-bezier(0.22,1,0.36,1)`); the corner-curl affordance is a finite 2-swell sinusoidal pulse (~1.8s each), delayed past entrance, then still.
- **Loops: none.** The only continuously-updating element is the B-stran margin readout printing the visitor's real scroll position as a drawing coordinate — event-driven, factual (No Art's live-readout principle: decoration that is not decoration), silent when idle.
- `prefers-reduced-motion`: per-effect early returns above the global CSS kill-switch.

## 13. Performance tiers

- **Full:** 3D turns, veil sequence, pointer, per-scene tint transitions.
- **Standard** (no 3D transform support, save-data, low-tier device): all turns become 300ms crossfades; veil simplified to a single fade; pointer native; sticky stacking unchanged (it is free).
- **Reduced/static:** a deliberately art-directed **printed spread** — every section shows its A-content with its B-facts as a designed marginal blueprint column, both worlds simultaneously visible, zero animation, zero injected nodes, zero observers. This is a complete editorial design in its own right — arguably the most honest rendering of the metaphor — not a fallback shell.

## 14. Feasibility & risks

1. **The global flip is the hard part.** Flipping a scrolled document is not viable; implement as two layers — A-world is the normal document; B-world is one text-only blueprint sheet, present in static HTML as a real section (JS-off/crawler path), promoted at hydration to a fixed viewport layer with section-mapped scroll. Small DOM cost (text only). Risk: scroll-mapping edge cases — degrade to "flip opens the sheet at its matching section anchor."
2. **Honesty guard coupling:** removing the old x-ray section trips the existing guard — guard and section must change in one commit, repointed at the new fact-lines (head + robots.txt + netlify.toml, bidirectional).
3. **iOS WebKit 3D:** backface quirks are dodged by two-element faces and opacity; sticky + transform interactions need real-device verification; all flips are buttons, so no touch-listener traps in collapsed states.
4. **Content guard:** every string must appear in emitted HTML — the reduced-motion spread guarantees it by construction; `feedback` key contract preserved.
5. **Prerez-shaped content** (`foldGloss`, seo `prerez`, `measure`s) is re-homed into callouts, not deleted — claims survive.
6. **Regeneration ritual:** new og.jpg/favicon/touch icon via `build-og.mjs` with Bricolage; reference screenshots re-cropped only if scene dimensions demand (rerun the one-shot script per its header).
7. **Veil contract:** inline, capped waits, noscript drop, CSS failsafe — already specified in §5.

## 15. Why this cannot be mistaken for a template

Templates have one side. This site's entire identity is that it has two — and its second side is **checkably real**: view-source proves the blueprint tells the truth, and a build guard enforces it. No template ships a page whose defining interaction is turning itself over; none tints its portfolio with palettes sampled from the clients' live CSS; none sets its machine layer as a cyanotype in a monospaced Helvetica instead of terminal-green; none ends by stamping a mechanically verifiable colophon onto its own drawing. Remove the logo: the B-stran tab breathing at the edge, the sanguine-on-ivory/Prussian negative worlds, Bricolage's light monumental voice, and the page that turns over remain unmistakably one brand — and the brand is the owner's own sentence, made architecture: *kar vidite, in česar ne.*