/**
 * All visible copy for the one-pager. Components render; this module owns
 * every string. Machine identifiers (ids, form values, data hooks) stay
 * English in every locale — only labels localize.
 *
 * DRAFT status: copy is written from the owner's structure document
 * ("spletna struktura", avgust 2026) and needs owner sign-off before launch.
 */

export interface NavItem {
  /** DOM anchor id — machine identifier, stays English. Also the render key. */
  target: string
  label: string
  /**
   * Full path, for a stop that leaves the page. Omitted = an in-page `#target`
   * anchor, which is what every section stop is. The masthead reads this, so a
   * nav can mix in-page sections and other pages without a second component.
   */
  href?: string
}

export interface Hero {
  /** The h1 — single source; components render it, never restate it. */
  title: string
  /** Accented prefix of `title` (must match exactly — the component falls back to the plain title if not). */
  titleAccent: string
  /** Rendered in the masthead strip — the page's single call to action. */
  ctaPrimary: { label: string; target: string }
}

export interface InvisibleItem {
  id: string
  label: string
  detail: string
}

export interface Reference {
  id: string
  name: string
  /** The one-line description in the stage's bottom-left corner. */
  sector: string
  url: string
  /** Display form of the URL, without scheme. */
  urlLabel: string
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
  /**
   * The Prerez instrument for this claim: the measured value, and a
   * plain-Slovenian gloss WHERE THE NUMBER NEEDS ONE. The gloss is optional
   * because a claim whose body already states the consequence would only
   * repeat itself (the 24h support claim does exactly that) — and a restated
   * line is noise, not instrumentation.
   */
  measure: { annotation: string; gloss?: string; ticks?: string[] }
}

export interface ContactTopic {
  /** Machine value — reaches the owner's inbox as-is, stays English-sortable. */
  value: string
  label: string
}

export const nav: NavItem[] = [
  { target: 'reference', label: 'Reference' },
  // »Paketi« for the narrow four-button strip — matches the section's own
  // »Kaj vsebujejo vsi paketi?« and the anchor id. (Was »Kaj vključuje
  // storitev«, which cannot fit a one-row strip on a 320px phone.)
  { target: 'paketi', label: 'Paketi' },
  { target: 'razlike', label: 'Zakaj mi' },
  { target: 'kontakt', label: 'Kontakt' },
]

/**
 * THE HOME PAGE'S HEADER STOPS — three buttons, by the owner's call (avgust
 * 2026): home, the accommodation offer, and the page's single CTA. Deliberately
 * separate from `nav` below, which still carries the four section anchors and
 * still feeds the FOOTER: on a phone the footer nav is the complete in-flow
 * navigation, so emptying it of section links would strand a phone visitor.
 * Both of these leave the page, hence `href` rather than an anchor.
 */
export const headerNav: NavItem[] = [
  { target: 'domov', href: '/', label: 'Domov' },
  { target: 'nastanitve', href: '/nastanitve', label: 'Ponudba za nastanitve' },
]

export const hero: Hero = {
  title: 'Profesionalne, hitre in dostopne spletne rešitve.',
  titleAccent: 'Profesionalne',
  ctaPrimary: { label: 'Naročite izdelek', target: 'kontakt' },
}

