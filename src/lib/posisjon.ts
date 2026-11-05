import * as Location from 'expo-location';

// Finner hvor telefonen er nå, og gjør det om til en vanlig adresse hvis det går.
export async function hentMinPosisjon(): Promise<{ adresse?: string; omrade?: string; lat?: number; lng?: number; feil?: string }> {
  try {
    const tillatelse = await Location.requestForegroundPermissionsAsync();
    if (!tillatelse.granted) {
      return { feil: 'Appen fikk ikke se hvor du er. Du kan slå det på i innstillingene på telefonen, eller skrive adressen selv.' };
    }
    const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
    const lat = Math.round(pos.coords.latitude * 1e6) / 1e6;
    const lng = Math.round(pos.coords.longitude * 1e6) / 1e6;
    try {
      const [sted] = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
      if (sted) {
        const gate = [sted.street, sted.streetNumber].filter(Boolean).join(' ');
        const by = [sted.postalCode, sted.city].filter(Boolean).join(' ');
        const adresse = [gate || sted.name, by].filter(Boolean).join(', ');
        return { adresse: adresse || undefined, omrade: sted.district || sted.subregion || sted.city || undefined, lat, lng };
      }
    } catch {
      // Adresseoppslag virker ikke overalt (f.eks. i nettleseren). Koordinatene holder for kartet.
    }
    return { lat, lng };
  } catch {
    return { feil: 'Vi fant ikke posisjonen din. Prøv igjen ute, eller skriv adressen selv.' };
  }
}
