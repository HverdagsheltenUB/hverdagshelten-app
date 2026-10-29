import {
  Coffee,
  Dog,
  Footprints,
  House,
  ShoppingCart,
  Smartphone,
  Sprout,
  type LucideIcon,
} from 'lucide-react-native';

// Alt her er eksempeldata til prototypen. Senere kommer dette fra en backend.

export const kontaktEpost = 'hverdagsheltenub@gmail.com';

export type Kategori = {
  navn: string;
  beskrivelse: string;
  ikon: LucideIcon;
};

export const kategorier: Kategori[] = [
  { navn: 'Hjelp hjemme', beskrivelse: 'Enkle oppgaver i hjemmet', ikon: House },
  { navn: 'Handling', beskrivelse: 'Hjelp med dagligvarer', ikon: ShoppingCart },
  { navn: 'Hyggelig besøk', beskrivelse: 'En prat og litt selskap', ikon: Coffee },
  { navn: 'Tur sammen', beskrivelse: 'En tur i nærområdet', ikon: Footprints },
  { navn: 'Hagearbeid', beskrivelse: 'Plenklipping og luking', ikon: Sprout },
  { navn: 'Lufte hunden', beskrivelse: 'En runde med firbeinte', ikon: Dog },
  { navn: 'Mobilhjelp', beskrivelse: 'Hjelp med mobil og nettbrett', ikon: Smartphone },
];

export function finnKategori(navn: string) {
  return kategorier.find((k) => k.navn === navn) ?? kategorier[0];
}

export const dager = ['I morgen', 'Lørdag 31. okt', 'Mandag 2. nov', 'Torsdag 5. nov'];
export const tider = ['10.00–11.00', '12.00–13.00', '14.00–15.00', '17.00–18.00'];

export const anne = {
  fornavn: 'Anne',
  navn: 'Anne Hansen',
  adresse: 'Thereses gate 12',
  sted: 'Thereses gate 12, Oslo',
  parorende: { navn: 'Lise (datter)', telefon: '922 45 678' },
};

export const emil = {
  fornavn: 'Emil',
  navn: 'Emil Berg',
  beskrivelse: '16 år · Sagene',
  tjentIOktober: 1250,
  vurdering: '4,9',
  oppdragUtfort: 12,
};

// Plassering på det stiliserte kartet, i prosent av bredde og høyde.
export type Kartpunkt = { x: number; y: number };

export const motested = {
  navn: 'Nationaltheatret',
  beskrivelse: 'Ved teaterbygningen i Oslo',
  punkt: { x: 44, y: 60 } as Kartpunkt,
};

export type Oppdrag = {
  id: string;
  tittel: string;
  navn: string;
  alder: number;
  sted: string;
  avstand: string;
  nar: string;
  belop: number;
  varighet: string;
  beskjed: string;
  ikon: LucideIcon;
  punkt: Kartpunkt;
};

export const oppdrag: Oppdrag[] = [
  {
    id: 'kiwi',
    tittel: 'Handling på Kiwi',
    navn: 'Kari',
    alder: 81,
    sted: 'Sagene',
    avstand: '600 m',
    nar: 'I morgen kl. 11.00',
    belop: 150,
    varighet: '1 time',
    beskjed: 'Hei! Jeg trenger melk, brød og litt frukt. Handlelisten ligger klar.',
    ikon: ShoppingCart,
    punkt: { x: 52, y: 14 },
  },
  {
    id: 'plen',
    tittel: 'Klippe plenen',
    navn: 'Arne',
    alder: 77,
    sted: 'Frogner',
    avstand: '1,2 km',
    nar: 'Lørdag kl. 10.00',
    belop: 300,
    varighet: '2 timer',
    beskjed: 'Gressklipperen står i boden. Kaffe og vafler etterpå!',
    ikon: Sprout,
    punkt: { x: 18, y: 44 },
  },
  {
    id: 'bella',
    tittel: 'Lufte Bella (labrador)',
    navn: 'Solveig',
    alder: 84,
    sted: 'St. Hanshaugen',
    avstand: '900 m',
    nar: 'Søndag kl. 13.00',
    belop: 100,
    varighet: '45 min',
    beskjed: 'Bella er snill og glad i folk, men drar litt i båndet.',
    ikon: Dog,
    punkt: { x: 50, y: 34 },
  },
  {
    id: 'facetime',
    tittel: 'Sette opp FaceTime',
    navn: 'Per',
    alder: 79,
    sted: 'Grünerløkka',
    avstand: '1,5 km',
    nar: 'Mandag kl. 17.00',
    belop: 150,
    varighet: '1 time',
    beskjed: 'Jeg vil gjerne snakke med barnebarna mine på video.',
    ikon: Smartphone,
    punkt: { x: 78, y: 26 },
  },
];

export function finnOppdrag(id: string) {
  return oppdrag.find((o) => o.id === id);
}

export const hjelpeomrader = ['Tur sammen', 'Mobilhjelp', 'Lufte hunden', 'Hagearbeid'];