export const invisible = {
  kicker: 'Kaj dobite',
  title: 'Spletna pod površino.',
  quote: 'Spletna stran ni zgolj tisto, kar vidite.',
  /** The rest of the owner's sentence, split off on their call: the statement
   *  keeps one line and everything that ENUMERATES the background work reads
   *  as body copy, in the lead's own size and voice. */
  quoteRest:
    'Redno posodabljanje, Robots.txt, https povezave, gostovanje, vezanje domene in vzdrževanje so le nekatere izmed stvari, ki so vidne le v ozadju.',
  /** Owner-supplied, VERBATIM — including »npr. Niste« and the missing final
   *  stop. Flagged for sign-off rather than corrected. */
  lead:
    'S pomočjo sliderja si oglejte, kako brskalniki vidijo vašo stran. Brez te kode, skrite v ozadju, npr. Niste vidni brskalnikom in umetni inteligenci. Je le ena od plasti, ki omogoča učinkovito in pravilno vedenje vaše spletne strani',
  humanLabel: 'Kar vidite',
  machineLabel: 'Kar vidi Google',
  /**
   * Interaction-only: names a control that exists ONLY once the section
   * hydrates. Skipped by the content guard, like the form's strings.
   */
  feedback: {
    scanLabel: 'Povlecite za primerjavo kode in izrisane strani',
    /** Names the layer selector, which exists only once the section hydrates. */
    layersLabel: 'Sloji pod površino',
  },
  outro:
    'Vsi našteti elementi so vključeni že v osnovnem paketu. Lahko ste brez skrbi tudi glede stvari, na katere sami ne bi pomislili.',
  items: [
    {
      id: 'seo-foundation',
      label: 'Primerna oblika za iskalnike',
      detail:
        'Stran se ob objavi izriše v končni HTML, tako da iskalnik ali jezikovni model ob prvem obisku prebere celotno vsebino brez poganjanja skript, skupaj z naslovi, opisi in kanoničnimi povezavami, ki jih zapiše isti postopek objave.',
    },
    {
      id: 'forms',
      label: 'Zaščita pred spamom in delujoči obrazci',
      detail:
        'Na vsaki kvalitetno narejeni spletni strani obrazci ne le delujejo in ščitijo oddano vsebino pred zunanjimi zahtevki, temveč tudi avtomatično zaščitijo pred spamom s pomočjo ReCaptcha sistema, ki preverja, da je obrazec res izpolnil človek.',
    },
    {
      id: 'compliance',
      label: 'Piškotki in zasebnost',
      detail:
        'Nenujni piškotki se pred privolitvijo ne naložijo, posamezne kategorije lahko obiskovalec sprejme ali zavrne, privolitev pa kadarkoli prekliče. Za tehnično plat poskrbimo mi, pripravimo pa vam tudi predlogo politike zasebnosti.',
    },
    {
      id: 'hosting',
      label: 'Domene, protokoli',
      detail:
        'Domeno registriramo ali prevzamemo obstoječo, jo usmerimo na gostovanje, uredimo zapise DNS in pridobimo certifikat, tako da vsa komunikacija poteka po protokolu HTTPS, obiskovalci pa na vaši strani nikoli ne naletijo na opozorilo o nezaupljivi povezavi.',
    },
  ] satisfies InvisibleItem[],
}

