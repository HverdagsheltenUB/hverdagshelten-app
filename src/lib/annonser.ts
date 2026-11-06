import { useFocusEffect } from 'expo-router';
import {
  Armchair,
  BookOpen,
  Bike,
  Coffee,
  CookingPot,
  Dog,
  Footprints,
  House,
  Laptop,
  MessageSquareText,
  Package,
  Shirt,
  ShoppingCart,
  Smartphone,
  Sprout,
  Wrench,
  type LucideIcon,
} from 'lucide-react-native';
import { useCallback, useEffect, useRef, useState } from 'react';

import { feiltekst, supabase } from './supabase';

export type Annonsetype = 'hjelp' | 'ting';
export type Annonsestatus = 'ledig' | 'akseptert' | 'pa_vei' | 'ferdig';

export type Personkort = { navn: string; omrade?: string; opprettet?: string; bilde: string | null };
export type Levering = 'hentes' | 'sendes' | 'begge';

export type Annonse = {
  id: string;
  bruker_id: string;
  type: Annonsetype;
  tittel: string;
  kategori: string;
  beskrivelse: string;
  // null = pris etter avtale, 0 = gratis
  pris: number | null;
  tilstand: string | null;
  storrelse: string | null;
  sted: string;
  levering: Levering | null;
  bilder: string[];
  opprettet: string;
  endret: string;
  status: Annonsestatus;
  hjelper_id: string | null;
  akseptert: string | null;
  vurdering: number | null;
  takk: string | null;
  // Når oppdraget skal skje (valgfritt). Brukes i «I dag» og kalenderen.
  tidspunkt: string | null;
  // Den som la ut annonsen, og hjelperen som har tatt den.
  profiler: Personkort | null;
  hjelper: Personkort | null;
};

export const statustekst: Record<Annonsestatus, string> = {
  ledig: 'Ledig',
  akseptert: 'Akseptert',
  pa_vei: 'Hjelperen er på vei',
  ferdig: 'Ferdig',
};

// Det brukeren fyller ut. Bilder kan være lokale (fra telefonen) eller allerede lastet opp.
export type Annonseutkast = {
  tittel: string;
  kategori: string;
  beskrivelse: string;
  pris: string;
  gratis: boolean;
  tilstand: string;
  storrelse: string;
  sted: string;
  levering: Levering | null;
  bilder: string[];
  // Når det skal skje: dato som «2026-11-07» og klokkeslett som «14:00». Tomt = ingen fast tid.
  dato: string;
  klokke: string;
  // Vises bare for den som aksepterer annonsen.
  adresse: string;
  lat: number | null;
  lng: number | null;
};

export const tomtUtkast: Annonseutkast = {
  tittel: '',
  kategori: '',
  beskrivelse: '',
  pris: '',
  gratis: false,
  tilstand: '',
  storrelse: '',
  sted: '',
  levering: null,
  bilder: [],
  dato: '',
  klokke: '',
  adresse: '',
  lat: null,
  lng: null,
};

export type Annonsekategori = {
  navn: string;
  type: Annonsetype;
  ikon: LucideIcon;
  // Ord som gjør at vi foreslår kategorien automatisk.
  ord: string[];
  // Vis «Størrelse» for denne kategorien.
  storrelse?: boolean;
};

