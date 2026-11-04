import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { anne, finnHjelper, megUngdom, startOppdrag, type Oppdrag, type Person } from './eksempeldata';
import { prisFor, animasjon } from './tema';

export type Rolle = 'eldre' | 'ungdom';

export type Toast = { id: number; tekst: string };

export type Parorende = { id: string; navn: string; relasjon: string; telefon: string; faarBeskjed: boolean };

export type Melding = { id: string; fra: 'meg' | 'team' | 'automatisk'; tekst: string; tid: number };

export type Rapport = { id: string; oppdragId?: string; rolle: Rolle; tekst: string; tid: number; fulgtOpp: boolean };

// Alt som lagres på telefonen, så avtalene vises selv uten nett.
// Senere ligger dette i Supabase (i EU), og telefonen har bare en kopi.
export type Data = {
  versjon: 2;
  rolle: Rolle | null;
  innlogget: boolean;
  vilkarGodtatt: boolean;
  omvisningSett: boolean;
  storreTekst: boolean;
  varsler: { paminnelse: boolean; bekreftelse: boolean; nyeOppdrag: boolean; sms: boolean };
  eldre: Person & { tingAVite: string[]; annetAVite: string };
  parorende: Parorende[];
  ungdom: {
    alder: number;
    bankId: boolean;
    foresattGodkjent: boolean;
    foresatt: { navn: string; telefon: string };
    varselTilForesatt: boolean;
    grenser: { maksKm: number; sistKl: number };
    quizBestatt: boolean;
    likerAHjelpeMed: string[];
    tilgjengelig: string[];
    utbetalingTil: 'Vipps' | 'Konto';
  };
  oppdrag: Oppdrag[];
  meldinger: Melding[];
  rapporter: Rapport[];
  godkjenteHjelpere: string[];
};

function startData(): Data {
  return {
    versjon: 2,
    rolle: null,
    innlogget: false,
    vilkarGodtatt: false,
    omvisningSett: false,
    storreTekst: false,
    varsler: { paminnelse: true, bekreftelse: true, nyeOppdrag: true, sms: false },
    eldre: { ...anne, tingAVite: ['Går sakte'], annetAVite: '' },
    parorende: [{ id: 'lise', navn: 'Lise Hansen', relasjon: 'datter', telefon: '922 45 678', faarBeskjed: true }],
    ungdom: {
      alder: megUngdom.alder,
      bankId: false,
      foresattGodkjent: false,
      foresatt: { navn: 'Mari Berg', telefon: '934 11 220' },
      varselTilForesatt: true,
      grenser: { maksKm: 2, sistKl: 20 },
      quizBestatt: false,
      likerAHjelpeMed: ['Tur sammen', 'Mobilhjelp', 'Lufte hunden'],
      tilgjengelig: ['Ettermiddag', 'Lørdag', 'Søndag'],
      utbetalingTil: 'Vipps',
    },
    oppdrag: startOppdrag(),
    meldinger: [],
    rapporter: [],
    godkjenteHjelpere: [],
  };
}

const lagringsnokkel = 'hverdagshelten:data';

export type NyBestilling = Omit<Oppdrag, 'id' | 'status' | 'opprettet' | 'avstandKm' | 'bestiltAvMeg'>;

type AppTilstand = {
  lastet: boolean;
  data: Data;
  endre: (fn: (d: Data) => Data) => void;
  velgRolle: (rolle: Rolle) => void;
  settStorreTekst: (pa: boolean) => void;
  sendBestilling: (b: NyBestilling) => string;
  endreOppdrag: (id: string, endring: Partial<Oppdrag>) => void;
  taOppdrag: (id: string) => void;
  tjentDenneManeden: number;
  sendMelding: (tekst: string, svar?: string) => void;
  rapporter: (tekst: string, oppdragId?: string) => void;
  slettAlt: () => void;
  toast: Toast | null;
  visToast: (tekst: string) => void;
  // Kortnavn som mange skjermer bruker.
  rolle: Rolle | null;
  storreTekst: boolean;
};

const AppContext = createContext<AppTilstand | null>(null);

