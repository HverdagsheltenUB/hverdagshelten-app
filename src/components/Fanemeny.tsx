import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { House, Megaphone, User, type LucideIcon } from 'lucide-react-native';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { interpolateColor, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { settRetning } from '../lib/overgang';
import { animasjon, farger, ikonStrek } from '../lib/tema';
import { Tekst } from './Tekst';
import { Trykkbar } from './Trykkbar';

const faner: Record<string, () => { tekst: string; ikon: LucideIcon }> = {
  index: () => ({ tekst: 'Hjem', ikon: House }),
  mine: () => ({ tekst: 'Mine annonser', ikon: Megaphone }),
  profil: () => ({ tekst: 'Profil', ikon: User }),
};

export function Fanemeny({ state, navigateToTab, insets }: BottomTabBarProps) {
  return (
    <View style={[styles.meny, { paddingBottom: insets.bottom + 10 }]} accessibilityRole="tablist">
      {state.routes.map((route, i) => {
        const fane = faner[route.name]?.();
        if (!fane) return null;
        return (
          <Fane
            key={route.key}
            {...fane}
            aktiv={state.index === i}
            onPress={() => {
              if (state.index === i) return;
              // Fane til høyre glir inn fra høyre, fane til venstre fra venstre.
              settRetning(i > state.index ? 'frem' : 'tilbake');
              navigateToTab(route.key);
            }}
          />
        );
      })}
    </View>
  );
}

type FaneProps = { tekst: string; ikon: LucideIcon; aktiv: boolean; onPress: () => void };

function Fane({ tekst, ikon: Ikon, aktiv, onPress }: FaneProps) {
  const fremdrift = useSharedValue(aktiv ? 1 : 0);
  useEffect(() => {
    fremdrift.set(withTiming(aktiv ? 1 : 0, { duration: animasjon.fargeskifte }));
  }, [aktiv, fremdrift]);
  const bakgrunn = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(fremdrift.get(), [0, 1], ['rgba(248,228,207,0)', farger.fersken]),
  }));
  const farge = aktiv ? farger.morkLilla : farger.hvit;

  return (
    <Trykkbar
      accessibilityRole="tab"
      accessibilityLabel={tekst}
      accessibilityState={{ selected: aktiv }}
      onPress={onPress}
      style={[styles.fane, bakgrunn]}
    >
      <Ikon size={26} color={farge} strokeWidth={ikonStrek} />
      <Tekst variant="fane" vekt={aktiv ? 700 : 600} farge={farge}>
        {tekst}
      </Tekst>
    </Trykkbar>
  );
}

const styles = StyleSheet.create({
  meny: {
    flexDirection: 'row',
    backgroundColor: farger.lilla,
    paddingTop: 10,
    paddingHorizontal: 10,
    gap: 6,
  },
  fane: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    paddingVertical: 10,
    minHeight: 60,
    justifyContent: 'center',
    borderRadius: 16,
  },
});