export const annonsekategorier: Annonsekategori[] = [
  // Trenger hjelp
  { navn: 'Handling', type: 'hjelp', ikon: ShoppingCart, ord: ['handl', 'butikk', 'matvar', 'dagligvar', 'kiwi', 'rema', 'meny', 'apotek', 'varer'] },
  { navn: 'Hagearbeid', type: 'hjelp', ikon: Sprout, ord: ['plen', 'gress', 'hage', 'luk', 'løv', 'snø', 'måk', 'hekk', 'blomst'] },
  { navn: 'Hyggelig besøk', type: 'hjelp', ikon: Coffee, ord: ['kaffe', 'besøk', 'prat', 'selskap', 'kort', 'spill'] },
  { navn: 'Tur sammen', type: 'hjelp', ikon: Footprints, ord: ['tur ', 'gåtur', 'spasertur', 'følge', 'gå sammen'] },
  { navn: 'Lufte hunden', type: 'hjelp', ikon: Dog, ord: ['hund', 'lufte', 'luft', 'valp', 'katt'] },
  { navn: 'Hjelp hjemme', type: 'hjelp', ikon: House, ord: ['rydd', 'vask', 'bær', 'flytt', 'pære', 'gardin', 'søppel', 'henge opp'] },
  { navn: 'Mobilhjelp', type: 'hjelp', ikon: Smartphone, ord: ['mobil', 'telefon', 'nettbrett', 'ipad', 'facetime', 'pc', 'data', 'app'] },
  { navn: 'Annen hjelp', type: 'hjelp', ikon: MessageSquareText, ord: ['hjelp', 'trenger'] },
  // Selges eller gis bort
  { navn: 'Møbler', type: 'ting', ikon: Armchair, ord: ['stol', 'bord', 'sofa', 'skap', 'kommode', 'hylle', 'seng', 'lampe', 'møbel'] },
  { navn: 'Klær og sko', type: 'ting', ikon: Shirt, ord: ['jakke', 'genser', 'bukse', 'kjole', 'sko', 'støvl', 'skjorte', 'klær', 'lue', 'votter', 'skjerf'], storrelse: true },
  { navn: 'Bøker og hobby', type: 'ting', ikon: BookOpen, ord: ['bok', 'bøker', 'garn', 'strikk', 'puslespill', 'plate', 'cd', 'dvd', 'maling'] },
  { navn: 'Elektronikk', type: 'ting', ikon: Laptop, ord: ['tv', 'radio', 'laptop', 'høyttaler', 'kamera', 'lader', 'skjerm', 'playstation'] },
  { navn: 'Hjem og kjøkken', type: 'ting', ikon: CookingPot, ord: ['kopp', 'tallerken', 'gryte', 'panne', 'servise', 'vase', 'kjøkken', 'pute', 'teppe'] },
  { navn: 'Sport og fritid', type: 'ting', ikon: Bike, ord: ['sykkel', 'ski', 'skøyter', 'ball', 'telt', 'sekk', 'trening', 'fiske'], storrelse: true },
  { navn: 'Hage og verktøy', type: 'ting', ikon: Wrench, ord: ['verktøy', 'drill', 'hammer', 'gressklipper', 'trillebår', 'stige', 'potte'] },
  { navn: 'Annet til salgs', type: 'ting', ikon: Package, ord: ['selg', 'gis bort', 'gratis'] },
];

export function finnAnnonsekategori(navn: string | undefined | null) {
  return annonsekategorier.find((k) => k.navn === navn);
}

export function ikonFor(kategori: string): LucideIcon {
  return finnAnnonsekategori(kategori)?.ikon ?? Package;
}

// Foreslår en kategori ut fra det brukeren har skrevet. Gir ingenting hvis vi er usikre.
export function foreslaKategori(tekst: string): Annonsekategori | undefined {
  const t = ` ${tekst.toLowerCase()} `;
  if (t.trim().length < 3) return undefined;
  let beste: { k: Annonsekategori; treff: number } | undefined;
  for (const k of annonsekategorier) {
    const treff = k.ord.filter((o) => t.includes(o)).length;
    // «Annen hjelp» og «Annet til salgs» er reserve, og vinner bare hvis ingenting annet treffer.
    const vekt = k.navn.startsWith('Ann') ? treff * 0.5 : treff;
    if (vekt > 0 && (!beste || vekt > beste.treff)) beste = { k, treff: vekt };
  }
  return beste?.k;
}

export const tilstander = ['Ny', 'Som ny', 'Pent brukt', 'Brukt', 'Må fikses'];

