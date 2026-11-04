import * as Linking from 'expo-linking';
import { Platform } from 'react-native';

// «Vis veien»: åpner Google Maps med adressen ferdig utfylt.
// Lenken åpner Google Maps-appen hvis den finnes, ellers Google Maps i nettleseren.
// Går ikke det, prøver vi Apple Kart på iPhone.
export async function visVeien(adresse: string): Promise<boolean> {
  const mal = encodeURIComponent(adresse);
  try {
    await Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${mal}&travelmode=walking`);
    return true;
  } catch {
    if (Platform.OS === 'ios') {
      try {
        await Linking.openURL(`https://maps.apple.com/?daddr=${mal}&dirflg=w`);
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }
}

export async function ring(telefon: string): Promise<boolean> {
  try {
    await Linking.openURL(`tel:${telefon.replace(/\s/g, '')}`);
    return true;
  } catch {
    return false;
  }
}
