import type { Session } from '@supabase/supabase-js';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { useApp, type Rolle } from './app-tilstand';
import { feiltekst, supabase } from './supabase';

export type Profil = {
  id: string;
  navn: string;
  rolle: Rolle | null;
  omrade: string;
  opprettet: string;
  bilde: string | null;
};

type Svar = { feil?: string };

type Konto = {
  // true til vi vet om noen er logget inn fra før.
  laster: boolean;
  session: Session | null;
  epost: string | null;
  profil: Profil | null;
  opprettBruker: (v: { epost: string; passord: string; navn: string; rolle: Rolle }) => Promise<Svar>;
  loggInn: (epost: string, passord: string) => Promise<Svar>;
  loggUt: () => Promise<void>;
  endreProfil: (endring: Partial<Pick<Profil, 'navn' | 'rolle' | 'omrade' | 'bilde'>>) => Promise<Svar>;
  slettKonto: () => Promise<Svar>;
  byttProfilbilde: (uri: string) => Promise<Svar>;
};

const KontoContext = createContext<Konto | null>(null);

export function KontoProvider({ children }: { children: ReactNode }) {
  const { endre } = useApp();
  const [laster, setLaster] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [hentetProfil, setProfil] = useState<Profil | null>(null);
  const brukerId = session?.user.id;
  // Profilen til en som har logget ut, skal aldri vises.
  const profil = hentetProfil && hentetProfil.id === brukerId ? hentetProfil : null;

  useEffect(() => {
    let avbrutt = false;
    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!avbrutt) setSession(data.session);
      })
      .catch(() => {})
      .finally(() => {
        if (!avbrutt) setLaster(false);
      });
    const { data } = supabase.auth.onAuthStateChange((_hendelse, ny) => setSession(ny));
    return () => {
      avbrutt = true;
      data.subscription.unsubscribe();
    };
  }, []);

  const hentProfil = useCallback(
    async (id: string) => {
      const { data } = await supabase.from('profiler').select('id, navn, rolle, omrade, opprettet, bilde').eq('id', id).maybeSingle();
      if (data) {
        setProfil(data as Profil);
        // Rollen bestemmer om man ser eldre- eller ungdomsversjonen.
        if (data.rolle) endre((d) => ({ ...d, rolle: data.rolle as Rolle, innlogget: true }));
      }
      return data as Profil | null;
    },
    [endre],
  );

  useEffect(() => {
    if (!brukerId) return;
    // Hentes når appen åpnes med en lagret innlogging.
    const t = setTimeout(() => hentProfil(brukerId).catch(() => {}), 0);
    return () => clearTimeout(t);
  }, [brukerId, hentProfil]);

  const verdi = useMemo<Konto>(
    () => ({
      laster,
      session,
      epost: session?.user.email ?? null,
      profil,
      opprettBruker: async ({ epost, passord, navn, rolle }) => {
        try {
          const { data, error } = await supabase.auth.signUp({
            email: epost.trim(),
            password: passord,
            options: { data: { navn: navn.trim(), rolle } },
          });
          if (error) return { feil: feiltekst(error) };
          if (!data.session) {
            return {
              feil: 'Brukeren er laget, men e-posten må bekreftes før du kan logge inn. Sjekk innboksen din.',
            };
          }
          endre((d) => ({ ...d, rolle, innlogget: true }));
          await hentProfil(data.session.user.id);
          return {};
        } catch (e) {
          return { feil: feiltekst(e) };
        }
      },
      loggInn: async (epost, passord) => {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({ email: epost.trim(), password: passord });
          if (error) return { feil: feiltekst(error) };
          await hentProfil(data.user.id);
          endre((d) => ({ ...d, innlogget: true }));
          return {};
        } catch (e) {
          return { feil: feiltekst(e) };
        }
      },
      loggUt: async () => {
        await supabase.auth.signOut().catch(() => {});
        setProfil(null);
        endre((d) => ({ ...d, innlogget: false }));
      },
      endreProfil: async (endring) => {
        if (!brukerId) return { feil: 'Du er ikke logget inn.' };
        const { data, error } = await supabase
          .from('profiler')
          .update(endring)
          .eq('id', brukerId)
          .select('id, navn, rolle, omrade, opprettet, bilde')
          .single();
        if (error) return { feil: feiltekst(error) };
        setProfil(data as Profil);
        if (endring.rolle) endre((d) => ({ ...d, rolle: endring.rolle as Rolle }));
        return {};
      },
      byttProfilbilde: async (uri) => {
        if (!brukerId) return { feil: 'Du er ikke logget inn.' };
        try {
          const svar = await fetch(uri);
          const innhold = await svar.arrayBuffer();
          const type = svar.headers.get('content-type') || 'image/jpeg';
          const sti = `${brukerId}/profil-${Date.now().toString(36)}.${type.includes('png') ? 'png' : 'jpg'}`;
          const { error } = await supabase.storage
            .from('annonsebilder')
            .upload(sti, innhold, { contentType: type.startsWith('image/') ? type : 'image/jpeg' });
          if (error) return { feil: feiltekst(error) };
          const adresse = supabase.storage.from('annonsebilder').getPublicUrl(sti).data.publicUrl;
          const gammel = profil?.bilde;
          const { data, error: feil } = await supabase
            .from('profiler')
            .update({ bilde: adresse })
            .eq('id', brukerId)
            .select('id, navn, rolle, omrade, opprettet, bilde')
            .single();
          if (feil) return { feil: feiltekst(feil) };
          setProfil(data as Profil);
          // Fjern det gamle bildet.
          const merke = '/object/public/annonsebilder/';
          if (gammel && gammel.includes(merke)) {
            await supabase.storage.from('annonsebilder').remove([gammel.slice(gammel.indexOf(merke) + merke.length)]);
          }
          return {};
        } catch (e) {
          return { feil: feiltekst(e) };
        }
      },
      slettKonto: async () => {
        if (!brukerId) return { feil: 'Du er ikke logget inn.' };
        // Bildene må slettes først, fordi databasen ikke kan slette filer selv.
        const { data: filer } = await supabase.storage.from('annonsebilder').list(brukerId, { limit: 1000 });
        if (filer && filer.length > 0) {
          await supabase.storage.from('annonsebilder').remove(filer.map((f) => `${brukerId}/${f.name}`));
        }
        const { error } = await supabase.rpc('slett_min_konto');
        if (error) return { feil: feiltekst(error) };
        await supabase.auth.signOut().catch(() => {});
        setProfil(null);
        return {};
      },
    }),
    [laster, session, profil, brukerId, endre, hentProfil],
  );

  return <KontoContext.Provider value={verdi}>{children}</KontoContext.Provider>;
}

export function useKonto() {
  const verdi = useContext(KontoContext);
  if (!verdi) throw new Error('useKonto må brukes inni KontoProvider');
  return verdi;
}

// Fornavnet, til «Hei, Tone.»
export function fornavn(navn: string | undefined | null) {
  return (navn ?? '').trim().split(/\s+/)[0] || '';
}
