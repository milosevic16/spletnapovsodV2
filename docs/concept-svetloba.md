# PROTI SVETLOBI — concept document for spletnapovsod.si

## 1. Name + central metaphor

**»Proti svetlobi«** — *against the light*. Every genuine document — a banknote, a negative, a notarial deed — proves itself only when held up to the light: the watermark that ordinary daylight cannot show. This site is an inspector's light table on which web pages are examined as documents, and the visitor's own light is the instrument that reveals the system layer authenticating the surface — the literal enactment of the founding line *"Spletna stran ni zgolj tisto, kar vidite, temveč tudi tisto, česar ne."*

## 2. The world

A physical world of three materials: **milk glass** (the lit table), **graphite ink** (what is written), and **light itself** (the only accent). No hue gradients anywhere — the *only* gradients permitted are luminance falloffs, because a gradient here is always a lamp, never decoration. Shadow is information: whatever sits outside the pool of light is content awaiting inspection, not missing content.

Tokens (jobs named; ratios approximate — recompute numerically at token time per house rules, against the darkest surface each can sit on):

- `--plate #F4F3EE` — page ground, the milk-glass table. Ink on it ≈14:1.
- `--plate-lit #FDFCF7` — lamp pools, hover grounds, the form's island of light.
- `--graphite #1E2124` — primary ink. `--graphite-2 #565B60` — secondary, ≈5.5:1 on plate.
- `--temnica #101318` — the darkroom field (portfolio, signature scene, finale). `--temnica-2 #1A1F26` — plate slots/insets on dark (insets carrying accent text go lighter).
- `--lamp #E4B363` — tungsten; the accent's voice on dark, ≈10:1 on temnica. CTAs, focus rings, watermark emissions, gauge points.
- `--lamp-ink #7A550F` — the accent on light surfaces, ≈6:1 on plate.
- `--paper-dim #D6D4CC` — secondary text in the darkroom, ≈11:1.
- `--hairline #DCDAD2` / `--hairline-dark #2A3038` — rules, plate edges.

Warm tungsten against cool graphite-blue darkness is the entire chromatic story: one accent that is literally the metaphor. Nothing viridian, nothing paper-warm — the dead system's world does not survive.

## 3. Typography

Three voices, each a role in the inspection — all self-hostable via fontsource, latin-ext subsets mandatory (č š ž):

- **Display / instrument — Archivo Variable** (`@fontsource-variable/archivo`, wght 100–900 + wdth 62–125). Headlines set wide (wdth ≈120) and *light* (300–350) — monumental like etched markings on laboratory equipment, never bold-shouty. Kickers: Archivo SemiCondensed caps, 0.7rem, letter-spacing 0.1em.
- **Text / document — Newsreader Variable** (`@fontsource-variable/newsreader`, opsz + wght, true italics). The warm serif voice of the thing being examined: leads, summaries, glosses, body.
- **Machine / emission — Fragment Mono** (`@fontsource/fragment-mono`, 400; verify latin-ext at install, fallback Space Mono). Bound by a new **typographic honesty contract: mono appears ONLY on genuine machine emissions** — real head lines, real URLs, real header names, sampled hex values. If it is mono, it is checkable; the build guard enforces this (§6). Mono is never styling.

Fluid clamp() scale by role; h1 ≈ `clamp(2.2rem, 1.2rem + 4vw, 4.2rem)`, tracking −0.015em. Fontaine metric fallbacks (Arial / Georgia / Courier New) regenerated for the new families.

## 4. Spatial system

The page is a **table onto which plates are slid**: full-viewport scenes built with sticky stacking (each scene `position: sticky; top: 0; min-height: 100svh`; the next scrolls up over the pinned last) — pure CSS, prerenders as plain sections, touch-native by construction. Between plates: calm editorial passages on the light table, left-aligned, 66ch measure, asymmetric 12-col grid (content columns 2–8, inspection margin 9–12 for annotations).

Rhythm map (intense/calm):

