import { useApp } from './app-tilstand';
import { oppdrag } from './eksempeldata';

// Oppdragene Emil ikke har tatt ennå.
export function useLedigeOppdrag() {
  const { tatteOppdrag } = useApp();
  return oppdrag.filter((o) => !tatteOppdrag.includes(o.id));
}