export const leveringstekst: Record<Levering, string> = {
  hentes: 'Må hentes',
  sendes: 'Kan sendes',
  begge: 'Hentes eller sendes',
};

export function pristekst(a: { pris: number | null; type: Annonsetype }) {
  if (a.pris === 0) return 'Gratis';
  if (a.pris === null) return a.type === 'hjelp' ? 'Betaling etter avtale' : 'Pris etter avtale';
  const kr = `${String(a.pris).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} kr`;
  // For hjelp er beløpet det man betaler per time.
  return a.type === 'hjelp' ? `${kr} per time` : kr;
}

// «for 5 minutter siden», «i går», «3. nov.»
export function nartekst(iso: string) {
  const tid = new Date(iso).getTime();
  const sek = Math.max(0, (Date.now() - tid) / 1000);
  if (sek < 60) return 'akkurat nå';
  if (sek < 3600) {
    const m = Math.floor(sek / 60);
    return `for ${m} ${m === 1 ? 'minutt' : 'minutter'} siden`;
  }
  if (sek < 86400) {
    const t = Math.floor(sek / 3600);
    return `for ${t} ${t === 1 ? 'time' : 'timer'} siden`;
  }
  if (sek < 2 * 86400) return 'i går';
  const d = new Date(tid);
  const mnd = ['jan.', 'feb.', 'mars', 'apr.', 'mai', 'juni', 'juli', 'aug.', 'sep.', 'okt.', 'nov.', 'des.'][d.getMonth()];
  return `${d.getDate()}. ${mnd}`;
}

// ─── Dato og tid ──────────────────────────────────────────────

export const ukedager = ['søndag', 'mandag', 'tirsdag', 'onsdag', 'torsdag', 'fredag', 'lørdag'];
export const ukedagerKort = ['søn.', 'man.', 'tir.', 'ons.', 'tor.', 'fre.', 'lør.'];
export const maaneder = ['januar', 'februar', 'mars', 'april', 'mai', 'juni', 'juli', 'august', 'september', 'oktober', 'november', 'desember'];

const tosifret = (n: number) => String(n).padStart(2, '0');

// «2026-11-07», etter klokka på telefonen.
export function datonokkel(d: Date) {
  return `${d.getFullYear()}-${tosifret(d.getMonth() + 1)}-${tosifret(d.getDate())}`;
}

export function klokkeslett(d: Date) {
  return `${tosifret(d.getHours())}:${tosifret(d.getMinutes())}`;
}

// Dagene fra i dag og framover, f.eks. til kalenderen og datovelgeren.
export function dagerFraIdag(antall: number, start = 0): Date[] {
  const idag = new Date();
  return Array.from({ length: antall }, (_, i) => new Date(idag.getFullYear(), idag.getMonth(), idag.getDate() + start + i));
}

// «i dag», «i morgen» eller «fredag 7. november».
export function dagtekst(d: Date) {
  const n = datonokkel(d);
  const [idag, imorgen] = dagerFraIdag(2).map(datonokkel);
  if (n === idag) return 'i dag';
  if (n === imorgen) return 'i morgen';
  return `${ukedager[d.getDay()]} ${d.getDate()}. ${maaneder[d.getMonth()]}`;
}

// «I dag kl. 14:00», «I morgen kl. 09:30», «Fredag 7. november kl. 12:00».
export function tidtekst(iso: string) {
  const d = new Date(iso);
  const t = `${dagtekst(d)} kl. ${klokkeslett(d)}`;
  return t[0].toUpperCase() + t.slice(1);
}

// ─── Lese fra databasen ───────────────────────────────────────

const grunnfelter =
  'id, bruker_id, type, tittel, kategori, beskrivelse, pris, tilstand, storrelse, sted, levering, bilder, opprettet, endret, status, hjelper_id, akseptert, vurdering, takk, ' +
  'profiler:profiler!annonser_bruker_id_fkey(navn, omrade, opprettet, bilde), hjelper:profiler!annonser_hjelper_id_fkey(navn, bilde)';
