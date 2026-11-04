import type { LucideIcon } from 'lucide-react-native';
import { ActivityIndicator, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { farger, ikonStrek } from '../lib/tema';
import { Tekst } from './Tekst';
import { Trykkbar } from './Trykkbar';

type Props = {
  tekst: string;
  onPress: () => void;
  ikon?: LucideIcon;
  variant?: 'hoved' | 'sekundar' | 'gronn' | 'rod';
  // Vises som laster, og kan ikke trykkes.
  laster?: boolean;
  deaktivert?: boolean;
  hint?: string;
  liten?: boolean;
  // Ikonet havner etter teksten, f.eks. en pil i «Neste».
  ikonEtter?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Knapp({
  tekst,
  onPress,
  ikon: Ikon,
  variant = 'hoved',
  liten = false,
  ikonEtter = false,
  laster = false,
  deaktivert = false,
  hint,
  style,
}: Props) {
  const tekstfarge = variant === 'sekundar' ? farger.morkLilla : farger.hvit;

  return (
    <Trykkbar
      accessibilityLabel={tekst}
      accessibilityHint={hint}
      accessibilityState={{ disabled: deaktivert || laster, busy: laster }}
      disabled={deaktivert || laster}
      onPress={onPress}
      style={[styles.knapp, styles[variant], liten && styles.liten, deaktivert && styles.deaktivert, style]}
    >
      {laster && <ActivityIndicator color={tekstfarge} />}
      {Ikon && !ikonEtter && !laster && <Ikon size={liten ? 18 : 22} color={tekstfarge} strokeWidth={ikonStrek} />}
      <Tekst variant={liten ? 'brodLiten' : 'knapp'} vekt={700} farge={tekstfarge}>
        {tekst}
      </Tekst>
      {Ikon && ikonEtter && <Ikon size={22} color={tekstfarge} strokeWidth={ikonStrek} />}
    </Trykkbar>
  );
}

const styles = StyleSheet.create({
  knapp: {
    minHeight: 64,
    borderRadius: 999,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  liten: {
    minHeight: 52,
    paddingHorizontal: 14,
    gap: 8,
    flex: 1,
  },
  hoved: {
    backgroundColor: farger.lilla,
  },
  sekundar: {
    backgroundColor: farger.kort,
    borderWidth: 1.5,
    borderColor: farger.linje,
  },
  gronn: {
    backgroundColor: farger.gronn,
  },
  rod: {
    backgroundColor: farger.rod,
  },
  deaktivert: {
    opacity: 0.45,
  },
});
