import { kontaktEpost } from './kontaktinfo';
import { priser, regler } from './tema';

// Tekstene på infosidene. Skrevet enkelt, uten juridiske ord der det går.
// Dette er et utkast. En voksen med juridisk kunnskap bør lese det før appen åpnes for ekte brukere.

export type Infoside = {
  tittel: string;
  ingress: string;
  seksjoner: { tittel: string; avsnitt?: string[]; punkter?: string[] }[];
  utkast?: boolean;
};

export const ikkeLov = [
  'Håndtere bankkort, PIN-koder eller nettbank',
  'Gi eller håndtere medisiner',
  'Personlig stell, som dusj eller påkledning',
  'Kjøre bil',
  'Gå på stige eller tak',
  'Bruke farlig verktøy, som motorsag eller hekksaks',
  'Løfte tunge ting alene',
  'Ta imot kontanter',
];

export const infosider: Record<string, Infoside> = {
  personvern: {
    tittel: 'Personvern',
    ingress:
      'Slik tar vi vare på opplysningene dine. Kort fortalt: vi lagrer bare det vi trenger, og selger aldri noe.',
    utkast: true,
    seksjoner: [
      {
        tittel: 'Hvem er ansvarlig?',
        avsnitt: [
          `Hverdagshelten (ungdomsbedrift) er ansvarlig for opplysningene i appen. Har du spørsmål, kan du skrive til oss i appen eller sende e-post til ${kontaktEpost}.`,
        ],
      },
      {
        tittel: 'Hva lagrer vi, og hvorfor?',
        punkter: [
          'Navn, e-post og område, så du har en egen konto og andre vet hvem som har lagt ut en annonse.',
          'Passordet ditt, kryptert. Ingen i teamet kan lese det.',
          'Annonsene og bildene du legger ut, så andre i nabolaget kan se dem.',
          'Det du melder fra om, så teamet kan følge det opp.',
        ],
      },
      {
        tittel: 'Dette ber vi aldri om',
        punkter: ['Fødselsnummer', 'Helseopplysninger eller medisiner', 'Bankkort eller PIN-kode'],
      },
      {
        tittel: 'Hvem ser hva?',
        punkter: [
          'Alle som er logget inn, ser annonsene, navnet ditt og området du har skrevet på annonsen.',
          'E-postadressen din vises aldri til andre brukere.',
          'Teamet ser det vi trenger for å hjelpe deg og følge opp hvis noe går galt.',
        ],
      },
      {
        tittel: 'Hvor lagres det?',
        avsnitt: [
          'Opplysningene lagres hos Supabase på servere i EU. Vi har databehandleravtale med alle tjenester vi bruker.',
        ],
      },
      {
        tittel: 'Hvor lenge?',
        punkter: [
          'Annonser ligger ute til du sletter dem.',
          'Sletter du kontoen, sletter vi profilen, annonsene og bildene dine med en gang.',
        ],
      },
      {
        tittel: 'Dine rettigheter',
        punkter: [
          'Se alt vi har lagret om deg (under «Mine opplysninger»).',
          'Rette det som er feil.',
          'Slette kontoen din når som helst.',
          'Klage til Datatilsynet hvis du mener vi gjør noe galt.',
        ],
        avsnitt: ['Vi svarer på alle spørsmål om personvern innen 30 dager.'],
      },
      {
        tittel: 'Barn og ungdom',
        avsnitt: [
          `Hjelpere under 18 år må ha samtykke fra en foresatt, både for å bruke appen og for å ta oppdrag. Du må være minst ${regler.minsteAlder} år.`,
        ],
      },
      {
        tittel: 'Bestille for andre',
        avsnitt: ['Bestiller du for noen andre, må du bekrefte at personen vet om det og har sagt ja.'],
      },
    ],
  },
  vilkar: {
    tittel: 'Brukervilkår',
    ingress: 'Det viktigste du må vite når du bruker Hverdagshelten.',
    utkast: true,
    seksjoner: [
      {
        tittel: 'Hva Hverdagshelten er',
        avsnitt: [
          'Hverdagshelten er en formidler. Vi setter eldre som trenger litt hjelp i kontakt med ungdom i nabolaget som vil hjelpe. Vi sjekker hjelperne og passer på at betalingen går riktig for seg.',
        ],
      },
      {
        tittel: 'Hva vi har ansvar for',
        punkter: [
          'At hjelperne er bekreftet med BankID og godkjent av foresatte og teamet.',
          'At prisen er tydelig før du bestiller, og at du får kvittering.',
          'At opplysningene dine behandles trygt.',
          'Å følge opp raskt hvis du melder fra om noe.',
        ],
      },
      {
        tittel: 'Hva vi ikke har ansvar for',
        punkter: [
          'Oppgaver som ikke står i bestillingen.',
          'Ting som avtales utenom appen.',
          'Skader som skyldes at noen ikke fulgte reglene under.',
        ],
      },
      { tittel: 'Dette er ikke lov på et oppdrag', punkter: ikkeLov },
      {
        tittel: 'Pris og betaling',
        avsnitt: [
          `Hjelpen koster ${priser.timepris} kr per time, og minst 1 time. I tillegg kommer et gebyr på ${priser.gebyr} kr per bestilling. Ved handling betaler du varene i tillegg, og hjelperen tar bilde av kvitteringen. Du betaler med Vipps etter besøket. Ingen kontanter.`,
        ],
      },
      {
        tittel: 'Avlysning',
        punkter: [
          `Avlys gratis fram til ${regler.avlysFristTimer} timer før besøket.`,
          'Avlyser du senere, ber vi deg også si fra til oss, så hjelperen får beskjed.',
          `Hjelpere kan avlyse i appen fram til ${regler.avlysFristTimer} timer før. Senere må de ringe teamet.`,
          'Kommer ikke hjelperen, betaler du ingenting, og vi finner en ny hjelper så raskt vi kan.',
        ],
      },
      {
        tittel: 'Regler for ungdom',
        punkter: [
          `Du må være minst ${regler.minsteAlder} år, og foresatte må godkjenne.`,
          'Bare lett arbeid som passer for din alder.',
          `Ingen oppdrag etter kl. ${regler.senestFerdigKl}.`,
          'Ikke for mange timer i skoleuka. Skolen kommer først.',
        ],
      },
      {
        tittel: 'Klage',
        avsnitt: [
          `Er du misfornøyd, kan du skrive til oss i appen eller sende e-post til ${kontaktEpost}. Vi svarer innen tre arbeidsdager.`,
        ],
      },
    ],
  },
  trygghet: {
    tittel: 'Slik sjekker vi hjelperne',
    ingress: 'Alle som får merket «Sjekket av Hverdagshelten», har gått gjennom dette.',
    seksjoner: [
      {
        tittel: 'Før de kan ta oppdrag',
        punkter: [
          'De bekrefter hvem de er med BankID.',
          'En foresatt godkjenner dem, hvis de er under 18 år.',
          'De møter teamet personlig, for eksempel på en hjelperkveld.',
          'De går gjennom retningslinjene og en kort quiz.',
        ],
      },
      {
        tittel: 'Under besøket',
        punkter: [
          'Du ser navn, alder og bilde av hjelperen før besøket.',
          'Telefonnummer vises bare mens dere har en avtale.',
          'All betaling skjer i appen. Gi aldri kontanter, bankkort eller PIN-kode.',
          'Det første besøket kan gjerne være med en pårørende til stede.',
        ],
      },
      {
        tittel: 'Hvis noe skjer',
        punkter: [
          'Ring 113 hvis noen er skadet eller blir akutt syk.',
          'Trykk «Meld fra om noe» på avtalen hvis noe ikke føltes riktig. Vi tar det alltid på alvor.',
        ],
      },
    ],
  },
  betaling: {
    tittel: 'Betaling',
    ingress: 'Enkelt og trygt, med Vipps.',
    seksjoner: [
      {
        tittel: 'Slik betaler du',
        punkter: [
          `Hjelpen koster ${priser.timepris} kr per time, og et gebyr på ${priser.gebyr} kr per bestilling.`,
          'Du ser prisen før du sender bestillingen.',
          'Du betaler med Vipps etter at besøket er gjennomført.',
          'Kvitteringen ligger i appen, og kommer på e-post.',
        ],
      },
      {
        tittel: 'Handling',
        avsnitt: [
          'Varene betaler du i tillegg. Hjelperen tar bilde av kvitteringen fra butikken, så du ser hva det kostet.',
        ],
      },
      {
        tittel: 'Pårørende kan betale',
        avsnitt: ['Har du lagt til pårørende, kan de betale for deg. De får en betalingsforespørsel i Vipps.'],
      },
      { tittel: 'Ingen kontanter', avsnitt: ['All betaling går gjennom appen. Da er det trygt for alle.'] },
    ],
  },
  retningslinjer: {
    tittel: 'Slik er du en god hverdagshelt',
    ingress: 'Det viktigste er å være hyggelig, rolig og til å stole på.',
    seksjoner: [
      {
        tittel: 'Når du kommer',
        punkter: [
          'Kom presis. Blir du forsinket, ring og si fra.',
          'Ring på eller bank, og si hvem du er: «Hei, jeg heter Emil, fra Hverdagshelten.»',
          'Snakk tydelig og ikke for fort. Mange hører dårlig.',
        ],
      },
      {
        tittel: 'Mobilhjelp',
        punkter: [
          'La den eldre trykke selv. Forklar ett steg om gangen.',
          'Skriv gjerne ned stegene på et ark.',
          'Be aldri om passord eller PIN-kode.',
        ],
      },
      {
        tittel: 'På tur',
        punkter: [
          'Gå i den andres tempo, og tilby armen din.',
          'Velg flate veier uten is og trapper.',
          'Ta pauser på benker underveis.',
        ],
      },
      { tittel: 'Dette skal du ikke gjøre', punkter: ikkeLov },
      {
        tittel: 'Hvis noe skjer',
        punkter: [
          'Ring 113 hvis noen er skadet eller blir akutt syk.',
          'Ring så teamet, og en foresatt.',
          'Føles noe ubehagelig, kan du alltid gå. Meld fra til oss etterpå.',
        ],
      },
    ],
  },
};
