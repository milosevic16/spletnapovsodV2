/**
 * Machine facts — the SINGLE SOURCE for every machine emission the page shows.
 *
 * The honesty contract (brand law, register-independent): the mono face
 * (currently Geist Mono) carries ONLY genuine
 * machine emissions, and every line here is a real, checkable byte of the
 * shipped artifact. The postbuild guard asserts this BIDIRECTIONALLY: every
 * fact below must appear in the emitted HTML as a `data-fact` node AND match
 * its artifact; a displayed fact that matches nothing, or a fact here that no
 * node displays, fails the build.
 *
 * `FactArtifact` keeps the robots/netlify-header/dist-file kinds the guard can
 * verify even though the current panel prints head lines only — the machinery
 * is there the moment a section wants to show a shipped header or file.
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
 * Every mono line the page displays, in the order the x-ray panel prints
 * them. `XraySection.vue` renders these verbatim inside `data-fact="<id>"`
 * nodes; the guard does the rest.
 *
 * This list stays EXACTLY as long as what the machine layer shows — the guard
 * is bidirectional, so an enumerated fact nobody displays fails the build just
 * as loudly as a displayed byte that matches no artifact. Adding a line here
 * means adding it to the panel, and vice versa.
 */
export const factLines: FactLine[] = [
  // The emitted head, verbatim — what the crawler reads before anything else.
  { id: 'head-lang', text: '<html lang="sl">', artifact: 'head' },
  { id: 'head-title', text: `<title>${meta.title}</title>`, artifact: 'head' },
  { id: 'head-desc', text: `<meta name="description" content="${meta.description}">`, artifact: 'head' },
  { id: 'head-canonical', text: `<link rel="canonical" href="${SITE_ORIGIN}/">`, artifact: 'head' },
  { id: 'head-hreflang', text: `<link rel="alternate" hreflang="sl" href="${SITE_ORIGIN}/">`, artifact: 'head' },
]

export const factsById = new Map(factLines.map((f) => [f.id, f]))