const felter = `${grunnfelter}, tidspunkt`;

// Hvis databasen ikke har fått kolonnen «tidspunkt» ennå, virker appen likevel (bare uten tidspunkt).
function manglerTidspunkt(feil: { message?: string } | null) {
  return Boolean(feil?.message?.includes('tidspunkt'));
}

type Liste = { annonser: Annonse[]; laster: boolean; feil: string | null; oppdater: () => Promise<void> };

// Henter annonser og henter på nytt hver gang skjermen vises, så man ser det andre har lagt ut.
// Nye annonser fra andre dukker også opp mens man ser på listen.
export function useAnnonser(filter?: { brukerId?: string; hjelperId?: string; bareLedige?: boolean }): Liste {
  const [annonser, setAnnonser] = useState<Annonse[]>([]);
  const [laster, setLaster] = useState(true);
  const [feil, setFeil] = useState<string | null>(null);
  const brukerId = filter?.brukerId;
  const hjelperId = filter?.hjelperId;
  const bareLedige = filter?.bareLedige ?? false;
  const forrige = useRef(0);

  const oppdater = useCallback(async () => {
    const denne = ++forrige.current;
    const hent = (f: string) => {
      let sporring = supabase.from('annonser').select(f).order('opprettet', { ascending: false }).limit(200);
      if (brukerId) sporring = sporring.eq('bruker_id', brukerId);
      if (hjelperId) sporring = sporring.eq('hjelper_id', hjelperId);
      if (bareLedige) sporring = sporring.eq('status', 'ledig');
      return sporring;
    };
    let { data, error } = await hent(felter);
    if (manglerTidspunkt(error)) ({ data, error } = await hent(grunnfelter));
    if (denne !== forrige.current) return;
    if (error) setFeil(feiltekst(error));
    else {
      setFeil(null);
      setAnnonser((data ?? []) as unknown as Annonse[]);
    }
    setLaster(false);
  }, [brukerId, hjelperId, bareLedige]);

  useFocusEffect(
    useCallback(() => {
      oppdater().catch(() => setLaster(false));
    }, [oppdater]),
  );

  useEffect(() => {
    const kanal = supabase
      .channel(`annonser-${brukerId ?? hjelperId ?? 'alle'}-${Math.random().toString(36).slice(2)}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'annonser' }, () => {
        oppdater().catch(() => {});
      })
      .subscribe();
    return () => {
      supabase.removeChannel(kanal);
    };
  }, [brukerId, hjelperId, oppdater]);

  return { annonser, laster, feil, oppdater };
}

export function useAnnonse(id: string | undefined) {
  const [annonse, setAnnonse] = useState<Annonse | null>(null);
  const [laster, setLaster] = useState(true);
  const [feil, setFeil] = useState<string | null>(null);

  const oppdater = useCallback(async () => {
    if (!id) return;
    const hent = (f: string) => supabase.from('annonser').select(f).eq('id', id).maybeSingle();
    let { data, error } = await hent(felter);
    if (manglerTidspunkt(error)) ({ data, error } = await hent(grunnfelter));
    if (error) setFeil(feiltekst(error));
    else {
      setFeil(null);
      setAnnonse(data as unknown as Annonse | null);
    }
    setLaster(false);
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      oppdater().catch(() => setLaster(false));
    }, [oppdater]),
  );

  // Oppdaterer siden når status endres, f.eks. når hjelperen er på vei.
  useEffect(() => {
    if (!id) return;
    const kanal = supabase
      .channel(`annonse-${id}-${Math.random().toString(36).slice(2)}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'annonser', filter: `id=eq.${id}` }, () => {
        oppdater().catch(() => {});
      })
      .subscribe();
    return () => {
      supabase.removeChannel(kanal);
    };
  }, [id, oppdater]);

  return { annonse, laster, feil, oppdater };
}

// ─── Skrive til databasen ─────────────────────────────────────

const botte = 'annonsebilder';