export const references = {
  /**
   * The band's own heading. RESTORED verbatim from the owner-approved copy
   * (commit c3533de, "Owner corrections from Popravk SpletnaPovsod.docx") —
   * it was dropped when the band went heading-less, and is back at the
   * owner's request. Nothing here is newly written.
   */
  kicker: 'Reference',
  title: 'Nekaj uspešnih prejšnjih projektov',
  intro:
    'Sodelujemo s strankami iz vseh sfer. Od pravno-tehnoloških pisarn, organizatorjev strateških dogodkov, študentskih društev in forenzičnih podjetij, se vsaki stranki prilagodimo in skupaj z njo začrtamo optimalen potek projekta ter upoštevamo njihove oblikovne, kot tudi funkcionalne želje.',
  /** Screen-reader suffix on each reference link (target="_blank" warning). */
  newWindowNote: 'odpre se v novem zavihku',
  /**
   * Interaction-and-attribute strings — never rendered as visible copy, which
   * is why they live under the `feedback` key the content guard skips by
   * contract, exactly like the form's interaction strings.
   *
   * The step-control labels (prev/next/pick) left with the carousel: the pile
   * has no controls, because the browser's own focus order and a tap on a
   * sheet are the whole navigation.
   */
  feedback: {
    regionLabel: 'Reference',
    /**
     * The two faces of the control that opens and closes the projects past the
     * third. It exists ONLY once the section hydrates — with JS off every
     * project is in flow and there is nothing to open — which is why both live
     * here with the other interaction strings the content guard skips by
     * contract. Still DRAFT copy.
     */
    moreLabel: 'Prikaži več',
    lessLabel: 'Skrij',
  },
  items: [
    {
      id: 'mercpeter',
      name: 'Peter Merc',
      sector: 'Osebna predstavitev: pravnik in investitor',
      url: 'https://mercpeter.netlify.app',
      urlLabel: 'mercpeter.netlify.app',
      inks: ['#ECE9E2', '#26282C', '#D2453E', '#B4AEA1'],
      alt: 'Posnetek naslovnice spletne strani Petra Merca',
      image: { width: 1792, height: 896, widths: [560, 840, 1184, 1792] },
    },
    {
      id: 'lemur',
      name: 'Lemur Legal',
      sector: 'Pravna pisarna za tehnološko pravo',
      url: 'https://lemur.legal',
      urlLabel: 'lemur.legal',
      inks: ['#D2DDD7', '#131220', '#7F59F5', '#1FC49A', '#C4823A'],
      alt: 'Posnetek naslovnice spletne strani Lemur Legal',
      image: { width: 1552, height: 776, widths: [560, 776, 1104, 1552] },
    },
    /**
     * An EVENT rather than an organisation, and the only one in the set: the
     * name is the site's own h1 and the sector its own words for what the
     * evening was (»okrogle mize«, »razpravo o jedrski energiji«) — the same
     * rule the two below follow. Third in the list, so it stands in the resting
     * row; Bloctopus moved down to make room (owner's call).
     */
    {
      id: 'razprava',
      name: 'Razprava mladih o JEK2',
      sector: 'Okrogla miza o jedrski energiji',
      url: 'https://delicate-pika-fa7401.netlify.app',
      urlLabel: 'delicate-pika-fa7401.netlify.app',
      inks: ['#184890', '#181830', '#F09018', '#606060'],
      alt: 'Posnetek naslovnice spletne strani Razprave mladih o JEK2',
      image: { width: 1792, height: 896, widths: [560, 840, 1184, 1792] },
    },
    /**
     * The two projects built with Gašper Azinovič. Both sectors are the sites'
     * OWN words rather than descriptions written here: Pravna Panda states
     * »Društvo študentov prava Ljubljana« under its wordmark, and SILE's own
     * page, contact address (Jamova cesta 2) and mail account place it at the
     * Faculty of Civil Engineering and Geodesy. Inks are the dominant colours
     * of each plate crop, extracted by scripts/build-reference-images.mjs —
     * measured, not chosen. DRAFT like the rest of the copy: needs sign-off.
     */
    {
      id: 'sile',
      name: 'SILE',
      sector: 'Študentska skupina Fakultete za gradbeništvo in geodezijo',
      url: 'https://sile.si',
      urlLabel: 'sile.si',
      inks: ['#3078FF', '#48C0FF', '#78F0FF', '#D8F0F0'],
      alt: 'Posnetek naslovnice spletne strani študentske skupine SILE',
      image: { width: 1700, height: 850, widths: [560, 840, 1184, 1700] },
    },
    {
      id: 'bloctopus',
      name: 'Bloctopus Intelligence',
      sector: 'Forenzika kriptovalut',
      url: 'https://bloctopus.net',
      urlLabel: 'bloctopus.net',
      inks: ['#1A2B38', '#1FC49A', '#F2F6F4'],
      alt: 'Posnetek naslovnice spletne strani Bloctopus Intelligence',
      image: { width: 1792, height: 896, widths: [560, 840, 1184, 1792] },
    },
    {
      id: 'pravnapanda',
      name: 'Pravna Panda',
      sector: 'Društvo študentov prava Ljubljana',
      url: 'https://pravnapanda.si',
      urlLabel: 'pravnapanda.si',
      inks: ['#78C0F0', '#C0D8F0', '#90A8A8', '#FFFFFF'],
      alt: 'Posnetek naslovnice spletne strani Pravne Pande',
      image: { width: 1792, height: 896, widths: [560, 840, 1184, 1792] },
    },
  ] satisfies Reference[],
}

