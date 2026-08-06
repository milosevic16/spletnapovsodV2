/**
 * All visible copy for the one-pager. Components render; this module owns
 * every string. Machine identifiers (ids, form values, data hooks) stay
 * English in every locale — only labels localize.
 *
 * DRAFT status: copy is written from the owner's structure document
 * ("spletna struktura", avgust 2026) and needs owner sign-off before launch.
 */

export interface NavItem {
  /** DOM anchor id — machine identifier, stays English. */
  target: string
  label: string
}

export interface Hero {
  kicker: string
  /** The h1 — single source; components render it, never restate it. */
  title: string
  /** Accented prefix of `title` (must match exactly — the component falls back to the plain title if not). */
  titleAccent: string
  lead: string
  /** Gloss for the hero fold Prerez (its annotation is the real <title>, derived). */
  foldGloss: string
  ctaPrimary: { label: string; target: string }
  ctaSecondary: { label: string; target: string }
}

export interface InvisibleItem {
  id: string
  label: string
  detail: string
}

export interface Reference {
  id: string
  name: string
  sector: string
  url: string
  /** Display form of the URL, without scheme. */
  urlLabel: string
  description: string
  /** What this build proves about us — one line. */
  proof: string
  /**
   * "The inks the job ran in" — the site's REAL palette, sampled from its live
   * CSS custom properties (lemur, mercpeter) or rendered pixels (bloctopus,
   * Webflow — no custom props). Re-sample when a reference redesigns.
   */
  inks: string[]
  /** Intrinsic size + generated variant widths of the card screenshot (public/img/refs). */
  image: { width: number; height: number; widths: number[] }
  /** Alt text for the screenshot. */
  alt: string
}

export interface Pillar {
  id: string
  kicker: string
  title: string
  summary: string
  /** Mono artifact label in the ledger row — what the pillar produces (evidence, not jargon). */
  artifact: string
  points: { label: string; detail: string }[]
  /** Optional Prerez under the open pillar — annotation must stay a verifiable fact. */
  prerez?: { annotation: string; gloss: string }
}

export interface Differentiator {
  id: string
  title: string
  body: string
  footnote?: string
  /** The Prerez instrument for this claim: measured value + plain-Slovenian gloss. */
  measure: { annotation: string; gloss: string; ticks?: string[] }
}

export interface ContactTopic {
  /** Machine value — reaches the owner's inbox as-is, stays English-sortable. */
  value: string
  label: string
}

export const nav: NavItem[] = [
  { target: 'reference', label: 'Reference' },
  { target: 'paketi', label: 'Kaj je vključeno' },
  { target: 'razlike', label: 'Zakaj mi' },
  { target: 'kontakt', label: 'Kontakt' },
]

export const hero: Hero = {
  kicker: 'Izdelava spletnih strani · Slovenija',
  title: 'Hitre, dostopne in profesionalne spletne strani.',
  titleAccent: 'Hitre',
  lead: 'Izdelujemo vse od osnovnih predstavitvenih strani do naprednih spletnih sistemov z rezervacijami in Stripe plačili. Poskrbimo za oblikovanje, razvoj, tehnično osnovo in objavo na vaši domeni.',
  foldGloss: 'Isti naslov vidita obiskovalec in Google.',
  ctaPrimary: { label: 'Povprašajte po ponudbi', target: 'kontakt' },
  ctaSecondary: { label: 'Oglejte si reference', target: 'reference' },
}

