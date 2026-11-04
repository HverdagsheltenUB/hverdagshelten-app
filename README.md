# Hverdagshelten-appen

*En hjelpende hånd.* Appen der eldre i nærmiljøet kan bestille hjelp fra ungdom.

Laget med [Expo](https://expo.dev) (React Native), så den virker på både iPhone og Android.

## Slik prøver du appen på mobilen

1. Last ned **Expo Go** fra App Store eller Google Play.
2. Åpne **Terminal** på Mac-en og skriv:
   ```bash
   cd hverdagshelten-app
   npm install
   npx expo start
   ```
3. Skann QR-koden som kommer opp, med kameraet (iPhone) eller i Expo Go (Android).

Mac-en og mobilen må være på samme wifi. Vil du dele appen uten at Mac-en står på, publiser med `npx eas-cli@latest update`.

## Hva som finnes nå

Alt bruker eksempeldata som lagres på telefonen. Vipps, BankID, SMS og betaling er bare later-som foreløpig.

**Oppstart:** velkomst med logo og slagord, velg rolle, logg inn med Vipps, BankID og godkjenning fra foresatt (ungdom), godta vilkår og personvern, og en kort omvisning.

**For de eldre:**
- Bestill hjelp i tre steg, eller for noen andre (mor, far, nabo) i fire steg, med samtykke fra den som skal få hjelp.
- «Noe annet» med fritt tekstfelt. Varighet 1, 1,5, 2 eller 3 timer (minst 1 time). Prisen vises før du sender.
- Handleliste med bilde, beskjed til hjelperen, «gjenta hver uke» og «samme hjelper som sist».
- Avtaler med status (Sendt, Bekreftet, Ferdig, Avlyst), hvem som kommer, «Sjekket av Hverdagshelten», flytt og avlys med bekreftelse.
- Betal med Vipps etter besøket (også av pårørende), kvittering, utlegg for varer, stjerner og en kort takk, «Bestill igjen».
- Profil med «Større tekst», varsler, ting hjelperen bør vite og pårørende.

**For ungdommene:**
- Ledige oppdrag med filter. Før oppdraget er avtalt, vises bare området og avrundet avstand.
- Full adresse, «Vis veien» (åpner Google Maps) og telefonnummer vises bare når oppdraget er ditt, og skjules igjen når det er ferdig.
- «Jeg er på vei», «Oppdraget er ferdig» (med kvittering for handling), avlysning med 24-timersregel.
- Quiz før første oppdrag, retningslinjer, utbetaling med historikk og årsoversikt, «Når kan jeg hjelpe?» og foresatte med grenser.

**Trygghet og hjelp:** «Hjelp»-knapp øverst på alle skjermer, kontaktperson med chat og automatiske svar på vanlige spørsmål, «Meld fra om noe», nødknapp for 113, personvern, brukervilkår, «Mine opplysninger» med sletting av kontoen, og opplesing av tekst.

**For teamet:** teamvisning (fra Profil, under «For testing») med bestillinger, godkjenning av nye hjelpere, meldinger og nøkkeltall.

## Mapper

- `src/app/` – skjermene i appen (hver fil er én skjerm)
- `src/skjermer/` – fanene i eldre- og ungdomsversjonen
- `src/components/` – deler som brukes flere steder, som knapper, kort og skrivefelt
- `src/lib/tema.ts` – farger, skrift, tekststørrelser, priser og regler
- `src/lib/eksempeldata.ts` – eksempeldata til testversjonen
- `src/lib/tekster.ts` – tekstene i personvern, vilkår og retningslinjer (utkast)
