import { kontaktperson } from './kontaktinfo';

// En enkel hjelper som svarer på vanlige spørsmål døgnet rundt.
// Den kjenner bare igjen ord. Vet den ikke svaret, sender den spørsmålet videre til et menneske.
// Senere kan dette byttes ut med en ekte AI-hjelper.

type Svar = { ord: string[]; svar: string };

const svarliste: Svar[] = [
  {
    ord: ['slette annonse', 'slett annonse', 'fjerne annonse', 'avlys'],
    svar: 'Gå til «Mine annonser» og trykk «Slett» på annonsen. Da forsvinner den for alle med en gang.',
  },
  {
    ord: ['endre annonse', 'endre', 'rette', 'redigere'],
    svar: 'Gå til «Mine annonser» og trykk «Endre» på annonsen. Endringene vises for alle når du lagrer.',
  },
  {
    ord: ['pris', 'kost', 'betal', 'vipps', 'gebyr', 'penger'],
    svar: 'Vanlig pris for hjelp er 150 kr per time. Du skriver selv hva du vil betale i annonsen. Betaling i appen med Vipps kommer senere.',
  },
  {
    ord: ['trygg', 'sjekk', 'bankid', 'kjenner', 'hvem kommer'],
    svar: 'Du ser alltid hvem som har lagt ut en annonse. Senere skal alle hjelpere bekrefte seg med BankID. Er det noe som ikke føles riktig, trykk «Meld fra om annonsen».',
  },
  {
    ord: ['legge ut', 'legg ut', 'annonse', 'bestill', 'hjelp med'],
    svar: 'Trykk «Legg ut annonse» på forsiden. Skriv en kort tittel, så foreslår appen en kategori. Du ser annonsen før du publiserer.',
  },
  {
    ord: ['mor', 'far', 'nabo', 'for andre', 'for en annen'],
    svar: 'Du kan legge ut en annonse for mor, far eller en nabo. Skriv i beskrivelsen hvem hjelpen er til.',
  },
  {
    ord: ['slett', 'personvern', 'opplysning', 'data'],
    svar: 'Under «Profil» og «Mine opplysninger» ser du alt vi har lagret. Der kan du også slette kontoen din.',
  },
  {
    ord: ['tekst', 'større', 'ser dårlig', 'liten skrift'],
    svar: 'Under «Profil» kan du slå på «Større tekst». Da blir all tekst i appen større.',
  },
  {
    ord: ['utbetal', 'lønn', 'tjent', 'skatt'],
    svar: 'Utbetaling gjennom appen kommer senere. I testen avtaler dere betalingen selv.',
  },
  {
    ord: ['adresse'],
    svar: 'Ingen andre ser adressen din. Skriv bare området på annonsen, for eksempel «Sagene».',
  },
];

export function finnSvar(sporsmal: string) {
  const tekst = sporsmal.toLowerCase();
  const treff = svarliste.find((s) => s.ord.some((o) => tekst.includes(o)));
  if (treff) return treff.svar;
  return `Takk for spørsmålet! Det vet jeg ikke sikkert, så jeg har sendt det til ${kontaktperson.fornavn}. Du får svar her (${kontaktperson.apent.toLowerCase()}).`;
}

export const vanligeSporsmal = [
  { sporsmal: 'Hva koster det?', svar: svarliste[2].svar },
  { sporsmal: 'Hvordan sletter jeg en annonse?', svar: svarliste[0].svar },
  { sporsmal: 'Hvordan vet jeg hvem det er?', svar: svarliste[3].svar },
  { sporsmal: 'Hvem ser adressen min?', svar: svarliste[9].svar },
];
