/**
 * All visible copy for the /apartmaji subpage. Components render; this module
 * owns every string. Machine identifiers (ids, anchor targets) stay English.
 *
 * SOURCE: the owner's document "Spletna povsod VSEBNA" (avgust 2026). That
 * document is shorthand notes, not final copy, and it carries its OWN writing
 * rules in part two ("Navodila za človeški slog pisanja"). Every string below
 * is written to those rules, which is why none of it reads like the sketch:
 *   - no em dashes in visible copy (comma, period or colon instead),
 *   - no rhetorical question as an opening hook (the sketch's intro was one),
 *   - no artificial urgency, no unbacked superlatives, no marketing set phrases,
 *   - claims name what the reader actually gets, not an adjective,
 *   - lists are as long as the content wants, deliberately not always three.
 *
 * DRAFT status: needs owner sign-off before launch, same as home.ts.
 *
 * PRICES. 335 € is the owner's own figure and is quoted as given. The site is
 * NOT VAT-registered (owner-confirmed), so the price is final and no tax is
 * added; that is stated in `packages.taxNote` rather than left to inference.
 * The Advanced tier's price is deliberately ABSENT: the source document says
 * "js bi dou 525? + 2 kroga popravkov. Nared placeholder", i.e. the figure is
 * the owner thinking aloud, not a decision. Publishing an unconfirmed price is
 * exactly what the no-fabricated-numbers rule forbids, so the tier carries a
 * placeholder line and the working figure stays here in this comment.
 */

import type { NavItem } from './home'

export interface AptReason {
  id: string
  title: string
  body: string
}

export interface AptPackage {
  id: string
  name: string
  /** Rendered verbatim. Never a number that has not been confirmed. */
  price: string
  summary: string
  includes: string[]
  footnote?: string
}

export const meta = {
  title: 'Spletna stran za apartma: paketi in cene',
  description:
    'Izdelamo spletno stran za vaš apartma ali sobe, z rezervacijskim sistemom ali brez njega. Osnovni paket stane 335 €, cena je končna.',
}

export const breadcrumb = {
  homeLabel: 'Domov',
  currentLabel: 'Apartmaji',
}

/**
 * The subpage's own stops. The shared chrome takes these as props, so the
 * masthead and the footer point at sections that exist HERE — the home page's
 * anchors would scroll nowhere on this page.
 */
export const nav: NavItem[] = [
  { target: 'zakaj', label: 'Zakaj' },
  { target: 'paketi', label: 'Paketi' },
  { target: 'videz', label: 'Videz' },
  { target: 'kontakt', label: 'Kontakt' },
]

/**
 * The masthead CTA. Deliberately shorter than the hero's: the strip is one row
 * of five items and the CTA never wraps, so a long label is what pushes a
 * 320px phone into a horizontal scroll.
 */
export const ctaPrimary = { label: 'Povprašajte', target: 'kontakt' }

export const hero = {
  kicker: 'Apartmaji in sobodajalci',
  title: 'Spletna stran za vaš apartma',
  lead: 'Provizija na platformah vzame del vsake rezervacije, vaš oglas pa je videti tako kot vsi ostali, ker ga postavlja isti obrazec. Lastna stran vam da naslov, kamor lahko gosta pošljete neposredno. Spodaj so trije paketi in kaj vsak od njih vsebuje.',
  ctaLabel: 'Povprašajte za svoj apartma',
  ctaTarget: 'kontakt',
}