function erLokalt(uri: string) {
  return !uri.startsWith('http');
}

function nyttFilnavn() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

// Laster opp ett bilde fra telefonen og gir tilbake en adresse alle kan se.
async function lastOppBilde(brukerId: string, uri: string): Promise<string> {
  const svar = await fetch(uri);
  const innhold = await svar.arrayBuffer();
  const type = svar.headers.get('content-type') || 'image/jpeg';
  const endelse = type.includes('png') ? 'png' : type.includes('webp') ? 'webp' : type.includes('hei') ? 'heic' : 'jpg';
  const sti = `${brukerId}/${nyttFilnavn()}.${endelse}`;
  const { error } = await supabase.storage.from(botte).upload(sti, innhold, {
    contentType: type.startsWith('image/') ? type : 'image/jpeg',
    upsert: false,
  });
  if (error) throw error;
  return supabase.storage.from(botte).getPublicUrl(sti).data.publicUrl;
}

function stiFraAdresse(adresse: string) {
  const merke = `/object/public/${botte}/`;
  const i = adresse.indexOf(merke);
  return i === -1 ? null : decodeURIComponent(adresse.slice(i + merke.length));
}

async function slettBilder(adresser: string[]) {
  const stier = adresser.map(stiFraAdresse).filter((s): s is string => Boolean(s));
  if (stier.length > 0) await supabase.storage.from(botte).remove(stier);
}

export function utkastFraAnnonse(a: Annonse): Annonseutkast {
  return {
    tittel: a.tittel,
    kategori: a.kategori,
    beskrivelse: a.beskrivelse,
    pris: a.pris && a.pris > 0 ? String(a.pris) : '',
    gratis: a.pris === 0,
    tilstand: a.tilstand ?? '',
    storrelse: a.storrelse ?? '',
    sted: a.sted,
    levering: a.levering,
    bilder: a.bilder,
    dato: a.tidspunkt ? datonokkel(new Date(a.tidspunkt)) : '',
    klokke: a.tidspunkt ? klokkeslett(new Date(a.tidspunkt)) : '',
    adresse: '',
    lat: null,
    lng: null,
  };
}

