import { ArrowLeft, ArrowRight, Star } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { farger, ikonStrek } from '../lib/tema';
import { Tekst } from './Tekst';

const pillefarger = {
  gronn: { bakgrunn: farger.gronnLys, tekst: farger.gronn },
  fersken: { bakgrunn: farger.fersken, tekst: farger.morkLilla },
  lilla: { bakgrunn: farger.lysLilla, tekst: farger.lilla },
};

export function Pille({ tekst, variant = 'fersken' }: { tekst: string; variant?: keyof typeof pillefarger }) {
  const f = pillefarger[variant];
  return (
    <View style={[styles.pille, { backgroundColor: f.bakgrunn }]}>
      <Tekst variant="pille" farge={f.tekst}>
        {tekst}
      </Tekst>
    </View>
  );
}

export function Avatar({ bokstav, storrelse = 44 }: { bokstav: string; storrelse?: number }) {
  return (
    <View style={[styles.avatar, { width: storrelse, height: storrelse }]}>
      <Tekst vekt={800} farge={farger.hvit} style={{ fontSize: storrelse * 0.42, lineHeight: storrelse * 0.55 }}>
        {bokstav}
      </Tekst>
    </View>
  );
}

export function Stjerner({ antall = 5 }: { antall?: number }) {
  return (
    <View style={styles.rad} accessibilityLabel={`${antall} av 5 stjerner`}>
      {Array.from({ length: antall }, (_, i) => (
        <Star key={i} size={18} color={farger.stjerne} fill={farger.stjerne} strokeWidth={ikonStrek} />
      ))}
    </View>
  );
}

export function Tilbakelenke({ tekst, onPress }: { tekst: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="link" onPress={onPress} hitSlop={12} style={[styles.rad, styles.tilbake]}>
      <ArrowLeft size={20} color={farger.lilla} strokeWidth={ikonStrek} />
      <Tekst variant="brodLiten" vekt={700} farge={farger.lilla}>
        {tekst}
      </Tekst>
    </Pressable>
  );
}

// Myk boks med et tall, f.eks. «Tjent i oktober». Legges to og to side om side.
export function Statboks({ etikett, verdi, stjerne = false }: { etikett: string; verdi: string; stjerne?: boolean }) {
  return (
    <View style={styles.statboks}>
      <Tekst variant="underLiten" vekt={600}>
        {etikett}
      </Tekst>
      <View style={[styles.rad, styles.statverdi]}>
        <Tekst variant="stor">{verdi}</Tekst>
        {stjerne && <Star size={22} color={farger.stjerne} fill={farger.stjerne} strokeWidth={ikonStrek} />}
      </View>
    </View>
  );
}

export function Statrad({ children }: { children: ReactNode }) {
  return <View style={styles.statrad}>{children}</View>;
}

// Raden nederst i et kort, f.eks. «Se avtalen →».
export function Lenkerad({ tekst, onPress }: { tekst: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="link" onPress={onPress} hitSlop={8} style={[styles.rad, styles.lenkerad]}>
      <Tekst variant="brod" vekt={700} farge={farger.lilla}>
        {tekst}
      </Tekst>
      <ArrowRight size={20} color={farger.lilla} strokeWidth={ikonStrek} />
    </Pressable>
  );
}

export function Overskrift({ tittel, undertekst }: { tittel: string; undertekst?: string }) {
  return (
    <View style={styles.overskrift}>
      <Tekst variant="tittel" accessibilityRole="header">
        {tittel}
      </Tekst>
      {undertekst && <Tekst variant="under">{undertekst}</Tekst>}
    </View>
  );
}

export function Seksjon({ tittel, hoyre }: { tittel: string; hoyre?: ReactNode }) {
  return (
    <View style={[styles.rad, styles.seksjon]}>
      <Tekst variant="mellomtittel" accessibilityRole="header">
        {tittel}
      </Tekst>
      {hoyre}
    </View>
  );
}

const styles = StyleSheet.create({
  pille: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  avatar: {
    borderRadius: 999,
    backgroundColor: farger.lilla,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rad: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  tilbake: {
    gap: 6,
    alignSelf: 'flex-start',
  },
  statboks: {
    flex: 1,
    backgroundColor: farger.ferskenLys,
    borderRadius: 18,
    padding: 16,
    gap: 4,
  },
  statverdi: {
    gap: 6,
  },
  statrad: {
    flexDirection: 'row',
    gap: 12,
  },
  lenkerad: {
    justifyContent: 'space-between',
  },
  overskrift: {
    gap: 4,
    marginBottom: 4,
  },
  seksjon: {
    justifyContent: 'space-between',
    marginTop: 8,
  },
});
