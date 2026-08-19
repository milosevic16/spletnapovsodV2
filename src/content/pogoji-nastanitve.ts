/**
 * Posebni pogoji za nastanitvene storitve — the STANDALONE document at
 * /pogoji-nastanitve.
 *
 * A SELF-CONTAINED CONTRACT, by the owner's call (avgust 2026). This was a
 * module that leaned on the general terms; it is now one complete document that
 * refers to no other. The trade-off is on the record: two standalone documents
 * restate the same clauses, and if one copy is updated and the other is not,
 * OZ 83 reads the resulting ambiguity against us, the drafter. Whoever edits a
 * shared clause here must edit it in src/content/pogoji.ts too. Nothing keeps
 * the two in step any more, so that is now a human duty.
 *
 * WHEN THIS DOCUMENT APPLIES — article 1, and the point of the rewrite: only
 * where the Naročnik was approached with an akcijska ponudba for accommodation
 * services, and only for the order made on that offer. Everything else falls to
 * the general terms, which carry a matching pointer here.
 *
 * THIS FILE IS GENERATED, NOT TYPED. The general provisions were ported
 * VERBATIM out of the evaluated pogoji.ts, so no legal text was retyped and
 * none could drift in transcription; the accommodation-specific articles were kept
 * as written; articles and clauses were renumbered in one pass; and the three
 * outward cross-references were repointed at this document's own articles. The
 * generator asserted that every cross-reference was hit and that no mention of
 * the general terms survives. Script: session scratchpad, gen-apt-terms.mjs.
 * Re-running it is NOT a maintenance path — it would overwrite later hand
 * edits. Edit this file directly from here on.
 *
 * WORKFLOW REWRITE (avgust 2026): the accommodation offer runs on a completely
 * different flow from the general terms — the owner mass-sends FREE design
 * previews on his own initiative, then, per agreement, one round of revisions
 * or none, then publishes on a demonstration address, and only after full
 * payment binds the site to the client's real domain and hands over. Article 8
 * carries this; 9.3, 11 and 13.2 were aligned to it, and article 2 gained the
 * defined terms (Predogled, Predstavitveni naslov, Dejanska domena). The same
 * pass fixed the cross-reference defects the audit found: 24.10 pointed at a
 * točka 19.9 that does not exist, and several references to »8.2« and »7./8.4.
 * členu« were left pointing at the wrong clause after the earlier renumbering.
 *
 * NOT A LEGAL SHIELD FOR THE OUTREACH. This document governs the Naročnik who
 * ACCEPTS. It cannot make the cold mass-mailing itself lawful (ZEKom-2 consent
 * for direct e-marketing), nor licence third-party listing photos used in a
 * preview, nor supply the GDPR basis for processing a prospect's data. Those
 * are the owner's decisions and a lawyer's review, flagged with the delivery.
 *
 * DRAFT: needs owner sign-off and a lawyer's review.
 */
import type { NavItem } from './home'
import type { Article } from './pogoji'

export const meta = {
  title: 'Posebni pogoji za nastanitvene storitve',
  description:
    'Pogoji za izdelavo spletnih strani za nastanitve in sobodajalce. Veljajo za naročila, sklenjena na podlagi akcijske ponudbe za nastanitvene storitve.',
}

export const hero = {
  kicker: 'Pravni dokumenti',
  title: 'Posebni pogoji za nastanitve',
  lead: 'Ti pogoji veljajo za izdelavo spletnih strani za nastanitve, in sicer za naročila, sklenjena na podlagi akcijske ponudbe za nastanitvene storitve. So samostojen dokument in ne napotujejo na druge pogoje poslovanja.',
}

