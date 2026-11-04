import {
  Coffee,
  Dog,
  Footprints,
  House,
  MessageSquareText,
  ShoppingCart,
  Smartphone,
  Sprout,
  type LucideIcon,
} from 'lucide-react-native';

import { omDager } from './dato';

// Alt her er eksempeldata til testversjonen. Senere kommer dette fra Supabase.

export const kontaktEpost = 'hverdagsheltenub@gmail.com';

// Kontaktpersonen i teamet som svarer i appen. Bytt navn når teamet har bestemt hvem det er.
export const kontaktperson = {
  fornavn: 'Ingrid',
  rolle: 'Kontaktperson i Hverdagshelten',
  apent: 'Svarer hverdager 09–16',
};

export type Kategori = {
  navn: string;
  beskrivelse: string;
  ikon: LucideIcon;
};

export const kategorier: Kategori[] = [
  { navn: 'Handling', beskrivelse: 'Hjelp med dagligvarer', ikon: ShoppingCart },
  { navn: 'Hagearbeid', beskrivelse: 'Plenklipping og luking', ikon: Sprout },
  { navn: 'Hyggelig besøk', beskrivelse: 'En prat og en kopp kaffe', ikon: Coffee },
  { navn: 'Tur sammen', beskrivelse: 'En tur i nærområdet', ikon: Footprints },
  { navn: 'Lufte hunden', beskrivelse: 'En runde med firbeinte', ikon: Dog },
  { navn: 'Hjelp hjemme', beskrivelse: 'Enkle oppgaver i hjemmet', ikon: House },
  { navn: 'Mobilhjelp', beskrivelse: 'Hjelp med mobil og nettbrett', ikon: Smartphone },
  { navn: 'Noe annet', beskrivelse: 'Skriv selv hva du trenger', ikon: MessageSquareText },
];

export function finnKategori(navn: string) {
  return kategorier.find((k) => k.navn === navn) ?? kategorier[0];
}

// Starttidspunkt man kan velge. Alle oppdrag skal være ferdige senest kl. 20.
export const starttider = [10, 12, 14, 16, 17];

export const tingAViteValg = ['Dyr i huset', 'Hører dårlig', 'Går sakte', 'Allergi', 'Ringeklokka virker ikke'];

export type Hjelper = {
  id: string;
  fornavn: string;
  navn: string;
  alder: number;
  omrade: string;
  telefon: string;
  vurdering: string;
  // Oppdrag utført før det som ligger i appen.
  tidligereUtfort: number;
};

export const hjelpere: Record<string, Hjelper> = {
  emil: {
    id: 'emil',
    fornavn: 'Emil',
    navn: 'Emil Berg',
    alder: 16,
    omrade: 'Sagene',
    telefon: '412 34 567',
    vurdering: '4,9',
    tidligereUtfort: 10,
  },
  sara: {
    id: 'sara',
    fornavn: 'Sara',
    navn: 'Sara Ahmadi',
    alder: 17,
    omrade: 'Bislett',
    telefon: '934 56 712',
    vurdering: '5,0',
    tidligereUtfort: 21,
  },
};

export function finnHjelper(id?: string) {
  return id ? hjelpere[id] : undefined;
}

// Den som bruker ungdomsversjonen i testen.
export const megUngdom = hjelpere.emil;

export type Status = 'sendt' | 'bekreftet' | 'ferdig' | 'avlyst';

export type Person = {
  fornavn: string;
  navn: string;
  alder?: number;
  adresse: string;
  omrade: string;
  telefon: string;
};

// Ett oppdrag er det samme som én avtale. Den eldre kaller det «avtale», ungdommen «oppdrag».
export type Oppdrag = {
  id: string;
  kategori: string;
  // Fritekst når kategorien er «Noe annet».
  annet?: string;
  // Den som får hjelp.
  mottaker: Person;
  // Satt når Anne har bestilt (for seg selv eller for noen andre).
  bestiltAvMeg: boolean;
  bestiltFor?: { relasjon: string; samtykke: boolean };
  // Avstand fra ungdommen, i kilometer. Vises bare avrundet.
  avstandKm: number;
  dato: string;
  start: number;
  varighet: number;
  beskjed: string;
  handleliste: string;
  handlelisteBilde?: string;
  tingAVite: string[];
  gjentaUkentlig: boolean;
  onsketHjelperId?: string;
  status: Status;
  hjelperId?: string;
  paVei?: boolean;
  utlegg?: number;
  kvitteringBilde?: string;
  betalt?: boolean;
  betaltAv?: string;
  vurdering?: number;
  takk?: string;
  opprettet: number;
};

export const anne: Person & { telefon: string } = {
  fornavn: 'Anne',
  navn: 'Anne Hansen',
  alder: 82,
  adresse: 'Thereses gate 12, 0168 Oslo',
  omrade: 'St. Hanshaugen',
  telefon: '901 23 456',
};

const kari: Person = {
  fornavn: 'Kari',
  navn: 'Kari Nilsen',
  alder: 81,
  adresse: 'Sandakerveien 24, 0473 Oslo',
  omrade: 'Sagene',
  telefon: '958 12 334',
};
const arne: Person = {
  fornavn: 'Arne',
  navn: 'Arne Lund',
  alder: 77,
  adresse: 'Kalbakkveien 8, 1081 Oslo',
  omrade: 'Kalbakken',
  telefon: '916 22 871',
};
const solveig: Person = {
  fornavn: 'Solveig',
  navn: 'Solveig Dahl',
  alder: 84,
  adresse: 'Ullevålsveien 41, 0171 Oslo',
  omrade: 'St. Hanshaugen',
  telefon: '922 07 115',
};
const per: Person = {
  fornavn: 'Per',
  navn: 'Per Johansen',
  alder: 79,
  adresse: 'Toftes gate 50, 0556 Oslo',
  omrade: 'Grünerløkka',
  telefon: '977 45 900',
};

