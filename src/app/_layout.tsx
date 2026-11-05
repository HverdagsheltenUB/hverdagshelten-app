import {
  Figtree_400Regular,
  Figtree_600SemiBold,
  Figtree_700Bold,
  Figtree_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/figtree';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Image, StyleSheet, View } from 'react-native';

import { DialogProvider } from '../components/Dialog';
import { Toast } from '../components/Toast';
import { AppProvider, useApp } from '../lib/app-tilstand';
import { KontoProvider, useKonto } from '../lib/konto';
import { farger } from '../lib/tema';

export default function RootLayout() {
  const [lastet, feil] = useFonts({
    Figtree_400Regular,
    Figtree_600SemiBold,
    Figtree_700Bold,
    Figtree_800ExtraBold,
  });

  return (
    <AppProvider>
      <KontoProvider>
        <DialogProvider>{!lastet && !feil ? <Oppstartsbilde /> : <Innhold />}</DialogProvider>
      </KontoProvider>
    </AppProvider>
  );
}

function Innhold() {
  const { lastet } = useApp();
  const konto = useKonto();
  // Vent til det som er lagret på telefonen og innloggingen er hentet, så ingenting blinker.
  if (!lastet || konto.laster) return <Oppstartsbilde />;

  return (
    <>
      <StatusBar style="dark" />
      {/* Ingen toppfelt: skjermene tegner selv innholdet rett under statuslinjen.
          Overgangene lager vi med Reanimated i hver skjerm, så Stack skal ikke animere. */}
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'none',
          contentStyle: { backgroundColor: farger.krem },
        }}
      />
      <Toast />
    </>
  );
}

// Samme bilde som oppstartsskjermen, så overgangen blir rolig.
function Oppstartsbilde() {
  return (
    <View style={styles.oppstart} accessibilityLabel="Hverdagshelten laster">
      <StatusBar style="light" />
      <Image source={require('../../assets/splash-icon.png')} style={styles.logo} resizeMode="contain" />
      <ActivityIndicator color={farger.fersken} size="large" />
    </View>
  );
}

const styles = StyleSheet.create({
  oppstart: {
    flex: 1,
    backgroundColor: farger.logo,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  logo: {
    width: 220,
    height: 220,
  },
});
