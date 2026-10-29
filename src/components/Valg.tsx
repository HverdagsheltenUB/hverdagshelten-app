import { useEffect, type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { farger, skrift, animasjon } from '../lib/tema';
import { Tekst, useTekststorrelse } from './Tekst';
import { Trykkbar } from './Trykkbar';

// Går mykt fra 0 til 1 når valgt skifter, så farger og knotter kan gli.
function useValgtFremdrift(valgt: boolean) {
  const fremdrift = useSharedValue(valgt ? 1 : 0);
  useEffect(() => {
    fremdrift.set(withTiming(valgt ? 1 : 0, { duration: animasjon.fargeskifte, easing: animasjon.easing }));
  }, [valgt, fremdrift]);
  return fremdrift;
}

type BryterProps = {
  etikett: string;
  pa: boolean;
  onEndre: (pa: boolean) => void;
};

export function BryterRad({ etikett, pa, onEndre }: BryterProps) {
  const fremdrift = useValgtFremdrift(pa);
  const sporStil = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(fremdrift.get(), [0, 1], [farger.linje, farger.lilla]),
  }));
  const knottStil = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(fremdrift.get(), [0, 1], [0, 22]) }],
  }));

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={etikett}
      accessibilityState={{ checked: pa }}
      onPress={() => onEndre(!pa)}
      style={styles.bryterRad}
    >
      <Tekst variant="listetittel" style={styles.flex}>
        {etikett}
      </Tekst>
      <Animated.View style={[styles.spor, sporStil]}>
        <Animated.View style={[styles.knott, knottStil]} />
      </Animated.View>
    </Pressable>
  );
}

type ChipProps = {
  tekst: string;
  valgt: boolean;
  onPress: () => void;
};

export function Chip({ tekst, valgt, onPress }: ChipProps) {
  const fremdrift = useValgtFremdrift(valgt);
  const fontSize = useTekststorrelse('brodLiten');
  const boksStil = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(fremdrift.get(), [0, 1], [farger.kort, farger.lilla]),
    borderColor: interpolateColor(fremdrift.get(), [0, 1], [farger.linje, farger.lilla]),
  }));
  const tekstStil = useAnimatedStyle(() => ({
    color: interpolateColor(fremdrift.get(), [0, 1], [farger.tekst, farger.hvit]),
  }));

  return (
    <Trykkbar
      accessibilityRole="radio"
      accessibilityState={{ selected: valgt, checked: valgt }}
      onPress={onPress}
      style={[styles.chip, boksStil]}
    >
      <Animated.Text style={[{ fontFamily: skrift[600], fontSize }, tekstStil]}>{tekst}</Animated.Text>
    </Trykkbar>
  );
}

export function Chiprad({ children }: { children: ReactNode }) {
  return <View style={styles.chiprad}>{children}</View>;
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  bryterRad: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 44,
  },
  spor: {
    width: 52,
    height: 30,
    borderRadius: 999,
    padding: 3,
  },
  knott: {
    width: 24,
    height: 24,
    borderRadius: 999,
    backgroundColor: farger.hvit,
  },
  chip: {
    borderRadius: 999,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  chiprad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
});
