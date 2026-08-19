/**
 * Splošni pogoji poslovanja — the general terms document at /pogoji-splosno.
 *
 * SOURCE: the 24-agency template the owner supplied, with the owner's decisions
 * of avgust 2026 built in (see the clause-by-clause memo). What changed from the
 * template, and why, is recorded per article in the `note` fields of the memo,
 * not here; this module is the document itself.
 *
 * THE TWO-DOCUMENT ARCHITECTURE. These are the GENERAL terms. Service-specific
 * terms (currently: apartmaji) live in their own module and, by their own
 * precedence clause, override these where they differ. That is the Dutch and
 * Belgian pattern the template's own annex describes, and it is the structure
 * that keeps OZ 83 (ambiguity is read against the drafter) from working against
 * us: one base document, one module, one stated precedence, no duplicated
 * clause that can drift.
 *
 * ONE PLACEHOLDER, BY DECISION. The owner's docx pass (avgust 2026, »Splošni
 * pogoji (1).docx«) resolved 10.1, 11.7 and 11.8. What remains is 6.4's
 * definition of a »krog popravkov«, which the owner asked to keep VISIBLE
 * rather than as a code note — so it carries ⟨…⟩ and `todo: true`, and the
 * page prints »dopolniti« beside it. That is the document's own declared
 * incompleteness marker, not an authoring reminder smuggled into content.
 * The version line still reads »osnutek«, which is the matching signal at
 * document level; the document-wide OSNUTEK banner stays removed.
 *
 * DRAFT: needs owner sign-off and a lawyer's review before it governs anything.
 */
import type { NavItem } from './home'

export interface Clause {
  /** The clause number as it appears in the document, e.g. "8.3". */
  n: string
  text: string
  /** Optional bullets under the clause text. */
  items?: string[]
  /** Carries an unfilled owner decision — the page marks it. */
  todo?: boolean
}

export interface Article {
  /** ASCII anchor id. */
  id: string
  /** Article number as displayed. */
  n: string
  title: string
  clauses: Clause[]
}

export const meta = {
  title: 'Splošni pogoji poslovanja',
  description:
    'Splošni pogoji poslovanja za storitve načrtovanja, izdelave in vzdrževanja spletnih strani: obseg, roki, cene, pravice, jamstvo in odgovornost.',
}

export const hero = {
  kicker: 'Pravni dokumenti',
  title: 'Splošni pogoji poslovanja',
  lead: 'Ti pogoji urejajo storitve načrtovanja, izdelave in vzdrževanja spletnih strani. Za posamezne storitve veljajo dodatno posebni pogoji, ki imajo v primeru razlik prednost pred temi.',
}

/** Rendered as a register block in the first article. Owner-supplied identity.
 *  NO ADDRESS ROW, by the owner's call (avgust 2026): the registered address is
 *  not stated here. If the document is ever served to consumers, check whether
 *  the pre-contractual information duties require the seat to appear — the
 *  footer's provider identity and the privacy policy are the other places it
 *  would belong. */
export const provider = {
  name: 'POVSOD, Gregor Anželj, s.p.',
  rows: [
    { label: 'Matična številka', value: '6774644000' },
    { label: 'Davčna številka', value: '31147011' },
  ],
  emailLabel: 'E-pošta',
}

