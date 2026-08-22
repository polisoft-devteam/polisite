// The letter shown once to a signed-in guest.
//
// Swedish only, and deliberately not in messages/*.json: it's a personal letter from a
// founder, not interface copy. Translating the jokes would produce something nobody wrote.

export const WELCOME_LETTER = {
  title: "Några ord från en av våra grundare",

  paragraphs: [
    "Om du läser detta så har snuten sprängt dörren, hittat min 5 petabyte-disk och jag sitter inne.",
    "Nej fan, jag bara skojar. Nu tar vi till en mer seriös ton.",
    "Som nu 30-åring och mer eller mindre nyskild har jag insett att manlig gemenskap är allt man har här i världen. Det bör inte försummas, eftersom vi alla sprider ut oss i olika delar av världen, Göteborg, Köpenhamn, London, Bjuv(?) kommer det bli viktigare än någonsin med ett strukturerat klibb som håller fast en så mysig grupp som denna.",
    "Ännu är livet fyllt med aktivitet, sprit och kvinnor. Men det kommer en dag är demensen kickar, knät inte klarar hockeyn, ens franska fru har gått bort efter en tragisk elskoterrelaterad simningsolycka i Högsbo.",
    "Kort sagt, vänskap och gemenskap är ett frö som jag i egenskap av förenings första självutnämda President, Seth Ruydell style, nu ska vattna och sköta med omsorg.",
    "Det första konkreta steget tänker jag ta i form av denna hemsida. Här kommer jag, och förhoppningsvis DU, skapa och schemalägga events.",
    "Det är redan en hel del i görningen. Tanken är att det ska vara events för oss men också nära och kära. Ingen kan komma på allt men alla kan komma på något, exempelvis en hund eller ett bord!",
    "Jag har stora planer för denna fina förening, fet merch, stående årsträff och resor. Kanske t.o.m. en gemensam aktiepool där vi sparar mot gemensam resa. Låt oss se vart detta tar oss.",
    "Jag säger, välkommen till föreningslivet, DITT medlemskap är redan bokat.",
  ],

  signature: "I hast, Victor Interassistsson",

  requestLabel: "Ansök om medlemskap",
  dismissLabel: "Uppfattat!",
  closeLabel: "Stäng",
} as const
