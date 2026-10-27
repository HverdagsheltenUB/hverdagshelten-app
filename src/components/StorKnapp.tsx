import { Pressable, StyleSheet, Text } from 'react-native';

import { farger, skrift, storrelse } from '../lib/tema';

type Props = {
  tekst: string;
  ikon?: string;
  onPress: () => void;
  variant?: 'fylt' | 'lys';
  valgt?: boolean;
};

export function StorKnapp({ tekst, ikon, onPress, variant = 'fylt', valgt = false }: Props) {
  const lys = variant === 'lys' && !valgt;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={tekst}
      accessibilityState={{ selected: valgt }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.knapp,
        lys ? styles.lys : styles.fylt,
        pressed && styles.trykket,
      ]}
    >
      <Text style={[styles.tekst, lys && styles.lysTekst]}>
        {ikon ? `${ikon}  ` : ''}
        {tekst}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  knapp: {
    minHeight: 80,
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 18,
    justifyContent: 'center',
    borderWidth: 3,
  },
  fylt: {
    backgroundColor: farger.lilla,
    borderColor: farger.lilla,
  },
  lys: {
    backgroundColor: farger.hvit,
    borderColor: farger.lavendel,
  },
  trykket: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  tekst: {
    color: farger.hvit,
    fontFamily: skrift.fet,
    fontSize: storrelse.knapp,
  },
  lysTekst: {
    color: farger.morkLilla,
  },
});
