import { useMemo } from 'react';

import { useApp } from './app-tilstand';
import { erPassert, startTidspunkt } from './dato';
import { megUngdom, type Oppdrag, type Status } from './eksempeldata';
import { regler } from './tema';

function etterTid(a: Oppdrag, b: Oppdrag) {
  return startTidspunkt(a.dato, a.start) - startTidspunkt(b.dato, b.start);
}

const aktiv = (s: Status) => s === 'sendt' || s === 'bekreftet';

// Annes avtaler: det hun har bestilt, for seg selv eller andre.
export function useMineAvtaler() {
  const { data } = useApp();
  return useMemo(() => {
    const mine = data.oppdrag.filter((o) => o.bestiltAvMeg);
    return {
      kommende: mine.filter((o) => aktiv(o.status)).sort(etterTid),
      tidligere: mine.filter((o) => !aktiv(o.status)).sort((a, b) => etterTid(b, a)),
    };
  }, [data.oppdrag]);
}

// Oppdrag ingen har tatt ennå, innenfor grensene foresatte har satt.
export function useLedigeOppdrag() {
  const { data } = useApp();
  return useMemo(
    () =>
      data.oppdrag
        .filter((o) => o.status === 'sendt' && !o.hjelperId && !erPassert(o.dato, o.start))
        .filter((o) => o.avstandKm <= data.ungdom.grenser.maksKm)
        .filter((o) => o.start + o.varighet <= Math.min(data.ungdom.grenser.sistKl, regler.senestFerdigKl))
        .sort(etterTid),
    [data.oppdrag, data.ungdom.grenser],
  );
}

// Emils oppdrag.
export function useMineOppdrag() {
  const { data } = useApp();
  return useMemo(() => {
    const mine = data.oppdrag.filter((o) => o.hjelperId === megUngdom.id);
    return {
      kommende: mine.filter((o) => o.status === 'bekreftet').sort(etterTid),
      fullfort: mine.filter((o) => o.status === 'ferdig').sort((a, b) => etterTid(b, a)),
    };
  }, [data.oppdrag]);
}

export function useOppdrag(id: string | undefined) {
  const { data } = useApp();
  return data.oppdrag.find((o) => o.id === id);
}

export const statustekst: Record<Status, string> = {
  sendt: 'Sendt',
  bekreftet: 'Bekreftet',
  ferdig: 'Ferdig',
  avlyst: 'Avlyst',
};