/** The document. */
export const articles: Article[] = [
  {
    id: 'uvod',
    n: '1',
    title: 'Uvodne določbe in veljavnost',
    clauses: [
      {
        n: '1.1',
        text: 'Ti splošni pogoji urejajo pravice in obveznosti med spodaj navedenim izvajalcem (v nadaljevanju: Izvajalec) in naročnikom storitev (v nadaljevanju: Naročnik).',
      },
      {
        n: '1.2',
        text: 'Pogoji so sestavni del vsake ponudbe, predračuna, naročila in pogodbe. Naročnik jih sprejme s podpisom pogodbe, s pisno ali elektronsko potrditvijo ponudbe ali s plačilom avansa, kar nastopi prej.',
      },
      {
        n: '1.3',
        text: 'Za posamezne storitve lahko Izvajalec objavi samostojne posebne pogoje. Kadar za neko naročilo veljajo taki posebni pogoji, ti splošni pogoji za tisto naročilo ne veljajo. To velja zlasti za naročila, sklenjena na podlagi akcijske ponudbe za apartmajske storitve, za katera veljajo posebni pogoji za apartmaje.',
      },
      {
        n: '1.4',
        text: 'Če je sklenjena posamična pisna pogodba, imajo njena določila prednost pred temi pogoji. Splošni pogoji Naročnika ne veljajo, razen če jih Izvajalec izrecno pisno sprejme.',
      },
      {
        n: '1.5',
        text: 'Za vprašanja, ki tu niso urejena, se uporablja veljavna zakonodaja Republike Slovenije, zlasti Obligacijski zakonik in predpisi o avtorski pravici.',
      },
    ],
  },
  {
    id: 'izrazi',
    n: '2',
    title: 'Pomen izrazov',
    clauses: [
      {
        n: '2.1',
        text: 'V teh pogojih imajo izrazi naslednji pomen:',
        items: [
          'Storitev: načrtovanje, oblikovanje, programiranje, migracija, optimizacija, vzdrževanje, gostovanje in podobne digitalne storitve.',
          'Specifikacija: ponudba ali popis del, ki opredeljuje obseg, funkcionalnosti, roke in ceno.',
          'Gradivo Naročnika: besedila, slike, logotipi, videi, podatki, dostopi in vse drugo, kar Naročnik posreduje Izvajalcu.',
          'Rezultat dela: spletno mesto, koda, oblikovne datoteke in drugi dogovorjeni izdelki.',
          'Delovni dan: vsak dan razen sobot, nedelj in dela prostih dni v Republiki Sloveniji.',
        ],
      },
    ],
  },
  {
    id: 'ponudba',
    n: '3',
    title: 'Ponudba in sklenitev pogodbe',
    clauses: [
      { n: '3.1', text: 'Ponudbe so neobvezujoče in veljajo 30 dni od izdaje, razen če je navedeno drugače.' },
      {
        n: '3.2',
        text: 'Cene in roki v ponudbi temeljijo na podatkih, ki jih posreduje Naročnik. Če se ti izkažejo za nepopolne ali napačne, ima Izvajalec pravico do prilagoditve ponudbe.',
      },
      { n: '3.3', text: 'Pogodba je sklenjena s pisno ali elektronsko potrditvijo naročila ali s plačilom avansa.' },
      {
        n: '3.4',
        text: 'Izvajalec ni zavezanec za DDV po prvem odstavku 94. člena Zakona o davku na dodano vrednost, zato DDV na računih ni obračunan. Navedene cene so končne.',
      },
    ],
  },
  {
    id: 'obseg',
    n: '4',
    title: 'Obseg storitev',
    clauses: [
      { n: '4.1', text: 'Natančen obseg je vedno določen v ponudbi ali specifikaciji. Kar tam ni navedeno, ni predmet pogodbe.' },
      {
        n: '4.2',
        text: 'Med storitve praviloma niso vključeni, razen ob posebnem dogovoru: zakup in podaljševanje domen, gostovanje, licence za tretje programske komponente, fotografije iz plačljivih bank, pisanje in lektoriranje vsebin, prevodi, oglaševalske kampanje, izobraževanje uporabnikov in poznejše vzdrževanje. Kar je v ponudbi ali paketu izrecno navedeno kot vključeno, je vključeno in ima prednost pred tem odstavkom.',
      },
      { n: '4.3', text: 'Izvajalec sme za izvedbo pritegniti podizvajalce.' },
      {
        n: '4.4',
        text: 'Izvajalec ni dolžan zagotavljati panožnega ali pravnega svetovanja. Njegova priporočila niso pravno mnenje; za vprašanja skladnosti mora Naročnik pridobiti ustrezen nasvet.',
      },
      // 4.5–4.7 moved here from 15.6–15.8 on the owner's docx instruction:
      // they draw the same boundary as 4.4 (what the Izvajalec's work is NOT),
      // so they belong with the scope of services, not with data protection.
      {
        n: '4.5',
        text: 'Za vsebinsko pravno skladnost spletnega mesta odgovarja Naročnik. To vključuje zlasti vsebino politike zasebnosti, splošnih pogojev, obvestil o piškotkih in drugih pravnih besedil, pravno podlago za obdelavo osebnih podatkov, skladnost dejavnosti Naročnika s predpisi ter resničnost objavljenih navedb.',
      },
      {
        n: '4.6',
        text: 'Če Izvajalec Naročniku posreduje vzorec, predlogo ali predlog pravnega besedila, je to zgolj tehnični pripomoček in ne pravno mnenje. Izvajalec ne odgovarja za njegovo pravno ustreznost, popolnost, ažurnost ali skladnost z dejavnostjo Naročnika. Naročnik mora vsako tako besedilo pred objavo preveriti sam oziroma pri ustreznem strokovnjaku in ga prilagoditi svoji dejavnosti.',
      },
      {
        n: '4.7',
        text: 'Izvajalec ne odgovarja za pravne posledice objave besedil, ki jih je Naročnik prevzel po vzorcu Izvajalca in jih ni preveril.',
      },
    ],
  },
  {
    id: 'sodelovanje',
    n: '5',
    title: 'Obveznosti in sodelovanje Naročnika',
    clauses: [
      { n: '5.1', text: 'Naročnik pravočasno in v uporabni digitalni obliki zagotovi vsa gradiva, dostope in odobritve.' },
      {
        n: '5.2',
        text: 'Naročnik jamči, da ima za posredovana gradiva vse potrebne pravice, in Izvajalca v celoti razbremeni zahtevkov tretjih oseb iz tega naslova, vključno s stroški obrambe.',
      },
      {
        n: '5.3',
        text: 'Izvajalec ni dolžan preverjati gradiv Naročnika glede vsebinske ustreznosti, resničnosti ali morebitnih kršitev pravic tretjih.',
      },
      { n: '5.4', text: 'Naročnik določi kontaktno osebo s pooblastilom za odločanje in odzivom v petih delovnih dneh.' },
      {
        n: '5.5',
        text: 'Če Naročnik zamuja z gradivi ali odobritvami več kot 30 dni, sme Izvajalec projekt zamrzniti, zaračunati do tedaj opravljeno delo in ob nadaljevanju določiti nov rok.',
      },
    ],
  },
  {
    id: 'potek',
    n: '6',
    title: 'Potek projekta',
    clauses: [
      // Article 6 rewritten per the owner's docx instruction (avgust 2026): the
      // project runs by phases — free concept, 40% advance before content work,
      // two included rounds, remainder at final-look confirmation, then domain
      // binding and handover. 10.2, 8.2 and 11.8 were aligned to this flow in
      // the same pass; see the commit message for the audit.
      {
        n: '6.1',
        text: 'Projekt poteka po naslednjih fazah: oblikovni koncept, izvedba vsebinskih želja, vključena kroga popravkov, plačilo preostanka ter vezava domene in predaja. Faze se lahko prekrivajo, kadar to zahteva dogovorjeni rok.',
      },
      {
        n: '6.2',
        text: 'Oblikovni koncept Izvajalec pripravi in posreduje brezplačno, razen če je vnaprej dogovorjeno drugače. Brezplačni oblikovni koncept Naročnika ne zavezuje.',
      },
      {
        n: '6.3',
        text: 'Po prejemu vsebinskih želja Naročnika in po plačilu avansa iz točke 10.2 Izvajalec začne z izvedbo: oblikovni koncept dopolni z vsebino in uredi vsebinske želje Naročnika.',
      },
      {
        // The definition of a »krog popravkov« is the one decision left open in
        // this document, and the owner asked for it to stay VISIBLE (avgust
        // 2026) rather than sit in a code note: two rounds are promised, so
        // what one round covers is load-bearing — it decides where article 7
        // (change of scope) starts and what 8.4 bills as an extra round.
        n: '6.4',
        text: 'V ceno sta vključena dva kroga popravkov na oblikovni koncept. Popravki se praviloma uredijo že v prvem krogu; drugi je na voljo, kadar je potreben. En krog popravkov obsega ⟨določiti: obseg enega kroga — koliko pripomb oziroma strani pripomb, v kakšnem roku jih Naročnik posreduje in kdaj se krog šteje za zaključen⟩. Dodatni krogi se obračunajo po urni postavki iz točke 10.1.',
        todo: true,
      },
      {
        n: '6.5',
        text: 'Ko Naročnik potrdi končno podobo strani, poravna preostanek plačila po točki 10.2, vključno s stroškom registracije domene, ki mu ga sporoči Izvajalec, razen kadar Naročnik v skladu z dogovorom registracijo domene uredi sam.',
      },
      {
        n: '6.6',
        text: 'Po prejemu celotnega plačila Izvajalec veže domeno na spletno mesto ter Naročniku preda dostopne podatke in, na njegovo željo, izvorne datoteke in kodo v skladu s točko 11.8.',
      },
      {
        n: '6.7',
        text: 'Vsaka vsebinska faza se zaključi z odobritvijo Naročnika, ki jo je mogoče podati tudi po elektronski pošti. Odobrena faza se šteje za zaključeno; poznejši posegi vanjo se obravnavajo kot sprememba obsega po 7. členu.',
      },
      {
        n: '6.8',
        text: 'Če Naročnik po predstavitvi predloga ne poda jasnih usmeritev, sme Izvajalec oblikovne odločitve sprejeti po lastni strokovni presoji.',
      },
    ],
  },
  {
    id: 'spremembe',
    n: '7',
    title: 'Spremembe obsega',
    clauses: [
      {
        n: '7.1',
        text: 'Vsaka zahteva zunaj potrjene specifikacije je sprememba obsega. Izvajalec pripravi oceno stroška in vpliva na rok; delo se začne šele po potrditvi Naročnika.',
      },
      { n: '7.2', text: 'Izvajalec sme spremembo zavrniti, če ta bistveno posega v koncept ali arhitekturo rešitve.' },
      { n: '7.3', text: 'Zaradi vključevanja sprememb dogovorjeni roki ne veljajo več za zavezujoče.' },
    ],
  },
  {
    id: 'roki',
    n: '8',
    title: 'Roki',
    clauses: [
      {
        n: '8.1',
        text: 'Navedeni roki so okvirni, razen če so izrecno označeni kot fiksni ali če gre za storitvene roke iz točke 8.2.',
      },
      {
        n: '8.2',
        text: 'Izvajalec navaja naslednje storitvene roke:',
        items: [
          'Objava spletne strani: trije delovni dnevi. Rok začne teči po dogovorjeni končni podobi, torej po zadnjem naročenem krogu popravkov, in ob pogoju, da je Naročnik potrdil ponudbo, izročil vsa dogovorjena gradiva v uporabni digitalni obliki in poravnal preostanek plačila po točki 10.2. Rok velja za manjše in srednje projekte brez podatkovnih baz.',
          'Manjši popravki: 24 ur v delovnem času, od prejema jasno opisane zahteve in prejetih gradiv.',
          'Odziv na povpraševanje: en delovni dan.',
        ],
      },
      {
        n: '8.3',
        text: 'Izvajalec si pridržuje pravico, da rok iz točke 8.2 podaljša, če je obseg zahtevanih sprememb, popravkov ali želja Naročnika večji od obsega, na katerem navedeni rok temelji. Pravica velja tako za rok objave kot za rok za manjše popravke. Izvajalec Naročnika o podaljšanju in o novem roku obvesti brez nepotrebnega odlašanja, praviloma pred iztekom prvotnega roka.',
      },
      {
        n: '8.4',
        text: 'Manjši popravki so spremembe, kot so pozicija gumbov, zamenjava slik, barv ali pisave, in podobni posegi v obstoječo strukturo strani. Ne vključujejo novih funkcionalnosti ali celotne prenove grafične podobe. Zahteve, ki presegajo ta obseg, se obravnavajo kot sprememba obsega po 7. členu; obračunajo se kot dodaten krog popravkov po točki 6.4 ali po urni postavki, kot je določeno v oceni iz točke 7.1. Zanje roki iz točke 8.2 ne veljajo.',
      },
      {
        n: '8.5',
        text: 'Rok se podaljša za čas zamude Naročnika pri gradivih, odobritvah ali plačilih, in za čas trajanja višje sile.',
      },
      { n: '8.6', text: 'Zamuda Naročnika ne odloži dogovorjenih plačilnih rokov.' },
    ],
  },
  {
    id: 'prevzem',
    n: '9',
    title: 'Prevzem',
    clauses: [
      {
        n: '9.1',
        text: 'Po obvestilu o dokončanju ima Naročnik deset delovnih dni za pregled in pisno prijavo bistvenih odstopanj od specifikacije.',
      },
      {
        n: '9.2',
        text: 'Če v tem roku ne prijavi napak ali če rezultat začne uporabljati v produkcijskem okolju, se šteje, da je delo prevzeto. Objava spletnega mesta na domeni Naročnika se šteje za začetek uporabe.',
      },
      {
        n: '9.3',
        text: 'Manjše pomanjkljivosti, ki bistveno ne ovirajo uporabe, ne zadržijo prevzema; Izvajalec jih odpravi v razumnem roku.',
      },
    ],
  },
  {
    id: 'cene',
    n: '10',
    title: 'Cene in plačilni pogoji',
    clauses: [
      {
        n: '10.1',
        text: 'Cena je določena v ponudbi kot pavšal, individualno glede na obseg projekta. Cena je Naročniku znana vnaprej. Kadar se posamezno delo obračuna po urni postavki, zlasti dodatni krogi popravkov po točki 6.4 in opravila v zvezi z domeno po točki 13.4, velja urna postavka, ki jo Izvajalec sporoči vnaprej in pred začetkom takega dela.',
      },
      {
        n: '10.2',
        text: 'Plačilna dinamika je določena v ponudbi, praviloma pa je naslednja: oblikovni koncept je brezplačen in Naročnika ne zavezuje; pred začetkom izvedbe vsebinskih želja Naročnik plača avans v višini 40 odstotkov dogovorjene cene; preostanek zapade v plačilo, ko Naročnik po zaključenih krogih popravkov potrdi končno podobo strani. Vezava domene in predaja se opravita po prejemu celotnega plačila.',
      },
      { n: '10.3', text: 'Plačilni rok je 14 dni od izdaje računa, razen če je v ponudbi določeno drugače.' },
      {
        n: '10.4',
        text: 'Ob zamudi tečejo zakonske zamudne obresti, Izvajalec pa lahko po pisnem opominu zadrži nadaljnje delo, storitve ali objavo do poravnave. Naročnik krije razumne stroške izterjave.',
      },
      {
        n: '10.5',
        text: 'Ponavljajoče se storitve se obračunavajo vnaprej in se samodejno podaljšujejo, če niso odpovedane vsaj 30 dni pred iztekom obdobja. Naročnika Izvajalec na podaljšanje pisno opozori pred iztekom odpovednega roka.',
      },
      {
        n: '10.6',
        text: 'Izvajalec sme cene ponavljajočih se storitev prilagoditi enkrat letno z najmanj 60-dnevnim predhodnim obvestilom; Naročnik ima v tem primeru pravico do odpovedi brez stroškov.',
      },
      { n: '10.7', text: 'Pobot z nasprotnimi terjatvami je dopusten le, če so te nesporne ali pravnomočno ugotovljene.' },
    ],
  },
  {
    id: 'pravice',
    n: '11',
    title: 'Pravice intelektualne lastnine',
    clauses: [
      { n: '11.1', text: 'Do celotnega plačila vse pravice na rezultatu dela ostanejo Izvajalcu.' },
      {
        // OWNER'S CALL, revised in session (avgust 2026): NON-EXCLUSIVE. The
        // first pass said exclusive; the concern was raised and the owner
        // changed it. This is also the agency default, and for a good reason:
        // a house that reuses one design system across clients cannot promise
        // exclusivity over a result whose boundary with 11.3's components is
        // undrawn. Non-exclusive gives the client everything they actually
        // need — use, host, modify, forever, anywhere — and leaves 11.3, 11.5
        // and 11.6 standing without having to carve them out of the grant.
        //
        // NOT PROMISED HERE, and an open owner decision: a narrow undertaking
        // not to reuse the client's INDIVIDUAL visual identity for another
        // client. That is what a client usually means when they ask for
        // exclusivity, and it is the normal way to give it to them without
        // touching the reusable system. It creates a real obligation, so it
        // waits for sign-off rather than being slipped in here.
        n: '11.2',
        text: 'Po celotnem plačilu Naročnik pridobi neizključno ter časovno in krajevno neomejeno pravico do uporabe dogovorjenega rezultata dela za lastne poslovne namene, vključno s pravico do predelave. Ta pravica ne posega v pravice Izvajalca iz točk 11.3, 11.5 in 11.6.',
      },
      {
        n: '11.3',
        text: 'Prenos se ne nanaša na predhodno obstoječe znanje, ogrodja, knjižnice, interna orodja, skripte, delovne predloge in ponovno uporabljive komponente Izvajalca. Naročnik zanje prejme trajno neizključno licenco v obsegu, potrebnem za uporabo rezultata.',
      },
      {
        n: '11.4',
        text: 'Komponente tretjih oseb so podvržene svojim licencam. Izvajalec Naročnika obvesti, kadar so potrebne plačljive licence; te niso zajete v ceni, razen če je dogovorjeno drugače.',
      },
      { n: '11.5', text: 'Zavrnjeni ali nerealizirani osnutki ostanejo v celoti last Izvajalca.' },
      {
        n: '11.6',
        text: 'Izvajalec sme rezultat dela navesti med referencami in ga uporabiti v predstavitvenih gradivih. Naročnik lahko to pravico pisno izključi.',
      },
      {
        n: '11.7',
        text: 'Navedba avtorstva v nogi spletnega mesta je dogovorjena in je njena odstranitev kršitev pogodbe. Pred sklenitvijo pogodbe se je na željo Naročnika mogoče odplačno dogovoriti, da se navedba avtorstva opusti.',
      },
      {
        n: '11.8',
        text: 'Po celotnem plačilu se izvorne datoteke in izvorna koda na željo Naročnika predajo Naročniku.',
      },
    ],
  },
  {
    id: 'jamstvo',
    n: '12',
    title: 'Jamstvo za napake',
    clauses: [
      { n: '12.1', text: 'Izvajalec jamči, da bo rezultat dela ob prevzemu vsebinsko ustrezal potrjeni specifikaciji.' },
      {
        // OWNER'S CALL: the statutory minimum, i.e. no contractual extension.
        // Drafted as a REFERENCE rather than a number on purpose. For consumers
        // the conformity period under ZVPot-1 is mandatory and cannot be
        // shortened, so naming a shorter figure would simply be void as to them;
        // for non-consumers the OZ rules on liability for defects apply, and the
        // exact figure is a lawyer's call, not one to invent here.
        n: '12.2',
        text: 'Jamstveni rok s temi pogoji ni podaljšan; veljajo zakonski roki. Za Naročnika, ki je potrošnik, veljajo v celoti zakonske pravice iz naslova neskladnosti po Zakonu o varstvu potrošnikov, ki jih ta dokument ne omejuje in ne skrajšuje. Za Naročnika, ki ni potrošnik, veljajo pravila o odgovornosti za napake po Obligacijskem zakoniku. V jamstvenem roku Izvajalec brezplačno odpravi napake, ki so posledica njegovega dela; brezplačna odprava napak ni isto kot plačljivi popravki in spremembe po točki 8.4.',
      },
      {
        n: '12.3',
        text: 'Jamstvo ne velja za posege Naročnika ali tretjih v kodo ali sistem, spremembe pri zunanjih ponudnikih in vmesnikih, opustitev priporočenih varnostnih posodobitev, napake gostovanja, ki ga Izvajalec ne upravlja, ter za vsebine, ki jih vnaša Naročnik.',
      },
      {
        n: '12.4',
        text: 'Združljivost je zagotovljena za zadnji dve različici razširjenih brskalnikov v času prevzema. Odstopanja zaradi posameznih nastavitev naprav, vtičnikov ali operacijskih sistemov niso napaka.',
      },
      {
        n: '12.5',
        text: 'Izvajalec jamči za tehnično zasnovo, ki jo izvede sam: vnaprej izrisan HTML, strukturirane podatke, dostopnost vsebine iskalnikom in jezikovnim modelom brez izvajanja skript ter skladnost s Core Web Vitals po stanju ob izročitvi.',
      },
      {
        n: '12.6',
        text: 'Izvajalec ne jamči za konkretne poslovne rezultate, zlasti ne za uvrstitve v iskalnikih, obseg obiska, konverzije, prodajo ali prikaz strani v odgovorih umetne inteligence. Ti so odvisni od dejavnikov zunaj nadzora Izvajalca, med drugim od zunanjih povezav na spletno mesto Naročnika, konkurence v panogi, vsebine, ki jo objavlja Naročnik, njegove siceršnje prisotnosti na spletu ter od algoritmov in politik iskalnikov in ponudnikov jezikovnih modelov, ki se lahko kadar koli spremenijo.',
      },
      { n: '12.7', text: 'Izvajalec sme napako odpraviti tudi tako, da zagotovi enakovredno rešitev.' },
    ],
  },
  {
    id: 'domena',
    n: '13',
    title: 'Domena, gostovanje in vzdrževanje',
    clauses: [
      {
        n: '13.1',
        text: 'Domena se registrira v imenu in za račun Naročnika. Za registracijo in podaljševanje veljajo pravila pristojnega registra, ki jih Naročnik sprejme.',
      },
      {
        n: '13.2',
        text: 'Zakup domene v nobenem primeru ni vključen v ceno storitve. V ceno je vključena le tehnična nastavitev domene in njena vezava na spletno mesto. Strošek registracije in vsakoletnega podaljšanja krije Naročnik.',
      },
      {
        n: '13.3',
        text: 'Podaljševanje domene je obveznost Naročnika. Izvajalec priporoča, da Naročnik podaljševanje uredi sam neposredno pri registrarju in da poskrbi za veljavne kontaktne podatke ter način plačila pri registrarju.',
      },
      {
        n: '13.4',
        text: 'Če Naročnik podaljšanje domene ali druga opravila v zvezi z domeno prenese na Izvajalca, se ta opravila obračunajo po urni postavki iz točke 10.1 oziroma po dogovorjenem ceniku, poleg stroška podaljšanja pri registrarju. Izvajalec teh opravil ni dolžan izvesti brez predhodnega dogovora.',
      },
      {
        n: '13.5',
        text: 'Izvajalec ne odgovarja za posledice poteka domene, do katerega pride, ker Naročnik podaljšanja ni uredil pravočasno, in ne spremlja rokov podaljšanja, razen če je to izrecno dogovorjeno.',
      },
      {
        n: '13.6',
        text: 'Kadar spletno mesto gostuje pri tretjem ponudniku, veljajo tudi pogoji in raven storitve tega ponudnika. Izvajalec ne jamči določene letne razpoložljivosti gostovanja in ne odgovarja za izpade na strani tretjega ponudnika.',
      },
      {
        n: '13.7',
        text: 'Koda in vsebina spletnega mesta se vodita v sistemu za nadzor različic, iz katerega je mogoča obnovitev. To Naročnika ne razbremeni obveznosti hranjenja lastnih kopij podatkov, ki jih sam vnaša.',
      },
      {
        n: '13.8',
        text: 'Obseg vzdrževanja je določen v ponudbi. Podpora je na voljo v delovnem času med delovniki.',
      },
      {
        n: '13.9',
        text: 'Če Naročnik zapadlih ponavljajočih se storitev ne poravna v 30 dneh, sme Izvajalec storitev začasno onemogočiti, po nadaljnjih 90 dneh pa odstopiti od pogodbe, o čemer Naročnika predhodno pisno obvesti.',
      },
    ],
  },
  {
    id: 'odgovornost',
    n: '14',
    title: 'Odgovornost',
    clauses: [
      {
        n: '14.1',
        text: 'Izvajalec neomejeno odgovarja za škodo, povzročeno naklepno ali iz hude malomarnosti, ter za škodo na življenju, telesu in zdravju. Kogentnih zakonskih odgovornosti ta člen ne izključuje.',
      },
      {
        n: '14.2',
        text: 'Pri lahki malomarnosti odgovarja le za kršitev bistvenih pogodbenih obveznosti, in sicer do višine predvidljive, pogodbi značilne škode.',
      },
      {
        n: '14.3',
        text: 'Odgovornost za posredno škodo, zlasti izgubljeni dobiček, izpad prihodka, izgubo podatkov in poslovni ugled, je izključena v obsegu, ki ga zakon dopušča.',
      },
      {
        n: '14.4',
        text: 'Skupna odgovornost Izvajalca je omejena na znesek, ki ga je Naročnik plačal za posamezni projekt oziroma za storitev, iz katere zahtevek izvira.',
      },
      {
        n: '14.5',
        text: 'Izvajalec ne odgovarja za vsebine, ki jih objavi Naročnik, za izpade pri zunanjih ponudnikih, za posledice kibernetskih napadov brez svoje krivde ter za spremembe algoritmov ali politik tretjih platform.',
      },
      {
        n: '14.6',
        text: 'Zahtevke je treba uveljaviti v 12 mesecih od nastanka škode. Ta rok ne velja za Naročnike, ki so potrošniki, in ne posega v zakonske roke, ki jih ni mogoče skrajšati.',
      },
    ],
  },
  {
    id: 'osebni-podatki',
    n: '15',
    title: 'Varstvo osebnih podatkov',
    clauses: [
      {
        n: '15.1',
        text: 'Obe pogodbeni stranki ravnata skladno s Splošno uredbo o varstvu podatkov in nacionalno zakonodajo.',
      },
      {
        n: '15.2',
        text: 'Kadar Izvajalec obdeluje osebne podatke v imenu Naročnika, stranki skleneta pogodbo o obdelavi podatkov po 28. členu Splošne uredbe. Naročnik je upravljavec, Izvajalec obdelovalec.',
      },
      {
        n: '15.3',
        text: 'Naročnik je seznanjen s podobdelovalci, ki jih Izvajalec uporablja pri izvedbi, in Izvajalec ga o spremembah pravočasno obvesti.',
      },
      {
        n: '15.4',
        text: 'Izvajalec izvaja primerne tehnične in organizacijske ukrepe ter Naročnika brez nepotrebnega odlašanja obvesti o kršitvi varstva osebnih podatkov.',
      },
      {
        n: '15.5',
        text: 'Izvajalec zagotavlja tehnično izvedbo: vgradnjo mehanizmov za privolitve, tehnično pravilno umestitev pravnih besedil na spletno mesto, varen prenos podatkov iz obrazcev in druge tehnične ukrepe, dogovorjene v specifikaciji.',
      },
    ],
  },
  {
    id: 'zaupnost',
    n: '16',
    title: 'Zaupnost',
    clauses: [
      {
        n: '16.1',
        text: 'Stranki poslovnih skrivnosti druge stranke ne razkrivata tretjim in jih uporabljata le za izvedbo pogodbe.',
      },
      {
        n: '16.2',
        text: 'Obveznost velja tri leta po prenehanju pogodbe, za poslovne skrivnosti pa dokler ohranijo ta status.',
      },
      {
        n: '16.3',
        text: 'Izjeme so javno znane informacije, samostojno razviti podatki in razkritja, zahtevana z zakonom ali odločbo organa.',
      },
    ],
  },
  {
    id: 'visja-sila',
    n: '17',
    title: 'Višja sila',
    clauses: [
      {
        n: '17.1',
        text: 'Nobena stranka ne odgovarja za neizpolnitev zaradi dogodkov zunaj njenega razumnega nadzora, kot so naravne nesreče, vojna, stavka, epidemija, obsežni izpadi omrežij ali energije in ukrepi oblasti.',
      },
      {
        n: '17.2',
        text: 'Če stanje traja več kot 60 dni, lahko katera koli stranka odstopi od pogodbe; do tedaj opravljeno delo se obračuna.',
      },
    ],
  },
  {
    id: 'trajanje',
    n: '18',
    title: 'Trajanje, odpoved in odstop',
    clauses: [
      {
        n: '18.1',
        text: 'Projektna pogodba preneha z izpolnitvijo. Naročniška razmerja se sklepajo za obdobje 12 mesecev s samodejnim podaljševanjem in odpovednim rokom 30 dni pred iztekom.',
      },
      {
        // Softened on the owner's docx instruction (avgust 2026): pay what was
        // actually performed — no 50% floor, no forfeited advance. The advance
        // counts toward the settlement and any surplus is returned, so the same
        // fair rule holds for everyone and the consumer carve-out collapses
        // into the general one; 19.8–19.10 still govern consumer withdrawal.
        n: '18.2',
        text: 'Ob odstopu Naročnika med izvedbo Naročnik plača do tedaj opravljeno delo in dejansko nastale stroške. Že plačani avans se všteje v to plačilo; če avans presega vrednost do tedaj opravljenega dela in stroškov, Izvajalec razliko vrne. Ta točka ne posega v pravice potrošnikov iz točk 19.8 do 19.10.',
      },
      {
        n: '18.3',
        text: 'Vsaka stranka lahko odstopi iz utemeljenega razloga, če druga stranka bistveno krši pogodbo in kršitve ne odpravi v 14 dneh po pisnem opominu.',
      },
      {
        n: '18.4',
        text: 'Ob prenehanju Izvajalec proti plačilu vseh zapadlih obveznosti izroči podatke, vsebine in dostope v standardni obliki. Podatke hrani še 30 dni, nato jih sme izbrisati.',
      },
    ],
  },
  {
    id: 'sklepne',
    n: '19',
    title: 'Sklepne določbe',
    clauses: [
      {
        n: '19.1',
        text: 'Izvajalec sme te pogoje spremeniti. Pri trajnih razmerjih Naročnika obvesti najmanj 30 dni pred uveljavitvijo; če Naročnik sprememb ne sprejme, lahko odpove pogodbo z učinkom na dan uveljavitve.',
      },
      { n: '19.2', text: 'Za projekte veljajo pogoji v različici, veljavni ob sklenitvi pogodbe.' },
      {
        n: '19.3',
        text: 'Neveljavnost posameznega določila ne vpliva na veljavnost preostalih; nadomesti se z veljavnim določilom, ki je najbližje gospodarskemu namenu.',
      },
      {
        n: '19.4',
        text: 'Prenos pogodbe na tretjo osebo je mogoč le s pisnim soglasjem druge stranke; Izvajalec sme pogodbo prenesti v primeru statusnega preoblikovanja.',
      },
      {
        n: '19.5',
        text: 'Za pogodbo velja pravo Republike Slovenije, brez kolizijskih pravil in brez Dunajske konvencije o mednarodni prodaji blaga.',
      },
      {
        n: '19.6',
        text: 'Stranki spore rešujeta sporazumno; sicer je pristojno stvarno pristojno sodišče po sedežu Izvajalca. Pri potrošnikih velja zakonsko določena pristojnost.',
      },
      {
        n: '19.7',
        text: 'Izvajalec skladno z Zakonom o izvensodnem reševanju potrošniških sporov ne priznava nobenega izvajalca izvensodnega reševanja potrošniških sporov kot pristojnega za reševanje potrošniškega spora iz teh pogojev.',
      },
      {
        n: '19.8',
        text: 'Potrošnik ima pri pogodbi, sklenjeni na daljavo, pravico, da v štirinajstih dneh od sklenitve pogodbe odstopi od nje brez navedbe razloga.',
      },
      {
        n: '19.9',
        text: 'Če potrošnik izrecno zahteva, da Izvajalec z izvedbo začne pred iztekom odstopnega roka, in izrecno potrdi, da je s tem seznanjen, pravica do odstopa preneha, ko je storitev v celoti opravljena. Če potrošnik odstopi po tem, ko se je izvedba na njegovo zahtevo že začela, Izvajalcu plača sorazmerni del že opravljenega dela.',
      },
      {
        n: '19.10',
        text: 'Če potrošnik izjave iz točke 19.9 ne poda, Izvajalec z izvedbo počaka do izteka odstopnega roka. Storitveni rok iz točke 8.2 v tem primeru začne teči z iztekom odstopnega roka.',
      },
    ],
  },
]

/**
 * THE POINTER TO THE APARTMENT TERMS. Since avgust 2026 the apartment document
 * is standalone and governs on its own whenever the customer was approached
 * with an akcijska ponudba for apartment services. A reader who arrived that
 * way must not read this document and assume it binds them, so this document
 * says so at the top and links across. Rendered by PogojiHero as a standing
 * note; the href is a machine identifier and stays ASCII.
 */
export const related = {
  label: 'Posebni pogoji za apartmaje',
  href: '/pogoji-apartmaji',
  note: 'Če vas je Izvajalec kontaktiral z akcijsko ponudbo za apartmajske storitve, za to naročilo ti splošni pogoji ne veljajo. Zanj veljajo posebni pogoji za apartmaje, ki so samostojen dokument:',
}

export const updated = { label: 'Različica', value: 'v1.1, osnutek, avgust 2026' }

/** In-page stops for this document. */
export const nav: NavItem[] = [
  { target: 'obseg', label: 'Obseg' },
  { target: 'roki', label: 'Roki' },
  { target: 'cene', label: 'Cene' },
]

export const ctaPrimary = { label: 'Odgovornost', target: 'odgovornost' }
