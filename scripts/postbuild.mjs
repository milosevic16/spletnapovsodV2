/**
 * Post-prerender pipeline — runs inside `npm run build`; a failure BLOCKS the
 * deploy. If a guard fails, fix the page — never weaken the assertion.
 *
 *   1. Per-page head assertions (lang, title, h1, canonical, hreflang, OG).
 *   2. Honesty guard (REZ 1:1): every `data-fact` node in the emitted HTML
 *      must byte-equal its artifact (head line / robots line / netlify.toml
 *      header / shipped file), AND every fact enumerated in
 *      src/lib/machine-facts.ts must be displayed — bidirectional, so the cut
 *      scene can neither lie nor silently lose a fact.
 *   3. Content guard: every copy string from src/content/home.ts must be
 *      present in the emitted HTML (evaluated, not regexed, so it can't drift).
 *   4. sitemap.xml + robots.txt generated FROM the emitted HTML; the robots
 *      AI-bot list comes from machine-facts.ts — the scene and the file are
 *      the same list by construction.
 */
import { readdirSync, readFileSync, writeFileSync, mkdtempSync, rmSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { pathToFileURL } from 'node:url'
import { build as esbuild } from 'esbuild'

const SITE_ORIGIN = 'https://spletnapovsod.si'
const dist = join(process.cwd(), 'dist')
const failures = []
const fail = (page, msg) => failures.push(`${page}: ${msg}`)

// Text escaping as Vue SSR actually performs it (@vue/shared escapeHtml):
// all five of " & ' < > — the old three-character version would false-fail
// the content guard the first time a copy string carried a straight quote.
// Ampersand first on the way in, last on the way out, or entities double-escape.
const escapeText = (s) =>
  s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
const unescapeText = (s) =>
  s
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&apos;', "'")
    .replaceAll('&amp;', '&')
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** Attribute-order-agnostic: find tags matching all given attribute regexes. */
const findTags = (html, tagRe, ...attrRes) =>
  [...html.matchAll(tagRe)].map((m) => m[0]).filter((t) => attrRes.every((re) => re.test(t)))
const attr = (tag, name) => new RegExp(`\\s${name}="([^"]*)"`).exec(tag)?.[1]

/** Bundle a TS module (with the app's @ alias) and import its evaluated exports. */
async function importTs(entry, label) {
  const tmp = mkdtempSync(join(tmpdir(), `sp-${label}-`))
  const outfile = join(tmp, `${label}.mjs`)
  await esbuild({
    entryPoints: [join(process.cwd(), entry)],
    bundle: true,
    format: 'esm',
    platform: 'neutral',
    alias: { '@': join(process.cwd(), 'src') },
    outfile,
  })
  const mod = await import(pathToFileURL(outfile).href)
  rmSync(tmp, { recursive: true, force: true })
  return mod
}

// --------------------------------------------------------------------------
// Collect pages
// --------------------------------------------------------------------------
const htmlFiles = readdirSync(dist).filter((f) => f.endsWith('.html'))
if (htmlFiles.length === 0) {
  console.error('postbuild: no HTML files emitted — prerender failed')
  process.exit(1)
}

// Stamp the veil's IZRIS date HERE, where the final bytes exist — a vite
// transformIndexHtml hook does not survive into the vite-ssg-rendered route
// files. replaceAll + a blocking assertion: the one element whose whole point
// is a checkable true fact must never ship a placeholder.
const IZRIS_TOKEN = '%' + 'IZRIS%'
const buildDate = new Date().toISOString().slice(0, 10)
for (const file of htmlFiles) {
  const p = join(dist, file)
  const html = readFileSync(p, 'utf8')
  if (html.includes(IZRIS_TOKEN)) writeFileSync(p, html.replaceAll(IZRIS_TOKEN, buildDate))
}

const pages = htmlFiles.map((file) => {
  const html = readFileSync(join(dist, file), 'utf8')
  // Assert against the HEAD only — the cut scene's ledger repeats head lines in the body.
  const head = html.slice(0, html.indexOf('</head>'))
  const links = [...head.matchAll(/<link[^>]*>/g)].map((m) => m[0])
  const metas = [...head.matchAll(/<meta[^>]*>/g)].map((m) => m[0])
  return {
    file,
    html,
    head,
    lang: /<html[^>]*\slang="([^"]*)"/.exec(html)?.[1],
    title: /<title[^>]*>([^<]*)<\/title>/.exec(head)?.[1]?.trim(),
    canonical: attr(links.find((l) => /rel="canonical"/.test(l)) ?? '', 'href'),
    noindex: metas.some((m) => /name="robots"/.test(m) && /noindex/.test(m)),
    h1s: [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/g)].map((m) =>
      m[1].replace(/<[^>]+>/g, '').trim(),
    ),
    alternates: links
      .filter((l) => /rel="alternate"/.test(l) && /hreflang=/.test(l))
      .map((t) => ({ hreflang: attr(t, 'hreflang'), href: attr(t, 'href') })),
    og: Object.fromEntries(
      metas
        .filter((m) => /property="og:/.test(m))
        .map((t) => [/property="og:([^"]*)"/.exec(t)?.[1], attr(t, 'content')]),
    ),
    twitterCard: attr(metas.find((m) => /name="twitter:card"/.test(m)) ?? '', 'content'),
  }
})

