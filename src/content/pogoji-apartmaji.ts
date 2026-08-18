/**
 * Posebni pogoji za apartmajske storitve — the service module at
 * /pogoji-apartmaji.
 *
 * THIS IS A MODULE, NOT A SECOND CONTRACT. It does not restate the general
 * terms; it states only what differs for the apartment offer, and its own
 * clause 1 sets the precedence (module wins where it differs, general terms
 * govern everything else). That is deliberate and it is the legally safer of
 * the two shapes: two standalone documents duplicate 80% of their clauses, and
 * the moment one copy is updated and the other is not, OZ 83 reads the
 * resulting ambiguity against us, the drafter. One base plus one module cannot
 * drift that way, because there is only ever one copy of each clause.
 *
 * WHAT IS DERIVED AND WHAT IS PENDING. The clauses below are drawn from copy
 * the owner has already published on /apartmaji (package contents, the domain
 * cost note, the definition of a minor revision) plus the decisions of avgust
 * 2026. Anything the owner has not yet decided is marked `todo` and carries
 * ⟨…⟩ rather than an invented term. The owner has said a fuller apartment TOS
 * is coming; this module is the frame it fills.
 *
 * DRAFT: needs owner sign-off and a lawyer's review.
 */
import type { NavItem } from './home'
import type { Article } from './pogoji'

export const meta = {
  title: 'Posebni pogoji za apartmajske storitve',
  description:
    'Posebni pogoji za izdelavo spletnih strani za apartmaje in sobodajalce. Dopolnjujejo splošne pogoje poslovanja in imajo pri razlikah prednost.',
}

export const hero = {
  kicker: 'Pravni dokumenti',
  title: 'Posebni pogoji za apartmaje',
  lead: 'Ti pogoji veljajo za izdelavo spletnih strani za apartmaje, sobe in druge nastanitve. Dopolnjujejo splošne pogoje poslovanja; kjer se od njih razlikujejo, veljajo ti posebni pogoji.',
}

/** The link back to the base document, rendered as a standing note at the top
 *  of the module. Machine identifier (the href) stays ASCII. */
export const base = {
  label: 'Splošni pogoji poslovanja',
  href: '/pogoji-splosno',
  note: 'Ta dokument je modul k splošnim pogojem poslovanja. Vse, kar tu ni urejeno drugače, ureja osnovni dokument.',
}

