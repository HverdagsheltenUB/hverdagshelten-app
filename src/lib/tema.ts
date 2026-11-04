import { Easing } from 'react-native-reanimated';

// Farger fra prototypen. Bruk disse overalt i stedet for egne hex-koder.
export const farger = {
  krem: '#FDF8F2',
  fersken: '#F8E4CF',
  ferskenLys: '#FBEEDF',
  lilla: '#4D3B5C',
  morkLilla: '#3E2F4B',
  lysLilla: '#E7E0EE',
  tekst: '#2B2230',
  dempet: '#6E6274',
  linje: '#E9DED3',
  kort: '#FFFDFA',
  gronn: '#2F7A55',
  gronnLys: '#E3F1E8',
  stjerne: '#D69A2D',
  hvit: '#FFFFFF',
  // Til nødknappen og «Avlys». Mørk nok til hvit tekst (kontrast over 4,5:1).
  rod: '#A8322A',
  rodLys: '#FBE9E7',
  // Logoens lilla, brukt på oppstartsskjermen så overgangen fra splash blir sømløs.
  logo: '#52395E',
};

// Figtree i fire vekter. Vi velger skriftfil etter vekt i stedet for fontWeight,
// fordi Android ikke finner riktig fil for egne skrifter ellers.
export const skrift = {
  400: 'Figtree_400Regular',
  600: 'Figtree_600SemiBold',
  700: 'Figtree_700Bold',
  800: 'Figtree_800ExtraBold',
} as const;

export type Vekt = keyof typeof skrift;

// Tekststørrelser: [vanlig, med «Større tekst» på] (ca. 15 % større).
export const tekststorrelser = {
  tittel: [28, 32],
  mellomtittel: [19, 22],
  stor: [22, 25],
  brod: [17, 19],
  brodLiten: [16, 18],
  listetittel: [18, 20],
  under: [15, 17],
  underLiten: [14, 16],
  knapp: [19, 21],
  fane: [16, 17],
  liten: [13, 15],
  pille: [13, 15],
} as const;

export type Tekststorrelse = keyof typeof tekststorrelser;

export const ikonStrek = 1.8;

export const priser = {
  timepris: 150,
  gebyr: 29,
};

// Regler bestemt av teamet og arbeidsmiljøloven for ungdom.
export const regler = {
  // Minst 1 time per oppdrag (bestemt 4. november).
  varigheter: [1, 1.5, 2, 3],
  // Ingen oppdrag etter kl. 20 for ungdom under 18.
  senestFerdigKl: 20,
  // Ungdom må være minst 13 år.
  minsteAlder: 13,
  // Gratis å avlyse fram til så mange timer før.
  avlysFristTimer: 24,
};

export function prisFor(varighet: number, utlegg = 0) {
  const hjelp = Math.round(priser.timepris * varighet);
  return { hjelp, gebyr: priser.gebyr, utlegg, sum: hjelp + priser.gebyr + utlegg };
}

export function kroner(belop: number) {
  // Egen formatering, fordi ikke alle telefoner har norsk tallformat innebygd.
  return `${String(belop).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} kr`;
}

// Felles verdier for overganger, så alle skjermer beveger seg likt.
export const animasjon = {
  easing: Easing.bezier(0.22, 0.8, 0.3, 1),
  skjerm: 380,
  forskyvning: 28,
  rollebytte: 450,
  fargeskifte: 250,
  innholdSteg: 30,
  innholdMaks: 120,
  toast: 2400,
};
