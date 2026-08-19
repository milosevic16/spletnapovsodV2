# SpletnaPovsod — spletnapovsod.si

**Doc mode: MAP.** This doc maps what exists. Pieces listed under "Not built yet" are
created when a task first needs them, in the shape described — not preemptively.

One-page marketing site for the SpletnaPovsod web agency. Slovenian only (locale union
widens additively if EN ever lands). No prices shown. Structure source: owner's document
"spletna struktura" (avgust 2026). **Redesigned August 2026 to the REZ 1:1 system** —
selection process, losing concepts and scores in `docs/redesign-rationale.md`.

## Stack

Vite 8 (rolldown) + Vue 3.5 + vue-router 5 + vite-ssg 28 + @unhead/vue **2** + TypeScript 5.9.

- **@unhead/vue must stay on v2** — vite-ssg 28 bundles its own unhead v2; installing v3
  alongside creates a second head instance that silently never renders (cost one debugging
  round: prerendered pages shipping the shell title, no canonical, no OG).
- **TypeScript stays 5.x** — vue-tsc 3.3 cannot drive TS 7 (native tsgo has no `lib/tsc`).
- `vue-tsc -b` is composite: both tsconfigs use `emitDeclarationOnly` into `node_modules/.tsbuild`
  so no emitted `vite.config.js` can shadow `vite.config.ts`.
- Prerender: serial (`concurrency: 1`), flat output (`dist/404.html`, not `404/index.html`).
- unhead v2 owns `htmlAttrs` at prerender — `lang="sl"` is declared in `App.vue` `useHead`;
  the shell attribute alone gets overwritten to `en`. **It also owns the viewport meta**:
  its server default replaces the shell's authored one, silently dropping
  `viewport-fit=cover` — the full viewport meta is declared in `App.vue` `useHead` too.
- **Fontaine fallbacks must be NAMED in the token stacks** (`'<family> fallback'` after
  the real family) or they are dead weight and every swap reflows the page. Per family,
  latin-ext faces are declared FIRST in `fonts.css` so the latin-derived fallback
  metrics (last-declared under the shared fallback family name) win the cascade.

## Design system — "REZ 1 : 1"

The architect's section cut at full scale. A building looks like its facade until the
section drawing cuts through it; this page is a building the visitor descends through, and
at its centre it cuts ITSELF open, exposing its own real emitted machine layer. The
owner's line ("Spletna stran ni zgolj tisto, kar vidite …") is the page's physics: above
the cut is what you see, below is what it stands on.

**World** (`src/styles/tokens.css`, every ratio computed numerically — script pattern in
session scratchpad, re-runnable): drafting paper `--list #F5F2EB`, graphite ink/poché
`--grafit #1A1C1E`, sheet hairlines `--mreza`/`--mreza-strong`, ONE red `--rez #B03B22`
(the cut + the CTA; never sprinkled, never a status color — form errors use a separately
measured rust `--err-na-temnem`), below-grade earth `--zemlja #14171A` for contact+footer
only. Depth is DRAWN (line weight, hatch, poché) — **zero drop shadows sitewide**. Square
corners absolute (not even pills).

**Type** — one lettering hand + one voice + one machine register:
- **Archivo Variable** (wght+wdth, `public/fonts/archivo-latin*-standard-*`): Expanded
  ~115% at weight 275 = monumental display (`--wdth-monument`); Narrow 74% caps =
  datum/instrument labels (`.datum`, `--wdth-datum`). Monumentality through size and
  width, never boldness.
- **Source Serif 4 Variable** (wght only — deliberately NOT the 2.4× opsz cut): body.
- **Chivo Mono 400** (`.emisija`): **THE HONESTY CONTRACT — mono appears ONLY on genuine
  machine emissions** (head lines, robots lines, header values, URLs, file names, sampled
  hex values, the live clock). Claims and labels use Archivo Narrow caps. If it is mono,
  it is checkable. `data-fact` nodes are guard-enforced (below); URLs/hex/clock are
  checkable by inspection.

