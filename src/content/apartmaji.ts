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

/**
 * An include line is one of three shapes:
 *  - a plain string;
 *  - an EMPHASIS line kept as three separate strings (lead + strong + tail) so
 *    each stays CONTIGUOUS in the emitted HTML — a mid-sentence <strong> would
 *    break the full string and the content guard checks whole strings;
 *  - an SEO line that opens (native <details>) to its own detail list, so a
 *    visitor can click to see exactly what the optimisation covers.
 */
export interface AptEmphasis {
  lead: string
  strong: string
  tail: string
}

export interface AptSeo {
  summary: string
  intro: string
  points: string[]
}

export type AptInclude = string | AptEmphasis | AptSeo

export interface AptPackage {
  id: string
  name: string
  summary: string
  includes: AptInclude[]
  footnote?: string
}

export const meta = {
  title: 'Spletna stran za apartma: ponudba in paketi',
  description:
    'Izdelamo spletno stran za vaš apartma ali sobe: oglaševanje izven booking platform, prikaz zasedenosti in povpraševanje prek strani. Trije paketi.',
}

export const hero = {
  kicker: 'Apartmaji in sobodajalci',
  title: 'Spletna stran za vaš apartma',
  lead: 'Z lastno spletno stranjo apartmaji, dvorane in počitniške hiše ne pridobijo le vtisa profesionalnosti, sploh pri poslovnih rezervacijah, temveč stran služi tudi kot odličen kanal rezervacij, preko katerega se lahko izognete proviziji booking platform, ali pa stran uporabite kot unikaten medij za oglaševanje, ki se razlikuje od template ponudb booking platform.',
  ctaLabel: 'Prejmite stran v roku 48 ur',
  ctaTarget: 'kontakt',
}

export interface AptExample {
  /** Machine id — the image basename: /img/primeri/<id>-<width>.<ext>. */
  id: string
  /** The shipped demo page this card previews — a real URL, machine identifier. */
  demo: string
  name: string
  gloss: string
  alt: string
}

export const examples = {
  kicker: 'Primeri',
  title: 'Kako lahko izgleda vaša stran',
  body: 'Pripravili smo nekaj primerov oblike in postavitve. Služijo le kot izhodišče, vi pa določite končno podobo.',
  /**
   * THE DEMO IS LABELLED AS A DEMO, in visible copy — the honesty rule the
   * whole site runs on. The three cards are renders of real template packs
   * (SpehKing/register_nastanitev: atelier, veduta, mariven-stay) driven with
   * a FICTIONAL apartment: invented name, invented copy and reviews, abstract
   * generated plates instead of photographs. Nothing on them belongs to a real
   * operator — the generator's own output is built from scraped content of
   * real owners and must never appear here. Provenance + refresh ritual:
   * scripts/build-primeri-images.mjs.
   *
   * Display names (Atelje / Veduta / Rezidenca) are OUR labels for the layouts,
   * not the packs' internal codenames — needs owner sign-off like all copy.
   */
  demoNote:
    'Prikazani primeri so demonstracija: apartma, besedila in slike na njih so izmišljeni.',
  items: [
    {
      id: 'primer-atelier',
      demo: '/primeri/atelier/index.html',
      name: 'Atelje',
      gloss: 'Deljena postavitev: podatki o apartmaju ob strani, vsebina teče mimo njih.',
      alt: 'Primer strani z deljeno postavitvijo: levo ime apartmaja s podatki, desno opis in galerija.',
    },
    {
      id: 'primer-veduta',
      demo: '/primeri/veduta/index.html',
      name: 'Veduta',
      gloss: 'Fotografija čez ves zaslon, pod njo pas s ključnimi podatki.',
      alt: 'Primer strani s celozaslonsko fotografijo, imenom apartmaja in pasom s podatki.',
    },
    {
      id: 'primer-mariven',
      demo: '/primeri/mariven-stay/index.html',
      name: 'Rezidenca',
      gloss: 'Umirjena serifna tipografija, ime apartmaja na sredini fotografije.',
      alt: 'Primer strani z imenom apartmaja na sredini celozaslonske fotografije.',
    },
  ] satisfies AptExample[],
  /**
   * Interaction-only strings for the fullscreen preview overlay — rendered
   * only after a click, so the content guard skips this key by contract.
   */
  feedback: {
    close: 'Zapri predogled',
    /** Composed with the card name into the dialog's accessible name. */
    previewTitle: 'Predogled',
  },
}

