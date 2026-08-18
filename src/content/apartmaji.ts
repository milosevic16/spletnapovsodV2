/**
 * All visible copy for the /apartmaji subpage. Components render; this module
 * owns every string. Machine identifiers (ids, anchor targets) stay English.
 *
 * SOURCE: the owner's notes for the apartment offer (avgust 2026), rewritten
 * to real sentences. The house copy rules hold: no em dashes in visible copy,
 * no rhetorical-question hook, no exclamation marks, no unbacked superlatives,
 * lists as long as the content wants rather than reflexively three.
 *
 * DRAFT status: needs owner sign-off before launch, same as home.ts.
 *
 * NO PRICES, by owner's call (avgust 2026): the tiers are described by what
 * they contain and the CTA sends the visitor to ask. Nothing here states a
 * price, so nothing can misstate one — and the JSON-LD carries no Offer.
 * Deliberately NOT carried in the copy:
 *   - the top tier's e-mailed invoices and its not-yet-decided sales point
 *     (both marked uncertain in the source: "računi na mail neki?", "neki
 *     prodajnega se morem se spomnt"), so they are omitted rather than invented;
 *   - the payment provider name ("preko x" was undecided): the Profi tier says
 *     "integriran plačilni sistem" without naming one.
 */

export interface AptPackage {
  id: string
  name: string
  summary: string
  includes: string[]
  footnote?: string
}

export const meta = {
  title: 'Spletna stran za apartma: ponudba in paketi',
  description:
    'Izdelamo spletno stran za vaš apartma ali sobe: oglaševanje izven booking platform, prikaz zasedenosti in povpraševanje prek strani. Trije paketi.',
}

export const breadcrumb = {
  homeLabel: 'Domov',
  currentLabel: 'Apartmaji',
}

export const hero = {
  kicker: 'Apartmaji in sobodajalci',
  title: 'Spletna stran za vaš apartma',
  lead: 'Rezervacije prek platform nosijo provizijo, vaš oglas pa je videti kot vsi drugi. Lastna stran vam da naslov, kamor gosta pošljete neposredno, in pri poslovnih rezervacijah pusti vtis urejenega apartmaja.',
  ctaLabel: 'Povprašajte za svoj apartma',
  ctaTarget: 'kontakt',
}

export const examples = {
  kicker: 'Primeri',
  title: 'Kako lahko izgleda vaša stran',
  body: 'Pripravili smo nekaj primerov oblike in postavitve. Služijo kot izhodišče: če vam kateri ustreza, gradimo na njem, sicer opišete svoje želje.',
  /**
   * Honest empty state. The example template pages ("iz Gašprovega repota") do
   * not exist as assets yet, and fabricated preview cards are not an option on
   * this project. When the screenshots arrive they drop into
   * ApartmajiExamples.vue's grid (build them through
   * scripts/build-reference-images.mjs for the same AVIF/WebP/JPEG variants and
   * versioned filenames as the portfolio).
   */
  pending: 'Primeri so v pripravi. Do takrat povejte, kaj vam je všeč, in pripravimo osnutek.',
}

export const packages = {
  kicker: 'Ponudba',
  title: 'Trije paketi',
  ctaLabel: 'Povprašajte za ponudbo',
  ctaTarget: 'kontakt',
  items: [
    {
      id: 'basic',
      name: 'Osnovna',
      summary:
        'Za oglaševanje apartmaja izven booking platform in urejen vtis pri poslovnih rezervacijah.',
      includes: [
        'Spletna stran z lastno domeno',
        'Prilagojena za mobilne naprave',
        'Osnovna optimizacija za Google in AI-iskalnike (SEO in GEO)',
        'Registracija in vezava domene',
      ],
      footnote:
        'Cena domene ni vključena. V večini primerov prvo leto stane okoli 12,5 €, nato okoli 25 € letno; ceno določa registrar. Znesek vam povemo, preden domeno registriramo.',
    },
    {
      id: 'advanced',
      name: 'Napredna',
      summary: 'Vse iz osnovne, s prikazom zasedenosti in povpraševanjem prek strani.',
      includes: [
        'Vse iz osnovne ponudbe',
        'Prikaz zasedenosti, samodejno usklajen z Airbnbjem; proste termine lahko dodate tudi ročno',
        'Razširjena optimizacija za iskalnike in AI-odgovore',
        'Obrazec za povpraševanje, vezan na zasedenost: gost izbere med prostimi termini, povpraševanje pa vam pride naravnost v e-pošto',
      ],
    },
    {
      id: 'profi',
      name: 'Profi',
      summary: 'Vse iz napredne, z vgrajenim plačilom na strani.',
      includes: [
        'Vse iz napredne ponudbe',
        'Integriran plačilni sistem: gost plača neposredno na vaši strani',
      ],
    },
  ] satisfies AptPackage[],
}

export const revisions = {
  kicker: 'Popravki',
  title: 'Krog popravkov',
  intro:
    'Vsako stran pripravimo tako, da lastniku ustreza že takoj. Ker pa ima vsak svoje želje, ki jih vnaprej ne moremo predvideti, je en krog popravkov vključen, po potrebi jih je lahko več.',
  conditions: [
    'En krog zajema do pet strani predlaganih popravkov. Običajno en krog zadošča.',
    'Popravki so spremembe, kot so pozicija gumbov, zamenjava slik, barv ali pisave, in podobni posegi v obstoječo strukturo strani. Ne vključujejo novih funkcionalnosti ali celotne prenove grafične podobe.',
    'Če predlog presega ta obseg, vam to povemo vnaprej in določimo ceno glede na dodatno delo.',
  ],
}

/**
 * The subpage's own nav stops. The shared chrome (SiteMasthead, SiteFooter)
 * takes these as props; the home page's anchors would scroll nowhere here.
 */
import type { NavItem } from './home'

export const nav: NavItem[] = [
  { target: 'primeri', label: 'Primeri' },
  { target: 'paketi', label: 'Paketi' },
  { target: 'popravki', label: 'Popravki' },
  { target: 'kontakt', label: 'Kontakt' },
]

/** The masthead CTA. Short: the strip is one row and the CTA never wraps. */
export const ctaPrimary = { label: 'Povprašajte', target: 'kontakt' }
