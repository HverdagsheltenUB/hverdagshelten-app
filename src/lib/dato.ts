// Datoer lagres som «ÅÅÅÅ-MM-DD», og tidspunkt som hele og halve timer (f.eks. 14 eller 14.5).
// Vi skriver datoene selv i stedet for å bruke Intl, fordi ikke alle telefoner har norsk innebygd.

const ukedager = ['søndag', 'mandag', 'tirsdag', 'onsdag', 'torsdag', 'fredag', 'lørdag'];
const maneder = ['jan.', 'feb.', 'mars', 'april', 'mai', 'juni', 'juli', 'aug.', 'sep.', 'okt.', 'nov.', 'des.'];
const manederLang = [
  'januar',
  'februar',
  'mars',
  'april',
  'mai',
  'juni',
  'juli',
  'august',
  'september',
  'oktober',
  'november',
  'desember',
];

function stor(tekst: string) {
  return tekst.charAt(0).toUpperCase() + tekst.slice(1);
}

function tilDato(iso: string) {
  const [a, m, d] = iso.split('-').map(Number);
  return new Date(a, m - 1, d);
}

export function isoDato(dato: Date) {
  const m = String(dato.getMonth() + 1).padStart(2, '0');
  const d = String(dato.getDate()).padStart(2, '0');
  return `${dato.getFullYear()}-${m}-${d}`;
}

// Dagen om «antall» dager fra i dag.
export function omDager(antall: number) {
  const d = new Date();
  d.setDate(d.getDate() + antall);
  return isoDato(d);
}

function dagerFraIDag(iso: string) {
  const idag = tilDato(isoDato(new Date()));
  return Math.round((tilDato(iso).getTime() - idag.getTime()) / 86_400_000);
}

// «I dag», «I morgen» eller «Fredag 6. nov.»
export function dagnavn(iso: string) {
  const dager = dagerFraIDag(iso);
  if (dager === 0) return 'I dag';
  if (dager === 1) return 'I morgen';
  if (dager === -1) return 'I går';
  const d = tilDato(iso);
  return `${stor(ukedager[d.getDay()])} ${d.getDate()}. ${maneder[d.getMonth()]}`;
}

// «Torsdag 5. november», til de store overskriftene.
export function dagnavnLangt(iso: string) {
  const d = tilDato(iso);
  const forst = dagerFraIDag(iso) === 0 ? 'I dag, ' : dagerFraIDag(iso) === 1 ? 'I morgen, ' : '';
  const ukedag = forst ? ukedager[d.getDay()] : stor(ukedager[d.getDay()]);
  return `${forst}${ukedag} ${d.getDate()}. ${manederLang[d.getMonth()]}`;
}

export function klokke(tid: number) {
  const timer = Math.floor(tid);
  const min = Math.round((tid - timer) * 60);
  return `${String(timer).padStart(2, '0')}.${String(min).padStart(2, '0')}`;
}

// «14.00–15.30»
export function tidsrom(start: number, varighet: number) {
  return `${klokke(start)}–${klokke(start + varighet)}`;
}

export function varighetTekst(varighet: number) {
  if (varighet === 1) return '1 time';
  return `${String(varighet).replace('.', ',')} timer`;
}

// Når avtalen starter, som tidspunkt i millisekunder.
export function startTidspunkt(iso: string, start: number) {
  const d = tilDato(iso);
  d.setHours(Math.floor(start), Math.round((start % 1) * 60));
  return d.getTime();
}

export function timerTil(iso: string, start: number) {
  return (startTidspunkt(iso, start) - Date.now()) / 3_600_000;
}

export function erPassert(iso: string, start: number) {
  return timerTil(iso, start) < 0;
}

// De neste dagene man kan bestille, fra i morgen.
export function bestillingsdager(antall = 7) {
  return Array.from({ length: antall }, (_, i) => omDager(i + 1));
}

export function manedsnavn(dato = new Date()) {
  return manederLang[dato.getMonth()];
}

// «torsdag»
export function ukedag(iso: string) {
  return ukedager[tilDato(iso).getDay()];
}
