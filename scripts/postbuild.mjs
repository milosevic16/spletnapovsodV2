/**
 * Post-prerender pipeline — runs inside `npm run build`; a failure BLOCKS the
 * deploy. If a guard fails, fix the page — never weaken the assertion.
 *
 *   1. Per-page head assertions (lang, title, h1, canonical, hreflang, OG).
 *   2. Honesty guard: the x-ray panel's machine layer must equal the real head.
 *   3. Content guard: every copy string from src/content/home.ts must be
 *      present in the emitted HTML (evaluated, not regexed, so it can't drift).
 *   4. sitemap.xml + robots.txt generated FROM the emitted HTML.
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

// Text-NODE escaping as Vue SSR performs it: & < > only — quotes stay raw.
const escapeText = (s) => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')

/** Attribute-order-agnostic: find tags matching all given attribute regexes. */
const findTags = (html, tagRe, ...attrRes) =>
  [...html.matchAll(tagRe)].map((m) => m[0]).filter((t) => attrRes.every((re) => re.test(t)))
const attr = (tag, name) => new RegExp(`\\s${name}="([^"]*)"`).exec(tag)?.[1]

// --------------------------------------------------------------------------
// Collect pages
// --------------------------------------------------------------------------
const htmlFiles = readdirSync(dist).filter((f) => f.endsWith('.html'))
if (htmlFiles.length === 0) {
  console.error('postbuild: no HTML files emitted — prerender failed')
  process.exit(1)
}

const pages = htmlFiles.map((file) => {
  const html = readFileSync(join(dist, file), 'utf8')
  // Assert against the HEAD only — the x-ray panel repeats head-like strings in the body.
  const head = html.slice(0, html.indexOf('</head>'))
  const links = [...head.matchAll(/<link[^>]*>/g)].map((m) => m[0])
  const metas = [...head.matchAll(/<meta[^>]*>/g)].map((m) => m[0])
  return {
    file,
    html,
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
// 2. Honesty guard — the x-ray machine layer equals the real head
// --------------------------------------------------------------------------
const home = pages.find((p) => p.file === 'index.html')
if (home && home.title && home.canonical) {
  const bodyOnly = home.html.slice(home.html.indexOf('<body'))
  const titleLine = escapeText(`<title>${home.title}</title>`)
  const canonicalLine = escapeText(`<link rel="canonical" href="${home.canonical}">`)
  if (!bodyOnly.includes(titleLine)) {
    fail('index.html', 'x-ray machine layer does not show the real <title> line')
  }
  if (!bodyOnly.includes(canonicalLine)) {
    fail('index.html', 'x-ray machine layer does not show the real canonical line')
  }
}

// --------------------------------------------------------------------------
// 3. Content guard — every visible copy string is in the emitted HTML
// --------------------------------------------------------------------------
if (home) {
  const tmp = mkdtempSync(join(tmpdir(), 'sp-content-'))
  const outfile = join(tmp, 'home.mjs')
  await esbuild({
    entryPoints: [join(process.cwd(), 'src', 'content', 'home.ts')],
    bundle: true,
    format: 'esm',
    platform: 'neutral',
    outfile,
  })
  const content = await import(pathToFileURL(outfile).href)
  rmSync(tmp, { recursive: true, force: true })

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

// Answer engines are a goal — AI/LLM bots are explicitly welcome.
const robots = `User-agent: *
Allow: /

User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: CCBot
Allow: /

User-agent: Google-Extended
Allow: /

Sitemap: ${SITE_ORIGIN}/sitemap.xml
`
writeFileSync(join(dist, 'robots.txt'), robots)

// --------------------------------------------------------------------------
if (failures.length) {
  console.error(`\npostbuild: ${failures.length} guard failure(s):`)
  for (const f of failures) console.error('  ✗ ' + f)
  process.exit(1)
}
console.log(
  `postbuild: OK — ${pages.length} page(s) asserted, sitemap (${indexable.length} URL(s)) + robots.txt generated`,
)
