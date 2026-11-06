import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';

import { supabaseKlar, supabaseNokkel, supabaseUrl } from './konfig';

// Én felles forbindelse til databasen. Innloggingen huskes på telefonen,
// så man slipper å logge inn hver gang appen åpnes.
export const supabase = createClient(
  supabaseKlar ? supabaseUrl : 'https://ikke-satt-opp.supabase.co',
  supabaseKlar ? supabaseNokkel : 'ikke-satt-opp',
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  },
);

// Fornyer innloggingen bare mens appen er åpen, slik Supabase anbefaler for mobil.
if (Platform.OS !== 'web') {
  AppState.addEventListener('change', (tilstand) => {
    if (tilstand === 'active') supabase.auth.startAutoRefresh();
    else supabase.auth.stopAutoRefresh();
  });
}

// Gjør tekniske feilmeldinger om til vanlig norsk.
export function feiltekst(feil: unknown): string {
  const melding = (feil as { message?: string } | null)?.message ?? String(feil ?? '');
  const m = melding.toLowerCase();
  if (m.includes('invalid login credentials')) return 'Feil e-post eller passord. Prøv igjen.';
  if (m.includes('already registered') || m.includes('already been registered'))
    return 'Det finnes allerede en bruker med denne e-posten. Prøv å logge inn i stedet.';
  if (m.includes('email not confirmed')) return 'Du må bekrefte e-posten din først. Sjekk innboksen.';
  if (m.includes('password should be') || m.includes('weak password'))
    return 'Passordet må ha minst 6 tegn.';
  if (m.includes('invalid email') || m.includes('unable to validate email') || m.includes('is invalid'))
    return 'E-postadressen ser ikke riktig ut.';
  if (m.includes('rate limit') || m.includes('too many'))
    return 'For mange forsøk på kort tid. Vent litt og prøv igjen.';
  if (m.includes('network') || m.includes('fetch') || m.includes('failed to'))
    return 'Fikk ikke kontakt med Hverdagshelten. Sjekk at du er på nett, og prøv igjen.';
  if (m.includes('row-level security') || m.includes('permission'))
    return 'Du har ikke lov til å gjøre dette.';
  return 'Noe gikk galt. Prøv igjen om litt.';
}
