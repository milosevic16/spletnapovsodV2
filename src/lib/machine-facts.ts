/**
 * Machine facts — the SINGLE SOURCE for every machine emission the page shows.
 *
 * The honesty contract (REZ 1:1 brand law): Chivo Mono may appear ONLY on
 * lines that come from this module, and every line here is a real, checkable
 * byte of the shipped artifact — the emitted head, the generated robots.txt,
 * the headers pinned in netlify.toml, files that exist in dist/. The postbuild
 * guard asserts this BIDIRECTIONALLY: every fact below must appear in the
 * emitted HTML as a `data-fact` node AND match its artifact; a displayed fact
 * that matches nothing, or a fact here that no node displays, fails the build.
 *
 * scripts/postbuild.mjs bundles this module (esbuild, like the content guard)
 * and uses AI_BOTS to GENERATE robots.txt — the scene and the file cannot
 * drift because they are the same list.
 */
import { meta } from '@/content/home'
import { SITE_ORIGIN } from './constants'

/** AI/LLM crawlers explicitly welcomed in robots.txt. Answer engines are a goal. */
export const AI_BOTS = [
  'GPTBot',
  'ClaudeBot',
  'anthropic-ai',
  'PerplexityBot',
  'CCBot',
  'Google-Extended',
] as const

export type FactArtifact = 'head' | 'robots' | 'netlify-header' | 'dist-file'

export interface FactLine {
  id: string
  /** The literal displayed text — byte-equal to (or, for headers, the HTTP
   *  form of) what the artifact carries. */
  text: string
  artifact: FactArtifact
}

/**
 * Every mono line the page displays, in canonical order. Components render
 * these verbatim inside `data-fact="<id>"` nodes; the guard does the rest.
 */
export const factLines: FactLine[] = [
  // Glava dokumenta — the emitted head, verbatim.
  { id: 'head-lang', text: '<html lang="sl">', artifact: 'head' },
  { id: 'head-title', text: `<title>${meta.title}</title>`, artifact: 'head' },
  { id: 'head-desc', text: `<meta name="description" content="${meta.description}">`, artifact: 'head' },
  { id: 'head-canonical', text: `<link rel="canonical" href="${SITE_ORIGIN}/">`, artifact: 'head' },
  { id: 'head-hreflang', text: `<link rel="alternate" hreflang="sl" href="${SITE_ORIGIN}/">`, artifact: 'head' },

  // Instalacije — robots.txt: the ducts connecting the building to the street.
  { id: 'robots-gptbot', text: 'User-agent: GPTBot', artifact: 'robots' },
  { id: 'robots-claudebot', text: 'User-agent: ClaudeBot', artifact: 'robots' },
  { id: 'robots-perplexity', text: 'User-agent: PerplexityBot', artifact: 'robots' },
  { id: 'robots-allow', text: 'Allow: /', artifact: 'robots' },
  { id: 'robots-sitemap', text: `Sitemap: ${SITE_ORIGIN}/sitemap.xml`, artifact: 'robots' },

  // Ovoj — security headers as the browser receives them (values pinned in
  // netlify.toml; the guard parses the toml and compares name and value).
  { id: 'header-hsts', text: 'Strict-Transport-Security: max-age=31536000; includeSubDomains', artifact: 'netlify-header' },
  { id: 'header-nosniff', text: 'X-Content-Type-Options: nosniff', artifact: 'netlify-header' },
  { id: 'header-referrer', text: 'Referrer-Policy: strict-origin-when-cross-origin', artifact: 'netlify-header' },
  { id: 'header-csp', text: "Content-Security-Policy: frame-ancestors 'none'", artifact: 'netlify-header' },

  // Material — files that ship; each must exist in dist/.
  { id: 'file-font-archivo', text: '/fonts/archivo-latin-standard-normal.woff2', artifact: 'dist-file' },
  { id: 'file-font-serif', text: '/fonts/source-serif-4-latin-wght-normal.woff2', artifact: 'dist-file' },
  { id: 'file-img-avif', text: '/img/refs/lemur-560.avif', artifact: 'dist-file' },
  { id: 'file-img-webp', text: '/img/refs/lemur-560.webp', artifact: 'dist-file' },
]

/** Chamber → emblem/all lines lookup used by the cut scene and the ledger. */
export const factsById = new Map(factLines.map((f) => [f.id, f]))

/** Grouping for display: chamber id → fact ids (order = display order). */
export const chamberFacts: Record<string, string[]> = {
  head: ['head-lang', 'head-title', 'head-desc', 'head-canonical', 'head-hreflang'],
  'seo-foundation': ['robots-gptbot', 'robots-claudebot', 'robots-perplexity', 'robots-allow', 'robots-sitemap'],
  compliance: ['header-hsts', 'header-nosniff', 'header-referrer', 'header-csp'],
  material: ['file-font-archivo', 'file-font-serif', 'file-img-avif', 'file-img-webp'],
  // 'forms' and 'hosting' chambers are gloss-only: their facts (honeypot,
  // sub-2s reject, HTTPS handover) are code behavior, not checkable bytes —
  // so they carry NO mono lines. If it is mono, it is checkable.
  forms: [],
  hosting: [],
}
