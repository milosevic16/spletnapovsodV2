/**
 * All visible copy for the /zasebnost subpage (privacy policy + provider
 * identity). Components render; this module owns every string. Machine
 * identifiers (anchor ids) stay ASCII, like the apartmaji subpage.
 *
 * SOURCE OF THE FACTS, and their status:
 *   - Provider identity (POVSOD, Gregor Anželj, s.p.; MŠ 6774644000;
 *     DŠ 31147011) is owner-supplied and used verbatim. DŠ is the tax number;
 *     it is NOT presented as a VAT id (no "SI" prefix) because the owner did
 *     not state VAT registration. If the s.p. is VAT-registered this becomes
 *     "ID za DDV: SI31147011".
 *   - The registered ADDRESS and a PHONE are not yet supplied, so they are
 *     omitted rather than invented (the no-fabricated-org-facts rule). ZEPT
 *     wants a postal address on an imprint; add it before production.
 *   - CONTACT_EMAIL is the existing project constant, still owner-unconfirmed.
 *   - Every processor / sub-processor and the SCC transfer mechanism are taken
 *     verbatim from the Web3Forms DPA (v1.0, 13 Jul 2026), read directly.
 *   - The supervisory-authority block is the verified public contact of the
 *     Informacijski pooblaščenec.
 *
 * House copy rules hold: no em dashes in visible copy, no rhetorical-question
 * hook, no exclamation marks. DRAFT: needs owner + legal sign-off before launch.
 */
import type { NavItem } from './home'

export interface Clause {
  /** ASCII anchor id — the masthead/footer stops point here. */
  id: string
  /** The statute the clause answers, in the small-caps label register (never
   *  mono: mono is reserved for genuine machine emissions). */
  cite: string
  title: string
  body: string[]
}

export interface Processor {
  name: string
  purpose: string
  where: string
  /** true = the row carries a cross-border flag worth the reader's eye. */
  flag?: boolean
}

export const meta = {
  title: 'Politika zasebnosti in podatki o ponudniku',
  description:
    'Kako spletno mesto spletnapovsod.si ravna z osebnimi podatki iz kontaktnega obrazca: nameni, pravna podlaga, obdelovalci, hramba in vaše pravice.',
}

export const hero = {
  kicker: 'Varstvo podatkov',
  title: 'Politika zasebnosti',
  lead: 'To spletno mesto zbira osebne podatke le prek kontaktnega obrazca. Spodaj je opisano, katere podatke obdelamo, s kakšnim namenom, kako dolgo jih hranimo in katere pravice imate.',
}

/** The provider / controller identity, rendered as a small register block in
 *  the first clause. Numbers are pure digits, so the content guard skips them;
 *  the labels and the name are checked and must render. */
export const provider = {
  name: 'POVSOD, Gregor Anželj, s.p.',
  rows: [
    { label: 'Matična številka', value: '6774644000' },
    { label: 'Davčna številka', value: '31147011' },
  ],
  emailLabel: 'E-pošta',
}

export const clauses: Clause[] = [
  {
    id: 'podatki',
    cite: 'ZEPT, 7. člen · Splošna uredba, člen 13',
    title: 'Upravljavec in podatki o ponudniku',
    body: [
      'Spletno mesto spletnapovsod.si upravlja spodaj navedeni nosilec dejavnosti, ki je hkrati upravljavec osebnih podatkov, obdelanih prek tega spletnega mesta.',
      'Za vsa vprašanja glede varstva podatkov nam pišite na navedeni e-naslov.',
    ],
  },
  {
    id: 'obdelava',
    cite: 'Splošna uredba, člena 6 in 13',
    title: 'Kateri podatki in s kakšnim namenom',
    body: [
      'Ob oddaji kontaktnega obrazca obdelamo vaše ime, e-naslov, izbrano temo povpraševanja in vsebino sporočila. Te podatke uporabimo izključno za odgovor na povpraševanje in za morebitno pripravo ponudbe.',
      'Pravna podlaga za obdelavo je izvajanje ukrepov na vašo zahtevo pred sklenitvijo pogodbe, skladno s točko (b) prvega odstavka 6. člena Splošne uredbe.',
      'Ob obisku spletnega mesta ponudnik gostovanja v strežniških dnevnikih samodejno zabeleži naslov IP, čas zahtevka in podatke o brskalniku. Teh podatkov ne povezujemo z vami in jih ne uporabljamo za profiliranje.',
      'Oddaja obrazca je prostovoljna. Brez imena, e-naslova in vsebine sporočila na povpraševanje ne moremo odgovoriti. Posebnih vrst osebnih podatkov ne zbiramo.',
    ],
  },
  {
    id: 'deljenje',
    cite: 'Splošna uredba, členi 13, 28 in 46',
    title: 'Komu podatke posredujemo',
    body: [
      'Podatkov ne prodajamo in jih ne posredujemo tretjim osebam za njihove lastne namene. Obdelujejo jih le naši pogodbeni obdelovalci, vsak po naših navodilih in na podlagi pogodbe o obdelavi podatkov.',
      'Nekateri obdelovalci podatke obdelujejo tudi zunaj Evropskega gospodarskega prostora, med drugim v Združenih državah Amerike. Za te prenose veljajo standardna pogodbena določila, ki jih je z Izvedbenim sklepom (EU) 2021/914 sprejela Evropska komisija.',
    ],
  },
  {
    id: 'hramba',
    cite: 'Splošna uredba, člen 13(2)(a)',
    title: 'Kako dolgo podatke hranimo',
    body: [
      'Vaše povpraševanje hranimo v svojem e-poštnem predalu dvanajst mesecev od zadnjega stika, nato ga izbrišemo. Če iz povpraševanja nastane pogodbeno razmerje, podatke hranimo v okviru te pogodbe in zakonskih rokov, ki iz nje izhajajo.',
      'Pri obdelovalcu Web3Forms se oddani podatki samodejno izbrišejo najpozneje tri leta po oddaji.',
    ],
  },
  {
    id: 'piskotki',
    cite: 'ZEKom-2 · Direktiva 2002/58, člen 5(3)',
    title: 'Piškotki in sledenje',
    body: [
      'To spletno mesto ne uporablja piškotkov. Ne nameščamo analitike, sledilnih skript, oglasnih pikslov ali vtičnikov družbenih omrežij in ne uporabljamo lokalne shrambe brskalnika.',
      'Ker na vaši napravi ne shranjujemo ničesar, tudi ne prikazujemo pasice za privolitev, saj privoliti ni v kaj. To lahko preverite sami v razvijalskih orodjih brskalnika, kjer za to domeno ni nobenega vnosa v shrambi.',
    ],
  },
  {
    id: 'pravice',
    cite: 'Splošna uredba, členi 15 do 20',
    title: 'Vaše pravice',
    body: [
      'V zvezi s svojimi osebnimi podatki imate pravico do dostopa, popravka, izbrisa, omejitve obdelave in prenosljivosti podatkov. Zahtevo pošljite na navedeni e-naslov, odgovorimo pa najpozneje v enem mesecu od prejema.',
      'Če menite, da z obdelavo kršimo predpise, se lahko pritožite pri nadzornem organu za varstvo osebnih podatkov.',
    ],
  },
  {
    id: 'spremembe',
    cite: 'Vzdrževanje',
    title: 'Spremembe politike',
    body: [
      'Politiko posodobimo, kadar se spremenijo storitve, ki jih uporabljamo, ali predpisi, ki nas zavezujejo. Veljavna je vedno različica, objavljena na tej strani.',
    ],
  },
]

