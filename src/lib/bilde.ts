import * as ImagePicker from 'expo-image-picker';

// Tar et bilde med kameraet, eller velger et fra bildene på telefonen.
// Gir tilbake en feilmelding på vanlig norsk hvis det ikke gikk.
export async function hentBilde(fraKamera: boolean): Promise<{ uri?: string; feil?: string }> {
  try {
    const tillatelse = fraKamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!tillatelse.granted) {
      return {
        feil: fraKamera
          ? 'Appen fikk ikke bruke kameraet. Du kan slå det på i innstillingene på telefonen.'
          : 'Appen fikk ikke se bildene dine. Du kan slå det på i innstillingene på telefonen.',
      };
    }
    const valg: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], quality: 0.6 };
    const resultat = fraKamera
      ? await ImagePicker.launchCameraAsync(valg)
      : await ImagePicker.launchImageLibraryAsync(valg);
    if (resultat.canceled) return {};
    return { uri: resultat.assets[0]?.uri };
  } catch {
    return { feil: 'Vi fikk ikke tatt bildet. Prøv igjen, eller skriv det i stedet.' };
  }
}