1. **Prižig** — opening (intense, ≤2.4s)
2. **Hero** — daylight, calm-monumental
3. **Pregledovalnica** — darkroom, portfolio plates (intense) ← environmental change 1
4. **Protokol** — return to daylight; pillars as inspection protocol (calm)
5. **Presvetlitev** — full darkroom, THE SIGNATURE (most intense) ← environmental change 2, interaction-mode change
6. **Dva lista** — WordPress comparison, still under the light (medium)
7. **Odčitki** — differentiators, half-light, instrument readings (calm)
8. **Zadnja luč** — contact at dusk: one lamp pool over the form (calm conclusion) ← environmental change 3

Darkness is spent deliberately, three times, always earned by the act of inspection. (Note: this moves the surface-to-system scene *after* the portfolio while keeping the owner's "proof before argument" order — references still precede the invisible-work argument.)

## 5. Opening — Prižig

First paint: the inline veil (static HTML + CSS in the shell, zero fonts, zero JS, zero images) shows the darkroom field with a 1px horizontal filament line. Sequence: the line warms (opacity 0→1, 500ms), blooms into a soft tungsten pool (radial luminance gradient scaling up, 900ms), and the veil fades (400ms) to reveal the hero already lit — total ~1.8–2.2s with a 1.6s minimum beat. Wordless, so no font can swap mid-intro. `<noscript>` drops the veil; a ~9s pure-CSS failsafe reveals regardless; every JS wait is time-capped. The h1 sits complete in static HTML beneath the veil at all times.

Hero: Archivo-light h1 (*Hitre, dostopne in profesionalne spletne strani.*, accent prefix derived, never restated), Newsreader lead, both CTAs as plain anchors. In the inspection margin: the page's own **vodni znak** — the real `<title>` string printed as a genuine watermark, graphite at ~4% opacity, aria-hidden, derived from the same constant as the head. The brand identity IS a watermark.

## 6. THE SIGNATURE — Presvetlitev

Full-viewport darkroom. Center: **the sheet** — a document-sized rendition of this very page's surface (the real h1, nav labels, CTA labels — rendered from the same content module, so it can never lie). The visitor holds it against the light:

- **Desktop:** the pointer *is* the lamp. A ~180px circle of light follows it; inside the circle the surface turns translucent and the **watermark layer beneath** shows through (clip-path circle on the surface layer over the system layer — both real DOM text, selectable, prerendered). A 10px light-dot cursor replaces the default only inside this scene.
- **All users:** a segmented control — existing strings **»Kar vidite« / »Kar vidi Google«** — toggles the full system view with no pointer at all (aria-pressed, keyboard, carried from the current toggle pattern). The lens is the theatrical form; the toggle is the canonical one. With JS off, *both layers render stacked and complete*.
- **Mobile:** §11.

What the light reveals — only real, derived facts: `<html lang="sl">`; the real `<title>`; the real meta description; the canonical `https://spletnapovsod.si/`; hreflang sl + x-default; the Organization/WebSite JSON-LD fragment. In the plate margins, mono **stamps**: the six robots.txt AI allows (GPTBot, ClaudeBot, anthropic-ai, PerplexityBot, CCBot, Google-Extended) and the shipped security headers from netlify.toml (HSTS, nosniff, Referrer-Policy…). Every emission keeps its human gloss in Newsreader (existing `machineGloss` and item strings) — no emission without its Slovenian sentence.

**Why it is honest and how the guard asserts it:** every emission node carries `data-emission="<key>"`. `scripts/postbuild.mjs` (the existing x-ray honesty guard, repointed) parses `dist/index.html`, and for each key asserts the displayed text equals the actually-emitted head element byte-for-byte; robots stamps are asserted against the generated `robots.txt`; header stamps against parsed `netlify.toml`. The same pass enforces the sitewide mono contract: any element in the emission register missing `data-emission`, or failing equality, blocks the deploy.

## 7. Portfolio — Pregledovalnica

The first darkening. Three sticky-stacked full-viewport plates, one per real reference, each sliding over the last as the visitor scrolls — not a grid, not a carousel: a **directed examination sequence**. Each plate:

- The real screenshot presented as a **backlit transparency**: soft luminance bloom behind it (CSS radial gradient in `--lamp` falloff), slight settle-in scale on arrival (one-shot, IO-triggered).
- Plate label in mono: the live URL (`lemur.legal` …) — a checkable fact and the stretched link to the real site (existing pattern: name as `<a>`, visually-hidden new-window note, `rel="noopener"`).
- Examination notes in the margin (Newsreader): sector, description, `proof` line.
- **Emulsion swatches**: the client's real sampled `inks` as small squares *with their hex values printed in mono* — decoration that is data.

Navigation: plain scroll stacks the plates (inherently touch-native); PREV/NEXT anchor links (»Prejšnja plošča« / »Naslednja plošča«) give keyboard and directed navigation; a functional position readout (»Plošča 2 / 3«) is pagination, not decorative numbering. `<picture>`/srcset AVIF-WebP-JPEG blocks carry over; the screenshot re-shoot ritual reruns for new plate dimensions.

## 8. Services, differentiators, comparison

**Protokol** (pillars — back in daylight, calm): the three pillars as chapters of one inspection protocol, kept on native `<details>` with the paid-for scroll-drift correction. Meaningful variation — each chapter closes with a different **real artifact strip** (mono, guard-covered): *Unikaten dizajn* → this site's own font subsets and srcset variants as the evidence of bespoke craft; *Varnost, hitrost, skladnost* → the actual shipped header names as stamped seals; *Google in AI vidnost* → robots allows + `sitemap.xml` + JSON-LD types. Three chapters, three different proofs, one system.

**Dva lista** (WordPress comparison, directly after Presvetlitev, still dark): two sheets held against the light. Ours transilluminates — the watermark shows through. Theirs is drawn as an opaque stack of layers (code, database, plugins — depicting their *architecture*, which is exactly what the content rows state; no fabricated measurements, no fake speed). Rows keep the accessible non-table comparison pattern; the footnote keeps it positioning, not a verdict.

**Odčitki** (differentiators, half-light): four instrument readings on a staggered ledger (never a 2×2 grid). Each `measure` annotation re-homed as a **gauge**: a thin hairline with a single bright `--lamp` point at the reading, annotation in mono, gloss in Newsreader. PON·TOR·SRE light up as three ticks, one-shot on arrival — the one earned sequence, kept.

## 9. Contact — Zadnja luč

The inspection concludes at dusk: `--temnica` field, and the **only pool of light on the page falls on the form** — commissioning your own document is the last lit act. Left margin: »Kaj sledi?« as the second earned numbered sequence. The form carries over wholesale (Web3Forms, honeypot + sub-2s reject failing silently, degrade-open, live region from first paint, labeled fields, iOS-zoom-proof 1rem inputs) — reskinned into the lamp pool, `--lamp` focus rings measured against the dark ground. Footer: colophon in mono — *statična stran · brez sledilnih piškotkov* — the site's own final watermark, still bound by the mechanically-verifiable-claims contract.

## 10. Desktop behavior

Named sequences: **Prižig** (veil), **Pregledovalnica** (sticky plate stack), **Presvetlitev** (pointer-lamp lens), **Mrk/Zora** (the three environmental crossings — sticky scenes with their own full-bleed grounds burying the last; the masthead swaps its ink via a per-scene data attribute toggled by IO), **Odčitki** (gauge one-shots), **Zadnja luč** (dusk finale).

Pointer: default everywhere except inside darkroom instrument scenes, where a small light-dot cursor appears and drives the lamp — scoped, meaningful, never a site-wide gimmick.

Technologies — deliberately minimal: **CSS sticky + IntersectionObserver + WAAPI + clip-path/mask** cover everything; one optional 2D canvas for the lens halo's soft falloff if CSS radial proves banded. **No WebGL, no GSAP, no Lenis, no scroll hijack** — native scroll is the theatre's engine, which is both the performance story and the honesty of the architecture the site sells. All effects through the existing `fx` tracker, disposed on unmount.

## 11. Mobile (320–430px)

Independently designed, not shrunk. The masthead is a static light strip (brand + anchor links, 44px targets); safe-area insets via `env()`, `viewport-fit=cover` with html/body painted `--temnica` so iOS samples the darkroom correctly at overscroll.

- **Pregledovalnica survives natively**: sticky stacking is plain scroll — the full plate theatre at 375px, zero gesture code.
- **Presvetlitev, touch-native form (the surviving signature):** no pointer, no drag gestures at all — as the pinned scene scrolls, a horizontal **light bar sweeps down the sheet**, transilluminating it line by line (rAF reads scrollY, transform-only, passive listener; scrolling is never locked). The »Kar vidite / Kar vidi Google« toggle remains the full accessible view. Because the page has *zero* touch-drag surfaces, the entire iOS gesture-claiming minefield is designed out.
- Hover-only affordances get one-shot on-arrival equivalents; hover wiring gated on `matchMedia('(hover: hover)')`.

## 12. Motion language

**Nothing on this site loops. Light moves only when you move or when you arrive.** That sentence is the motion system: one-shot, IO-triggered reveals (blooms 700–1100ms, ease-out `cubic-bezier(0.22, 1, 0.36, 1)`), micro-feedback 150–250ms, scroll-driven positions with no duration at all (plates, light bar), and the lens following the pointer directly with ~80ms smoothing. Every animation's last keyframe equals the stylesheet's resting value, `fill: 'none'`; rest state is always the complete page. All entrances animate `transform`/`opacity` only. The veil is the single scripted sequence and it is time-capped everywhere.

## 13. Performance tiers

- **Full** (fine pointer, no save-data): veil, pointer lens + halo, sticky theatre, scroll light bar, plate blooms.
- **Standard** (coarse pointer, `saveData`, low `deviceMemory`): lens becomes the toggle plus one one-shot sweep reveal; halo canvas dropped; blooms static; veil shortened to a plain fade.
- **Reduced** (`prefers-reduced-motion`): a deliberately art-directed still — Presvetlitev renders both sheets stacked and fully lit, plates as three static backlit spreads, gauges at rest with points lit, veil skipped entirely. Zero injected nodes, zero observers (early returns), global CSS kill-switch as the floor. Complete and beautiful, not degraded.

## 14. Feasibility & risks

- **Lens repaint cost**: clip-path over live text layers can jank on large areas — bound the lens to the sheet (not viewport), measure, and fall back to Standard tier. The toggle is always the canonical path, so the risk is theatrical only.
- **Sticky stacking on iOS**: proven mechanism (ref.digital at 375px); use `svh` units against URL-bar resize; verify overlap timing on a real phone.
- **Guard repointing is a tripwire**: the honesty guard and the new section must land in one commit or the build blocks (correctly).
- **Fragment Mono latin-ext**: verify č š ž in the actual woff2 before committing; fallback Space Mono.
- **Backlit screenshots**: bloom must sit *behind* the plate, never wash the image; re-shoot at new dimensions per the script ritual (Lemur crop rule stands).
- **Masthead over changing grounds**: per-scene ink swap needs a measured contrast pair on every ground; reduced tier pins it light.
- **Prerender safety**: every scene is static sections + content-module text; the lens, veil, and sweep are JS-off-invisible enhancements — the litmus test (JS disabled) shows the complete document, both layers of the signature included.
- **Copy re-headings** (»Plošča«, »Kaj vidi Google« reuse, gauge glosses) are content changes — flagged for owner sign-off, never smuggled in via styling.

## 15. Why this cannot be mistaken for a template

No template ships a build guard that blocks deployment unless the page's decoration equals its own emitted metadata — here that guard *is* the brand: mono means verified, the watermark is the real `<title>`, the stamps are the real headers, the swatches are sampled hexes with their values printed. The palette is one tungsten lamp against milk glass and graphite; the only gradients are light falloffs; nothing loops; the portfolio is an examination sequence of backlit plates, not cards. Remove the logo and the site still argues its own thesis by physically demonstrating it — a page proving, against the light, that it is genuine. That is not a look. It is a procedure only this company performs.