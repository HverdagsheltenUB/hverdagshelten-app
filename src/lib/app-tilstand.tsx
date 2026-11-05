import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { animasjon } from './tema';

export type Rolle = 'eldre' | 'ungdom';

export type Toast = { id: number; tekst: string };

export type Melding = { id: string; fra: 'meg' | 'team' | 'automatisk'; tekst: string; tid: number };

export type Rapport = { id: string; rolle: Rolle; tekst: string; tid: number };

// Innstillinger som bare gjelder denne telefonen. Kontoen, profilen og annonsene
// ligger i Supabase, så de er de samme uansett hvilken telefon man logger inn på.
export type Data = {
  versjon: 3;
  rolle: Rolle | null;
  innlogget: boolean;
  vilkarGodtatt: boolean;
  omvisningSett: boolean;
  storreTekst: boolean;
  quizBestatt: boolean;
  meldinger: Melding[];
  rapporter: Rapport[];
};

function startData(): Data {
  return {
    versjon: 3,
    rolle: null,
    innlogget: false,
    vilkarGodtatt: false,
    omvisningSett: false,
    storreTekst: false,
    quizBestatt: false,
    meldinger: [],
    rapporter: [],
  };
}

const lagringsnokkel = 'hverdagshelten:data';

type AppTilstand = {
  lastet: boolean;
  data: Data;
  endre: (fn: (d: Data) => Data) => void;
  settStorreTekst: (pa: boolean) => void;
  sendMelding: (tekst: string, svar?: string) => void;
  rapporter: (tekst: string) => void;
  nullstill: () => void;
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
  const svartimere = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Hent det som er lagret på telefonen. Gamle testdata (versjon 2 med eksempelavtaler) kastes.
  useEffect(() => {
    let avbrutt = false;
    AsyncStorage.getItem(lagringsnokkel)
      .then((tekst) => {
        if (avbrutt || !tekst) return;
        const lagret = JSON.parse(tekst) as Data;
        if (lagret.versjon === 3) setData(lagret);
      })
      .catch(() => {})
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
    const liste = svartimere.current;
    return () => liste.forEach(clearTimeout);
  }, []);

  const visToast = useCallback((tekst: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ id: Date.now(), tekst });
    toastTimer.current = setTimeout(() => setToast(null), animasjon.toast + Math.min(tekst.length * 25, 2000));
  }, []);

  const endre = useCallback((fn: (d: Data) => Data) => setData(fn), []);

  const verdi = useMemo<AppTilstand>(
    () => ({
      lastet,
      data,
      endre,
      rolle: data.rolle,
      storreTekst: data.storreTekst,
      settStorreTekst: (pa) => setData((d) => ({ ...d, storreTekst: pa })),
      sendMelding: (tekst, svar) => {
        const meg: Melding = { id: nyId('m'), fra: 'meg', tekst, tid: Date.now() };
        setData((d) => ({ ...d, meldinger: [...d.meldinger, meg] }));
        if (svar) {
          svartimere.current.push(
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
      rapporter: (tekst) =>
        setData((d) => ({
          ...d,
          rapporter: [...d.rapporter, { id: nyId('r'), rolle: d.rolle ?? 'eldre', tekst, tid: Date.now() }],
        })),
      // Tømmer det som er lagret på telefonen (ved utlogging og sletting av kontoen).
      nullstill: () => {
        svartimere.current.forEach(clearTimeout);
        svartimere.current = [];
        setData((d) => ({ ...startData(), storreTekst: d.storreTekst }));
      },
      toast,
      visToast,
    }),
    [data, lastet, endre, toast, visToast],
  );

  return <AppContext.Provider value={verdi}>{children}</AppContext.Provider>;
}

export function useApp() {
  const verdi = useContext(AppContext);
  if (!verdi) throw new Error('useApp må brukes inni AppProvider');
  return verdi;
}
