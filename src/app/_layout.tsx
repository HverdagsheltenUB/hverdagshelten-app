import {
  AtkinsonHyperlegible_400Regular,
  AtkinsonHyperlegible_700Bold,
  useFonts,
} from '@expo-google-fonts/atkinson-hyperlegible';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { BestillingerProvider } from '../lib/bestillinger';
import { farger, skrift } from '../lib/tema';

export default function RootLayout() {
  const [lastet] = useFonts({ AtkinsonHyperlegible_400Regular, AtkinsonHyperlegible_700Bold });
  if (!lastet) return null;

  return (
    <BestillingerProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: farger.lilla },
          headerTintColor: farger.hvit,
          headerTitleStyle: { fontFamily: skrift.fet, fontSize: 22 },
          headerBackTitle: 'Tilbake',
          contentStyle: { backgroundColor: farger.krem },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'Hverdagshelten' }} />
        <Stack.Screen name="bestill" options={{ title: 'Bestill hjelp' }} />
        <Stack.Screen name="mine-bestillinger" options={{ title: 'Mine bestillinger' }} />
        <Stack.Screen name="kontakt" options={{ title: 'Kontakt oss' }} />
      </Stack>
    </BestillingerProvider>
  );
}