**Signature motifs** (reuse these, don't invent new vocabulary):
1. **The cut plane** — red rule with square end ticks; opens the veil, drives the cut
   scene, marks the CTA.
2. **The title block** (drawing convention, bottom-right, heavy right edge) — veil,
   plates, contact form (the form IS a title block), 404, og.jpg wordmark.
3. **Poché + 45° hatch** — solid graphite fill for the machine world; hatch at the
   ground-line crossing (`.contact__ground`, pure CSS repeating gradient).
4. **The datum** — navigation as instrument: desktop fixed left level rail (vertical-rl
   labels, red current tick via scroll-spy), phone top strip + native `<dialog>` menu.

**Experience spine** (order in `HomeView.vue`; anchors `reference/paketi/razlike/kontakt`
are machine identifiers, unchanged): veil (»Zarez«) → masthead strip (four nav buttons +
the page's single CTA) → statement band (brand wordmark tight top-left, claim + lead
right) → work carousel (full-bleed pigment stage, in-frame previews porting each client
site's own landing animation) → Spletna pod površino (the viewport cut line — see
`TraditionSection.vue` header) → pillar chapters → differentiators → below-grade contact
+ footer. (The plates theatre, the cut scene, the ledger and the WordPress comparison
from the original REZ build were removed in the avgust 2026 REF-layout pivots; their
subsections below are historical until this doc gets its post-pivot refresh.)

**The cut scene** (`CutSection.vue`) — the defining interaction:
- One unitless var `--cut-n` (the section layer's share, 12–88; **stylesheet rest = 55**,
  the composed 45/55 drawing = the no-JS/reduced state AND og.jpg) drives two `clip-path:
  inset()` values + the plane's `translateY`. Scroll is the knife: a 240svh wrapper, a
  sticky 100svh viewport, scroll-PROPORTIONAL (one compositor frame of iOS lag accepted —
  never claim "lag-free").
- A real `<input type="range">` (»Globina reza«) is the same value's canonical control —
  keyboard-first, 44px, `aria-valuetext` »X % pod površino«. Manual input wins until
  scroll moves >24px (`MANUAL_SCROLL_TOLERANCE`). Hidden until `.cut--live` (no dead
  control with JS off).
- Tiers (`src/lib/tiers.ts`): FULL = per-frame rAF + crosshair readout (fine pointer, no
  save-data, deviceMemory ≥4), self-downgrades to STANDARD if the first 30 frames average
  >24ms (`FRAME_BUDGET_MS`); STANDARD = five steps on a throttled scroll listener
  (`--t-step` CSS transitions); REDUCED (reduced-motion / no IO) = the static drawing,
  grip still live. **Zero touch listeners in every tier** — scroll + range only.
- Short viewports (<700px height): in-scene chambers go label-only; the ledger below is
  the canonical complete rendering everywhere.

**Machine facts** (`src/lib/machine-facts.ts`) — the single source for every mono line:
head lines, robots lines (from `AI_BOTS`, which postbuild ALSO uses to generate
robots.txt — same list by construction), netlify.toml header values, shipped file paths.
Components render them in `data-fact="<id>"` nodes (scene emblems, ledger, pillar strips).

**Motion**: one-shot doctrine, everything through `src/lib/fx.ts`, disposed on unmount.
Draws 600–1200ms `cubic-bezier(0.22,1,0.36,1)`, IO-armed; WAAPI `fill:'none'`, last
keyframe = stylesheet rest. The ONE loop: the contact title block's minute clock (real
time, visibility-gated). One finite grip pulse (2 sinusoidal swells, killed on first
interaction). Reduced motion: global kill-switch + per-effect early
returns; the static page is a finished section drawing.

