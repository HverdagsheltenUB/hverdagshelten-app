import { useFocusEffect, useIsFocused } from 'expo-router';
import { CircleHelp } from 'lucide-react-native';
import { Children, useCallback, useRef, useState, type ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { elementInn, gaFrem, gaTilbake, hentRetning, skjermInn } from '../lib/overgang';
import { farger, ikonStrek } from '../lib/tema';
import { Tilbakelenke } from './Smaabiter';
import { Tekst } from './Tekst';

type Props = {
  children: ReactNode;
  // Endres nøkkelen, spilles innkomst-animasjonen av på nytt (f.eks. neste steg).
  nokkel?: string;
  // Viser «← Tilbake» øverst. Uten onPress går den til forrige skjerm.
  tilbake?: { tekst?: string; onPress?: () => void };
  // «Hjelp»-knappen øverst til høyre, så det alltid er lett å kontakte oss.
  hjelp?: boolean;
  // Noe som skal ligge fast nederst, f.eks. et skrivefelt i chatten.
  bunn?: ReactNode;
};

// Felles ramme for alle skjermer: safe area øverst, rulling, og myk innkomst.
export function Skjerm({ children, nokkel = '', tilbake, hjelp = true, bunn }: Props) {
  const innsett = useSafeAreaInsets();
  const redusertBevegelse = useReducedMotion();
  const fokusert = useIsFocused();

  // Faner blir liggende i minnet. Når man kommer tilbake til en fane,
  // tegner vi innholdet på nytt så overgangen vises hver gang.
  const fokusertVedStart = useRef(fokusert);
  const [besok, setBesok] = useState(0);
  useFocusEffect(
    useCallback(() => {
      if (fokusertVedStart.current) {
        fokusertVedStart.current = false;
        return;
      }
      setBesok((b) => b + 1);
    }, []),
  );

  const retning = hentRetning();
  const visTopp = Boolean(tilbake) || hjelp;

  return (
    <KeyboardAvoidingView style={styles.rulling} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={styles.rulling}
        contentContainerStyle={[styles.innhold, { paddingTop: innsett.top + 12 }]}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View key={`${besok}-${nokkel}`} entering={skjermInn(retning, redusertBevegelse)} style={styles.liste}>
          {visTopp && (
            <View style={styles.topp}>
              {tilbake ? (
                <Tilbakelenke tekst={tilbake.tekst ?? 'Tilbake'} onPress={tilbake.onPress ?? (() => gaTilbake('/'))} />
              ) : (
                <View />
              )}
              {hjelp && <Hjelpknapp />}
            </View>
          )}
          {Children.toArray(children).map((barn, i) => (
            <Animated.View key={i} entering={elementInn(i, redusertBevegelse)}>
              {barn}
            </Animated.View>
          ))}
        </Animated.View>
      </ScrollView>
      {bunn && <View style={[styles.bunn, { paddingBottom: innsett.bottom + 12 }]}>{bunn}</View>}
    </KeyboardAvoidingView>
  );
}

function Hjelpknapp() {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Hjelp og kontakt"
      accessibilityHint="Åpner siden der du kan skrive til oss"
      onPress={() => gaFrem('/kontakt')}
      hitSlop={10}
      style={({ pressed }) => [styles.hjelp, pressed && styles.trykket]}
    >
      <CircleHelp size={20} color={farger.morkLilla} strokeWidth={ikonStrek} />
      <Tekst variant="brodLiten" vekt={700} farge={farger.morkLilla}>
        Hjelp
      </Tekst>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  rulling: {
    flex: 1,
    backgroundColor: farger.krem,
  },
  innhold: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  liste: {
    gap: 16,
  },
  topp: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
  },
  hjelp: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: farger.fersken,
    borderRadius: 999,
    paddingHorizontal: 14,
    minHeight: 44,
  },
  trykket: {
    opacity: 0.8,
  },
  bunn: {
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: farger.krem,
    borderTopWidth: 1.5,
    borderTopColor: farger.linje,
  },
});