export const reasons = {
  kicker: 'Zakaj sploh',
  title: 'Kaj vam da lastna stran',
  items: [
    {
      id: 'commission',
      title: 'Provizija ostane pri vas',
      body: 'Vsaka rezervacija prek platforme nosi provizijo, ki jo plačate vi, del pa tudi gost. Pri rezervaciji neposredno prek vaše strani te provizije ni. Stran se povrne takrat, ko nanjo preide del gostov, ki bi sicer prišli prek platforme.',
    },
    {
      id: 'own-channel',
      title: 'Kanal, ki je vaš',
      body: 'Platforme spreminjajo pravila, vrstni red prikaza in pogoje sodelovanja, vi pa na to nimate vpliva. Vaša stran ostane taka, kot ste jo naredili, ne glede na to, kaj se zgodi z vašim profilom.',
    },
    {
      id: 'real-picture',
      title: 'Gost vidi apartma, ne oglasa',
      body: 'Oglas na platformi je omejen na rubrike, ki so za vse enake. Na svoji strani pokažete okolico, hišni red, dostop in razpoložljivost tako, kot ustreza prav vašemu apartmaju, in v obsegu, ki ga sami določite.',
    },
    {
      id: 'fewer-questions',
      title: 'Manj ponavljajočih se vprašanj',
      body: 'Pri dolgoročnem oddajanju gre večina prvega stika v ista vprašanja: kje točno je, kaj je vključeno, kdaj je prosto in kakšni so pogoji. Stran odgovori nanje enkrat, vi pa se oglasite takrat, ko je vprašanje res novo.',
    },
  ] satisfies AptReason[],
}

export const packages = {
  kicker: 'Paketi',
  title: 'Trije paketi',
  /** Carried by the Prerez dimension line: a checkable fact about the prices. */
  taxAnnotation: 'nismo zavezanci za DDV',
  taxNote: 'Navedene cene so končne, davek se nanje ne prišteva.',
  scopeNote:
    'Obseg enega kroga popravkov uskladimo pred začetkom dela, da je vnaprej jasno, kaj je vključeno in kaj je že novo naročilo.',
  items: [
    {
      id: 'basic',
      name: 'Osnovna',
      price: '335 €',
      summary: 'Predstavitvena stran za vaš apartma.',
      includes: [
        'En krog popravkov',
        'Brezplačno polurno svetovanje',
        'Zakup domene za prvo leto, če je izbrana domena standardno ovrednotena (12,5 €)',
      ],
      footnote:
        'Domena je prvo leto pri večini ponudnikov občutno cenejša, zato je naslednje leto dražja. Koliko bo stala, vam povemo, preden jo registriramo, da vas strošek čez leto dni ne preseneti. Vsak naslednji krog popravkov stane 50 €.',
    },
    {
      id: 'advanced',
      name: 'Advanced',
      price: 'Cena v pripravi',
      summary: 'Vse iz osnovne, z rezervacijskim sistemom, povezanim z Airbnbjem.',
      includes: [
        'Rezervacijski sistem, povezan z Airbnbjem',
        'Dva kroga popravkov',
        'Brez plačilnega sistema, plačilo ostane po vašem dosedanjem dogovoru z gostom',
      ],
      footnote:
        'Ceno tega paketa še usklajujemo in je zato tu ne navajamo. Vprašajte in jo pošljemo skupaj s predlogom.',
    },
    {
      id: 'profi',
      name: 'Profi',
      price: 'Cena po meri',
      summary: 'Vse iz paketa Advanced, s plačilnim sistemom in več apartmaji.',
      includes: [
        'Plačilni sistem, gost plača na vaši strani',
        'Več apartmajev na isti strani',
      ],
      footnote:
        'Ceno postavimo po obsegu, ker se število apartmajev in način plačevanja med primeri precej razlikujeta.',
    },
  ] satisfies AptPackage[],
}

export const examples = {
  kicker: 'Videz',
  title: 'Izberite izhodišče ali opišite svojega',
  body: 'Pripravili smo nekaj predlogov oblike in postavitve, med katerimi lahko izberete. Če med njimi ni pravega, opišite, kako si stran predstavljate: razporeditev, barve in funkcije so vaša izbira, mi pa povemo, kaj je od tega smiselno in kaj bo delalo.',
  /**
   * Honest empty state. The three generated example sites named in the source
   * document do not exist as assets yet, and fabricated preview cards are not
   * an option on this project. The section ships with its copy and this line;
   * when the screenshots arrive they drop into ApartmajiExamples.vue's grid
   * (build them through scripts/build-reference-images.mjs so they get the
   * same AVIF/WebP/JPEG variants and versioned filenames as the portfolio).
   */
  pending: 'Predlogi so v pripravi. Do takrat povejte, kaj vam je všeč, in pripravimo osnutek.',
}
