import { createContext, useContext, useState, type ReactNode } from 'react';

export type Bestilling = {
  id: string;
  tjeneste: string;
  dag: string;
  melding: string;
  opprettet: Date;
};

type BestillingerVerdi = {
  bestillinger: Bestilling[];
  leggTil: (b: Omit<Bestilling, 'id' | 'opprettet'>) => void;
};

const BestillingerContext = createContext<BestillingerVerdi | null>(null);

// Foreløpig lagres bestillingene bare i minnet på telefonen.
// Senere flytter vi dette til Supabase, så hjelperne kan se dem.
export function BestillingerProvider({ children }: { children: ReactNode }) {
  const [bestillinger, setBestillinger] = useState<Bestilling[]>([]);

  function leggTil(b: Omit<Bestilling, 'id' | 'opprettet'>) {
    setBestillinger((gamle) => [
      { ...b, id: String(Date.now()), opprettet: new Date() },
      ...gamle,
    ]);
  }

  return (
    <BestillingerContext.Provider value={{ bestillinger, leggTil }}>
      {children}
    </BestillingerContext.Provider>
  );
}

export function useBestillinger() {
  const verdi = useContext(BestillingerContext);
  if (!verdi) throw new Error('useBestillinger må brukes inni BestillingerProvider');
  return verdi;
}