export const invisible = {
  kicker: 'Kaj dobite',
  title: 'Tradicija in izkušnje se splačajo.',
  quote: 'Spletna stran ni zgolj tisto, kar vidite, temveč tudi tisto, česar ne.',
  intro:
    'V ozadju mora biti urejeno vse: tisto, kar vas naredi vidne na Googlu, tisto, kar varno sprejema oddane obrazce, ter piškotki in politika zasebnosti, da stran ustreza zakonodaji.',
  humanLabel: 'Kar vidite',
  machineLabel: 'Kar vidi Google',
  machineGloss: 'Te nevidne vrstice odločajo, ali vas Google in ChatGPT sploh najdeta.',
  outro:
    'Vse to je vključeno že v osnovnem paketu. S tem se vam ni treba ukvarjati — naj to za vas uredijo profesionalci z izkušnjami.',
  items: [
    {
      id: 'seo-foundation',
      label: 'Vidnost na Googlu',
      detail: 'Tehnična osnova, ki jo iskalniki zahtevajo, vgrajena od prvega dne.',
    },
    {
      id: 'forms',
      label: 'Delujoči obrazci',
      detail: 'Povpraševanja varno prispejo v vaš nabiralnik, neželena pošta pa ne.',
    },
    {
      id: 'compliance',
      label: 'Piškotki in zasebnost',
      detail: 'Stran usklajena z evropsko zakonodajo — brez pravnih presenečenj.',
    },
    {
      id: 'hosting',
      label: 'Objava na vaši domeni',
      detail: 'Postavitev, gostovanje in certifikat HTTPS — ključe dobite vi.',
    },
  ] satisfies InvisibleItem[],
}

export const references = {
  kicker: 'Prejšnja dela',
  title: 'Reference, ki delujejo.',
  intro:
    'Od osebnih predstavitev do pravnih pisarn in forenzičnih podjetij — pokrivamo vse sektorje in se prilagodimo vsebini. Vsaka stran je oblikovana zanjo, nobena ni predloga.',
  items: [
    {
      id: 'lemur',
      name: 'Lemur Legal',
      sector: 'Pravna pisarna za tehnološko pravo',
      url: 'https://lemur.legal',
      urlLabel: 'lemur.legal',
      description:
        'Dvojezična stran specializirane pravne pisarne za kripto, deep tech in obrambno industrijo.',
      proof: 'Uredniška tipografija in stroga struktura za zahtevno pravno občinstvo.',
      inks: ['#D2DDD7', '#131220', '#7F59F5', '#1FC49A', '#C4823A'],
      alt: 'Posnetek naslovnice spletne strani Lemur Legal',
      image: { width: 776, height: 388, widths: [560, 776] },
    },
    {
      id: 'mercpeter',
      name: 'Peter Merc',
      sector: 'Osebna predstavitev — pravnik in investitor',
      url: 'https://mercpeter.netlify.app',
      urlLabel: 'mercpeter.netlify.app',
      description:
        'Osebna stran z interaktivnim zemljevidom delovanja, časovnico kariere in medijskim arhivom.',
      proof: 'Interaktivno središče, ki deluje brezhibno tudi na telefonu.',
      inks: ['#ECE9E2', '#26282C', '#D2453E', '#B4AEA1'],
      alt: 'Posnetek naslovnice spletne strani Petra Merca',
      image: { width: 1184, height: 592, widths: [560, 840, 1184] },
    },
    {
      id: 'bloctopus',
      name: 'Bloctopus Intelligence',
      sector: 'Forenzika kriptovalut',
      url: 'https://bloctopus.net',
      urlLabel: 'bloctopus.net',
      description:
        'Predstavitev forenzičnega podjetja z rešenimi primeri in ločenimi potmi za posameznike in podjetja.',
      proof: 'Zaupanja vredna predstavitev za občutljivo panogo.',
      inks: ['#1A2B38', '#1FC496', '#F2F6F4'],
      alt: 'Posnetek naslovnice spletne strani Bloctopus Intelligence',
      image: { width: 1184, height: 592, widths: [560, 840, 1184] },
    },
  ] satisfies Reference[],
}