**The veil** (`index.html`, inline): the logo's origin story, pure CSS ~3.2s — on black,
»spletnapovsod« types out; the p of Povsod and the final d are the pd mark's own halves
(red disc, white letter, exaggerated tails); the plain letters vanish, the word contracts
into the mark, and the mark flies to the hero brand position while the page settles
beneath (base.css delays and App.vue's 3.8s cleanup are keyed to the timeline — each side
names the other). The landing is a COPIED FORMULA (–-hero-inset, --hero-wordmark, the
45px desktop strip) — change those tokens, change the veil's literals. CANNOT hang by
construction (no JS dependency). `<noscript>` and reduced-motion drop it entirely.
No images, literal hex colors. Type: Archivo Variable at 500 (the studio voice, per the
owner's Claude Design prototype) — safe in the veil because the bundled CSS is
render-blocking (family + fontaine metric fallback exist before first paint) and the
woff2 is preloaded, so a late swap changes glyphs, not geometry; the old system-fonts
rule is retired on that reasoning.
The pd mark itself renders in three places — veil, StatementSection, SiteMasthead —
same geometry, paired by comment. (The old IZRIS stamp left with the sheet veil;
postbuild's stamping/guard are conditional and now no-op. favicon/og still carry the
old sheet-cut mark — regenerate with the owner.)

**Buried-plate focus**: sticky plates get `inert` while fully covered (rAF-throttled
scroll check, desktop only); the plate INDEX above the stack is the keyboard/SR-canonical
route to all three live sites, so the theatre can never trap anyone.

**Mobile** (≤900px): top strip + `<dialog>` menu (native focus trap; scroll unlock runs
directly in `closeMenu()`, NOT only on the dialog's `close` event — that event can be
deferred in throttled documents); plates static; grip touch-native; safe-area insets on
strip/grip/menu; footer nav is the complete in-flow nav.

## The no-fabricated-numbers rule (load-bearing)

Unchanged from the first build and now structurally enforced: every mono line must be a
real emitted byte (guard-checked), every measurement a checkable fact. Never a
performance number we have not measured in the field. (The WordPress comparison section,
which this rule once shaped, was removed avgust 2026 on the owner's call — the rule
outlives it.) Once real CWV field data exists (Search Console, ~28-day lag), numbers may
enter — sourced and dated.

## Content

ALL copy lives in `src/content/home.ts` (typed). Components render; content owns strings.
Machine identifiers (form topic values, DOM ids, subject keys, chamber/fact ids) stay
English. Interaction-only strings live under `feedback` — the content guard skips those
by contract. **Copy status: DRAFT — needs owner sign-off before launch**, including the
redesign's new strings (chamber labels/glosses `head`+`material`, ledger titles, plate
index/nav labels, grip label). `hero.foldGloss` and the old `invisible.items` shapes
retired with the old design; the four owner-derived item texts survive verbatim as
chamber glosses.

## Build pipeline = the CI

`npm run build` → typecheck → vite-ssg → `scripts/postbuild.mjs`, which BLOCKS the deploy on:
per-page lang/title/single-h1/canonical/hreflang/OG/JSON-LD assertions; **the honesty
guard** (every `data-fact` node byte-equals its artifact — emitted head, generated
robots.txt, netlify.toml header values, shipped files — AND every fact enumerated in
`machine-facts.ts` is displayed: bidirectional); the content guard (every copy string
evaluated from the content module appears in the emitted HTML); og:image existence — then
generates `sitemap.xml` + `robots.txt` FROM the emitted HTML (AI bots from `AI_BOTS`).
If a guard fails, fix the page, never weaken the assertion.