let teller = 0;
export function nyId(prefiks: string) {
  teller += 1;
  return `${prefiks}-${Date.now().toString(36)}-${teller}`;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Data>(startData);
  const [lastet, setLastet] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const simuleringer = useRef<ReturnType<typeof setTimeout>[]>([]);
  const dataRef = useRef(data);
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  // Hent det som er lagret på telefonen.
  useEffect(() => {
    let avbrutt = false;
    AsyncStorage.getItem(lagringsnokkel)
      .then((tekst) => {
        if (avbrutt || !tekst) return;
        const lagret = JSON.parse(tekst) as Data;
        if (lagret.versjon === 2) setData(lagret);
      })
      .catch(() => {
        // Klarer vi ikke å lese, starter vi bare med eksempeldata.
      })
      .finally(() => {
        if (!avbrutt) setLastet(true);
      });
    return () => {
      avbrutt = true;
    };
  }, []);

  // Lagre etter hver endring (litt forsinket, så vi ikke skriver for ofte).
  useEffect(() => {
    if (!lastet) return;
    const t = setTimeout(() => {
      AsyncStorage.setItem(lagringsnokkel, JSON.stringify(data)).catch(() => {});
    }, 300);
    return () => clearTimeout(t);
  }, [data, lastet]);

  useEffect(() => {
    const liste = simuleringer.current;
    return () => liste.forEach(clearTimeout);
  }, []);

  const visToast = useCallback((tekst: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ id: Date.now(), tekst });
    toastTimer.current = setTimeout(() => setToast(null), animasjon.toast + Math.min(tekst.length * 25, 2000));
  }, []);

  const endre = useCallback((fn: (d: Data) => Data) => setData(fn), []);

  const endreOppdrag = useCallback(
    (id: string, endring: Partial<Oppdrag>) =>
      setData((d) => ({ ...d, oppdrag: d.oppdrag.map((o) => (o.id === id ? { ...o, ...endring } : o)) })),
    [],
  );

  const verdi = useMemo<AppTilstand>(() => {
    const na = new Date();
    const tjentDenneManeden = data.oppdrag
      .filter((o) => o.hjelperId === megUngdom.id && o.status === 'ferdig')
      .filter((o) => {
        const [a, m] = o.dato.split('-').map(Number);
        return a === na.getFullYear() && m === na.getMonth() + 1;
      })
      .reduce((sum, o) => sum + prisFor(o.varighet).hjelp, 0);

    return {
      lastet,
      data,
      endre,
      rolle: data.rolle,
      storreTekst: data.storreTekst,
      velgRolle: (rolle) => setData((d) => ({ ...d, rolle })),
      settStorreTekst: (pa) => setData((d) => ({ ...d, storreTekst: pa })),
      sendBestilling: (b) => {
        const id = nyId('bestilling');
        const nytt: Oppdrag = {
          ...b,
          id,
          status: 'sendt',
          opprettet: Date.now(),
          avstandKm: b.mottaker.omrade === anne.omrade ? 1.4 : 2.4,
          bestiltAvMeg: true,
        };
        setData((d) => ({ ...d, oppdrag: [...d.oppdrag, nytt] }));
        // I testversjonen later vi som om en hjelper sier ja etter noen sekunder,
        // så man kan se hvordan det ser ut. Ønsket hjelper får det først.
        const hjelperId = b.onsketHjelperId ?? 'sara';
        simuleringer.current.push(
          setTimeout(() => {
            const o = dataRef.current.oppdrag.find((x) => x.id === id);
            if (!o || o.status !== 'sendt' || o.hjelperId) return;
            endreOppdrag(id, { status: 'bekreftet', hjelperId });
            if (dataRef.current.rolle === 'eldre') {
              visToast(`${finnHjelper(hjelperId)?.fornavn ?? 'En hjelper'} har sagt ja til å hjelpe deg!`);
            }
          }, 9000),
        );
        return id;
      },
      endreOppdrag,
      taOppdrag: (id) => endreOppdrag(id, { status: 'bekreftet', hjelperId: megUngdom.id }),
      tjentDenneManeden,
      sendMelding: (tekst, svar) => {
        const meg: Melding = { id: nyId('m'), fra: 'meg', tekst, tid: Date.now() };
        setData((d) => ({ ...d, meldinger: [...d.meldinger, meg] }));
        if (svar) {
          simuleringer.current.push(
            setTimeout(() => {
              const fra = svar.startsWith('team:') ? 'team' : 'automatisk';
              const svartekst = svar.replace(/^team:/, '');
              setData((d) => ({
                ...d,
                meldinger: [...d.meldinger, { id: nyId('m'), fra, tekst: svartekst, tid: Date.now() }],
              }));
            }, 900),
          );
        }
      },
      rapporter: (tekst, oppdragId) =>
        setData((d) => ({
          ...d,
          rapporter: [
            ...d.rapporter,
            { id: nyId('r'), oppdragId, rolle: d.rolle ?? 'eldre', tekst, tid: Date.now(), fulgtOpp: false },
          ],
        })),
      slettAlt: () => {
        simuleringer.current.forEach(clearTimeout);
        simuleringer.current = [];
        setData(startData());
        AsyncStorage.removeItem(lagringsnokkel).catch(() => {});
      },
      toast,
      visToast,
    };
  }, [data, lastet, endre, endreOppdrag, toast, visToast]);

  return <AppContext.Provider value={verdi}>{children}</AppContext.Provider>;
}

export function useApp() {
  const verdi = useContext(AppContext);
  if (!verdi) throw new Error('useApp må brukes inni AppProvider');
  return verdi;
}
