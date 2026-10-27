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

Mac-en og mobilen må være på samme wifi.

## Hva som finnes nå

- Forside med tre store knapper: Bestill hjelp, Mine bestillinger og Kontakt oss.
- Bestilling i tre enkle steg: hva, når og en kort melding.
- Priser: 150 kr per time + 29 kr gebyr per bestilling.

Bestillingene lagres foreløpig bare på telefonen og forsvinner når appen lukkes.
Neste steg er å koble appen til Supabase, så hjelperne kan se og ta oppdrag.

## Mapper

- `src/app/` – skjermene i appen (hver fil er én skjerm)
- `src/components/` – deler som brukes flere steder, som de store knappene
- `src/lib/tema.ts` – farger, skrift, tekststørrelser og priser
