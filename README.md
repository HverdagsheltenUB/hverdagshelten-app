# Hverdagshelten-appen

*En hjelpende hånd.* Appen der eldre i nærmiljøet kan bestille hjelp fra ungdom.

Laget med [Expo](https://expo.dev) (React Native), så den virker på både iPhone og Android.

## Slik prøver du appen på mobilen

**Testere (for eksempel Didrik):**

1. Last ned **Expo Go** fra App Store eller Google Play.
2. Åpne lenken eller skann QR-koden fra siste oppdatering på expo.dev (se under).
3. Trykk «Kom i gang» → «Opprett bruker», og lag din egen bruker med e-post og passord.

Alle brukere deler den samme databasen (Supabase), så alle ser de samme annonsene.

**Publisere en ny versjon** (fra Mac-en, i denne mappen):

```bash
git pull
npm install
npx eas-cli@latest update --branch test --environment production --message "Hva er nytt"
```

Kommandoen skriver ut en lenke til oppdateringen på expo.dev. Der finner du QR-koden testerne skanner. Mac-en trenger ikke stå på etterpå.

**Kjøre lokalt mens du utvikler:** `npx expo start`, og skann QR-koden (mobilen må være på samme wifi).

## Database (Supabase)

- Prosjekt: `pbwkfdugczwksvvrnekp` (EU). Adressen og den offentlige nøkkelen står i `src/lib/konfig.ts`.
- Tabeller, regler og bildelagring lages med `supabase/oppsett.sql` (lim inn i SQL Editor og trykk Run). Den kan kjøres flere ganger.
- «Confirm email» er slått av under Authentication, så nye brukere kan logge inn med en gang.
- `node scripts/test-supabase.mjs` tester registrering, innlogging, annonser, bilder og at ingen kan endre andres annonser. Den lager to testbrukere og sletter dem etterpå.
- Meldinger fra «Meld fra» havner i tabellen `rapporter`, som bare teamet ser i Supabase.

## Hva som finnes nå

- **Innlogging:** opprett bruker eller logg inn med e-post og passord. Vipps og BankID vises som «Kommer snart».
- **Annonser:** to typer i samme løsning: «Trenger hjelp» (handling, hage, besøk og mer) og ting som selges eller gis bort. Ingen ferdigutfylte annonser.
- **Legg ut annonse:** bilder (opptil 6, fra telefonen eller kameraet), tittel, kategori (foreslås automatisk ut fra tittelen), beskrivelse, pris eller «gis bort», tilstand, størrelse, sted og levering. Bare tittel og kategori må fylles ut, og felt som ikke passer kategorien, vises ikke. Forhåndsvisning før publisering, og utkastet lagres mens du skriver.
- **Forsiden:** alle annonser, søk, filter for type og kategori, og ryddige beskjeder når det ikke finnes noe.
- **Mine annonser:** endre og slette egne annonser. Andres annonser kan bare leses (og meldes fra om).
- **Profil:** navn, område og rolle, større tekst, retningslinjer og quiz for hjelpere, personvern, «Mine opplysninger» med sletting av kontoen, og utlogging.

Ikke med ennå: meldinger mellom brukere, Vipps, BankID og betaling. Den gamle bestillingsflyten med eksempelavtaler er fjernet og kan bygges opp igjen på databasen senere.

## Mapper

- `src/app/` – skjermene i appen (hver fil er én skjerm)
- `src/skjermer/` – større skjermdeler, som skjemaet for annonser
- `src/components/` – deler som brukes flere steder, som knapper, kort og skrivefelt
- `src/lib/annonser.ts` – kategorier, lesing og lagring av annonser og bilder
- `src/lib/konto.tsx` – innlogging og profil
- `src/lib/tema.ts` – farger, skrift og tekststørrelser
- `src/lib/tekster.ts` – tekstene i personvern, vilkår og retningslinjer (utkast)
- `supabase/oppsett.sql` – databasen
