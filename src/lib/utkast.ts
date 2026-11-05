import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Annonseutkast } from './annonser';

// Utkastet til en ny annonse lagres på telefonen mens man skriver,
// så ingenting går tapt om appen lukkes før man publiserer.
const nokkel = (brukerId: string) => `hverdagshelten:utkast:${brukerId}`;

export async function hentUtkast(brukerId: string): Promise<Annonseutkast | null> {
  try {
    const tekst = await AsyncStorage.getItem(nokkel(brukerId));
    return tekst ? (JSON.parse(tekst) as Annonseutkast) : null;
  } catch {
    return null;
  }
}

export async function lagreUtkast(brukerId: string, utkast: Annonseutkast) {
  await AsyncStorage.setItem(nokkel(brukerId), JSON.stringify(utkast)).catch(() => {});
}

export async function slettUtkast(brukerId: string) {
  await AsyncStorage.removeItem(nokkel(brukerId)).catch(() => {});
}

export function harInnhold(u: Annonseutkast) {
  return Boolean(u.tittel.trim() || u.beskrivelse.trim() || u.bilder.length > 0 || u.pris.trim());
}
