import { useFocusEffect, useIsFocused } from 'expo-router';
import { Children, useCallback, useRef, useState, type ReactNode } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import Animated, { useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { elementInn, hentRetning, skjermInn } from '../lib/overgang';
import { farger } from '../lib/tema';

type Props = {
  children: ReactNode;
  // Endres nøkkelen, spilles innkomst-animasjonen av på nytt (f.eks. neste steg).
  nokkel?: string;
};

// Felles ramme for alle skjermer: safe area øverst, rulling, og myk innkomst.
export function Skjerm({ children, nokkel = '' }: Props) {
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

  return (
    <ScrollView
      style={styles.rulling}
      contentContainerStyle={[styles.innhold, { paddingTop: innsett.top + 16 }]}
      keyboardShouldPersistTaps="handled"
    >
      <Animated.View key={`${besok}-${nokkel}`} entering={skjermInn(retning, redusertBevegelse)} style={styles.liste}>
        {Children.toArray(children).map((barn, i) => (
          <Animated.View key={i} entering={elementInn(i, redusertBevegelse)}>
            {barn}
          </Animated.View>
        ))}
      </Animated.View>
    </ScrollView>
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
});