One-off scripts (committed, NOT part of the host build):
- `scripts/build-reference-images.mjs` — portfolio screenshots (2× density) →
  AVIF/WebP/JPEG variants up to 1792w. Refresh ritual in its header; lemur's crop starts
  below its rotating intro line. **Post-launch refreshes must bump filename versions** —
  /img/* ships an immutable year-long cache header, so same-name refreshes never reach
  repeat visitors.
- `scripts/build-og.mjs` + `scripts/og.html` — og.jpg via headless Edge (real variable
  Archivo); the image IS the signature: the composed 45/55 cut drawing. Touch icon +
  favicon carry the same mark (sheet, red plane, poché below).

## Deploy (when the owner is ready)

GitHub holds the source; **Netlify does all the building and deploying**. Push to the
production branch and Netlify builds from source — that push IS the deploy.

**There is deliberately no GitHub-side deploy** and there must never be one: no
`.github/workflows`, no GitHub Pages, no Actions build. Two builders drift.

Everything the build needs is pinned in `netlify.toml` (build command, publish dir, Node 24,
headers, 404 redirect) — that file is the deploy config and must stay. **The honesty guard
reads netlify.toml header values — editing a security header there without updating
`machine-facts.ts` fails the build (by design).**
Netlify free plan + private repo: **no Co-Authored-By trailers in commits**.
`VITE_WEB3FORMS_KEY` is a public-by-design client key: lives in Netlify env +
`SECRETS_SCAN_OMIT_KEYS`, never committed. Post-deploy checklist lives in the global rules.

## Verification habits (done means)

- `npm run build` green (guards included).
- **Live-browser measurement over screenshots**: headless Edge at narrow widths renders a
  scaling artifact on this machine (cost one false alarm). The browser pane, when hidden,
  suspends rAF, IO callbacks AND the dialog `close` event task — for anything
  frame-driven, inject the dist-only rAF/IO shim (pattern in the redesign verification
  commits) and drive frames by hand; report measured-not-seen.
- **Two measurement traps this pane sets, both of which produced wrong conclusions:**
  `scrollWidth` on a block reports the BOX, so a clipped `nowrap` line looks like a
  perfect fit — measure text with a Range over the text node. And `:focus` cannot match
  while `document.hasFocus()` is false, so a focus-state check here reads as "broken"
  when it is fine; assert `document.hasFocus()` before believing a focus measurement.
- **A state-style that "does not apply" in the pane is usually the pane.** Measured on
  the contact chips: the element matched the rule, the rule was the only higher-specificity
  match, its tokens resolved — and the base values stayed applied, with no forced recalc
  rescuing it. A freshly created element with the same classes computed exactly as
  declared, which proves the CSS and indicts the pane's invalidation. Before "fixing" such
  a rule, build a probe element; the first two diagnoses here (sibling combinator, then
  stale recalc) were both wrong.
- Anything touching effects: navigate away/back twice — no stacked observers/animations
  (everything routes through `src/lib/fx.ts`, disposed on unmount).
- The cut scene after changes: scroll-drive lands on theory (12 + p×76), grip override
  respects the 24px tolerance, clips stay complementary, rest state 55 with JS off.
- Form changes: submit for real once the Web3Forms key exists; verify honeypot + <2s reject.
- Console free of new errors; no horizontal overflow at 1440/375/320.

## Open with the owner (asked, not yet answered)

- **Two commas** in the owner-supplied references intro were corrected rather than copied
  verbatim. Revert if the pauses were deliberate.
- **More references** would deepen the plates theatre — three sticky sheets is the
  minimum that reads as a sequence. Fabricated placeholder cards are not an option.
- **Pillar kickers** were renamed from »Steber 1/2/3« to structural-system names
  (Nosilna konstrukcija / Ovoj stavbe / Instalacije) — the concept bans decorative
  numbering. Needs sign-off with the rest of the copy.
- **»Naročite izdelek«** (owner's own wording from the Popravki document) reads as a
  product-shop button next to the izdelava framing — linguistically »Naročite izdelavo«
  would fit better. Owner's call; shipped verbatim as supplied.
- **Further sales devices** proposed and deliberately not built: free speed/SEO audit,
  committed response times, testimonials, price table, partner programme, FAQ, directory
  listings. Each is an owner decision.

## Owner checklist (launch blockers)

1. **Copy sign-off** — all of `src/content/home.ts`, especially: "odgovorimo v enem
   delovnem dnevu", "objava v 3 delovnih dneh" + scope note, "popravki v 24 urah", AND
   the redesign's new strings (chamber labels/glosses, ledger titles, plate labels,
   »Globina reza«).
2. **Web3Forms access key** — key supplied and wired LOCALLY (avgust 2026): it lives
   in `.env.local` (gitignored) and the form is verified working end to end against
   the live API. STILL OPEN: the same `VITE_WEB3FORMS_KEY` must be added to the
   Netlify env (owner's dashboard — nobody else can set it), or every deployed
   build ships without a key and the form fails closed with its error line. Env
   vars are read at BUILD time, so a redeploy is required after adding it.
   Confirm too WHICH inbox the key delivers to — Web3Forms sends to the address
   the key was registered with, not to `CONTACT_EMAIL`.
3. **Contact e-mail** — `info@spletnapovsod.si` is assumed from the domain, unverified
   (`src/lib/constants.ts`).
4. **Company legal facts** (registered name, address, VAT) — needed for the privacy-policy
   page, deliberately NOT built yet (no invented org facts).
5. **Domain purchase + Netlify project** — canonical origin is one constant (`SITE_ORIGIN`).
6. If analytics are ever added: the footer colophon "brez sledilnih piškotkov" changes
   FIRST (colophon contract: only mechanically verifiable claims).

## Not built yet (create in this shape when needed)

- **Privacy policy page** (`/zasebnost`): own route, prerendered, self-canonical, in
  sitemap, added to `includedRoutes` in `vite.config.ts` + a no-cache header block in
  `netlify.toml`; content from verified org facts only.
- **EN locale**: widen a `Locale` union, `Localized<T>` content modules, hreflang pairs,
  locale-root flat files — the registry pattern from the house rules. (The postbuild
  hreflang assertion currently hardcodes the single-locale sl+x-default pair.)
- **Apartment-owner subpage**: only with approved content; the plate/sheet system extends
  naturally (LIST 5 …).
- **Pricing table**: only with owner-confirmed tiers and prices (VAT flags in any
  structured data).