// --------------------------------------------------------------------------
// 1. Per-page assertions
// --------------------------------------------------------------------------
for (const p of pages) {
  if (p.html.includes(IZRIS_TOKEN)) fail(p.file, 'unstamped IZRIS token in emitted HTML')
  if (p.lang !== 'sl') fail(p.file, `html lang="${p.lang}" — expected "sl"`)
  if (!p.title) fail(p.file, 'empty or missing <title>')
  if (p.h1s.length !== 1 || !p.h1s[0]) {
    fail(p.file, `expected exactly one non-empty <h1>, found ${p.h1s.length} (${p.h1s.join(' | ')})`)
  }
  if (!p.canonical) {
    fail(p.file, 'missing canonical')
    continue
  }
  if (!p.canonical.startsWith(SITE_ORIGIN)) {
    fail(p.file, `canonical "${p.canonical}" not on ${SITE_ORIGIN}`)
  }
  const expectedCanonical = p.file === 'index.html' ? `${SITE_ORIGIN}/` : `${SITE_ORIGIN}/${p.file.replace(/\.html$/, '')}`
  if (p.canonical !== expectedCanonical) {
    fail(p.file, `canonical "${p.canonical}" — expected "${expectedCanonical}"`)
  }

  if (p.noindex) continue // noindex pages carry no hreflang/OG duties

  // Single-locale site: self-referential sl + x-default, nothing else.
  const hl = new Map(p.alternates.map((a) => [a.hreflang, a.href]))
  if (hl.get('sl') !== p.canonical) fail(p.file, `hreflang sl → "${hl.get('sl')}" ≠ canonical`)
  if (hl.get('x-default') !== p.canonical) fail(p.file, `hreflang x-default → "${hl.get('x-default')}" ≠ canonical`)
  if (p.alternates.length !== 2) fail(p.file, `expected exactly 2 hreflang links, found ${p.alternates.length}`)

  for (const key of ['title', 'description', 'image', 'url', 'locale']) {
    if (!p.og[key]) fail(p.file, `missing og:${key}`)
  }
  if (p.og.url && p.og.url !== p.canonical) fail(p.file, `og:url "${p.og.url}" ≠ canonical`)
  if (p.og.image && !p.og.image.startsWith(SITE_ORIGIN)) fail(p.file, 'og:image not absolute on site origin')
  if (p.og.image) {
    const ogFile = p.og.image.slice(SITE_ORIGIN.length).replace(/^\//, '')
    if (!existsSync(join(dist, ogFile))) fail(p.file, `og:image file dist/${ogFile} does not exist`)
  }
  if (p.twitterCard !== 'summary_large_image') fail(p.file, `twitter:card "${p.twitterCard}"`)
  if (!p.html.includes('application/ld+json')) fail(p.file, 'missing JSON-LD')
}

// --------------------------------------------------------------------------
// 2. Honesty guard — every displayed machine fact byte-equals its artifact
// --------------------------------------------------------------------------
const home = pages.find((p) => p.file === 'index.html')
const machineFacts = await importTs('src/lib/machine-facts.ts', 'facts')
const { factLines, AI_BOTS } = machineFacts

// robots.txt content is built here (written in step 4) so the guard checks
// the SAME string the file will carry.
const robotsContent = `User-agent: *
Allow: /

${AI_BOTS.map((bot) => `User-agent: ${bot}\nAllow: /`).join('\n\n')}

Sitemap: ${SITE_ORIGIN}/sitemap.xml
`

const netlifyToml = readFileSync(join(process.cwd(), 'netlify.toml'), 'utf8')

if (home) {
  const displayed = [...home.html.matchAll(/<code[^>]*\sdata-fact="([^"]+)"[^>]*>([\s\S]*?)<\/code>/g)].map(
    (m) => ({ id: m[1], text: unescapeText(m[2]) }),
  )
  const displayedIds = new Set(displayed.map((d) => d.id))
  const factById = new Map(factLines.map((f) => [f.id, f]))

  // (a) every displayed node matches an enumerated fact, verbatim
  for (const d of displayed) {
    const f = factById.get(d.id)
    if (!f) {
      fail('index.html', `data-fact "${d.id}" is not enumerated in machine-facts.ts`)
      continue
    }
    if (d.text !== f.text) {
      fail('index.html', `data-fact "${d.id}" displays "${d.text}" ≠ fact "${f.text}"`)
    }
  }

  // (b) every enumerated fact is displayed at least once (bidirectional)
  for (const f of factLines) {
    if (!displayedIds.has(f.id)) fail('index.html', `fact "${f.id}" is enumerated but never displayed`)
  }

  // (c) every fact matches its real artifact
  for (const f of factLines) {
    switch (f.artifact) {
      case 'head': {
        if (!home.head.includes(f.text)) {
          fail('index.html', `head fact "${f.id}" not found verbatim in the emitted <head>: ${f.text}`)
        }
        break
      }
      case 'robots': {
        if (!robotsContent.includes(f.text)) {
          fail('index.html', `robots fact "${f.id}" not in generated robots.txt: ${f.text}`)
        }
        break
      }
      case 'netlify-header': {
        const idx = f.text.indexOf(': ')
        const name = f.text.slice(0, idx)
        const value = f.text.slice(idx + 2)
        const m = new RegExp(`${escapeRe(name)}\\s*=\\s*"([^"]*)"`).exec(netlifyToml)
        if (!m) fail('index.html', `header fact "${f.id}": ${name} not pinned in netlify.toml`)
        else if (m[1] !== value) {
          fail('index.html', `header fact "${f.id}": displayed value "${value}" ≠ netlify.toml "${m[1]}"`)
        }
        break
      }
      case 'dist-file': {
        if (!existsSync(join(dist, f.text.replace(/^\//, '')))) {
          fail('index.html', `file fact "${f.id}": dist${f.text} does not exist`)
        }
        break
      }
      default:
        fail('index.html', `fact "${f.id}" has unknown artifact kind "${f.artifact}"`)
    }
  }
  console.log(
    `postbuild: honesty guard checked ${displayed.length} displayed fact node(s) against ${factLines.length} enumerated fact(s)`,
  )
}

// --------------------------------------------------------------------------
// 3. Content guard — every visible copy string is in the emitted HTML
// --------------------------------------------------------------------------
if (home) {
  const content = await importTs('src/content/home.ts', 'content')

  const collect = (root, skipKeys) => {
    const out = new Set()
    const walk = (v) => {
      if (typeof v === 'string') {
        // Copy strings only: skip machine identifiers, URLs, colors, file names.
        if (v.length >= 12 && !/^(https?:|#|\/|[a-z0-9-]+$)/.test(v)) out.add(v)
      } else if (Array.isArray(v)) v.forEach(walk)
      else if (v && typeof v === 'object') {
        for (const [k, val] of Object.entries(v)) {
          if (skipKeys.includes(k)) continue
          walk(val)
        }
      }
    }
    walk(root)
    return out
  }

  const normalize = (s) => s.replace(/\s+/g, ' ')
  const check = (strings, page, label) => {
    const haystack = normalize(page.html)
    for (const s of strings) {
      if (!haystack.includes(normalize(escapeText(s)))) {
        fail(page.file, `content string missing from emitted HTML: "${s.slice(0, 60)}…"`)
      }
    }
    console.log(`postbuild: content guard checked ${strings.size} ${label} strings`)
  }

  // 'feedback' = interaction-only strings, skipped by contract; notFound is 404-page copy.
  const { notFound, ...homeContent } = content
  check(collect(homeContent, ['feedback', 'notFound']), home, 'home')
  const p404 = pages.find((p) => p.file === '404.html')
  if (p404 && notFound) check(collect(notFound, []), p404, '404')

  // The apartment subpage owns its own content module, checked against its own
  // emitted page under the same contract: every visible string in the static
  // HTML. A page that ever stops emitting its copy fails the build.
  const apt = pages.find((p) => p.file === 'apartmaji.html')
  if (apt) {
    const aptContent = await importTs('src/content/apartmaji.ts', 'apartmaji')
    check(collect(aptContent, ['feedback']), apt, 'apartmaji')
  }

  // The privacy subpage, same contract: every visible legal string in its own
  // module must appear in the emitted page, so the policy can never silently
  // lose a clause.
  // The two terms documents, same contract as every other page module.
  for (const [file, mod, label] of [
    ['pogoji-splosno.html', 'src/content/pogoji.ts', 'pogoji-splosno'],
    ['pogoji-apartmaji.html', 'src/content/pogoji-apartmaji.ts', 'pogoji-apartmaji'],
  ]) {
    const page = pages.find((p) => p.file === file)
    if (!page) continue
    check(collect(await importTs(mod, label), []), page, label)
  }

  const zas = pages.find((p) => p.file === 'zasebnost.html')
  if (zas) {
    const zasContent = await importTs('src/content/zasebnost.ts', 'zasebnost')
    check(collect(zasContent, []), zas, 'zasebnost')
  }
}

// --------------------------------------------------------------------------
// 4. sitemap.xml + robots.txt from the emitted HTML
// --------------------------------------------------------------------------
const indexable = pages.filter((p) => !p.noindex && p.canonical)
const sitemap =
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n` +
  indexable
    .map((p) => {
      const alts = p.alternates
        .map((a) => `    <xhtml:link rel="alternate" hreflang="${a.hreflang}" href="${a.href}"/>`)
        .join('\n')
      return `  <url>\n    <loc>${p.canonical}</loc>\n${alts}\n  </url>`
    })
    .join('\n') +
  `\n</urlset>\n`
writeFileSync(join(dist, 'sitemap.xml'), sitemap)

// Answer engines are a goal — AI/LLM bots are explicitly welcome. The list
// lives in machine-facts.ts: the cut scene shows the same bots this file allows.
writeFileSync(join(dist, 'robots.txt'), robotsContent)

// --------------------------------------------------------------------------
if (failures.length) {
  console.error(`\npostbuild: ${failures.length} guard failure(s):`)
  for (const f of failures) console.error('  ✗ ' + f)
  process.exit(1)
}
console.log(
  `postbuild: OK — ${pages.length} page(s) asserted, sitemap (${indexable.length} URL(s)) + robots.txt generated`,
)
