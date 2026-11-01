import type { LucideIcon } from 'lucide-react-native';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { farger, ikonStrek } from '../lib/tema';
import { Tekst } from './Tekst';
import { Trykkbar } from './Trykkbar';

type Props = {
  tekst: string;
  onPress: () => void;
  ikon?: LucideIcon;
  variant?: 'hoved' | 'sekundar' | 'gronn';
  liten?: boolean;
  // Ikonet havner etter teksten, f.eks. en pil i «Neste».
  ikonEtter?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Knapp({ tekst, onPress, ikon: Ikon, variant = 'hoved', liten = false, ikonEtter = false, style }: Props) {
  const tekstfarge = variant === 'sekundar' ? farger.morkLilla : farger.hvit;

  return (
    <Trykkbar
      accessibilityLabel={tekst}
      onPress={onPress}
      style={[styles.knapp, styles[variant], liten && styles.liten, style]}
    >
      {Ikon && !ikonEtter && <Ikon size={liten ? 18 : 22} color={tekstfarge} strokeWidth={ikonStrek} />}
      <Tekst variant={liten ? 'brodLiten' : 'knapp'} vekt={700} farge={tekstfarge}>
        {tekst}
      </Tekst>
      {Ikon && ikonEtter && <Ikon size={22} color={tekstfarge} strokeWidth={ikonStrek} />}
    </Trykkbar>
  );
}

const styles = StyleSheet.create({
  knapp: {
    minHeight: 60,
    borderRadius: 999,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  liten: {
    minHeight: 46,
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
});