export const pillars = {
  kicker: 'Vsi paketi',
  title: 'Kaj vsebujejo vsi paketi?',
  intro:
    'Trije stebri, na katerih stoji vsaka stran, ki jo izdelamo — od najmanjše do največje.',
  items: [
    {
      id: 'design',
      kicker: 'Steber 1',
      title: 'Unikaten dizajn',
      artifact: '100 % po meri',
      summary:
        'Večina ponudnikov, slovenskih in tujih, za hitrejši postopek uporablja vnaprej pripravljene predloge. Te so videti vse enake in stran hitro izpade poceni. Naše grafične podobe so unikatne in oblikovane posebej za vas — dajejo videz kakovosti in profesionalnosti.',
      points: [
        {
          label: 'Brez predlog',
          detail: 'Vsaka stran je oblikovana iz vaše vsebine, ne obratno.',
        },
        {
          label: 'Prepoznavnost',
          detail: 'Barve, tipografija in podoba, ki so samo vaši.',
        },
        {
          label: 'Do zadnjega odtenka',
          detail: 'Premišljena tipografija, mreža in gibanje — nič ni naključno.',
        },
      ],
    },
    {
      id: 'security',
      kicker: 'Steber 2',
      title: 'Varnost, hitrost, skladnost',
      artifact: 'HTTPS · GDPR · piškotki',
      summary:
        'Strokovnjaki za spletni razvoj poskrbijo, da so vaši obrazci in vneseni podatki varni, da se stran naloži hitro in da je skladna z zahtevami evropske zakonodaje — od piškotkov do politike zasebnosti. Amaterske napake tu pomenijo slabšo uvrstitev na Googlu, lahko pa tudi globe.',
      points: [
        {
          label: 'Varni obrazci',
          detail: 'Zaščita pred neželeno pošto in varna obdelava podatkov.',
        },
        {
          label: 'Hitrost nalaganja',
          detail: 'Merjena s Core Web Vitals — merili, ki jih upošteva tudi Google.',
        },
        {
          label: 'Evropska skladnost',
          detail: 'Piškotki, politika zasebnosti in varnostne glave, urejeni vnaprej.',
        },
      ],
    },
    {
      id: 'seo',
      kicker: 'Steber 3',
      title: 'Google in AI vidnost',
      artifact: 'sitemap.xml · JSON-LD',
      summary:
        'Stran zgradimo tako, da jo iskalniki in AI pomočniki v celoti preberejo. Vsa vsebina je v pravem HTML-ju, ne skrita za skriptami — to danes loči strani, ki jih Google in ChatGPT priporočata, od tistih, ki jih ne najde nihče.',
      points: [
        {
          label: 'Vsebina, ki jo roboti vidijo',
          detail:
            'Stran je vnaprej izrisana v čisti HTML. AI iskalniki (ChatGPT, Perplexity, Claude) ne poganjajo skript — vidijo samo to, kar je zapisano na strani.',
        },
        {
          label: 'Strukturirani podatki',
          detail:
            'Podatki o podjetju, storitvah in cenah v obliki, ki jo Google razume (JSON-LD) — osnova za bogate zadetke in AI odgovore.',
        },
        {
          label: 'Tehnični SEO',
          detail:
            'Naslovi, opisi, kanonične povezave, zemljevid strani in robots.txt — vse ustvarjeno samodejno ob vsaki objavi, zato nikoli ne zastara.',
        },
        {
          label: 'Prijava v iskalnike',
          detail:
            'Google Search Console in Bing Webmaster Tools — tudi Copilot in ChatGPT črpata iz Bingovega indeksa.',
        },
      ],
      prerez: {
        annotation: 'Core Web Vitals · berljivo brez JavaScripta',
        gloss: 'Merila, po katerih Google razvršča strani — vgrajena v zasnovo, ne dodana naknadno.',
      },
    },
  ] satisfies Pillar[],
}

export const differentiators = {
  kicker: 'Primerjava',
  title: 'Kje se ločimo od drugih ponudnikov?',
  items: [
    {
      id: 'personalized',
      title: 'Popolnoma personalizirane strani',
      body: 'Nobena naša stran ni predloga. Oblikovanje izhaja iz vaše vsebine, panoge in publike — zato je vsaka stran prepoznavno vaša.',
      measure: {
        annotation: '100 % po meri',
        gloss: 'Nič ne izhaja iz predloge — vse iz vaše vsebine.',
      },
    },
    {
      id: 'seo-included',
      title: 'SEO vključen v ceno',
      body: 'Želite biti vidni na Googlu in v ChatGPT-ju? Naši tehnični strokovnjaki poskrbijo za to. Vaša edina skrb ostane, kako je stran videti.',
      measure: {
        annotation: 'Google + ChatGPT',
        gloss: 'Vidnost v iskalnikih in AI odgovorih je del cene.',
      },
    },
    {
      id: 'speed',
      title: 'Objava v 3 delovnih dneh',
      body: 'Spletno stran zgradimo in objavimo na vaši domeni v treh delovnih dneh.',
      footnote:
        'Velja za manjše in srednje projekte brez velikih podatkovnih baz — odvisno od obsega.',
      measure: {
        annotation: '3 delovni dnevi',
        gloss: 'Od potrjene vsebine do objave na vaši domeni.',
        ticks: ['PON', 'TOR', 'SRE'],
      },
    },
    {
      id: 'support',
      title: 'Popravki v 24 urah',
      body: 'Želite popravek ali novo funkcijo? Na voljo smo kadarkoli v delovnem času, manjše popravke uredimo v 24 urah.',
      measure: {
        annotation: '24 h',
        gloss: 'Toliko časa ima manjši popravek, ne teden dni.',
      },
    },
  ] satisfies Differentiator[],
}

