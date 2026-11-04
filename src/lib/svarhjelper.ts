import { kontaktperson } from './eksempeldata';

// En enkel hjelper som svarer på vanlige spørsmål døgnet rundt.
// Den kjenner bare igjen ord. Vet den ikke svaret, sender den spørsmålet videre til et menneske.
// Senere kan dette byttes ut med en ekte AI-hjelper.

type Svar = { ord: string[]; svar: string };

const svarliste: Svar[] = [
  {
    ord: ['avlys', 'avbestill', 'kan ikke komme'],
    svar: 'Gå til «Avtaler», trykk på avtalen og velg «Avlys avtalen». Hjelperen får beskjed med en gang. Avlys gjerne senest ett døgn før.',
  },
  {
    ord: ['flytt', 'endre tid', 'annen dag', 'annet tidspunkt'],
    svar: 'Gå til «Avtaler», trykk på avtalen og velg «Flytt til en annen tid».',
  },
  {
    ord: ['pris', 'kost', 'betal', 'vipps', 'gebyr', 'penger'],
    svar: 'Hjelpen koster 150 kr per time, pluss 29 kr i gebyr per bestilling. Du betaler med Vipps etter besøket, aldri med kontanter.',
  },
  {
    ord: ['trygg', 'sjekk', 'bankid', 'kjenner', 'hvem kommer'],
    svar: 'Alle hjelpere bekrefter seg med BankID, foresatte godkjenner dem, og teamet møter dem før første oppdrag. Du ser navn og bilde før besøket.',
  },
  {
    ord: ['bestill', 'hjelp med', 'handle', 'plen', 'hage'],
    svar: 'Trykk «Bestill hjelp» på forsiden. Velg hva du trenger, når det passer og hvor lenge. Du ser prisen før du sender.',
  },
  {
    ord: ['mor', 'far', 'nabo', 'for andre', 'for en annen'],
    svar: 'Trykk «Bestill for noen andre» på forsiden. Da skriver du inn navn og adresse til den som skal få hjelp.',
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
    svar: 'Pengene for oppdragene kommer til Vipps eller kontoen din den første i hver måned. Under «Utbetaling» i profilen ser du historikk og årsoversikt.',
  },
  {
    ord: ['adresse'],
    svar: 'Hjelperen ser bare området før avtalen er bekreftet. Den fulle adressen vises først når oppdraget er avtalt, og skjules igjen når det er ferdig.',
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
  { sporsmal: 'Hvordan avlyser jeg?', svar: svarliste[0].svar },
  { sporsmal: 'Er hjelperne trygge?', svar: svarliste[3].svar },
  { sporsmal: 'Hvem ser adressen min?', svar: svarliste[9].svar },
];