export const pillars = {
  kicker: 'Vsi paketi',
  title: 'Kaj vsebujejo vsi paketi?',
  intro:
    'Trije stebri, na katerih stoji vsaka stran, ki jo izdelamo, od najmanjše do največje.',
  /** Interaction-only (the expanded panel's close control) — guard-skipped. */
  feedback: {
    closeLabel: 'Zapri',
  },
  items: [
    {
      id: 'design',
      kicker: 'Steber 1',
      title: 'Unikaten dizajn',
      artifact: '100 % po meri',
      summary:
        'Večina ponudnikov, slovenskih in tujih, za hitrejši postopek uporablja vnaprej pripravljene predloge, pogosto narejene v WordPress-u. Te so si med seboj podobne, dizajn na njih pa je ponavadi preprost. Stran tako hitro izpade poceni. Grafične podobe naših strani so individualizirane in prilagojene željam vsake posamezne stranke.',
      points: [
        {
          label: 'Brez predlog',
          detail: 'Vsaka stran je oblikovana na podlagi vaše vsebine in želja.',
        },
        {
          label: 'Domača podoba, prilagodljivost',
          detail:
            'Upoštevamo dejstvo, da nekatere stranke hočejo predvsem domač občutek spletne strani, brez kompleksnih postavitev in animacij. Tudi v tem primeru imamo za vas pripravljene poenostavljene grafične predloge, ki dajejo občutek preprostosti, in dostavijo vsebino kar se da efektivno.',
        },
        {
          label: 'Zasnovano za telefon',
          detail:
            'Statistike kažejo, da kar 70 % obiskovalcev pride s telefona. Vsaki izmed spletnih strani posebno pozornost namenimo tudi mobilni verziji, ki je vključena v vseh paketih.',
        },
        {
          label: 'Dostopno vsem',
          detail:
            'Upoštevamo sodobne evropske standarde dostopnosti, ki zahtevajo berljive velikosti, dovolj kontrasta, in delovanje s tipkovnico. Gradimo po EN 301 549 / WCAG 2.1 AA. Tako vas lahko doseže vsaka stranka.',
        },
        {
          label: 'Prepoznavnost',
          detail:
            'Podrobne animacije, grafične teksture in detajli, ki dajo vaši strani videz kakovosti in profesionalnosti.',
        },
      ],
    },
    {
      id: 'security',
      kicker: 'Steber 2',
      title: 'Varnost, hitrost, skladnost',
      artifact: 'HTTPS · GDPR · piškotki',
      summary:
        'Strokovnjaki za spletni razvoj poskrbijo, da so vaši obrazci in vneseni podatki varni, da se stran naloži hitro in da so piškotki ter politika zasebnosti tehnično urejeni po veljavnih evropskih zahtevah. Amaterske napake tu pomenijo slabšo uvrstitev na Googlu, lahko pa tudi globe. Spletni razvijalci poskrbimo, da vaša stran ustreza standardom Core Web Vitals, ki jih upošteva tudi Google, ter mnogim drugim, pomembnim za delovanje spletne strani. V vsakem projektu se skrivajo izzivi, kot so hitrost nalaganja, varnost prenašanja podatkov iz obrazcev, zaščita pred spamom, varnost HTTPS povezave in mnoge druge, na prvi pogled neočitne stvari. Poskrbimo za vse našteto in več.',
      points: [
        {
          label: 'Varni obrazci',
          detail: 'Zaščita pred neželeno pošto in varna obdelava podatkov.',
        },
        {
          label: 'Hitrost nalaganja',
          detail: 'Merjena s Core Web Vitals, po merilih, ki jih upošteva tudi Google.',
        },
        {
          label: 'Tehnična skladnost',
          detail:
            'Piškotki, politika zasebnosti in varnostne glave, tehnično urejeni vnaprej.',
        },
        {
          label: 'HTTPS in varnostne glave',
          detail:
            'Certifikat in zaščitne glave, ki jih ob pregledu iščejo IT oddelki vaših strank.',
        },
        {
          label: 'Brez strežniške izvršilne plasti',
          detail:
            'Stran je vnaprej prevedena v statične datoteke in se streže brez podatkovne baze ter brez kode, ki bi se izvajala na strežniku ob vsakem obisku. Odpadejo tako napadi na strežniško izvajanje kode kot tveganja zastarelih vtičnikov, ki jih OWASP uvršča med najpogostejše vzroke vdorov.',
        },
        {
          label: 'Nič vzdrževanja',
          detail: 'Brez vtičnikov ni tedenskih posodobitev in ni računa zanje.',
        },
      ],
    },
    {
      id: 'seo',
      kicker: 'Steber 3',
      title: 'Google in AI vidnost',
      artifact: 'sitemap.xml · JSON-LD',
      summary:
        'Stran zgradimo tako, da jo iskalniki in AI pomočniki v celoti preberejo. Vsa vsebina je v pravem HTML-ju, ne skrita za skriptami. To danes loči strani, ki jih Google in ChatGPT priporočata, od tistih, ki jih ne najde nihče.',
      points: [
        {
          label: 'Iskalnikom vidna vsebina',
          detail:
            'Stran je vnaprej izrisana v čistem HTML. AI in web iskalniki (Google, ChatGPT, Perplexity, Claude) tako bolj efektivno najdejo in indeksirajo stran.',
        },
        {
          label: 'Tehnični SEO',
          detail:
            'Naslovi, meta opisi, kanonične povezave, zemljevid strani in robots.txt se ob vsaki objavi izpišejo iz same strani, ne iz ročno vzdrževanega seznama. Ker jih zapiše postopek objave, se ne morejo razhajati z vsebino, ki je na strani dejansko objavljena, in ne zastarijo, ko se ta spremeni.',
        },
        {
          label: 'Strukturirani podatki',
          detail:
            'Podatki o podjetju, storitvah in cenah v obliki, ki jo Google razume (JSON-LD). Še ena izmed osnov za bogate zadetke in AI odgovore.',
        },
        {
          label: 'Prijava v iskalnike',
          detail:
            'Google Search Console in Bing Webmaster Tools, iz katerih črpata tudi Copilot in ChatGPT.',
        },
        {
          label: 'Predogled ob deljenju',
          detail:
            'Ko nekdo deli vašo povezavo, se pokažeta slika in naslov, ne pa gola povezava, ki je nihče ne odpre. Pomemben detajl, ki je pogostokrat izpuščen.',
        },
      ],
      prerez: {
        annotation: 'Core Web Vitals · berljivo brez JavaScripta',
        gloss:
          'Merila, po katerih Google razvršča strani, vgrajena v zasnovo in ne dodana naknadno.',
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
      body: 'Nobena naša stran ni predloga. Oblikovanje izhaja iz vaše vsebine, panoge in publike, zato je vsaka stran prepoznavno vaša.',
      measure: {
        annotation: '100 % po meri',
        gloss: 'Nič ne izhaja iz predloge, vse iz vaše vsebine.',
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
        'Velja po dogovorjeni končni podobi, po zadnjem krogu naročenih popravkov. Velja za manjše in srednje projekte brez podatkovnih baz.',
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
      },
    },
  ] satisfies Differentiator[],
}

export const contact = {
  kicker: 'Kontakt',
  title: 'Povejte, kaj potrebujete.',
  intro:
    'Opišite svoj projekt v nekaj stavkih. Odgovorimo v enem delovnem dnevu, s konkretnim predlogom in oceno.',
  topics: [
    { value: 'new-site', label: 'Nova spletna stran' },
    { value: 'redesign', label: 'Prenova obstoječe strani' },
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
    {
      label: 'Plačilo',
      detail: 'Plačate šele, ko ste popolnoma zadovoljni s spletno stranjo.',
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
      success: 'Hvala! Sporočilo je poslano, odgovorimo v enem delovnem dnevu.',
      error: 'Pošiljanje ni uspelo. Poskusite znova ali nam pišite neposredno po e-pošti.',
      invalidEmail: 'Vnesite veljaven e-naslov.',
      /** Stem — the component appends the names of the missing fields. */
      required: 'Izpolnite še:',
      /** Accusative — appended after the »Izpolnite še:« stem in the enumeration. */
      topicShort: 'vrsto projekta',
    },
  },
}

export const footer = {
  tagline: 'Profesionalne, hitre in dostopne spletne rešitve.',
  emailLabel: 'Pišite nam',
  /**
   * Provider identity, shown in every footer (ZEPT provider-identification and
   * good GDPR practice). Owner-supplied and used verbatim; the registered
   * address and a phone are not yet provided, so they are omitted rather than
   * invented. DŠ is the tax number, NOT presented as a VAT id. Registration
   * numbers are pure digits, so the content guard skips them; the name renders
   * on every page including home, which is what the home guard checks.
   */
  business: {
    name: 'POVSOD, Gregor Anželj, s.p.',
    rows: [
      { label: 'Matična št.', value: '6774644000' },
      { label: 'Davčna št.', value: '31147011' },
    ],
  },
  /** The footer link to the privacy subpage. A real /zasebnost route link, so
   *  it is crawlable and the global click interceptor upgrades it to SPA nav. */
  /**
   * The legal documents, linked from every footer. Real route links, so they
   * are crawlable and the global click interceptor upgrades them to SPA
   * navigation. Order is the order a reader needs them: privacy first (it
   * governs every visitor), then the terms that govern a customer, then the
   * service module.
   */
  legalLinks: [
    { label: 'Politika zasebnosti', href: '/zasebnost' },
    { label: 'Splošni pogoji', href: '/pogoji-splosno' },
    { label: 'Pogoji ponudb za nastanitve', href: '/pogoji-nastanitve' },
  ],
}

export const ui = {
  skipToContent: 'Preskoči na vsebino',
  /**
   * Interaction-only: the phone menu control exists ONLY once the masthead
   * hydrates — with JS off the whole nav is simply visible in flow, so there is
   * no button and nothing to label. Lives under the `feedback` key the content
   * guard skips by contract.
   */
  feedback: {
    menuLabel: 'Meni',
  },
}

/** 404 copy — asserted against dist/404.html by the content guard. */
export const notFound = {
  metaTitle: 'Stran ne obstaja',
  metaDescription: 'Iskana stran ne obstaja.',
  heading: '404: ta stran ne obstaja',
  body: 'Naslov je napačen ali pa je bila stran odstranjena.',
  homeLabel: 'Na domačo stran',
}

export const meta = {
  title: 'SpletnaPovsod: izdelava spletnih strani',
  description:
    'Profesionalne, hitre in dostopne spletne rešitve: unikaten dizajn brez predlog, SEO in tehnično urejena zasebnost v ceni, objava v 3 delovnih dneh.',
}
