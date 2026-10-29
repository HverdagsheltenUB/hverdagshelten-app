import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';

import { emil, oppdrag } from './eksempeldata';
import { animasjon } from './tema';

export type Rolle = 'eldre' | 'ungdom';

export type Bestilling = {
  id: string;
  kategori: string;
  dag: string;
  tid: string;
};

export type Toast = { id: number; tekst: string };

type AppTilstand = {
  rolle: Rolle | null;
  velgRolle: (rolle: Rolle) => void;
  storreTekst: boolean;
  settStorreTekst: (pa: boolean) => void;
  paminnelse: boolean;
  settPaminnelse: (pa: boolean) => void;
  varselNyeOppdrag: boolean;
  settVarselNyeOppdrag: (pa: boolean) => void;
  likerAHjelpeMed: string[];
  byttHjelpeomrade: (navn: string) => void;
  bestillinger: Bestilling[];
  sendBestilling: (b: Omit<Bestilling, 'id'>) => void;
  tatteOppdrag: string[];
  taOppdrag: (id: string) => void;
  tjentIOktober: number;
  toast: Toast | null;
  visToast: (tekst: string) => void;
};

const AppContext = createContext<AppTilstand | null>(null);

// Foreløpig ligger alt bare i minnet på telefonen.
// Senere flytter vi dette til en backend, så hjelperne kan se bestillingene.
export function AppProvider({ children }: { children: ReactNode }) {
  const [rolle, setRolle] = useState<Rolle | null>(null);
  const [storreTekst, settStorreTekst] = useState(false);
  const [paminnelse, settPaminnelse] = useState(true);
  const [varselNyeOppdrag, settVarselNyeOppdrag] = useState(true);
  const [likerAHjelpeMed, setLiker] = useState(['Tur sammen', 'Mobilhjelp', 'Lufte hunden']);
  const [bestillinger, setBestillinger] = useState<Bestilling[]>([]);
  const [tatteOppdrag, setTatteOppdrag] = useState<string[]>([]);
  const [toast, setToast] = useState<Toast | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const visToast = useCallback((tekst: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ id: Date.now(), tekst });
    toastTimer.current = setTimeout(() => setToast(null), animasjon.toast);
  }, []);

  const verdi = useMemo<AppTilstand>(() => {
    const tjentIOktober =
      emil.tjentIOktober +
      tatteOppdrag.reduce((sum, id) => sum + (oppdrag.find((o) => o.id === id)?.belop ?? 0), 0);

    return {
      rolle,
      velgRolle: setRolle,
      storreTekst,
      settStorreTekst,
      paminnelse,
      settPaminnelse,
      varselNyeOppdrag,
      settVarselNyeOppdrag,
      likerAHjelpeMed,
      byttHjelpeomrade: (navn) =>
        setLiker((gamle) => (gamle.includes(navn) ? gamle.filter((n) => n !== navn) : [...gamle, navn])),
      bestillinger,
      sendBestilling: (b) => setBestillinger((gamle) => [...gamle, { ...b, id: String(Date.now()) }]),
      tatteOppdrag,
      taOppdrag: (id) => setTatteOppdrag((gamle) => (gamle.includes(id) ? gamle : [...gamle, id])),
      tjentIOktober,
      toast,
      visToast,
    };
  }, [rolle, storreTekst, paminnelse, varselNyeOppdrag, likerAHjelpeMed, bestillinger, tatteOppdrag, toast, visToast]);

  return <AppContext.Provider value={verdi}>{children}</AppContext.Provider>;
}

export function useApp() {
  const verdi = useContext(AppContext);
  if (!verdi) throw new Error('useApp må brukes inni AppProvider');
  return verdi;
}
