/**
 * Single source of truth for site-wide constants.
 * Canonicals, JSON-LD, OG tags and the sitemap all derive from SITE_ORIGIN —
 * never from window.location (undefined at build time).
 */
export const SITE_ORIGIN = 'https://spletnapovsod.si'

export const SITE_NAME = 'SpletnaPovsod'

/**
 * Contact inbox — OWNER-SUPPLIED (avgust 2026), no longer a guess derived from
 * the domain. Every visible address on the site reads this one constant (the
 * footer, the contact section, the privacy policy's controller block and its
 * GDPR objection route), so an inbox move is this line and nothing else.
 *
 * Unrelated to the Web3Forms delivery address: the form posts to whatever
 * inbox the access key was registered with, which is a dashboard setting, not
 * a value in this repo. Changing this constant does NOT redirect form
 * submissions — that pairing is still on the owner checklist.
 */
export const CONTACT_EMAIL = 'studio@spletnapovsod.si'

