// The letter shown once to a signed-in guest.
//
// One button, and it asks to join. Closing with the X leaves the question open, so the
// letter comes back next visit rather than being dismissed for good.
//
// Swedish only, and deliberately not in messages/*.json: it's a personal letter from a
// founder, not interface copy. Translating the jokes would produce something nobody wrote.

export const WELCOME_LETTER = {
  title: "Välkommen Poli och/eller Sverigevän!",

  paragraphs: [
    "Om du läser detta så har snuten sprängt dörren, hittat min 5 petabytedisk och jag sitter inne...",
    "Hehe där fick jag dig allt, bara lite skoj sådär...",
    "Nu undrar du säkert, vad är detta?",
    "Som nu 30-åring och mer eller mindre nyskild har jag insett att manlig gemenskap är fan det enda man har här i världen, när allt annat rämnat! Nu tänker du kanske: Nej fan, livet fyllt med aktivitet, sprit och IKEA-kvinnor.",
    "Men det kommer en dag när frugan sticker med barnen, demensen kickar in, knäet inte pallar hockeyn, ens franska fru har gått bort efter en tragisk elskoterrelaterad simningsolycka i Högsbo... vem vet? Inte du i alla fall.",
    "Med avstamp i detta förklarar jag lösningen till mitt och numera ditt problem: föreningslivet!",
    "Den här fina lilla webbappen är ett frö som jag, i egenskap av föreningens första självutnämnda President, Seth Ruydell style, nu ska vattna och sköta med omsorg!",
    "Här kommer jag, och förhoppningsvis DU, skapa och schemalägga events och annat mys. Tanken är liksom att formalisera och strukturera det vi redan har så att det håller hela vägen in i demensen.",
    "Jag har stora planer för denna fina Poli-förening: fet merch, stående årsträff och resor, grupptatuering? Kanske tom en gemensam aktiepool där vi sparar mot gemensam resa??",
    "Jag säger: välkommen till föreningslivet, DITT medlemskap är redan bokat.",
  ],

  signature: "I hast,\nVictor Interassistsson",

  pauseLabel: "Pausa",
  playLabel: "Spela",
  replayLabel: "Spela om",

  requestLabel: "Redan certified PoliBoy? Clicka här!",
  closeLabel: "Stäng",
} as const