function lagOppdrag(o: Partial<Oppdrag> & Pick<Oppdrag, 'id' | 'kategori' | 'mottaker' | 'dato' | 'start'>): Oppdrag {
  return {
    bestiltAvMeg: false,
    avstandKm: 1,
    varighet: 1,
    beskjed: '',
    handleliste: '',
    tingAVite: [],
    gjentaUkentlig: false,
    status: 'sendt',
    opprettet: 0,
    ...o,
  };
}

// Startdata første gang appen åpnes. Datoene regnes ut fra dagens dato, så eksemplene aldri blir gamle.
export function startOppdrag(): Oppdrag[] {
  return [
    // Annes avtaler. Turen med Emil er også Emils neste oppdrag.
    lagOppdrag({
      id: 'tur-anne',
      kategori: 'Tur sammen',
      mottaker: anne,
      bestiltAvMeg: true,
      avstandKm: 1.4,
      dato: omDager(1),
      start: 14,
      beskjed: 'Jeg går litt sakte, men liker å gå bort til Stensparken.',
      tingAVite: ['Går sakte'],
      status: 'bekreftet',
      hjelperId: 'emil',
    }),
    lagOppdrag({
      id: 'handling-anne',
      kategori: 'Handling',
      mottaker: anne,
      bestiltAvMeg: true,
      dato: omDager(5),
      start: 12,
      handleliste: 'Melk, grovbrød, epler, kaffe',
      gjentaUkentlig: true,
      status: 'bekreftet',
      hjelperId: 'sara',
    }),
    lagOppdrag({
      id: 'besok-anne',
      kategori: 'Hyggelig besøk',
      mottaker: anne,
      bestiltAvMeg: true,
      avstandKm: 1.4,
      dato: omDager(-13),
      start: 14,
      status: 'ferdig',
      hjelperId: 'emil',
      betalt: true,
      betaltAv: 'Anne',
      vurdering: 5,
      takk: 'Takk for en hyggelig prat!',
    }),
    // Ledige oppdrag Emil kan ta.
    lagOppdrag({
      id: 'kiwi',
      kategori: 'Handling',
      mottaker: kari,
      avstandKm: 0.6,
      dato: omDager(1),
      start: 11,
      beskjed: 'Hei! Jeg trenger melk, brød og litt frukt. Handlelisten ligger klar.',
      handleliste: 'Melk, brød, bananer, appelsiner',
    }),
    lagOppdrag({
      id: 'plen',
      kategori: 'Hagearbeid',
      mottaker: arne,
      avstandKm: 1.2,
      dato: omDager(3),
      start: 10,
      varighet: 2,
      beskjed: 'Gressklipperen står i boden. Kaffe og vafler etterpå!',
    }),
    lagOppdrag({
      id: 'bella',
      kategori: 'Lufte hunden',
      mottaker: solveig,
      avstandKm: 0.9,
      dato: omDager(4),
      start: 13,
      beskjed: 'Bella er en snill labrador som er glad i folk, men hun drar litt i båndet.',
      tingAVite: ['Dyr i huset'],
    }),
    lagOppdrag({
      id: 'facetime',
      kategori: 'Mobilhjelp',
      mottaker: per,
      avstandKm: 1.6,
      dato: omDager(6),
      start: 17,
      beskjed: 'Jeg vil gjerne snakke med barnebarna mine på video.',
      tingAVite: ['Hører dårlig'],
    }),
    // Et fullført oppdrag for Emil, hos Per.
    lagOppdrag({
      id: 'mobil-per',
      kategori: 'Mobilhjelp',
      mottaker: per,
      avstandKm: 1.6,
      dato: omDager(-6),
      start: 16,
      status: 'ferdig',
      hjelperId: 'emil',
      betalt: true,
      vurdering: 5,
    }),
  ];
}

export function tittelFor(o: Pick<Oppdrag, 'kategori' | 'annet'>) {
  if (o.kategori === 'Noe annet') return o.annet?.trim() || 'Noe annet';
  return o.kategori;
}

// «under 1 km» eller «ca. 1,5 km». Avrundet, så ingen kan regne seg fram til adressen.
export function avstandTekst(km: number) {
  if (km < 1) return 'under 1 km';
  const rundet = Math.round(km * 2) / 2;
  return `ca. ${String(rundet).replace('.', ',')} km`;
}

// Utbetalinger Emil har fått før, til historikken.
export const utbetalinger = [
  { dato: '1. okt.', belop: 900, til: 'Vipps' },
  { dato: '1. sep.', belop: 1350, til: 'Vipps' },
  { dato: '1. aug.', belop: 600, til: 'Vipps' },
];

export const tjentForAppen = 3850;

export const hjelpereTilGodkjenning = [
  { id: 'jonas', navn: 'Jonas Eriksen', alder: 15, omrade: 'Torshov', bankId: true, foresatt: true },
  { id: 'maja', navn: 'Maja Solberg', alder: 14, omrade: 'Kalbakken', bankId: true, foresatt: false },
];
