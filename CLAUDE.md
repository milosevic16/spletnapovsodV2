# SpletnaPovsod — spletnapovsod.si

**Doc mode: SPEC → MAP transition.** The initial build-out is done; this doc now maps what
exists. Pieces listed under "Not built yet" are created when a task first needs them, in the
shape described — not preemptively.

One-page marketing site for the SpletnaPovsod web agency. Slovenian only (locale union widens
additively if EN ever lands). No prices shown (pillars describe what every package contains).
Structure source: owner's document "spletna struktura" (avgust 2026), plus the SEO pillar copy
derived from our own rendering practices.

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
  the shell attribute alone gets overwritten to `en`.

## Design system — "Pod površino"

Chosen by a 4-concept / 3-judge panel (unanimous). Identity built from the owner's own line:
*"Spletna stran ni zgolj tisto, kar vidite, temveč tudi tisto, česar ne."*

- Two worlds: warm paper (`--surface`) for humans, dark underlay (`--panel`) for the machine
  layer. Masthead, x-ray band, contact + footer are the underlay bookends. `html` AND `body`
  are painted `--panel` (iOS samples the page paint for the status-bar strip; `#app` paints paper).
- One accent: viridian `--accent #2E6E5E` (`--accent-on-dark #7FBFAB` inside the underlay).
  Every token's contrast ratio is documented in `src/styles/tokens.css` and was computed
  numerically — never eyeball a new pairing.