// Gjør dato og klokkeslett fra skjemaet om til et tidspunkt (norsk tid på telefonen).
export function tidspunktFraUtkast(u: Pick<Annonseutkast, 'dato' | 'klokke'>): string | null {
  if (!u.dato) return null;
  const [aar, mnd, dag] = u.dato.split('-').map(Number);
  const [t, m] = (u.klokke || '12:00').split(':').map(Number);
  const d = new Date(aar, mnd - 1, dag, t, m);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

// Gjør utfylte felt om til det som lagres. Felt som ikke passer kategorien, tas ikke med.
export function radFraUtkast(u: Annonseutkast) {
  const k = finnAnnonsekategori(u.kategori);
  const type: Annonsetype = k?.type ?? 'ting';
  const tall = parseInt(u.pris.replace(/\D/g, ''), 10);
  return {
    type,
    tittel: u.tittel.trim(),
    kategori: u.kategori,
    beskrivelse: u.beskrivelse.trim(),
    pris: u.gratis ? 0 : Number.isFinite(tall) ? tall : null,
    tilstand: type === 'ting' && u.tilstand ? u.tilstand : null,
    storrelse: k?.storrelse && u.storrelse.trim() ? u.storrelse.trim() : null,
    sted: u.sted.trim(),
    levering: type === 'ting' ? u.levering : null,
    tidspunkt: tidspunktFraUtkast(u),
  };
}

// Lagrer en ny annonse eller endrer en eksisterende. Gir tilbake id-en.
export async function lagreAnnonse(
  brukerId: string,
  utkast: Annonseutkast,
  eksisterende?: Annonse | null,
): Promise<{ id?: string; feil?: string }> {
  const lastetOpp: string[] = [];
  try {
    const bilder: string[] = [];
    for (const uri of utkast.bilder) {
      if (erLokalt(uri)) {
        const adresse = await lastOppBilde(brukerId, uri);
        lastetOpp.push(adresse);
        bilder.push(adresse);
      } else bilder.push(uri);
    }
    const rad: Record<string, unknown> = { ...radFraUtkast(utkast), bilder };

    let id: string;
    if (eksisterende) {
      let { error } = await supabase.from('annonser').update(rad).eq('id', eksisterende.id);
      if (manglerTidspunkt(error)) {
        delete rad.tidspunkt;
        ({ error } = await supabase.from('annonser').update(rad).eq('id', eksisterende.id));
      }
      if (error) throw error;
      // Rydder bort bilder som er tatt ut av annonsen.
      await slettBilder(eksisterende.bilder.filter((b) => !bilder.includes(b))).catch(() => {});
      id = eksisterende.id;
    } else {
      let { data, error } = await supabase.from('annonser').insert(rad).select('id').single();
      if (manglerTidspunkt(error)) {
        delete rad.tidspunkt;
        ({ data, error } = await supabase.from('annonser').insert(rad).select('id').single());
      }
      if (error || !data) throw error;
      id = data.id as string;
    }
    const { error: adressefeil } = await supabase.from('annonse_adresser').upsert({
      annonse_id: id,
      adresse: utkast.adresse.trim(),
      lat: utkast.lat,
      lng: utkast.lng,
    });
    if (adressefeil) throw adressefeil;
    return { id };
  } catch (e) {
    await slettBilder(lastetOpp).catch(() => {});
    return { feil: feiltekst(e) };
  }
}

export async function slettAnnonse(a: Annonse): Promise<{ feil?: string }> {
  const { error } = await supabase.from('annonser').delete().eq('id', a.id);
  if (error) return { feil: feiltekst(error) };
  await slettBilder(a.bilder).catch(() => {});
  return {};
}

// ─── Adresse, aksept og status ───────────────────────────────

export type Adresse = { adresse: string; lat: number | null; lng: number | null };

// Gir adressen bare til eieren og hjelperen (databasen sier nei til alle andre).
export function useAdresse(annonseId: string | undefined, status: Annonsestatus | undefined, hjelperId: string | null | undefined) {
  const [adresse, setAdresse] = useState<Adresse | null>(null);
  useEffect(() => {
    if (!annonseId) return;
    let avbrutt = false;
    supabase
      .from('annonse_adresser')
      .select('adresse, lat, lng')
      .eq('annonse_id', annonseId)
      .maybeSingle()
      .then(({ data }) => {
        if (!avbrutt) setAdresse((data as Adresse | null) ?? null);
      });
    return () => {
      avbrutt = true;
    };
  }, [annonseId, status, hjelperId]);
  return adresse;
}

export async function hentAdresse(annonseId: string): Promise<Adresse | null> {
  const { data } = await supabase.from('annonse_adresser').select('adresse, lat, lng').eq('annonse_id', annonseId).maybeSingle();
  return (data as Adresse | null) ?? null;
}

// Google Maps med veibeskrivelse fra der du står nå.
export function kartlenke(a: Adresse | null, sted: string) {
  const mal =
    a?.lat != null && a?.lng != null ? `${a.lat},${a.lng}` : a?.adresse?.trim() ? a.adresse.trim() : sted.trim();
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(mal)}&travelmode=walking`;
}

// Google Maps med området (aldri den private adressen), for å se omtrent hvor det er.
export function omradelenke(sted: string) {
  const t = sted.trim();
  const sok = /,|norge|norway/i.test(t) ? t : `${t}, Norge`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(sok)}`;
}

async function kall(funksjon: string, args: Record<string, unknown>): Promise<{ feil?: string }> {
  const { error } = await supabase.rpc(funksjon, args);
  if (!error) return {};
  const m = error.message ?? '';
  if (m.includes('ikke ledig')) return { feil: 'Noen andre rakk å ta denne annonsen før deg.' };
  return { feil: feiltekst(error) };
}