/** Rendered under the »Komu podatke posredujemo« clause. Two groups: our own
 *  processors, then Web3Forms' sub-processors. Every name, purpose and location
 *  is taken from the Web3Forms DPA and our own stack; the flagged rows send the
 *  visitor's IP and e-mail to the United States. */
export const processorGroups: { label: string; items: Processor[] }[] = [
  {
    label: 'Naši obdelovalci',
    items: [
      {
        name: 'Netlify',
        purpose: 'Gostovanje spletnega mesta in strežniški dnevniki',
        where: 'ZDA in globalno',
      },
      {
        name: 'Web3Forms (Web3Creative)',
        purpose: 'Sprejem in dostava oddanih obrazcev',
        where: 'EU in ZDA',
      },
    ],
  },
  {
    label: 'Podobdelovalci storitve Web3Forms',
    items: [
      {
        name: 'Amazon Web Services',
        purpose: 'Gostovanje, baza in dostava e-pošte',
        where: 'po konfiguraciji',
      },
      {
        name: 'Hetzner Online',
        purpose: 'Aplikacijska infrastruktura',
        where: 'EU, Nemčija in Finska',
      },
      {
        name: 'Cloudflare',
        purpose: 'Omrežje CDN, DNS in požarni zid',
        where: 'globalno',
      },
      {
        name: 'CleanTalk',
        purpose: 'Preprečevanje neželene pošte, prejme naslov IP in e-naslov pošiljatelja',
        where: 'ZDA in globalno',
        flag: true,
      },
      {
        name: 'Automattic (Akismet)',
        purpose: 'Filtriranje neželene pošte, prejme naslov IP in e-naslov pošiljatelja',
        where: 'ZDA in globalno',
        flag: true,
      },
      {
        name: 'Microsoft (Clarity)',
        purpose: 'Analitika uporabe storitve',
        where: 'ZDA in globalno',
      },
    ],
  },
]

/** The supervisory authority, rendered under »Vaše pravice«. Verified public
 *  contact of the Informacijski pooblaščenec. */
export const authority = {
  name: 'Informacijski pooblaščenec Republike Slovenije',
  address: 'Dunajska cesta 22, 1000 Ljubljana',
  email: 'gp.ip@ip-rs.si',
  phone: '01 230 97 30',
}

/** Foot of the page. A real date, drafted now; update on every material change. */
export const updated = {
  label: 'Zadnja posodobitev',
  value: 'avgust 2026',
}

/**
 * The subpage's own nav stops (in-page anchors on this document). The home
 * page's anchors would scroll nowhere here. The masthead CTA is the fourth,
 * distinct, action-shaped stop: it jumps to the section where a visitor acts
 * on their own data.
 */
export const nav: NavItem[] = [
  { target: 'podatki', label: 'Podatki' },
  { target: 'obdelava', label: 'Obdelava' },
  { target: 'piskotki', label: 'Piškotki' },
]

export const ctaPrimary = { label: 'Vaše pravice', target: 'pravice' }