- Type: Fraunces Variable (display, opsz axis), Public Sans Variable (text), IBM Plex Mono 400
  (kickers + annotations ONLY — a mono annotation is capped at one line; if the page ever reads
  "technical", reduce annotation COUNT, don't restyle the motif).
- Signature motifs (reuse these, don't invent new vocabulary):
  1. **Prerez** — dimension line with square end-ticks whose mono annotation states a REAL fact,
     paired with a plain-Slovenian gloss (gloss rule: no measurement without its human sentence).
     Component: `src/components/PrerezLine.vue`.
  2. **Dvojna plast** — paper card offset off a dark under-layer; the exposed bottom strip
     prints a real machine fact (live URLs on reference cards, the domain on the hero card).
- Trailing fades mark "there is more": horizontal on the phone reference strip, vertical at the
  bottom of the desktop reference grid. A fade needs something to dissolve — a gradient to
  `--surface` drawn over `--surface` is invisible, so the desktop one falls across the last
  card, which reserves empty paper below its text for exactly that. **No readable text may ever
  sit under a gradient**; extend that reserve rather than letting the fade climb into copy.
- Square corners everywhere; `border-radius: 999px` only on the genuine pill (x-ray segmented
  control). PON·TOR·SRE ticks and the numbered "Kaj sledi?" steps are the ONLY sequences allowed
  to number themselves — everything else is unordered and stays unnumbered.
- The x-ray machine layer derives from the same constants/content as the real head, and the
  build guard asserts equality — it can never be allowed to drift (it is the honesty device).

## Page order (as shipped)

Masthead → hero → **reference** → **nevidno** (invisible work) → paketi → razlike → kontakt →
footer. References deliberately precede the invisible-work band (owner's call): the proof lands
before the argument. Section anchors are ids, so the order can be changed in `HomeView.vue`
alone — nav, sitemap and head follow automatically.

## The no-fabricated-numbers rule (load-bearing)

Every mono annotation, comparison cell and measurement on this page must be a fact that can be
checked against the shipped artifact or against how the architecture works. **Never a
performance number we have not measured in the field.** The competitor this positioning answers
(web-net.si) wins its WordPress comparison on "0.4 s vs 3.5 s, 9× faster" — those are *their*
measurements and must not be borrowed. Two consequences already live in the code:

- the SEO pillar's Prerez says "Core Web Vitals", not a number of seconds
  (`src/content/home.ts`, `pillars.items[seo].prerez`);
- "Zakaj ne WordPress?" is fought on **structure** — built once vs rebuilt per visit, no
  plugins, no database, bespoke vs template, what a crawler reads without running code
  (`comparison` in the content module, rendered by `ArchitectureCompare.vue`).

Once real field data exists (CWV in Search Console, ~28-day lag), numbers may enter — sourced
and dated, never from a lab run.

## Content

ALL copy lives in `src/content/home.ts` (typed). Components render; content owns strings.
Machine identifiers (form topic values, DOM ids, subject keys) stay English. Interaction-only
strings live under a `feedback` key — the content guard skips those by contract.
**Copy status: DRAFT — needs owner sign-off before launch** (see Owner checklist).

## Build pipeline = the CI

`npm run build` → typecheck → vite-ssg → `scripts/postbuild.mjs`, which BLOCKS the deploy on:
per-page lang/title/single-h1/canonical/hreflang/OG/JSON-LD assertions, the x-ray honesty
guard, the content guard (every copy string evaluated from the content module must appear in
the emitted HTML), og:image file existence — then generates `sitemap.xml` + `robots.txt`
FROM the emitted HTML (AI bots explicitly allowed). If a guard fails, fix the page, never
weaken the assertion.

One-off scripts (committed, NOT part of the host build):
- `scripts/build-reference-images.mjs` — portfolio screenshots → AVIF/WebP/JPEG variants.
  Refresh ritual in its header. Deliberately not build-time (no deploy dependency on third-party
  sites). Lemur's crop starts below its rotating intro line (mid-animation in every frame).
- `scripts/build-og.mjs` + `scripts/og.html` — og.jpg via headless Edge (real Fraunces; resvg's
  static instance renders the wrong cut), touch icon via resvg.

## Deploy (when the owner is ready)

GitHub holds the source; **Netlify does all the building and deploying**. Push to the
production branch and Netlify builds from source — that push IS the deploy.

**There is deliberately no GitHub-side deploy** and there must never be one: no
`.github/workflows`, no GitHub Pages, no Actions build. Two builders drift, and the host's
git integration is the whole pipeline. GitHub's only job here is to store the repo and
notify Netlify. (Verified empty: no `.github/` directory, 0 Actions workflows, Pages off.)

Everything the build needs is pinned in `netlify.toml` (build command, publish dir, Node 24,
headers, 404 redirect) — that file is the deploy config and must stay.
Netlify free plan + private repo: **no Co-Authored-By trailers in commits**.
`VITE_WEB3FORMS_KEY` is a public-by-design client key: lives in Netlify env +
`SECRETS_SCAN_OMIT_KEYS`, never committed. Post-deploy checklist lives in the global rules
(marker-grep the served bundle, AI-UA curl, GSC + Bing sitemap submission).

## Verification habits (done means)

- `npm run build` green (guards included).
- Desktop check via headless Edge full-page capture; **phone layout via live-browser
  measurement** — headless Edge at narrow window sizes renders with a scaling artifact on this
  machine (text overflows that do NOT exist in a real browser; cost one false alarm). Trust
  in-app browser `scrollWidth`/rect measurements at 375px, or a real phone.
- Anything touching effects: navigate away/back twice — no stacked observers/animations
  (everything routes through `src/lib/fx.ts`, disposed on unmount).
- Form changes: submit for real once the Web3Forms key exists; verify honeypot + <2s reject.
- Console free of new errors.

## Open with the owner (asked, not yet answered)

- **Two commas** in the owner-supplied references intro were corrected rather than copied
  verbatim (no comma between a fronted phrase and its main clause; none before a coordinating
  "in"). Revert if the pauses were deliberate.
- **The desktop reference fade** costs the last card its seam URL, which the other two still
  print. Keep the effect, shorten it, or drop it.
- **More references** would make the "there is more" fade honest by construction — right now the
  grid holds three. Fabricated placeholder cards are not an option.
- **Further sales devices** were proposed and deliberately not built: a free speed/SEO audit of
  the visitor's current site (needs a Lighthouse backend), committed response times, client
  testimonials, a price table, a partner/referral programme, an FAQ, and directory listings
  (info-slovenija.si). Each is an owner decision, several are business commitments.

## Owner checklist (launch blockers)

1. **Copy sign-off** — all of `src/content/home.ts`, especially: "odgovorimo v enem delovnem
   dnevu" (response-time promise), "objava v 3 delovnih dneh" scope note, "popravki v 24 urah".
2. **Web3Forms access key** → Netlify env `VITE_WEB3FORMS_KEY` (+ local `.env.local` for testing).
3. **Contact e-mail** — `info@spletnapovsod.si` is assumed from the domain, unverified
   (`src/lib/constants.ts`). Confirm or replace (it feeds the page, JSON-LD and mailto links).
4. **Company legal facts** (registered name, address, VAT) — needed for the privacy-policy page,
   which is deliberately NOT built yet (no invented org facts). Until it exists the form carries
   only the short privacy note; the compliance pillar's promise makes this page a pre-launch must.
5. **Domain purchase + Netlify project** — canonical origin is one constant (`SITE_ORIGIN`).
6. After analytics are ever added: the footer colophon line "brez sledilnih piškotkov" must
   change FIRST (colophon contract: only mechanically verifiable claims).

## Not built yet (create in this shape when needed)

- **Privacy policy page** (`/zasebnost`): own route, prerendered, self-canonical, in sitemap;
  content from verified org facts only. Add to footer legal links when it lands.
- **EN locale**: widen a `Locale` union, `Localized<T>` content modules, hreflang pairs,
  locale-root flat files — the registry pattern from the house rules.
- **Pricing table**: only with owner-confirmed tiers and prices (VAT flags in any structured data).
