import type { LucideIcon } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { farger, ikonStrek } from '../lib/tema';
import { Tekst } from './Tekst';
import { Trykkbar } from './Trykkbar';

type Props = {
  children: ReactNode;
  myk?: boolean;
  onPress?: () => void;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
};

// Kort kan trykkes på hvis de får onPress, ellers er de bare en boks.
export function Kort({ children, myk = false, onPress, accessibilityLabel, style }: Props) {
  const stil = [styles.kort, myk && styles.myk, style];
  if (onPress) {
    return (
      <Trykkbar onPress={onPress} accessibilityLabel={accessibilityLabel} style={stil}>
        {children}
      </Trykkbar>
    );
  }
  return <View style={stil}>{children}</View>;
}

export function Skillelinje() {
  return <View style={styles.linje} />;
}

export function Ikonboks({ ikon: Ikon, tall }: { ikon?: LucideIcon; tall?: number }) {
  return (
    <View style={styles.ikonboks}>
      {Ikon ? (
        <Ikon size={24} color={farger.morkLilla} strokeWidth={ikonStrek} />
      ) : (
        <Tekst variant="mellomtittel" vekt={800} farge={farger.morkLilla}>
          {tall}
        </Tekst>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  kort: {
    backgroundColor: farger.kort,
    borderWidth: 1.5,
    borderColor: farger.linje,
    borderRadius: 18,
    padding: 16,
    gap: 12,
  },
  myk: {
    backgroundColor: farger.ferskenLys,
    borderColor: farger.ferskenLys,
  },
  linje: {
    height: 1.5,
    backgroundColor: farger.linje,
  },
  ikonboks: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: farger.fersken,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