export function aksepterAnnonse(id: string) {
  return kall('aksepter_annonse', { annonse: id });
}

// «Takk ja» / «Aksepter»: tar annonsen og sier hei i chatten, så de kan avtale resten.
export async function takkJa(a: Pick<Annonse, 'id' | 'type' | 'tittel' | 'profiler'>): Promise<{ feil?: string }> {
  const svar = await aksepterAnnonse(a.id);
  if (svar.feil) return svar;
  const navn = a.profiler?.navn?.trim().split(/\s+/)[0] || 'der';
  await sendMelding(
    a.id,
    a.type === 'hjelp'
      ? `Hei ${navn}! Jeg har takket ja til «${a.tittel}». Jeg gleder meg til å hjelpe deg.`
      : `Hei ${navn}! Jeg vil gjerne ha «${a.tittel}». Når kan jeg hente?`,
  ).catch(() => {});
  return {};
}

export function oppdaterOppdrag(id: string, status: 'pa_vei' | 'ferdig' | 'akseptert') {
  return kall('oppdater_oppdrag', { annonse: id, ny_status: status });
}

export function slippAnnonse(id: string) {
  return kall('slipp_annonse', { annonse: id });
}

export async function giTakk(id: string, vurdering: number, takk: string): Promise<{ feil?: string }> {
  const { error } = await supabase.from('annonser').update({ vurdering, takk: takk.trim() || null }).eq('id', id);
  return error ? { feil: feiltekst(error) } : {};
}

// ─── Chat ─────────────────────────────────────────────────────

export type Melding = { id: string; annonse_id: string; avsender_id: string; tekst: string; opprettet: string };

export function useMeldinger(annonseId: string | undefined) {
  const [meldinger, setMeldinger] = useState<Melding[]>([]);
  const [laster, setLaster] = useState(true);

  const oppdater = useCallback(async () => {
    if (!annonseId) return;
    const { data } = await supabase
      .from('meldinger')
      .select('id, annonse_id, avsender_id, tekst, opprettet')
      .eq('annonse_id', annonseId)
      .order('opprettet', { ascending: true })
      .limit(500);
    setMeldinger((data ?? []) as Melding[]);
    setLaster(false);
  }, [annonseId]);

  useFocusEffect(
    useCallback(() => {
      oppdater().catch(() => setLaster(false));
    }, [oppdater]),
  );

  useEffect(() => {
    if (!annonseId) return;
    const kanal = supabase
      .channel(`meldinger-${annonseId}-${Math.random().toString(36).slice(2)}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'meldinger', filter: `annonse_id=eq.${annonseId}` },
        (endring) => {
          const ny = endring.new as Melding;
          setMeldinger((m) => (m.some((x) => x.id === ny.id) ? m : [...m, ny]));
        },
      )
      .subscribe();
    // Reserve i tilfelle sanntid ikke virker på nettet der man er: hent nye hvert 8. sekund.
    const t = setInterval(() => oppdater().catch(() => {}), 8000);
    return () => {
      clearInterval(t);
      supabase.removeChannel(kanal);
    };
  }, [annonseId, oppdater]);

  const send = useCallback(
    async (tekst: string): Promise<{ feil?: string }> => {
      if (!annonseId || !tekst.trim()) return {};
      const { data, error } = await supabase
        .from('meldinger')
        .insert({ annonse_id: annonseId, tekst: tekst.trim() })
        .select('id, annonse_id, avsender_id, tekst, opprettet')
        .single();
      if (error) return { feil: feiltekst(error) };
      setMeldinger((m) => (m.some((x) => x.id === data.id) ? m : [...m, data as Melding]));
      return {};
    },
    [annonseId],
  );

  return { meldinger, laster, send, oppdater };
}

export async function sendMelding(annonseId: string, tekst: string) {
  await supabase.from('meldinger').insert({ annonse_id: annonseId, tekst });
}
