/**
 * Single source of truth for site-wide constants.
 * Canonicals, JSON-LD, OG tags and the sitemap all derive from SITE_ORIGIN —
 * never from window.location (undefined at build time).
 */
export const SITE_ORIGIN = 'https://spletnapovsod.si'

export const SITE_NAME = 'SpletnaPovsod'

/**
 * Contact inbox. NOTE: placeholder pattern only in code comments — the address
 * below is derived from the domain and must be CONFIRMED by the owner before
 * launch (see CLAUDE.md → Owner checklist).
 */
export const CONTACT_EMAIL = 'info@spletnapovsod.si'