export const packages = {
  kicker: 'Ponudba',
  title: 'Trije paketi',
  ctaLabel: 'Naročite spletno stran',
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
        {
          summary: 'Osnovna optimizacija za Google in AI-iskalnike (SEO in GEO)',
          intro:
            'Vse, kar iskalnik in umetna inteligenca potrebujeta, da stran najdeta, preberata in pravilno razumeta. Vgrajeno v stran in preverjeno ob vsaki objavi.',
          points: [
            'Strežniško izrisana stran: vsa vsebina je berljiva tudi brez JavaScripta, zato jo vidijo vsi iskalniki in jezikovni modeli, kot so ChatGPT, Claude in Perplexity, ki strani ne izvajajo.',
            'Naslov strani in opis za brskalnik, prilagojena za vsako podstran.',
            'Kanonični naslov strani, da se uvrstitvena moč ne razprši med podvojene različice.',
            'Zemljevid strani in navodila za pajke, samodejno ustvarjena iz objavljene strani, zato ne morejo zastarati.',
            'Dostop za pajke umetne inteligence, na primer GPTBot, ClaudeBot in PerplexityBot, da vas odgovorni motorji smejo brati.',
            'Strukturirani podatki: iskalnik razume, da ste podjetje, in pozna vaše ime, logotip in naslov strani.',
            'En glavni naslov, urejena hierarhija naslovov in nadomestno besedilo slik za dostopnost.',
            'Odzivne slike, hitro nalaganje, varnostne glave in prava stran za napačne naslove.',
            'Vgrajene kontrole ob objavi: če je naslov, jezik ali kanonični naslov strani napačen, se objava ustavi in napaka ne pride v splet.',
          ],
        },
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
        {
          lead: 'Prikaz zasedenosti, ',
          strong: 'samodejno usklajen z zasedenostjo na booking platformah',
          tail: '; proste termine lahko dodate tudi ročno',
        },
        {
          summary: 'Razširjena optimizacija za iskalnike in AI-odgovore',
          intro:
            'Vse iz osnovne optimizacije, in še bogatejša predstavitev v iskalniku ter hitrejša objava.',
          points: [
            'Popolnejši strukturirani podatki: dejavnost z lokacijo in kontaktom ter opis storitev, da iskalnik razume, kaj ponujate in kje.',
            'Lastna slika za deljenje za vsako podstran, tako da se ob deljenju v družbenih omrežjih pokaže oblikovana kartica namesto splošne slike.',
            'Hitrejša objava v iskalnikih: ob vsaki spremembi Bing in Copilot novo vsebino pobereta v nekaj minutah, namesto da čakata na naslednji obisk pajka.',
            'Razširjene kontrole ob objavi: preverjanje oznak za družbena omrežja in veljavnosti strukturiranih podatkov.',
            'Zagonsko poročilo: preverimo, da vsako podstran iskalniki in pajki umetne inteligence vidijo s pravo vsebino.',
          ],
        },
        {
          lead: 'Obrazec za povpraševanje, ',
          strong: 'vezan na zasedenost',
          tail: ': gost izbere med prostimi termini, povpraševanje pa vam pride naravnost v e-pošto',
        },
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
    'Vsako stran poskusimo pripraviti tako, da lastniku ustreza že takoj. Ker pa ima vsak svoje želje, ki jih vnaprej ne moremo predvideti, po potrebi paket razširimo s krogom popravkov, v primeru kompleksnih zahtev pa več njih.',
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

/**
 * This page's overrides for the SHARED contact form (ContactSection props).
 * The package chips' values are the tier ids from `packages` — machine
 * identifiers stay English, so the owner's inbox sorts across languages.
 */
export const contactExtras = {
  packageLabel: 'Želeni paket',
  messageLabel: 'Dodatne informacije',
}
