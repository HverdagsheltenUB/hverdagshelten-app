import { StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeOut, Keyframe, useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useApp } from '../lib/app-tilstand';
import { animasjon, farger } from '../lib/tema';
import { Tekst } from './Tekst';

// Plass til bunnmenyen, så meldingen legger seg rett over den.
const menyhoyde = 84;

const glirOpp = new Keyframe({
  0: { opacity: 0, transform: [{ translateY: 24 }] },
  100: { opacity: 1, transform: [{ translateY: 0 }], easing: animasjon.easing },
}).duration(animasjon.skjerm);

export function Toast() {
  const { toast } = useApp();
  const innsett = useSafeAreaInsets();
  const redusertBevegelse = useReducedMotion();

  if (!toast) return null;

  return (
    <Animated.View
      key={toast.id}
      entering={redusertBevegelse ? FadeIn : glirOpp}
      exiting={FadeOut.duration(200)}
      pointerEvents="none"
      accessibilityLiveRegion="polite"
      style={[styles.toast, { bottom: innsett.bottom + menyhoyde + 12 }]}
    >
      <Tekst variant="brodLiten" vekt={600} farge={farger.hvit}>
        {toast.tekst}
      </Tekst>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: 16,
    right: 16,
    backgroundColor: farger.morkLilla,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
});
