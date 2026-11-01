import {
  Figtree_400Regular,
  Figtree_600SemiBold,
  Figtree_700Bold,
  Figtree_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/figtree';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { Toast } from '../components/Toast';
import { AppProvider } from '../lib/app-tilstand';
import { farger } from '../lib/tema';

export default function RootLayout() {
  const [lastet, feil] = useFonts({
    Figtree_400Regular,
    Figtree_600SemiBold,
    Figtree_700Bold,
    Figtree_800ExtraBold,
  });
  if (!lastet && !feil) return null;

  return (
    <AppProvider>
      <StatusBar style="dark" />
      {/* Ingen toppfelt: skjermene tegner selv innholdet rett under statuslinjen.
          Overgangene lager vi med Reanimated i hver skjerm, så Stack skal ikke animere. */}
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'none',
          contentStyle: { backgroundColor: farger.krem },
        }}
      >
        <Stack.Screen name="(faner)" />
        <Stack.Screen name="velg-rolle" />
        <Stack.Screen name="bestill" />
        <Stack.Screen name="oppdrag/[id]" />
      </Stack>
      <Toast />
    </AppProvider>
  );
}