export const contact = {
  kicker: 'Kontakt',
  title: 'Povejte, kaj potrebujete.',
  intro:
    'Opišite svoj projekt v nekaj stavkih — odgovorimo v enem delovnem dnevu, s konkretnim predlogom in oceno.',
  topics: [
    { value: 'new-site', label: 'Nova spletna stran' },
    { value: 'redesign', label: 'Prenova obstoječe strani' },
    { value: 'ecommerce-booking', label: 'Trgovina ali rezervacije' },
    { value: 'other', label: 'Drugo' },
  ] satisfies ContactTopic[],
  /** Expectation-setting next to the form. */
  stepsTitle: 'Kaj sledi?',
  steps: [
    {
      label: 'Odgovor',
      detail: 'V enem delovnem dnevu se oglasimo s konkretnimi vprašanji.',
    },
    {
      label: 'Predlog in ocena',
      detail: 'Prejmete predlog strukture strani, oceno obsega in ceno.',
    },
    {
      label: 'Izdelava in objava',
      detail: 'Stran zgradimo, uskladimo z vami in objavimo na vaši domeni.',
    },
  ],
  form: {
    topicLabel: 'Kaj potrebujete?',
    topicPlaceholder: 'Izberite …',
    nameLabel: 'Ime',
    emailLabel: 'E-naslov',
    messageLabel: 'Sporočilo',
    submitLabel: 'Pošljite povpraševanje',
    privacyNote: 'Podatke uporabimo izključno za odgovor na vaše povpraševanje.',
    /**
     * Interaction-only strings — rendered after user actions, so the build's
     * content guard (which asserts copy exists in the STATIC HTML) skips any
     * object keyed `feedback` by contract.
     */
    feedback: {
      submitting: 'Pošiljanje …',
      success: 'Hvala! Sporočilo je poslano — odgovorimo v enem delovnem dnevu.',
      error: 'Pošiljanje ni uspelo. Poskusite znova ali nam pišite neposredno po e-pošti.',
      invalidEmail: 'Vnesite veljaven e-naslov.',
      /** Stem — the component appends the names of the missing fields. */
      required: 'Izpolnite še:',
      /** Noun form of the topic field for the enumeration above. */
      topicShort: 'vrsta projekta',
    },
  },
}

export const footer = {
  tagline: 'Hitre, dostopne in profesionalne spletne strani.',
  emailLabel: 'Pišite nam',
  /** Colophon contract: only mechanically verifiable claims (SSG, no analytics). */
  colophon: {
    annotation: 'statična stran · brez sledilnih piškotkov',
    gloss: 'Tudi ta stran je zgrajena tako, kot gradimo vašo.',
  },
}

export const ui = {
  skipToContent: 'Preskoči na vsebino',
}

/** 404 copy — asserted against dist/404.html by the content guard. */
export const notFound = {
  metaTitle: 'Stran ne obstaja',
  metaDescription: 'Iskana stran ne obstaja.',
  heading: '404 — ta stran ne obstaja',
  body: 'Naslov je napačen ali pa je bila stran odstranjena.',
  homeLabel: 'Na domačo stran',
}

export const meta = {
  title: 'SpletnaPovsod — Izdelava spletnih strani',
  description:
    'Hitre, dostopne in profesionalne spletne strani — unikaten dizajn brez predlog, SEO in pravna skladnost v ceni, objava v 3 delovnih dneh.',
}