export const articles: Article[] = [
  {
    id: "veljavnost",
    n: "1",
    title: "Veljavnost teh pogojev",
    clauses: [
      { n: "1.1", text: "Ti pogoji urejajo pravice in obveznosti med spodaj navedenim izvajalcem (v nadaljevanju: Izvajalec) in naročnikom storitev (v nadaljevanju: Naročnik) pri izdelavi in vzdrževanju spletnih strani za nastanitve, kot so apartmaji, sobe in počitniške hiše." },
      { n: "1.2", text: "Ti pogoji veljajo izključno za naročila, pri katerih je Izvajalec Naročnika kontaktiral z akcijsko ponudbo za nastanitvene storitve, in samo za naročilo, sklenjeno na podlagi te ponudbe. Za naročila, ki niso nastala na podlagi take akcijske ponudbe, ti pogoji ne veljajo." },
      { n: "1.3", text: "V akcijski ponudbi je vedno navedeno, da zanjo veljajo ti pogoji. Če ponudba tega ne navaja, ti pogoji za tisto naročilo ne veljajo." },
      { n: "1.4", text: "Ta dokument je samostojen in celovit. Za razmerja, za katera velja po prejšnjih odstavkih, se drugi pogoji poslovanja Izvajalca ne uporabljajo." },
      { n: "1.5", text: "Pogoji so sestavni del akcijske ponudbe, predračuna, naročila in pogodbe. Naročnik jih sprejme s podpisom pogodbe, s pisno ali elektronsko potrditvijo ponudbe ali s plačilom avansa, kar nastopi prej." },
      { n: "1.6", text: "Če je sklenjena posamična pisna pogodba, imajo njena določila prednost pred temi pogoji. Pogoji poslovanja Naročnika ne veljajo, razen če jih Izvajalec izrecno pisno sprejme." },
      { n: "1.7", text: "Za vprašanja, ki tu niso urejena, se uporablja veljavna zakonodaja Republike Slovenije, zlasti Obligacijski zakonik in predpisi o avtorski pravici." },
    ],
  },
  {
    id: "izrazi",
    n: "2",
    title: "Pomen izrazov",
    clauses: [
      { n: "2.1", text: "V teh pogojih imajo izrazi naslednji pomen:", items: ["Storitev: načrtovanje, oblikovanje, programiranje, migracija, optimizacija, vzdrževanje, gostovanje in podobne digitalne storitve.", "Specifikacija: ponudba ali popis del, ki opredeljuje obseg, funkcionalnosti, roke in ceno.", "Gradivo Naročnika: besedila, slike, logotipi, videi, podatki, dostopi in vse drugo, kar Naročnik posreduje Izvajalcu.", "Rezultat dela: spletno mesto, koda, oblikovne datoteke in drugi dogovorjeni izdelki.", "Delovni dan: vsak dan razen sobot, nedelj in dela prostih dni v Republiki Sloveniji.", "Predogled: brezplačen oblikovni predlog spletne strani, ki ga Izvajalec pripravi in posreduje na lastno pobudo v okviru akcijske ponudbe.", "Predstavitveni naslov: začasni spletni naslov, na katerem je stran objavljena za pregled Naročnika pred vezavo na dejansko domeno.", "Dejanska domena: domena Naročnika, na katero se stran veže po plačilu."] },
    ],
  },
  {
    id: "ponudba",
    n: "3",
    title: "Ponudba in sklenitev pogodbe",
    clauses: [
      { n: "3.1", text: "Ponudbe so neobvezujoče in veljajo 30 dni od izdaje, razen če je navedeno drugače." },
      { n: "3.2", text: "Cene in roki v ponudbi temeljijo na podatkih, ki jih posreduje Naročnik. Če se ti izkažejo za nepopolne ali napačne, ima Izvajalec pravico do prilagoditve ponudbe." },
      { n: "3.3", text: "Pogodba je sklenjena s pisno ali elektronsko potrditvijo naročila ali s plačilom avansa." },
      { n: "3.4", text: "Izvajalec ni zavezanec za DDV po prvem odstavku 94. člena Zakona o davku na dodano vrednost, zato DDV na računih ni obračunan. Navedene cene so končne." },
    ],
  },
  {
    id: "obseg",
    n: "4",
    title: "Obseg storitev",
    clauses: [
      { n: "4.1", text: "Natančen obseg je vedno določen v ponudbi ali specifikaciji. Kar tam ni navedeno, ni predmet pogodbe." },
      { n: "4.2", text: "Med storitve praviloma niso vključeni, razen ob posebnem dogovoru: zakup in podaljševanje domen, gostovanje, licence za tretje programske komponente, fotografije iz plačljivih bank, pisanje in lektoriranje vsebin, prevodi, oglaševalske kampanje, izobraževanje uporabnikov in poznejše vzdrževanje. Kar je v ponudbi ali paketu izrecno navedeno kot vključeno, je vključeno in ima prednost pred tem odstavkom." },
      { n: "4.3", text: "Izvajalec sme za izvedbo pritegniti podizvajalce." },
      { n: "4.4", text: "Izvajalec ni dolžan zagotavljati panožnega ali pravnega svetovanja. Njegova priporočila niso pravno mnenje; za vprašanja skladnosti mora Naročnik pridobiti ustrezen nasvet." },
      { n: "4.5", text: "Za vsebinsko pravno skladnost spletnega mesta odgovarja Naročnik. To vključuje zlasti vsebino politike zasebnosti, splošnih pogojev, obvestil o piškotkih in drugih pravnih besedil, pravno podlago za obdelavo osebnih podatkov, skladnost dejavnosti Naročnika s predpisi ter resničnost objavljenih navedb." },
      { n: "4.6", text: "Če Izvajalec Naročniku posreduje vzorec, predlogo ali predlog pravnega besedila, je to zgolj tehnični pripomoček in ne pravno mnenje. Izvajalec ne odgovarja za njegovo pravno ustreznost, popolnost, ažurnost ali skladnost z dejavnostjo Naročnika. Naročnik mora vsako tako besedilo pred objavo preveriti sam oziroma pri ustreznem strokovnjaku in ga prilagoditi svoji dejavnosti." },
      { n: "4.7", text: "Izvajalec ne odgovarja za pravne posledice objave besedil, ki jih je Naročnik prevzel po vzorcu Izvajalca in jih ni preveril." },
    ],
  },
  {
    id: "paketi",
    n: "5",
    title: "Paketi in obseg",
    clauses: [
      { n: "5.1", text: "Obseg posameznega paketa je določen v ponudbi in na predstavitveni strani ponudbe. Kar je v paketu izrecno navedeno kot vključeno, je vključeno; kar ni navedeno, ni predmet pogodbe." },
      { n: "5.2", text: "Prikaz zasedenosti, povpraševanje prek spletne strani in druge funkcionalnosti so vključeni le, če jih izbrani paket izrecno navaja." },
      { n: "5.3", text: "Izvajalec ne odgovarja za delovanje rezervacijskih platform tretjih oseb, za njihove provizije, pravila ali za povezavo z njimi, razen če je taka povezava izrecno dogovorjena v ponudbi." },
      { n: "5.4", text: "Naročnik odgovarja za točnost podatkov o nastanitvi, cenah, zasedenosti in pogojih bivanja, objavljenih na spletnem mestu, ter za njihovo sprotno posodabljanje." },
    ],
  },
  {
    id: "sodelovanje",
    n: "6",
    title: "Obveznosti in sodelovanje Naročnika",
    clauses: [
      { n: "6.1", text: "Naročnik pravočasno in v uporabni digitalni obliki zagotovi vsa gradiva, dostope in odobritve." },
      { n: "6.2", text: "Naročnik jamči, da ima za posredovana gradiva vse potrebne pravice, in Izvajalca v celoti razbremeni zahtevkov tretjih oseb iz tega naslova, vključno s stroški obrambe." },
      { n: "6.3", text: "Izvajalec ni dolžan preverjati gradiv Naročnika glede vsebinske ustreznosti, resničnosti ali morebitnih kršitev pravic tretjih." },
      { n: "6.4", text: "Naročnik določi kontaktno osebo s pooblastilom za odločanje in odzivom v petih delovnih dneh." },
      { n: "6.5", text: "Če Naročnik zamuja z gradivi ali odobritvami več kot 30 dni, sme Izvajalec projekt zamrzniti, zaračunati do tedaj opravljeno delo in ob nadaljevanju določiti nov rok." },
    ],
  },
  {
    id: "vsebine",
    n: "7",
    title: "Gradiva in fotografije nastanitve",
    clauses: [
      { n: "7.1", text: "Naročnik zagotovi fotografije nastanitve in besedila. Naročnik jamči, da ima za vsa posredovana gradiva vse potrebne pravice, tudi kadar so fotografije nastale v okviru sodelovanja s platformo ali s tretjim fotografom." },
      { n: "7.2", text: "Če Naročnik gradiv ne zagotovi, Izvajalec spletno mesto objavi z dogovorjeno začasno vsebino, roki iz 11. člena teh pogojev pa začnejo teči šele ob prejemu popolnih gradiv." },
      { n: "7.3", text: "Za oblikovni predogled sme Izvajalec uporabiti javno dostopne podatke o nastanitvi in lastna predstavitvena gradiva, izključno za prikaz videza strani. Pred objavo na dejanski domeni Naročnik zagotovi lastna gradiva po točki 7.1; gradiva, za katera Naročnik ne more zagotoviti potrebnih pravic, se pred objavo na dejanski domeni odstranijo ali nadomestijo." },
    ],
  },
  {
    id: "potek",
    n: "8",
    title: "Potek projekta",
    clauses: [
      { n: "8.1", text: "Akcijska ponudba se začne z brezplačnim oblikovnim predogledom, ki ga Izvajalec pripravi in posreduje na lastno pobudo. Predogled je predstavitev in ne obvezujoča ponudba; s posredovanjem ali ogledom predogleda ne nastane pogodba in nobena stranka iz tega naslova ni zavezana." },
      { n: "8.2", text: "Pogodba je sklenjena, ko Naročnik ponudbo potrdi na način iz točke 3.3. Šele s tem se začne delo, ki presega začetni predogled." },
      { n: "8.3", text: "Glede na paket oziroma dogovor je Naročnik upravičen do enega kroga popravkov na oblikovni predogled ali do nobenega. Kaj je vključeno, je navedeno v ponudbi. Morebitni dodatni popravki se obračunajo po urni postavki iz točke 13.1." },
      { n: "8.4", text: "Po potrditvi predogleda, s krogom popravkov ali brez njega, Izvajalec stran objavi na predstavitvenem naslovu, da jo Naročnik pregleda. Objava na predstavitvenem naslovu ne pomeni prenosa pravic; do celotnega plačila vse pravice na rezultatu dela ostanejo Izvajalcu po 16. členu." },
      { n: "8.5", text: "Ko Naročnik potrdi končno podobo strani, poravna dogovorjeno ceno po 13. členu. Po prejemu celotnega plačila Izvajalec stran veže na dejansko domeno Naročnika ter mu preda dostope in dogovorjena gradiva po 16. členu. Strošek domene se obračuna po 15. členu." },
      { n: "8.6", text: "Če Naročnik po predstavitvi predogleda ne poda jasnih usmeritev, sme Izvajalec oblikovne odločitve sprejeti po lastni strokovni presoji." },
      { n: "8.7", text: "Spremembe, ki jih Naročnik zahteva po potrditvi končne podobe strani, se obravnavajo kot sprememba obsega po 10. členu." },
    ],
  },
  {
    id: "popravki-apt",
    n: "9",
    title: "Popravki in vzdrževanje",
    clauses: [
      { n: "9.1", text: "Popravki so spremembe, kot so pozicija gumbov, zamenjava slik, barv ali pisave, in podobni posegi v obstoječo strukturo strani. Ne vključujejo novih funkcionalnosti ali celotne prenove grafične podobe." },
      { n: "9.2", text: "Če predlagana sprememba presega ta obseg, Izvajalec Naročnika o tem obvesti vnaprej in določi ceno glede na dodatno delo." },
      { n: "9.3", text: "Krogi popravkov na oblikovni predogled pred objavo so urejeni v 8. členu. Obseg morebitnih popravkov in vzdrževanja po objavi na dejanski domeni je določen v ponudbi za posamezni paket." },
    ],
  },
  {
    id: "spremembe",
    n: "10",
    title: "Spremembe obsega",
    clauses: [
      { n: "10.1", text: "Vsaka zahteva zunaj potrjene specifikacije je sprememba obsega. Izvajalec pripravi oceno stroška in vpliva na rok; delo se začne šele po potrditvi Naročnika." },
      { n: "10.2", text: "Izvajalec sme spremembo zavrniti, če ta bistveno posega v koncept ali arhitekturo rešitve." },
      { n: "10.3", text: "Zaradi vključevanja sprememb dogovorjeni roki ne veljajo več za zavezujoče." },
    ],
  },
  {
    id: "roki",
    n: "11",
    title: "Roki",
    clauses: [
      { n: "11.1", text: "Navedeni roki so okvirni, razen če so izrecno označeni kot fiksni ali če gre za storitvene roke iz točke 11.2." },
      { n: "11.2", text: "Izvajalec navaja naslednje storitvene roke:", items: ["Objava na predstavitvenem naslovu: praviloma v dveh delovnih dneh po potrditvi predogleda in po prejemu vseh dogovorjenih gradiv v uporabni digitalni obliki.", "Vezava na dejansko domeno: v dveh delovnih dneh po prejemu celotnega plačila.", "Manjši popravki: 24 ur v delovnem času, od prejema jasno opisane zahteve in gradiv.", "Odziv na povpraševanje: en delovni dan."] },
      { n: "11.3", text: "Izvajalec si pridržuje pravico, da rok iz točke 11.2 podaljša, če je obseg zahtevanih sprememb, popravkov ali želja Naročnika večji od obsega, na katerem navedeni rok temelji. Pravica velja za vse roke iz točke 11.2. Izvajalec Naročnika o podaljšanju in o novem roku obvesti brez nepotrebnega odlašanja, praviloma pred iztekom prvotnega roka." },
      { n: "11.4", text: "Manjši popravki so spremembe, kot so pozicija gumbov, zamenjava slik, barv ali pisave, in podobni posegi v obstoječo strukturo strani. Ne vključujejo novih funkcionalnosti ali celotne prenove grafične podobe. Zahteve, ki presegajo ta obseg, se obravnavajo kot sprememba obsega po 10. členu; obračunajo se kot dodaten krog popravkov po točki 8.3 ali po urni postavki, kot je določeno v oceni iz točke 10.1. Zanje roki iz točke 11.2 ne veljajo." },
      { n: "11.5", text: "Rok se podaljša za čas zamude Naročnika pri gradivih, odobritvah ali plačilih, in za čas trajanja višje sile." },
      { n: "11.6", text: "Zamuda Naročnika ne odloži dogovorjenih plačilnih rokov." },
    ],
  },
  {
    id: "prevzem",
    n: "12",
    title: "Prevzem",
    clauses: [
      { n: "12.1", text: "Po obvestilu o dokončanju ima Naročnik deset delovnih dni za pregled in pisno prijavo bistvenih odstopanj od specifikacije." },
      { n: "12.2", text: "Če v tem roku ne prijavi napak ali če rezultat začne uporabljati v produkcijskem okolju, se šteje, da je delo prevzeto. Objava spletnega mesta na domeni Naročnika se šteje za začetek uporabe." },
      { n: "12.3", text: "Manjše pomanjkljivosti, ki bistveno ne ovirajo uporabe, ne zadržijo prevzema; Izvajalec jih odpravi v razumnem roku." },
    ],
  },
  {
    id: "cene",
    n: "13",
    title: "Cene in plačilni pogoji",
    clauses: [
      { n: "13.1", text: "Cena je določena v ponudbi kot pavšal, individualno glede na obseg projekta. Cena je Naročniku znana vnaprej. Kadar se posamezno delo obračuna po urni postavki, zlasti dodatni krogi popravkov po točki 8.3 in opravila v zvezi z domeno po točki 14.4, velja urna postavka, ki jo Izvajalec sporoči vnaprej in pred začetkom takega dela." },
      { n: "13.2", text: "Storitev se plača v celoti, ko Naročnik potrdi končno podobo strani; avans praviloma ni potreben. Po prejemu celotnega plačila Izvajalec stran veže na dejansko domeno in preda dostope po 16. členu." },
      { n: "13.3", text: "Plačilni rok je 14 dni od izdaje računa, razen če je v ponudbi določeno drugače." },
      { n: "13.4", text: "Ob zamudi tečejo zakonske zamudne obresti, Izvajalec pa lahko po pisnem opominu zadrži nadaljnje delo, storitve, vezavo na dejansko domeno ali predajo dostopov do poravnave. Naročnik krije razumne stroške izterjave." },
      { n: "13.5", text: "Ponavljajoče se storitve se obračunavajo vnaprej in se samodejno podaljšujejo, če niso odpovedane vsaj 30 dni pred iztekom obdobja. Naročnika Izvajalec na podaljšanje pisno opozori pred iztekom odpovednega roka." },
      { n: "13.6", text: "Izvajalec sme cene ponavljajočih se storitev prilagoditi enkrat letno z najmanj 60-dnevnim predhodnim obvestilom; Naročnik ima v tem primeru pravico do odpovedi brez stroškov." },
      { n: "13.7", text: "Pobot z nasprotnimi terjatvami je dopusten le, če so te nesporne ali pravnomočno ugotovljene." },
    ],
  },
  {
    id: "domena",
    n: "14",
    title: "Domena, gostovanje in vzdrževanje",
    clauses: [
      { n: "14.1", text: "Domena se registrira v imenu in za račun Naročnika. Za registracijo in podaljševanje veljajo pravila pristojnega registra, ki jih Naročnik sprejme." },
      { n: "14.2", text: "Zakup domene v nobenem primeru ni vključen v ceno storitve. V ceno je vključena le tehnična nastavitev domene in njena vezava na spletno mesto. Strošek registracije in vsakoletnega podaljšanja krije Naročnik." },
      { n: "14.3", text: "Podaljševanje domene je obveznost Naročnika. Izvajalec priporoča, da Naročnik podaljševanje uredi sam neposredno pri registrarju in da poskrbi za veljavne kontaktne podatke ter način plačila pri registrarju." },
      { n: "14.4", text: "Če Naročnik podaljšanje domene ali druga opravila v zvezi z domeno prenese na Izvajalca, se ta opravila obračunajo po urni postavki iz točke 13.1 oziroma po dogovorjenem ceniku, poleg stroška podaljšanja pri registrarju. Izvajalec teh opravil ni dolžan izvesti brez predhodnega dogovora." },
      { n: "14.5", text: "Izvajalec ne odgovarja za posledice poteka domene, do katerega pride, ker Naročnik podaljšanja ni uredil pravočasno, in ne spremlja rokov podaljšanja, razen če je to izrecno dogovorjeno." },
      { n: "14.6", text: "Kadar spletno mesto gostuje pri tretjem ponudniku, veljajo tudi pogoji in raven storitve tega ponudnika. Izvajalec ne jamči določene letne razpoložljivosti gostovanja in ne odgovarja za izpade na strani tretjega ponudnika." },
      { n: "14.7", text: "Koda in vsebina spletnega mesta se vodita v sistemu za nadzor različic, iz katerega je mogoča obnovitev. To Naročnika ne razbremeni obveznosti hranjenja lastnih kopij podatkov, ki jih sam vnaša." },
      { n: "14.8", text: "Obseg vzdrževanja je določen v ponudbi. Podpora je na voljo v delovnem času med delovniki." },
      { n: "14.9", text: "Če Naročnik zapadlih ponavljajočih se storitev ne poravna v 30 dneh, sme Izvajalec storitev začasno onemogočiti, po nadaljnjih 90 dneh pa odstopiti od pogodbe, o čemer Naročnika predhodno pisno obvesti." },
    ],
  },
  {
    id: "domena-apt",
    n: "15",
    title: "Domena pri nastanitvenih paketih",
    clauses: [
      { n: "15.1", text: "Tudi kadar paket vključuje registracijo in vezavo domene, zakup domene ni vključen v ceno. Vključena je le tehnična nastavitev in vezava na spletno mesto." },
      { n: "15.2", text: "Ceno domene določa registrar in jo Izvajalec Naročniku sporoči, preden domeno registrira. Strošek prvega zakupa in vsakoletnega podaljšanja krije Naročnik." },
      { n: "15.3", text: "Za podaljševanje domene in za posledice njenega poteka veljajo določbe 14. člena teh pogojev." },
    ],
  },
  {
    id: "pravice",
    n: "16",
    title: "Pravice intelektualne lastnine",
    clauses: [
      { n: "16.1", text: "Do celotnega plačila vse pravice na rezultatu dela ostanejo Izvajalcu." },
      // Same licence decision as the general terms 11.2 (owner, avgust 2026):
      // NON-EXCLUSIVE. Applied here so the two documents cannot say different
      // things about the same grant — and it would be backwards for the cheaper
      // promotional offer to hand over more than the general terms do.
      { n: "16.2", text: "Po celotnem plačilu Naročnik pridobi neizključno ter časovno in krajevno neomejeno pravico do uporabe dogovorjenega rezultata dela za lastne poslovne namene, vključno s pravico do predelave. Ta pravica ne posega v pravice Izvajalca iz točk 16.3, 16.5 in 16.6." },
      { n: "16.3", text: "Prenos se ne nanaša na predhodno obstoječe znanje, ogrodja, knjižnice, interna orodja, skripte, delovne predloge in ponovno uporabljive komponente Izvajalca. Naročnik zanje prejme trajno neizključno licenco v obsegu, potrebnem za uporabo rezultata." },
      { n: "16.4", text: "Komponente tretjih oseb so podvržene svojim licencam. Izvajalec Naročnika obvesti, kadar so potrebne plačljive licence; te niso zajete v ceni, razen če je dogovorjeno drugače." },
      { n: "16.5", text: "Zavrnjeni ali nerealizirani osnutki ostanejo v celoti last Izvajalca." },
      { n: "16.6", text: "Izvajalec sme rezultat dela navesti med referencami in ga uporabiti v predstavitvenih gradivih. Naročnik lahko to pravico pisno izključi." },
      { n: "16.7", text: "Navedba avtorstva v nogi spletnega mesta je dogovorjena in je njena odstranitev kršitev pogodbe. Pred sklenitvijo pogodbe se je na željo Naročnika mogoče odplačno dogovoriti, da se navedba avtorstva opusti." },
      { n: "16.8", text: "Po celotnem plačilu se izvorne datoteke in izvorna koda na željo Naročnika predajo Naročniku." },
    ],
  },
  {
    id: "jamstvo",
    n: "17",
    title: "Jamstvo za napake",
    clauses: [
      { n: "17.1", text: "Izvajalec jamči, da bo rezultat dela ob prevzemu vsebinsko ustrezal potrjeni specifikaciji." },
      { n: "17.2", text: "Jamstveni rok s temi pogoji ni podaljšan; veljajo zakonski roki. Za Naročnika, ki je potrošnik, veljajo v celoti zakonske pravice iz naslova neskladnosti po Zakonu o varstvu potrošnikov, ki jih ta dokument ne omejuje in ne skrajšuje. Za Naročnika, ki ni potrošnik, veljajo pravila o odgovornosti za napake po Obligacijskem zakoniku. V jamstvenem roku Izvajalec brezplačno odpravi napake, ki so posledica njegovega dela; brezplačna odprava napak ni isto kot plačljivi popravki in spremembe po točki 11.4." },
      { n: "17.3", text: "Jamstvo ne velja za posege Naročnika ali tretjih v kodo ali sistem, spremembe pri zunanjih ponudnikih in vmesnikih, opustitev priporočenih varnostnih posodobitev, napake gostovanja, ki ga Izvajalec ne upravlja, ter za vsebine, ki jih vnaša Naročnik." },
      { n: "17.4", text: "Združljivost je zagotovljena za zadnji dve različici razširjenih brskalnikov v času prevzema. Odstopanja zaradi posameznih nastavitev naprav, vtičnikov ali operacijskih sistemov niso napaka." },
      { n: "17.5", text: "Izvajalec jamči za tehnično zasnovo, ki jo izvede sam: vnaprej izrisan HTML, strukturirane podatke, dostopnost vsebine iskalnikom in jezikovnim modelom brez izvajanja skript ter skladnost s Core Web Vitals po stanju ob izročitvi." },
      { n: "17.6", text: "Izvajalec ne jamči za konkretne poslovne rezultate, zlasti ne za uvrstitve v iskalnikih, obseg obiska, konverzije, prodajo ali prikaz strani v odgovorih umetne inteligence. Ti so odvisni od dejavnikov zunaj nadzora Izvajalca, med drugim od zunanjih povezav na spletno mesto Naročnika, konkurence v panogi, vsebine, ki jo objavlja Naročnik, njegove siceršnje prisotnosti na spletu ter od algoritmov in politik iskalnikov in ponudnikov jezikovnih modelov, ki se lahko kadar koli spremenijo." },
      { n: "17.7", text: "Izvajalec sme napako odpraviti tudi tako, da zagotovi enakovredno rešitev." },
    ],
  },
  {
    id: "odgovornost",
    n: "18",
    title: "Odgovornost",
    clauses: [
      { n: "18.1", text: "Izvajalec neomejeno odgovarja za škodo, povzročeno naklepno ali iz hude malomarnosti, ter za škodo na življenju, telesu in zdravju. Kogentnih zakonskih odgovornosti ta člen ne izključuje." },
      { n: "18.2", text: "Pri lahki malomarnosti odgovarja le za kršitev bistvenih pogodbenih obveznosti, in sicer do višine predvidljive, pogodbi značilne škode." },
      { n: "18.3", text: "Odgovornost za posredno škodo, zlasti izgubljeni dobiček, izpad prihodka, izgubo podatkov in poslovni ugled, je izključena v obsegu, ki ga zakon dopušča." },
      { n: "18.4", text: "Skupna odgovornost Izvajalca je omejena na znesek, ki ga je Naročnik plačal za posamezni projekt oziroma za storitev, iz katere zahtevek izvira." },
      { n: "18.5", text: "Izvajalec ne odgovarja za vsebine, ki jih objavi Naročnik, za izpade pri zunanjih ponudnikih, za posledice kibernetskih napadov brez svoje krivde ter za spremembe algoritmov ali politik tretjih platform." },
      { n: "18.6", text: "Zahtevke je treba uveljaviti v 12 mesecih od nastanka škode. Ta rok ne velja za Naročnike, ki so potrošniki, in ne posega v zakonske roke, ki jih ni mogoče skrajšati." },
    ],
  },
  {
    id: "osebni-podatki",
    n: "19",
    title: "Varstvo osebnih podatkov",
    clauses: [
      { n: "19.1", text: "Obe pogodbeni stranki ravnata skladno s Splošno uredbo o varstvu podatkov in nacionalno zakonodajo." },
      { n: "19.2", text: "Kadar Izvajalec obdeluje osebne podatke v imenu Naročnika, stranki skleneta pogodbo o obdelavi podatkov po 28. členu Splošne uredbe. Naročnik je upravljavec, Izvajalec obdelovalec." },
      { n: "19.3", text: "Naročnik je seznanjen s podobdelovalci, ki jih Izvajalec uporablja pri izvedbi, in Izvajalec ga o spremembah pravočasno obvesti." },
      { n: "19.4", text: "Izvajalec izvaja primerne tehnične in organizacijske ukrepe ter Naročnika brez nepotrebnega odlašanja obvesti o kršitvi varstva osebnih podatkov." },
      { n: "19.5", text: "Izvajalec zagotavlja tehnično izvedbo: vgradnjo mehanizmov za privolitve, tehnično pravilno umestitev pravnih besedil na spletno mesto, varen prenos podatkov iz obrazcev in druge tehnične ukrepe, dogovorjene v specifikaciji." },
    ],
  },
  {
    id: "zaupnost",
    n: "20",
    title: "Zaupnost",
    clauses: [
      { n: "20.1", text: "Stranki poslovnih skrivnosti druge stranke ne razkrivata tretjim in jih uporabljata le za izvedbo pogodbe." },
      { n: "20.2", text: "Obveznost velja tri leta po prenehanju pogodbe, za poslovne skrivnosti pa dokler ohranijo ta status." },
      { n: "20.3", text: "Izjeme so javno znane informacije, samostojno razviti podatki in razkritja, zahtevana z zakonom ali odločbo organa." },
    ],
  },
  {
    id: "visja-sila",
    n: "21",
    title: "Višja sila",
    clauses: [
      { n: "21.1", text: "Nobena stranka ne odgovarja za neizpolnitev zaradi dogodkov zunaj njenega razumnega nadzora, kot so naravne nesreče, vojna, stavka, epidemija, obsežni izpadi omrežij ali energije in ukrepi oblasti." },
      { n: "21.2", text: "Če stanje traja več kot 60 dni, lahko katera koli stranka odstopi od pogodbe; do tedaj opravljeno delo se obračuna." },
    ],
  },
  {
    id: "trajanje",
    n: "22",
    title: "Trajanje, odpoved in odstop",
    clauses: [
      { n: "22.1", text: "Projektna pogodba preneha z izpolnitvijo. Naročniška razmerja se sklepajo za obdobje 12 mesecev s samodejnim podaljševanjem in odpovednim rokom 30 dni pred iztekom." },
      { n: "22.2", text: "Ob odstopu Naročnika med izvedbo Naročnik plača do tedaj opravljeno delo in dejansko nastale stroške. Že plačani avans se všteje v to plačilo; če avans presega vrednost do tedaj opravljenega dela in stroškov, Izvajalec razliko vrne. Ta točka ne posega v pravice potrošnikov iz točk 24.8 do 24.10." },
      { n: "22.3", text: "Vsaka stranka lahko odstopi iz utemeljenega razloga, če druga stranka bistveno krši pogodbo in kršitve ne odpravi v 14 dneh po pisnem opominu." },
      { n: "22.4", text: "Ob prenehanju Izvajalec proti plačilu vseh zapadlih obveznosti izroči podatke, vsebine in dostope v standardni obliki. Podatke hrani še 30 dni, nato jih sme izbrisati." },
    ],
  },
  {
    id: "potrosniki",
    n: "23",
    title: "Naročniki, ki so potrošniki",
    clauses: [
      { n: "23.1", text: "Sobodajalec, ki naroča storitev v okviru registrirane dejavnosti, ni potrošnik. Fizična oseba, ki storitev naroči zunaj svoje poslovne dejavnosti, je potrošnik in zanjo veljajo določbe 24. člena teh pogojev o odstopu od pogodbe." },
      { n: "23.2", text: "Ker je storitev praviloma opravljena v nekaj delovnih dneh, Izvajalec potrošnika pred začetkom izvedbe pozove, naj poda izjavo o takojšnjem začetku izvedbe. Brez te izjave se z izvedbo počaka do izteka odstopnega roka." },
    ],
  },
  {
    id: "sklepne",
    n: "24",
    title: "Sklepne določbe",
    clauses: [
      { n: "24.1", text: "Izvajalec sme te pogoje spremeniti. Pri trajnih razmerjih Naročnika obvesti najmanj 30 dni pred uveljavitvijo; če Naročnik sprememb ne sprejme, lahko odpove pogodbo z učinkom na dan uveljavitve." },
      { n: "24.2", text: "Za projekte veljajo pogoji v različici, veljavni ob sklenitvi pogodbe." },
      { n: "24.3", text: "Neveljavnost posameznega določila ne vpliva na veljavnost preostalih; nadomesti se z veljavnim določilom, ki je najbližje gospodarskemu namenu." },
      { n: "24.4", text: "Prenos pogodbe na tretjo osebo je mogoč le s pisnim soglasjem druge stranke; Izvajalec sme pogodbo prenesti v primeru statusnega preoblikovanja." },
      { n: "24.5", text: "Za pogodbo velja pravo Republike Slovenije, brez kolizijskih pravil in brez Dunajske konvencije o mednarodni prodaji blaga." },
      { n: "24.6", text: "Stranki spore rešujeta sporazumno; sicer je pristojno stvarno pristojno sodišče po sedežu Izvajalca. Pri potrošnikih velja zakonsko določena pristojnost." },
      { n: "24.7", text: "Izvajalec skladno z Zakonom o izvensodnem reševanju potrošniških sporov ne priznava nobenega izvajalca izvensodnega reševanja potrošniških sporov kot pristojnega za reševanje potrošniškega spora iz teh pogojev." },
      { n: "24.8", text: "Potrošnik ima pri pogodbi, sklenjeni na daljavo, pravico, da v štirinajstih dneh od sklenitve pogodbe odstopi od nje brez navedbe razloga." },
      { n: "24.9", text: "Če potrošnik izrecno zahteva, da Izvajalec z izvedbo začne pred iztekom odstopnega roka, in izrecno potrdi, da je s tem seznanjen, pravica do odstopa preneha, ko je storitev v celoti opravljena. Če potrošnik odstopi po tem, ko se je izvedba na njegovo zahtevo že začela, Izvajalcu plača sorazmerni del že opravljenega dela." },
      { n: "24.10", text: "Če potrošnik izjave iz točke 24.9 ne poda, Izvajalec z izvedbo počaka do izteka odstopnega roka. Storitveni roki iz točke 11.2 v tem primeru začnejo teči z iztekom odstopnega roka." },
    ],
  },
]

export const updated = { label: 'Različica', value: 'v2.0, osnutek, avgust 2026' }

export const nav: NavItem[] = [
  { target: 'veljavnost', label: 'Veljavnost' },
  { target: 'paketi', label: 'Paketi' },
  { target: 'popravki-apt', label: 'Popravki' },
]

export const ctaPrimary = { label: 'Potrošniki', target: 'potrosniki' }