export const articles: Article[] = [
  {
    id: 'veljavnost',
    n: '1',
    title: 'Veljavnost in razmerje do splošnih pogojev',
    clauses: [
      {
        n: '1.1',
        text: 'Ti posebni pogoji veljajo za storitve izdelave in vzdrževanja spletnih strani za apartmaje, sobe in druge nastanitvene zmogljivosti.',
      },
      {
        n: '1.2',
        text: 'Ti posebni pogoji dopolnjujejo splošne pogoje poslovanja Izvajalca. Kjer se posebni pogoji razlikujejo od splošnih, za apartmajske storitve veljajo posebni pogoji. Vsa vprašanja, ki tu niso urejena, ureja osnovni dokument.',
      },
      {
        n: '1.3',
        text: 'V ponudbi je vedno navedeno, kateri pogoji veljajo za posamezno naročilo. Če ponudba navaja apartmajski paket, veljajo ti posebni pogoji skupaj s splošnimi.',
      },
    ],
  },
  {
    id: 'paketi',
    n: '2',
    title: 'Paketi in obseg',
    clauses: [
      {
        n: '2.1',
        text: 'Obseg posameznega paketa je določen v ponudbi in na predstavitveni strani ponudbe. Kar je v paketu izrecno navedeno kot vključeno, je vključeno; kar ni navedeno, ni predmet pogodbe.',
      },
      {
        n: '2.2',
        text: 'Prikaz zasedenosti, povpraševanje prek spletne strani in druge funkcionalnosti so vključeni le, če jih izbrani paket izrecno navaja.',
      },
      {
        n: '2.3',
        text: 'Izvajalec ne odgovarja za delovanje rezervacijskih platform tretjih oseb, za njihove provizije, pravila ali za povezavo z njimi, razen če je taka povezava izrecno dogovorjena v ponudbi.',
        todo: false,
      },
      {
        n: '2.4',
        text: 'Naročnik odgovarja za točnost podatkov o nastanitvi, cenah, zasedenosti in pogojih bivanja, objavljenih na spletnem mestu, ter za njihovo sprotno posodabljanje.',
      },
    ],
  },
  {
    id: 'domena-apt',
    n: '3',
    title: 'Domena',
    clauses: [
      {
        n: '3.1',
        text: 'Tudi kadar paket vključuje registracijo in vezavo domene, zakup domene ni vključen v ceno. Vključena je le tehnična nastavitev in vezava na spletno mesto.',
      },
      {
        n: '3.2',
        text: 'Ceno domene določa registrar in jo Izvajalec Naročniku sporoči, preden domeno registrira. Strošek prvega zakupa in vsakoletnega podaljšanja krije Naročnik.',
      },
      {
        n: '3.3',
        text: 'Za podaljševanje domene in za posledice njenega poteka veljajo določbe 13. člena splošnih pogojev.',
      },
    ],
  },
  {
    id: 'vsebine',
    n: '4',
    title: 'Gradiva in fotografije nastanitve',
    clauses: [
      {
        n: '4.1',
        text: 'Naročnik zagotovi fotografije nastanitve in besedila. Naročnik jamči, da ima za vsa posredovana gradiva vse potrebne pravice, tudi kadar so fotografije nastale v okviru sodelovanja s platformo ali s tretjim fotografom.',
      },
      {
        n: '4.2',
        text: 'Če Naročnik gradiv ne zagotovi, Izvajalec spletno mesto objavi z dogovorjeno začasno vsebino, roki iz 8. člena splošnih pogojev pa začnejo teči šele ob prejemu popolnih gradiv.',
      },
    ],
  },
  {
    id: 'popravki-apt',
    n: '5',
    title: 'Popravki in vzdrževanje',
    clauses: [
      {
        n: '5.1',
        text: 'Popravki so spremembe, kot so pozicija gumbov, zamenjava slik, barv ali pisave, in podobni posegi v obstoječo strukturo strani. Ne vključujejo novih funkcionalnosti ali celotne prenove grafične podobe.',
      },
      {
        n: '5.2',
        text: 'Če predlagana sprememba presega ta obseg, Izvajalec Naročnika o tem obvesti vnaprej in določi ceno glede na dodatno delo.',
      },
      {
        n: '5.3',
        text: 'Obseg vključenih popravkov po posameznem paketu je ⟨določiti: koliko popravkov oziroma ur je vključenih in za kakšno obdobje⟩.',
        todo: true,
      },
    ],
  },
  {
    id: 'potrosniki',
    n: '6',
    title: 'Naročniki, ki so potrošniki',
    clauses: [
      {
        n: '6.1',
        text: 'Sobodajalec, ki naroča storitev v okviru registrirane dejavnosti, ni potrošnik. Fizična oseba, ki storitev naroči zunaj svoje poslovne dejavnosti, je potrošnik in zanjo veljajo določbe 19. člena splošnih pogojev o odstopu od pogodbe.',
      },
      {
        n: '6.2',
        text: 'Ker je storitev praviloma opravljena v nekaj delovnih dneh, Izvajalec potrošnika pred začetkom izvedbe pozove, naj poda izjavo o takojšnjem začetku izvedbe. Brez te izjave se z izvedbo počaka do izteka odstopnega roka.',
      },
    ],
  },
]

export const updated = { label: 'Različica', value: 'v1.0, osnutek, avgust 2026' }

export const nav: NavItem[] = [
  { target: 'veljavnost', label: 'Veljavnost' },
  { target: 'paketi', label: 'Paketi' },
  { target: 'popravki-apt', label: 'Popravki' },
]

export const ctaPrimary = { label: 'Potrošniki', target: 'potrosniki' }
